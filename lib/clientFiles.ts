import type { DealDocument } from "./types";

export const ACCEPTED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

export const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.gif,.webp";

export function isAccepted(file: File): boolean {
  return ACCEPTED_MIME.includes(file.type);
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Read a browser File into a base64 DealDocument (no data: prefix). */
export function fileToDealDocument(file: File): Promise<DealDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => {
      const result = reader.result as string;
      // result is a data URL: "data:<mime>;base64,<data>"
      const comma = result.indexOf(",");
      const data = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({
        name: file.name,
        mediaType: file.type,
        data,
      });
    };
    reader.readAsDataURL(file);
  });
}
