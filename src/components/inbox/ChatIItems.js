import { useDispatch, useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversions/conversionsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment/moment";
import getPartnerInfo from "../../utilis/getPartnerInfo";
import gravatarUrl from 'gravatar-url';
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { userLoggedOut } from "../../features/auth/AuthSlice";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useGetConversationsQuery(email);
  console.log(conversations)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (error?.data === "jwt expired") {
      dispatch(userLoggedOut())
      navigate("/")
    }
  },[error,dispatch,navigate])

  let content = null;
  if (isLoading) {
    content = <li className="m-2 text-center">Loading...</li>;
  } else if (!isLoading && isError) {
    content = (
      <li className="m-2 text-center">
        <Error message={error.data} />
      </li>
    );
  }
  
  else if (!isLoading && !isError && conversations?.length === 0) {
    content = <li>No Message Founded</li>;
  }
  
  else if (!isLoading && !isError && conversations.length > 0) {
    content = conversations.map((conversation) => {

      const { id, message, timestamp } = conversation;
      const { name, email: partnerEmail } = getPartnerInfo(
        conversation.users,
        email
      );

      return (
        <li key={id}>
          <Link to={`/inbox/${id}`}>
            <ChatItem
            avatar={gravatarUrl(partnerEmail, {size: 80})}
            name={name}
            lastMessage={message}
            lastTime={moment(timestamp).fromNow()}
            />
          </Link>
        </li>
      );
    });
  }
  return <ul>{content}</ul>;
}
