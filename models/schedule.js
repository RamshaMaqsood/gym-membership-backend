import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "07:00 - 08:00"
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
  },
  { timestamps: true }
);

export const ScheduleModel = mongoose.model("Schedule", scheduleSchema);
