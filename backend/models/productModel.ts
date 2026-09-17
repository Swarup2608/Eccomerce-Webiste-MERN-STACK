import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVariant {
    value: string;
    stock: number;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    image: string[];
    category: string;
    subCategory: string;
    // filterKey/filterLabel are denormalized from the category's sub-category
    // definition at save time (server-derived, never client-trusted) so the
    // storefront can group/label this product's variants without a join.
    filterKey: string;
    filterLabel: string;
    variants: IVariant[];
    bestSeller?: boolean;
    date: number;
}

const variantSchema = new Schema<IVariant>({
    value: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: [String], required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    filterKey: { type: String, required: true },
    filterLabel: { type: String, required: true },
    variants: { type: [variantSchema], required: true },
    bestSeller: { type: Boolean },
    date: { type: Number, required: true }
});

const productModel: Model<IProduct> = mongoose.models.product || mongoose.model<IProduct>("product", productSchema);

export default productModel;
