// PointHistoryModalComponent.js
import React from 'react';
import './PointHistoryModalComponent.css'; // 모달 스타일

const PointHistoryModalComponent = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음

    return (
        <div className="point-modal-overlay">
            <div className="point-modal-content">
                <button className="point-modal-close-button" onClick={onClose}>닫기</button>
                <h2>포인트 내역</h2>
                <div className="point-modal-table-container">
                {data.length > 0 ? (
                    <table className="point-table">
                        <thead>
                            <tr>
                            <th className="point-wide-column">닉네임</th>
                            <th>제품사진</th>
                            <th className="point-wide-column">제품명</th>
                                <th>포인트적립 날짜</th>
                                <th>가격</th>
                                <th>포인트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td className="point-wide-column">{item.userName}</td>
                                    <td><img src={item.defaultImage} alt={item.productName} /></td>
                                    <td className="point-wide-column">{item.productName}</td>
                                    <td>{item.saveDate.replace('T',' ')}</td>
                                    <td>{Number(item.price).toLocaleString()}</td>
                                    <td>{Number(item.point).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>포인트 내역이 없습니다.</p>
                )}
            </div>
            </div>
        </div>
    );
};

export default PointHistoryModalComponent;
