import { axiosInstance } from "@/utils";

export const handleFilesUpload = async (
  files: File[],
  email: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!files) return;
  setIsLoading(true);
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
      }
    );

    return res;
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
