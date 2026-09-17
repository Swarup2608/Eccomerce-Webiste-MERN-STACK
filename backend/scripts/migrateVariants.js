// One-off migration: generalizes the old "sizes" concept into a generic
// per-category "variants" concept, so non-clothing categories can filter
// by color/material/etc instead of a hardcoded size list.
//
//   node scripts/migrateVariants.js
//
// Safe to re-run: anything already in the new shape is left untouched.
//   1. categories.subCategories: ['Topwear', ...] -> [{name, filterKey,
//      filterLabel, filterOptions}, ...] (defaults to the Size filter,
//      preserving today's behavior for existing clothing sub-categories).
//   2. Inserts the "Accessories" category (Belts/Bags/Jewellery/Watches)
//      if a category by that name doesn't already exist.
//   3. products.sizes: [{size,stock}] -> products.variants: [{value,stock}],
//      plus filterKey/filterLabel backfilled to the Size filter (every
//      pre-migration product was clothing).
//   4. orders.items[].size -> orders.items[].variant, plus a variantLabel
//      backfilled to "Size".
import 'dotenv/config';
import mongoose from 'mongoose';
import { DEFAULT_CATEGORIES, slugify } from '../config/bootstrapCategories.js';

const SIZE_FILTER = { filterKey: 'size', filterLabel: 'Size' };

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const categories = mongoose.connection.collection('categories');
    const products = mongoose.connection.collection('products');
    const orders = mongoose.connection.collection('orders');

    // 1. Categories: string sub-categories -> filter-bearing sub-category objects.
    let categoriesMigrated = 0;
    for await (const doc of categories.find({})) {
        const subCategories = doc.subCategories || [];
        if (subCategories.length > 0 && typeof subCategories[0] === 'object') continue;

        const newSubCategories = subCategories.map((name) => ({
            name,
            ...SIZE_FILTER,
            filterOptions: ['S', 'M', 'L', 'XL', 'XXL']
        }));
        await categories.updateOne({ _id: doc._id }, { $set: { subCategories: newSubCategories } });
        categoriesMigrated++;
    }
    console.log(`Migrated ${categoriesMigrated} categor${categoriesMigrated === 1 ? 'y' : 'ies'} to filter-bearing sub-categories.`);

    // 2. Seed Accessories if this DB predates it.
    const accessories = DEFAULT_CATEGORIES.find((c) => c.name === 'Accessories');
    const existing = await categories.findOne({ name: 'Accessories' });
    if (!existing) {
        await categories.insertOne({ ...accessories, slug: slugify(accessories.name) });
        console.log('Inserted the "Accessories" category (Belts, Bags, Jewellery, Watches).');
    }

    // 3. Products: sizes -> variants.
    let productsMigrated = 0;
    for await (const doc of products.find({})) {
        if (doc.variants) continue;
        const sizes = doc.sizes || [];
        const variants = sizes.map((s) => ({ value: s.size, stock: s.stock }));
        await products.updateOne(
            { _id: doc._id },
            { $set: { variants, ...SIZE_FILTER }, $unset: { sizes: "" } }
        );
        productsMigrated++;
    }
    console.log(`Migrated ${productsMigrated} product(s) from "sizes" to "variants".`);

    // 4. Orders: items[].size -> items[].variant.
    let ordersMigrated = 0;
    for await (const doc of orders.find({ 'items.size': { $exists: true } })) {
        const items = (doc.items || []).map((it) => {
            if (it.variant) return it;
            const { size, ...rest } = it;
            return { ...rest, variant: size, variantLabel: 'Size' };
        });
        await orders.updateOne({ _id: doc._id }, { $set: { items } });
        ordersMigrated++;
    }
    console.log(`Migrated ${ordersMigrated} order(s) from "size" to "variant" line items.`);

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Migration failed: ' + error.message);
    process.exit(1);
});
