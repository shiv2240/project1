// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* -------------------- Token Helper -------------------- */
function signToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

/* -------------------- Validators -------------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =======================================================
   REGISTER
======================================================= */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    /* ---------- Basic Validations ---------- */
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    if (name.trim().length < 5) {
      return res.status(400).json({
        error: "Name must be at least 5 characters"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    /* ---------- Existing User Check ---------- */
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: "Email already registered. Redirect to login.",
        redirect: "/login"
      });
    }

    /* ---------- Create User ---------- */
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: hash
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* =======================================================
   LOGIN
======================================================= */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    /* ---------- Basic Validations ---------- */
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    /* ---------- Check User ---------- */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        hint: "User not found. Try registering."
      });
    }

    /* ---------- Password Check ---------- */
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* =======================================================
   ME (Auth Required)
======================================================= */
export async function me(req, res) {
  return res.json({
    user: req.user.name
  });
}
