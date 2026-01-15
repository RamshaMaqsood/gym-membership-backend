import express from "express";
import { ScheduleModel } from "../models/schedule.js";
import { ManagerModel } from "../models/manager.js";
import { TrainerModel } from "../models/trainer.js";
import { MemberModel } from "../models/member.js";
import { authMiddleware } from "../middlewares/manager.js";

const router = express.Router();

/**
 * CREATE SCHEDULE (Manager)
 * POST /schedule/create
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, date, time, trainerId } = req.body;

    if (!title || !date || !time || !trainerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const trainer = await TrainerModel.findOne({
      _id: trainerId,
      gym: manager.gym,
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found in this gym" });
    }

    const schedule = new ScheduleModel({
      title,
      date,
      time,
      trainer: trainerId,
      gym: manager.gym,
    });

    await schedule.save();

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * GET SCHEDULES (ALL / DAILY)
 * GET /schedule
 * GET /schedule?date=YYYY-MM-DD
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const { date } = req.query;

    const filter = {
      gym: manager.gym,
    };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    const schedules = await ScheduleModel.find(filter)
      .populate("trainer", "name email")
      .populate("members", "name");

    res.json(schedules);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * ADD MEMBER TO SCHEDULE
 * PUT /schedule/:scheduleId/add-member
 */
router.put("/:scheduleId/add-member", authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }

    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const member = await MemberModel.findOne({
      _id: memberId,
      gym: manager.gym,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const schedule = await ScheduleModel.findOneAndUpdate(
      { _id: req.params.scheduleId, gym: manager.gym },
      { $addToSet: { members: memberId } },
      { new: true }
    )
      .populate("trainer", "name")
      .populate("members", "name");

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({
      message: "Member added to schedule",
      schedule,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * DELETE SCHEDULE (Manager)
 * DELETE /schedule/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const schedule = await ScheduleModel.findOneAndDelete({
      _id: req.params.id,
      gym: manager.gym,
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found or does not belong to your gym",
      });
    }

    res.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
});


export default router;
