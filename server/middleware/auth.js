import jwt from 'jsonwebtoken'; import User from '../models/User.js';
export const protect=async(req,res,next)=>{try{const token=req.headers.authorization?.split(' ')[1];if(!token)return res.status(401).json({message:'Authentication required'});const p=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(p.id);if(!req.user)return res.status(401).json({message:'User not found'});next()}catch(e){res.status(401).json({message:'Invalid or expired token'})}};
export const role=(r)=>(req,res,next)=>req.user.role===r?next():res.status(403).json({message:'Forbidden'});
