import mongoose, { Schema } from "mongoose";

const configSchema = new Schema({
    // basic info
    socialLinks: [{
        platform: String,
        link: String
    }],

    // AI config
    comparisonParameter: {
        type: String,
        eum: ["Highest", "Average", "Lowest"],
        default: "Average"
    },

    // notification config
    notifyEmails: [String]
})

export const Config = mongoose.model("Config", configSchema)