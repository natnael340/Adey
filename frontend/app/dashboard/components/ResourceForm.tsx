"use client";

import { ResourceFormType } from "@/app/types/types";
import { Modal } from "flowbite-react";
import React, { ChangeEvent, useEffect, useState } from "react";

type PropTypes = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  form: ResourceFormType;
  updateForm: (value: ResourceFormType) => void;
  saveChanges: (value: string) => void;
  edit: string;
};
const ResourceForm = ({
  openModal,
  setOpenModal,
  form,
  updateForm,
  saveChanges,
  edit,
}: PropTypes) => {
  const [canSave, setCanSave] = useState(false);
  useEffect(() => {
    if (edit && form.name) {
      setCanSave(true);
    } else if (form.document && form.name) {
      setCanSave(true);
    }
  }, [form]);
  // @ts-ignore
  const onFormClose = () => {
    updateForm({
      name: "",
      document: "",
    });
    setOpenModal(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      updateForm({ ...form, document: e.target.files[0] });
    }
  };
  return (
    <Modal
      show={openModal}
      onClose={() => onFormClose()}
      dismissible
      theme={{
        content: {
          inner:
            "relative rounded-2xl bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]",
        },
      }}
    >
      <Modal.Body className="bg-white p-10 space-y-5 rounded-3xl">
        <div>
          <label>Resource Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm({ ...form, name: e.target.value })}
            placeholder="About XYZ LLC."
            className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
          />
        </div>
        <div>
          <label>File</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFileUpload(e)}
            placeholder="About XYZ LLC."
            className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
          />
        </div>
        <div className="flex justify-end mt-5">
          <button
            className={`py-2 px-4 bg-[#F0E07F] rounded-xl ${
              canSave ? "" : "opacity-30"
            }`}
            onClick={canSave ? () => saveChanges(edit) : () => null}
          >
            {edit ? "Update" : "Create"} resource
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ResourceForm;
