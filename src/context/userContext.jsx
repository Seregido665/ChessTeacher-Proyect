import { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const [user, setUser] = useState(storedUser);

    const userLogin = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    }

    return (
        <AuthContext.Provider value={{ user, userLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;