import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const connectCloudinary = async (): Promise<boolean> => {
    try {
        // Check if required environment variables are present
        if (!env.CLOUDINARY_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_SECRET_KEY) {
            throw new Error('Missing Cloudinary environment variables (CLOUDINARY_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_SECRET_KEY)');
        }

        cloudinary.config({
            cloud_name: env.CLOUDINARY_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_SECRET_KEY
        });

        // Verify connection by pinging Cloudinary API
        await cloudinary.api.ping();
        console.log('✅ Cloudinary connected successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Cloudinary connection failed:', error.message);
        throw error;
    }
}

export default connectCloudinary;
