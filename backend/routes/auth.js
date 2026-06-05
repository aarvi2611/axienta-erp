/**
 * Authentication Routes
 * POST /api/auth/create-user - Create new employee (admin only)
 * POST /api/auth/reset-password - Reset user password
 * GET  /api/auth/verify - Verify current token
 */
const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");

// Create new employee account
router.post("/create-user", verifyToken, requireRole("ceo", "admin", "head_manager"), async (req, res) => {
  try {
    const { adminAuth, adminDb } = require("../config/firebase-admin");
    const { email, password, displayName, role, department, phone } = req.body;

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // Generate employee ID
    const employeeId = `AXN-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save to Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      role,
      department: department || "",
      phone: phone || "",
      avatar: "",
      employeeId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid,
    });

    // Log activity
    await adminDb.collection("activity_logs").add({
      userId: req.user.uid,
      userName: req.userProfile.displayName,
      action: "Created Employee",
      module: "auth",
      details: `Created account for ${displayName} (${email})`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Employee created successfully",
      user: {
        uid: userRecord.uid,
        email,
        displayName,
        employeeId,
        role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Reset password
router.post("/reset-password", verifyToken, requireRole("ceo", "admin", "head_manager"), async (req, res) => {
  try {
    const { adminAuth } = require("../config/firebase-admin");
    const { uid, newPassword } = req.body;
    
    await adminAuth.updateUser(uid, { password: newPassword });
    
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify token
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: req.userProfile,
  });
});

module.exports = router;
