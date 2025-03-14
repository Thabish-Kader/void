# Void

Cold storage solution for users to archive old pictures/videos in AWS Glacier and retrieve them on demand.

# Cloud Storage Cost Breakdown

The following provides a cost breakdown for various cloud storage services based on storing 100 GB of data per month/year.

## Cost Breakdown

| Service                                 | Storage Cost (Monthly) | Retrieval Cost (If Needed) | Annual Storage Cost | Retrieval/Transfer Costs (Annual) | **Yearly Cost**    |
| --------------------------------------- | ---------------------- | -------------------------- | ------------------- | --------------------------------- | ------------------ |
| **Google Cloud (Standard)**             | $2.00                  | N/A                        | $24.00              | Variable                          | $24.00             |
| **iCloud (200 GB Plan)**                | $2.99                  | N/A                        | $35.88              | Variable                          | $35.88             |
| **Amazon S3 (Standard)**                | $2.30                  | N/A                        | $27.60              | Variable                          | $27.60             |
| **Amazon Glacier (Flexible Retrieval)** | $0.40                  | $0.03 per GB retrieval     | $4.80               | Variable (Depending on retrieval) | $4.80 + Retrieval  |
| **Amazon Glacier (Instant Retrieval)**  | $1.20                  | $0.03 per GB retrieval     | $14.40              | Variable (Depending on retrieval) | $14.40 + Retrieval |
| **Amazon Glacier (Deep Archive)**       | $0.099                 | $0.02 per GB retrieval     | $1.20               | Variable (Depending on retrieval) | $1.20 + Retrieval  |

## Notes:

- **Google Cloud**: Pricing for multi-regional standard storage. Data transfer costs may vary depending on the region.
- **iCloud**: Consumer-oriented storage service, with no retrieval costs unless you exceed the plan's limit.
- **Amazon S3**: Standard storage with higher cost for frequent access, but offers more flexibility in storage and retrieval.
- **Amazon Glacier**: Archival storage designed for long-term data retention with multiple retrieval options:
  - **Flexible Retrieval**: Standard retrieval time (hours).
  - **Instant Retrieval**: Immediate retrieval but higher storage costs.
  - **Deep Archive**: Cheapest storage with the slowest retrieval time (up to 12 hours).

## Additional Considerations:

- **Retrieval/Transfer Costs**: These vary based on the amount of data retrieved and the region where the data is accessed. Be sure to check your usage and account for retrieval/transfer costs if you anticipate needing to access your data.

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

### Todo

- [x] Configure Aws for DynamoDB, S3 Glacier
- [x] Service for DynamoDb
- [x] Service for S3
- [ ] Upload pic/video to s3
- [ ] Download pic/video from s3
- [ ] Configure S3 Glacier
- [ ] S3 Glacier Retrieval logic
- [ ] Frontend UI
- [ ] Bulk Upload
- [ ] Auth
