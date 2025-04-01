"use client";
import { FileWithPreview } from "@/types";
import { generateVideoThumbnail } from "@/utils";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoImages } from "react-icons/io5";
import { Thumbnail } from "./Thumbnail";
import { handleFilesUpload } from "@/api";
import { Button } from "./common";

const DROPZONE_STYLES = {
  base: "flex flex-col items-center p-5 border-2 border-dashed border-gray-400 bg-gray-100 text-gray-500 cursor-pointer transition-all",
  focus: "border-blue-500 bg-blue-50",
  accept: "border-blue-500 bg-blue-50",
  reject: "border-red-500",
};

export const Dropzone = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState({
    isLoading: false,
    success: true,
  });
  const email = process.env.NEXT_PUBLIC_EMAIL!;
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      onDrop: async (acceptedFiles) => {
        const filePreviews = await Promise.all(
          acceptedFiles.map(async (file) => {
            let preview;
            if (file.type.startsWith("video/")) {
              preview = await generateVideoThumbnail(file);
            } else {
              preview = URL.createObjectURL(file);
            }

            return Object.assign(file, { preview });
          })
        );
        setFiles(filePreviews);
      },
    });

  const dropzoneClass = useMemo(
    () =>
      [
        DROPZONE_STYLES.base,
        isFocused && DROPZONE_STYLES.focus,
        isDragAccept && DROPZONE_STYLES.accept,
        isDragReject && DROPZONE_STYLES.reject,
      ]
        .filter(Boolean)
        .join(" "),
    [isFocused, isDragAccept, isDragReject]
  );

  const handleFileUpload = async () => {
    const res = new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setFiles([]);
        resolve({
          data: {
            files: files.map((file) => file.preview),
          },
        });
      }, 3000);
    });
    // const res = await handleFilesUpload(files, email, setIsLoading);
  };

  return (
    <div className="bg-white p-4 rounded-xl max-w-3xl w-full space-y-2">
      <div {...getRootProps({ className: dropzoneClass })}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <IoImages size={50} className="text-blue-500" />
          <p className="font-semibold text-black">
            Drop your files here, or &nbsp;
            <span className="text-blue-600 font-bold">browse</span>
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <Thumbnail files={files} />
          <Button isLoading={dataStatus.isLoading} onClick={handleFileUpload}>
            Upload {files.length} Files
          </Button>
        </>
      )}
      {dataStatus.success && (
        <div className="bg-green-500 w-full rounded-md text-gray-200 p-2 font-bold text-center">
          <p>Files uploaded successfully</p>
        </div>
      )}
    </div>
  );
};
