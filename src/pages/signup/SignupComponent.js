import { Form, useActionData, useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useEffect, useState } from 'react';
import Modal from "react-modal";
import "./SignupComponent.css";
import AlertModal from '../../components/alert/AlertModal';

function SignupComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [gender, setGender] = useState('남');
    const [maxDate, setMaxDate] = useState("");

    // 아이디 중복체크
    const [isIdChecked, setIsIdChecked] = useState(false);

    // 비밀번호 확인
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwMatch, setPwMatch] = useState(true);

    // Modal 스타일
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

    // **********************************************************************
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

    // 알림창 닫힐 때 navigate 호출
    useEffect(() => {
        if (!alertOpen && navigateOnClose) {
            navigate("/login");
        }
    }, [alertOpen, navigateOnClose, navigate]);

    // 회원가입 성공시 알람 / 2번째 파라미터값에 true를 줘서
    useEffect(() => {
        if (data) {
            openAlert(data.message, data.success); // success : true
        }
    }, [data]);
    // **********************************************************************

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        setPwMatch(pw === pwConfirm);
    }, [pw, pwConfirm]);

    // 만 19세미만 선택불가
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        setMaxDate(`${yyyy - 19}-12-31`); // 만 19세 이상
    }, []);

    // 아이디 중복체크
    const checkId = async (e) => {
        e.preventDefault();
        const loginId = document.getElementById('loginId').value;

        if (!loginId) {
            openAlert("아이디를 입력해 주세요.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/customerIdCheck/${loginId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const message = await response.text();

            if (response.status === 409) {
                openAlert(message); // "이 아이디는 사용불가합니다."
                setIsIdChecked(false);
            } else if (response.ok) {
                openAlert(message); // "이 아이디는 사용가능합니다."
                setIsIdChecked(true);
            } else {
                throw new Error("중복체크 요청 실패");
            }
        } catch (error) {
            openAlert("중복체크 중 오류가 발생했습니다.");
            setIsIdChecked(false);
        }
    };

    // 중복검사 완료후, 입력된 아이디 변경될시
    const handleIdChange = (e) => {
        setIsIdChecked(false);
    }

    // 성별바꾸기
    const handleGenderChange = (e) => {
        setGender(e.target.value);
    };

    // 번호인증
    const [phoneNumber, setPhoneNumber] = useState('');
    const [certificateCode, setCertificateCode] = useState('');
    const [isOpenVerification, setIsOpenVerification] = useState(false);
    const [isVerificated, setIsVerificated] = useState(false);
    const [timer, setTimer] = useState(60);

    // 인증창열기
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
                setIsVerificated(false); // 인증 진행 중에는 인증 완료 상태 초기화
                setTimer(180); // 타이머 초기화

                // 타이머 시작 ( 남은 시간을 1초씩 줄임 )
                const interval = setInterval(() => {
                    setTimer((prevTimer) => {
                        if (prevTimer <= 1) {
                            clearInterval(interval);
                            setIsOpenVerification(false); // 타이머가 0이 되면 인증 창 닫기
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

    // 타이머 포맷팅
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    };

    // 회원가입 완료 핸들러
    const clickHandler = (e) => {
        const dataForm = [
            { name: 'loginId', value: document.getElementById('loginId').value },
            { name: 'pw', value: document.getElementById('pw').value },
            { name: 'pwConfirm', value: document.getElementById('pwConfirm').value },
            { name: 'userName', value: document.getElementById('userName').value },
            { name: 'birthdate', value: document.getElementById('birthdate').value },
            { name: 'phoneNum', value: document.getElementById('phoneNum').value },
            { name: 'email', value: document.getElementById('email').value },
            { name: 'postalCode', value: postalCode },
            { name: 'address1', value: roadAddress },
            { name: 'address2', value: detailAddress },
            { name: 'currentLocation', value: roadAddress }
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
        } else if (!isIdChecked) {
            openAlert("아이디 중복체크를 완료해 주세요.");
            e.preventDefault();
        } else if (!isVerificated) {
            openAlert("휴대폰 인증을 완료해 주세요.");
        }
    }

    return (
        <div className="signup-container">
            <div className='signup-header'>
                <h1>회원가입</h1>
                <button className="su-close-button" onClick={() => window.location.href = "/login"}>
                    <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                </button>
            </div>

            <Form method="post" className="signUpForm" >
                <div className="form-group">
                    <label htmlFor="loginId">아이디
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="text" name="loginId" id="loginId" className="form-control-loginId"
                        placeholder="아이디를 입력해 주세요" onChange={handleIdChange} />
                    <button className={`check-button ${isIdChecked ? "check-complete" : ""}`} onClick={!isIdChecked ? checkId : (e) => e.preventDefault()}>
                        {isIdChecked ? "체크 완료" : "중복 체크"}
                    </button>
                </div>
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
                    <label htmlFor="userName">이름
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className="name-genderGroup">
                        <input type="text" name="userName" id="userName" className="form-control-userName" placeholder="이름을 입력해 주세요" />
                        <div className="gender-options">
                            <label htmlFor="genderMale" className="gender-label">
                                <input type="radio" name="gender" id="genderMale" value="남" onChange={handleGenderChange} checked={gender === "남"} />
                                <span></span><span className="text">남</span>
                            </label>
                            <label htmlFor="genderFemale" className="gender-label">
                                <input type="radio" name="gender" id="genderFemale" value="여" onChange={handleGenderChange} checked={gender === "여"} />
                                <span></span><span className="text">여</span>
                            </label>
                        </div>
                    </div>
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
                    <label htmlFor="email">이메일
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="text" name="email" id="email" className="form-control" placeholder="이메일을 입력해 주세요" />
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
                    <button name="signup" className="btn-submit" onClick={clickHandler}>회원 가입 완료</button>
                </div>
            </Form>

            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
                navigateOnClose={navigateOnClose}
                navigateOnClosePath="/login"
            />
        </div>
    );
}

export async function action({ request }) {
    const data = await request.formData();
    const authData = {
        loginId: data.get('loginId'),
        pw: data.get('pw'),
        userName: data.get("userName"),
        birthdate: data.get("birthdate"),
        gender: data.get("gender"),
        phoneNum: data.get("phoneNum"),
        email: data.get("email"),
        postalCode: data.get("postalCode"),
        address1: data.get("address1"),
        address2: data.get("address2"),
        currentLocation: data.get("address1")
    };

    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
    });

    if (response.ok) {
        return {
            success: true,
            message: "회원가입이 완료되었습니다!"
        };
    } else {
        const errorText = await response.text();
        return {
            success: false,
            message: errorText || "회원가입 중 오류가 발생했습니다."
        };
    }
}

export default SignupComponent;
