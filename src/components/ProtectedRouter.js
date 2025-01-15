import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AlertModal from '../components/alert/AlertModal';

const ProtectedRoute = () => {
    const token = localStorage.getItem("jwtAuthToken");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [loginNavigate, setLoginNavigate] = useState(false);

    // 알림창 열기
    const openAlert = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
    };
    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
        setLoginNavigate(true);
    };

    useEffect(() => {
        if (!token) {
            openAlert("로그인이 필요한 서비스입니다.");
        }
    }, [token]);

    if (loginNavigate) {
        return <Navigate to="/login" replace />;
    }

    if (!token) {
        return (
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
                navigateOnClose={false}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
