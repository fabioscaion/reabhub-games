import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (base64: string) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const base64 = await toBase64(file);
      callback(base64);
    } catch (error) {
      console.error("Error converting file to base64:", error);
    }
  }
};

export const processFiles = async (
  files: FileList | null,
  typePrefix: string,
  callback: (base64: string) => void
) => {
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);
  for (const file of fileArray) {
    if (file.type.startsWith(typePrefix)) {
      try {
        const base64 = await toBase64(file);
        callback(base64);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
  }
};
