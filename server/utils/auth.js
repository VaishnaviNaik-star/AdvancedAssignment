import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs';
export const hash=p=>bcrypt.hash(p,10); export const compare=(p,h)=>bcrypt.compare(p,h); export const token=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
