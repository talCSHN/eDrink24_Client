import React, { useState } from 'react';
import './AdminComponent.css';
import AdminOrderComponent from './AdminOrderComponent';
import AdminOrderListComponent from './AdminOrderListComponent';
import ShowReservationPickupComponent from './ShowReservationPickupComponent';
import ShowOrdersPageComponent from './ShowTodayPickupPageComponent';
import PickupCompletedPageComponent from './TodayPickupCompletedPageComponent';
import { useLocation, useNavigate } from 'react-router-dom';

import home from "../../assets/admin/home.png"

const AdminComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { myStoreId } = location.state || {};
    const [activeTab, setActiveTab] = useState('즉시픽업 목록');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const renderingComponent = () => {
        switch (activeTab) {
            case '즉시픽업 주문내역':
                return <ShowOrdersPageComponent />;
            case '픽업 완료내역':
                return <PickupCompletedPageComponent />;
            case '발주신청':
                return <AdminOrderComponent />;
            case '예약픽업 발주신청':
                return <ShowReservationPickupComponent />;
            case '발주신청내역':
                return <AdminOrderListComponent />;
            default:
                return <ShowOrdersPageComponent />;
        }
    };

    return (
        <div className="admin-form-container">
            <div className="admin-tabs">
                <button className="admin-back-button" onClick={() => { navigate("/") }} >
                    <img src={home} alt="Back" className="admin-back-img" />
                </button>
                <span onClick={() => handleTabClick('즉시픽업 주문내역')}>즉시픽업 주문내역</span>
                <span onClick={() => handleTabClick('예약픽업 발주신청')}>예약픽업 발주신청</span>
                <span onClick={() => handleTabClick('발주신청')}>발주신청</span>
                <span onClick={() => handleTabClick('픽업 완료내역')}>픽업 완료내역</span>
                <span onClick={() => handleTabClick('발주신청내역')}>발주신청내역</span>
            </div>
            <div className="content">
                {renderingComponent()}
            </div>
        </div>
    );
};

export default AdminComponent;
