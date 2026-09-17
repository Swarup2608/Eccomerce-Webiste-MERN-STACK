import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async (): Promise<boolean> => {
    try {
        // Check if required environment variables are present
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            throw new Error('Missing Cloudinary environment variables (CLOUDINARY_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_SECRET_KEY)');
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
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
