/**
 * Compresses an image file on the client canvas to WebP format (~30KB-50KB).
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  quality = 0.70
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      let width = image.width;
      let height = image.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas context unavailable'));
      }

      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to convert image to WebP'));
          }

          const compressedFile = new File(
            [blob],
            `${file.name.replace(/\.[^/.]+$/, '')}.webp`,
            {
              type: 'image/webp',
              lastModified: Date.now(),
            }
          );
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}
