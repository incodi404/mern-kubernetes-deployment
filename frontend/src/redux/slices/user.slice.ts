import { createSlice } from "@reduxjs/toolkit"

interface UserData {
    name: string | null
    phoneNumber: string | null
}

const initialState: UserData = {
    name: null,
    phoneNumber: null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.name = action.payload?.name
            state.phoneNumber = action.payload?.phoneNumber
        },
        clearUserData: (state) => {
            state.name = null
            state.phoneNumber = null
        }
    }
})

export const { setUserData, clearUserData } = userSlice.actions
export default userSlice.reducer