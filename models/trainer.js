import mongoose from "mongoose";
const trainerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  contactInfo: String,
  email: String,
  password: String,
   gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym'
    }
  },
  { timestamps: true });
export const TrainerModel = mongoose.model('Trainer', trainerSchema);