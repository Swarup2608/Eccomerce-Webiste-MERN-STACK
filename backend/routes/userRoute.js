import express from 'express'
import { loginUser,adminLogin,registerUser } from '../controllers/userController.js'
import { listUsers, getUserDetail, setUserBlocked } from '../controllers/userAdminController.js'
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();
// POST METHODS
userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/admin",adminLogin);

// Admin customer-management
userRouter.post("/admin/list",adminAuth,listUsers);
userRouter.post("/admin/detail",adminAuth,getUserDetail);
userRouter.post("/admin/block",adminAuth,setUserBlocked);


export default userRouter;