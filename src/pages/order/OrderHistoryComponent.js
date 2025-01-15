
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './OrderHistoryComponent.css';

function OrderHistoryComponent() {

    const [orderHistory, setOrderHistory] = useState([]);
    const userId = localStorage.getItem('userId'); // userId를 로컬스토리지에서 가져오기
    //const storeId = localStorage.getItem('currentStoreId');
    const navigate = useNavigate();

    // 주문 내역 가져오기
    const fetchOrderHistory = async () => {

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showOrderHistory/${userId}`, {
                method: "GET"
            });
            if (response.status === 200) {
                const data = await response.json();
                setOrderHistory(groupByOrderDate(data));
            } else {
                console.error('Failed to fetch basket items. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching basket items:', error);
            return [];
        }
    };

    // 주문 내역을 orderDate 기준으로 그룹화
    const groupByOrderDate = (orders) => {
        return orders.reduce((groupedOrders, order) => {
            const date = new Date(order.orderDate);
            if (!groupedOrders[date]) {
                groupedOrders[date] = [];
            }
            groupedOrders[date].push(order);
            return groupedOrders;
        }, {});
    };

    // 리뷰 작성하기 누르면 리뷰페이지로 이동 - giuk-kim2
    const moveToReviewPage = (date, idx) => {

        localStorage.setItem("orderHistory", JSON.stringify(orderHistory[date][idx])); // Object.keys(orderHistory) 제이슨의 키값을 가져오는 코드
        navigate(`/review`);
    };


    // 리뷰 확인하기 누르면 리뷰확인페이지로 이동 - giuk-kim2
    const moveToMyReviewPage = async (reviewsId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/checkMyReview/${userId}/${reviewsId}`, {
                method: "GET"
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("reviewData", JSON.stringify(data));

                navigate('/checkMyReview');
            }

        } catch (error) {
            console.error('에러가 발생했습니다.', error);
        }

    };

    const fetchData = async () => {
        await fetchOrderHistory();
    };

    useEffect(() => {
        fetchData();
    }, []);

    // clickOrderHistoryDetails 실행하면 orderDate값 넘겨줌
    const clickOrderHistoryDetails = async (date) => {
        navigate("/orderHistoryDetails", { state: { orderDate: date } });
    }

    return (
        <div className="orderHistory-wrapper">
            <div className="orderHistory-container">
                <div className='orderHistory-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>주문내역</h1>
                    <button className="bag-button" onClick={() => { navigate('/basket') }}>
                        <img src={bag} alt="장바구니" />
                    </button>
                </div>

                <div className="orderHistory-section">
                    {Object.keys(orderHistory).length > 0 ? (
                        Object.keys(orderHistory).map((date, index) => (
                            <div key={index} className="orderHistory-group">

                                <div className="orderHistory-top">
                                    <h3 className="orderHistory-date">
                                        {new Date(date).getFullYear() + ". " + (new Date(date).getMonth() + 1) + ". " + new Date(date).getDate()}
                                    </h3>
                                    <div className="orderHistory-moreButton">
                                        <button onClick={() => clickOrderHistoryDetails(date)}>상세보기</button>
                                    </div>
                                </div>

                                <div className="orderHistory-main">
                                    {orderHistory[date].map((item, index) => (
                                        <div key={index} className="orderHistory-info">

                                            <div className="orderHistory-pickUp">
                                                <div>{item.pickupType === `TODAY` ? `오늘 픽업` : `예약 픽업`}</div>
                                            </div>

                                            <div className="orderHistory-infoMain">
                                                <div className="orderHistory-infoImg">
                                                    <img
                                                        src={item.defaultImage || 'default-image-url.jpg'}
                                                        alt={item.productName || '상품 이미지 없음'}
                                                        className="basket-image"
                                                        style={{ width: '100px', height: 'auto' }}
                                                    />
                                                </div>
                                                <div className="orderHistory-info-main">
                                                    <span>{item.productName || '상품 이름 없음'}</span>
                                                    <a>선택수량 : {item.orderQuantity || 0}</a>
                                                    <p>{item.price !== undefined ? item.price.toLocaleString() : '가격 정보 없음'} 원</p>
                                                </div>
                                            </div>

                                            <div className="orderHistory-infoButton">
                                                {item.reviewsId ? (
                                                    <button className="orderHistory-button1" onClick={() => moveToMyReviewPage(item.reviewsId)}>리뷰 확인하기</button>
                                                ) : (
                                                    <button className="orderHistory-button2" onClick={() => moveToReviewPage(date, index)}>리뷰 작성하기</button>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                <div className="line"></div>

                            </div>
                        ))
                    ) : (
                        <p>주문 내역이 없습니다.</p>
                    )}
                </div>

                {/* 하단 네비게이션 바 */}
                <FooterComponent />

            </div>
        </div>
    );

}

export default OrderHistoryComponent;