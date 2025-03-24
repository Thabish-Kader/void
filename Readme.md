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

# AWS Configuration Steps

# 1. IAM - Provide access to DynamoDb and S3

# 2. Create DynamoDB Tables & Create Bucket for S3

# 3. SES

## Verify an Email Address in Amazon SES

### 1. Go to the SES Console:

- Navigate to the [Amazon SES Console](https://console.aws.amazon.com/ses/).

### 2. Verify Your Email Address:

- In the left-hand menu, under **Identity Management**, select **Verified identities**.
- Click **Verify a New Email Address**.
- Enter the personal email address you want to use (e.g., `yourname@example.com`).
- Click **Verify This Email Address**.
- Note: In sanbox mode you need to have to verified email address for sender and reciever. If you go to production mode this is not necessary.

### 3. Check Your Email Inbox:

- SES will send a verification email to the address you provided.
- Open the email and click on the verification link to confirm that you own the email address.
- Once your email address is verified, you will be able to send emails from that address via SES.

## Important Considerations:

### Sandbox Mode:

- If your SES account is in the sandbox environment, you'll only be able to send emails to verified email addresses.
- Once you request production access, you'll be able to send emails to unverified addresses as well.

### Production Access:

- If you need to send emails to non-verified addresses, you’ll need to request production access.
- This can be done in the SES Console under **Sending Statistics**.

# 4. Lambda

## Steps to Configure IAM Permissions for Lambda

### 1. Create an IAM Role for Lambda (if not already created)

If you don't already have a role for your Lambda, you'll need to create one:

#### Go to the IAM Console:

- Navigate to the [AWS IAM Console](https://console.aws.amazon.com/iam/).

#### Create a New Role:

- In the left sidebar, click on **Roles**.
- Click **Create role**.

#### Select Lambda as Trusted Entity:

- In the **Select trusted entity** section, choose **Lambda**.
- Click **Next: Permissions**.

#### Attach Policies for SES Permissions:

- On the **Attach permissions policies** screen, search for the **AmazonSESFullAccess**,**AmazonS3ReadOnlyAccess**, **AWSLambdaBasicExecutionRole** policy (or create a custom policy with the permissions we discussed earlier).
- You can also add any other policies you might need for other AWS services (e.g., S3, SNS).
- Click **Next: Tags**.

#### Review and Create the Role:

- Name the role (e.g., `LambdaSESRole`) and click **Create role**.

### 2. Assign the IAM Role to Your Lambda Function

Once your IAM role is created, you need to assign it to your Lambda function:

#### Go to the Lambda Console:

- Navigate to the [AWS Lambda Console](https://console.aws.amazon.com/lambda/).

#### Create/Select Your Lambda Function:

- Click on the name of the Lambda function you want to configure or Press Create Function.
- Give name for Function
- Toggle change default execution role
- Select `Use an exisiting role`
- Select `LambdaSESRole`
- Create Function
- In the editor under code paste the following

## Code Example

<!-- NOTE: Replace the region to the one you have configured in AWS and use an email address that is verified by SES -->

```javascript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize the SES client with a sample region
const sesClient = new SESClient({ region: "us-east-1" }); // replace with your region

export const handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    if (
      !event.Records ||
      event.Records[0].eventName !== "ObjectRestore:Completed"
    ) {
      console.log("Not an S3 restore completion event. Skipping.");
      return;
    }

    let s3ObjectKey = event.Records[0].s3.object.key;
    s3ObjectKey = decodeURIComponent(s3ObjectKey); // Decode the key
    console.log("Decoded S3 Object Key:", s3ObjectKey);

    const userEmail = s3ObjectKey.split("/")[0];
    console.log("Extracted user email:", userEmail);

    if (!userEmail.includes("@")) {
      console.error("Invalid email extracted:", userEmail);
      return;
    }

    const params = {
      Destination: { ToAddresses: [userEmail] },
      Message: {
        Body: { Text: { Data: "Your file restoration is complete!" } },
        Subject: { Data: "S3 File Restoration Complete" },
      },
      Source: "no-reply@example.com", // Replace with a verified SES email
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log("Email sent successfully to:", userEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
```

```json
// sample event json for ObjectRestore:Completed
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "awsRegion": "us-east-1",
      "eventTime": "2025-03-23T13:40:53.635Z",
      "eventName": "ObjectRestore:Completed",
      "userIdentity": {
        "principalId": "AmazonCustomer:EXAMPLE12345"
      },
      "requestParameters": {
        "sourceIPAddress": "s3.amazonaws.com"
      },
      "responseElements": {
        "x-amz-request-id": "EXAMPLEREQUEST123",
        "x-amz-id-2": "EXAMPLEID2+RANDOMSTRING=="
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "RestorationEvent",
        "bucket": {
          "name": "sample-bucket-name",
          "ownerIdentity": {
            "principalId": "EXAMPLEOWNERID"
          },
          "arn": "arn:aws:s3:::sample-bucket-name"
        },
        "object": {
          "key": "user@example.com/compressed-files-2025-03-23T08:24:58.938Z.zip",
          "size": 448694,
          "eTag": "EXAMPLEETAG123456",
          "sequencer": "EXAMPLESEQ123456"
        }
      },
      "glacierEventData": {
        "restoreEventData": {
          "lifecycleRestorationExpiryTime": "2025-03-31T00:00:00.000Z",
          "lifecycleRestoreStorageClass": "GLACIER"
        }
      }
    }
  ]
}
```

- Deploy the Code & Test it out
- Check the output in the editor for errors or for a success

### Resources

- [Restoring an archived object](https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects.html)
