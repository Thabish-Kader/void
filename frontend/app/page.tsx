"use client";
import { useState, ChangeEvent } from "react";

interface Progress {
  [key: string]: number;
}

export default function Home() {
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
    fileKey: string,
    storageClass: string
  ): Promise<{ signedUrl: string }> => {
    const response = await fetch(
      `http://localhost:8000/upload/presigned-url?email=kadertabish@gmail.com&storageClass=${storageClass}&fileName=${fileKey}`,
      {
        method: "GET",
      }
    );

    const { signedUrl } = await response.json();
    return { signedUrl };
  };

  // Handle the file upload process
  const handleFileUpload = async () => {
    if (!files) return;
    setUploading(true);
    setMessages([]);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // const timestamp = new Date().toISOString();
        const fileKey = `${file.name}`;

        // Get the signed URL for uploading the file to S3
        const { signedUrl } = await generateSignedUrlForUpload(
          fileKey,
          "STANDARD"
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
              // await fetch("http://localhost:8000/upload/upload-metadata", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //   },
              //   body: JSON.stringify({
              //     key: fileKey,
              //     // fileId : uuidv4(),
              //     fileName: file.name,
              //     fileType: file.type,
              //     fileSize: file.size,
              //     storageClass: "STANDARD", // Change as needed
              //   }),
              // });
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
