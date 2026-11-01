import { Router } from "express";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/category:
 *   post:
 *     summary: Create a category
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Adventure"
 *               block:
 *                 type: string
 *                 description: Category block
 *                 example: "Header"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category created successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 name: "Adventure"
 *                 image: "adventure-1728123456.jpg"
 *                 block: "Header"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               missingName:
 *                 summary: Category name missing
 *                 value:
 *                   success: false
 *                   message: "Category name is required"
 *               invalidBlock:
 *                 summary: Invalid block
 *                 value:
 *                   success: false
 *                   message: "Block is invalid"
 *               missingImage:
 *                 summary: Category image missing
 *                 value:
 *                   success: false
 *                   message: "Category image is required"
 *       409:
 *         description: Category already exists
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category with this name already exists"
 *       500:
 *         description: Category creation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category creation has been failed"
 */
router.route("/").post(adminVerify, upload.single("image"), createCategory)

/**
 * @swagger
 * /api/v1/category/{categoryId}:
 *   put:
 *     summary: Update a category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Adventure"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               block:
 *                 type: string
 *                 description: Category block
 *                 example: "Header"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category updated successfully"
 *               data:
 *                 _id: "68f123456789abcdef123456"
 *                 name: "Adventure"
 *                 image: "adventure-new-1728123456.jpg"
 *                 block: "Header"
 *                 isActive: true
 *       400:
 *         description: Invalid category ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid categoryId"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category not found"
 *       500:
 *         description: Category update failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category update has been failed"
 */
router.route("/:categoryId").put(adminVerify, upload.single("image"), updateCategory)

/**
 * @swagger
 * /api/v1/category/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category deleted successfully"
 *       400:
 *         description: Invalid category ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid categoryId"
 *       500:
 *         description: Category deletion failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category deletion has been failed"
 */
router.route("/:categoryId").delete(adminVerify, deleteCategory)

/**
 * @swagger
 * /api/v1/category/{page}/{limit}:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Category
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
 *         schema:
 *           type: string
 *         example: "Adventure"
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         example: true
 *       - in: query
 *         name: block
 *         required: false
 *         schema:
 *           type: string
 *         example: "Header"
 *     responses:
 *       200:
 *         description: Categories fetched successfully. Returns either an empty array or paginated category data.
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
 *                       example: "Categories fetched successfully"
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
 *                               name:
 *                                 type: string
 *                                 example: "Adventure"
 *                               image:
 *                                 type: string
 *                                 example: "adventure-1728123456.jpg"
 *                               block:
 *                                 type: string
 *                                 example: "Header"
 *                               isActive:
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
 *                       example: "No categories has been fetched"
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
 *         description: Failed to fetch categories
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:page/:limit").get(getAllCategories)

export default router;