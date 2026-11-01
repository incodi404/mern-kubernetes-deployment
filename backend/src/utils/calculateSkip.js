export const calculateSkip = (page, limit) => {
    const skip = (Number(page) - 1) * Number(limit)

    // validation
    if (isNaN(Number(skip))) {
        throw new Error("Skip value is not a number")
    }

    return skip
}