// One-off migration: converts productModel.sizes from a plain string array
// (['S','M','L']) to a per-size-stock subdocument array
// ([{size:'S',stock:50}, ...]). Run once, manually, before/at the deploy
// that ships the new productModel schema:
//
//   npx tsx scripts/migrateSizes.ts
//
// Safe to re-run: products whose sizes are already in the new shape are
// left untouched.
import 'dotenv/config';
import mongoose from 'mongoose';

const PLACEHOLDER_STOCK = 50;

const run = async (): Promise<void> => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const collection = mongoose.connection.collection('products');

    const cursor = collection.find({});
    let scanned = 0;
    let migrated = 0;

    for await (const doc of cursor) {
        scanned++;
        const sizes = doc.sizes || [];
        const alreadyMigrated = sizes.length === 0 || (typeof sizes[0] === 'object' && sizes[0] !== null && 'size' in sizes[0]);
        if (alreadyMigrated) continue;

        const newSizes = sizes.map((s: unknown) => ({ size: String(s), stock: PLACEHOLDER_STOCK }));
        await collection.updateOne({ _id: doc._id }, { $set: { sizes: newSizes } });
        migrated++;
    }

    console.log(`Scanned ${scanned} product(s), migrated ${migrated} to the new per-size-stock shape.`);
    if (migrated > 0) {
        console.log(`Migrated products were given a placeholder stock of ${PLACEHOLDER_STOCK} per size — adjust real quantities via the admin edit page.`);
    }
    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Migration failed: ' + error.message);
    process.exit(1);
});
