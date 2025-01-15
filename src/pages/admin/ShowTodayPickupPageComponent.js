import React, { useState, useEffect } from 'react';
import './ShowTodayPickupPageComponent.css'; // CSS 파일을 임포트합니다.
import { format, parseISO } from 'date-fns';
import AlertModal from '../../components/alert/AlertModal';

// 즉시픽업
const ShowTodayPickupPageComponent = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrdersId, setSelectedOrdersId] = useState([]);
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

    // 컴포넌트가 처음 렌더링될 때만 주문 목록을 가져옵니다.
    useEffect(() => {
        showOrdersToAdminPageOrders();
    }, [orders]);

    // 전체 선택/해제 기능
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            if (orders.length > 0) {
                const allOrderIds = orders.map(order => order.ordersId);
                setSelectedOrdersId(allOrderIds);
            }
        } else {
            setSelectedOrdersId([]);
        }
    };

    // 개별 항목 선택/해제
    const toggleSelectOrder = (ordersId) => {
        if (selectedOrdersId.includes(ordersId)) {
            setSelectedOrdersId(selectedOrdersId.filter(id => id !== ordersId));
        } else {
            setSelectedOrdersId([...selectedOrdersId, ordersId]);
        }
    };

    // 즉시픽업 목록페이지 (아직 픽업이 완료되지 않았을 때)
    const showOrdersToAdminPageOrders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showPickupPage/${storeId}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const resData = await response.json();

            // 데이터가 변경된 경우에만 상태를 업데이트합니다.
            if (JSON.stringify(resData) !== JSON.stringify(orders)) {
                setOrders(resData);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
        }

    };

    // 픽업완료 버튼 클릭 시 상태변화 업데이트
    const handlePickupComplete = async () => {
        try {
            for (const ordersId of selectedOrdersId) {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/updateStateAfterCompletedPickup/${ordersId}`, {
                    method: "PUT"
                });

                showOrdersToAdminPageOrders();
                setSelectedOrdersId([]);  // 선택된 항목 초기화
                openAlert("픽업완료 처리되었습니다!");
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    return (
        <div className="admin-container">
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
            />
            <h1 className="admin-title">즉시픽업 목록</h1>
            <div className="order-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={orders.length > 0 && selectedOrdersId.length === orders.length}
                                    onChange={toggleSelectAll}
                                    value="0"
                                />
                            </th>
                            <th>주문번호</th>
                            <th>고객명</th>
                            <th>제품명</th>
                            <th>주문시간</th>
                            <th>주문상태</th>
                            <th>수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.ordersId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="order-checkbox"
                                        checked={selectedOrdersId.includes(order.ordersId)}
                                        onChange={() => toggleSelectOrder(order.ordersId)}
                                    />
                                </td>
                                <td>{order.ordersId}</td>
                                <td>{order.userName}</td>
                                <td>{order.productName}</td>
                                <td>{format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</td>
                                <td>{order.changeStatus ? "픽업주문" : order.changeStatus}</td>
                                <td>{order.orderQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="pickup-button" onClick={handlePickupComplete}>
                    픽업완료
                </button>
            </div>
        </div>

    );
};

export default ShowTodayPickupPageComponent;
