import { isSafePath } from "@/app/components/utils";
import { ReadonlyURLSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AxiosError } from "axios";
import { AuthErrorMessage, ResponseErrorType } from "@/app/types/types";

export const get_redirect_url = (
  searchParams: ReadonlyURLSearchParams | null
) => {
  const redirect_url = new URLSearchParams(searchParams?.toString()).get(
    "redirect_url"
  );
  if (redirect_url && isSafePath(redirect_url)) {
    return redirect_url;
  }
  return "/dashboard";
};

// The backend's own wording for these is written for developers
const friendlyText: Record<string, string> = {
  no_active_account:
    "That email and password don't match an account. Check them and try again.",
  unverified_account: "Verify your email before signing in.",
  network: "Can't reach Adey right now. Try again in a moment.",
};

const failure = (code: string, message = ""): AuthErrorMessage => ({
  messages: [friendlyText[code] ?? message],
  code,
});

const parseErrorMessage = (
  error: ResponseErrorType | { [key: string]: ResponseErrorType[] }
): AuthErrorMessage => {
  if ("message" in error) {
    const { code, message } = error as ResponseErrorType;
    return failure(code, message);
  }
  return {
    messages: Object.values(error)
      .flatMap((fieldError) => (Array.isArray(fieldError) ? fieldError : []))
      .map((e) => e.message),
  };
};

// For api.* calls: a backend reply becomes its messages, no reply means the network failed
export const apiFailure = (e: unknown): AuthErrorMessage => {
  const data = e instanceof AxiosError ? e.response?.data : undefined;
  if (!data || typeof data !== "object") return failure("network");
  return parseErrorMessage(data);
};

export const loginWithPassword = async (
  form: HTMLFormElement
): Promise<AuthErrorMessage | null> => {
  const formData = new FormData(form);
  try {
    const response = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (response?.ok) return null;
    try {
      return parseErrorMessage(JSON.parse(response?.error || ""));
    } catch {
      // NextAuth returns a plain string (e.g. "CredentialsSignin") when the backend is unreachable
      return failure("network");
    }
  } catch (e) {
    console.error(e);
    return failure("network");
  }
};
