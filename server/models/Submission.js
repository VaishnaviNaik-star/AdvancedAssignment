import mongoose from 'mongoose';
const revisionSchema=new mongoose.Schema({revisionNumber:{type:Number,required:true},content:String,fileUrl:String,submittedAt:{type:Date,default:Date.now},timeliness:{type:String,enum:['On Time','Late']},state:{type:String,enum:['submitted','graded'],default:'submitted'},score:Number,feedback:String,gradedAt:Date,gradedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{_id:true});
const schema=new mongoose.Schema({assignment:{type:mongoose.Schema.Types.ObjectId,ref:'Assignment',required:true},student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},revisions:{type:[revisionSchema],default:[]},activeRevision:{type:Number,default:null},reopened:{type:Boolean,default:false},resubmissionDeadline:Date,reopeningReason:String,authorizedAt:Date,authorizedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
schema.index({assignment:1,student:1},{unique:true});
export default mongoose.model('Submission',schema);
