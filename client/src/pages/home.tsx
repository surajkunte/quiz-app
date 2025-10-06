import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuizWithQuestionCount } from "@shared/schema";

export default function Home() {
  const { data: quizzes, isLoading } = useQuery<QuizWithQuestionCount[]>({
    queryKey: ["/api/quizzes"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            QuizMaster
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create interactive quizzes and test your knowledge with our easy-to-use platform
          </p>
          <Link href="/create">
            <Button size="lg" className="gap-2" data-testid="button-create-quiz">
              <Plus className="h-5 w-5" />
              Create New Quiz
            </Button>
          </Link>
        </div>

        {/* Quiz List Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Available Quizzes
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover-elevate">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="hover-elevate transition-all duration-200"
                  data-testid={`card-quiz-${quiz.id}`}
                >
                  <CardHeader className="pb-4">
                    <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                      {quiz.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span data-testid={`text-question-count-${quiz.id}`}>
                        {quiz.questionCount} {quiz.questionCount === 1 ? 'Question' : 'Questions'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span data-testid={`text-created-date-${quiz.id}`}>
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/quiz/${quiz.id}`} className="w-full">
                      <Button className="w-full" data-testid={`button-start-quiz-${quiz.id}`}>
                        Start Quiz
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No quizzes yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first quiz. Add questions and share it with others!
              </p>
              <Link href="/create">
                <Button className="gap-2" data-testid="button-create-first-quiz">
                  <Plus className="h-5 w-5" />
                  Create Your First Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
