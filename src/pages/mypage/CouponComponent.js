import React, { useState, useEffect } from 'react';
import './CouponComponent.css';

const CouponComponent = ({ onClose }) => {
    const [coupons, setCoupons] = useState([]);

    // 쿠폰 목록 조회
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAllCoupon/userId/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCoupons(data);
                } else {
                    console.error('Error fetching coupons');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchCoupons(); // fetchCoupons 함수 호출
        console.log("COUPONS", coupons);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>쿠폰 목록</h2>
                <ul>
                    {coupons.length > 0 ? (
                        coupons.map(coupon => (
                            coupon.used !== true ? ( // 쿠폰이 사용되지 않은 경우만 렌더링
                                <li key={coupon.couponId}>
                                    신규회원 {coupon.discountAmount.toLocaleString()} 원 할인 쿠폰
                                </li>
                            ) : "보유한 쿠폰이 없습니다."
                        ))
                    ) : (
                        <li>보유한 쿠폰이 없습니다.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CouponComponent;
