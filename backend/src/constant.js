// db and host config
const DB_NAME = "TheGaallery"
const HOST_TYPE = "DEV" // DEV | PROD

// cookie settings
const COOKIE_CONFIG = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 864000000
}

// file config
const MAX_FILE = 400 // in KB
const TOTAL_MAX_FILE = MAX_FILE * 1024 // in KB

export {
    DB_NAME,
    HOST_TYPE,
    COOKIE_CONFIG,
    MAX_FILE,
    TOTAL_MAX_FILE
}