import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Home, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Results() {
  const [, params] = useRoute("/results/:id");
  const [, navigate] = useLocation();
  
  // Get score and total from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "0");
  
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding!", color: "text-chart-2" };
    if (percentage >= 70) return { message: "Great job!", color: "text-primary" };
    if (percentage >= 50) return { message: "Good effort!", color: "text-chart-4" };
    return { message: "Keep practicing!", color: "text-chart-5" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's how you performed
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${performance.color} mb-2`}>
                  {score}
                </div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>
              <div className="text-4xl text-muted-foreground">/</div>
              <div className="text-center">
                <div className="text-6xl font-bold text-foreground mb-2">
                  {total}
                </div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Progress value={percentage} className="h-3" data-testid="progress-score" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score Percentage</span>
                <span className={`font-semibold ${performance.color}`} data-testid="text-percentage">
                  {percentage}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className={`text-lg font-semibold ${performance.color}`}>
                {performance.message}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-chart-2 mb-2">{score}</div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-chart-5 mb-2">{total - score}</div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/quiz/${params?.id}`)}
            className="gap-2"
            data-testid="button-retake"
          >
            <ArrowLeft className="h-4 w-4" />
            Retake Quiz
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="gap-2"
            data-testid="button-home"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
