import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { Product, Subcategory } from "../models/product.model.js";
import { BLOCKS } from "../blocks.js";
import { SECTIONS } from "../sections.js";
import { TOTAL_MAX_FILE } from "../constant.js";
import { deleteFile } from "../utils/fileDeletion.js";
import { filtrationClass } from "../class/Filtration.class.js";
import { calculateSkip } from "../utils/calculateSkip.js";
import { dbPagination } from "../utils/pagination.js";
import { dbPaginationPipeline } from "../utils/dbPaginationPipeline.js";
import { validateAndParseJSON } from "../utils/validateAndParseJSON.js";

// POST /api/v1/product
const createProduct = asynchandler(async (req, res) => {
    const {
        title,
        subTitle,
        description,
        variant,
        subcategory,
        block,
        sections,
        rating
    } = req?.body

    if (
        typeof title !== "string" ||
        title?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Title is required")
        )
    }

    if (
        typeof description !== "string" ||
        description?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Description is required")
        )
    }

    const parsedVariants = validateAndParseJSON(variant)

    if (
        !Array.isArray(parsedVariants) ||
        parsedVariants?.length === 0
    ) {
        return res.status(400).json(
            ApiResponse(false, "At least one variant is required")
        )
    }

    for (const item of parsedVariants) {
        if (
            typeof item?.value !== "string" ||
            item?.value?.trim() === ""
        ) {
            return res.status(400).json(
                ApiResponse(false, "Variant value is required")
            )
        }

        item.variantId = `VAR${Math.floor(1000 + (Math.random() * 9000))}`

        if (
            typeof item?.mrp !== "number" ||
            typeof item?.discount !== "number" ||
            typeof item?.sellingPrice !== "number"
        ) {
            return res.status(400).json(
                ApiResponse(false, "Variant prices should be numbers")
            )
        }

        if (
            item?.mrp < 0 ||
            item?.discount < 0 ||
            item?.sellingPrice < 0
        ) {
            return res.status(400).json(
                ApiResponse(false, "Variant prices cannot be negative")
            )
        }
    }

    const parsedSubcategories = validateAndParseJSON(subcategory)

    if (
        !Array.isArray(parsedSubcategories) ||
        parsedSubcategories?.length === 0
    ) {
        return res.status(400).json(
            ApiResponse(false, "At least one subcategory is required")
        )
    }

    const invalidSubcategory = parsedSubcategories?.some(
        id => !mongoose.Types.ObjectId.isValid(id)
    )

    if (invalidSubcategory) {
        return res.status(400).json(
            ApiResponse(false, "Invalid subcategory ID")
        )
    }

    const subcategoryCount = await Subcategory.countDocuments({
        _id: {
            $in: parsedSubcategories
        }
    })

    if (subcategoryCount !== parsedSubcategories?.length) {
        return res.status(400).json(
            ApiResponse(false, "One or more subcategories not found")
        )
    }

    if (
        block !== undefined &&
        (
            typeof block !== "string" ||
            !BLOCKS?.includes(block)
        )
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid block")
        )
    }

    const parsedSections = validateAndParseJSON(sections)

    if (sections !== undefined) {
        if (!Array.isArray(parsedSections)) {
            return res.status(400).json(
                ApiResponse(false, "Sections should be an array")
            )
        }

        const invalidSection = parsedSections?.some(
            section =>
                typeof section !== "string" ||
                !SECTIONS?.includes(section)
        )

        if (invalidSection) {
            return res.status(400).json(
                ApiResponse(false, "One or more invalid sections")
            )
        }
    }

    const rawImages = req.files
    let images = []
    if (Array.isArray(rawImages) && rawImages.length > 0) {
        rawImages.map((img) => {
            if (img && String(img?.filename).trim() !== "") {
                if (Number(img?.size) < TOTAL_MAX_FILE) {
                    images.push(img?.filename)
                } else {
                    deleteFile(img?.filename)
                }
            }
        })
    }

    if (images?.length === 0) {
        return res.status(400).json(
            ApiResponse(false, "At least one product image is required")
        )
    }

    const existedProd = await Product.findOne({ title: title.trim() })
    if (existedProd) {
        return res.status(400).json(
            ApiResponse(false, "Title already exists")
        )
    }

    const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

    const product = await Product.create({
        title: title?.trim(),
        subTitle: subTitle?.trim(),
        description: description?.trim(),
        images,
        variant: parsedVariants,
        subcategory: parsedSubcategories,
        block: block,
        rating: rating || 0,
        sections: parsedSections || [],
        slug: slug
    })

    if (!product) {
        return res.status(500).json(
            ApiResponse(false, "Product could not be created")
        )
    }

    return res.status(201).json(
        ApiResponse(true, "Product created successfully", product)
    )
})

// PUT /api/v1/product/:productId

/* PUT /api/v1/product/:productId */
const updateProduct = asynchandler(async (req, res) => {
    const { productId } = req?.params

    const {
        title,
        subTitle,
        description,
        variant,
        subcategory,
        isActive,
        block,
        sections,
        rating
    } = req?.body

    // Validate product ID
    if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid product ID")
        )
    }

    const existingProduct = await Product.findById(productId)

    if (!existingProduct) {
        return res.status(404).json(
            ApiResponse(false, "Product not found")
        )
    }

    const updateData = {}

    // Helper: parse JSON strings or accept existing arrays
    const parseArrayField = (value, fieldName) => {
        if (Array.isArray(value)) {
            return value
        }

        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value)

                if (Array.isArray(parsed)) {
                    return parsed
                }
            } catch (error) {
                throw new Error(
                    `${fieldName} must be a valid JSON array`
                )
            }
        }

        throw new Error(
            `${fieldName} must be an array`
        )
    }

    // Update title and generate slug
    if (title !== undefined) {
        if (
            typeof title !== "string" ||
            title.trim() === ""
        ) {
            return res.status(400).json(
                ApiResponse(false, "Title cannot be empty")
            )
        }

        const trimmedTitle = title.trim()

        const existingTitle = await Product.findOne({
            title: trimmedTitle,
            _id: { $ne: productId }
        })

        if (existingTitle) {
            return res.status(400).json(
                ApiResponse(false, "Title already exists")
            )
        }

        const slug = trimmedTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")

        const existingSlug = await Product.findOne({
            slug,
            _id: { $ne: productId }
        })

        if (existingSlug) {
            return res.status(400).json(
                ApiResponse(false, "Product slug already exists")
            )
        }

        updateData.title = trimmedTitle
        updateData.slug = slug
    }

    // Update subtitle
    if (subTitle !== undefined) {
        if (typeof subTitle !== "string") {
            return res.status(400).json(
                ApiResponse(false, "Subtitle must be a string")
            )
        }

        updateData.subTitle = subTitle.trim()
    }

    // Update description
    if (description !== undefined) {
        if (
            typeof description !== "string" ||
            description.trim() === ""
        ) {
            return res.status(400).json(
                ApiResponse(false, "Description cannot be empty")
            )
        }

        updateData.description = description.trim()
    }

    // Update variants
    if (variant !== undefined) {
        let parsedVariants

        try {
            parsedVariants = parseArrayField(
                variant,
                "Variants"
            )
        } catch (error) {
            return res.status(400).json(
                ApiResponse(false, error.message)
            )
        }

        if (parsedVariants.length === 0) {
            return res.status(400).json(
                ApiResponse(
                    false,
                    "At least one variant is required"
                )
            )
        }

        for (const item of parsedVariants) {
            if (
                typeof item?.value !== "string" ||
                item.value.trim() === ""
            ) {
                return res.status(400).json(
                    ApiResponse(false, "Variant value is required")
                )
            }

            if (
                typeof item?.mrp !== "number" ||
                typeof item?.discount !== "number" ||
                typeof item?.sellingPrice !== "number"
            ) {
                return res.status(400).json(
                    ApiResponse(
                        false,
                        "Variant prices should be numbers"
                    )
                )
            }

            if (
                !Number.isFinite(item.mrp) ||
                !Number.isFinite(item.discount) ||
                !Number.isFinite(item.sellingPrice) ||
                item.mrp < 0 ||
                item.discount < 0 ||
                item.sellingPrice < 0
            ) {
                return res.status(400).json(
                    ApiResponse(
                        false,
                        "Variant prices must be valid non-negative numbers"
                    )
                )
            }

            // Preserve existing variant IDs.
            // Generate an ID for newly added variants.
            if (
                item.variantId === undefined ||
                item.variantId === null ||
                (
                    typeof item.variantId === "string" &&
                    item.variantId.trim() === ""
                )
            ) {
                item.variantId = `VAR${Math.floor(
                    1000 + Math.random() * 9000
                )}`
            } else if (
                typeof item.variantId !== "string"
            ) {
                return res.status(400).json(
                    ApiResponse(false, "Invalid variant ID")
                )
            }

            item.value = item.value.trim()
        }

        // Reject duplicate variant IDs
        const variantIds = parsedVariants.map(
            item => item.variantId
        )

        if (new Set(variantIds).size !== variantIds.length) {
            return res.status(400).json(
                ApiResponse(false, "Duplicate variant IDs found")
            )
        }

        updateData.variant = parsedVariants
    }

    // Update subcategories
    if (subcategory !== undefined) {
        let parsedSubcategories

        try {
            parsedSubcategories = parseArrayField(
                subcategory,
                "Subcategories"
            )
        } catch (error) {
            return res.status(400).json(
                ApiResponse(false, error.message)
            )
        }

        if (parsedSubcategories.length === 0) {
            return res.status(400).json(
                ApiResponse(
                    false,
                    "At least one subcategory is required"
                )
            )
        }

        const invalidSubcategory = parsedSubcategories.some(
            id =>
                typeof id !== "string" ||
                !mongoose.Types.ObjectId.isValid(id)
        )

        if (invalidSubcategory) {
            return res.status(400).json(
                ApiResponse(false, "Invalid subcategory ID")
            )
        }

        // Prevent duplicate IDs from causing incorrect counts
        const uniqueSubcategories = [
            ...new Set(
                parsedSubcategories.map(id => id.toString())
            )
        ]

        if (
            uniqueSubcategories.length !==
            parsedSubcategories.length
        ) {
            return res.status(400).json(
                ApiResponse(false, "Duplicate subcategory IDs found")
            )
        }

        const subcategoryCount =
            await Subcategory.countDocuments({
                _id: { $in: uniqueSubcategories }
            })

        if (subcategoryCount !== uniqueSubcategories.length) {
            return res.status(400).json(
                ApiResponse(
                    false,
                    "One or more subcategories not found"
                )
            )
        }

        updateData.subcategory = uniqueSubcategories
    }

    // Update block
    if (block !== undefined) {
        if (
            typeof block !== "string" ||
            !BLOCKS.includes(block)
        ) {
            return res.status(400).json(
                ApiResponse(false, "Invalid block")
            )
        }

        updateData.block = block
    }

    // Update sections
    if (sections !== undefined) {
        let parsedSections

        try {
            parsedSections = parseArrayField(
                sections,
                "Sections"
            )
        } catch (error) {
            return res.status(400).json(
                ApiResponse(false, error.message)
            )
        }

        const invalidSection = parsedSections.some(
            section =>
                typeof section !== "string" ||
                !SECTIONS.includes(section)
        )

        if (invalidSection) {
            return res.status(400).json(
                ApiResponse(
                    false,
                    "One or more invalid sections"
                )
            )
        }

        updateData.sections = parsedSections
    }

    // console.log(isActive)

    // Update active status
    if (isActive !== undefined) {
        if (isActive?.trim() !== "true" && isActive?.trim() !== "false") {
            return res.status(400).json(
                ApiResponse(false, "isActive must be a boolean")
            )
        }

        updateData.isActive = isActive
    }

    // Update rating
    if (rating !== undefined) {
        if (
            typeof rating !== "number" ||
            !Number.isFinite(rating) ||
            rating < 0 ||
            rating > 5
        ) {
            return res.status(400).json(
                ApiResponse(
                    false,
                    "Rating must be a number between 0 and 5"
                )
            )
        }

        updateData.rating = rating
    }

    // Handle uploaded images
    const rawImages = req.files
    const newImages = []

    if (Array.isArray(rawImages) && rawImages.length > 0) {
        for (const img of rawImages) {
            if (
                img &&
                String(img.filename || "").trim() !== ""
            ) {
                if (Number(img.size) < TOTAL_MAX_FILE) {
                    newImages.push(img.filename)
                } else {
                    deleteFile(img.filename)
                }
            }
        }
    }

    // Append new images to existing images
    if (newImages.length > 0) {
        updateData.images = [
            ...(existingProduct.images || []),
            ...newImages
        ]
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedProduct) {
        return res.status(500).json(
            ApiResponse(false, "Product could not be updated")
        )
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Product updated successfully",
            updatedProduct
        )
    )
})

// DELETE /api/v1/product/:productId
const deleteProduct = asynchandler(async (req, res) => {
    const { productId } = req?.params

    if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid product ID")
        )
    }

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404).json(
            ApiResponse(false, "Product not found")
        )
    }

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
        return res.status(500).json(
            ApiResponse(false, "Product could not be deleted")
        )
    }

    deletedProduct?.images?.map(img => {
        deleteFile(img)
    })

    return res.status(200).json(
        ApiResponse(true, "Product deleted successfully")
    )
})

const deleteImage = asynchandler(async (req, res) => {
    const { productId, image } = req?.params

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json(ApiResponse(false, "Invalid productId"))
    }

    if (typeof image !== "string" || image.trim() === "") {
        return res.status(400).json(ApiResponse(false, "Valid image is required"))
    }

    const existingPackage = await Product.findById(productId)

    if (!existingPackage) {
        return res.status(404).json(ApiResponse(false, "Package not found"))
    }

    if (!existingPackage?.images?.includes(image.trim())) {
        return res.status(404).json(ApiResponse(false, "Image not found"))
    }

    const updatedPackage = await Product.findByIdAndUpdate(
        productId,
        {
            $pull: {
                images: image.trim()
            },
            $set: {
                updatedAt: new Date()
            }
        },
        {
            new: true
        }
    )

    if (!updatedPackage) {
        return res.status(500).json(ApiResponse(false, "Image deletion has been failed"))
    }

    deleteFile(image) // delete from disk

    return res.status(200).json(ApiResponse(true, "Image deleted successfully"))
})

// GET /api/v1/product/:page/:limit
const getAllProducts = asynchandler(async (req, res) => {
    const { page, limit } = req?.params

    const {
        search,
        title,
        categoryName,
        subcategoryName,
        block,
        sections,
        isActive,
        minPrice,
        maxPrice,
        variantId,
        variantValue,
        slug
    } = req?.query

    let aggregationArray = []
    let countAggregation = []

    let data
    let totalPage

    // Validate pagination
    if (
        filtrationClass.validateNumber(page, true) ||
        filtrationClass.validateNumber(limit, true)
    ) {
        return res.status(400).json(
            ApiResponse(
                false,
                "Page and limit should be a number and greater than 0"
            )
        )
    }

    const skip = calculateSkip(page, limit)

    // Subcategory lookup
    const subcategoryLookup = {
        $lookup: {
            from: "subcategories",
            localField: "subcategory",
            foreignField: "_id",
            as: "subcategories"
        }
    }

    // Category lookup through subcategory
    const categoryLookup = {
        $lookup: {
            from: "categories",
            localField: "subcategories.catagoryId",
            foreignField: "_id",
            as: "categories"
        }
    }

    aggregationArray.push(subcategoryLookup)
    aggregationArray.push(categoryLookup)

    countAggregation.push(subcategoryLookup)
    countAggregation.push(categoryLookup)

    // General search
    if (
        typeof search === "string" &&
        search?.trim() !== ""
    ) {
        const searchReg = new RegExp(search, "i")

        const obj = {
            $match: {
                $or: [
                    { title: searchReg },
                    { subTitle: searchReg },
                    { description: searchReg },
                    { "subcategories.name": searchReg },
                    { "categories.name": searchReg },
                ]
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Title filter
    if (
        typeof title === "string" &&
        title?.trim() !== ""
    ) {
        const obj = {
            $match: {
                title: new RegExp(title, "i")
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Category name filter
    if (
        typeof categoryName === "string" &&
        categoryName?.trim() !== ""
    ) {
        const obj = {
            $match: {
                "categories.name": new RegExp(
                    categoryName,
                    "i"
                )
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Subcategory name filter
    if (
        typeof subcategoryName === "string" &&
        subcategoryName?.trim() !== ""
    ) {
        const obj = {
            $match: {
                "subcategories.name": new RegExp(
                    subcategoryName,
                    "i"
                )
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Block filter
    if (
        typeof block === "string" &&
        block?.trim() !== "" &&
        BLOCKS?.includes(block)
    ) {
        const obj = {
            $match: {
                block
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Sections filter
    if (
        typeof sections === "string" &&
        SECTIONS.includes(sections) === true
    ) {

        const obj = {
            $match: {
                sections: sections
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Active status filter
    if (
        isActive !== undefined &&
        ["true", "false"]?.includes(
            String(isActive)?.toLowerCase()
        )
    ) {
        const obj = {
            $match: {
                isActive:
                    String(isActive)?.toLowerCase() === "true"
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Variant ID filter
    if (
        typeof variantId === "string" &&
        variantId?.trim() !== ""
    ) {
        const obj = {
            $match: {
                "variant.variantId": new RegExp(
                    variantId,
                    "i"
                )
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Variant value filter
    if (
        typeof variantValue === "string" &&
        variantValue?.trim() !== ""
    ) {
        const obj = {
            $match: {
                "variant.value": new RegExp(
                    variantValue,
                    "i"
                )
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Selling price filter
    const minSellingPrice = Number(minPrice)
    const maxSellingPrice = Number(maxPrice)

    if (
        minPrice !== undefined &&
        !isNaN(minSellingPrice)
    ) {
        const sellingPriceFilter = {
            $gte: minSellingPrice
        }

        if (
            maxPrice !== undefined &&
            !isNaN(maxSellingPrice)
        ) {
            sellingPriceFilter.$lte = maxSellingPrice
        }

        const obj = {
            $match: {
                variant: {
                    $elemMatch: {
                        sellingPrice: sellingPriceFilter
                    }
                }
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    } else if (
        maxPrice !== undefined &&
        !isNaN(maxSellingPrice)
    ) {
        const obj = {
            $match: {
                variant: {
                    $elemMatch: {
                        sellingPrice: {
                            $lte: maxSellingPrice
                        }
                    }
                }
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Slug filter
    if (
        typeof slug === "string" &&
        slug.trim() !== ""
    ) {
        const obj = {
            $match: {
                slug: slug.trim()
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Count total documents
    countAggregation.push({
        $count: "total"
    })

    const total = await Product.aggregate(
        countAggregation
    )

    const totalDocs =
        Array.isArray(total) && total?.length > 0
            ? total[0]?.total || 0
            : 0

    // Latest products first
    aggregationArray.push({
        $sort: {
            _id: -1
        }
    })

    // DB pagination
    const paginationPipeline = dbPaginationPipeline(
        skip,
        limit
    )

    aggregationArray = [
        ...aggregationArray,
        ...paginationPipeline
    ]

    const products = await Product.aggregate(
        aggregationArray
    )

    if (
        !Array.isArray(products) ||
        products?.length === 0
    ) {
        return res.status(200).json(
            ApiResponse(
                true,
                "No products found",
                []
            )
        )
    }

    try {
        const { newData, totalPages } = dbPagination(
            page,
            Number(limit),
            products,
            totalDocs
        )

        totalPage = totalPages
        data = newData
    } catch (error) {
        console.log(error)

        return res.status(500).json(
            ApiResponse(
                false,
                "Something went wrong"
            )
        )
    }

    const finalData = {
        totalPages: totalPage,
        data,
        currentPage: Number(page)
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Products fetched successfully",
            finalData
        )
    )
})

export {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    deleteImage
}