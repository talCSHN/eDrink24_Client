
import React from 'react';
import Modal from 'react-modal';
import './AlertModalOfClickBasketButton.css';


Modal.setAppElement('#root');

const AlertModalOfClickBasketButton = ({ isOpen, message, navigateOnYes, navigateOnNo }) => {

    const alertStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "auto",
            width: "300px",
            height: "auto",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            backgroundColor: "#fff",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        },
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={navigateOnNo}
            style={alertStyles}
            className="modal-container"    // 모달 컨텐츠에 적용
            overlayClassName="modal-overlay" // 오버레이에 적용
            contentLabel="알림"
        >
            <h2 className='alert-h2'>알림</h2>
            <p className='alert-p'>
                <>
                    <p>장바구니에 담겼습니다.</p><p>장바구니로 이동하시겠습니까?</p>
                </>
            </p>
            <div className="modal-buttons">
                <button onClick={navigateOnYes} className="btn-alert-yes">예</button>
                <button onClick={navigateOnNo} className="btn-alert-no">아니오</button>
            </div>
        </Modal>
    );
};

export default AlertModalOfClickBasketButton;
