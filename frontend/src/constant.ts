export const SERVER_URL = "http://127.0.0.1:7000/api/v1"
// export const SERVER_URL = "https://api.thegaallery.in/api/v1"
export const WHATSAPP_NUMBER = "";

export const SHOW_ALL_HREF = (SECTION: string) => `/products?sections=${encodeURIComponent(SECTION)}`; // all-products page (you will add the filter there)
export const PRODUCT_HREF = (slug: string) => `/products/${slug}`; // product details page