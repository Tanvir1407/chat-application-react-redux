import { apiSlice } from "../api/apiSlice";

export const conversionsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=5`
        }),
        getConversation: builder.query({
            query: ({userEmail, participateEmail}) => `/conversations?participants_like=${userEmail}-${participateEmail}&&participants_like=${participateEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: (data) => ({
                url: "/conversations",
                method: "POST",
                body: data,
            })
        }),
        editConversation: builder.mutation({
            query: ({id,data}) => ({
                url: `/conversations/${id}`,
                method: "PATCH",
                body: data,
            })
        }),
    })
})

export const {useGetConversationsQuery, useGetConversationQuery, useAddConversationMutation, useEditConversationMutation} = conversionsApi