"use client";

import React, { useRef } from "react";

type FileButtonProps = {
  handleFileChange: (files: File[]) => void;
};

export const FileButton = ({ handleFileChange }: FileButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const files = Array.from(fileInputRef.current.files);
      handleFileChange(files);
    }
  };

  return (
    <>
      <button
        className="modal-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        Choose File
      </button>
      <input
        multiple
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </>
  );
};
