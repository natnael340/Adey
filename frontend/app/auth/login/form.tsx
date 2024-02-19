"use client";

import { Alert, Spinner } from "flowbite-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { FormEventHandler, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import { get_redirect_url } from "../components/utils";

const Form = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [showAlert, setShowAlert] = useState({ show: false, message: "" });
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
        setShowAlert({ show: true, message: response.error });
        setTimeout(() => setShowAlert({ show: false, message: "" }), 3000);
      } else if (response?.ok) {
        router.push(get_redirect_url(searchParams));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {showAlert.show ? (
        <Alert color="failure" icon={HiInformationCircle}>
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
          <input
            ref={password}
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, password: target.value })
            }
          />
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
