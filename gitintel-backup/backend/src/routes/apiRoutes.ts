import { Router } from 'express';
import { analyze, getInsights, getProfile, getScores, getSkills, jobMatch, report } from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/auth.js';

export const apiRoutes = Router();

apiRoutes.post('/analyze', requireAuth, analyze);
apiRoutes.get('/profile/:username', getProfile);
apiRoutes.get('/skills/:username', getSkills);
apiRoutes.get('/scores/:username', getScores);
apiRoutes.get('/insights/:username', getInsights);
apiRoutes.post('/job-match', requireAuth, jobMatch);
apiRoutes.get('/report/:username', report);
