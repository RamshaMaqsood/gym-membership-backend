import express from "express";
import { MemberModel } from "../models/member.js";
import { TrainerModel } from "../models/trainer.js";
import { ScheduleModel } from "../models/schedule.js";
import { ManagerModel } from "../models/manager.js";
import { authMiddleware } from "../middlewares/manager.js";

const router = express.Router();

/**
 * DASHBOARD REPORT
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalMembers = await MemberModel.countDocuments({
      gym: manager.gym,
    });

    const totalTrainers = await TrainerModel.countDocuments({
      gym: manager.gym,
    });

    const todaySchedules = await ScheduleModel.countDocuments({
      gym: manager.gym,
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({
      totalMembers,
      totalTrainers,
      todaySchedules,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
