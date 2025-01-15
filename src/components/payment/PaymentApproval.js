import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AlertModal from '../../components/alert/AlertModal';

function PaymentApproval() {
    const location = useLocation();

    const query = new URLSearchParams(location.search);

    const pgToken = query.get('pg_token');
    const tid = localStorage.getItem('tid');
    const userId = localStorage.getItem('userId');

    const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
    const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지
    const [navigateOnClose, setNavigateOnClose] = useState(false); // 모달 닫힐 때 navigate

    // 알림창 열기
    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    useEffect(() => {
        const approvePayment = async () => {
            if (pgToken && tid) {

                try {
                    const orderTransactionDTO = JSON.parse(localStorage.getItem('orderTransactionDTO'));

                    // 1. 결제 승인
                    const approvalResponse = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/api/kakaoPay/approve`, {
                        params: {
                            pg_token: pgToken,
                            tid: tid,
                            userId: userId
                        }
                    });


                    // 2. 주문 저장 및 장바구니 삭제
                    const orderResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAllBasket/userId/${userId}/buyProductAndSaveHistory`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderTransactionDTO),
                    });

                    // 2024.10.1 - 동시성 발생 시, 주문취소
                    if (!orderResponse.ok) {
                        deleteLocalStorage();
                        if (orderResponse.status == 400) {
                            openAlert("재고가 부족하여 주문을 완료할 수 없습니다. 장바구니를 확인 후 다시 시도해주세요.", true)
                        } else {
                            openAlert("주문 처리 중 오류가 발생했습니다.", true);
                        }
                        return;
                    }

                    const deleteResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAllBasket/userId/${userId}/deleteBasketAndItem`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderTransactionDTO),
                    });

                    // 결제완료 시, 로컬스토리지에 드간 정보들 삭제
                    deleteLocalStorage();
                    openAlert("결제가 완료되었습니다!", true);
                } catch (error) {
                    deleteLocalStorage();
                    openAlert(error.message, true);
                }
            } else {
                deleteLocalStorage();
                openAlert("결제 정보가 올바르지 않습니다.", true);
            }
        };

        approvePayment();

    }, []);

    const deleteLocalStorage = () => {
        localStorage.removeItem("selectedBaskets");
        localStorage.removeItem("orderTransactionDTO");
        localStorage.removeItem("tid");
    }

    return (
        <>
            <div>
                <h1>결제가 진행 중입니다. 잠시만 기다려 주세요...</h1>
            </div>
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
                navigateOnClose={navigateOnClose}
                navigateClosePath={"/"}
            />
        </>
    );
}

export default PaymentApproval;
