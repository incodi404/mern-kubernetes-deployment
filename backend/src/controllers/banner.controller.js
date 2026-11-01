import mongoose from "mongoose"
import { Banner } from "../models/banner.model.js"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFile } from "../utils/fileDeletion.js"
import { TOTAL_MAX_FILE } from "../constant.js"

// ---------------------------------------------------------------------------
// CREATE BANNER
// ---------------------------------------------------------------------------
// POST /api/v1/banner
const createBanner = asynchandler(async (req, res) => {
    const { title, subtitle, link } = req?.body

    const rawImage = req?.file
    let image = ""

    if (
        rawImage &&
        String(rawImage?.filename).trim() !== ""
    ) {
        if (Number(rawImage?.size) < TOTAL_MAX_FILE) {
            image = rawImage?.filename
        } else {
            deleteFile(rawImage?.filename)
        }
    }

    if (
        typeof title !== "string" ||
        title?.trim() === ""
    ) {
        if (image !== "") deleteFile(image)

        return res.status(400).json(
            ApiResponse(false, "Banner title is required")
        )
    }

    if (
        subtitle !== undefined &&
        typeof subtitle !== "string"
    ) {
        if (image !== "") deleteFile(image)

        return res.status(400).json(
            ApiResponse(false, "Banner subtitle is invalid")
        )
    }

    if (
        link !== undefined &&
        typeof link !== "string"
    ) {
        if (image !== "") deleteFile(image)

        return res.status(400).json(
            ApiResponse(false, "Banner link is invalid")
        )
    }

    if (image === "") {
        return res.status(400).json(
            ApiResponse(false, "Banner image is required")
        )
    }

    const banner = await Banner.create({
        title: title?.trim(),
        subtitle: subtitle?.trim() || "",
        link: link?.trim() || "",
        image
    })

    if (!banner) {
        deleteFile(image)

        return res.status(500).json(
            ApiResponse(false, "Banner creation has been failed")
        )
    }

    return res.status(201).json(
        ApiResponse(true, "Banner created successfully", banner)
    )
})

// ---------------------------------------------------------------------------
// GET ALL BANNERS
// ---------------------------------------------------------------------------
// GET /api/v1/banner
const getBanners = asynchandler(async (req, res) => {
    const banners = await Banner.find({}).sort({ createdAt: -1 })

    return res.status(200).json(
        ApiResponse(true, "Banners fetched successfully", banners)
    )
})

// ---------------------------------------------------------------------------
// DELETE BANNER
// ---------------------------------------------------------------------------
// DELETE /api/v1/banner/:id
const deleteBanner = asynchandler(async (req, res) => {
    const { id } = req?.params

    if (
        typeof id !== "string" ||
        !mongoose.isValidObjectId(id)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Banner id is invalid")
        )
    }

    const banner = await Banner.findByIdAndDelete(id)

    if (!banner) {
        return res.status(404).json(
            ApiResponse(false, "Banner not found")
        )
    }

    if (
        typeof banner?.image === "string" &&
        banner?.image.trim() !== ""
    ) {
        deleteFile(banner?.image)
    }

    return res.status(200).json(
        ApiResponse(true, "Banner deleted successfully")
    )
})

// ---------------------------------------------------------------------------
// GET SINGLE BANNER BY ID
// ---------------------------------------------------------------------------
const getBannerById = asynchandler(async (req, res) => {
    const { id } = req?.params

    if (
        typeof id !== "string" ||
        !mongoose.isValidObjectId(id)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Banner id is invalid")
        )
    }

    const banner = await Banner.findById(id)

    if (!banner) {
        return res.status(404).json(
            ApiResponse(false, "Banner not found")
        )
    }

    return res.status(200).json(
        ApiResponse(true, "Banner fetched successfully", banner)
    )
})

export {
    createBanner,
    getBanners,
    getBannerById,
    deleteBanner
}