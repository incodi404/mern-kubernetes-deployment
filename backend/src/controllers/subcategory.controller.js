import mongoose from "mongoose";
import { BLOCKS } from "../blocks.js";
import { Category, Subcategory } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { TOTAL_MAX_FILE } from "../constant.js";
import { deleteFile } from "../utils/fileDeletion.js";
import { pagination } from "../utils/pagination.js";

// POST /api/v1/subcategory
const createSubCategory = asynchandler(async (req, res) => {
    const {
        name,
        catagoryId,
        block
    } = req?.body

    if (
        typeof name !== "string" ||
        name?.trim() === "" ||
        !catagoryId ||
        !mongoose.Types.ObjectId.isValid(catagoryId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Name and valid catagoryId are required")
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
            ApiResponse(false, "Invalid block")
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
        }
    }

    if (image === "") {
        return res.status(400).json(
            ApiResponse(false, "Subcategory image is required")
        )
    }

    const category = await Category.findById(catagoryId)

    if (!category) {
        deleteFile(image)

        return res.status(404).json(
            ApiResponse(false, "Category not found")
        )
    }

    const existingSubCategory = await Subcategory.findOne({
        name: name?.trim(),
        catagoryId
    })

    if (existingSubCategory) {
        deleteFile(image)

        return res.status(409).json(
            ApiResponse(
                false,
                "Subcategory already exists in this category"
            )
        )
    }

    const subCategory = await Subcategory.create({
        name: name?.trim(),
        catagoryId,
        image,
        block: category?.block
    })

    if (!subCategory) {
        deleteFile(image)

        return res.status(500).json(
            ApiResponse(false, "Subcategory creation has been failed")
        )
    }

    return res.status(201).json(
        ApiResponse(
            true,
            "Subcategory created successfully",
            subCategory
        )
    )
})

// PUT /api/v1/subcategory/:subCategoryId
const updateSubCategory = asynchandler(async (req, res) => {
    const { subCategoryId } = req?.params

    const {
        name,
        catagoryId,
        isActive,
        block
    } = req?.body

    if (
        !subCategoryId ||
        !mongoose.Types.ObjectId.isValid(subCategoryId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid subCategoryId")
        )
    }

    const existingSubCategory = await Subcategory.findById(
        subCategoryId
    )

    if (!existingSubCategory) {
        return res.status(404).json(
            ApiResponse(false, "Subcategory not found")
        )
    }

    const updateData = {}

    if (
        typeof name === "string" &&
        name?.trim() !== ""
    ) {
        updateData.name = name?.trim()
    }

    if (catagoryId !== undefined) {
        if (
            !catagoryId ||
            !mongoose.Types.ObjectId.isValid(catagoryId)
        ) {
            return res.status(400).json(
                ApiResponse(false, "Invalid catagoryId")
            )
        }

        const category = await Category.findById(catagoryId)

        if (!category) {
            return res.status(404).json(
                ApiResponse(false, "Category not found")
            )
        }

        updateData.catagoryId = catagoryId
    }

    const rawImage = req?.file
    let newImage = ""

    if (
        rawImage &&
        String(rawImage?.filename).trim() !== ""
    ) {
        if (Number(rawImage?.size) < TOTAL_MAX_FILE) {
            newImage = rawImage?.filename
        } else {
            deleteFile(rawImage?.filename)
        }
    }

    if (newImage !== "") {
        updateData.image = newImage
    }

    if (isActive === "true" || isActive === "false") {
        updateData.isActive = isActive
    }

    if (
        typeof block === "string" &&
        BLOCKS?.includes(block?.trim())
    ) {
        updateData.block = block?.trim()
    }

    if (
        updateData.name ||
        updateData.catagoryId
    ) {
        const duplicateSubCategory = await Subcategory.findOne({
            name:
                updateData.name ||
                existingSubCategory?.name,

            catagoryId:
                updateData.catagoryId ||
                existingSubCategory?.catagoryId,

            _id: {
                $ne: subCategoryId
            }
        })

        if (duplicateSubCategory) {
            if (newImage !== "") {
                deleteFile(newImage)
            }

            return res.status(409).json(
                ApiResponse(
                    false,
                    "Subcategory already exists in this category"
                )
            )
        }
    }

    const updatedSubCategory = await Subcategory.findByIdAndUpdate(
        subCategoryId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedSubCategory) {
        if (newImage !== "") {
            deleteFile(newImage)
        }

        return res.status(500).json(
            ApiResponse(false, "Subcategory update has been failed")
        )
    }

    if (
        newImage !== "" &&
        existingSubCategory?.image
    ) {
        deleteFile(existingSubCategory?.image)
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Subcategory updated successfully",
            updatedSubCategory
        )
    )
})

// DELETE /api/v1/subcategory/:subCategoryId
const deleteSubCategory = asynchandler(async (req, res) => {
    const { subCategoryId } = req?.params

    if (
        !subCategoryId ||
        !mongoose.Types.ObjectId.isValid(subCategoryId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid subCategoryId")
        )
    }

    const deletedSubCategory = await Subcategory.findByIdAndDelete(
        subCategoryId
    )

    if (!deletedSubCategory) {
        return res.status(500).json(
            ApiResponse(false, "Subcategory deletion has been failed")
        )
    }

    return res.status(200).json(
        ApiResponse(true, "Subcategory deleted successfully")
    )
})

// GET /api/v1/subcategory/:page/:limit
const getAllSubCategories = asynchandler(async (req, res) => {
    const { page, limit } = req?.params
    const {
        search,
        categoryName,
        isActive,
        block
    } = req?.query

    let splittedData, totalPage
    let aggregationArray = [
        {
            $lookup: {
                from: "categories",
                localField: "catagoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $addFields: {
                categoryName: {
                    $first: "$category.name"
                },
                category: {
                    $first: "$category"
                }
            }
        }
    ]

    if (isNaN(Number(limit)) || isNaN(Number(page))) {
        return res.status(400).json(
            ApiResponse(false, "Limit and page should be a number")
        )
    }

    if (
        categoryName !== undefined &&
        String(categoryName)?.trim() !== ""
    ) {
        const categoryNameReg = new RegExp(categoryName, "i")

        aggregationArray.push({
            $match: {
                categoryName: categoryNameReg
            }
        })
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

    if (
        isActive !== undefined &&
        ["true", "false"]?.includes(
            String(isActive)?.toLowerCase()
        )
    ) {
        aggregationArray.push({
            $match: {
                isActive:
                    String(isActive)?.toLowerCase() === "true"
            }
        })
    }

    if (
        typeof block === "string" &&
        block?.trim() !== "" &&
        BLOCKS?.includes(block)
    ) {
        aggregationArray.push({
            $match: {
                block
            }
        })
    }

    aggregationArray.push({
        $sort: {
            _id: -1
        }
    })

    const data = await Subcategory.aggregate(
        aggregationArray
    )

    if (!Array.isArray(data) || data?.length === 0) {
        return res.status(200).json(
            ApiResponse(
                true,
                "No subcategories has been fetched",
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
            "Subcategories fetched successfully",
            finalData
        )
    )
})

export {
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getAllSubCategories
}