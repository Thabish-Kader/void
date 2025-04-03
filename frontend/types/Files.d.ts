export type FileStatus = {
  files: File[];
  fileState: number;
  isLoading: boolean;
  cancelTokenSource: axios.CancelTokenSource | null;
};
