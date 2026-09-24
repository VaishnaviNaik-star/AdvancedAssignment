import mongoose from 'mongoose';
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true},role:{type:String,enum:['student','professor'],default:'student'},academicYear:String,section:String,subjects:[String],interventionFlags:[{subject:String,reason:String,missedCount:Number,createdAt:{type:Date,default:Date.now}}]},{timestamps:true});
export default mongoose.model('User',userSchema);
