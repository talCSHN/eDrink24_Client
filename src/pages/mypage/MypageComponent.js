import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js'; // Footer 컴포넌트 import
import { logout } from '../login/LogoutComponent';
import CouponComponent from './CouponComponent.js';
import './MypageComponent.css';

import back from '../../assets/common/back.png';
import userInfo from '../../assets/common/set.png';

import basket from '../../assets/mypage/mp_bag.png';
import coupon from '../../assets/mypage/mp_coupon.png';
import dibs from '../../assets/mypage/mp_heart.png';
import point from '../../assets/mypage/mp_point.png';

import deleteUser from '../../assets/mypage/경고.png';
import notice from '../../assets/mypage/공지사항.png';
import manager from '../../assets/mypage/관리자.png';
import logOut from '../../assets/mypage/로그아웃.png';
import ask1 from '../../assets/mypage/문의하기.png';
import ask from '../../assets/mypage/일대일문의.png';
import PointHistoryModalComponent from './PointHistoryModalComponent.js';

function MypageComponent() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // 아코디언 상태 관리
    const [pointHistory, setHistoryHistory] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    const [coupons, setCoupons] = useState([]); // 쿠폰 데이터 상태
    const [isModalOpen, setIsModalOpen] = useState(false); // 쿠폰 모달 상태

    useEffect(() => {
        // 로그인 상태 확인
        const token = localStorage.getItem("jwtAuthToken");
        const loginId = localStorage.getItem("loginId");

        if (token && loginId) {
            setIsLoggedIn(true);
            fetchCustomerData(token, loginId);
        }
    }, []);

    useEffect(() => {
        if (customerData && customerData.role === "점주") {
            fetchMyStoreId(customerData.brNum);
        }
    }, [customerData]);

    const fetchCustomerData = async (token, loginId) => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/selectCustomerMyPage/${loginId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setCustomerData(data);
        }
    }

    const fetchMyStoreId = async (brNum) => {
        try {
            const storeResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findMyStore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(brNum)
            });

            if (storeResponse.ok) {
                const storeId = await storeResponse.json();
                localStorage.setItem("myStoreId", storeId);
            }
        } catch (error) {
            console.error('Error fetching store ID:', error);
        }
    };

    const navigateUpdateCustomer = () => {
        navigate("/mypage/updateCustomer", { state: { customerData } })
    };

    const navigateManagerComponent = () => {
        navigate("/manager");
    }

    const toggleAccordion = () => {
        setIsOpen(!isOpen); // 아코디언 열림/닫힘 상태 전환
    };

    const showHistoryHistory = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/showPoint/${userId}`);

            if (response.ok) {
                const resdata = await response.json();
                setHistoryHistory(resdata);
                setModalOpen(true);
            }
        } catch (error) {
            console.error("fetching Error show pointHistory", error);
        }
    };

    return (
        <div className="myPage-wrapper">
            <div className="myPage-container">

                <div className='myPage-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>마이페이지</h1>
                    <div>
                        <button className="settings-button" onClick={() => { navigateUpdateCustomer() }}>
                            <img src={userInfo} alt="셋팅" />
                        </button>
                    </div>
                </div>

                {/* 로그인 상태 따라 변동되는 정보창 */}
                {isLoggedIn && customerData ? (
                    <div className="user-info-prompt">
                        <div className="info-text">
                            <p><strong>{customerData.userName}님, 환영합니다!</strong></p>
                            <p className="info-role">{customerData.role}</p>
                        </div>
                    </div>
                ) : (
                    <div className="login-signUp-prompt" onClick={() => navigate("/login")} >
                        <div className="prompt-text">
                            <p><strong>로그인/회원가입<br />하신 후 이용해주세요.</strong></p>
                            <p>간편로그인으로 편리하게 이용하기!</p>
                        </div>
                    </div>
                )}



                <div className="myPage-icon">
                    <div className="myPage-icon-item">
                        <img src={point} alt="포인트" onClick={showHistoryHistory} />
                        <span>포인트 <span className="myPage-additionalInfo">{isLoggedIn && customerData ? customerData.totalPoint : undefined}</span></span>
                    </div>
                    <div className="myPage-icon-item" onClick={() => setIsModalOpen(true)}>
                        <img src={coupon} alt="쿠폰" />
                        <span>쿠폰</span>
                    </div>
                    <div className="myPage-icon-item">
                        <img src={dibs} alt="찜" onClick={() => { navigate('/dibs') }} />
                        <span>찜</span>
                    </div>
                    <div className="myPage-icon-item">
                        <img src={basket} alt="장바구니" onClick={() => { navigate('/basket') }} />
                        <span>장바구니</span>
                    </div>
                </div>

                <div className='line'></div>

                <div className="sections">
                    <div className="section">
                        <h3>고객센터</h3>
                        <div className="menu1">
                            <div className="icon-item2">
                                <img src={ask} alt="문의하기" />
                                <span>문의하기</span>
                            </div>
                            <div className="icon-item2">
                                <img src={notice} alt="공지사항" />
                                <span>공지사항</span>
                            </div>
                            <div className="icon-item2">
                                <img src={ask1} alt="1:1 문의" />
                                <span>1:1 문의</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/*                <div className='line3'></div> */}

                <div className="sections">
                    <div className="section">
                        <h3>내 정보 관리</h3>
                        <div className="menu2">
                            {isLoggedIn && customerData ? (
                                customerData.role === '점주' ? (
                                    <>
                                        <div className="icon-item2" onClick={() => navigate("/admin")}>
                                            <img src={manager} alt="관리자 페이지로 이동" />
                                            <span>관리자 페이지로 이동</span>
                                        </div>
                                        <div className="icon-item2" onClick={() => { navigateUpdateCustomer() }}>
                                            <img src={userInfo} alt="회원정보수정" />
                                            <span>회원정보 수정</span>
                                        </div>
                                        <div className="icon-item2" onClick={isLoggedIn ? logout : undefined}>
                                            <img src={logOut} alt="로그아웃" />
                                            <span>로그아웃</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="icon-item2" onClick={() => { navigateManagerComponent() }}>
                                            <img src={manager} alt="관리자계정으로 전환하기" />
                                            <span>관리자계정으로 전환하기</span>
                                        </div>
                                        <div className="icon-item2" onClick={() => { navigateUpdateCustomer() }}>
                                            <img src={userInfo} alt="회원정보수정" />
                                            <span>회원정보 수정</span>
                                        </div>
                                        <div className="icon-item2" onClick={isLoggedIn ? logout : undefined}>
                                            <img src={logOut} alt="로그아웃" />
                                            <span>로그아웃</span>
                                        </div>
                                    </>
                                )
                            ) : (
                                <div className="icon-item2" onClick={() => navigate("/login")}>
                                    <img src="assets/mypage/로그아웃.png" alt="로그아웃" />
                                    <span>로그인</span>
                                </div>
                            )}
                            <div className="icon-item2">
                                <img src={deleteUser} alt="계정 삭제" />
                                <span>계정 삭제</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아코디언 컴포넌트 추가 */}
                <div className="accordion-container">
                    <div
                        onClick={toggleAccordion}
                        className="accordion-header"
                    >
                        <p>고객센터 ( 평일 09:00~18:00 )
                            <br /><strong>1577-8007</strong>
                        </p>
                        <span>{isOpen ? '▲' : '▼'}</span>
                    </div>
                    {isOpen && (
                        <div className="accordion-content">
                            <p>(주) 이드링크24</p>
                            <p>대표자 홍삼주</p>
                            <p>사업자등록번호 123-45-67891</p>
                            <p>해운대 스파로스 아카데미</p>
                        </div>
                    )}
                </div>

                {isModalOpen && <CouponComponent onClose={() => setIsModalOpen(false)} />}

            </div>
            <FooterComponent />
            <PointHistoryModalComponent
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                data={pointHistory}
            />
        </div >

    );
}

export default MypageComponent;
