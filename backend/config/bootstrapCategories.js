import categoryModel from "../models/categoryModel.js";

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const sizeSubCategory = (name) => ({
    name,
    filterKey: "size",
    filterLabel: "Size",
    filterOptions: SIZE_OPTIONS
});

// Seeds the storefront's starting taxonomy. Each sub-category carries its
// own filter definition (label + option list) so the storefront filter
// sidebar and the admin product form both know what to ask for without any
// code change — e.g. a belt asks for "Material", a bag asks for "Color", a
// t-shirt asks for "Size".
const DEFAULT_CATEGORIES = [
    {
        name: "Men",
        sortOrder: 1,
        subCategories: ["Topwear", "Bottomwear", "Winterwear"].map(sizeSubCategory)
    },
    {
        name: "Women",
        sortOrder: 2,
        subCategories: ["Topwear", "Bottomwear", "Winterwear"].map(sizeSubCategory)
    },
    {
        name: "Kids",
        sortOrder: 3,
        subCategories: ["Topwear", "Bottomwear", "Winterwear"].map(sizeSubCategory)
    },
    {
        name: "Accessories",
        sortOrder: 4,
        subCategories: [
            {
                name: "Belts",
                filterKey: "material",
                filterLabel: "Material",
                filterOptions: ["Leather", "Woolen", "Canvas", "Suede"]
            },
            {
                name: "Bags",
                filterKey: "color",
                filterLabel: "Color",
                filterOptions: ["Black", "Brown", "Tan", "Navy", "Grey"]
            },
            {
                name: "Jewellery",
                filterKey: "material",
                filterLabel: "Material",
                filterOptions: ["Gold-Plated", "Silver", "Stainless Steel", "Rose Gold"]
            },
            {
                name: "Watches",
                filterKey: "strap-type",
                filterLabel: "Strap Type",
                filterOptions: ["Leather", "Metal", "Silicone", "Fabric"]
            }
        ]
    }
];

// Seeds the default categories so existing products keep matching a real
// category record with no manual re-entry.
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
export { DEFAULT_CATEGORIES, slugify };
