/**
 * Client-side image compressor utility
 * Resizes and compresses uploaded images so they don't exceed localStorage or Firestore limits.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, fallback to standard FileReader
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // Draw image onto canvas with smooth rendering
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-efficiency JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
