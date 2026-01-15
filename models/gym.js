import mongoose from "mongoose";
const gymSchema = new mongoose.Schema({
  name: String,
  },
  { timestamps: true });
export const GymModel = mongoose.model('Gym', gymSchema);