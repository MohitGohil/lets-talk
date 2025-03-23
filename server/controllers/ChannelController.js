import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    if (!name || !members) {
      return res.status(400).send("Name and Members are required");
    }
    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin not found with the given id");
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Invalid members");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();

    return res.status(201).json({ channel: newChannel });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(201).json({ channels });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
