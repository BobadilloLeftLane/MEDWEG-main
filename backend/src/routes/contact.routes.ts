import express from 'express';
import * as contactController from '../controllers/contactController';

const router = express.Router();

/**
 * Contact Routes
 * Public endpoints for landing page contact form
 */

/**
 * POST /api/contact
 * Submit contact form (no authentication required)
 */
router.post('/', contactController.submitContactForm);

export default router;
