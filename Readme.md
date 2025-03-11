# Void

Cold storage solution for users to archive old pictures/videos in AWS Glacier and retrieve them on demand.

### Steps to achive

1. Upload files to Amazon S3 first, then use S3 Lifecycle Rules to transition them to Glacier for archival.
2. Store metadata (URLs, retrieval status, and archive details) in DynamoDB for fast lookups.
3. Use Amazon S3 Glacier's retrieval options (Expedited, Standard, or Bulk) when users need to download files.

### DynamoDB Schema for Glacier Archival

| Partition Key (UserID) | Sort Key (FileID) | S3 Glacier URL             | Storage Class | Upload Timestamp     | File Type | Retrieval Status |
| ---------------------- | ----------------- | -------------------------- | ------------- | -------------------- | --------- | ---------------- |
| user_123               | file_001          | s3://your-bucket/file1.mp4 | GLACIER       | 2025-03-11T12:00:00Z | video     | archived         |
| user_123               | file_002          | s3://your-bucket/file2.jpg | GLACIER       | 2025-03-11T12:05:00Z | photo     | retrieving       |
| user_456               | file_003          | s3://your-bucket/file3.mp4 | GLACIER       | 2025-03-11T13:00:00Z | video     | available        |

### Solution Architecture

Amazon S3 + Glacier Storage → Files are stored in S3 and transitioned to Glacier for archiving.
DynamoDB for Metadata → Tracks file locations, retrieval status, timestamps, and users.
Lambda Functions → Automate file archival & retrieval process.
API Gateway → Users interact via a web or mobile app to upload & request retrievals.
SNS / WebSocket Notifications → Notify users when files are ready for download.

### Lifecycle Rule: Move Files to Glacier

```json
{
  "Rules": [
    {
      "ID": "MoveToGlacier",
      "Status": "Enabled",
      "Filter": {},
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### Challenges

1. Bulk Upload
