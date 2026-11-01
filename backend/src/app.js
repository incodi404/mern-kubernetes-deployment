import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import { swaggerSpec } from "./swagger.config.js"
import swaggerUi from "swagger-ui-express"

const app = express()

app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({ limit: "50kb", extended: true }))
app.use(cookieParser())
app.use(cors({
    //origin: HOST_TYPE === "DEV" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD,
    origin: [process.env.CORS_ORIGIN1, process.env.CORS_ORIGIN2],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
    allowedHeaders: "Authorization,Content-Type",
}))

// import routes
import { fileRouter } from "./routes/file.route.js"
import adminRoute from "./routes/admin.route.js"
import categoryRoute from "./routes/category.route.js"
import subcategoryRoute from "./routes/subcategory.route.js"
import productRoute from "./routes/product.route.js"
import configRoute from "./routes/config.route.js"
import bannerRoute from "./routes/banner.route.js"
import contactRoute from "./routes/contact.route.js"
import reelsRoute from "./routes/reels.route.js"
// declear routes
// file route
app.use("/api/v1/file", fileRouter)
app.use("/api/v1/admin", adminRoute)
app.use("/api/v1/category", categoryRoute)
app.use("/api/v1/subcategory", subcategoryRoute)
app.use("/api/v1/product", productRoute)
app.use("/api/v1/config", configRoute)
app.use("/api/v1/banner", bannerRoute)
app.use("/api/v1/contact", contactRoute)
app.use("/api/v1/reels",reelsRoute)

// swagger
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

//testing route
app.get("/is-okay", (req, res) => {
    return res.status(200).send("Everything is okay!")
})

export { app }
