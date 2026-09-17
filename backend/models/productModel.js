import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    value: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    // filterKey/filterLabel are denormalized from the category's sub-category
    // definition at save time (server-derived, never client-trusted) so the
    // storefront can group/label this product's variants without a join.
    filterKey: { type: String, required: true },
    filterLabel: { type: String, required: true },
    variants: { type: [variantSchema], required: true },
    bestSeller: { type: Boolean },
    date: { type: Number, required: true }
})

const productModel = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel;
