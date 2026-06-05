/**
 * Task Routes
 * GET    /api/tasks       - Get tasks
 * POST   /api/tasks       - Create task
 * PUT    /api/tasks/:id   - Update task
 * DELETE /api/tasks/:id   - Delete task
 */
const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const { assignedTo, status } = req.query;
    
    let query = adminDb.collection("tasks").orderBy("createdAt", "desc");
    if (assignedTo) query = query.where("assignedTo", "==", assignedTo);
    if (status) query = query.where("status", "==", status);
    
    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", verifyToken, requireRole("ceo", "admin", "head_manager", "team_manager"), async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const taskData = {
      ...req.body,
      assignedBy: req.user.uid,
      assignedByName: req.userProfile.displayName,
      status: "pending",
      statusUpdates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await adminDb.collection("tasks").add(taskData);
    
    // Create notification for assigned user
    if (taskData.assignedTo) {
      await adminDb.collection("notifications").add({
        userId: taskData.assignedTo,
        title: "New Task Assigned",
        message: `Task "${taskData.title}" has been assigned to you by ${req.userProfile.displayName}`,
        type: "task",
        isRead: false,
        link: "/tasks",
        createdAt: new Date().toISOString(),
      });
    }
    
    res.status(201).json({ id: docRef.id, ...taskData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await adminDb.collection("tasks").doc(req.params.id).update(updates);
    res.json({ message: "Task updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", verifyToken, requireRole("ceo", "admin", "head_manager"), async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    await adminDb.collection("tasks").doc(req.params.id).delete();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
