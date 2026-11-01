import { notificationClass } from "../class/Notification.class.js";
import { COOKIE_CONFIG } from "../constant.js";
import { AccountVerify } from "../models/accountVerify.models.js";
import { Admin } from "../models/admin.model.js";
import { verifyAccountTemplate } from "../templates/verifyAccount.template.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import bcrypt from "bcrypt"
import otpGenerator from "otp-generator"
import jwt from "jsonwebtoken"
import { Config } from "../models/config.model.js";

const seedAdmin = async () => {
    try {
        const existedAdmin = await Admin.findOne()
        if (existedAdmin) {
            console.log("[INFO] Admin already exists")
            return
        }

        const admin_username = process?.env?.ADMIN_USER
        const admin_password = process?.env?.ADMIN_PASSWORD
        if (!admin_password || !admin_username) {
            console.log("[ERROR] Username and password are required")
            return
        }

        // encrypting password
        const encrypted_password = await bcrypt.hash(admin_password, 10)

        const newAdmin = await Admin.create({
            email: admin_username,
            password: encrypted_password,
            name: "Test Admin"
        })
        if (!newAdmin) {
            console.log("[ERROR] Admin seeding has been failed")
            return
        }

        console.log("[INFO] Admin has been seeded successfully")
    } catch (error) {
        console.log("[ERROR] Admin seeding has been failed")
        console.log(error)
    }
}

const createAdmin = asynchandler(async (req, res) => {
    const { name, email, password } = req?.body

    if (String(name).trim() === "" || String(email).trim() === "" || String(password).trim() === "") {
        return res.status(401).json(ApiResponse(false, "Name, email and password are required"))
    }

    // check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email })
    if (existingAdmin) {
        return res.status(409).json(ApiResponse(false, "Admin with this email already exists"))
    }

    // encrypting password
    const encrypted_password = await bcrypt.hash(password, 10)

    // create admin
    const user = await Admin.create({
        name,
        email,
        password: encrypted_password
    })

    if (!user) {
        return res.status(500).json(ApiResponse(false, "Admin creation has been failed"))
    }

    // generate access token
    const access_token = await user?.generateAccessToken()
    if (!access_token) {
        return res.status(500).json(ApiResponse(false, "Token generation has been failed"))
    }

    return res.status(201).json(ApiResponse(true, "Admin created successfully"))
})

const adminLogin = asynchandler(async (req, res) => {
    const { email, password } = req?.body

    if (String(email).trim() === "" || String(password).trim() === "") {
        return res.status(401).json(ApiResponse(false, "Email and password are required"))
    }

    const user = await Admin.findOne({ email: email })
    if (!user) {
        return res.status(404).json(ApiResponse(false, "User not found"))
    }

    // check for password
    const isPasswordCorrect = await user?.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        return res.status(403).json(ApiResponse(false, "Password is incorrect"))
    }

    // generate access token
    const access_token = await user?.generateAccessToken()
    if (!access_token) {
        return res.status(500).json(ApiResponse(false, "Token generation has been failed"))
    }

    return res
        .status(200)
        .cookie("accessToken", access_token, COOKIE_CONFIG)
        .json(ApiResponse(true, "User logged in successfully"))
})

const generateOtpAdmin = asynchandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json(ApiResponse(false, "Email is required"))
    }

    const existedAdmin = await Admin.findOne({
        email: email
    })
    if (!existedAdmin) {
        return res.status(404).json(ApiResponse(false, "Admin not found"))
    }

    const otp = otpGenerator.generate(4, {
        digits: true, lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false
    })
    if (!otp) {
        return res.status(500).json(ApiResponse(false, "OTP generation failed"))
    }

    const existedOtp = await AccountVerify.findOne({ email: email })
    if (existedOtp) {
        existedOtp.otp = otp
        await existedOtp?.save({ validateBeforeSave: false })
    } else {
        const newOtp = await AccountVerify.create({
            createdAt: Date.now(),
            email: email,
            otp: otp,
        })
        if (!newOtp) {
            return res.status(500).json(ApiResponse(
                false, "OTP save has been failed"
            ))
        }
    }

    const emailRes = await notificationClass.emailSender(
        email, "Verify Your Account", verifyAccountTemplate(existedAdmin?.name, otp, "30")
    )
    if (!emailRes?.isSuccess) {
        return res.status(emailRes?.statusCode).json(
            ApiResponse(false, emailRes?.message)
        )
    }

    return res.status(200).json(ApiResponse(true, "OTP has been generated"))
})

const verifyAdminOtp = asynchandler(async (req, res) => {
    const { email, givenOtp } = req.body

    if (
        (typeof email === "string" && email?.trim() === "") ||
        (typeof givenOtp === "string" && givenOtp?.trim() === "")
    ) {
        return res.status(400).json(ApiResponse(
            false, "Email and OTP are required"
        ))
    }

    const existedUser = await AccountVerify.findOne({
        email: email
    })
    if (!existedUser) {
        return res.status(404).json(ApiResponse(false, "OTP not found"))
    }

    if (existedUser?.otp !== givenOtp) {
        return res.status(403).json(ApiResponse(false, "OTP is incorrect"))
    }

    const verifiedToken = jwt.sign(
        {
            verificationMethod: "Email",
            email: email
        },
        process.env.VERIFIED_TOKEN,
        {
            expiresIn: process.env.VERIFIED_TOKEN_EXPIRY
        }
    )
    if (!verifiedToken) {
        return res.status(500).json(ApiResponse(false, "Verified token generation failed"))
    }

    return res.status(200).json(ApiResponse(true, "Verification has been completed", verifiedToken))
})

const adminForgotPassword = asynchandler(async (req, res) => {
    const { password, verifiedToken } = req.body

    if (!password || !verifiedToken) {
        return res.status(400).json(ApiResponse(false, "Verified token and password are required"))
    }

    const decodedToken = jwt.verify(
        verifiedToken, process.env?.VERIFIED_TOKEN
    )
    if (!decodedToken) {
        return res.status(400).json(ApiResponse(false, "Token is invalid"))
    }

    const existedAdmin = await Admin.findOne({ email: decodedToken?.email })
    if (!existedAdmin) return res.status(404).json(ApiResponse(false, "Admin not found"))

    const encryptedPassword = await bcrypt.hash(password, 10)
    if (!encryptedPassword) {
        return res.status(500).json(ApiResponse(false, "Password not generted"))
    }

    existedAdmin.password = encryptedPassword
    await existedAdmin.save({ validateBeforeSave: false })

    return res.status(200).json(ApiResponse(true, "New password created"))
})

const getAdmin = asynchandler(async (req, res) => {
    const admin = req?.user

    return res.status(200).json(ApiResponse(true, "Admin fetched", admin))
})

const getAllAdmin = asynchandler(async (req, res) => {
    const admins = await Admin.find().select("-password")

    return res.status(200).json(ApiResponse(true, "Admins have been fetched", admins))
})

const adminLogout = asynchandler(async (req, res) => {
    return res.status(200)
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        })
        .json(ApiResponse(true, "Admin logged out successfully"))
})

// company config
const upsertConfig = asynchandler(async (req, res) => {
    const { socialLinks, comparisonParameter, notifyEmails } = req?.body

    if (socialLinks !== undefined && !Array.isArray(socialLinks)) {
        return res.status(400).json(ApiResponse(false, "socialLinks must be an array"))
    }

    if (notifyEmails !== undefined && !Array.isArray(notifyEmails)) {
        return res.status(400).json(ApiResponse(false, "notifyEmails must be an array"))
    }

    const existedConfig = await Config.findOne()

    if (existedConfig) {
        // update only fields that were actually sent
        if (socialLinks !== undefined) existedConfig.socialLinks = socialLinks
        if (comparisonParameter !== undefined) existedConfig.comparisonParameter = comparisonParameter
        if (notifyEmails !== undefined) existedConfig.notifyEmails = notifyEmails

        const updatedConfig = await existedConfig.save()
        if (!updatedConfig) {
            return res.status(500).json(ApiResponse(false, "Config update has been failed"))
        }

        return res.status(200).json(ApiResponse(true, "Config updated successfully", updatedConfig))
    }

    const newConfig = await Config.create({
        socialLinks,
        comparisonParameter,
        notifyEmails
    })
    if (!newConfig) {
        return res.status(500).json(ApiResponse(false, "Config creation has been failed"))
    }

    return res.status(201).json(ApiResponse(true, "Config created successfully", newConfig))
})

const getConfig = asynchandler(async (req, res) => {
    const config = await Config.findOne()
    if (!config) {
        return res.status(404).json(ApiResponse(false, "Config not found"))
    }

    return res.status(200).json(ApiResponse(true, "Config fetched successfully", config))
})

export {
    seedAdmin,
    createAdmin,
    adminLogin,
    generateOtpAdmin,
    verifyAdminOtp,
    adminForgotPassword,
    getAdmin,
    getAllAdmin,
    adminLogout,
    upsertConfig,
    getConfig
}