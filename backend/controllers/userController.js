import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import JWT from 'jsonwebtoken';

// CREATE TOKEN
const createToken = (id) => {
    return JWT.sign({ id }, process.env.JWT_SECRET_KEY);
}

// Route for user Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email is valid
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a Valid Email!" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a valid Password!" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }
        if (user.isBlocked) {
            return res.json({ success: false, message: "This account has been suspended. Contact support for help." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id);
            return res.json({ success: true, token });
        }
        return res.json({ success: false, message: "Invalid Credentials!" });
    } catch (err) {
        console.log("Error logging user : " + err);
        res.json({ success: false, message: err.message });
    }
}

// Route for user Registeration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User Already Exists!" });
        }
        // Validating Email Format and Strong Password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a Valid Email!" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong Password!" })
        }
        //Hashing Password 
        const salt = await bcrypt.genSalt(10);
        const HashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            "name": name,
            "email": email,
            "password": HashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (err) {
        console.log("Error creating user : " + err);
        res.json({ success: false, message: err.message });
    }
}

// Route for Admin Login
const adminLogin = async (req, res) => {

    try {
        const {email,password} = req.body;
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.json({success:false,message:"Invalid Credentials!"});
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({success:false,message:"Invalid Credentials!"});
        }
        const token = JWT.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET_KEY, { expiresIn: '12h' });
        return res.json({success:true,token});
    } catch (error) {

        console.log("Error Logging admin : " + error);
        res.json({ success: false, message: error.message });
    }

}

export { loginUser, registerUser, adminLogin };