import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sadgaming021_db_user:5T5z2erv27qJi8fH@scrimsmaster.gjjxtwj.mongodb.net/";

export async function connectDB(): Promise<boolean> {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Database connection will fail.");
    return false;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
}
