"use client";
import { axiosInstance } from "@/utils";
import { useState, ChangeEvent } from "react";

interface Progress {
  [key: string]: number;
}

export default function Home() {
  const email = process.env.NEXT_PUBLIC_EMAIL!;
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

  const handleFilesUpload = async () => {
    if (!files) return;
    setUploading(true);
    setMessages([]);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("storageClass", "STANDARD");
      formData.append("email", email);
      const res = await axiosInstance.post(
        "/upload/upload-files/1234sdfsdf99",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            if (event.total) {
              const progress = Math.round((event.loaded / event.total) * 100);
              console.log(`Upload Progress: ${progress}%`);
              setProgress((prev) => ({
                ...prev,
                progress,
              }));
            }
          },
        }
      );
      setMessages((prev) => [...prev, `✅ ${res.data.message}`]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        `❌ ${JSON.stringify(error)} upload failed!`,
      ]);
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
        onClick={handleFilesUpload}
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
