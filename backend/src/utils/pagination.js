export const pagination = (page, limit, data) => {
    // validation
    if (isNaN(page) || isNaN(limit)) throw new Error("Page and limit should be in number data type")
    if (!Array.isArray(data)) throw new Error("Data should be an array")

    // some calculations
    let initialData = data
    let totalRecords = data?.length
    let totalPages = Math.ceil(totalRecords / Number(limit))

    if (page > totalPages) return null

    // split data
    let startIndex = (page - 1) * limit
    let endIndex = page * limit
    let newData = initialData?.slice(startIndex, endIndex)

    // console.log(newData)

    return {
        totalPages,
        newData
    }
}

export const dbPagination = (page, limit, data, totalRecords) => {

    /** This function is nothing but calculating total pages based on
     * given limit value and total records. Based on the page, the $skip and $limit
     * will be calculated that will do do pagination direct from the DB.
     */

    // validation
    if (isNaN(page) || isNaN(limit)) throw new Error("Page and limit should be in number data type")
    if (!Array.isArray(data)) throw new Error("Data should be an array")

    // some calculations
    let initialData = data
    let totalPages = Math.ceil(totalRecords / Number(limit))

    // if (page > totalPages) return null

    let newData = initialData

    return {
        totalPages,
        newData
    }
}