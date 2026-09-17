import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISubCategory {
    name: string;
    filterKey: string;
    filterLabel: string;
    filterOptions: string[];
}

export interface ICategory extends Document {
    name: string;
    slug: string;
    subCategories: ISubCategory[];
    sortOrder: number;
    active: boolean;
}

// Each sub-category declares its own filter: what the storefront's filter
// sidebar and the admin product form should ask for on products in it
// (e.g. Belts -> "Material" -> [Leather, Woolen, Canvas]; Topwear -> "Size"
// -> [S, M, L, XL, XXL]). filterKey is a stable slug of filterLabel, used
// as the lookup key wherever filters are grouped by type.
const subCategorySchema = new Schema<ISubCategory>({
    name: { type: String, required: true },
    filterKey: { type: String, required: true },
    filterLabel: { type: String, required: true },
    filterOptions: { type: [String], required: true }
}, { _id: false });

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    subCategories: { type: [subCategorySchema], default: [] },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
});

const categoryModel: Model<ICategory> = mongoose.models.category || mongoose.model<ICategory>("category", categorySchema);

export default categoryModel;
