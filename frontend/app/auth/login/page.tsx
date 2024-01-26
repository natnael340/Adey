"use client";

import React, { FormEventHandler, useRef, useState } from "react";
import Image from "next/image";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

const login: NextPage = (props): JSX.Element => {
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
      if (response?.status == 200) {
        // @ts-ignore
        window.location = "http://localhost:3000/dashboard";
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (session) {
    // @ts-ignore
    window.location = "http://localhost:3000/dashboard";
  }
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
                  required={true}
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
                  required={true}
                  onChange={({ target }) =>
                    setUserInfo({ ...userInfo, password: target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default login;
