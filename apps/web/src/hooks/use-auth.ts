import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();
  const userRole = session?.user?.role;

  return {
    session,
    user: session?.user,
    isPending,
    isAuthenticated: !!session?.user,
    userRole,
  };
}
