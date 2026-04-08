require("dotenv").config();
const axios = require("axios");
const logger = require("../utils/logger");
const { oauth2client } = require("../utils/googleConfig");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // Ensure mongoose is required for ObjectId validation
const bcrypt = require("bcryptjs");
const User = require("../database/models/user-model");
const Admin = require("../database/models/admin-model");
const Developer = require("../database/models/developer-model");
const Session = require("../database/models/session-model");

// =============================
// Manual Register
// =============================
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    await new User({
      name,
      email,
      phone,
      password,
      isGoogleAccount: false,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error("Register error", error);
    next(error);
  }
};

// =============================
// Manual Login
// =============================

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || user.isGoogleAccount) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.generateToken();
    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    logger.error("Login error", error);
    next(error);
  }
};

// ----------------
// Sign In (Continue with Google)
// Sign up (Continue with Google)
// ------------------
const googleLogin = async (req, res, next) => {
  try {
    const { code } = req.query;
    // console.log('Code: ',code)
    if (!code) {
      return res.status(400).json({ message: "Missing code parameter." });
    }

    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = userRes.data;

    if (!email) {
      // console.log('Email not returned from Google');
      return res
        .status(400)
        .json({ message: "Email not returned from Google" });
    }

    let user = await User.findOne({ email });
    let token;
    if (!user) {
      user = await User.create({
        name: name,
        email,
        isGoogleAccount: true,
      });
      logger.info(`New Google user created: ${email}`);
    }
    if (user) {
      token = await user.generateToken();
      logger.info(`User logged in: ${email}`);
    }

    return res.status(200).json({
      message: "Google login successful",
      token,
      user,
      userId: user._id.toString(),
    });
  } catch (error) {
    logger.error("Google login error", error);
    next(error);
  }
};

// ---------------------------
// GET Current Logged User detail
// ---------------------------

const getCurrentUser = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { userID, role } = decoded;

    // Validate role and model mapping
    const roleModelMap = {
      user: User,
      admin: Admin,
      developer: Developer,
    };

    const model = roleModelMap[role];

    if (!model) {
      return res.status(400).json({ message: "Invalid user role in token" });
    }

    // Fetch user
    const userData = await model.findById(userID).select("-password");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Session Logic
    let sessionData = null;

    // If normal user → check for active session
    if (role === "user") {
      const session = await Session.findOne({
        users: userID, // ✅ check if userID is in the users array
        isActive: true,
      }).select("_id isActive tableNo"); // ✅ only select essentials

      if (session) {
        sessionData = {
          sessionId: session._id,
          isActive: session.isActive,
          tableNo: session.tableNo,
        };
      }
    }

    return res.status(200).json({
      user: userData,
      session: sessionData, // 🟢 lightweight session object
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    next(error);
  }
};

// ---------------------
// Admin Registration 
// ---------------------

const adminRegister = async (req, res, next) => {
  try {
    const { name, username,email, phone, password } = req.body;

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Admin already exists." });
    }

    await new Admin({
      name,
      username,
      email,
      phone,
      password
    });

    return res.status(201).json({
      message: "Admin registered successfully",
    });
  } catch (error) {
    logger.error("Register error", error);
    next(error);
  }
};


// ------------------------
// Admin Login
// ------------------------

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.generateToken();
    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    logger.error("Login error", error);
    next(error);
  }
};



module.exports = {
  googleLogin,
  getCurrentUser,
  register,
  login,
  adminRegister,
  adminLogin,
};
