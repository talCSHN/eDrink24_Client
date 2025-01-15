import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './FindPwModal.css';
import AlertModal from '../../../components/alert/AlertModal';

const FindPwModal = ({ isOpen, onRequestClose }) => {
    const [loginId, setLoginId] = useState('');
    const [email, setEmail] = useState('');
    const [resultFindPw, setResultFindPw] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigateOnClose, setNavigateOnClose] = useState(false);

    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    const closeAlert = () => {
        setAlertOpen(false);
        if (navigateOnClose) {
            onRequestClose();
        }
    }

    const handleFindPwSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/findPw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loginId, email })
        });

        const resultText = await response.text();
        if (response.ok) {
            setResultFindPw(true);
            openAlert(resultText);
        } else {
            openAlert(resultText);
        }
    };

    const handleUpdatePwSubmit = async (e) => {
        e.preventDefault();

        if (pw !== pwConfirm) {
            openAlert("비밀번호가 일치하지 않습니다.");
            return;
        }

        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/findPw/updatePw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loginId, email, newPw: pw })
        });

        const resultText = await response.text();
        if (response.ok) {
            openAlert(resultText, true);
        } else {
            openAlert(resultText);
        }
    };

    // 비밀번호 확인
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwMatch, setPwMatch] = useState(true);

    useEffect(() => {
        setPwMatch(pw === pwConfirm);
    }, [pw, pwConfirm]);

    const resetForm = () => {
        setLoginId('');
        setEmail('');
        setResultFindPw(false);
        setPw('');
        setPwConfirm('');
    }

    const handleModalClose = () => {
        resetForm();
        onRequestClose();
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={handleModalClose}
                contentLabel="Find Password Modal"
                className="find-pw-modal"
                overlayClassName="find-pw-overlay"
            >
                <h2 className="alert-h2">비밀번호 찾기</h2>
                {!resultFindPw ?
                    <form onSubmit={handleFindPwSubmit}>
                        <div className="find-pw-form-group">
                            <label htmlFor="loginId">아이디</label>
                            <input
                                id="loginId"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="find-pw-form-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="find-pw-btn-container">
                            <button type="submit" className="find-pw-btn">찾기</button>
                            <button type="button" onClick={handleModalClose} className="find-pw-close-btn">닫기</button>
                        </div>
                    </form>
                    :
                    <form onSubmit={handleUpdatePwSubmit}>
                        <div className="find-pw-form-group">
                            <label htmlFor="pw">새 비밀번호</label>
                            <input
                                type="password"
                                id="pw"
                                value={pw} onChange={(e) => { setPw(e.target.value) }}
                                required
                            />
                        </div>
                        <div className="find-pw-form-group">
                            <label htmlFor="pwConfirm">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="pwConfirm"
                                value={pwConfirm} onChange={(e) => { setPwConfirm(e.target.value) }}
                                required
                            />
                        </div>
                        <div className="find-pw-match-check">
                            {pw && pwConfirm && (
                                <p className={pwMatch ? "find-pw-match" : "find-pw-mismatch"}>
                                    {pwMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다."}
                                </p>
                            )}
                        </div>
                        <div className="find-pw-btn-container">
                            <button type="submit" className="find-pw-btn">변경</button>
                            <button type="button" onClick={handleModalClose} className="find-pw-close-btn">닫기</button>
                        </div>
                    </form>
                }
            </Modal>
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
            />
        </>
    );
};

export default FindPwModal;
