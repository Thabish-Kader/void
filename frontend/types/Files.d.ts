export type FileStatus = {
  files: File[];
  fileState: number;
  isLoading: boolean;
  cancelTokenSource: axios.CancelTokenSource | null;
};

export type RestoredFile = {
  uploadedAt: string;
  storageClass: string;
  fileId: string;
  signedUrl: string;
  restorStatus: string;
};
