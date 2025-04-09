"use client";
import { RestoredFile } from "@/types";
import React from "react";

type RestorationCompleteProps = {
  files: RestoredFile[];
};
export const RestorationComplete = ({ files }: RestorationCompleteProps) => {
  const downloadAllFiles = async () => {
    for (const file of files) {
      const link = document.createElement("a");
      link.href = file.signedUrl;
      link.download = ""; // Optional: set file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <>
      <div>
        <h1 className="p-2 text-xl">
          Your files are cooked and ready to serve 🍽️ Click to download!
        </h1>

        <button
          onClick={downloadAllFiles}
          className="modal-btn text-primary-accent p-2 rounded-2xl bg-btn-primary hover:bg-primary-accent hover:text-secondary w-full"
        >
          Download
        </button>
      </div>
    </>
  );
};
