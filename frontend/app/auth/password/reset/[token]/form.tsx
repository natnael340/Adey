"use client";

import React, { FormEventHandler, useState } from "react";
import { BadgeInfo, ArrowLeft, RefreshCw, BadgeCheck } from "lucide-react";
import { api } from "@/app/components/Api";
import { useRouter } from "next/navigation";
import { GenericResponseType } from "@/app/types/types";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type ParamType = {
  token: string;
};
const Form = ({ token }: ParamType) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    error: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    password: [],
    confirmPassword: [],
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await api.post<GenericResponseType>(
        `auth/password/reset/${token}`,
        {
          password: password,
          confirm_password: confirmPassword,
        }
      );
      if (data.error) {
        setShowAlert({ show: true, message: data.message, error: true });
        setTimeout(
          () => setShowAlert({ show: false, message: "", error: false }),
          3000
        );
      } else {
        setShowAlert({ show: true, message: data.message, error: false });
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.data?.password)
          setFieldErrors({
            ...fieldErrors,
            password: e.response?.data.password,
          });
        else if (e.response?.data?.confirm_password)
          setFieldErrors({
            ...fieldErrors,
            confirmPassword: e.response?.data.password,
          });
        else if (e.response?.data?.non_field_errors) {
          setShowAlert({
            show: true,
            message: e.response?.data?.non_field_errors[0],
            error: true,
          });
          setTimeout(
            () => setShowAlert({ show: false, message: "", error: false }),
            3000
          );
        } else if (
          e.response?.data?.message &&
          typeof e.response?.data?.message == "string"
        ) {
          setShowAlert({
            show: true,
            message: e.response?.data?.message,
            error: true,
          });
        }
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const BackToLogin = () => (
    <button
      type="button"
      className="mr-2 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-cyan-800 focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-800 dark:hover:bg-cyan-900"
      onClick={() => router.push("auth/login")}
    >
      <ArrowLeft className="-ml-0.5 mr-2 h-4 w-4" />
      Back to login
    </button>
  );
  return (
    <>
      {showAlert.show && showAlert.error ? (
        <Alert variant="destructive">
          <BadgeInfo className="w-4 h-4" />
          <AlertTitle>Password reset failed!</AlertTitle>
          <AlertDescription>{showAlert.message}</AlertDescription>
        </Alert>
      ) : showAlert.show && !showAlert.error ? (
        <Alert variant="success">
          <BadgeCheck className="w-4 h-4" />
          <AlertTitle>Password reset successful!</AlertTitle>
          <AlertDescription>
            {showAlert.message}&nbsp;
            <a className="text-blue-700 hover:underline" href="/auth/login">
              Login
            </a>
          </AlertDescription>
        </Alert>
      ) : (
        <></>
      )}
      <form
        className="space-y-4 md:space-y-6"
        action="#"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="*********"
            onChange={({ target }) => setPassword(target.value)}
            value={password}
            autoComplete="new-password"
          />
          <div>
            {fieldErrors.password.map((error) => (
              <p className="text-red-500 text-sm">{error}</p>
            ))}
          </div>
        </div>
        <div>
          <label
            htmlFor="confirm_password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Confirm Password
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="*********"
            onChange={({ target }) => setConfirmPassword(target.value)}
            value={confirmPassword}
            autoComplete="new-password"
          />
          <div>
            {fieldErrors.confirmPassword.map((error) => (
              <p className="text-red-500 text-sm">{error}</p>
            ))}
          </div>
        </div>
        <Button disabled={loading} className="w-full" type="submit">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </>
  );
};

export default Form;
