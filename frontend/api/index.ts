import { FileStatus } from "@/types";
import { axiosInstance } from "@/utils";
import axios from "axios";

export const handleFilesUpload = async (
  fileStatus: FileStatus,
  setFileStatus: React.Dispatch<React.SetStateAction<FileStatus>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  email: string
) => {
  const { files } = fileStatus;
  const cancelTokenSource = axios.CancelToken.source();

  setFileStatus({
    ...fileStatus,
    isLoading: true,
    fileState: 2,
    cancelTokenSource,
  });

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("storageClass", "DEEP_ARCHIVE");
  formData.append("email", email);

  try {
    const res = await axiosInstance.post("/upload/upload-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) {
          const progressPercent = Math.round(
            (event.loaded * 100) / event.total
          );
          setProgress(Math.min(progressPercent, 60));
        }
      },
      cancelToken: cancelTokenSource.token,
    });
    if (res.status === 201) {
      setFileStatus((prev) => ({
        ...prev,
        isLoading: false,
        fileState: 3,
      }));
    } else {
      setFileStatus((prev) => ({
        ...prev,
        isLoading: false,
        fileState: 0,
      }));
    }
  } catch (error) {
    console.error("File upload failed:", error);
    setFileStatus((prev) => ({
      ...prev,
      isLoading: false,
      fileState: 0,
    }));
  }
};

export const getArchivedFiles = async (email: string) => {
  const res = await axiosInstance.get(`upload/get-archived-files/${email}`);

  return res;
};
