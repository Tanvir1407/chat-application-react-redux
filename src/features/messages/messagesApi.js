import { apiSlice } from "../api/apiSlice";
import io from 'socket.io-client'

export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) => `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=10`,

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
          socket.on("message", (data) => {
            console.log(data)
            updateCachedData(draft => {
              draft.push(data.data)
            })

          })
        } catch (err) {
          
        }
          await cacheEntryRemoved();
          socket.close()
      }
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: "/messages",
                method: "POST",
                body:data
            })
        })
    })
})

export const {useGetMessagesQuery,useAddMessageMutation} = messagesApi