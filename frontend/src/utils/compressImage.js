import Compressor from "compressorjs";

export const compressImage = (file) =>
  new Promise((resolve) => {
    if (!file || !file.type?.startsWith("image/")) return resolve(file);
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
      convertSize: 500000,
      success(result) {
        const compressed = new File([result], file.name, {
          type: result.type,
          lastModified: Date.now(),
        });
        resolve(compressed);
      },
      error(err) {
        console.warn("Compress error, fallback to original:", err);
        resolve(file);
      },
    });
  });

export const compressImages = (files) => Promise.all(Array.from(files).map(compressImage));

