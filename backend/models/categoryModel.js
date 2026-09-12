import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    subCategories: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
});

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
