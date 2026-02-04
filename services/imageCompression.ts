export type CompressImageOptions = {
  maxBytes: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
  outputType?: 'image/jpeg' | 'image/webp';
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });

const dataUrlToImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = dataUrl;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('canvas_to_blob_failed'));
        else resolve(blob);
      },
      type,
      quality
    );
  });

const pickTargetDimensions = (
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
) => {
  const mw = maxWidth ?? width;
  const mh = maxHeight ?? height;

  const scale = Math.min(mw / width, mh / height, 1);
  return {
    targetWidth: Math.max(1, Math.round(width * scale)),
    targetHeight: Math.max(1, Math.round(height * scale))
  };
};

export const compressImageFile = async (
  file: File,
  opts: CompressImageOptions
): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  const {
    maxBytes,
    maxWidth = 1600,
    maxHeight = 1600,
    initialQuality = 0.82,
    minQuality = 0.45,
    qualityStep = 0.07,
    outputType = 'image/webp'
  } = opts;

  // If already small enough, keep original.
  if (file.size <= maxBytes) return file;

  const dataUrl = await fileToDataUrl(file);
  const img = await dataUrlToImage(dataUrl);

  const { targetWidth, targetHeight } = pickTargetDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White background to avoid transparent PNGs turning black in JPEG/webp on some viewers.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Try decreasing quality until we hit the size target.
  let quality = initialQuality;
  let bestBlob: Blob | null = null;

  while (quality >= minQuality) {
    const blob = await canvasToBlob(canvas, outputType, quality);
    bestBlob = blob;
    if (blob.size <= maxBytes) break;
    quality -= qualityStep;
  }

  if (!bestBlob) return file;

  const ext = outputType === 'image/jpeg' ? 'jpg' : 'webp';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return new File([bestBlob], `${baseName}.${ext}`, { type: outputType });
};

export const compressImages = async (
  files: File[],
  opts: CompressImageOptions
): Promise<File[]> => {
  const out: File[] = [];
  for (const f of files) {
    out.push(await compressImageFile(f, opts));
  }
  return out;
};
