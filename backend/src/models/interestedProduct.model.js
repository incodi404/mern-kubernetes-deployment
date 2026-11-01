import mongoose, { Schema } from "mongoose";

const interestProductSchema = new Schema({
    userName: String,
    userPhone: String,
    userEmail: String,

    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    productSnapshot: Object,
    variantSnapshot: Object,
    totalQuantity: {
        type: Number,
        default: 0
    },

    createdAt: Date,
    isViewed: {
        type: Boolean,
        default: false
    }
})

export const InterestedProduct = mongoose.model("InterestedProduct", interestProductSchema)