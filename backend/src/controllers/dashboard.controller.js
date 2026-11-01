import Contact from "../models/contact.model.js";
import { InterestedProduct } from "../models/interestedProduct.model.js";
import { Category, Product, Subcategory } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// GET /api/v1/admin/dashboard
const getDashboard = asynchandler(async (req, res) => {
    const { days: requestedDays = "7" } = req?.query

    const days = Number(requestedDays)

    if (![7, 30].includes(days)) {
        return res.status(400).json(
            ApiResponse(false, "Days must be either 7 or 30")
        )
    }

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const dateMatch = {
        createdAt: {
            $gte: startDate,
            $lte: now
        }
    }

    try {
        const [
            totalProducts,
            activeProducts,
            inactiveProducts,
            totalCategories,
            totalSubcategories,
            totalInterestedProducts,
            totalInterestQuantity,
            viewedInterestedProducts,
            unviewedInterestedProducts,
            totalContacts,
            pendingContacts,
            acceptedContacts,
            rejectedContacts,
            productsByBlock,
            interestTrend,
            contactTrend,
            recentInterestedProducts,
            recentContacts,
            topInterestedProducts
        ] = await Promise.all([
            // Product metrics
            Product.countDocuments(),

            Product.countDocuments({ isActive: true }),

            Product.countDocuments({ isActive: false }),

            // Category metrics
            Category.countDocuments(),

            Subcategory.countDocuments(),

            // Interest product metrics
            InterestedProduct.countDocuments(),

            InterestedProduct.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalQuantity" }
                    }
                }
            ]),

            InterestedProduct.countDocuments({ isViewed: true }),

            InterestedProduct.countDocuments({ isViewed: false }),

            // Contact metrics
            Contact.countDocuments(),

            Contact.countDocuments({ status: "Pending" }),

            Contact.countDocuments({ status: "Accepted" }),

            Contact.countDocuments({ status: "Rejected" }),

            // Product distribution by block
            Product.aggregate([
                {
                    $group: {
                        _id: "$block",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]),

            // Daily interest requests
            InterestedProduct.aggregate([
                {
                    $match: dateMatch
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 },
                        quantity: { $sum: "$totalQuantity" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]),

            // Daily contact submissions
            Contact.aggregate([
                {
                    $match: dateMatch
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]),

            // Latest interest requests
            InterestedProduct.find()
                .sort({ createdAt: -1, _id: -1 })
                .limit(5)
                .lean(),

            // Latest contact queries
            Contact.find()
                .sort({ createdAt: -1, _id: -1 })
                .limit(5)
                .lean(),

            // Most requested products using stored snapshots
            InterestedProduct.aggregate([
                {
                    $group: {
                        _id: "$productId",
                        title: {
                            $first: "$productSnapshot.title"
                        },
                        requestCount: { $sum: 1 },
                        totalQuantity: {
                            $sum: "$totalQuantity"
                        }
                    }
                },
                {
                    $sort: {
                        requestCount: -1,
                        totalQuantity: -1
                    }
                },
                {
                    $limit: 5
                }
            ])
        ])

        // Fill missing dates with zero so charts have continuous dates.
        const interestTrendMap = new Map(
            interestTrend.map(item => [item._id, item])
        )

        const contactTrendMap = new Map(
            contactTrend.map(item => [item._id, item])
        )

        const dailyTrend = []

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)

            const dateKey = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-")

            const interest = interestTrendMap.get(dateKey)
            const contact = contactTrendMap.get(dateKey)

            dailyTrend.push({
                date: dateKey,
                interestRequests: interest?.count || 0,
                interestedQuantity: interest?.quantity || 0,
                contactQueries: contact?.count || 0
            })
        }

        const dashboard = {
            overview: {
                totalProducts,
                activeProducts,
                inactiveProducts,
                totalCategories,
                totalSubcategories,
                totalInterestedProducts,
                totalInterestQuantity:
                    totalInterestQuantity?.[0]?.total || 0,
                totalContacts
            },

            InterestedProducts: {
                viewed: viewedInterestedProducts,
                unviewed: unviewedInterestedProducts
            },

            contacts: {
                pending: pendingContacts,
                accepted: acceptedContacts,
                rejected: rejectedContacts
            },

            charts: {
                dailyTrend,
                productsByBlock: productsByBlock.map(item => ({
                    block: item._id || "Unassigned",
                    count: item.count
                }))
            },

            topInterestedProducts,
            recentInterestedProducts,
            recentContacts,

            filters: {
                days
            }
        }

        return res.status(200).json(
            ApiResponse(true, "Dashboard data fetched successfully", dashboard)
        )
    } catch (error) {
        console.error("Dashboard API error:", error)

        return res.status(500).json(
            ApiResponse(false, "Failed to fetch dashboard data")
        )
    }
})

export {
    getDashboard
}