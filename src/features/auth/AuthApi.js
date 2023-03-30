import { apiSlice } from "../api/apiSlice";
import { userLoggedIn } from "./AuthSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: "/register",
                method:"POST",
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled ,dispatch }) {
                try {
                    const result = await queryFulfilled;
                    //accessToken set localStorage
                    localStorage.setItem("auth", JSON.stringify({
                        accessToken: result.data.accessToken,
                        user: result.data.user,
                    }))
                    //access Token set redux store
                    dispatch(userLoggedIn({
                        accessToken: result.data.accessToken,
                        user: result.data.user,
                    }))
                } catch(err) {
                    //nothing else
                }
            }
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "/login",
                method: "POST",
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled ,dispatch }) {
                try {
                    const result = await queryFulfilled;
                    //accessToken set localStorage
                    localStorage.setItem("auth", JSON.stringify({
                        accessToken: result.data.accessToken,
                        user: result.data.user,
                    }))
                    //access Token set redux store
                    dispatch(userLoggedIn({
                        accessToken: result.data.accessToken,
                        user: result.data.user,
                    }))
                } catch(err) {
                    //nothing else
                }
            }
        }),
    })
})

export const {useRegisterMutation,useLoginMutation} =authApi