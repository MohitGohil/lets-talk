import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }
    const foundUser = await User.find({ email });
    if (foundUser.length) {
      return res.status(409).send("User with the given email already exists");
    }
    const user = await User.create({ email, password });
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};

export const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User with the given email not found");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(401).send("Invalid Password");
    }
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};

export const userInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User not found with the given id");
    }
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName || color == undefined) {
      return res.status(400).send("First Name, Last Name and Color is required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );
    if (!userData) {
      return res.status(404).send("User not found with the given id");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Profile image is required");
    }
    const currentDate = Date.now();
    let fileName = `uploads/profiles/${currentDate}-${req.file.originalname}`;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).send("User not found with the given id");
    }

    return res.status(200).json({ image: updatedUser.image });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found with the given id");
    }
    if (user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();
    return res.status(200).send("Profile image removed successfully");
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
export const logOut = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).send("Logged out successfully");
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal Server error");
  }
};
