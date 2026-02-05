import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "./db";
import { User } from "./models/User";
import { Scrim } from "./models/Scrim";
import { Transaction } from "./models/Transaction";
import { Withdrawal } from "./models/Withdrawal";
import { authenticateToken, isAdmin, AuthRequest } from "./middleware/auth";
import { api } from "@shared/routes";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me_in_prod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  const isConnected = await connectDB();

  // Seed Admin
  if (isConnected) {
    const seedAdmin = async () => {
      try {
        const adminExists = await User.findOne({ role: "ADMIN" });
        if (!adminExists) {
          const hashedPassword = await bcrypt.hash("admin123", 10);
          await User.create({
            username: "admin",
            email: "admin@scrimsmaster.com",
            phone: "0000000000",
            password: hashedPassword,
            role: "ADMIN",
            coins: 10000
          });
          console.log("Admin user seeded: admin@scrimsmaster.com / admin123");
        }
      } catch (error) {
        console.error("Error seeding admin:", error);
      }
    };
    seedAdmin();
  }

  // Helper to map _id to id
  const mapDoc = (doc: any) => {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const { username, email, phone, password } = req.body;
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
        role: "USER"
      });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, user: mapDoc(user) });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: mapDoc(user) });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req: AuthRequest, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(mapDoc(user));
  });

  // Wallet Routes
  app.get(api.wallet.balance.path, authenticateToken, async (req: AuthRequest, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ coins: user.coins });
  });

  app.get(api.wallet.transactions.path, authenticateToken, async (req: AuthRequest, res) => {
    const transactions = await Transaction.find({ userId: req.user!.id }).sort({ date: -1 });
    res.json(transactions.map(mapDoc));
  });

  app.post(api.wallet.deposit.path, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount, paymentId } = req.body;
      const user = await User.findById(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.coins += amount;
      await user.save();

      await Transaction.create({
        userId: user._id,
        amount,
        type: "ADD",
        status: "SUCCESS"
      });

      res.json({ success: true, newBalance: user.coins });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post(api.wallet.withdraw.path, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount, upiId } = req.body;
      const user = await User.findById(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.coins < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      user.coins -= amount;
      await user.save();

      await Transaction.create({
        userId: user._id,
        amount,
        type: "WITHDRAW",
        status: "SUCCESS" // Debited from wallet immediately
      });

      const withdrawal = await Withdrawal.create({
        userId: user._id,
        amount,
        upiId,
        status: "PENDING"
      });

      res.status(201).json(mapDoc(withdrawal));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Scrims Routes
  app.get(api.scrims.list.path, async (req, res) => {
    const scrims = await Scrim.find().sort({ matchDate: 1 });
    res.json(scrims.map(mapDoc));
  });

  app.get(api.scrims.get.path, async (req, res) => {
    const scrim = await Scrim.findById(req.params.id);
    if (!scrim) return res.status(404).json({ message: "Scrim not found" });
    res.json(mapDoc(scrim));
  });

  app.post(api.scrims.create.path, authenticateToken, isAdmin, async (req, res) => {
    try {
      const scrim = await Scrim.create(req.body);
      res.status(201).json(mapDoc(scrim));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post(api.scrims.join.path, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const scrim = await Scrim.findById(req.params.id);
      if (!scrim) return res.status(404).json({ message: "Scrim not found" });

      if (scrim.status !== "OPEN") {
        return res.status(400).json({ message: "Scrim is not open for joining" });
      }

      if (scrim.filledSlots >= scrim.totalSlots) {
        return res.status(400).json({ message: "Scrim is full" });
      }

      // Check if already joined
      if (scrim.joinedUsers.includes(req.user!.id as any)) {
        return res.status(400).json({ message: "Already joined" });
      }

      const user = await User.findById(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.coins < scrim.entryFee) {
        return res.status(400).json({ message: "Insufficient coins" });
      }

      // Deduct coins
      user.coins -= scrim.entryFee;
      await user.save();

      // Add to scrim
      scrim.joinedUsers.push(user._id as any);
      scrim.filledSlots += 1;
      if (scrim.filledSlots >= scrim.totalSlots) {
        scrim.status = "FULL";
      }
      await scrim.save();

      // Log transaction
      await Transaction.create({
        userId: user._id,
        amount: scrim.entryFee,
        type: "DEDUCT",
        status: "SUCCESS"
      });

      res.json({ message: "Joined successfully", scrim: mapDoc(scrim) });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put(api.scrims.update.path, authenticateToken, isAdmin, async (req, res) => {
    try {
      const scrim = await Scrim.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!scrim) return res.status(404).json({ message: "Scrim not found" });
      res.json(mapDoc(scrim));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin Routes
  app.get(api.admin.withdrawals.path, authenticateToken, isAdmin, async (req, res) => {
    const withdrawals = await Withdrawal.find().populate("userId", "username email").sort({ date: -1 });
    res.json(withdrawals.map((w) => {
      const obj = mapDoc(w);
      // Map populated user correctly if needed, simpler to just let it return the object
      return obj;
    }));
  });

  app.post(api.admin.processWithdrawal.path, authenticateToken, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

      if (withdrawal.status !== "PENDING") {
        return res.status(400).json({ message: "Withdrawal already processed" });
      }

      withdrawal.status = status;
      await withdrawal.save();

      if (status === "REJECTED") {
        // Refund coins
        const user = await User.findById(withdrawal.userId);
        if (user) {
          user.coins += withdrawal.amount;
          await user.save();
          await Transaction.create({
            userId: user._id,
            amount: withdrawal.amount,
            type: "ADD",
            status: "SUCCESS" // Refund
          });
        }
      }

      res.json(mapDoc(withdrawal));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
