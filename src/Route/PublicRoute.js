import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({children}) {
    const auth = useSelector(state => state.auth)

    if (auth?.accessToken && auth?.user) {
        return <Navigate to="/inbox" />
    } else {
        return children
    }
}
