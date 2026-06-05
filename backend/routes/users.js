/**
 * User Routes
 * GET    /api/users       - Get all users
 * GET    /api/users/:id   - Get user by ID
 * PUT    /api/users/:id   - Update user
 * DELETE /api/users/:id   - Deactivate user
 */
const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const doc = await adminDb.collection("users").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ uid: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const { id } = req.params;
    
    // Users can update their own profile, or admins can update any
    const isOwner = req.user.uid === id;
    const isAdmin = ["ceo", "admin", "head_manager"].includes(req.userProfile.role);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    // Prevent non-admins from changing roles
    if (!isAdmin) delete updates.role;
    
    await adminDb.collection("users").doc(id).update(updates);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", verifyToken, requireRole("ceo", "admin"), async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    await adminDb.collection("users").doc(req.params.id).update({ isActive: false });
    res.json({ message: "User deactivated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
