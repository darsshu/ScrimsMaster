import mongoose from "mongoose";

const scrimSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["SOLO", "DUO", "SQUAD"], required: true },
  map: { type: String, enum: ["Erangel", "Miramar", "Sanhok", "Livik"], required: true },
  entryFee: { type: Number, required: true, min: 0 },
  prizePool: { type: Number, required: true, min: 0 },
  matchDate: { type: Date, required: true },
  totalSlots: { type: Number, required: true, min: 1 },
  filledSlots: { type: Number, default: 0 },
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roomId: { type: String },
  roomPassword: { type: String },
  status: { type: String, enum: ["OPEN", "FULL", "COMPLETED", "CANCELLED"], default: "OPEN" },
});

export const Scrim = mongoose.model("Scrim", scrimSchema);
