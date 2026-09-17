import bcrypt from "bcrypt";
import adminModel from "../models/adminModel.js";

// Seeds one admin account from env vars on first boot only. Once a real
// admin record exists in the DB, ADMIN_EMAIL/ADMIN_PASSWORD are no longer
// read for login — they only matter for this one-time bootstrap.
const ensureAdminSeed = async (): Promise<void> => {
    try {
        const count = await adminModel.countDocuments();
        if (count > 0) return;

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
            console.warn("No admin account exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set — cannot seed an admin.");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await adminModel.create({ email, password: hashedPassword });
        console.log(`Seeded initial admin account (${email}) from environment variables.`);
    } catch (error: any) {
        console.error("Failed to seed admin account: " + error.message);
    }
};

export default ensureAdminSeed;
