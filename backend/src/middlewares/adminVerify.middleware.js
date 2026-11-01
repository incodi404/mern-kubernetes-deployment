import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

const adminVerify = asynchandler(async (req, res, next) => {
    const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) return res.status(401).json(ApiResponse(false, "Admin not logged in"))

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        return res.status(401).json(ApiResponse(false, "Token is invalid or expired"))
    }

    const user = await Admin.findById(decodedToken?._id).select("-password")
    if (!user) {
        return res.status(404).json(ApiResponse(false, "Admin not found"))
    }

    req.user = user
    next()
})

export {
    adminVerify
}