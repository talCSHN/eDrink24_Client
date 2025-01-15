import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './OrderHistoryDetailsComponent.css';

import { drawRoute, getLoadDirection } from '../../service/directionService.js';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function OrderHistoryDetailsComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderDate } = location.state // OrderHistoryComponent에서 넘겨준 orderDate 가져오기
    const [orderHistoryDetails, setOrderHistoryDetails] = useState([]);
    const [currentStoreId, setCurrentStoreId] = useState(""); // 받은 데이터의 storeId
    const userId = localStorage.getItem('userId');
    const currentLocation = localStorage.getItem("currentLocation"); // 현재위치


    // Date 객체를 문자열로 포맷
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 주문 내역 상세정보 가져오기
    const fetchOrderHistoryDetails = async () => {

        try {
            const dateObject = new Date(orderDate);
            const formattedOrderDate = formatDate(dateObject);
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showOrderHistoryDetails/${userId}/${formattedOrderDate}`);
            if (response.status === 200) {
                const data = await response.json();
                setOrderHistoryDetails(data);
                setCurrentStoreId(data[0].storeId);
            } else {
                console.error('Failed to fetch basket item details. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching basket item details:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchOrderHistoryDetails();
    }, [userId, orderDate]);

    // 픽업 남은 시간 계산
    const countPickupTime = (pickupDate, orderDate) => {
        const pickup = new Date(pickupDate);
        const order = new Date(orderDate);
        const diffTime = pickup - order; // 초 차이
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 남은 일 수
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 남은 시간
        return `${diffDays}일 ${diffHours}시 남음`;
    };

    // 총 상품금액, 총 할인금액, 총 결제금액, 예상 적립금액 계산
    const totalAmount = orderHistoryDetails.reduce((total, item) => total + (item.price * item.orderQuantity), 0);
    let totalPaid = 0;
    if (orderHistoryDetails.length > 0) {
        totalPaid = orderHistoryDetails[0].orderAmount;
    }
    const totalDiscount = totalAmount - totalPaid;
    const points = totalPaid * 0.01;


    // 지도 경로찍어주기
    const geocoder = new window.kakao.maps.services.Geocoder();

    const [storeData, setStoreData] = useState();
    const [centerMap, setCenterMap] = useState({ latitude: null, longitude: null });
    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: ""
    });

    const mapRef = useRef(null);

    useEffect(() => {
        const fetchStore = async () => {
            if (isNaN(currentStoreId)) {
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findStore/${currentStoreId}`, {
                method: "GET"
            });
            if (response.ok) {
                const data = await response.json();
                setStoreData(data)
            } else {
                console.log("NOT FOUND");
            }
        }
        fetchStore();

        if (currentLocation) {
            fetchAddressToLL(currentLocation);
        } else {
            fetchCurrentLocation();
        }

    }, [currentStoreId, currentLocation]);

    useEffect(() => {
        if (storeData && locationData.latitude && locationData.longitude) {
            const center = calculateCenter(
                locationData.latitude,
                locationData.longitude,
                storeData.latitude,
                storeData.longitude
            );
            setCenterMap(center);

            const startPoint = {
                lat: locationData.latitude,
                lng: locationData.longitude
            };

            const endPoint = {
                lat: storeData.latitude,
                lng: storeData.longitude
            };

            getLoadDirection(startPoint, endPoint).then(data => {
                if (data) {
                    const map = mapRef.current;
                    drawRoute(map, data);
                } else {
                    console.log('Failed to load direction data');
                }
            });
        }
    }, [storeData, locationData]);

    const calculateCenter = (lat1, lng1, lat2, lng2) => {
        return {
            latitude: (parseFloat(lat1) + parseFloat(lat2)) / 2,
            longitude: (parseFloat(lng1) + parseFloat(lng2)) / 2
        };
    };

    const fetchAddressToLL = (address) => {
        geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setLocationData({
                    latitude: result[0].y,
                    longitude: result[0].x,
                    address: address
                });
            } else {
                console.error(status);
            }
        });
    };

    const fetchCurrentLocation = () => {
        setLocationData({ latitude: null, longitude: null, address: "" });
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    };

    const successHandler = (response) => {
        const { latitude, longitude } = response.coords;
        setLocationData({ latitude, longitude, address: locationData.address });
    };

    const errorHandler = (error) => {
        console.log(error);
    };

    return (
        <div className="orderDetails-wrapper">
            <div className="orderDetails-container">
                <div className='orderDetails-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>상세 정보</h1>
                    <button className="bag-button" onClick={() => { navigate('/basket') }}>
                        <img src={bag} alt="장바구니" />
                    </button>
                </div>

                <div className="orderDetails-section">

                    {orderHistoryDetails.length > 0 ? (
                        <div className="orderDetails-group">
                            <div className="orderDetails-main">
                                {orderHistoryDetails.map((item, index) => (
                                    <div key={index} className="orderDetails-info">
                                        <div className="orderDetails-pickUp">
                                            <div>
                                                <span className="orderDetails-pickUp-text1">
                                                    {item.pickupType === `TODAY` ? `오늘픽업` : `예약픽업`}
                                                </span>
                                                <span>/</span>
                                                <span className="orderDetails-pickUp-text2">
                                                    {item.isCompleted == 0 ? countPickupTime(item.pickupDate, item.orderDate) : '픽업완료'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="orderDetails-infoMain">
                                            <div className="orderDetails-infoImg">
                                                <img
                                                    src={item.defaultImage || 'default-image-url.jpg'}
                                                    alt={item.productName || '상품 이미지 없음'}
                                                    className="basket-image"
                                                    style={{ width: '100px', height: 'auto' }}
                                                />
                                            </div>
                                            <div className="orderDetails-info-main">
                                                <span>{item.productName || '상품 이름 없음'}</span>
                                                <a>선택수량 : {item.orderQuantity || 0}</a>
                                                <p>{item.price !== undefined ? item.price.toLocaleString() : '가격 정보 없음'} 원</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="line"></div>

                            {/* 지도 + 매장변경 */}
                            <div className="basket-content-last">
                                <span className="title1">
                                    <strong>픽업매장</strong>
                                </span>
                                <div className="basket-showStore-map">
                                    {storeData ? (
                                        <Map
                                            center={{ lat: centerMap.latitude, lng: centerMap.longitude }}
                                            style={{ width: '390px', height: '290px' }}
                                            level={5}
                                            ref={mapRef}
                                        >
                                            {locationData.latitude && locationData.longitude && (
                                                <MapMarker position={{ lat: locationData.latitude, lng: locationData.longitude }} />
                                            )}
                                            <MapMarker
                                                position={{ lat: storeData.latitude, lng: storeData.longitude }}
                                                image={{
                                                    src: "assets/store/marker_store.png",
                                                    size: { width: 24, height: 24 },
                                                }}
                                            />
                                        </Map>
                                    ) : (
                                        <div className="basket-nostore-message">
                                            단골매장을 설정해주세요!
                                        </div>
                                    )}
                                </div>

                                {/* 매장보여주기 */}
                                <div className="basket-set-location">
                                    {storeData && <span className='basket-storeName'><img src='assets/common/location_on.png' alt='location' /> {storeData.storeName}</span>}
                                </div>
                            </div>

                            <div className="line"></div>

                            <div className="orderDetails-summary">
                                <div className="orderDetails-summaryTitle">
                                    <h1>결제 정보</h1>
                                </div>

                                <div className="line2"></div>

                                <div className="subTitle-box">
                                    <div className="orderDetails-subTitle">
                                        <span><strong>결제수단</strong></span>
                                        <a><strong>{'카카오페이'}</strong></a>
                                    </div>
                                    <div className="orderDetails-subTitle">
                                        <span><strong>총 상품금액</strong></span>
                                        <a><strong>{totalAmount} 원</strong></a>
                                    </div>
                                    <div className="orderDetails-subTitle">
                                        <span><strong>총 할인금액</strong></span>
                                        <a><strong>{totalDiscount} 원</strong></a>
                                    </div>
                                </div>

                                <div className="line2"></div>

                                <div className="subTitle-box2">
                                    <div className="orderDetails-subTitle2">
                                        <span><strong>총 결제금액</strong></span>
                                        <a><strong>{totalPaid} 원</strong></a>
                                    </div>
                                    <div className="orderDetails-subTitle2">
                                        <span><strong>예상 적립금액</strong></span>
                                        <a><strong>{points} 원</strong></a>
                                    </div>
                                </div>
                            </div>
                        </div>
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

export default OrderHistoryDetailsComponent;