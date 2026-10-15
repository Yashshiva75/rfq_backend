/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Cloudinary Upload Library
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import config from "../config/constant";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.API_KEY,
  api_secret: config.cloudinary.API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: {
    folder?: string;
    originalName?: string;
    resourceType?: "auto" | "raw" | "image";
  } = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    // For PDF and XLSX, resource_type: "raw" preserves native document formats
    const resourceType = options.resourceType || "raw";

    const sanitizedName = options.originalName
      ? options.originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : `file_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "mini_rfq",
        resource_type: resourceType,
        public_id: `${sanitizedName}_${Date.now()}`,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No response received from Cloudinary"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "raw" | "image" | "auto" = "raw"
) => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

export default cloudinary;
