import JWT from 'jsonwebtoken';

const adminAuth = async (req,res,next) =>{
    try {
        const {token} = req.headers;
        if(!token){
            return res.json({success: false,message:"Not Authorized Login Again!"});
        }
        const token_decode = JWT.verify(token,process.env.JWT_SECRET_KEY);
        if(token_decode !== process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.json({success:false,message:"Not Authorized Login Again!"});
        }
        next();
    } catch (error) {
        console.log("Error checking Admin Authentcation : " + error);
        res.json({ success: false, message: err.message });
    }
}

export default adminAuth;