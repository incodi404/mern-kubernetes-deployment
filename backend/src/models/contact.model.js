import mongoose from "mongoose"

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        query:{
            type: String,
            required:true
        },

        createdAt: Date,

        status:{
            type:String,
            enum:["Accepted","Rejected","Pending"],
            default:"Pending"
        }
    }
)

const Contact = mongoose.model("Contact", contactSchema)

export default Contact