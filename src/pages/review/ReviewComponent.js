import React, { useState } from 'react';
import './ReviewComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
import AlertModal from '../../components/alert/AlertModal';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import { useNavigate } from 'react-router-dom';

const ReviewComponent = () => {
    // 각 평점 별 상태값
    const [sugarRating, setSugarRating] = useState(1);
    const [acidityRating, setAcidityRating] = useState(1);
    const [throatRating, setThroatRating] = useState(1);
    const [content, setContent] = useState('');

    const navigate = useNavigate();
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory"));

    const handleRatingChange = (setRating, value) => {
        setRating(value);
    };

    // 리뷰 작성 후 저장하기 버튼 누르면 DB에 저장
    const handleSubmit = async (e) => {
        e.preventDefault(); // 저장하기 버튼 누른 후 새로고침 방지

        const averageRating = parseFloat(((sugarRating + acidityRating + throatRating) / 3.0).toFixed(1));

        const reviewData = {
            ordersId: orderHistory.ordersId,
            productId: orderHistory.productId,
            rating: averageRating,
            sugarRating,
            acidityRating,
            throatRating,
            content
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/addReview`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            if (response.ok) {
                openAlert('리뷰가 성공적으로 저장되었습니다.', true);
            } else {
                openAlert('물건 픽업 후 다시 시도해주세요.');
            }
        } catch (error) {
            openAlert('저장에 실패하였습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigateOnClose, setNavigateOnClose] = useState(false);

    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    const closeAlert = () => {
        setAlertOpen(false);
    }

    return (
        <div className="review-container">

            <div className="review-header">
                <button className="back-button" onClick={() => { navigate(-1) }}>
                    <img src={back} alt="뒤로가기" />
                </button>
                <h1>내가 작성한 리뷰</h1>
                <button className="bag-button" onClick={() => { navigate('/basket') }}>
                    <img src={bag} alt="장바구니" />
                </button>
            </div>

            <div className="review-form">
                <div className="review-product-info">
                    <img src={orderHistory.defaultImage} alt={orderHistory.productName} className="review-product-image" />
                    <div className="review-product-name">{orderHistory.productName}</div>
                </div>
                <form onSubmit={handleSubmit} className="review-content-form">

                    <div className="review-rating-section">
                        <label>당도</label>
                        <div className="review-stars">
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className={index < sugarRating ? "star filled" : "star"}
                                    onClick={() => handleRatingChange(setSugarRating, index + 1)}>
                                    ★
                                </span>
                            ))}
                            <span className="review-score">{sugarRating}점</span>
                        </div>
                    </div>
                    <div className="review-rating-section">
                        <label>산도</label>
                        <div className="review-stars">
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className={index < acidityRating ? "star filled" : "star"}
                                    onClick={() => handleRatingChange(setAcidityRating, index + 1)}>
                                    ★
                                </span>
                            ))}
                            <span className="review-score">{acidityRating}점</span>
                        </div>
                    </div>
                    <div className="review-rating-section">
                        <label>목넘김</label>
                        <div className="review-stars">
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className={index < throatRating ? "star filled" : "star"}
                                    onClick={() => handleRatingChange(setThroatRating, index + 1)}>
                                    ★
                                </span>
                            ))}
                            <span className="review-score">{throatRating}점</span>
                        </div>
                    </div>
                    <div className="review-section">
                        <label>리뷰를 작성해주세요.</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="이 상품을 사용하면서 느낀 장점과 단점을 솔직하게 알려주세요."
                        />
                    </div>
                    <button type="submit" className="review-submit-button">저장하기</button>
                </form>
                <AlertModal
                    isOpen={alertOpen}
                    onRequestClose={closeAlert}
                    message={alertMessage}
                    navigateOnClose={navigateOnClose}
                    navigateClosePath={"/orderHistory"}
                />
            </div>
            <FooterComponent />
        </div>
    );
};

export default ReviewComponent;
