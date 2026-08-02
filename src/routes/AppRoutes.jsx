import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
        </Routes>
    );
}

export default AppRoutes;