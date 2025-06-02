import * as z from "zod";

const createEnv = () => {
  const EnvSchema = z.object({
    VITE_SERVER_URL: z.string().default("http://localhost:3001"),
  });

  const envVars = {
    VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
  };

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
  The following variables are missing or invalid:
  ${Object.entries(parsedEnv.error.flatten().fieldErrors)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n")}
  `
    );
  }

  return parsedEnv.data ?? {};
};

export const env = createEnv();
