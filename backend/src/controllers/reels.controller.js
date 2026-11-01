import mongoose from "mongoose";
import Reel from "../models/reels.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { pagination } from "../utils/pagination.js";

// POST /api/v1/reels
const createReel = asynchandler(async (req, res) => {
    const { title, url, active } = req?.body

    if (
        typeof title !== "string" ||
        title?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Reel title is required")
        )
    }

    if (title?.trim()?.length > 150) {
        return res.status(400).json(
            ApiResponse(false, "Title cannot exceed 150 characters")
        )
    }

    if (
        typeof url !== "string" ||
        url?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Reel URL is required")
        )
    }

    if (
        active !== undefined &&
        typeof active !== "boolean"
    ) {
        return res.status(400).json(
            ApiResponse(false, "Active should be a boolean")
        )
    }

    const reelData = {
        title: title?.trim(),
        url: url?.trim()
    }

    if (typeof active === "boolean") {
        reelData.active = active
    }

    let reel

    try {
        // schema validators (URL format) and slug generation run here
        reel = await Reel.create(reelData)
    } catch (error) {
        if (error?.name === "ValidationError") {
            const message = Object.values(error?.errors || {})[0]?.message || "Invalid reel data"

            return res.status(400).json(
                ApiResponse(false, message)
            )
        }

        console.log(error)

        return res.status(500).json(
            ApiResponse(false, "Reel creation has been failed")
        )
    }

    if (!reel) {
        return res.status(500).json(
            ApiResponse(false, "Reel creation has been failed")
        )
    }

    return res.status(201).json(
        ApiResponse(true, "Reel created successfully", reel)
    )
})

// DELETE /api/v1/reels/:reelId
const deleteReel = asynchandler(async (req, res) => {
    const { reelId } = req?.params

    if (
        !reelId ||
        !mongoose.Types.ObjectId.isValid(reelId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid reelId")
        )
    }

    const deletedReel = await Reel.findByIdAndDelete(reelId)

    if (!deletedReel) {
        return res.status(404).json(
            ApiResponse(false, "Reel not found")
        )
    }

    return res.status(200).json(
        ApiResponse(true, "Reel deleted successfully")
    )
})

// GET /api/v1/reels/:slug
const getReelBySlug = asynchandler(async (req, res) => {
    const { slug } = req?.params

    if (
        typeof slug !== "string" ||
        slug?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Slug is required")
        )
    }

    const reel = await Reel.findOne({
        slug: slug?.trim()?.toLowerCase()
    })

    if (!reel) {
        return res.status(404).json(
            ApiResponse(false, "Reel not found")
        )
    }

    return res.status(200).json(
        ApiResponse(true, "Reel fetched successfully", reel)
    )
})

// GET /api/v1/reels/:page/:limit
const getAllReels = asynchandler(async (req, res) => {
    const { page, limit } = req?.params
    const { search, active } = req?.query

    let splittedData, totalPage
    let aggregationArray = []

    if (isNaN(Number(limit)) || isNaN(Number(page))) {
        return res.status(400).json(
            ApiResponse(false, "Limit and page should be a number")
        )
    }

    if (
        search !== undefined &&
        String(search)?.trim() !== ""
    ) {
        // escape special regex characters so user input is treated literally
        const escaped = String(search)?.trim()?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const searchReg = new RegExp(escaped, "i")

        aggregationArray.push({
            $match: {
                title: searchReg
            }
        })
    }

    if (
        active !== undefined &&
        ["true", "false"].includes(String(active)?.toLowerCase())
    ) {
        aggregationArray.push({
            $match: {
                active: String(active)?.toLowerCase() === "true"
            }
        })
    }

    aggregationArray.push({
        $sort: {
            _id: -1
        }
    })

    const data = await Reel.aggregate(aggregationArray)

    if (!Array.isArray(data) || data?.length === 0) {
        return res.status(200).json(
            ApiResponse(
                true,
                "No reels has been fetched",
                []
            )
        )
    }

    // aggregate() returns plain objects, so virtuals (embedUrl) are not included
    const reels = data.map((reel) => {
        const clean = String(reel?.url).split("?")[0].replace(/\/$/, "")

        return {
            ...reel,
            embedUrl: `${clean}/embed`
        }
    })

    try {
        const { newData, totalPages } = pagination(
            page,
            Number(limit),
            reels
        )

        totalPage = totalPages
        splittedData = newData
    } catch (error) {
        console.log(error)

        return res.status(500).json(
            ApiResponse(false, "Something went wrong")
        )
    }

    const finalData = {
        totalPages: totalPage,
        data: splittedData,
        currentPage: Number(page)
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Reels fetched successfully",
            finalData
        )
    )
})

export {
    createReel,
    deleteReel,
    getReelBySlug,
    getAllReels
}