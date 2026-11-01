import { asynchandler } from "../utils/asynchandler.js"
import path from "path"
import { fileURLToPath } from "url"
import { ApiResponse } from "../utils/ApiResponse.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// UPLOAD_DIR from .env if set, otherwise <backend>/tmp/public
// path.resolve makes sure it is always an absolute path
const uploadDir = "/app/upload"

const getFile = asynchandler(async (req, res) => {
    const { file } = req.params

    if (!file) {
        return res.status(400).json(ApiResponse(false, "Image path is important"))
    }

    // `root` also stops "../" tricks from reading files outside the upload folder
    return res.sendFile(file, { root: uploadDir }, (err) => {
        if (err && !res.headersSent) {
            return res.status(404).json(ApiResponse(false, "File not found"))
        }
    })
})

export {
    getFile
}