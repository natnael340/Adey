"use client";

import React, { FormEventHandler, useRef, useState } from "react";
import Image from "next/image";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { Alert, Spinner } from "flowbite-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { isSafePath } from "@/app/components/utils";

const login: NextPage = (props): JSX.Element => {
  const router = useRouter();
  const { data: session, status } = useSession();
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (session) {
    // @ts-ignore
    const redirect_url = new URLSearchParams(window.location.search).get(
      "redirect_url"
    );
    if (redirect_url && isSafePath(redirect_url)) {
      router.push(redirect_url);
    } else {
      router.push("/dashboard");
    }
  }
  const oauthSignIn = (provider: string) => {
    const redirect_url = new URLSearchParams(window.location.search).get(
      "redirect_url"
    );
    if (redirect_url && isSafePath(redirect_url)) {
      signIn(provider, {
        redirect: true,
        callbackUrl: redirect_url,
      });
    } else {
      signIn(provider, {
        redirect: true,
        callbackUrl: "/dashboard",
      });
    }
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
              Sign in to your account
            </h1>
            {showAlert.show ? (
              <Alert color="failure" icon={HiInformationCircle}>
                <span className="font-medium">Login failed!</span>{" "}
                {showAlert.message}
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
                {status == "loading" ? <Spinner />:"Sign in"}
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
            <div className="flex flex-row w-full items-center">
              <div className="flex-1 h-[1px] bg-gray-400"></div>
              <p className="mx-3 text-gray-800">or</p>
              <div className="flex-1 h-[1px] bg-gray-400"></div>
            </div>
            <div className="w-full space-y-2">
              <button
                onClick={() => signIn("google")}
                className="w-full flex flex-row items-center justify-center gap-x-3 h-10 border-gray-300 border rounded-md"
              >
                <FcGoogle />
                Sign in with Google
              </button>
              <button
                onClick={() => signIn("github")}
                className="w-full flex flex-row items-center justify-center gap-x-3 h-10 border-gray-300 border rounded-md"
              >
                <FaGithub />
                Sign in with Github
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default login;
