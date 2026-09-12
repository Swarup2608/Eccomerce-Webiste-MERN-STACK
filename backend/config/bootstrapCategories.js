import categoryModel from "../models/categoryModel.js";

const DEFAULT_CATEGORIES = [
    { name: "Men", subCategories: ["Topwear", "Bottomwear", "Winterwear"], sortOrder: 1 },
    { name: "Women", subCategories: ["Topwear", "Bottomwear", "Winterwear"], sortOrder: 2 },
    { name: "Kids", subCategories: ["Topwear", "Bottomwear", "Winterwear"], sortOrder: 3 }
];

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Seeds the three categories the app already shipped with, so existing
// products keep matching a real category record with no manual re-entry.
const ensureCategorySeed = async () => {
    try {
        const count = await categoryModel.countDocuments();
        if (count > 0) return;

        await categoryModel.insertMany(
            DEFAULT_CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name) }))
        );
        console.log("Seeded default categories: " + DEFAULT_CATEGORIES.map((c) => c.name).join(", "));
    } catch (error) {
        console.error("Failed to seed categories: " + error.message);
    }
};

export default ensureCategorySeed;
