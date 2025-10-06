import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, QuestionWithOptionsPublic, SubmitQuiz } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function TakeQuiz() {
  const [, params] = useRoute("/quiz/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const quizId = params?.id;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<QuestionWithOptionsPublic[]>({
    queryKey: ["/api/quizzes", quizId, "questions"],
    enabled: !!quizId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: SubmitQuiz) => {
      const response = await apiRequest("POST", `/api/quizzes/${quizId}/submit`, data);
      return await response.json();
    },
    onSuccess: (result: { score: number; total: number }) => {
      navigate(`/results/${quizId}?score=${result.score}&total=${result.total}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!quizId) {
    navigate("/");
    return null;
  }

  const isLoading = isLoadingQuiz || isLoadingQuestions;
  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, optionId: string, checked: boolean) => {
    if (!currentQuestion) return;

    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      
      if (currentQuestion.type === "single_choice") {
        return { ...prev, [questionId]: [optionId] };
      } else {
        if (checked) {
          return { ...prev, [questionId]: [...currentAnswers, optionId] };
        } else {
          return { ...prev, [questionId]: currentAnswers.filter((id) => id !== optionId) };
        }
      }
    });
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;

    const submissionData: SubmitQuiz = {
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: q.type !== "text_based" ? (answers[q.id] || []) : undefined,
        textAnswer: q.type === "text_based" ? textAnswers[q.id] : undefined,
      })),
    };

    submitQuizMutation.mutate(submissionData);
  };

  const isLastQuestion = questions ? currentQuestionIndex === questions.length - 1 : false;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
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
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {quiz?.title}
              </h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions?.length}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progress} className="h-2" data-testid="progress-quiz" />
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <Card className="mb-8" data-testid={`card-question-${currentQuestionIndex}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-foreground">
                        {currentQuestion.text}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        {currentQuestion.type === "single_choice"
                          ? "Select one answer"
                          : currentQuestion.type === "multiple_choice"
                          ? "Select all that apply"
                          : "Text-based question"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentQuestion.type === "single_choice" ? (
                    <RadioGroup
                      value={currentAnswer[0] || ""}
                      onValueChange={(value) =>
                        handleAnswerChange(currentQuestion.id, value, true)
                      }
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-3 p-4 rounded-md border hover-elevate active-elevate-2 transition-all"
                            data-testid={`option-${option.id}`}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              data-testid={`radio-option-${option.id}`}
                            />
                            <Label
                              htmlFor={option.id}
                              className="flex-1 cursor-pointer text-base"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : currentQuestion.type === "multiple_choice" ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-4 rounded-md border hover-elevate active-elevate-2 transition-all"
                          data-testid={`option-${option.id}`}
                        >
                          <Checkbox
                            id={option.id}
                            checked={currentAnswer.includes(option.id)}
                            onCheckedChange={(checked) =>
                              handleAnswerChange(currentQuestion.id, option.id, checked as boolean)
                            }
                            data-testid={`checkbox-option-${option.id}`}
                          />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="text-answer">Your Answer</Label>
                      <Textarea
                        id="text-answer"
                        placeholder="Type your answer here..."
                        value={textAnswers[currentQuestion.id] || ""}
                        onChange={(e) =>
                          setTextAnswers({ ...textAnswers, [currentQuestion.id]: e.target.value })
                        }
                        maxLength={300}
                        className="min-h-32"
                        data-testid="textarea-text-answer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(textAnswers[currentQuestion.id] || "").length}/300 characters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
                data-testid="button-previous"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitQuizMutation.isPending}
                  className="gap-2"
                  data-testid="button-submit"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="gap-2"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
