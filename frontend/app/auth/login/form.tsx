"use client";

import { Alert, Spinner } from "flowbite-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { FormEventHandler, useRef, useState } from "react";
import { BadgeInfo, Eye, EyeOff } from "lucide-react";
import { get_redirect_url } from "../components/utils";

const Form = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    code: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    let { email: _email, password: _password } = userInfo;
    if (email.current && email.current?.value !== "" && userInfo.email == "") {
      setUserInfo({ ...userInfo, email: email.current?.value });
      _email = email.current?.value;
    }
    if (
      password.current &&
      password.current?.value !== "" &&
      userInfo.password == ""
    ) {
      setUserInfo({ ...userInfo, password: password.current?.value });
      _password = password.current?.value;
    }
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        email: _email,
        password: _password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (response?.error) {
        try {
          let _error = JSON.parse(response.error);
          let message = "";
          console.log("_error", response.error);
          if (typeof _error.message == "string") {
            message = _error.message;
          } else if (_error.message?.message?.non_field_errors) {
            message = _error.message?.message?.non_field_errors[0];
          }

          setShowAlert({
            show: true,
            message: message,
            code: _error.code,
          });
        } catch (e) {
          console.log("error", response.error);
          setShowAlert({ show: true, message: response.error, code: 0 });
        }
      } else if (response?.ok) {
        router.push(get_redirect_url(searchParams));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <>
      {showAlert.show ? (
        <Alert
          color="warning"
          icon={BadgeInfo}
          onDismiss={() => setShowAlert({ show: false, message: "", code: 0 })}
          additionalContent={
            showAlert.code == 2 ? (
              <div className="pt-2">
                <a
                  href="/auth/email/verify"
                  type="button"
                  className="border border-primary-600 rounded-md py-1 px-2 text-[#15192C]"
                >
                  Verify Email
                </a>
              </div>
            ) : (
              <></>
            )
          }
        >
          <span className="font-medium">Login failed!</span> {showAlert.message}
        </Alert>
      ) : (
        <></>
      )}
      <form
        className="space-y-4 md:space-y-6"
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
            ref={email}
            type="email"
            name="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@company.com"
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, email: target.value })
            }
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              ref={password}
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="********"
              className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, password: target.value })
              }
            />
            <button
              className="absolute top-0 right-0 flex items-center justify-center bottom-0 w-10"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff color="#7a7a7a" size={16} />
              ) : (
                <Eye color="#7a7a7a" size={16} />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          {loading ? <Spinner color="info" /> : "Sign in"}
        </button>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Don’t have an account yet?{" "}
          <a
            href="/auth/signup"
            className="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Sign up
          </a>
        </p>
      </form>
    </>
  );
};

export default Form;
