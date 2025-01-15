import { useEffect, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import Modal from "react-modal";
import { Form, useActionData, useLocation, useNavigate } from 'react-router-dom';
import AlertModal from '../../components/alert/AlertModal';
import "./UpdateCustomerComponent.css";

import back from '../../assets/common/back.png';
import home from '../../assets/common/home.png';

function UpdateCustomerComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // 비밀번호 확인
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwMatch, setPwMatch] = useState(true);

    // mypage로부터 받은 customer 정보
    const [initCustomerData, setInitCustomerData] = useState(null);
    const location = useLocation();
    const { customerData } = location.state || {};

    useEffect(() => {
        if (customerData) {
            setInitCustomerData(customerData);
        }
    }, [customerData])

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

    // ***********************************************************
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigationClose, setNavigationClose] = useState(false); // 모달 닫힐때 navigate

    // 알림창 열기
    const openAlert = (message, navigationClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigationClose(navigationClose);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    useEffect(() => {
        if (!alertOpen && navigationClose) {
            navigate("/mypage");
        }
    }, [alertOpen, navigationClose, navigate]);
    // ***********************************************************

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        setPwMatch(pw === pwConfirm);
    }, [pw, pwConfirm]);

    // 회원정보 수정요청
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const formEntity = {
            pw: formData.get('pw'),
            phoneNum: formData.get('phoneNum') || initCustomerData.phoneNum,
            email: formData.get('email') || initCustomerData.email,
            postalCode: postalCode || initCustomerData.postalCode,
            address1: roadAddress || initCustomerData.address1,
            address2: detailAddress || initCustomerData.address2,

            userId: initCustomerData.userId,
            userName: initCustomerData.userName,
            loginId: initCustomerData.loginId,
            gender: initCustomerData.gender,
            totalPoint: initCustomerData.totalPoint,
            birthdate: initCustomerData.birthdate,
            role: initCustomerData.role,
        };

        if (pw && !pwMatch) {
            openAlert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/updateCustomer`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization' : `Bearer ${token}`
                },
                body: JSON.stringify(formEntity)
            });

            const result = await response.json();

            if (response.ok && result.message === "success") {
                openAlert("회원정보 수정이 완료되었습니다!", true);
            } else {
                openAlert(result.message || "회원정보 수정 중, 오류가 발생하였습니다.");
            }
        } catch (error) {
            openAlert("서버와의 통신 중, 오류가 발생하였습니다.");
        }
    }

    // 버튼 클릭 핸들러 함수
    const handleDirectHome = () => {
        navigate("/");
    };

    return (
        <div className="updateCustomer-wrapper">
            <div className="updateCustomer-container">

                <div className='updateCustomer-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>회원 정보 수정</h1>
                    <div>
                        <button className="settings-button" onClick={handleDirectHome}>
                            <img src={home} alt="셋팅" />
                        </button>
                    </div>
                </div>

                <div className="updateCustomer-form">
                    <Form method="post" className="updateCustomerForm" onSubmit={handleUpdateSubmit}>
                        {data && data.message && <p>{data.message}</p>}
                        <div className="form-group">
                            <label htmlFor="loginId">아이디</label>
                            <input type="text" name="loginId" id="loginId" className="form-control"
                                placeholder={customerData.loginId} disabled />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pw">비밀번호</label>
                            <input type="password" name="pw" id="pw" className="form-control" placeholder="변경 시에만 입력해 주세요."
                                value={pw} onChange={(e) => { setPw(e.target.value) }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pwConfirm">비밀번호 확인</label>
                            <input type="password" name="pwConfirm" id="pwConfirm" className="form-control" placeholder="입력한 비밀번호를 다시 입력해 주세요."
                                value={pwConfirm} onChange={(e) => { setPwConfirm(e.target.value) }} />
                            {pw && pwConfirm && (
                                <p className={pwMatch ? "pw-match" : "pw-mismatch"}>
                                    {pwMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다."}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="userName">이름</label>
                            <div className="name-genderGroup">
                                <input type="text" name="userName" id="userName" className="form-control" placeholder={customerData.userName} disabled />
                            </div>
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
                                <input type="text" name="phoneNum" id="phoneNum" className="form-control" placeholder={customerData.phoneNum} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">이메일
                                <span className="requiredCheck"> *</span>
                            </label>
                            <input type="text" name="email" id="email" className="form-control" placeholder={customerData.email} />
                        </div>

                        <div className="form-group">
                            <label>주소
                                <span className="requiredCheck"> *</span>
                            </label>
                            <div className='postal-search'>
                                <input name='postalCode' id="postalCode" value={postalCode} readOnly placeholder={customerData.postalCode} className="form-control-postal" />
                                <button className="search-button" onClick={toggle}>주소 검색</button>
                            </div>
                            <input name='address1' id="address1" value={roadAddress} readOnly placeholder={customerData.address1} className="form-control" />
                            <br />
                            <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                                onRequestClose={() => setIsOpen(false)}>
                                <DaumPostcode onComplete={completeHandler} height="100%" />
                            </Modal>
                            <input type="text" name='address2' id="address2" onChange={changeHandler}
                                value={detailAddress} placeholder={customerData.address2} className="form-control" />
                            <br />
                        </div>

                        <div className="form-group-submit">
                            <button type="submit" name="updateCustomer" className="btn-submit-complete" >수정완료</button>
                        </div>
                        <div className="form-group-submit">
                            <button onClick={() => navigate(-1)} className="btn-submit-cancel" >수정취소</button>
                        </div>
                    </Form>


                    <AlertModal
                        isOpen={alertOpen}
                        onRequestClose={closeAlert}
                        message={alertMessage}
                        navigateOnClose={navigationClose}
                        navigateOnClosePath="/mypage" // 경로를 지정합니다.
                    />

                </div>
            </div>
        </div>
    );
}

export default UpdateCustomerComponent;