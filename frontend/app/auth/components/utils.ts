import { isSafePath } from "@/app/components/utils";
import { ReadonlyURLSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthErrorMessage, ResponseErrorType } from "@/app/types/types";
import { FormEvent } from "react";

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

const parseErrorMessage = (
  error: ResponseErrorType | { [key: string]: ResponseErrorType[] }
): AuthErrorMessage => {
  if (error.hasOwnProperty("message")) {
    return {
      messages: [(error as ResponseErrorType).message],
      code: (error as ResponseErrorType).code,
    };
  }
  let errors: string[] = [];

  Object.keys(error as { [key: string]: ResponseErrorType[] }).forEach(
    (key: string) => {
      const fieldError = (error as { [key: string]: ResponseErrorType[] })[key];

      if (Array.isArray(fieldError)) {
        fieldError.forEach((msg: ResponseErrorType) => {
          if (!errors) errors = [];
          errors.push(`${key}: ${msg.message}`);
        });
      }
    }
  );

  return { messages: errors };
};

export const handleLoginWithPassword = async (
  e: FormEvent,
  callback: (success: boolean, error: AuthErrorMessage) => void,
  setLoading?: (loading: boolean) => void
) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    setLoading && setLoading(true);
    const response = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (!response?.ok) {
      const error = JSON.parse(response?.error || "{}");
      if (error) {
        callback(false, parseErrorMessage(error));
      } else {
        callback(false, { messages: ["Login failed"] });
      }
    } else {
      callback(true, { messages: [] });
    }
    //console.log("response", response);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading && setLoading(false);
  }
};
