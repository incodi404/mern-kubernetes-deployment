import fs from "fs"
import path from "path";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = "./app/upload"

export function deleteFile(filename) {
    if (filename === "") return undefined

    const filepath = path.join(UPLOAD_DIR, filename)
    fs.unlink(filepath, (err) => {
        if (err) {
            console.log("[WARN] Failed to delete image file:", filepath)
            return undefined
        }
    })

    return true
}