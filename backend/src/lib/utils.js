//stateless authentication

import jwt from "jsonwebtoken";
export const generateToken = (UserId, res) => {
  const token = jwt.sign({ id: UserId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //remove scripting attack
    samesite: "Strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};
