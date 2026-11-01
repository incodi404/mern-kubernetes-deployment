import mongoose, { Schema } from "mongoose"

const accountVerifySchema = new Schema({
    email: String,
    otp: String,
    createdAt: {
        type: Date,
        index: {
            expires: "30m"
        }
    }
})

export const AccountVerify = mongoose.model("AccountVerify", accountVerifySchema)