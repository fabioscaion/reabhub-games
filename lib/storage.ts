import { Storage } from '@google-cloud/storage';

if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY || !process.env.GCS_BUCKET_NAME) {
  console.warn('GCS environment variables are missing. Uploads will fail.');
}

const privateKey = process.env.GCS_PRIVATE_KEY 
  ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
  : undefined;

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: privateKey,
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || '';
const bucket = storage.bucket(bucketName);

export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME is not defined');
  }

  const file = bucket.file(filename);
  
  return new Promise((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
      },
      resumable: false, // Disabling resumable for simple buffer uploads to avoid stream issues
    });

    stream.on('error', (err) => {
      console.error('GCS Upload Stream Error:', err);
      reject(err);
    });

    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucketName}/${filename}`);
    });

    // Handle stream destruction
    if (stream.destroyed) {
      reject(new Error('Stream was destroyed before write could start'));
      return;
    }

    stream.end(buffer);
  });
}

export async function deleteFromGCS(filename: string): Promise<void> {
  if (!bucketName) return;
  const file = bucket.file(filename);
  await file.delete().catch(err => {
    console.error('Error deleting from GCS:', err);
  });
}
