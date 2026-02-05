import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  coins: { type: Number, default: 0 },
});

export const User = mongoose.model("User", userSchema);
