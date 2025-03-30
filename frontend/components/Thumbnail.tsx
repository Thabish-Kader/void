import { FileWithPreview } from "@/types";
import Image from "next/image";
import React from "react";

export const Thumbnail = ({ files }: { files: FileWithPreview[] }) => {
  return (
    <div className="grid grid-cols-4 gap-2 overflow-y-scroll max-h-80">
      {files.map((file) => (
        <div key={file.name} className="relative h-40 w-40">
          <Image
            src={file.preview}
            onLoad={() => URL.revokeObjectURL(file.preview)}
            alt={file.name}
            layout="fill"
            className="rounded-md object-cover"
          />
        </div>
      ))}
    </div>
  );
};
