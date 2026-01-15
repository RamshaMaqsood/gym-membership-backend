import express from "express";
import { MemberModel } from "../models/member.js";
import { ManagerModel } from "../models/manager.js";
import { TrainerModel } from "../models/trainer.js";
import { ScheduleModel } from "../models/schedule.js";
import { authMiddleware as authManagerMiddleware } from "../middlewares/manager.js";
import { authMiddleware as authMemberMiddleware } from "../middlewares/member.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/create", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const member = new MemberModel({
      name: req.body.name,
      age: req.body.age,
      membershipType: req.body.membershipType,
      contactInfo: req.body.contactInfo,
      email: req.body.email,
      password: req.body.password,
      gym: manager.gym,
    });

    await member.save();
    res.status(201).json({ message: "Member created successfully" });
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
      filter.name = { $regex: name, $options: "i" };
    }

    const members = await MemberModel.find(filter).populate(
      "trainer",
      "name email"
    );;
    res.json(members);
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
    console.log({manager})

    const member = await MemberModel.findOneAndUpdate(
      { _id: req.params.id, gym: manager.gym },
      req.body,
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member updated successfully", member });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});


router.delete("/:id", authManagerMiddleware, async (req, res) => {
  try {
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const member = await MemberModel.findOneAndDelete({
      _id: req.params.id,
      gym: manager.gym,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/:memberId/assign-trainer", authManagerMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { trainerId } = req.body;

    if (!trainerId) {
      return res.status(400).json({ message: "trainerId is required" });
    }

    // Find manager
    const manager = await ManagerModel.findById(req.userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Verify trainer belongs to same gym
    const trainer = await TrainerModel.findOne({
      _id: trainerId,
      gym: manager.gym,
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found in this gym" });
    }

    // Assign trainer to member
    const member = await MemberModel.findOneAndUpdate(
      { _id: memberId, gym: manager.gym },
      { trainer: trainerId },
      { new: true }
    ).populate("trainer", "name email");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({
      message: "Trainer assigned successfully",
      member,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error });
  }
});

router.post('/login', async(req, res) => {
  const member= await MemberModel.findOne({ email: req.body.email, password:req.body.password}).exec();
  if(!member){
    res.status(401).send('Invalid login credentials');
  }
 
  const token = jwt.sign({ id: member._id, role: 'member'}, process.env.JWT_SECRET);
  res.send(token)
})

router.get("/me", authMemberMiddleware, async (req, res) => {
  try {
    const member = await MemberModel.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/assigned-trainer", authMemberMiddleware, async (req, res) => {
  try {
    const member = await MemberModel.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const trainer = await TrainerModel.findById(member.trainer);
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/schedules", authMemberMiddleware, async (req, res) => {
  try {
    const member = await MemberModel.findById(req.userId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const schedules = await ScheduleModel.find({
      members: member._id,
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