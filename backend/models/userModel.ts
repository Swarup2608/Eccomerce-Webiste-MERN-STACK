import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    cartData: Record<string, Record<string, number>>;
    isBlocked: boolean;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    cartData: { type: Object, default: {} },
    isBlocked: { type: Boolean, default: false }
}, { minimize: false });

const userModel: Model<IUser> = mongoose.models.user || mongoose.model<IUser>("user", userSchema);

export default userModel;
