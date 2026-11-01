import mongoose from "mongoose";
import { Category } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { BLOCKS } from "../blocks.js";
import { pagination } from "../utils/pagination.js";
import { deleteFile } from "../utils/fileDeletion.js";
import { TOTAL_MAX_FILE } from "../constant.js";

// POST /api/v1/category
const createCategory = asynchandler(async (req, res) => {
    const { name, block } = req?.body

    if (
        typeof name !== "string" ||
        name?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Category name is required")
        )
    }

    if (
        block !== undefined &&
        (
            typeof block !== "string" ||
            !BLOCKS?.includes(block?.trim())
        )
    ) {
        return res.status(400).json(
            ApiResponse(false, "Block is invalid")
        )
    }

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
            return res.status(400).json(
                ApiResponse(false, "Category image is too large")
            )
        }
    }

    if (image === "") {
        return res.status(400).json(
            ApiResponse(false, "Category image is required")
        )
    }

    const existingCategory = await Category.findOne({
        name: name?.trim()
    })

    if (existingCategory) {
        deleteFile(image)

        return res.status(409).json(
            ApiResponse(false, "Category with this name already exists")
        )
    }

    const category = await Category.create({
        name: name?.trim(),
        image,
        block: block
    })

    if (!category) {
        deleteFile(image)

        return res.status(500).json(
            ApiResponse(false, "Category creation has been failed")
        )
    }

    return res.status(201).json(
        ApiResponse(true, "Category created successfully", category)
    )
})

// PUT /api/v1/category/:categoryId
const updateCategory = asynchandler(async (req, res) => {
    const { categoryId } = req?.params
    const { name, isActive, block } = req?.body

    if (
        !categoryId ||
        !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid categoryId")
        )
    }

    const existingCategory = await Category.findById(categoryId)

    if (!existingCategory) {
        return res.status(404).json(
            ApiResponse(false, "Category not found")
        )
    }

    const updateData = {}

    let newImage = ""
    const rawImage = req?.file

    if (
        rawImage &&
        String(rawImage?.filename).trim() !== ""
    ) {
        if (Number(rawImage?.size) < TOTAL_MAX_FILE) {
            newImage = rawImage?.filename
        } else {
            deleteFile(rawImage?.filename)
            return res.status(400).json(
                ApiResponse(false, "Category image is too large")
            )
        }
    }

    console.log(rawImage)

    if (newImage !== "") {
        updateData.image = newImage
    }

    if (typeof isActive === "boolean") {
        updateData.isActive = isActive
    }

    if (
        typeof name === "string" &&
        name?.trim() !== ""
    ) {
        updateData.name = name?.trim()
    }

    if (
        block !== undefined &&
        typeof block === "string" &&
        BLOCKS?.includes(block?.trim())
    ) {
        updateData.block = block?.trim()
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedCategory) {
        if (newImage !== "") {
            deleteFile(newImage)
        }

        return res.status(500).json(
            ApiResponse(false, "Category update has been failed")
        )
    }

    if (
        newImage !== "" &&
        existingCategory?.image
    ) {
        deleteFile(existingCategory?.image)
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Category updated successfully",
            updatedCategory
        )
    )
})

// DELETE /api/v1/category/:categoryId
const deleteCategory = asynchandler(async (req, res) => {
    const { categoryId } = req?.params

    if (
        !categoryId ||
        !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid categoryId")
        )
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId)

    if (!deletedCategory) {
        return res.status(500).json(
            ApiResponse(false, "Category deletion has been failed")
        )
    }

    return res.status(200).json(
        ApiResponse(true, "Category deleted successfully")
    )
})

// GET /api/v1/category/:page/:limit
const getAllCategories = asynchandler(async (req, res) => {
    const { page, limit } = req?.params
    const { search, isActive, block } = req?.query

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
        const searchReg = new RegExp(search, "i")

        aggregationArray.push({
            $match: {
                name: searchReg
            }
        })
    }

    if (typeof block === "string" && BLOCKS.includes(block.trim())) {
        aggregationArray.push({
            $match: {
                block: block.trim()
            }
        })
    }

    if (
        isActive !== undefined &&
        ["true", "false"].includes(String(isActive)?.toLowerCase())
    ) {
        aggregationArray.push({
            $match: {
                isActive: String(isActive)?.toLowerCase() === "true"
            }
        })
    }

    aggregationArray.push({
        $sort: {
            _id: -1
        }
    })

    const data = await Category.aggregate(aggregationArray)

    if (!Array.isArray(data) || data?.length === 0) {
        return res.status(200).json(
            ApiResponse(
                true,
                "No categories has been fetched",
                []
            )
        )
    }

    try {
        const { newData, totalPages } = pagination(
            page,
            Number(limit),
            data
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
            "Categories fetched successfully",
            finalData
        )
    )
})

export {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories
}