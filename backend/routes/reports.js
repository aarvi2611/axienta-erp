/**
 * Reports Routes
 * GET /api/reports/dashboard - Dashboard stats
 * GET /api/reports/leads     - Lead reports
 * GET /api/reports/tasks     - Task reports
 * GET /api/reports/attendance - Attendance reports
 */
const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    
    const [usersSnap, leadsSnap, tasksSnap] = await Promise.all([
      adminDb.collection("users").where("isActive", "==", true).get(),
      adminDb.collection("leads").get(),
      adminDb.collection("tasks").get(),
    ]);

    const stats = {
      totalEmployees: usersSnap.size,
      totalLeads: leadsSnap.size,
      totalTasks: tasksSnap.size,
      completedTasks: tasksSnap.docs.filter(d => d.data().status === "completed").length,
      pendingTasks: tasksSnap.docs.filter(d => d.data().status === "pending").length,
      leadsByStatus: {},
    };

    // Count leads by status
    leadsSnap.docs.forEach(doc => {
      const status = doc.data().status;
      stats.leadsByStatus[status] = (stats.leadsByStatus[status] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/leads", verifyToken, requireRole("ceo", "admin", "head_manager", "team_manager"), async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const snapshot = await adminDb.collection("leads").get();
    
    const report = {
      total: snapshot.size,
      byStatus: {},
      bySource: {},
      byMonth: {},
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      report.byStatus[data.status] = (report.byStatus[data.status] || 0) + 1;
      if (data.source) {
        report.bySource[data.source] = (report.bySource[data.source] || 0) + 1;
      }
      const month = new Date(data.createdAt).toISOString().slice(0, 7);
      report.byMonth[month] = (report.byMonth[month] || 0) + 1;
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/attendance", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const { date, userId } = req.query;
    
    let query = adminDb.collection("attendance");
    if (date) query = query.where("date", "==", date);
    if (userId) query = query.where("userId", "==", userId);
    
    const snapshot = await query.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
