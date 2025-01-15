import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyplaceComponent.css';
import place from '../../assets/common/place.png'

function MyPlaceComponent() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);

    const [store, setStore] = useState([]); // 가게 데이터 불러오기
    const [storeName, setStoreName] = useState(''); // 가게 이름

    const currentStoreId = parseInt(localStorage.getItem("currentStoreId"));

    useEffect(() => {
        const token = localStorage.getItem("jwtAuthToken");
        const loginId = localStorage.getItem("loginId");

        if (token && loginId) {
            setIsLoggedIn(true);
            fetchCustomerData(loginId);
        }
    }, []);

    useEffect(() => {
        const fetchStore = async () => {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findStore/${currentStoreId}`, {
                method: "GET"
            });
            if (response.ok) {
                const data = await response.json();
                setStore(data);
            }
        }
        fetchStore();
    }, []);


    useEffect(() => {
        if (store && customerData && customerData.currentStoreId) {
            setStoreName(store.storeName);
        }
    }, [store, customerData]);


    const fetchCustomerData = async (loginId) => { // 회원정보도 맨날 불러와야하나..?
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/selectCustomerMyPage/${loginId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response) {
            const data = await response.json();
            setCustomerData(data);
        } else {
            console.error('error:', response.errorStatus());
        }
    };

    const navigateSetLocation = () => {
        navigate("/myplace_store", { state: { customerData } });
    }

    return (
        // 로그인 상태 따라 변동되는 주소정보
        <div className="home-my-place-container">
            {/* 회원 주소정보 */}
            <div className="my-home-address">
                {isLoggedIn && customerData ? (
                    <div className="login-myhome-address-info" onClick={navigateSetLocation}>
                        <img className="placeIcon" src={place} alt="place-icon" />
                        <p className="home-place-text">{customerData.currentLocation}</p>
                    </div>
                ) : (
                    <div className="logout-myhome-address-info" onClick={() => navigate("/login")}>
                        <img className="placeIcon" src={place} alt="place-icon" />
                        <p className="home-place-text">로그인이 필요합니다.</p>
                    </div>
                )}
            </div>

            {/* 픽업매장 주소 선택 */}
            <div className="pickup-shop-address">
                {isLoggedIn && customerData ? (
                    <div className="login-pickup-address-info" onClick={navigateSetLocation}>
                        <span className='home-place-text1'>픽업매장</span>
                        <p className="home-place-text">
                            <span className="home-place-text2">이마트24</span>&nbsp;&nbsp;
                            {storeName ? (
                                storeName
                            ) : (
                                <span style={{ color: 'red' }}>단골매장을 선택해주세요!</span>
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="logout-pickup-address-info" onClick={() => navigate("/login")}>
                        <span className='home-place-text1'>픽업매장</span>
                        <p className="home-place-text">
                            <span className="home-place-text2">이마트24</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPlaceComponent;
