import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

export function getErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    const { data, message } = error as TRPCClientError<AppRouter>;
    const zodError = data?.zodError;
    const validationMessage =
      zodError?.formErrors[0] ??
      Object.values(zodError?.fieldErrors ?? {}).flat()[0];

    if (typeof validationMessage === "string" && validationMessage) {
      return validationMessage;
    }
    if (error.cause instanceof TypeError) {
      return "Could not reach the server. Check your connection and try again.";
    }
    return message;
  }
  return "Something went wrong. Please try again.";
}
