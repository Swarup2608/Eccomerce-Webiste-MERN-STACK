import type { RequestHandler } from "express";
import categoryModel, { ISubCategory } from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

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
        if (!name) throw new Error(`Sub-category #${index + 1} needs a name.`);
        if (!filterLabel) throw new Error(`Sub-category "${name}" needs a filter label (e.g. Size, Color, Material).`);
        if (filterOptions.length === 0) throw new Error(`Sub-category "${name}" needs at least one filter option.`);
        return { name, filterLabel, filterKey: slugify(filterLabel), filterOptions };
    });
};

// Add Category (admin)
const addCategory: RequestHandler = async (req, res) => {
    try {
        const { name, subCategories, sortOrder } = req.body;
        if (!name || !name.trim()) {
            return res.json({ success: false, message: "Category name is required." });
        }
        const slug = slugify(name);
        const exists = await categoryModel.findOne({ $or: [{ name: name.trim() }, { slug }] });
        if (exists) {
            return res.json({ success: false, message: "A category with that name already exists." });
        }
        const category = new categoryModel({
            name: name.trim(),
            slug,
            subCategories: normalizeSubCategories(subCategories),
            sortOrder: Number(sortOrder) || 0
        });
        await category.save();
        res.json({ success: true, message: "Category added.", category });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Error creating category: " + error.message });
    }
};

// Update Category (admin)
const updateCategory: RequestHandler = async (req, res) => {
    try {
        const { id, name, subCategories, sortOrder, active } = req.body;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.json({ success: false, message: "Category not found." });
        }
        if (name && name.trim() && name.trim() !== category.name) {
            const slug = slugify(name);
            const clash = await categoryModel.findOne({ _id: { $ne: id }, $or: [{ name: name.trim() }, { slug }] });
            if (clash) {
                return res.json({ success: false, message: "A category with that name already exists." });
            }
            category.name = name.trim();
            category.slug = slug;
        }
        if (subCategories !== undefined) category.subCategories = normalizeSubCategories(subCategories);
        if (sortOrder !== undefined) category.sortOrder = Number(sortOrder) || 0;
        if (active !== undefined) category.active = !!active;
        await category.save();
        res.json({ success: true, message: "Category updated.", category });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Error updating category: " + error.message });
    }
};

// Remove Category (admin) — blocked if any product still references it
const removeCategory: RequestHandler = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.json({ success: false, message: "Category not found." });
        }
        const inUse = await productModel.countDocuments({ category: category.name });
        if (inUse > 0) {
            return res.json({ success: false, message: `Cannot remove — ${inUse} product(s) still use this category.` });
        }
        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Category removed." });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Error removing category: " + error.message });
    }
};

// List Categories (public — storefront only sees active categories)
const listCategories: RequestHandler = async (req, res) => {
    try {
        const categories = await categoryModel.find({ active: true }).sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, categories });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Error getting categories: " + error.message });
    }
};

// List Categories for admin (adminAuth — includes inactive categories so they can be re-enabled)
const adminListCategories: RequestHandler = async (req, res) => {
    try {
        const categories = await categoryModel.find({}).sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, categories });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Error getting categories: " + error.message });
    }
};

export { addCategory, updateCategory, removeCategory, listCategories, adminListCategories };
