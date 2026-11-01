import { Router } from "express";
import {
    createAdmin,
    adminLogin,
    generateOtpAdmin,
    verifyAdminOtp,
    adminForgotPassword,
    getAdmin,
    getAllAdmin,
    adminLogout
} from "../controllers/admin.controller.js";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 */

/**
 * @swagger
 * /api/v1/admin/create:
 *   post:
 *     summary: Create a new admin
 *     description: Creates a new admin account. Requires the requester to be an authenticated and verified admin.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       401:
 *         description: Missing required fields (name, email, or password)
 *       409:
 *         description: Admin with this email already exists
 *       500:
 *         description: Admin creation or token generation failed
 */
router.route("/create").post(adminVerify, createAdmin);

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin with email and password, and sets an accessToken cookie on success.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       200:
 *         description: Admin logged in successfully; accessToken cookie is set
 *       401:
 *         description: Email and password are required
 *       403:
 *         description: Password is incorrect
 *       404:
 *         description: User not found
 *       500:
 *         description: Token generation failed
 */
router.route("/login").post(adminLogin);

/**
 * @swagger
 * /api/v1/admin/generate-otp:
 *   post:
 *     summary: Generate OTP for admin account verification
 *     description: Generates a 4-digit OTP for the given admin email and sends it via email.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: OTP has been generated and emailed
 *       400:
 *         description: Email is required
 *       404:
 *         description: Admin not found
 *       500:
 *         description: OTP generation, save, or email sending failed
 */
router.route("/generate-otp").post(generateOtpAdmin);

/**
 * @swagger
 * /api/v1/admin/verify-otp:
 *   post:
 *     summary: Verify admin OTP
 *     description: Verifies the OTP sent to the admin's email and returns a short-lived verified token (used for password reset).
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, givenOtp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               givenOtp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Verification completed; returns a verified token
 *       400:
 *         description: Email and OTP are required
 *       403:
 *         description: OTP is incorrect
 *       404:
 *         description: OTP not found for this email
 *       500:
 *         description: Verified token generation failed
 */
router.route("/verify-otp").post(verifyAdminOtp);

/**
 * @swagger
 * /api/v1/admin/forgot-password:
 *   post:
 *     summary: Reset admin password
 *     description: Sets a new password for the admin identified by a previously issued verified token.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, verifiedToken]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongP@ss1
 *               verifiedToken:
 *                 type: string
 *                 description: Token returned by /verify-otp
 *     responses:
 *       200:
 *         description: New password created
 *       400:
 *         description: Verified token and password are required, or token is invalid
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Password hashing failed
 */
router.route("/forgot-password").post(adminForgotPassword);

/**
 * @swagger
 * /api/v1/admin/me:
 *   get:
 *     summary: Get current admin
 *     description: Returns the profile of the currently authenticated admin.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin fetched successfully
 *       401:
 *         description: Unauthorized - invalid or missing access token
 */
router.route("/me").get(adminVerify, getAdmin);

/**
 * @swagger
 * /api/v1/admin/all:
 *   get:
 *     summary: Get all admins
 *     description: Returns a list of all admin accounts. Requires an authenticated admin.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admins have been fetched successfully
 *       401:
 *         description: Unauthorized - invalid or missing access token
 */
router.route("/all").get(adminVerify, getAllAdmin);

router.route("/dashboard").get(adminVerify, getDashboard);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logs out the current admin by clearing the accessToken cookie.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *       401:
 *         description: Unauthorized - invalid or missing access token
 */
router.route("/logout").post(adminVerify, adminLogout);

export default router;