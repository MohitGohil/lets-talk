import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send("You are not authenticated");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(403).send("Token is not valid");
  }
};
