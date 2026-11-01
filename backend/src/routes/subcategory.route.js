import { Router } from "express";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createSubCategory, deleteSubCategory, getAllSubCategories, updateSubCategory } from "../controllers/subcategory.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/subcategory:
 *   post:
 *     summary: Create a subcategory
 *     tags:
 *       - Subcategory
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - catagoryId
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Trekking"
 *               catagoryId:
 *                 type: string
 *                 example: "68f123456789abcdef123456"
 *               block:
 *                 type: string
 *                 description: Subcategory block
 *                 example: "Header"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Subcategory created successfully"
 *               data:
 *                 _id: "68f987654321abcdef654321"
 *                 name: "Trekking"
 *                 catagoryId: "68f123456789abcdef123456"
 *                 image: "trekking-1728123456.jpg"
 *                 block: "Header"
 *                 isActive: true
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               invalidFields:
 *                 summary: Invalid name or category ID
 *                 value:
 *                   success: false
 *                   message: "Name and valid catagoryId are required"
 *               invalidBlock:
 *                 summary: Invalid block
 *                 value:
 *                   success: false
 *                   message: "Invalid block"
 *               missingImage:
 *                 summary: Missing image
 *                 value:
 *                   success: false
 *                   message: "Subcategory image is required"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category not found"
 *       409:
 *         description: Subcategory already exists in the category
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subcategory already exists in this category"
 *       500:
 *         description: Subcategory creation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subcategory creation has been failed"
 */
router.route("/").post(adminVerify, upload.single("image"), createSubCategory)

/**
 * @swagger
 * /api/v1/subcategory/{subCategoryId}:
 *   put:
 *     summary: Update a subcategory
 *     tags:
 *       - Subcategory
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f987654321abcdef654321"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mountain Trekking"
 *               catagoryId:
 *                 type: string
 *                 example: "68f123456789abcdef123456"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               block:
 *                 type: string
 *                 example: "Header"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Subcategory updated successfully"
 *               data:
 *                 _id: "68f987654321abcdef654321"
 *                 name: "Mountain Trekking"
 *                 catagoryId: "68f123456789abcdef123456"
 *                 image: "mountain-trekking-1728123456.jpg"
 *                 block: "Header"
 *                 isActive: true
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               invalidSubCategoryId:
 *                 summary: Invalid subcategory ID
 *                 value:
 *                   success: false
 *                   message: "Invalid subCategoryId"
 *               invalidCategoryId:
 *                 summary: Invalid category ID
 *                 value:
 *                   success: false
 *                   message: "Invalid catagoryId"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             examples:
 *               subcategoryNotFound:
 *                 summary: Subcategory not found
 *                 value:
 *                   success: false
 *                   message: "Subcategory not found"
 *               categoryNotFound:
 *                 summary: Category not found
 *                 value:
 *                   success: false
 *                   message: "Category not found"
 *       409:
 *         description: Duplicate subcategory
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subcategory already exists in this category"
 *       500:
 *         description: Subcategory update failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subcategory update has been failed"
 */
router.route("/:subCategoryId").put(adminVerify, upload.single("image"), updateSubCategory)

/**
 * @swagger
 * /api/v1/subcategory/{subCategoryId}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags:
 *       - Subcategory
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68f987654321abcdef654321"
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Subcategory deleted successfully"
 *       400:
 *         description: Invalid subcategory ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid subCategoryId"
 *       500:
 *         description: Subcategory deletion failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subcategory deletion has been failed"
 */
router.route("/:subCategoryId").delete(adminVerify, deleteSubCategory)

/**
 * @swagger
 * /api/v1/subcategory/{page}/{limit}:
 *   get:
 *     summary: Get all subcategories
 *     tags:
 *       - Subcategory
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
 *         description: Search subcategories by name
 *         example: "Trekking"
 *       - in: query
 *         name: categoryName
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category name
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
 *         description: Subcategories fetched successfully. Returns either an empty array or paginated subcategory data.
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
 *                       example: "Subcategories fetched successfully"
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
 *                                 example: "68f987654321abcdef654321"
 *                               name:
 *                                 type: string
 *                                 example: "Trekking"
 *                               catagoryId:
 *                                 type: string
 *                                 example: "68f123456789abcdef123456"
 *                               image:
 *                                 type: string
 *                                 example: "trekking-1728123456.jpg"
 *                               block:
 *                                 type: string
 *                                 example: "Header"
 *                               isActive:
 *                                 type: boolean
 *                                 example: true
 *                               categoryName:
 *                                 type: string
 *                                 example: "Adventure"
 *                               category:
 *                                 type: object
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
 *                       example: "No subcategories has been fetched"
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
 *         description: Failed to fetch subcategories
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:page/:limit").get(getAllSubCategories)

export default router;