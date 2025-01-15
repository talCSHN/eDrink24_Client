import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentCancelOrFail() {
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem("selectedBaskets");
    localStorage.removeItem("orderTransactionDTO");
    localStorage.removeItem("tid");

    navigate("/");
  }, [navigate]);

  return (
    <></>
  );
}

export default PaymentCancelOrFail;