//stateless authentication

import jwt from "jsonwebtoken";
export const generateToken = (UserId, res) => {
  const token = jwt.sign({ id: UserId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //remove scripting attack
    sameSite: "None",
    secure: true, // Always use secure for cross-domain cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};
