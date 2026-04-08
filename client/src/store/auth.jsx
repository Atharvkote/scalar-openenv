import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Create context
export const AuthContext = createContext();

// Helper function to get token from cookies
const getTokenFromCookies = () => {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="));
    return cookieValue ? cookieValue.split("=")[1] : null;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getTokenFromCookies());
    const [user, setUser] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [tableNo, setTableNo] = useState(null);
    const [sessionData, setSessionData] = useState("");
    // const navigate = useNavigate();
    const authorizationToken = `Bearer ${token}`;
    // const navigate = useNavigate();

    // Function to store token in cookies
    const storeTokenInCookies = (serverToken) => {
        setToken(serverToken);
        document.cookie = `authToken=${serverToken}; path=/; max-age=3600; secure; samesite=strict`;
    };

    // API URL from environment variables
    const API = import.meta.env.VITE_APP_URI_API;
    // console.log("API OF BACKEND ",API);

    // Check if the user is logged in
    let isLoggedIn = !!token;
    // console.log("isLoggedIn", isLoggedIn);

    // Logout functionality
    const LogoutUser = () => {
        setToken(null);
        setUser(null);
        setIsAdmin(false);
        setIsDeveloper(false);
        setIsSessionActive(false);
        setSessionId(null);
        setTableNo(null);
        setSessionData("");

        // Clear cart and table number from localStorage
        localStorage.removeItem("cart");

        // Remove token from cookies
        document.cookie = "authToken=; path=/; max-age=0";
        toast.success(`Logout Successfully`);

        setTimeout(() => {
            window.location.href = "/";
        }, 500);
    };

    // JWT Authentication - fetch current logged-in user data
    const userAuthentication = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const response = await axios.get(`${API}/api/auth/current-user`, {
                headers: {
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status == 200) {
                const data = response.data;
                // console.log('data: ',data)
                setUser(data.user);
                setSessionData(data.session);
                // ✅ Update session details (if user role is 'user')
                if (data.session) {
                    // console.log('data session: ', data.session);
                    setIsSessionActive(data.session.isActive);
                    setSessionId(data.session.sessionId);
                    setTableNo(data.session.tableNo)

                } else {
                    setIsSessionActive(false);
                    setSessionId(null);
                    setTableNo(null);
                }

            } else {
                console.error("Error fetching user data");
            }
        } catch (error) {
            console.log("Error fetching user data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle initial user authentication if token exists
    useEffect(() => {
        if (token || tableNo) {
            // if(tableNo){
            //     console.log("Table no is available");
            // }
            // if(token){
            //     console.log(" Token is available");
            // }
            userAuthentication();
        } else {
            setIsLoading(false);
        }
    }, [token, tableNo]);

    useEffect(() => {
        // Reset all role flags first
        setIsAdmin(false);
        // setisUser(false);
        setIsDeveloper(false);
        // setIsSessionActive(false);
        // Check and set roles based on the user object
        if (user) {
            const { isDeveloper, isAdmin } = user;
            // console.log('User: ',user)
            setIsAdmin(isAdmin); // Admin if any of the roles is true
            // setisUser(isUser || false);
            setIsDeveloper(isDeveloper || false);
            if (isDeveloper) {
                console.log(`This is Developer`);
            }
        }
    }, [user]);

    useEffect(() => {
        if (sessionData) {
            // console.log('Session Data:',sessionData);
            const { isActive, tableNo, sessionId } = sessionData;
            setIsSessionActive(isActive);
            setTableNo(tableNo);
            setSessionId(sessionId);
        }
    }, [sessionData])

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                storeTokenInCookies,
                LogoutUser,
                user,
                authorizationToken,
                isLoading,
                isAdmin,
                isDeveloper,
                isProfileComplete,
                API,
                isSessionActive,
                sessionId,
                tableNo,
                setTableNo
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within the AuthProvider");
    }
    return authContextValue;
};
