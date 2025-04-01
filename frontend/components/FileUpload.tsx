"use client";
import React, { useState } from "react";
import { Upload, Success, File } from "./icons";
import { FileButton } from "./common";

export const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="bg-secondary rounded-2xl text-primary-accent">
      <div className="flex flex-col mt-12 sm:flex-row sm:mt-0 items-center ">
        <div className="sm:pl-12">
          <Upload className="h-9 w-9" />
          {/* <Success className="h-9 w-9 animate-spin" /> */}
        </div>
        <div className="flex flex-col p-12">
          <h1 className="text-2xl font-bold mb-6">Upload a File</h1>
          <p className="text-secondary-accent text-lg font-semibold mb-12">
            Select files to upload from your computer or device.
          </p>

          {files.length > 0 ? (
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
            <FileButton setFiles={setFiles} />
          )}
        </div>
      </div>
    </div>
  );
};
