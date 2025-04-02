"use client";
import React, { useState } from "react";
import { Upload, Success, File } from "./icons";
import { FileButton } from "./common";

export const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileState, setFileState] = useState(1);
  return (
    <div className="bg-secondary rounded-2xl text-primary-accent">
      <div className="flex flex-col mt-12 sm:flex-row sm:mt-0 items-center ">
        <div className="sm:pl-12">
          {fileState > 2 ? (
            <Success className="h-9 w-9 animate-spin-once" />
          ) : (
            <Upload
              className={`h-9 w-9 ${fileState === 2 && "animate-pulse"}`}
            />
          )}
        </div>
        <UploadState state={fileState} files={files} setFiles={setFiles} />
      </div>
    </div>
  );
};

type UploadStateProps = {
  state?: number;
  files?: File[];
  setFiles?: React.Dispatch<React.SetStateAction<File[]>>;
};

const UploadState = ({ state, files, setFiles }: UploadStateProps) => {
  return (
    <div className="flex flex-col p-12">
      {state === 1 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Upload</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-sm-md">
              Select files to upload from your computer or device.
            </p>
          </div>
          <div className="flex flex-col">
            {files && files.length > 0 ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <File className="h-6 w-6 text-secondary-accent mr-3" />
                  <p className="text-white font-bold text-xs">
                    Upload {files.length} Files
                  </p>
                </div>

                <button className="modal-btn">Upload</button>
              </div>
            ) : (
              setFiles && <FileButton setFiles={setFiles} />
            )}
          </div>
        </>
      )}

      {state === 2 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Uploading...</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-w-sm">
              Just give us a moment to process your file.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center w-full">
            <div className="flex-1 flex-col sm:mr-4 mb-5 sm:mb-0">
              <p className="text-secondary-accent font-bold text-right text-xs">
                45%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>

            <button className="modal-btn">Cancel</button>
          </div>
        </>
      )}

      {state === 3 && (
        <>
          <div className="flex flex-col sm:min-w-md">
            <h1 className="text-2xl font-bold mb-6">Sucess</h1>
            <p className="text-secondary-accent sm:text-lg font-semibold mb-12 sm:min-w-sm">
              Your File has been upload successfully
            </p>
            <button className="modal-btn w-full">Done</button>
          </div>
        </>
      )}
    </div>
  );
};
