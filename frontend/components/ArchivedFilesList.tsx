"use client";
import { getArchivedFiles } from "@/api";
import React, { useState } from "react";
import { RestorationStatus } from "./RestorationStatus";
import { RestorationComplete } from "./RestorationComplete";
import { RestoredFile } from "@/types";

export const ArchivedFilesList = ({
  archivedFiles,
}: {
  archivedFiles: string;
}) => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<RestoredFile[]>([]);
  const handleRetrivalFiles = async () => {
    const res = await getArchivedFiles(process.env.NEXT_PUBLIC_EMAIL as string);
    console.log(res);
    if (res.status === 200) {
      const data = res.data;

      const availableFiles = data.filter(
        (file: RestoredFile) => file.restorStatus === "AVAILABLE"
      );
      if (availableFiles.length > 0) {
        setStep(2);
        setFiles(availableFiles);
      } else setStep(1);
    }
  };
  return (
    <div>
      {step === 0 && (
        <>
          <h1 className="p-2 text-xl">
            {archivedFiles.length} files have been archived successfully! 🎉
          </h1>
          <button
            onClick={handleRetrivalFiles}
            className="modal-btn text-primary-accent p-2 rounded-2xl bg-btn-primary hover:bg-primary-accent hover:text-secondary w-full"
          >
            Retrieve Archived Files
          </button>
        </>
      )}

      {step === 1 && <RestorationStatus />}

      {step === 2 && <RestorationComplete files={files} />}
    </div>
  );
};
