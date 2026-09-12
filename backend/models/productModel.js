import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: [sizeSchema], required: true },
    bestSeller: { type: Boolean },
    date: { type: Number, required: true }
})

const productModel = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel;
