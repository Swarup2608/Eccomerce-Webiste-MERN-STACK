import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "express";
import productModel, { IVariant } from "../models/productModel.js";
import categoryModel, { ISubCategory } from "../models/categoryModel.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const parseVariants = (raw: string): IVariant[] => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new AppError(400, "Variants must be a list.");
    if (parsed.length === 0) throw new AppError(400, "Add at least one variant.");
    return parsed.map((v: any) => {
        // Accept either the new {value,stock} shape or a bare string
        // (defaults to 0 stock) so older/simpler admin clients don't hard-fail.
        if (typeof v === "string") return { value: v, stock: 0 };
        const value = String(v.value ?? "").trim();
        const stock = Number(v.stock);
        if (!value) throw new AppError(400, "Every variant needs a value.");
        if (!Number.isFinite(stock) || stock < 0) throw new AppError(400, `Invalid stock for ${value}.`);
        return { value, stock };
    });
};

// Looks up the category and its sub-category's filter definition, and
// returns it so the caller can denormalize filterKey/filterLabel onto the
// product — server-derived, never trusted from the client.
const resolveSubCategory = async (category: string, subCategory: string): Promise<ISubCategory> => {
    const categoryDoc = await categoryModel.findOne({ name: category });
    if (!categoryDoc) throw new AppError(400, `Unknown category: ${category}`);
    const subCategoryDef = categoryDoc.subCategories.find((sc) => sc.name === subCategory);
    if (!subCategoryDef) {
        throw new AppError(400, `"${subCategory}" is not a sub-category of ${category}.`);
    }
    return subCategoryDef;
};

// Enforces that every variant value is actually one of the sub-category's
// declared filter options, so the storefront's filters can never drift out
// of sync with the products they're meant to describe.
const validateVariantsAgainstFilter = (variants: IVariant[], subCategoryDef: ISubCategory): void => {
    const allowed = new Set(subCategoryDef.filterOptions);
    const invalid = variants.filter((v) => !allowed.has(v.value));
    if (invalid.length) {
        throw new AppError(
            400,
            `${invalid.map((v) => v.value).join(', ')} ${invalid.length > 1 ? 'are' : 'is'} not a valid ${subCategoryDef.filterLabel} for ${subCategoryDef.name}. Allowed: ${subCategoryDef.filterOptions.join(', ')}.`
        );
    }
};

type UploadedFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

const extractImageUrls = async (files: UploadedFiles): Promise<string[]> => {
    const image1 = files?.image1 && files.image1[0];
    const image2 = files?.image2 && files.image2[0];
    const image3 = files?.image3 && files.image3[0];
    const image4 = files?.image4 && files.image4[0];
    const images = [image1, image2, image3, image4].filter((item): item is Express.Multer.File => item !== undefined);

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
const destroyImages = async (urls: string[] | undefined): Promise<void> => {
    await Promise.all(
        (urls || []).map(async (url) => {
            try {
                const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)\./);
                if (!match) return;
                await cloudinary.uploader.destroy(match[1]);
            } catch (error: any) {
                console.log("Cloudinary cleanup skipped for " + url + ": " + error.message);
            }
        })
    );
};

// Add Product
const addProduct: RequestHandler = asyncHandler(async (req, res) => {
    const { name, description, price, category, subCategory, variants, bestSeller } = req.body;

    const subCategoryDef = await resolveSubCategory(category, subCategory);
    const parsedVariants = parseVariants(variants);
    validateVariantsAgainstFilter(parsedVariants, subCategoryDef);
    const imagesUrl = await extractImageUrls(req.files as UploadedFiles);

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
});

// Update Product (admin) — first-ever edit endpoint. Only replaces image
// slots that receive a new file; unspecified slots keep their existing URL.
const updateProduct: RequestHandler = asyncHandler(async (req, res) => {
    const { id, name, description, price, category, subCategory, variants, bestSeller } = req.body;
    const product = await productModel.findById(id);
    if (!product) {
        throw new AppError(404, "Product not found.");
    }

    const subCategoryDef = await resolveSubCategory(category, subCategory);
    const parsedVariants = parseVariants(variants);
    validateVariantsAgainstFilter(parsedVariants, subCategoryDef);

    const files = req.files as UploadedFiles;
    const newImages = [1, 2, 3, 4].map((n) => files?.[`image${n}`] && files[`image${n}`][0]);
    const existingImages = product.image.slice();
    const replacedUrls: string[] = [];

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
    product.image = finalImages.filter(Boolean) as string[];

    await product.save();
    if (replacedUrls.length) destroyImages(replacedUrls);

    res.json({ success: true, message: "Product updated." });
});

// List Product — no query params ⇒ unchanged full-catalog behavior (the
// storefront relies on this). Admin's product list opts into pagination by
// passing page/limit explicitly.
const listProduct: RequestHandler = asyncHandler(async (req, res) => {
    const { page, limit, search, category, subCategory, sortBy, sortDir, inStock } = req.query;

    if (!page && !limit && !search && !category && !subCategory && !sortBy && !inStock) {
        const products = await productModel.find({});
        return res.json({ success: true, products });
    }

    const filter: Record<string, any> = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (search) filter.name = new RegExp(String(search).trim(), 'i');
    if (inStock === 'true') filter.variants = { $elemMatch: { stock: { $gt: 0 } } };

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[String(sortBy)] = sortDir === 'desc' ? -1 : 1;
    else sort.date = -1;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));

    const [products, total] = await Promise.all([
        productModel.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum),
        productModel.countDocuments(filter),
    ]);

    res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

// Remove Product
const removeProduct: RequestHandler = asyncHandler(async (req, res) => {
    const product = await productModel.findByIdAndDelete(req.body.id);
    if (product) destroyImages(product.image);
    res.json({ success: true, message: "Successfully removed the product!" });
});

// Single Product Info
const singleProduct: RequestHandler = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
});

export { addProduct, updateProduct, listProduct, removeProduct, singleProduct };
