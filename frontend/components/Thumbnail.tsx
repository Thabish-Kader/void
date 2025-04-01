import { FileWithPreview } from "@/types";
import Image from "next/image";
import React from "react";

export const Thumbnail = ({ files }: { files: FileWithPreview[] }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 overflow-y-scroll max-h-80">
      {files.map((file) => (
        <div
          key={file.name}
          className="relative h-24 w-24 sm:h-40 sm:w-40 rounded-md"
        >
          <Image
            src={file.preview}
            onLoad={() => URL.revokeObjectURL(file.preview)}
            alt={file.name}
            layout="fill"
            className="object-cover rounded-md"
          />
        </div>
      ))}
    </div>
  );
};
