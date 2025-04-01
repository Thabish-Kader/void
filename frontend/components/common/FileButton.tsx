"use client";

import React, { useRef } from "react";

type FileButtonProps = {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export const FileButton = ({ setFiles }: FileButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const files = Array.from(fileInputRef.current.files);
      setFiles(files);
    }
  };

  return (
    <>
      <button
        className="btn rounded"
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
