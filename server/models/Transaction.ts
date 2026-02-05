import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["ADD", "DEDUCT", "WIN", "WITHDRAW"], required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "SUCCESS" },
  date: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
