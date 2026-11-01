import { Router } from "express";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createProduct, deleteImage, deleteProduct, getAllProducts, updateProduct } from "../controllers/product.controller.js";
import { createInterestProduct, getAllInterestProducts } from "../controllers/interestedProduct.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/product:
 *   post:
 *     summary: Create a product
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - variant
 *               - subcategory
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hiking Backpack"
 *               subTitle:
 *                 type: string
 *                 example: "Premium outdoor backpack"
 *               description:
 *                 type: string
 *                 example: "A durable backpack suitable for trekking and hiking."
 *               variant:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - value
 *                     - mrp
 *                     - discount
 *                     - sellingPrice
 *                   properties:
 *                     value:
 *                       type: string
 *                       example: "30L"
 *                     mrp:
 *                       type: number
 *                       example: 2500
 *                     discount:
 *                       type: number
 *                       example: 10
 *                     sellingPrice:
 *                       type: number
 *                       example: 2250
 *               subcategory:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example:
 *                   - "68f987654321abcdef654321"
 *                   - "68f987654321abcdef654322"
 *               block:
 *                 type: string
 *                 example: "Header"
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "Featured"
 *                   - "Popular"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product created successfully"
 *               data:
 *                 _id: "68fa123456789abcdef123456"
 *                 title: "Hiking Backpack"
 *                 subTitle: "Premium outdoor backpack"
 *                 description: "A durable backpack suitable for trekking and hiking."
 *                 images:
 *                   - "backpack-1.jpg"
 *                   - "backpack-2.jpg"
 *                 variant:
 *                   - value: "30L"
 *                     variantId: "VAR1234"
 *                     mrp: 2500
 *                     discount: 10
 *                     sellingPrice: 2250
 *                 subcategory:
 *                   - "68f987654321abcdef654321"
 *                 block: "Header"
 *                 sections:
 *                   - "Featured"
 *                   - "Popular"
 *       400:
 *         description: Invalid product data
 *         content:
 *           application/json:
 *             examples:
 *               titleRequired:
 *                 summary: Title missing
 *                 value:
 *                   success: false
 *                   message: "Title is required"
 *               descriptionRequired:
 *                 summary: Description missing
 *                 value:
 *                   success: false
 *                   message: "Description is required"
 *               variantRequired:
 *                 summary: Variant missing
 *                 value:
 *                   success: false
 *                   message: "At least one variant is required"
 *               invalidVariantValue:
 *                 summary: Invalid variant value
 *                 value:
 *                   success: false
 *                   message: "Variant value is required"
 *               invalidVariantPrices:
 *                 summary: Invalid variant prices
 *                 value:
 *                   success: false
 *                   message: "Variant prices should be numbers"
 *               negativeVariantPrices:
 *                 summary: Negative variant price
 *                 value:
 *                   success: false
 *                   message: "Variant prices cannot be negative"
 *               subcategoryRequired:
 *                 summary: Subcategory missing
 *                 value:
 *                   success: false
 *                   message: "At least one subcategory is required"
 *               invalidSubcategory:
 *                 summary: Invalid subcategory ID
 *                 value:
 *                   success: false
 *                   message: "Invalid subcategory ID"
 *               subcategoryNotFound:
 *                 summary: Subcategory not found
 *                 value:
 *                   success: false
 *                   message: "One or more subcategories not found"
 *               invalidBlock:
 *                 summary: Invalid block
 *                 value:
 *                   success: false
 *                   message: "Invalid block"
 *               invalidSections:
 *                 summary: Invalid sections
 *                 value:
 *                   success: false
 *                   message: "One or more invalid sections"
 *               missingImages:
 *                 summary: Product images missing
 *                 value:
 *                   success: false
 *                   message: "At least one product image is required"
 *       500:
 *         description: Product creation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Product could not be created"
 */
router.route("/").post(adminVerify, upload.array("images", 3), createProduct)

/**
 * @swagger
 * /api/v1/product/{productId}:
 *   patch:
 *     summary: Update a product
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68fa123456789abcdef123456"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Premium Hiking Backpack"
 *               subTitle:
 *                 type: string
 *                 example: "Updated outdoor backpack"
 *               description:
 *                 type: string
 *                 example: "Updated product description."
 *               variant:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - value
 *                     - variantId
 *                     - mrp
 *                     - discount
 *                     - sellingPrice
 *                   properties:
 *                     value:
 *                       type: string
 *                       example: "40L"
 *                     variantId:
 *                       type: string
 *                       example: "VAR1234"
 *                     mrp:
 *                       type: number
 *                       example: 3000
 *                     discount:
 *                       type: number
 *                       example: 15
 *                     sellingPrice:
 *                       type: number
 *                       example: 2550
 *               subcategory:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "68f987654321abcdef654321"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               block:
 *                 type: string
 *                 example: "Header"
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "Featured"
 *                   - "Popular"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product updated successfully"
 *               data:
 *                 _id: "68fa123456789abcdef123456"
 *                 title: "Premium Hiking Backpack"
 *                 subTitle: "Updated outdoor backpack"
 *                 description: "Updated product description."
 *                 images:
 *                   - "backpack-1.jpg"
 *                   - "backpack-new.jpg"
 *                 isActive: true
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid product ID"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Product not found"
 *       500:
 *         description: Product update failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Product could not be updated"
 */
router.route("/:productId").put(adminVerify, upload.array("images", 3), updateProduct)

/**
 * @swagger
 * /api/v1/product/{productId}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68fa123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product deleted successfully"
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid product ID"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Product not found"
 *       500:
 *         description: Product deletion failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Product could not be deleted"
 */
router.route("/:productId").delete(adminVerify, deleteProduct)

router.route("/image/:productId/:image").delete(adminVerify, deleteImage)

/**
 * @swagger
 * /api/v1/product/{page}/{limit}:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         example: "backpack"
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         example: "Hiking"
 *       - in: query
 *         name: categoryName
 *         required: false
 *         schema:
 *           type: string
 *         example: "Adventure"
 *       - in: query
 *         name: subcategoryName
 *         required: false
 *         schema:
 *           type: string
 *         example: "Trekking"
 *       - in: query
 *         name: block
 *         required: false
 *         schema:
 *           type: string
 *         example: "Header"
 *       - in: query
 *         name: sections
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated section values
 *         example: "Featured,Popular"
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         example: true
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum selling price
 *         example: 1000
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum selling price
 *         example: 5000
 *       - in: query
 *         name: variantId
 *         required: false
 *         schema:
 *           type: string
 *         example: "VAR1234"
 *       - in: query
 *         name: variantValue
 *         required: false
 *         schema:
 *           type: string
 *         example: "30L"
 *     responses:
 *       200:
 *         description: Products fetched successfully. Returns either an empty array or paginated product data.
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
 *                       example: "Products fetched successfully"
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "68fa123456789abcdef123456"
 *                               title:
 *                                 type: string
 *                                 example: "Hiking Backpack"
 *                               subTitle:
 *                                 type: string
 *                                 example: "Premium outdoor backpack"
 *                               description:
 *                                 type: string
 *                                 example: "A durable backpack suitable for trekking."
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               variant:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     value:
 *                                       type: string
 *                                       example: "30L"
 *                                     variantId:
 *                                       type: string
 *                                       example: "VAR1234"
 *                                     mrp:
 *                                       type: number
 *                                       example: 2500
 *                                     discount:
 *                                       type: number
 *                                       example: 10
 *                                     sellingPrice:
 *                                       type: number
 *                                       example: 2250
 *                               subcategory:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               subcategories:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                               categories:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                               block:
 *                                 type: string
 *                               sections:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               isActive:
 *                                 type: boolean
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
 *                       example: "No products found"
 *                     data:
 *                       type: array
 *                       example: []
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Page and limit should be a number and greater than 0"
 *       500:
 *         description: Failed to fetch products
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
 */
router.route("/:page/:limit").get(getAllProducts)

// interested products
router.route("/interested").post(createInterestProduct)
router.route("/interested/:page/:limit").get(getAllInterestProducts)


export default router;