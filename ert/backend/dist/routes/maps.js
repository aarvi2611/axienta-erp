"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager', 'Data Scraper'));
router.post('/scrape', (0, asyncHandler_1.asyncHandler)(async (req, res) => { const { keyword, location } = req.body; res.json({ keyword, location, status: 'ready', message: 'Use Google Places API Text Search + Details endpoints here; scraping Google Maps HTML may violate terms. This endpoint is structured for compliant API extraction.' }); }));
exports.default = router;
