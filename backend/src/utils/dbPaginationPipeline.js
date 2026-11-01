export const dbPaginationPipeline = (skip, limit) => {
    const pipeline = [
        // pagination
        {
            $skip: Number(skip)
        },
        {
            $limit: Number(limit)
        },
    ]

    return pipeline
}