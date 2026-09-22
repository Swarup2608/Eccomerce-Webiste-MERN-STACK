import type { RequestHandler } from "express";
import categoryModel, { ISubCategory } from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const slugify = (name: string): string =>
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Normalizes admin-submitted sub-categories into the stored shape. filterKey
// is always server-derived from filterLabel (never trusted from the
// client) so two sub-categories that mean the same filter (e.g. "Material"
// on Belts and on Jewellery) always share one key, and admin typos in
// casing/spacing can't fork it into two keys.
const normalizeSubCategories = (subCategories: any): ISubCategory[] => {
    if (!Array.isArray(subCategories)) return [];
    return subCategories.map((sc: any, index: number) => {
        const name = String(sc?.name ?? "").trim();
        const filterLabel = String(sc?.filterLabel ?? "").trim();
        const filterOptions = Array.isArray(sc?.filterOptions)
            ? sc.filterOptions.map((o: unknown) => String(o).trim()).filter(Boolean)
            : [];
        if (!name) throw new AppError(400, `Sub-category #${index + 1} needs a name.`);
        if (!filterLabel) throw new AppError(400, `Sub-category "${name}" needs a filter label (e.g. Size, Color, Material).`);
        if (filterOptions.length === 0) throw new AppError(400, `Sub-category "${name}" needs at least one filter option.`);
        return { name, filterLabel, filterKey: slugify(filterLabel), filterOptions };
    });
};

// Add Category (admin)
const addCategory: RequestHandler = asyncHandler(async (req, res) => {
    const { name, subCategories, sortOrder } = req.body;
    if (!name || !name.trim()) {
        throw new AppError(400, "Category name is required.");
    }
    const slug = slugify(name);
    const exists = await categoryModel.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (exists) {
        throw new AppError(409, "A category with that name already exists.");
    }
    const category = new categoryModel({
        name: name.trim(),
        slug,
        subCategories: normalizeSubCategories(subCategories),
        sortOrder: Number(sortOrder) || 0
    });
    await category.save();
    res.json({ success: true, message: "Category added.", category });
});

// Update Category (admin)
const updateCategory: RequestHandler = asyncHandler(async (req, res) => {
    const { id, name, subCategories, sortOrder, active } = req.body;
    const category = await categoryModel.findById(id);
    if (!category) {
        throw new AppError(404, "Category not found.");
    }
    if (name && name.trim() && name.trim() !== category.name) {
        const slug = slugify(name);
        const clash = await categoryModel.findOne({ _id: { $ne: id }, $or: [{ name: name.trim() }, { slug }] });
        if (clash) {
            throw new AppError(409, "A category with that name already exists.");
        }
        category.name = name.trim();
        category.slug = slug;
    }
    if (subCategories !== undefined) category.subCategories = normalizeSubCategories(subCategories);
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder) || 0;
    if (active !== undefined) category.active = !!active;
    await category.save();
    res.json({ success: true, message: "Category updated.", category });
});

// Remove Category (admin) — blocked if any product still references it
const removeCategory: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = req.body;
    const category = await categoryModel.findById(id);
    if (!category) {
        throw new AppError(404, "Category not found.");
    }
    const inUse = await productModel.countDocuments({ category: category.name });
    if (inUse > 0) {
        throw new AppError(409, `Cannot remove — ${inUse} product(s) still use this category.`);
    }
    await categoryModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Category removed." });
});

// List Categories (public — storefront only sees active categories)
const listCategories: RequestHandler = asyncHandler(async (req, res) => {
    const categories = await categoryModel.find({ active: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
});

// List Categories for admin (adminAuth — includes inactive categories so they can be re-enabled)
const adminListCategories: RequestHandler = asyncHandler(async (req, res) => {
    const categories = await categoryModel.find({}).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
});

export { addCategory, updateCategory, removeCategory, listCategories, adminListCategories };
