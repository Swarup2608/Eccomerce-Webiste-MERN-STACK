import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAdmin extends Document {
    email: string;
    password: string;
    role: "admin";
    createdAt: Date;
}

const adminSchema = new Schema<IAdmin>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    createdAt: { type: Date, default: Date.now }
});

const adminModel: Model<IAdmin> = mongoose.models.admin || mongoose.model<IAdmin>("admin", adminSchema);

export default adminModel;
