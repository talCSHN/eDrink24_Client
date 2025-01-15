import { useEffect, useState } from 'react';
import { Form, useActionData, useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import X from '../../assets/common/엑스.png';
import eyeClosedIcon from '../../assets/login/eye-closed.png';
import eyeOpenIcon from '../../assets/login/eye-open.png';
import kaKao from '../../assets/login/kakao.png';
import eDrinkLogo from '../../assets/login/loginLogo.png';
import at from '../../assets/login/골뱅이.png';
import AlertModal from '../../components/alert/AlertModal.js';
import FindIdModal from '../login/modal/FindIdModal.js';
import FindPwModal from '../login/modal/FindPwModal.js';
import "./LoginComponent.css";

import { KAKAO_AUTH_URL } from '../../config/kakao/oAuth.js';

function LoginComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [loginId, setLoginId] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [pw, setPw] = useState('');

    // 비밀번호 표시/숨기기 함수
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prevState => !prevState); // 상태를 반전시킴
    };

    const handleDirectNormalSignup = () => {
        navigate("/signup");
    }

    // ********************************************************
    const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
    const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지
    const [navigateOnClose, setNavigateOnClose] = useState(false); // 모달 닫힐 때 navigate

    // 알림창 열기
    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    useEffect(() => {
        if (data?.error) {
            openAlert(data.error);
            setLoginId("");
            setPw("");
        } else if (data?.success) {
            openAlert("로그인에 성공하였습니다!", true);
        }
    }, [data]);

    // ********************************************************
    // 아이디 찾기
    const [openFindId, setOpenFindId] = useState(false);

    const openFindIdModal = () => {
        setOpenFindId(true);
    }
    const closeFindIdModal = () => {
        setOpenFindId(false);
    }
    // 비밀번호 찾기
    const [openFindPw, setOpenFindPw] = useState(false);
    const openFindPwModal = () => {
        setOpenFindPw(true);
    }
    const closeFindPwModal = () => {
        setOpenFindPw(false);
    }



    return (
        <div className="login-wrapper">
            <div className="login-container">
                <AlertModal
                    isOpen={alertOpen}
                    onRequestClose={closeAlert}
                    message={alertMessage}
                    navigateOnClose={navigateOnClose}
                    navigateClosePath={"/"}
                />
                <FindIdModal
                    isOpen={openFindId}
                    onRequestClose={closeFindIdModal}
                />
                <FindPwModal
                    isOpen={openFindPw}
                    onRequestClose={closeFindPwModal}
                />

                <div className="login-header">
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>로그인</h1>
                    <button className="X-button" onClick={() => { navigate('/') }}>
                        <img src={X} alt="나가기" />
                    </button>
                </div>

                <div className="login-main-content">
                    <div className='login-main-title'>
                        <span>
                            <strong><img src={eDrinkLogo} alt="메인로고" /></strong>
                        </span>
                        <span><strong>오신 것을 환영해요!</strong></span>
                    </div>

                    <Form method="post" className="login-form">
                        <span>이메일(아이디)</span>
                        <input
                            type="text"
                            name="loginId"
                            className="login-input"
                            placeholder="아이디를 입력해 주세요"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />

                        <span>비밀번호</span>
                        <div className="password-container">
                            <input
                                type={isPasswordVisible ? "text" : "password"} // 상태에 따라 input type 변경
                                name="pw"
                                className="password-input"
                                placeholder="비밀번호를 입력해 주세요"
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                required
                            />
                            <button type="button" className="show-password" onClick={togglePasswordVisibility}>
                                <img
                                    src={isPasswordVisible ? eyeClosedIcon : eyeOpenIcon}
                                    alt={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                                />
                            </button>
                        </div>

                        <button type="submit" className="login-button">로그인</button>
                    </Form>

                    <div className="options">
                        <a onClick={openFindIdModal}>아이디 찾기</a>
                        <a>{'|'}</a>
                        <a onClick={openFindPwModal}>비밀번호 찾기</a>
                    </div>

                    <div className="signUp-options">
                        <p>혹시, 계정이 없으신가요?</p>
                        <button className="kaKao-signUp" onClick={() => window.location.href = KAKAO_AUTH_URL}>
                            <img src={kaKao} alt="카카오" />
                            <span>카카오로 가입하기</span>
                        </button>
                        <button className="normal-signUp" onClick={handleDirectNormalSignup}>
                            <img src={at} alt="골뱅이" />
                            <span>일반회원으로 가입하기</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export async function action({ request }) {
    const loginData = await request.formData();
    const authData = {
        loginId: loginData.get("loginId"),
        pw: loginData.get("pw")
    };

    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/authenticate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { error: "아이디 또는 패스워드가 다릅니다." };
        } else {
            return { error: "서버에 문제가 발생했습니다. 나중에 다시 시도해 주세요." };
        }
    }

    const resData = await response.json();

    const token = resData.token;
    const userId = resData.userId;
    const loginId = resData.loginId;
    const currentLocation = resData.currentLocation;
    const currentStoreId = resData.currentStoreId;

    localStorage.setItem('jwtAuthToken', token);
    localStorage.setItem('loginId', loginId);
    localStorage.setItem('userId', userId);
    localStorage.setItem("currentLocation", currentLocation);
    localStorage.setItem("currentStoreId", currentStoreId);

    return { success: true };
}

export default LoginComponent;
