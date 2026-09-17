import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {

    mongoose.connection.on('connected', () => {
        console.log("DB Connected!!!");
    })
    await mongoose.connect(process.env.MONGODB_URI as string);

}

export default connectDB;
