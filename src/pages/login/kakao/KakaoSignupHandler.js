import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DaumPostcode from 'react-daum-postcode';
import Modal from "react-modal";
import AlertModal from '../../../components/alert/AlertModal';
import xButton from "../../../assets/common/x-button.png";
import './KakaoSignupHandler.css';

function KakaoSignupHandler() {
    const location = useLocation();
    const navigate = useNavigate();
    const cusData = location.state.cusData;
    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [gender, setGender] = useState('남');
    const [maxDate, setMaxDate] = useState("");

    // 비밀번호 확인
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwMatch, setPwMatch] = useState(true);

    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "auto",
            width: "400px",
            padding: "0",
            height: "300px",
            overflow: "hidden",
            textAlign: "center",
        },
    };

    const completeHandler = (data) => {
        setPostalCode(data.zonecode);
        setRoadAddress(data.roadAddress);
        setIsOpen(false);
    };

    // 검색 클릭
    const toggle = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    // 상세 주소검색 event
    const changeHandler = (e) => {
        setDetailAddress(e.target.value);
    }

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        setPwMatch(pw === pwConfirm);
    }, [pw, pwConfirm]);

    // 만 19세미만 선택불가
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        setMaxDate(`${yyyy - 19}-12-31`);
    }, []);

    // 알림창-------------------------------------------------------------------
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigateOnClose, setNavigateOnClose] = useState(false);

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
        if (!alertOpen && navigateOnClose) {
            navigate("/login");
        }
    }, [alertOpen, navigateOnClose, navigate]);
    // -------------------------------------------------------------------------

    // 번호인증-----------------------------------------------------------------
    const [phoneNumber, setPhoneNumber] = useState('');
    const [certificateCode, setCertificateCode] = useState('');
    const [isOpenVerification, setIsOpenVerification] = useState(false);
    const [isVerificated, setIsVerificated] = useState(false);
    const [timer, setTimer] = useState(60);

    const openVerification = (async (e) => {
        e.preventDefault();
        if (phoneNumber.length !== 11) {
            return openAlert("전화번호 11자리를 입력해주세요.")
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/signup/sms/send`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'phoneNum': phoneNumber })
                });
            const result = await response.text();

            if (response.ok) {
                setIsOpenVerification(true);
                setIsVerificated(false);
                setTimer(180);

                // 타이머
                const interval = setInterval(() => {
                    setTimer((prevTimer) => {
                        if (prevTimer <= 1) {
                            clearInterval(interval);
                            setIsOpenVerification(false);
                            return 0;
                        }
                        return prevTimer - 1;
                    });
                }, 1000);
                openAlert(result);
            } else {
                openAlert(result);
            }
        } catch (error) {
            openAlert(error);
        }
    });

    const completeVerificated = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/signup/sms/check`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'phoneNum': phoneNumber, 'certificateCode': certificateCode })
            });
            const result = await response.text();
            if (response.ok) {
                if (result === "ok") {
                    openAlert('인증 성공');
                    setIsVerificated(true);
                } else if (result === "duplicated") {
                    openAlert('이미 가입된 회원입니다.');
                } else {
                    openAlert('알 수 없는 오류');
                }
            } else if (response.status === 400) {
                openAlert(result);
            } else {
                openAlert('인증 실패');
            }
        } catch (error) {
            openAlert('Server Error');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    };
    //--------------------------------------------------------------------------
    const clickHandler = async (e) => {
        const dataForm = [
            { name: 'pw', value: document.getElementById('pw').value },
            { name: 'pwConfirm', value: document.getElementById('pwConfirm').value },
            { name: 'birthdate', value: document.getElementById('birthdate').value },
            { name: 'phoneNum', value: document.getElementById('phoneNum').value },
            { name: 'postalCode', value: postalCode },
            { name: 'address1', value: roadAddress },
            { name: 'address2', value: detailAddress }
        ];

        let allValid = true;
        dataForm.forEach(field => {
            if (field.value === '') {
                allValid = false;
            }
        });

        if (!allValid) {
            openAlert("모든 입력란을 채워주세요.");
            e.preventDefault();
        } else if (!pwMatch) {
            openAlert("비밀번호가 일치하지 않습니다.");
            e.preventDefault();
        } else if (!isVerificated) {
            openAlert("휴대폰 인증을 완료해 주세요.");
        } else {
            const sendData = {
                loginId: cusData.loginId,
                email: cusData.email,
                userName: cusData.userName,
                pw: dataForm[0].value,
                birthdate: dataForm[2].value,
                phoneNum: dataForm[3].value,
                postalCode: dataForm[4].value,
                address1: dataForm[5].value,
                address2: dataForm[6].value,
                gender: gender,
                linkedId: cusData.linkedId
            };

            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData)
            });

            //
            if (response.ok) {
                const loginData = {
                    loginId: sendData.loginId,
                    pw: sendData.pw
                };

                const loginResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/authenticate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                if (loginResponse.ok) {
                    const resData = await loginResponse.json();
                    const token = resData.token;
                    const userId = resData.userId;

                    localStorage.setItem('jwtAuthToken', token);
                    localStorage.setItem('loginId', loginData.loginId);
                    localStorage.setItem('userId', userId);

                    openAlert("회원가입 및 로그인 성공", true, "/");
                } else {
                    openAlert("회원가입은 성공했으나, 로그인 중 오류 발생");
                }
            } else {
                const errorText = await response.text();
                openAlert("서버 오류 발생");
            }
        }
    }
    return (
        <div className="signup-container">
            <div className='signup-header'>
                <h1>추가정보입력</h1>
      
                <button className="su-close-button" onClick={() => window.location.href = "/login"}>
      
                    <img src={xButton} className="XButton" alt="closeXButton" />
                </button>
            </div>

            <form method="post" className="signUpForm">
                <div className="form-group">
                    <label htmlFor="pw">비밀번호
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="password" name="pw" id="pw" className="form-control" placeholder="비밀번호를 입력해 주세요"
                        value={pw} onChange={(e) => { setPw(e.target.value) }} />
                </div>
                <div className="form-group">
                    <label htmlFor="pwConfirm">비밀번호 확인
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="password" name="pwConfirm" id="pwConfirm" className="form-control" placeholder="비밀번호를 다시 입력해 주세요"
                        value={pwConfirm} onChange={(e) => { setPwConfirm(e.target.value) }} />
                    {pw && pwConfirm && (
                        <p className={pwMatch ? "pw-match" : "pw-mismatch"}>
                            {pwMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다."}
                        </p>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="birthdate">생년월일
                        <span className="requiredCheck"> ( 만 19세미만 가입불가능 ) *</span>
                    </label>
                    <input type="date" name="birthdate" id="birthdate" className="form-control" max={maxDate} />
                </div>
                <div className="form-group">
                    <label htmlFor="phoneNum">전화번호
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className="tel-num">
                        <select className="tel-select">
                            <option value="SKT">SKT</option>
                            <option value="KT">KT</option>
                            <option value="LG">LG</option>
                        </select>
                        <input type="text" name="phoneNum" id="phoneNum" className="form-control" placeholder="'-'을 제외하고 작성해주세요'"
                            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} readOnly={isVerificated} />
                        <button className={`crf-button ${!isVerificated ? '' : 'crf-complete'}`}
                            onClick={!isVerificated ? openVerification : (e) => e.preventDefault()}>인증번호</button>
                    </div>
                    {isOpenVerification && !isVerificated && (
                        <div className='crf-num'>
                            <input className='crf-form' placeholder='인증번호 6자리' value={certificateCode} onChange={(e) => setCertificateCode(e.target.value)}></input>
                            <p className='timer-text'>{formatTime(timer)}</p>
                            <button className="crf-comp-button" onClick={completeVerificated}>인증하기</button>
                        </div>
                    )}
                    {isOpenVerification && isVerificated && (<p className='crf-complete-text'>인증이 완료되었습니다.</p>)}
                </div>
                <div className="form-group">
                    <label>주소
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className='postal-search'>
                        <input name='postalCode' id="postalCode" value={postalCode} readOnly placeholder="우편번호" className="form-control-postal" />
                        <button className="search-button" onClick={toggle}>주소 검색</button>
                    </div>
                    <input name='address1' id="address1" value={roadAddress} readOnly placeholder="도로명 주소" className="form-control" />
                    <br />
                    <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                        onRequestClose={() => setIsOpen(false)}>
                        <DaumPostcode onComplete={completeHandler} height="100%" />
                    </Modal>
                    <input type="text" name='address2' id="address2" onChange={changeHandler} value={detailAddress} placeholder="상세주소" className="form-control" />
                    <br />
                </div>

                <div className="form-group">
                    <button type="button" className="btn-submit" onClick={clickHandler}>카카오 회원가입 완료</button>
                </div>
            </form>

            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
                navigateOnClose={navigateOnClose}
                navigateClosePath="/login"
            />
        </div>
    );
}

export default KakaoSignupHandler;
