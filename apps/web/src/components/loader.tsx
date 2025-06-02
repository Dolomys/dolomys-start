export function BounceLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center space-x-2 bg-background">
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
    </div>
  );
}
