import { Router } from "express";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { createReel, deleteReel, getAllReels, getReelBySlug } from "../controllers/reels.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/reels:
 *   post:
 *     summary: Create a reel
 *     tags:
 *       - Reels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Sunset at the beach"
 *               url:
 *                 type: string
 *                 description: Instagram reel / post URL
 *                 example: "https://www.instagram.com/reel/Cxyz123AbC/"
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Reel created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Reel created successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 title: "Sunset at the beach"
 *                 url: "https://www.instagram.com/reel/Cxyz123AbC/"
 *                 active: true
 *                 slug: "sunset-at-the-beach"
 *                 embedUrl: "https://www.instagram.com/reel/Cxyz123AbC/embed"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               missingTitle:
 *                 summary: Reel title missing
 *                 value:
 *                   success: false
 *                   message: "Reel title is required"
 *               titleTooLong:
 *                 summary: Title too long
 *                 value:
 *                   success: false
 *                   message: "Title cannot exceed 150 characters"
 *               missingUrl:
 *                 summary: Reel URL missing
 *                 value:
 *                   success: false
 *                   message: "Reel URL is required"
 *               invalidUrl:
 *                 summary: Invalid Instagram URL
 *                 value:
 *                   success: false
 *                   message: "Please provide a valid Instagram reel URL"
 *               invalidActive:
 *                 summary: Active is not a boolean
 *                 value:
 *                   success: false
 *                   message: "Active should be a boolean"
 *       500:
 *         description: Reel creation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Reel creation has been failed"
 */
router.route("/").post(adminVerify, createReel)

/**
 * @swagger
 * /api/v1/reels/{reelId}:
 *   delete:
 *     summary: Delete a reel
 *     tags:
 *       - Reels
 *     parameters:
 *       - in: path
 *         name: reelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Reel deleted successfully"
 *       400:
 *         description: Invalid reel ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid reelId"
 *       404:
 *         description: Reel not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Reel not found"
 */
router.route("/:reelId").delete(adminVerify, deleteReel)

/**
 * @swagger
 * /api/v1/reels/{slug}:
 *   get:
 *     summary: Get a reel by slug
 *     tags:
 *       - Reels
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "sunset-at-the-beach"
 *     responses:
 *       200:
 *         description: Reel fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Reel fetched successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 title: "Sunset at the beach"
 *                 url: "https://www.instagram.com/reel/Cxyz123AbC/"
 *                 active: true
 *                 slug: "sunset-at-the-beach"
 *                 embedUrl: "https://www.instagram.com/reel/Cxyz123AbC/embed"
 *       400:
 *         description: Slug missing
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Slug is required"
 *       404:
 *         description: Reel not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Reel not found"
 */
router.route("/:slug").get(getReelBySlug)

/**
 * @swagger
 * /api/v1/reels/{page}/{limit}:
 *   get:
 *     summary: Get all reels
 *     tags:
 *       - Reels
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search by reel title
 *         schema:
 *           type: string
 *         example: "Sunset"
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: Reels fetched successfully. Returns either an empty array or paginated reel data.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Reels fetched successfully"
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "68f123456789abcdef123456"
 *                               title:
 *                                 type: string
 *                                 example: "Sunset at the beach"
 *                               url:
 *                                 type: string
 *                                 example: "https://www.instagram.com/reel/Cxyz123AbC/"
 *                               embedUrl:
 *                                 type: string
 *                                 example: "https://www.instagram.com/reel/Cxyz123AbC/embed"
 *                               slug:
 *                                 type: string
 *                                 example: "sunset-at-the-beach"
 *                               active:
 *                                 type: boolean
 *                                 example: true
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "No reels has been fetched"
 *                     data:
 *                       type: array
 *                       example: []
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Limit and page should be a number"
 *       500:
 *         description: Failed to fetch reels
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:page/:limit").get(getAllReels)

export default router;