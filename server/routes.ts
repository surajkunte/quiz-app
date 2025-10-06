import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuizSchema, 
  createQuestionWithOptionsSchema, 
  submitQuizSchema,
  type QuestionWithOptionsPublic,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/quizzes - Create a new quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      const validatedData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(validatedData);
      res.json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // GET /api/quizzes - Get all quizzes with question counts
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getAllQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // GET /api/quizzes/:id - Get a specific quiz
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // POST /api/quizzes/:id/questions - Add a question to a quiz
  app.post("/api/quizzes/:id/questions", async (req, res) => {
    try {
      const quizId = req.params.id;
      
      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Validate question data
      const validatedData = createQuestionWithOptionsSchema.parse(req.body);

      // Additional validation based on question type
      if (validatedData.type === "single_choice") {
        if (!validatedData.options || validatedData.options.length === 0) {
          return res.status(400).json({ message: "Single choice questions require options" });
        }
        const correctCount = validatedData.options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
          return res.status(400).json({ 
            message: "Single choice questions must have exactly one correct answer" 
          });
        }
      } else if (validatedData.type === "multiple_choice") {
        if (!validatedData.options || validatedData.options.length === 0) {
          return res.status(400).json({ message: "Multiple choice questions require options" });
        }
        const correctCount = validatedData.options.filter(o => o.isCorrect).length;
        if (correctCount < 1) {
          return res.status(400).json({ 
            message: "Multiple choice questions must have at least one correct answer" 
          });
        }
      } else if (validatedData.type === "text_based") {
        if (!validatedData.correctTextAnswer) {
          return res.status(400).json({ 
            message: "Text-based questions require a correct answer" 
          });
        }
        if (validatedData.correctTextAnswer.length > 300) {
          return res.status(400).json({ 
            message: "Text-based answers must be 300 characters or less" 
          });
        }
      }

      const question = await storage.createQuestionWithOptions(quizId, validatedData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // GET /api/quizzes/:id/questions - Get all questions for a quiz (without correct answers)
  app.get("/api/quizzes/:id/questions", async (req, res) => {
    try {
      const quizId = req.params.id;
      
      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const questions = await storage.getQuestionsByQuizId(quizId);
      
      // Remove isCorrect from options and correctTextAnswer from question for security
      const publicQuestions: QuestionWithOptionsPublic[] = questions.map((q) => {
        const { correctTextAnswer, ...questionWithoutAnswer } = q;
        return {
          ...questionWithoutAnswer,
          options: q.options.map(({ isCorrect, ...rest }) => rest),
        };
      });

      res.json(publicQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // POST /api/quizzes/:id/submit - Submit quiz answers and get score
  app.post("/api/quizzes/:id/submit", async (req, res) => {
    try {
      const quizId = req.params.id;
      
      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Validate submission
      const validatedData = submitQuizSchema.parse(req.body);

      // Get all questions with correct answers
      const questions = await storage.getQuestionsByQuizId(quizId);
      
      // Calculate score
      let score = 0;
      const total = questions.length;

      for (const question of questions) {
        const userAnswer = validatedData.answers.find(
          (a) => a.questionId === question.id
        );

        if (!userAnswer) continue;

        let isCorrect = false;

        if (question.type === "text_based") {
          // For text-based questions, normalize and compare
          const correctAnswer = (question.correctTextAnswer || "").trim().toLowerCase();
          const userTextAnswer = (userAnswer.textAnswer || "").trim().toLowerCase();
          isCorrect = correctAnswer === userTextAnswer;
        } else {
          // For choice questions, compare option IDs
          const correctOptionIds = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id)
            .sort();

          const userOptionIds = (userAnswer.selectedOptionIds || []).sort();

          isCorrect =
            correctOptionIds.length === userOptionIds.length &&
            correctOptionIds.every((id, index) => id === userOptionIds[index]);
        }

        if (isCorrect) {
          score++;
        }
      }

      res.json({ score, total });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
