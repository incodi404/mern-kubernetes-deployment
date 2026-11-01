import { Router } from "express";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { createBanner, deleteBanner, getBannerById, getBanners } from "../controllers/banner.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/banner:
 *   post:
 *     summary: Create a banner
 *     tags:
 *       - Banner
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Sale"
 *               subtitle:
 *                 type: string
 *                 example: "Up to 50% off on all adventures"
 *               link:
 *                 type: string
 *                 example: "https://example.com/summer-sale"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Banner created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Banner created successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 title: "Summer Sale"
 *                 subtitle: "Up to 50% off on all adventures"
 *                 link: "https://example.com/summer-sale"
 *                 image: "summer-sale-1728123456.jpg"
 *                 createdAt: "2026-10-07T10:00:00.000Z"
 *                 updatedAt: "2026-10-07T10:00:00.000Z"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               missingTitle:
 *                 summary: Banner title missing
 *                 value:
 *                   success: false
 *                   message: "Banner title is required"
 *               invalidSubtitle:
 *                 summary: Invalid subtitle
 *                 value:
 *                   success: false
 *                   message: "Banner subtitle is invalid"
 *               invalidLink:
 *                 summary: Invalid link
 *                 value:
 *                   success: false
 *                   message: "Banner link is invalid"
 *               missingImage:
 *                 summary: Banner image missing
 *                 value:
 *                   success: false
 *                   message: "Banner image is required"
 *       500:
 *         description: Banner creation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Banner creation has been failed"
 */
router.route("/").post(adminVerify, upload.single("image"), createBanner)

/**
 * @swagger
 * /api/v1/banner:
 *   get:
 *     summary: Get all banners
 *     tags:
 *       - Banner
 *     responses:
 *       200:
 *         description: Banners fetched successfully (newest first). Returns an empty array when no banners exist.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Banners fetched successfully"
 *               data:
 *                 - _id: "68f123456789abcdef123456"
 *                   title: "Summer Sale"
 *                   subtitle: "Up to 50% off on all adventures"
 *                   link: "https://example.com/summer-sale"
 *                   image: "summer-sale-1728123456.jpg"
 *                   createdAt: "2026-10-07T10:00:00.000Z"
 *                   updatedAt: "2026-10-07T10:00:00.000Z"
 *       500:
 *         description: Failed to fetch banners
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/").get(getBanners)

/**
 * @swagger
 * /api/v1/banner/{id}:
 *   get:
 *     summary: Get a banner by ID
 *     tags:
 *       - Banner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Banner fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Banner fetched successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 title: "Summer Sale"
 *                 subtitle: "Up to 50% off on all adventures"
 *                 link: "https://example.com/summer-sale"
 *                 image: "summer-sale-1728123456.jpg"
 *                 createdAt: "2026-10-07T10:00:00.000Z"
 *                 updatedAt: "2026-10-07T10:00:00.000Z"
 *       400:
 *         description: Invalid banner ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Banner id is invalid"
 *       404:
 *         description: Banner not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Banner not found"
 *       500:
 *         description: Failed to fetch banner
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:id").get(getBannerById)

/**
 * @swagger
 * /api/v1/banner/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags:
 *       - Banner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Banner deleted successfully"
 *       400:
 *         description: Invalid banner ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Banner id is invalid"
 *       404:
 *         description: Banner not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Banner not found"
 *       500:
 *         description: Banner deletion failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:id").delete(adminVerify, deleteBanner)

export default router;