// session-context.ts
import type { User } from "better-auth";
import { createContext, useContext } from "react";

const UserContext = createContext<User | undefined>(undefined);

export const useCurrentUser = (): User => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUserContext must be used inside an authenticated route.");
  }
  return user;
};

export { UserContext };
