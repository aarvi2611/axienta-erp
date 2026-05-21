import { Router } from 'express'; import { requireAuth, allowRoles } from '../middleware/auth'; import { asyncHandler } from '../utils/asyncHandler';
const router=Router(); router.use(requireAuth, allowRoles('CEO','Admin','Head Manager','Team Manager','Data Scraper'));
router.post('/scrape', asyncHandler(async(req,res)=>{ const { keyword, location } = req.body; res.json({ keyword, location, status:'ready', message:'Use Google Places API Text Search + Details endpoints here; scraping Google Maps HTML may violate terms. This endpoint is structured for compliant API extraction.' }); }));
export default router;
