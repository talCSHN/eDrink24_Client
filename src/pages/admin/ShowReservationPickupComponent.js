import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import './ShowReservationPickupComponent.css';
import AlertModal from '../../components/alert/AlertModal';

const ShowReservationPickupComponent = () => {
    const [orders, setOrders] = useState([]);
    const [showQuantityModal, setShowQuantityModal] = useState(false); // 모달 표시 상태
    const [selectedOrderId, setSelectedOrderId] = useState(null); // 선택된 주문 ID
    const [quantity, setQuantity] = useState(0); // 발주 수량 상태

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const storeId = localStorage.getItem("myStoreId");

    // 알림창 열기
    const openAlert = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    // 처음 렌더링될 때만 주문 목록 가져오기
    useEffect(() => {
        showReservationPickupPage();
    }, []);

    const showReservationPickupPage = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showReservationPickupPage/${storeId}`, {
                method: "GET"
            });

            const resData = await response.json();

            // 데이터가 변경된 경우 상태 업데이트
            if (JSON.stringify(resData) !== JSON.stringify(orders)) {
                setOrders(resData);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };


    // 발주하기 버튼 클릭 시 호출되는 함수
    const handleOrderClick = (ordersId) => {
        setSelectedOrderId(ordersId);
        setShowQuantityModal(true); // 수량 입력 모달 표시
    };

    // 발주 수량 입력 핸들러
    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value)); // 입력된 수량으로 상태 업데이트
    };

    // 발주 처리 함수
    const handleAdminOrder = async () => {
        if (selectedOrderId && quantity > 0) {
            const order = orders.find(o => o.ordersId === selectedOrderId);


            // 발주 DTO 설정
            const InventoryDTO = {
                storeId: storeId,
                productId: order.productId,
                productName: order.productName,
                quantity,
                adminOrderQuantity: quantity
            };

            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/updateOrInsertInventory/${storeId}/${order.productId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(InventoryDTO)
                });

                // 주문 목록 새로고침
                showReservationPickupPage();
                setShowQuantityModal(false); // 모달 닫기
                setQuantity(0); // 수량 상태 초기화

                openAlert("발주 신청완료");

            } catch (error) {
                console.error('Error placing order:', error);
            }
        }
    };


    return (
        <div className="adminReservation-container">
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
            />
            <h1 className="adminReservation-title">예약픽업 발주신청</h1>
            <div className="order-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>주문번호</th>
                            <th>고객명</th>
                            <th>제품명</th>
                            <th>주문날짜</th>
                            <th>상태</th>
                            <th>수량</th>
                            <th>신청</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.ordersId}>
                                <td>{order.ordersId}</td>
                                <td>{order.userName}</td>
                                <td>{order.productName}</td>
                                <td>{format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</td>
                                <td>{order.changeStatus ? "예약주문" : order.changeStatus}</td>
                                <td>{order.orderQuantity}</td>
                                <td>
                                    <button onClick={() => handleOrderClick(order.ordersId)}>발주</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 수량 입력 모달 */}
            {showQuantityModal && (
                <div className="quantity-modal">
                    <h3>발주할 수량을 입력하세요</h3>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                    />
                    <button className="srp-quantity-modal-btn" onClick={handleAdminOrder}>발주</button>
                    <button className="srp-quantity-modal-btn" onClick={() => setShowQuantityModal(false)}>취소</button>
                </div>
            )}
        </div>

    );
};

export default ShowReservationPickupComponent;
