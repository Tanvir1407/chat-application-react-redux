import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({children}) {
    const auth = useSelector(state => state.auth)

    if (auth?.accessToken && auth?.user) {
        return children
    } else {
        return <Navigate to="/"/>
    }
}
