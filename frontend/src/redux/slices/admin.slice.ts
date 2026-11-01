import { createSlice } from "@reduxjs/toolkit"

interface AdminAuth {
    isAdminAuthenticated: Boolean | undefined
    adminData: Object | null
}

const initialState: AdminAuth = {
    isAdminAuthenticated: undefined,
    adminData: null
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        adminLogin: (state, action) => {
            state.isAdminAuthenticated = true
            state.adminData = action.payload?.adminData
        },
        adminLogout: (state) => {
            state.isAdminAuthenticated = false
            state.adminData = null
        }
    }
})

export const { adminLogin, adminLogout } = adminSlice.actions
export default adminSlice.reducer