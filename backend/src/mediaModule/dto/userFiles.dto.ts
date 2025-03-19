export class UserFileResponseDto {
  uploadedAt: string;
  storageClass: string;
  fileType: string;
  fileId: string;
  signedUrl: string;
}

export class ArchivedFilesResponseDto extends UserFileResponseDto {
  restoreStatus?: string;
}
