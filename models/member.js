import mongoose from "mongoose";
const memberSchema = new mongoose.Schema({
  name: String,
  age: Number,
  membershipType: String,
  contactInfo: String,
  email: String,
  password: String,
  gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym'
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer'
      }
  },
  { timestamps: true });
export const MemberModel = mongoose.model('Member', memberSchema);