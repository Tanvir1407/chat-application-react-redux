import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversionsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=5`
        }),
        getConversation: builder.query({
            query: ({userEmail, participateEmail}) => `/conversations?participants_like=${userEmail}-${participateEmail}&&participants_like=${participateEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: ({sender,data}) => ({
                url: "/conversations",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                const conversation = await queryFulfilled;

                const users = arg.data.users;
                const senderUser = users.find(user => user.email === arg.sender);
                const receiverUser = users.find(user => user.email !== arg.sender);
                // silent entry to message table 
                if (conversation?.data?.id) {
                    dispatch(messagesApi.endpoints.addMessage.initiate({
                        conversationId: conversation?.data?.id,
                        sender: senderUser,
                        receiver: receiverUser,
                        message: arg.data.message,
                        timestamp:arg.data.timestamp
                    }))
                }
            }
        }),
        editConversation: builder.mutation({
            query: ({id,sender,data}) => ({
                url: `/conversations/${id}`,
                method: "PATCH",
                body: data,
            }),
                async onQueryStarted(arg, {queryFulfilled, dispatch}) {
                const conversation = await queryFulfilled;

                const users = arg.data.users;
                const senderUser = users.find(user => user.email === arg.sender);
                const receiverUser = users.find(user => user.email !== arg.sender);
                // silent entry to message table 
                if (conversation?.data?.id) {
                    dispatch(messagesApi.endpoints.addMessage.initiate({
                        conversationId: conversation?.data?.id,
                        sender: senderUser,
                        receiver: receiverUser,
                        message: arg.data.message,
                        timestamp:arg.data.timestamp
                    }))
                }
            }
        }),
    })
})

export const {useGetConversationsQuery, useGetConversationQuery, useAddConversationMutation, useEditConversationMutation} = conversionsApi