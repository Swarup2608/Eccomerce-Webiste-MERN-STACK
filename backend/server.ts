import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js';
import ensureAdminSeed from './config/bootstrapAdmin.js';
import ensureCategorySeed from './config/bootstrapCategories.js';

const port = env.PORT;

// Connect to Database
connectDB();
ensureAdminSeed();
ensureCategorySeed();

// Connect to Cloudinary
connectCloudinary().catch((error) => {
    console.error('Failed to connect to Cloudinary. Some image upload features may not work.');
    process.exit(1);
});

app.listen(port, () => console.log("Server started on PORT : " + port));
