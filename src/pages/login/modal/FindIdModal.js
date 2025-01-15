import React, { useState } from 'react';
import Modal from 'react-modal';
import './FindIdModal.css';
import AlertModal from '../../../components/alert/AlertModal';

const FindIdModal = ({ isOpen, onRequestClose }) => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const openAlert = (result) => {
        setAlertMessage("아이디는 " + result + " 입니다.");
        setAlertOpen(true);
    }

    const closeAlert = () => {
        setAlertOpen(false);
        onRequestClose(); // LoginComponent에서 상속받은 closeAlert
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            userName: userName,
            email: email
        };

        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/findId`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const resData = await response.text();
        openAlert(resData);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                contentLabel="Find ID Modal"
                className="find-id-modal"
                overlayClassName="find-id-overlay"
            >
                <h2 className="alert-h2">아이디 찾기</h2>

                <form onSubmit={handleSubmit}>
                    <div className="find-id-form-group">
                        <label htmlFor="userName">이름</label>
                        <input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="find-id-form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="find-id-btn-container">
                        <button type="submit" className="find-id-btn">찾기</button>
                        <button type="button" onClick={onRequestClose} className="find-id-close-btn">닫기</button>
                    </div>
                </form>
            </Modal>
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert} // AlertModal에도 상속시킴
                message={alertMessage}
            />
        </>
    );
};

export default FindIdModal;
