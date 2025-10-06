import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Quiz table
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Question types enum
export const questionTypes = ["multiple_choice", "single_choice", "text_based"] as const;

// Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull().$type<typeof questionTypes[number]>(),
  order: integer("order").notNull(),
  correctTextAnswer: text("correct_text_answer"),
});

// Options table
export const options = pgTable("options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

// Relations
export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

// Insert schemas with validation
export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
}).extend({
  title: z.string().min(1, "Quiz title is required").max(200, "Title must be less than 200 characters"),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  quizId: true,
  text: true,
  type: true,
  order: true,
}).extend({
  text: z.string().min(1, "Question text is required").refine(
    (text) => text.length <= 300,
    { message: "Text-based questions must be 300 characters or less" }
  ),
  type: z.enum(questionTypes),
  order: z.number().int().min(0),
});

export const insertOptionSchema = createInsertSchema(options).pick({
  questionId: true,
  text: true,
  isCorrect: true,
}).extend({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

// Schema for creating question with options in one request
export const createQuestionWithOptionsSchema = z.object({
  text: z.string().min(1, "Question text is required").max(300, "Question must be 300 characters or less"),
  type: z.enum(questionTypes),
  order: z.number().int().min(0),
  correctTextAnswer: z.string().max(300).optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
  })).optional(),
}).refine(
  (data) => {
    // Text-based questions require correctTextAnswer
    if (data.type === "text_based") {
      return !!data.correctTextAnswer && data.correctTextAnswer.length > 0;
    }
    // Choice questions require options
    return data.options && data.options.length >= 1;
  },
  { message: "Text-based questions require a correct text answer, choice questions require options" }
).refine(
  (data) => {
    if (!data.options || data.options.length === 0) return true;
    
    const correctCount = data.options.filter(o => o.isCorrect).length;
    
    if (data.type === "single_choice") {
      return correctCount === 1;
    } else if (data.type === "multiple_choice") {
      return correctCount >= 1;
    }
    return true;
  },
  { message: "Invalid correct answer configuration for question type" }
);

// Schema for submitting quiz answers
export const submitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionIds: z.array(z.string()).optional(),
    textAnswer: z.string().max(300).optional(),
  })),
});

// TypeScript types
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertOption = z.infer<typeof insertOptionSchema>;
export type Option = typeof options.$inferSelect;

export type CreateQuestionWithOptions = z.infer<typeof createQuestionWithOptionsSchema>;
export type SubmitQuiz = z.infer<typeof submitQuizSchema>;

// Response types for API
export type QuizWithQuestionCount = Quiz & { questionCount: number };
export type QuestionWithOptions = Question & { options: Option[] };
export type QuestionWithOptionsPublic = Omit<Question, 'id' | 'correctTextAnswer'> & { 
  id: string;
  options: Omit<Option, 'isCorrect'>[] 
};
