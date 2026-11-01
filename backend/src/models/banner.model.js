import mongoose from "mongoose"

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
    },
    image: {
        type: String,
    },
    link: {
        type: String
    }
}, { timestamps: true })

export const Banner = mongoose.model("Banner", bannerSchema)