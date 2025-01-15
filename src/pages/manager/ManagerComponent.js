import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from '../../components/alert/AlertModal';
import './ManagerComponent.css';

const ManagerComponent = () => {
  const [brNum, setBrNum] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const storeId = localStorage.getItem("currentStoreId");
  const loginId = localStorage.getItem("loginId");

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


  const handleInputChange = (event) => {
    setBrNum(event.target.value);  // 입력 필드의 값을 상태로 설정
  }

  const checkBrNum = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/checkBrNum/${storeId}/${brNum}`);
      const resdata = await response.json();

      // 빈 배열 또는 유효하지 않은 데이터 처리
      if (response.ok && (Number.parseInt(brNum) === resdata.brNum)) {
        await updateToManager();
        openAlert('사업자번호가 등록되었습니다.', true);
      } else {
        openAlert("유효하지 않은 사업자 등록번호입니다.");
      }
    } catch (error) {
      console.error("Error fetching the data", error);
    }
  }

  const updateToManager = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/updateToManager`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brNum, loginId, userId: userId })
      });

      if (!response.ok) {
        openAlert('사업자등록 번호를 확인해주세요.');
      }

    } catch (error) {
      console.error("Error processing the request", error);
    }
  };


  return (
    <div className="manager-centered-container">
      <AlertModal
        isOpen={alertOpen}
        onRequestClose={closeAlert}
        message={alertMessage}
        navigateOnClose={navigateOnClose}
        navigateClosePath={"/mypage"}
      />
      <div className="manager-container">
        <div className="manager-business-form">
          <label>
            <p className="manager-head-text">
              사업자 등록번호
            </p>
            <input
              type="text"
              maxLength="10"
              className="manager-input-field"
              value={brNum}
              onChange={handleInputChange}
            />
          </label>
          <button
            className="manager-confirm-button"
            onClick={checkBrNum}>
            인증하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerComponent;
