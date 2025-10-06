// Referenced from javascript_database blueprint - adapted for quiz application
import { 
  quizzes, 
  questions, 
  options,
  type Quiz, 
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type Option,
  type InsertOption,
  type QuizWithQuestionCount,
  type QuestionWithOptions,
  type CreateQuestionWithOptions,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getAllQuizzes(): Promise<QuizWithQuestionCount[]>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestionWithOptions(quizId: string, data: CreateQuestionWithOptions): Promise<Question>;
  getQuestionsByQuizId(quizId: string): Promise<QuestionWithOptions[]>;
  
  // Option operations
  createOption(option: InsertOption): Promise<Option>;
  getOptionsByQuestionId(questionId: string): Promise<Option[]>;
}

export class DatabaseStorage implements IStorage {
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db
      .insert(quizzes)
      .values(insertQuiz)
      .returning();
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async getAllQuizzes(): Promise<QuizWithQuestionCount[]> {
    const result = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt,
        questionCount: sql<number>`count(${questions.id})::int`,
      })
      .from(quizzes)
      .leftJoin(questions, eq(quizzes.id, questions.quizId))
      .groupBy(quizzes.id)
      .orderBy(sql`${quizzes.createdAt} DESC`);

    return result;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async createQuestionWithOptions(
    quizId: string,
    data: CreateQuestionWithOptions
  ): Promise<Question> {
    // Create the question
    const [question] = await db
      .insert(questions)
      .values({
        quizId,
        text: data.text,
        type: data.type,
        order: data.order,
        correctTextAnswer: data.correctTextAnswer || null,
      })
      .returning();

    // Create the options (only for choice questions)
    if (data.options && data.options.length > 0) {
      await db.insert(options).values(
        data.options.map((opt) => ({
          questionId: question.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      );
    }

    return question;
  }

  async getQuestionsByQuizId(quizId: string): Promise<QuestionWithOptions[]> {
    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.order);

    const questionsWithOptions = await Promise.all(
      questionsData.map(async (question) => {
        const opts = await this.getOptionsByQuestionId(question.id);
        return {
          ...question,
          options: opts,
        };
      })
    );

    return questionsWithOptions;
  }

  async createOption(insertOption: InsertOption): Promise<Option> {
    const [option] = await db
      .insert(options)
      .values(insertOption)
      .returning();
    return option;
  }

  async getOptionsByQuestionId(questionId: string): Promise<Option[]> {
    return await db
      .select()
      .from(options)
      .where(eq(options.questionId, questionId));
  }
}

export const storage = new DatabaseStorage();
