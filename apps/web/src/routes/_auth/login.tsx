import { BounceLoader } from "@/components/loader";
import SignInForm from "@/features/auth/components/sign-in-form";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPageComponent,
});

function LoginPageComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (session && !isPending) {
      navigate({ to: "/" });
    }
  }, [session, isPending]);

  if (isPending) return <BounceLoader />;

  return <SignInForm />;
}
