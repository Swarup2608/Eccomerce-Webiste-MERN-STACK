import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    createdAt: { type: Date, default: Date.now }
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;
