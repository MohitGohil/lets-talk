import { Router } from "express";
import {
  logIn,
  signUp,
  userInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logOut,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();

const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signUp);
authRoutes.post("/login", logIn);
authRoutes.post("/logout", logOut);
authRoutes.get("/user-info", verifyToken, userInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"), addProfileImage);
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);

export default authRoutes;
