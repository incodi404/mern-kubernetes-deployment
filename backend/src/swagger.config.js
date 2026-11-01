import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Beingbackpackers API",
            version: "1.0.0",
            description: "API documentation",
        },
        servers: [
            {
                url: `http://127.0.0.1:${process?.env?.PORT}`,
            },
        ],
    },

    apis: [
        "./src/routes/*.route.js",
        "./src/routes/*.routes.js"
    ],
};

export const swaggerSpec = swaggerJSDoc(options);
