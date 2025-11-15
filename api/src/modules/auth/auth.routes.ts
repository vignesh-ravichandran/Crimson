// Authentication Routes

import { Router } from 'express';
import { googleOAuthLogin } from './auth.controller';

const router = Router();

router.post('/oauth/google', googleOAuthLogin);

export default router;

