export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;
    video.muted = true;
    video.crossOrigin = "anonymous";

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 150;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.remove();
      resolve(canvas.toDataURL("image/png"));
    };
  });
};
