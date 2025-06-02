import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold tracking-tight">Oops! Page Not Found.</h2>
        <p className="text-muted-foreground">It seems the page you're looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
