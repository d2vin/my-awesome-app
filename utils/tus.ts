import { Upload } from 'tus-js-client';
import * as ImagePicker from 'expo-image-picker';

function getFileExtension(uri: string): string {
  const match = /\.([a-zA-Z]+)$/.exec(uri);
  return match ? match[1] : '';
}

function getMimeType(extension: string): string {
  if (extension === 'jpg') return 'image/jpeg';
  return `image/${extension}`;
}

export async function uploadFiles(
  bucketName: string,
  pickerResult: ImagePicker.ImagePickerResult
) {
  if (!pickerResult.assets) {
    return;
  }
  const allUploads = pickerResult.assets.map((file: ImagePicker.ImagePickerAsset) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const extension = getFileExtension(file.uri);
        const blob = await fetch(file.uri).then((res) => res.blob());

        const upload = new Upload(blob, {
          endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'x-upsert': 'true',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: bucketName,
            objectName: file.fileName ?? Date.now().toString(),
            contentType: getMimeType(extension),
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024,
          onError(error) {
            console.log('Upload failed:', error);
            reject(error);
          },
          onProgress(bytesUploaded, bytesTotal) {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            console.log(`${bytesUploaded} / ${bytesTotal} (${percentage}%)`);
          },
          onSuccess() {
            console.log('Uploaded:', upload.options.metadata?.objectName);
            resolve();
          },
        });

        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      } catch (error) {
        reject(error);
      }
    });
  });

  await Promise.allSettled(allUploads);
}
