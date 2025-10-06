import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { insertQuizSchema, createQuestionWithOptionsSchema, questionTypes } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const quizFormSchema = insertQuizSchema.extend({
  questions: z.array(createQuestionWithOptionsSchema).min(1, "At least one question is required"),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

type QuestionFormData = {
  text: string;
  type: typeof questionTypes[number];
  correctTextAnswer?: string;
  options?: { text: string; isCorrect: boolean }[];
};

export default function CreateQuiz() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);

  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      // First create the quiz
      const quizResponse = await apiRequest("POST", "/api/quizzes", { title: data.title });
      const quiz = await quizResponse.json();
      
      // Then add all questions
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        await apiRequest("POST", `/api/quizzes/${quiz.id}/questions`, {
          ...question,
          order: i,
        });
      }
      
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz created successfully!",
        description: "Your quiz is now available for others to take.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "single_choice",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const handleTypeChange = (index: number, newType: typeof questionTypes[number]) => {
    const newQuestions = [...questions];
    newQuestions[index].type = newType;
    
    if (newType === "text_based") {
      // For text-based questions, remove options and add correctTextAnswer
      newQuestions[index].correctTextAnswer = "";
      delete newQuestions[index].options;
    } else {
      // For choice questions, remove correctTextAnswer and add options
      delete newQuestions[index].correctTextAnswer;
      newQuestions[index].options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    }
    
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionFormData>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options!.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options!.filter(
        (_, i) => i !== optionIndex
      );
    }
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    updates: Partial<{ text: string; isCorrect: boolean }>
  ) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options && newQuestions[questionIndex].options![optionIndex]) {
      newQuestions[questionIndex].options![optionIndex] = {
        ...newQuestions[questionIndex].options![optionIndex],
        ...updates,
      };
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    try {
      const data = {
        title: quizTitle,
        questions: questions.map((q, i) => ({ ...q, order: i })),
      };
      
      quizFormSchema.parse(data);
      createQuizMutation.mutate(data as QuizFormData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Create New Quiz
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a title and questions to create an engaging quiz
          </p>
        </div>

        {/* Quiz Title */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Quiz Details</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                placeholder="Enter quiz title..."
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                data-testid="input-quiz-title"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button onClick={addQuestion} className="gap-2" data-testid="button-add-question">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No questions added yet. Click "Add Question" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, qIndex) => (
              <Card key={qIndex} data-testid={`card-question-${qIndex}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Question {qIndex + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="gap-2"
                    data-testid={`button-remove-question-${qIndex}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Type */}
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value: typeof questionTypes[number]) =>
                        handleTypeChange(qIndex, value)
                      }
                    >
                      <SelectTrigger data-testid={`select-question-type-${qIndex}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_choice">Single Choice</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="text_based">Text Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      placeholder="Enter your question..."
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      maxLength={300}
                      data-testid={`input-question-text-${qIndex}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {question.text.length}/300 characters
                    </p>
                  </div>

                  {/* Correct Answer for Text-Based Questions */}
                  {question.type === "text_based" && (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        placeholder="Enter the correct answer..."
                        value={question.correctTextAnswer || ""}
                        onChange={(e) => updateQuestion(qIndex, { correctTextAnswer: e.target.value })}
                        maxLength={300}
                        data-testid={`input-correct-answer-${qIndex}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {(question.correctTextAnswer || "").length}/300 characters
                      </p>
                    </div>
                  )}

                  {/* Options */}
                  {question.type !== "text_based" && question.options && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Answer Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                          className="gap-2"
                          data-testid={`button-add-option-${qIndex}`}
                        >
                          <Plus className="h-3 w-3" />
                          Add Option
                        </Button>
                      </div>

                      {question.options!.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-start gap-3">
                          {question.type === "single_choice" ? (
                            <RadioGroup
                              value={
                                question.options!.findIndex((o) => o.isCorrect)?.toString() || ""
                              }
                              onValueChange={(value) => {
                                const newOptions = question.options!.map((o, i) => ({
                                  ...o,
                                  isCorrect: i === parseInt(value),
                                }));
                                updateQuestion(qIndex, { options: newOptions });
                              }}
                            >
                              <RadioGroupItem
                                value={oIndex.toString()}
                                data-testid={`radio-correct-${qIndex}-${oIndex}`}
                              />
                            </RadioGroup>
                          ) : (
                            <Checkbox
                              checked={option.isCorrect}
                              onCheckedChange={(checked) =>
                                updateOption(qIndex, oIndex, { isCorrect: checked as boolean })
                              }
                              data-testid={`checkbox-correct-${qIndex}-${oIndex}`}
                            />
                          )}
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option.text}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, { text: e.target.value })
                            }
                            className="flex-1"
                            data-testid={`input-option-text-${qIndex}-${oIndex}`}
                          />
                          {question.options!.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(qIndex, oIndex)}
                              data-testid={`button-remove-option-${qIndex}-${oIndex}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        {question.type === "single_choice"
                          ? "Select one correct answer"
                          : "Select all correct answers"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={createQuizMutation.isPending || questions.length === 0 || !quizTitle}
            className="flex-1 sm:flex-none"
            size="lg"
            data-testid="button-submit-quiz"
          >
            {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
