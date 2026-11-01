import { Router } from "express";
import { getConfig, upsertConfig } from "../controllers/admin.controller.js";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/config:
 *   get:
 *     summary: Get site configuration
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Config fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Config fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     socialLinks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           platform:
 *                             type: string
 *                           link:
 *                             type: string
 *                     comparisonParameter:
 *                       type: string
 *                       enum: [Highest, Average, Lowest]
 *                     notifyEmails:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Config not found
 */
router.route("/").get(getConfig);

/**
 * @swagger
 * /api/v1/config:
 *   put:
 *     summary: Create or update site configuration
 *     description: If no config document exists, one is created. If it exists, only the provided fields are updated.
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       example: Twitter
 *                     link:
 *                       type: string
 *                       example: https://twitter.com/example
 *               comparisonParameter:
 *                 type: string
 *                 enum: [Highest, Average, Lowest]
 *                 example: Average
 *               notifyEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: admin@example.com
 *     responses:
 *       200:
 *         description: Config updated successfully
 *       201:
 *         description: Config created successfully
 *       400:
 *         description: socialLinks or notifyEmails is not an array
 *       401:
 *         description: Admin not authenticated
 */
router.route("/").put(adminVerify, upsertConfig);

export default router;