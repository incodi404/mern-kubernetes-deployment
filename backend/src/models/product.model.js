import mongoose, { Schema } from "mongoose"
import { BLOCKS } from "../blocks.js"
import { SECTIONS } from "../sections.js"

const productSchema = new Schema({
    title: String,
    subTitle: String,
    description: String,
    images: [String],
    variant: [
        {
            value: String,
            variantId: String,
            mrp: Number,
            discount: Number,
            sellingPrice: Number,
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    subcategory: [{
        type: Schema.Types.ObjectId,
        ref: "Subcategory"
    }],
    block: {
        type: String,
        enum: BLOCKS
    },
    sections: [{
        type: String,
        enum: SECTIONS
    }],
    rating: Number,
    slug: String
})

const catagorySchema = new Schema({
    name: String,
    image: String,
    isActive: {
        type: Boolean,
        default: true
    },
    block: {
        type: String,
        enum: BLOCKS
    }
})

const subCategorySchema = new Schema({
    name: String,
    catagoryId: {
        type: Schema.Types.ObjectId,
        ref: "Catagory"
    },
    image: String,
    isActive: {
        type: Boolean,
        default: true
    },
    block: {
        type: String,
        enum: BLOCKS
    }
})

const Product = mongoose.model("Product", productSchema)
const Category = mongoose.model("Category", catagorySchema)
const Subcategory = mongoose.model("Subcategory", subCategorySchema)

export {
    Product,
    Category,
    Subcategory
}