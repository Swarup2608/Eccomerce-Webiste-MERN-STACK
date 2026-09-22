import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async (): Promise<void> => {

    mongoose.connection.on('connected', () => {
        console.log("DB Connected!!!");
    })
    await mongoose.connect(env.MONGODB_URI);

}

export default connectDB;
