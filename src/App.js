import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import useAuthHook from "./Hooks/useAuthHook";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./Route/PrivateRoute";
import PublicRoute from "./Route/PublicRoute";

function App() {
    const authCheck = useAuthHook();
    return (
        !authCheck ? <div className="h-screen flex justify-center items-center">authorization Checking...</div> :
        <Router>
            <Routes>
                    <Route path="/" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>}/>
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>} />
                <Route path="/inbox" element={
                <PrivateRoute>
                    <Conversation />
                </PrivateRoute>}/>
                
                <Route path="/inbox/:id" element={
                    <PrivateRoute>
                        <Inbox />
                    </PrivateRoute>} />
            </Routes>
        </Router>  
    );
}

export default App;
