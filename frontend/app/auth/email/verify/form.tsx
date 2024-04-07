"use client";

import { Alert, Spinner } from "flowbite-react";
import React, { FormEventHandler, useRef, useState } from "react";
import { Info, ArrowLeft } from "lucide-react";
import { api } from "@/app/components/Api";
import { useRouter } from "next/navigation";
import { GenericResponseType } from "@/app/types/types";

const Form = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    error: false,
  });
  const emailElement = useRef<HTMLInputElement>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    let _email = email;
    if (
      emailElement.current &&
      emailElement.current?.value !== "" &&
      email == ""
    ) {
      setEmail(emailElement.current?.value);
      _email = emailElement.current?.value;
    }

    setLoading(true);
    try {
      const { data } = await api.post<GenericResponseType>(
        "auth/email/verification",
        {
          email: _email,
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
        <Alert color="failure" icon={Info}>
          <span className="font-medium">Password reset failed!</span>{" "}
          {showAlert.message}
        </Alert>
      ) : showAlert.show && !showAlert.error ? (
        <Alert color="success" icon={Info}>
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
            ref={emailElement}
            type="email"
            name="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@company.com"
            onChange={({ target }) => setEmail(target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          {loading ? <Spinner color="info" /> : "Verify Email"}
        </button>
      </form>
    </>
  );
};

export default Form;
