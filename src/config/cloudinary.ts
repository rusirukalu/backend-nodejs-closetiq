// src/config/cloudinary.ts - Fixed Cloudinary Configuration
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

class CloudinaryService {
  // Expose the uploader property
  public get uploader() {
    return cloudinary.uploader;
  }

  // Expose the url method
  public url(publicId: string, options?: any) {
    return cloudinary.url(publicId, options);
  }

  /**
   * Upload image buffer to Cloudinary
   */
  async uploadImage(
    buffer: Buffer, 
    folder: string = 'fashion-ai',
    options: UploadApiOptions = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    buffers: Buffer[],
    folder: string = 'fashion-ai'
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = buffers.map(buffer => 
      this.uploadImage(buffer, folder)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Generate optimized image URL
   */
  getOptimizedUrl(
    publicId: string,
    transformations: any = {}
  ): string {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...transformations,
    });
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(publicId: string, width: number = 150, height: number = 150): string {
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      crop: 'fill',
    });
  }
}

export default new CloudinaryService();
export { cloudinary };
