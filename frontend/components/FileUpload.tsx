"use client";
import React, { useState } from "react";
import { Upload, Success, File, ErrorIcon } from "./icons";
import { FileButton } from "./common";
import { handleFilesUpload } from "@/api";
import { FileStatus } from "@/types";

const email = process.env.NEXT_PUBLIC_EMAIL!;
export const FileUpload = () => {
  const [fileStatus, setFileStatus] = useState<FileStatus>({
    files: [],
    fileState: 1,
    isLoading: false,
    cancelTokenSource: null,
  });
  return (
    <div className="bg-secondary rounded-2xl text-primary-accent">
      <div className="flex flex-col mt-12 sm:flex-row sm:mt-0 items-center ">
        <div className="sm:pl-12">
          {fileStatus.fileState > 2 ? (
            <Success className="h-9 w-9 animate-spin-once" />
          ) : fileStatus.fileState === 0 ? (
            <ErrorIcon className="h-9 w-9 animate-spin-once" />
          ) : (
            <Upload
              className={`h-9 w-9 ${
                fileStatus.fileState === 2 && "animate-pulse"
              }`}
            />
          )}
        </div>
        <UploadState fileStatus={fileStatus} setFileStatus={setFileStatus} />
      </div>
    </div>
  );
};

type UploadStateProps = {
  fileStatus: FileStatus;
  setFileStatus: React.Dispatch<React.SetStateAction<FileStatus>>;
};

const UploadState = ({ fileStatus, setFileStatus }: UploadStateProps) => {
  const [progress, setProgress] = useState(0);
  const handleFileInputChange = (files: File[]) => {
    setFileStatus({ ...fileStatus, files });
  };

  const handleFileUpload = async () => {
    await handleFilesUpload(fileStatus, setFileStatus, setProgress, email);
  };

  const handleCancelUpload = () => {
    if (fileStatus.cancelTokenSource) {
      fileStatus.cancelTokenSource.cancel("Upload canceled by user");
      setFileStatus((prev) => ({
        ...prev,
        cancelTokenSource: null,
      }));
    } else {
      setFileStatus((prev) => ({
        ...prev,
        fileState: 1,
        files: [],
      }));
    }
  };
  return (
    <div className="flex flex-col p-12">
      {/* Error State */}
      {fileStatus.fileState === 0 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Oops!</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-sm-md">
              Your file could not be uploaded due to an error. Try uploading it
              again?
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-2">
              <button
                onClick={handleFileUpload}
                className="modal-btn mb-2 sm:mb-0"
              >
                Retry
              </button>
              <button className="modal-btn" onClick={handleCancelUpload}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Default State */}

      {fileStatus.fileState === 1 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Upload</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-sm-md">
              Select files to upload from your computer or device.
            </p>
          </div>
          <div className="flex flex-col">
            {fileStatus.files && fileStatus.files.length > 0 ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <File className="h-6 w-6 text-secondary-accent mr-3" />
                  <p className="text-white font-bold text-xs">
                    Upload {fileStatus.files.length} Files
                  </p>
                </div>

                <button className="modal-btn" onClick={handleFileUpload}>
                  Upload
                </button>
              </div>
            ) : (
              fileStatus.files.length === 0 && (
                <FileButton handleFileChange={handleFileInputChange} />
              )
            )}
          </div>
        </>
      )}

      {/* Uploading State */}

      {fileStatus.fileState === 2 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">
              {progress >= 60 ? "Almost Done" : "Uploading..."}
            </h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-w-sm">
              {progress >= 60
                ? "Processing your files"
                : "Just give us a moment to process your file."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center w-full">
            <div className="flex-1 flex-col sm:mr-4 mb-5 sm:mb-0">
              <p className="text-secondary-accent font-bold text-right text-xs">
                {progress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500"
                  style={{ width: progress + "%" }}
                ></div>
              </div>
            </div>

            <button className="modal-btn" onClick={handleCancelUpload}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Success State */}

      {fileStatus.fileState === 3 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Success</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-w-sm">
              Your File has been upload successfully
            </p>
            <button
              className="modal-btn w-full"
              onClick={() =>
                setFileStatus({
                  files: [],
                  fileState: 1,
                  isLoading: false,
                  cancelTokenSource: null,
                })
              }
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
};
