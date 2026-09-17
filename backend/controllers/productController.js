import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

const parseVariants = (raw) => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Variants must be a list.");
    if (parsed.length === 0) throw new Error("Add at least one variant.");
    return parsed.map((v) => {
        // Accept either the new {value,stock} shape or a bare string
        // (defaults to 0 stock) so older/simpler admin clients don't hard-fail.
        if (typeof v === "string") return { value: v, stock: 0 };
        const value = String(v.value ?? "").trim();
        const stock = Number(v.stock);
        if (!value) throw new Error("Every variant needs a value.");
        if (!Number.isFinite(stock) || stock < 0) throw new Error(`Invalid stock for ${value}.`);
        return { value, stock };
    });
};

// Looks up the category and its sub-category's filter definition, and
// returns it so the caller can denormalize filterKey/filterLabel onto the
// product — server-derived, never trusted from the client.
const resolveSubCategory = async (category, subCategory) => {
    const categoryDoc = await categoryModel.findOne({ name: category });
    if (!categoryDoc) throw new Error(`Unknown category: ${category}`);
    const subCategoryDef = categoryDoc.subCategories.find((sc) => sc.name === subCategory);
    if (!subCategoryDef) {
        throw new Error(`"${subCategory}" is not a sub-category of ${category}.`);
    }
    return subCategoryDef;
};

// Enforces that every variant value is actually one of the sub-category's
// declared filter options, so the storefront's filters can never drift out
// of sync with the products they're meant to describe.
const validateVariantsAgainstFilter = (variants, subCategoryDef) => {
    const allowed = new Set(subCategoryDef.filterOptions);
    const invalid = variants.filter((v) => !allowed.has(v.value));
    if (invalid.length) {
        throw new Error(
            `${invalid.map((v) => v.value).join(', ')} ${invalid.length > 1 ? 'are' : 'is'} not a valid ${subCategoryDef.filterLabel} for ${subCategoryDef.name}. Allowed: ${subCategoryDef.filterOptions.join(', ')}.`
        );
    }
};

const extractImageUrls = async (files) => {
    const image1 = files?.image1 && files.image1[0];
    const image2 = files?.image2 && files.image2[0];
    const image3 = files?.image3 && files.image3[0];
    const image4 = files?.image4 && files.image4[0];
    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    return Promise.all(
        images.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
            return result.secure_url;
        })
    );
};

// Best-effort Cloudinary cleanup — the DB only stores secure_url, not the
// public_id, so this derives it from the URL. Approximate by design; never
// blocks the caller if a delete fails.
const destroyImages = async (urls) => {
    await Promise.all(
        (urls || []).map(async (url) => {
            try {
                const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)\./);
                if (!match) return;
                await cloudinary.uploader.destroy(match[1]);
            } catch (error) {
                console.log("Cloudinary cleanup skipped for " + url + ": " + error.message);
            }
        })
    );
};

// Add Product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, variants, bestSeller } = req.body;

        const subCategoryDef = await resolveSubCategory(category, subCategory);
        const parsedVariants = parseVariants(variants);
        validateVariantsAgainstFilter(parsedVariants, subCategoryDef);
        const imagesUrl = await extractImageUrls(req.files);

        const productData = {
            "name": name,
            "description": description,
            "price": Number(price),
            "image": imagesUrl,
            "category": category,
            "subCategory": subCategory,
            "filterKey": subCategoryDef.filterKey,
            "filterLabel": subCategoryDef.filterLabel,
            "variants": parsedVariants,
            "bestSeller": bestSeller === "true" ? true : false,
            "date": Date.now()
        }

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    }
    catch (err) {
        res.json({ success: false, message: "Error creating Product : " + err.message });
    }
}

// Update Product (admin) — first-ever edit endpoint. Only replaces image
// slots that receive a new file; unspecified slots keep their existing URL.
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, variants, bestSeller } = req.body;
        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: "Product not found." });
        }

        const subCategoryDef = await resolveSubCategory(category, subCategory);
        const parsedVariants = parseVariants(variants);
        validateVariantsAgainstFilter(parsedVariants, subCategoryDef);

        const files = req.files;
        const newImages = [1, 2, 3, 4].map((n) => files?.[`image${n}`] && files[`image${n}`][0]);
        const existingImages = product.image.slice();
        const replacedUrls = [];

        const finalImages = await Promise.all(
            newImages.map(async (file, index) => {
                if (!file) return existingImages[index];
                if (existingImages[index]) replacedUrls.push(existingImages[index]);
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        product.name = name;
        product.description = description;
        product.price = Number(price);
        product.category = category;
        product.subCategory = subCategory;
        product.filterKey = subCategoryDef.filterKey;
        product.filterLabel = subCategoryDef.filterLabel;
        product.variants = parsedVariants;
        product.bestSeller = bestSeller === "true" ? true : false;
        product.image = finalImages.filter(Boolean);

        await product.save();
        if (replacedUrls.length) destroyImages(replacedUrls);

        res.json({ success: true, message: "Product updated." });
    } catch (error) {
        res.json({ success: false, message: "Error updating Product : " + error.message });
    }
}

// List Product — no query params ⇒ unchanged full-catalog behavior (the
// storefront relies on this). Admin's product list opts into pagination by
// passing page/limit explicitly.
const listProduct = async (req, res) => {
    try {
        const { page, limit, search, category, subCategory, sortBy, sortDir, inStock } = req.query;

        if (!page && !limit && !search && !category && !subCategory && !sortBy && !inStock) {
            const products = await productModel.find({});
            return res.json({ success: true, products });
        }

        const filter = {};
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (search) filter.name = new RegExp(String(search).trim(), 'i');
        if (inStock === 'true') filter.variants = { $elemMatch: { stock: { $gt: 0 } } };

        const sort = {};
        if (sortBy) sort[sortBy] = sortDir === 'desc' ? -1 : 1;
        else sort.date = -1;

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));

        const [products, total] = await Promise.all([
            productModel.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum),
            productModel.countDocuments(filter),
        ]);

        res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
    } catch (error) {
        res.json({ success: false, message: "Error getting Products list : " + error.message });
    }
}

// Remove Product
const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findByIdAndDelete(req.body.id);
        if (product) destroyImages(product.image);
        res.json({ success: true, message: "Successfully removed the product!"})

    } catch (error) {
        res.json({ success: false, message: "Error getting Products list : " + error.message });
    }
}

// Single Product Info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product })
    } catch (error) {
        res.json({ success: false, message: "Error getting Products list : " + error.message });
    }
}

export { addProduct, updateProduct, listProduct, removeProduct, singleProduct };
