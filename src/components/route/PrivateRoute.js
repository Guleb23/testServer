import { useAuth } from "contexts/AuthContext";
import { Navigate } from "react-router-dom";


const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/auth/sign-in" replace />;
};

export default PrivateRoute;