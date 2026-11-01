export const ApiResponse = (
    status,
    message,
    data
) => {
    return {
        status: status === true ? "SUCCESS" : "ERROR",
        message: message,
        data: data
    }
}