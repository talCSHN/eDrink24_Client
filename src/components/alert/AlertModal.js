import React from 'react';
import Modal from 'react-modal';
import './AlertModal.css';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const AlertModal = ({ isOpen, onRequestClose, message, navigateOnClose, navigateClosePath }) => {
    const navigate = useNavigate();

    const closeAlert = () => {
        onRequestClose();
        if (navigateOnClose && navigateClosePath) {
            navigate(navigateClosePath);
        }
    };

    const alertStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1999,
        },
        content: {
            margin: "auto",
            width: "300px",
            height: "180px",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            backgroundColor: "#fff",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            zIndex: 2000, // Modal content z-index


        },
    };


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeAlert}
            style={alertStyles}
            contentLabel="알림"
        >
            <h2 className='alert-h2'>알림</h2>
            <p className='alert-p'>{message}</p>
            <button onClick={closeAlert} className="alert-btn-close">닫기</button>
        </Modal>
    );
};

export default AlertModal;

// // ********************************************************
// import AlertModal from '../../components/alert/AlertModal';
// const [alertOpen, setAlertOpen] = useState(false);
// const [alertMessage, setAlertMessage] = useState("");
// const [navigateOnClose, setNavigateOnClose] = useState(false);

// // 알림창 열기
// const openAlert = (message, navigateOnClose = false) => {
//     setAlertMessage(message);
//     setAlertOpen(true);
//     setNavigateOnClose(navigateOnClose);
// }

// // 알림창 닫기
// const closeAlert = () => {
//     setAlertOpen(false);
// }


// <AlertModal
//     isOpen={alertOpen}
//     onRequestClose={closeAlert}
//     message={alertMessage}
//     navigateOnClose={navigateOnClose}
//     navigateClosePath={"/eDrink24"}
// />