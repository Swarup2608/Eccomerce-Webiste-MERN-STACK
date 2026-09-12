import JWT from 'jsonwebtoken';

const adminAuth = async (req,res,next) =>{
    try {
        const {token} = req.headers;
        if(!token){
            return res.json({success: false,message:"Not Authorized Login Again!"});
        }
        const token_decode = JWT.verify(token,process.env.JWT_SECRET_KEY);
        if(!token_decode || token_decode.role !== "admin"){
            return res.json({success:false,message:"Not Authorized Login Again!"});
        }
        req.admin = token_decode;
        next();
    } catch (error) {
        console.log("Error checking Admin Authentcation : " + error);
        res.json({ success: false, message: error.message });
    }
}

export default adminAuth;
