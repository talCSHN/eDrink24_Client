import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './HistoryComponent.css';

function HistoryComponent() {
    const navigate = useNavigate();

    // 로그인 상태와 고객 데이터를 관리하는 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]); // 주문 내역을 저장하는 상태
    const [productDetailsMap, setProductDetailsMap] = useState(new Map()); // 제품 세부 정보를 저장하는 상태

    // 컴포넌트가 처음 렌더링될 때 실행되는 useEffect
    useEffect(() => {
        const token = localStorage.getItem("jwtAuthToken");
        const userId = localStorage.getItem("userId"); // userId를 localStorage에서 가져옴

        if (token && userId) {
            setIsLoggedIn(true);
            fetchCustomerData(token, userId);
            fetchOrderHistory(userId); // 주문 내역 불러오기
        }
    }, []);

    // 고객 데이터를 서버에서 가져오는 함수
    const fetchCustomerData = async (token, userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/selectCustomerMyPage/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 필요한 경우 Authorization 헤더 추가
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomerData(data);
            } else {
                console.error('Failed to fetch customer data');
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    };

    // 주문 내역을 서버에서 가져오는 함수
    const fetchOrderHistory = async (userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/getOrderHistory/${userId}`, { // userId 사용
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrderHistory(data);
                fetchProductDetails(data);
            } else {
                console.error('Failed to fetch order history');
            }
        } catch (error) {
            console.error('Error fetching order history:', error);
        }
    };

    // 각 주문 항목에 대한 제품 세부 정보를 가져오는 함수
    const fetchProductDetails = async (orders) => {
        try {
            const detailsMap = new Map();
            for (const order of orders) {
                for (const item of order.items) {
                    if (!detailsMap.has(item.productId)) {
                        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/getProductDetails/${item.productId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        if (response.ok) {
                            const productDetails = await response.json();
                            detailsMap.set(item.productId, productDetails);
                        } else {
                            console.error(`Failed to fetch details for productId: ${item.productId}`);
                        }
                    }
                }
            }
            setProductDetailsMap(detailsMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    // 고객 정보 수정 페이지로 이동하는 함수
    const navigateUpdateCustomer = () => {
        navigate("/mypage/updateCustomer", { state: { customerData } });
    };

    return (
        // 전체 컨테이너
        <div className="history-container">

            {/* 상단 네비게이션 바 */}
            <div className="history-nav-bar">

                {/* 뒤로가기 아이콘 */}
                <button className="history-back" onClick={() => { navigate(-1) }}>
                    <img className="back-icon" src="assets/common/backicon.png" alt="back" />
                </button>

                {/* 메인 타이틀 */}
                <h3>주문/픽업조회{'('}
                    {isLoggedIn && customerData && (
                        <span className="additionalInfo">
                            {customerData.totalPoint}
                        </span>
                    )}{')'}</h3>

                {/* 장바구니 아이콘 */}
                <button className="history-bag" onClick={() => { navigate('/basket') }}>
                    <img className="history-cicon" src="assets/common/bag.png" alt="bag" />
                </button>

            </div>

            <div className="history-container">
                {/* 주문 내역 표시 */}
                {orderHistory.length > 0 ? (
                    orderHistory.map((order, index) => (
                        <div key={index}>

                            {/* 구매일자 표시 */}
                            <div className="history-container-top">
                                <span><strong>구매일자:</strong> {order.orderDate}</span>
                                <a href="#" className="more-button">상세보기&gt;</a>
                                {/* 1. 수정 필요: '상세보기' 버튼의 href 속성에 올바른 링크 추가 */}
                            </div>

                            {/* 구매한 상품정보 표시 */}
                            {order.items.map((item, itemIndex) => {
                                const productDetails = productDetailsMap.get(item.productId);
                                return (
                                    <div className="history-item-container" key={itemIndex}>
                                        <div className="history-item-img">
                                            <img className="Image20" src={productDetails?.defaultImage || 'assets/common/Image20.png'} alt="상품이미지" />
                                            {/* 2. 수정 필요: 실제 이미지 경로가 유효한지 확인 */}
                                        </div>
                                        <div className="history-item-content">
                                            <div className="history-item-name"><strong>상품명:</strong> {productDetails?.productName || '상품명 없음'}</div>
                                            <div className="history-item-quantity"><strong>수량:</strong> {item.orderQuantity}개</div>
                                            <div className="history-item-total-amount"><strong>총 금액:</strong> {productDetails?.price?.toLocaleString() || '가격 정보 없음'} 원</div>
                                            {/* 3. 수정 필요: 가격 형식 및 계산이 정확한지 확인 */}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* 리뷰작성 버튼 */}
                            <div className="history-review-button">
                                <button>리뷰작성</button>
                                {/* 4. 수정 필요: '리뷰작성' 버튼에 올바른 링크 추가 */}
                            </div>

                        </div>
                    ))
                ) : (
                    <p className="history-no-orders">주문내역이 없습니다.</p>
                )}
            </div>

            {/* 하단 네비게이션 바 */}
            <FooterComponent />

        </div>
    );
}

export default HistoryComponent;
