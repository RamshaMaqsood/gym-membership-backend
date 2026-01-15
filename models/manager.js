import mongoose from "mongoose";
const managerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym'
  }
  },
  { timestamps: true });
export const ManagerModel = mongoose.model('Manager', managerSchema);