import Message from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("User ids are required");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("File is required");
    }
    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${file.originalname}`;

    mkdirSync(fileDir, { recursive: true });
    renameSync(file.path, fileName);

    return res.status(200).json({ filePath: fileName });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
