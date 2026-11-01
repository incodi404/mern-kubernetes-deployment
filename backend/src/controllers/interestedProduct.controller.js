import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { Product } from "../models/product.model.js";
import { InterestedProduct } from "../models/interestedProduct.model.js";
import { calculateSkip } from "../utils/calculateSkip.js";
import { filtrationClass } from "../class/Filtration.class.js";
import { dbPaginationPipeline } from "../utils/dbPaginationPipeline.js";
import { dbPagination } from "../utils/pagination.js";
import { Config } from "../models/config.model.js";
import { agenda } from "../db/agenda.db.js";

const createInterestProduct = asynchandler(async (req, res) => {
    const {
        userName,
        userPhone,
        productId,
        variantId,
        totalQuantity
    } = req?.body

    if (
        typeof userName !== "string" ||
        userName?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "User name is required")
        )
    }

    if (
        typeof userPhone !== "string" ||
        userPhone?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "User phone is required")
        )
    }

    if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
    ) {
        return res.status(400).json(
            ApiResponse(false, "Invalid product ID")
        )
    }

    if (
        typeof variantId !== "string" ||
        variantId?.trim() === ""
    ) {
        return res.status(400).json(
            ApiResponse(false, "Variant ID is required")
        )
    }

    if (
        totalQuantity === undefined ||
        typeof totalQuantity !== "number" ||
        !Number.isInteger(totalQuantity) ||
        totalQuantity <= 0
    ) {
        return res.status(400).json(
            ApiResponse(
                false,
                "Total quantity should be a positive integer"
            )
        )
    }

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404).json(
            ApiResponse(false, "Product not found")
        )
    }

    const variant = product?.variant?.find(
        item => item?.variantId === variantId
    )

    if (!variant) {
        return res.status(404).json(
            ApiResponse(false, "Product variant not found")
        )
    }

    const interestProduct = await InterestedProduct.create({
        userName: userName?.trim(),
        userPhone: userPhone?.trim(),
        productId: product?._id,
        productSnapshot: {
            title: product?.title,
            subTitle: product?.subTitle,
            description: product?.description,
            images: product?.images
        },
        variantSnapshot: {
            value: variant?.value,
            variantId: variant?.variantId,
            mrp: variant?.mrp,
            discount: variant?.discount,
            sellingPrice: variant?.sellingPrice
        },
        totalQuantity
    })

    if (!interestProduct) {
        return res.status(500).json(
            ApiResponse(
                false,
                "Interest product could not be created"
            )
        )
    }

    // email
    const config = await Config.findOne()
    if (Array.isArray(config.notifyEmails) && config.notifyEmails.length > 0) {
        const emails = config.notifyEmails
        emails.map(async (email) => {
            await agenda.now("send_interested_product_email", {
                order: interestProduct,
                email: email
            })

            console.log("[INFO] Email job set")
        })
    }

    return res.status(201).json(
        ApiResponse(
            true,
            "Interest product created successfully",
            interestProduct
        )
    )
})

// GET /api/v1/product/interested/:page/:limit
const getAllInterestProducts = asynchandler(async (req, res) => {
    const { page, limit } = req?.params

    const {
        search,
        userName,
        userPhone,
        userEmail,
        productTitle,
        variantId,
        variantValue,
        isViewed,
        minQuantity,
        maxQuantity
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

    // Product lookup
    const productLookup = {
        $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product"
        }
    }

    // Flatten product details
    const productAddFields = {
        $addFields: {
            product: {
                $first: "$product"
            }
        }
    }

    aggregationArray.push(productLookup)
    aggregationArray.push(productAddFields)

    countAggregation.push(productLookup)
    countAggregation.push(productAddFields)

    // General search
    if (
        typeof search === "string" &&
        search?.trim() !== ""
    ) {
        const searchReg = new RegExp(search, "i")

        const obj = {
            $match: {
                $or: [
                    { userName: searchReg },
                    { userPhone: searchReg },
                    { userEmail: searchReg },
                    { "productSnapshot.title": searchReg },
                    { "variantSnapshot.value": searchReg },
                    { "variantSnapshot.variantId": searchReg }
                ]
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // User name filter
    if (
        typeof userName === "string" &&
        userName?.trim() !== ""
    ) {
        const obj = {
            $match: {
                userName: new RegExp(userName, "i")
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // User phone filter
    if (
        typeof userPhone === "string" &&
        userPhone?.trim() !== ""
    ) {
        const obj = {
            $match: {
                userPhone: new RegExp(userPhone, "i")
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // User email filter
    if (
        typeof userEmail === "string" &&
        userEmail?.trim() !== ""
    ) {
        const obj = {
            $match: {
                userEmail: new RegExp(userEmail, "i")
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Product title filter
    if (
        typeof productTitle === "string" &&
        productTitle?.trim() !== ""
    ) {
        const obj = {
            $match: {
                "productSnapshot.title": new RegExp(
                    productTitle,
                    "i"
                )
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
                "variantSnapshot.variantId": new RegExp(
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
                "variantSnapshot.value": new RegExp(
                    variantValue,
                    "i"
                )
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Viewed status filter
    if (
        isViewed !== undefined &&
        ["true", "false"]?.includes(
            String(isViewed)?.toLowerCase()
        )
    ) {
        const obj = {
            $match: {
                isViewed:
                    String(isViewed)?.toLowerCase() === "true"
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Minimum quantity filter
    const minimumQuantity = Number(minQuantity)
    const maximumQuantity = Number(maxQuantity)

    if (
        minQuantity !== undefined &&
        !isNaN(minimumQuantity)
    ) {
        const quantityFilter = {
            $gte: minimumQuantity
        }

        if (
            maxQuantity !== undefined &&
            !isNaN(maximumQuantity)
        ) {
            quantityFilter.$lte = maximumQuantity
        }

        const obj = {
            $match: {
                totalQuantity: quantityFilter
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    } else if (
        maxQuantity !== undefined &&
        !isNaN(maximumQuantity)
    ) {
        const obj = {
            $match: {
                totalQuantity: {
                    $lte: maximumQuantity
                }
            }
        }

        aggregationArray.push(obj)
        countAggregation.push(obj)
    }

    // Count total documents
    countAggregation.push({
        $count: "total"
    })

    const total = await InterestedProduct.aggregate(
        countAggregation
    )

    const totalDocs =
        Array.isArray(total) && total?.length > 0
            ? total[0]?.total || 0
            : 0

    // Latest interest records first
    aggregationArray.push({
        $sort: {
            createdAt: -1,
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

    const interestProducts = await InterestedProduct.aggregate(
        aggregationArray
    )

    if (
        !Array.isArray(interestProducts) ||
        interestProducts?.length === 0
    ) {
        return res.status(200).json(
            ApiResponse(
                true,
                "No interest products found",
                []
            )
        )
    }

    try {
        const { newData, totalPages } = dbPagination(
            page,
            Number(limit),
            interestProducts,
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

    await InterestedProduct.updateMany({
        isViewed: false
    }, { $set: { isViewed: true } })

    const finalData = {
        totalPages: totalPage,
        data,
        currentPage: Number(page)
    }

    return res.status(200).json(
        ApiResponse(
            true,
            "Interest products fetched successfully",
            finalData
        )
    )
})

export {
    createInterestProduct,
    getAllInterestProducts
}