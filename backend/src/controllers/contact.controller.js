import mongoose from "mongoose";
import Contact from "../models/contact.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { pagination } from "../utils/pagination.js";
import { Config } from "../models/config.model.js";
import { agenda } from "../db/agenda.db.js";

const STATUSES = ["Accepted", "Rejected", "Pending"];

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createContact = asynchandler(async (req, res) => {
    const { name, mobile, email, query } = req?.body || {};

    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof mobile !== "string" ||
        mobile.trim() === "" ||
        typeof query !== "string" ||
        query.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "All required fields are required")
        )
    }

    // email is optional in the schema
    if (email !== undefined && email !== null && typeof email !== "string") {
        return res.status(400).json(
            ApiResponse(false, "Invalid email")
        )
    }

    const contact = await Contact.create({
        name: name.trim(),
        mobile: mobile.trim(),
        email: typeof email === "string" ? email.trim().toLowerCase() : undefined,
        query: query.trim(),
        createdAt: new Date()
    })

    if (!contact) {
        return res.status(500).json(
            ApiResponse(false, "Contact creation has been failed")
        )
    }

    const config = await Config.findOne()
    if (Array.isArray(config.notifyEmails) && config.notifyEmails.length > 0) {
        const emails = config.notifyEmails
        emails.map(async (email) => {
            await agenda.now("send_query_email", {
                query: contact,
                email: email
            })

            console.log("[INFO] Email job set")
        })
    }

    return res.status(201).json(
        ApiResponse(true, "Contact created successfully")
    )
})

const getAllContacts = asynchandler(async (req, res) => {
    const { page, limit } = req.params
    const { search, status, startDate, endDate } = req.query
    let splittedData, totalPage
    let aggregationArray = []

    if (isNaN(Number(limit)) || isNaN(Number(page))) {
        return res.status(400).json(ApiResponse(false, "Limit and page should be a number"))
    }

    if (search !== undefined && String(search).trim() !== "") {
        const searchReg = new RegExp(escapeRegex(String(search).trim()), "i")

        aggregationArray.push({
            $match: {
                $or: [
                    { name: searchReg },
                    { mobile: searchReg },
                    { email: searchReg },
                    { query: searchReg },
                ]
            }
        })
    }

    if (status !== undefined && String(status).trim() !== "") {
        if (!STATUSES.includes(status)) {
            return res.status(400).json(ApiResponse(false, "Invalid status"))
        }

        aggregationArray.push({ $match: { status } })
    }

    if (
        typeof startDate === "string" && !isNaN(new Date(startDate).getTime()) &&
        typeof endDate === "string" && !isNaN(new Date(endDate).getTime())
    ) {
        aggregationArray.push({
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }
        })
    }

    // sorting (latest first)
    aggregationArray.push({ $sort: { _id: -1 } })

    const data = await Contact.aggregate(aggregationArray)
    if (!Array.isArray(data) || data.length === 0) {
        return res.status(200).json(ApiResponse(true, "No queries has been fetched", []))
    }

    try {
        const { newData, totalPages } = pagination(page, Number(limit), data)
        totalPage = totalPages
        splittedData = newData
    } catch (error) {
        console.log(error)
        return res.status(500).json(ApiResponse(false, "Something went wrong"))
    }

    const finalData = {
        totalPages: totalPage,
        data: splittedData,
        currentPage: Number(page)
    }

    return res.status(200).json(ApiResponse(true, "Queries fetched", finalData))
})

const getContactById = asynchandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json(ApiResponse(false, "Invalid contact id"))
    }

    const contact = await Contact.findById(id)

    if (!contact) {
        return res.status(404).json(ApiResponse(false, "Contact not found"))
    }

    return res.status(200).json(ApiResponse(true, "Contact fetched", contact))
})

const updateContact = asynchandler(async (req, res) => {
    const { id } = req.params
    const { name, mobile, email, query, status } = req?.body || {}

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json(ApiResponse(false, "Invalid contact id"))
    }

    const updateData = {}

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json(ApiResponse(false, "Invalid name"))
        }
        updateData.name = name.trim()
    }

    if (mobile !== undefined) {
        if (typeof mobile !== "string" || mobile.trim() === "") {
            return res.status(400).json(ApiResponse(false, "Invalid mobile"))
        }
        updateData.mobile = mobile.trim()
    }

    if (email !== undefined) {
        if (typeof email !== "string") {
            return res.status(400).json(ApiResponse(false, "Invalid email"))
        }
        updateData.email = email.trim().toLowerCase()
    }

    if (query !== undefined) {
        if (typeof query !== "string" || query.trim() === "") {
            return res.status(400).json(ApiResponse(false, "Invalid query"))
        }
        updateData.query = query.trim()
    }

    if (status !== undefined) {
        if (!STATUSES.includes(status)) {
            return res.status(400).json(ApiResponse(false, "Invalid status"))
        }
        updateData.status = status
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json(ApiResponse(false, "No valid fields provided to update"))
    }

    const contact = await Contact.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    )

    if (!contact) {
        return res.status(404).json(ApiResponse(false, "Contact not found"))
    }

    return res.status(200).json(ApiResponse(true, "Contact updated successfully", contact))
})

export {
    createContact,
    getAllContacts,
    getContactById,
    updateContact
}