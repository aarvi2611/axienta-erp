/**
 * Lead Routes
 * GET    /api/leads         - Get all leads
 * POST   /api/leads         - Create lead
 * PUT    /api/leads/:id     - Update lead
 * DELETE /api/leads/:id     - Delete lead
 * POST   /api/leads/import  - Bulk import leads
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const { status, assignedTo, limit = 100 } = req.query;
    
    let query = adminDb.collection("leads").orderBy("createdAt", "desc");
    if (status) query = query.where("status", "==", status);
    if (assignedTo) query = query.where("assignedTo", "==", assignedTo);
    
    const snapshot = await query.limit(parseInt(limit)).get();
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const leadData = {
      ...req.body,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      timeline: [{
        id: Date.now().toString(),
        action: "Lead Created",
        description: `Lead created by ${req.userProfile.displayName}`,
        createdBy: req.user.uid,
        createdByName: req.userProfile.displayName,
        createdAt: new Date().toISOString(),
      }],
    };
    
    const docRef = await adminDb.collection("leads").add(leadData);
    res.status(201).json({ id: docRef.id, ...leadData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await adminDb.collection("leads").doc(req.params.id).update(updates);
    res.json({ message: "Lead updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    await adminDb.collection("leads").doc(req.params.id).delete();
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import
router.post("/import", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { adminDb } = require("../config/firebase-admin");
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    
    const batch = adminDb.batch();
    let count = 0;
    
    for (const row of data) {
      const ref = adminDb.collection("leads").doc();
      batch.set(ref, {
        businessName: row["Business Name"] || row.businessName || "",
        phone: row.Phone || row.phone || "",
        email: row.Email || row.email || "",
        website: row.Website || row.website || "",
        address: row.Address || row.address || "",
        category: row.Category || row.category || "",
        rating: parseFloat(row.Rating || row.rating || "0"),
        status: "new",
        source: "Import",
        notes: [],
        tags: [],
        timeline: [],
        createdBy: req.user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      count++;
    }
    
    await batch.commit();
    res.json({ message: `${count} leads imported successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
