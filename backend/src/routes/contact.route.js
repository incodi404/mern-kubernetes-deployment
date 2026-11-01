import { Router } from "express";
import {
    createContact,
    getAllContacts,
    getContactById,
    updateContact
} from "../controllers/contact.controller.js";
import { adminVerify } from "../middlewares/adminVerify.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Create a contact inquiry
 *     description: >
 *       Creates a new contact inquiry with the visitor's name, mobile number,
 *       optional email and their query. The status defaults to Pending.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobile
 *               - query
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dipankar Chowdhury"
 *                 description: "Name of the person making the inquiry"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *                 description: "Mobile number of the person making the inquiry"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "dipankar@example.com"
 *                 description: "Email address of the person (optional)"
 *               query:
 *                 type: string
 *                 example: "I want to know about the Darjeeling package for 3 nights."
 *                 description: "Message or question from the person"
 *     responses:
 *       201:
 *         description: Contact created successfully
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
 *                   example: "Contact created successfully"
 *       400:
 *         description: Invalid or missing contact information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     requiredFields:
 *                       value: "All required fields are required"
 *                     invalidEmail:
 *                       value: "Invalid email"
 *       500:
 *         description: Contact creation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contact creation has been failed"
 */
router.route("/").post(createContact);

/**
 * @swagger
 * /api/v1/contact/{page}/{limit}:
 *   get:
 *     summary: Get all contact inquiries
 *     description: >
 *       Fetches contact inquiries with pagination, latest first. Supports
 *       searching by name, mobile, email or query, filtering by status,
 *       and filtering by the date the inquiry was created.
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *         description: "Page number"
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 10
 *         description: "Number of contact inquiries per page"
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         example: "Darjeeling"
 *         description: "Search by name, mobile, email or query"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - Accepted
 *             - Rejected
 *             - Pending
 *         example: "Pending"
 *         description: "Filter by inquiry status"
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-10-01"
 *         description: "Start of the created-at range (use together with endDate)"
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-10-31"
 *         description: "End of the created-at range (use together with startDate)"
 *     responses:
 *       200:
 *         description: Contact inquiries fetched successfully
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
 *                   examples:
 *                     success:
 *                       value: "Queries fetched"
 *                     empty:
 *                       value: "No queries has been fetched"
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Contact'
 *                     - type: array
 *                       items: {}
 *                       example: []
 *       400:
 *         description: Invalid page, limit or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidPagination:
 *                       value: "Limit and page should be a number"
 *                     invalidStatus:
 *                       value: "Invalid status"
 *       500:
 *         description: Failed to fetch contact inquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.route("/:page/:limit").get(adminVerify, getAllContacts);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   get:
 *     summary: Get a contact inquiry by id
 *     description: Fetches a single contact inquiry using its MongoDB id.
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6710f3a2c9e77b001f3a4d21"
 *         description: "Id of the contact inquiry"
 *     responses:
 *       200:
 *         description: Contact fetched successfully
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
 *                   example: "Contact fetched"
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid contact id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid contact id"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
 */
router.route("/:id").get(adminVerify, getContactById);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   patch:
 *     summary: Update a contact inquiry
 *     description: >
 *       Updates one or more fields of a contact inquiry. Only the fields
 *       sent in the body are changed. Typically used to change the status
 *       to Accepted or Rejected.
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6710f3a2c9e77b001f3a4d21"
 *         description: "Id of the contact inquiry"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dipankar Chowdhury"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "dipankar@example.com"
 *               query:
 *                 type: string
 *                 example: "Please share the package details."
 *               status:
 *                 type: string
 *                 enum:
 *                   - Accepted
 *                   - Rejected
 *                   - Pending
 *                 example: "Accepted"
 *     responses:
 *       200:
 *         description: Contact updated successfully
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
 *                   example: "Contact updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid id or invalid field value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidId:
 *                       value: "Invalid contact id"
 *                     invalidName:
 *                       value: "Invalid name"
 *                     invalidMobile:
 *                       value: "Invalid mobile"
 *                     invalidEmail:
 *                       value: "Invalid email"
 *                     invalidQuery:
 *                       value: "Invalid query"
 *                     invalidStatus:
 *                       value: "Invalid status"
 *                     noFields:
 *                       value: "No valid fields provided to update"
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
 */
router.route("/:id").patch(adminVerify, updateContact);

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6710f3a2c9e77b001f3a4d21"
 *         name:
 *           type: string
 *           example: "Dipankar Chowdhury"
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         email:
 *           type: string
 *           format: email
 *           example: "dipankar@example.com"
 *         query:
 *           type: string
 *           example: "I want to know about the Darjeeling package for 3 nights."
 *         status:
 *           type: string
 *           enum:
 *             - Accepted
 *             - Rejected
 *             - Pending
 *           example: "Pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-12T08:30:00.000Z"
 */

export default router