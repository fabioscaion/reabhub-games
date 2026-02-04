import { Storage } from '@google-cloud/storage';

if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY || !process.env.GCS_BUCKET_NAME) {
  console.warn('GCS environment variables are missing. Uploads will fail.');
}

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
  
  // Use a more robust way to save the file
  await new Promise<void>((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
      },
      resumable: false,
    });

    stream.on('error', (err) => {
      console.error('GCS Upload Stream Error:', err);
      reject(err);
    });

    stream.on('finish', () => {
      resolve();
    });

    stream.end(buffer);
  });

  // Return the public URL
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

export async function deleteFromGCS(filename: string): Promise<void> {
  if (!bucketName) return;
  const file = bucket.file(filename);
  await file.delete().catch(err => {
    console.error('Error deleting from GCS:', err);
  });
}
