"use client";
import React from "react";
const files = [
  {
    uploadedAt: "2025-04-08T08:20:44.263Z",
    storageClass: "STANDARD",
    fileId: "4dff6eb5-2485-4aa8-b28e-c98819d7abf0",
    signedUrl:
      "https://user-1234sdfsdf99.s3.ap-south-1.amazonaws.com/kadertabish%40gmail.com/files-2025-04-08T08%3A20%3A44.263Z-13334683_360_640_30fps.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYUQGSU7S5GJW47EO%2F20250408%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250408T082301Z&X-Amz-Expires=3600&X-Amz-Signature=5861acb27379daf1529b917037063757247035e445df94d50e75d596ef43eacb&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    restorStatus: "AVAILABLE",
  },
];
export const RestorationComplete = (files) => {
  const downloadAllFiles = async (files) => {
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
          onClick={() => downloadAllFiles(files)}
          className="modal-btn text-primary-accent p-2 rounded-2xl bg-btn-primary hover:bg-primary-accent hover:text-secondary w-full"
        >
          Download
        </button>
      </div>
    </>
  );
};
