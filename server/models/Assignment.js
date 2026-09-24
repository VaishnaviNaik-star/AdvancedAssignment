import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:{type:String,required:true},subject:{type:String,required:true},description:String,academicYear:{type:String,required:true},section:{type:String,required:true},deadline:{type:Date,required:true},professor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},maxScore:{type:Number,default:100},status:{type:String,enum:['published','closed'],default:'published'}},{timestamps:true});
export default mongoose.model('Assignment',schema);
