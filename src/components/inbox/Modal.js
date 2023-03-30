import { useEffect, useState } from "react";
import { useGetUsersQuery } from "../../features/users/UsersApi";
import isValidEmail from "../../utilis/isValiedEmail";
import Error from "../../components/ui/Error"
import { useDispatch, useSelector } from "react-redux";
import { conversionsApi, useAddConversationMutation, useEditConversationMutation } from "../../features/conversions/conversionsApi";

export default function Modal({ open, control }) {
    const [to, setTo] = useState("");
    const [message, setMessage] = useState('');
    const [checkedUser, setCheckedUser] = useState(false);
    const [conversation , setConversation] = useState(undefined)
    const dispatch = useDispatch();
    const {data:participate, isLoading, isError  } = useGetUsersQuery(to, {
        skip: !checkedUser
    })
    const { user } = useSelector(state => state.auth) || {};
    const { email: myEmail } = user || {};

    const [addConversation, {isSuccess:isAddConversationSuccess}] = useAddConversationMutation()
    const [editConversation,{isSuccess:isEditConversationSuccess}] = useEditConversationMutation()

    useEffect(()=> {
        if (participate?.length > 0 && participate[0].email !== myEmail) {
            //check conversation 
            dispatch(
                conversionsApi.endpoints.getConversation.initiate({ userEmail: myEmail, participateEmail: to })
                
            ).unwrap().then(data => {
                console.log(data)
                setConversation(data)
            })
        }
    }, [participate, myEmail, dispatch, to])
    useEffect(() => {
        if (isAddConversationSuccess || isEditConversationSuccess) {
            control();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddConversationSuccess, isEditConversationSuccess])
    
    const debounceHandler = (fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fn(...args);
            }, delay)
        }    
    }
    const doSearch = (value) => {
        if (isValidEmail(value)) {
            setTo(value);
            setCheckedUser(true)
        }
    }

    const handleSearch = debounceHandler(doSearch, 500);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (conversation.length > 0) {
            //edit conversation
            editConversation({
                id: conversation[0].id,
                data: {
                    participants: `${myEmail}-${participate[0].email}`,
                    users: [user, participate[0]],
                    message,
                    timestamp: new Date().getTime()
                }
            })
        }
        else {
            // add conversation
            addConversation({
                    participants: `${myEmail}-${participate[0].email}`,
                    users: [user, participate[0]],
                    message,
                    timestamp: new Date().getTime()
                })
        }
    }
  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} >
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                  onChange={(e)=>handleSearch(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                  value={message}
                  onChange={e=>setMessage(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                disabled={conversation === undefined || (participate?.length > 0 && participate[0].email === myEmail)}
              >
                Send Message
              </button>
            </div>

        {   participate?.length === 0 && <Error message="This email does not exist" />}
        {   participate?.length > 0 && participate[0].email === myEmail && <Error message="You can not send message to yourself" />}
          </form>
        </div>
      </>
    )
  );
}
