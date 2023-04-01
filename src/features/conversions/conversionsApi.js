import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";
import io from "socket.io-client";

export const conversionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=5`,
      async onCacheEntryAdded(arg, {updateCachedData,cacheDataLoaded,cacheEntryRemoved}) {
        // create socket
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized:false
        });
        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            
            updateCachedData(draft => {
              const conversation = draft.find(c => c.id == data?.data?.id);

              if (conversation.id) {
                conversation.message = data.data.message;
                conversation.timestamp = data.data.timestamp;
              } else {
                
              }
            })

          })
        } catch (err) {
          
        }
        await cacheEntryRemoved();
        socket.close()
      }
    }),
    getConversation: builder.query({
      query: ({ userEmail, participateEmail }) =>
        `/conversations?participants_like=${userEmail}-${participateEmail}&&participants_like=${participateEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        const conversation = await queryFulfilled;
        const users = arg.data.users;
        const senderUser = users.find((user) => user.email === arg.sender);
        const receiverUser = users.find((user) => user.email !== arg.sender);

        // silent entry to message table
        if (conversation?.data?.id) {
          dispatch(
            messagesApi.endpoints.addMessage.initiate({
              conversationId: conversation?.data?.id,
              sender: senderUser,
              receiver: receiverUser,
              message: arg.data.message,
              timestamp: arg.data.timestamp,
            })
          );
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, sender, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        const users = arg.data.users;
        const senderUser = users.find((user) => user.email === arg.sender);
        const receiverUser = users.find((user) => user.email !== arg.sender);

        //optimistic cache update start

        const pathResult1 = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            arg.sender,
            (draft) => {
              const draftConversation = draft.find(
                (dConv) => dConv.id == arg.id
              );
              draftConversation.message = arg.data.message;
              draftConversation.timestamp = arg.data.timestamp;
            }
          )
        );

        //optimistic cache update end
        try {
          const conversation = await queryFulfilled;

          // silent entry to message table
          if (conversation?.data?.id) {
            const res = await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.data?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: arg.data.message,
                timestamp: arg.data.timestamp,
              })
            ).unwrap();
        // pessimistic cache Update on message
            ////////////start/////////////
            //ata ar korte hobe na clint e , karon client side socket.io diya apdet kore dicchi 
            // dispatch(
            //   apiSlice.util.updateQueryData(
            //     "getMessages",
            //     res.conversationId?.toString(),
            //       (draft) => { 
            //           draft.push(res)
            //       }
            //   )
            // );
            //////////////end/////////////
          }
        } catch (err) {
            console.log(err)
          pathResult1.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversionsApi;
