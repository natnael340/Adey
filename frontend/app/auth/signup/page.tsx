"use client";

import React, { FormEventHandler, useState } from "react";
import Image from "next/image";
import { RegisterFormType } from "@/app/types/types";
import { api } from "@/app/components/Api";
import { AxiosError } from "axios";
import { navigate } from "@/app/components/handlers";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type RegisterFormError = {
  email: string[];
  password: string[];
  confirm_password: string[];
};

const signup = () => {
  const [registerForm, setRegisterForm] = useState<RegisterFormType>({
    email: "",
    password: "",
    confirm_password: "",
  });
  const [formSubmitLoading, setFormSubmitLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormError>({
    email: [],
    password: [],
    confirm_password: [],
  });
  const [termConditionAccepted, setTermConditionAccepted] =
    useState<boolean>(true);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const _fieldErrors: RegisterFormError = {
      email: [],
      password: [],
      confirm_password: [],
    };
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
        registerForm.email
      )
    ) {
      _fieldErrors.email.push("Email is not valid.");
    }
    if (registerForm.password.length < 8) {
      _fieldErrors.password.push("Password must be at least 8 characters.");
    }
    if (!uppercaseRegex.test(registerForm.password))
      _fieldErrors.password.push(
        "Password must contain at least one upper case letter."
      );
    if (!lowercaseRegex.test(registerForm.password))
      _fieldErrors.password.push(
        "Password must contain at least one lower case letter."
      );
    if (!numberRegex.test(registerForm.password))
      _fieldErrors.password.push("Password must contain at least one number.");
    if (registerForm.password !== registerForm.confirm_password)
      _fieldErrors.confirm_password.push(
        "Confirm password must match with the password."
      );
    if (
      _fieldErrors.email.length == 0 &&
      _fieldErrors.password.length == 0 &&
      _fieldErrors.confirm_password.length == 0
    ) {
      try {
        setFormSubmitLoading(true);
        await api.post("auth/signup", {
          email: registerForm.email,
          password: registerForm.password,
        });
        navigate("/auth/login");
        return;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data) {
            Object.keys(error.response.data).map((key) => {
              if (
                Object.keys(registerForm).find((predicate) => predicate == key)
              ) {
                // @ts-ignore
                error.response.data[key].map((err) =>
                  // @ts-ignore
                  _fieldErrors[key].push(err)
                );
              }
            });
          }
        } else {
          console.error(error);
        }
      } finally {
        setFormSubmitLoading(false);
      }
    } else console.log(_fieldErrors);
    setFieldErrors(_fieldErrors);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <Image
            className="w-8 h-8 mr-2"
            src="/adey_logo.png"
            alt="logo"
            width={75}
            height={75}
          />
          Adey
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>
            <form
              className="space-y-3 md:space-y-5"
              action="#"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required={true}
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
                {fieldErrors.email.length > 0 ? (
                  <div className="mt-2">
                    {fieldErrors.email.map((err, idx) => (
                      <span key={idx} className="text-red-600 block text-xs">
                        {err}
                      </span>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </div>
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
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required={true}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                />
                {fieldErrors.password.length > 0 ? (
                  <div className="mt-2">
                    {fieldErrors.password.map((err, idx) => (
                      <span key={idx} className="text-red-600 block text-xs">
                        {err}
                      </span>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmpassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmpassword"
                  id="confirmpassword"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required={true}
                  value={registerForm.confirm_password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirm_password: e.target.value,
                    })
                  }
                />
                {fieldErrors.confirm_password.length > 0 ? (
                  <div className="mt-2">
                    {fieldErrors.confirm_password.map((err, idx) => (
                      <span key={idx} className="text-red-600 block text-xs">
                        {err}
                      </span>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    aria-describedby="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    required={true}
                    checked={termConditionAccepted}
                    onChange={(e) => setTermConditionAccepted(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="terms"
                    className="font-light text-gray-500 dark:text-gray-300"
                  >
                    I accept the{" "}
                    <a
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                      href="#"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!termConditionAccepted || formSubmitLoading}
              >
                {formSubmitLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Create an account"
                )}
              </Button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="font-medium text-blue-700 hover:underline dark:text-primary-500"
                >
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default signup;
