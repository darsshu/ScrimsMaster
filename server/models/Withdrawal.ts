import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 50 },
  upiId: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  date: { type: Date, default: Date.now },
});

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
