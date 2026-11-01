import mongoose from "mongoose"
import { TOTAL_MAX_FILE } from "../constant.js"
import { deleteFile } from "../utils/fileDeletion.js"
import { ClassResponse } from "../utils/ClassResponse.js"

class Filtration {
    // empty string, undefined, null fields validation
    fieldValidation(fields, blacklistValues = []) {
        // this function will help us to filter empty string, undefined and null
        if (typeof fields !== "object") {
            return ClassResponse(false, 404, "Fields must be an object")
        }

        if (!Array.isArray(blacklistValues)) {
            return ClassResponse(false, 404, "Blacklist values should be in an array")
        }

        // variable for filtered fields
        let filteredData = {}

        // basic empty value check
        Object.keys(fields).map((key) => {
            const data = fields[key]
            if (
                (typeof data === "string" && data.trim() !== "") ||
                (typeof data === "number" && !isNaN(Number(data))) ||
                (typeof data === "boolean") ||
                (typeof data === "object" && Object.keys(data).length > 0)
            ) {
                filteredData[key] = data
            }
        })

        // removing blacklist values for extra feature
        if (blacklistValues.length > 0) {
            Object.keys(filteredData).map((key) => {
                const data = filteredData[key]
                if (blacklistValues.includes(data)) {
                    delete filteredData[key]
                }
            })
        }

        return ClassResponse(true, 200, "Filteration done", filteredData)

    }

    // only single file field validation
    singleFileValidation(fileObj) {
        let filePath = undefined

        if (Number(fileObj?.size) > TOTAL_MAX_FILE) {
            if (fileObj) {
                deleteFile(fileObj?.filename)
                return filePath
            }
        }

        if (fileObj) {
            const { filename } = fileObj
            filePath = filename
        }

        /*
        upload.single("field")

        req.file structure -
        {
            fieldname: 'field',
            originalname: 'avatar.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: 'uploads/',
            filename: 'avatar-123456.png',
            path: 'uploads/avatar-123456.png',
            size: 23456
        }
        */

        return filePath
    }

    // array of files
    filesArrayValidation(fileArray) {
        if (!Array.isArray(fileArray) || fileArray.length === 0) return undefined

        let filenamesArray = []

        /*
        upload.array("field", 5)

        req.files structure -
        [
            {
                fieldname: 'field',
                originalname: 'photo1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: 'uploads/',
                filename: '123456-photo1.jpg',
                path: 'uploads/123456-photo1.jpg',
                size: 34567
            },
            ...
        ]
        */

        fileArray.map((file) => {
            if (Number(file?.size) > TOTAL_MAX_FILE) {
                if (file) {
                    deleteFile(file?.filename)
                    return
                }
            }

            const filename = file?.filename
            if (filename && filename !== "") {
                filenamesArray.push(filename)
            }
        })

        return filenamesArray
    }

    // multi file fields
    multiFieldFilesValidation(fileFields) {
        let allFilePaths = {}

        if (!fileFields) return undefined

        /*
        upload.fields([
            {"field1", maxCount: 1},
            {"field2", maxCount: 1},
        ])

        req.files structure -
        {
            field1: [
                {
                fieldname: 'field1',
                originalname: 'file1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: 'uploads/',
                filename: 'file1-12345.jpg',
                path: 'uploads/file1-12345.jpg',
                size: 12345
                }
            ],
            field2: [
                {
                fieldname: 'field2',
                originalname: 'file2.jpg',
                ...
                },
                {
                fieldname: 'field2',
                originalname: 'file3.jpg',
                ...
                }
            ]
        }
        */

        Object.keys(fileFields).map((field) => {
            // getting the file path
            const path = fileFields[field][0]?.filename

            if (typeof path === "string" && path.trim() !== "") {
                allFilePaths[field] = path
            }
        })

        return allFilePaths
    }

    // remove unwanted fields from an object
    removeBlacklistedFieldsFromObj(obj, blacklistKeyArray = []) {
        // validation
        if (Object.keys(obj).length === 0) return undefined;
        if (!Array.isArray(blacklistKeyArray) || blacklistKeyArray.length === 0) return undefined;

        // new object
        let newObj = obj

        // delete unwanted fields
        blacklistKeyArray.map((key) => {
            delete newObj[key]
        })

        // retruning altered object
        return newObj
    }

    strToBool(data) {
        if (typeof data === "string") {
            if ((data !== "true" && data !== "false")) {
                return undefined
            }

            return data === "true" ? true : false
        } else if (typeof data === "boolean") {
            return data
        } else {
            return undefined
        }
    }

    // validate objectId
    static validateObjectId(input) {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(input)
        const objectId = isValidObjectId ? new mongoose.Types.ObjectId(input) : null

        return objectId
    }

    // validating page and limit for if...else block
    validateNumber(input, isValidateZero = false) {
        if (isNaN(Number(input))) {
            return true
        } else if (isValidateZero && input <= 0) {
            return true
        } else {
            return false
        }
    }
}

export const filtrationClass = new Filtration()