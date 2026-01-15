import express from "express";
import { ManagerModel } from "../models/manager.js";
import { TrainerModel } from "../models/trainer.js";
import { ScheduleModel } from "../models/schedule.js";
import { authMiddleware as authManagerMiddleware } from "../middlewares/manager.js";
import { authMiddleware as authTrainerMiddleware } from "../middlewares/trainer.js";
import { MemberModel } from "../models/member.js";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post("/create", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const trainer = new TrainerModel({
      name: req.body.name,
      age: req.body.age,
      contactInfo: req.body.contactInfo,
      email: req.body.email,
      password: req.body.password,
      gym: manager.gym,
    });

    await trainer.save();
    res.status(201).json({ message: "Trainer created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const { name } = req.query;

    const filter = {
      gym: manager.gym,
    };

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive search
    }

    const trainers = await TrainerModel.find(filter);
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.put("/:id", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const trainer = await TrainerModel.findOneAndUpdate(
      { _id: req.params.id, gym: manager.gym },
      req.body,
      { new: true }
    );

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json({ message: "Trainer updated successfully", trainer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.delete("/:id", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const trainer = await TrainerModel.findOneAndDelete({
      _id: req.params.id,
      gym: manager.gym,
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post('/login', async(req, res) => {
  const trainer= await TrainerModel.findOne({ email: req.body.email, password:req.body.password}).exec();
  if(!trainer){
    res.status(401).send('Invalid login credentials');
  }
 
  const token = jwt.sign({ id: trainer._id, role: 'trainer'}, process.env.JWT_SECRET);
  res.send(token)
})

router.get("/assigned-members", authTrainerMiddleware, async (req, res) => {
  try {
    const trainer = await TrainerModel.findById(req.userId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const members = await MemberModel.find({trainer: trainer});
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/schedules", authTrainerMiddleware, async (req, res) => {
  try {
    const trainer = await TrainerModel.findById(req.userId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    const schedules = await ScheduleModel.find({
      trainer: trainer._id,
    })
      .populate("trainer", "name email")
      .populate("members", "name")
      .sort({ date: 1 });
    res.json(schedules);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
