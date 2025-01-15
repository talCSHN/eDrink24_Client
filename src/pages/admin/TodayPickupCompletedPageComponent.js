import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import './TodayPickupCompletedPageComponent.css';

const TodayPickupCompletedPageComponent = () => {
    const [completedOrders, setCompletedOrders] = useState([]);
    const storeId = localStorage.getItem("myStoreId");
    useEffect(() => {
        PickupCompletedPage();
    }, []);

    // 즉시픽업 완료된 것만 보여줌.
    const PickupCompletedPage = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showPickupCompletedPage/${storeId}`, {
                method: "GET"
            });

            const resData = await response.json();
            setCompletedOrders(resData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">픽업 완료내역</h1>
            <div className="order-list">
                {completedOrders.length === 0 ? (
                    <p>완료된 픽업 내역이 없습니다.</p>
                ) : (
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>주문번호</th>
                                <th>고객명</th>
                                <th>제품이름</th>
                                <th>픽업시간</th>
                                <th>픽업상태</th>
                                <th>수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedOrders.map(order => (
                                <tr key={order.ordersId}>
                                    <td>{order.ordersId}</td>
                                    <td>{order.userName}</td>
                                    <td>{order.productName}</td>
                                    <td>{format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}<br />{format(parseISO(order.changeDate), 'yyyy-MM-dd HH:mm:ss')}</td>
                                    <td>{order.changeStatus === "PICKUPED" ? "픽업완료" : order.changeStatus}</td>
                                    <td>{order.orderQuantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TodayPickupCompletedPageComponent;
