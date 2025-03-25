"use client";
import { axiosInstance } from "@/utils";
import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";

interface Progress {
  [key: string]: number;
}

export default function Home() {
  const email = process.env.NEXT_PUBLIC_EMAIL!;
  const S3_BUCKET_PREFIX = process.env.NEXT_PUBLIC_S3_BUCKET_PREFIX!;
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<Progress>({});
  const [messages, setMessages] = useState<string[]>([]);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  // Function to generate the signed URL (this would be an API call to your backend)
  const generateSignedUrlForUpload = async (
    fileName: string,
    storageClass: string,
    email: string
  ): Promise<{ signedUrl: string }> => {
    const res = await axiosInstance.get<{ signedUrl: string; fileKey: string }>(
      "/upload/presigned-url",
      {
        params: {
          email,
          storageClass,
          fileName,
        },
      }
    );

    // Destructure signedUrl from res.data
    const { signedUrl } = res.data;

    return { signedUrl };
  };

  const handleFileUpload = async () => {
    if (!files) return;
    setUploading(true);
    setMessages([]);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // const timestamp = new Date().toISOString();

        const fileKey = `${S3_BUCKET_PREFIX}/${email}/${file.name}`;
        // Get the signed URL for uploading the file to S3
        const { signedUrl } = await generateSignedUrlForUpload(
          file.name,
          "STANDARD",
          email
        );

        // Upload file using the signed URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress((prev) => ({
                ...prev,
                [file.name]: Math.round((event.loaded / event.total) * 100),
              }));
            }
          };

          xhr.onload = async () => {
            if (xhr.status === 200) {
              setMessages((prev) => [
                ...prev,
                `✅ ${file.name} uploaded successfully!`,
              ]);
              // TODO: Call API to update metadata
              await axiosInstance.post("/upload/upload-metadata", {
                email,
                fileId: uuidv4(),
                fileName: file.name,
                s3Url: fileKey,
                fileSize: file.size,
                storageClass: "STANDARD",
                uploadTimestamp: new Date().toISOString(),
              });

              resolve();
            } else {
              reject(new Error(`Upload failed for ${file.name}`));
            }
          };

          xhr.onerror = () =>
            reject(new Error(`Upload error for ${file.name}`));

          xhr.send(file);
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        `❌ Error uploading: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
      setUploading(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="bg-blue-500 p-4 rounded-xl"
      />
      <button
        onClick={handleFileUpload}
        disabled={uploading}
        className="bg-blue-500 p-4 rounded-xl"
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>

      <div className="mt-4">
        {messages.map((message, index) => (
          <p key={index} className="text-sm">
            {message}
          </p>
        ))}
      </div>

      <div className="mt-4">
        {Object.keys(progress).map((fileName) => (
          <div key={fileName} className="mt-2">
            <p>
              {fileName}: {progress[fileName]}%
            </p>
            <div
              className="bg-gray-200"
              style={{
                width: `${progress[fileName]}%`,
                height: "10px",
                backgroundColor: "#4caf50",
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
