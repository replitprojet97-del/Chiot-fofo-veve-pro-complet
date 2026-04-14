import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageBuffer(
  buffer: Buffer,
  originalName: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const publicId = `aussie-farm/${Date.now()}-${originalName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          transformation: [
            {
              width: 900,
              height: 675,
              crop: "fill",
              gravity: "auto",
              quality: "auto:good",
              fetch_format: "auto",
            },
          ],
        },
        (err, result) => {
          if (err || !result) reject(err ?? new Error("Upload failed"));
          else resolve(result);
        },
      )
      .end(buffer);
  });
}

export { cloudinary };
