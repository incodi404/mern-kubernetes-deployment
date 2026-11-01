export function validateAndParseJSON(str) {
    let parsed = ""
    try {
        parsed = typeof str === "string" && str.trim() !== "" ? JSON.parse(str) : ""
    } catch (error) {
        parsed = ""
    }

    return parsed
}