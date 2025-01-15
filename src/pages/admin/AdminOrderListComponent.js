import React, { useEffect, useState } from 'react';
import './AdminOrderListComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';


// 발주신청내역
const AdminOrderListComponent = () => {
    const [orderList, setOrderList] = useState([]);  // 발주 내역 상태

    useEffect(() => {
        fetchOrderList();
    }, []);

    // 발주 내역 조회 API 호출
    const fetchOrderList = async () => {
        const storeId = localStorage.getItem("myStoreId");
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAdminOrderList/${storeId}`, {
                method: "GET"
            });
            const resData = await response.json();
            setOrderList(resData);

        } catch (error) {
            console.error('Error fetching order list:', error);
        }
    };


    return (
        <div className="orderlist-container">
            <div className="orderlist-home-header">
                <p className="orderlist-text">발주 내역</p>
            </div>
            <div className="orderlist-body">
                {orderList.length === 0 ? (
                    <p>발주 내역이 없습니다.</p>
                ) : (
                    <table className="orderlist-table">
                        <thead>
                            <tr>
                                <th>상품명</th>
                                <th>수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderList.map(order => (
                                <tr key={order.adminOrderHistoryId}>
                                    <td>{order.productName}</td>
                                    <td>{order.adminOrderQuantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <FooterComponent />
        </div>
    );
};

export default AdminOrderListComponent;
