"use client";
import { generateVideoThumbnail } from "@/utils";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoImages } from "react-icons/io5";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#bdbdbd",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  cursor: "pointer",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
  backgroundColor: "#e3f2fd",
};

const acceptStyle = {
  borderColor: "#2196f3",
  backgroundColor: "#e3f2fd",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

type FileWithPreview = File & { preview: string };
export const Dropzone = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
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

  const thumbs = files.map((file: FileWithPreview) => (
    <div key={file.name}>
      <div className="relative h-40 w-40">
        <Image
          src={file.preview}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
          alt={file.name}
          layout="fill"
          className="rounded-md"
          objectFit="cover"
        />
      </div>
    </div>
  ));

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div className="bg-white p-4 rounded-xl min-w-2xl space-y-2">
      <div {...getRootProps({ style: style as React.CSSProperties })}>
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
          <div className="grid grid-cols-4 gap-2 overflow-y-scroll max-h-80">
            {thumbs}
          </div>

          <button className="bg-blue-500 text-white p-2 rounded-lg w-full">
            Upload {files.length} Files
          </button>
        </>
      )}
    </div>
  );
};
