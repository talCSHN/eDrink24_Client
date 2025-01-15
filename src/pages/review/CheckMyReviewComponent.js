import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import FooterComponent from '../../components/footer/FooterComponent.js';
import AlertModal from '../../components/alert/AlertModal';
import './CheckMyReviewComponent.css';

const CheckMyReviewComponent = () => {
    const [review, setReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedReview, setEditedReview] = useState({});
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigateOnClose, setNavigateOnClose] = useState(false);

    const savedReview = localStorage.getItem("reviewData");
    const navigate = useNavigate();

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
        if (savedReview) {
            setReview(JSON.parse(savedReview));
        }
    }, []);

    const handleUpdateReview = (e) => {
        const { name, value } = e.target; // name은 json형태에서 키값, value는 value값을 가져옴.
        setEditedReview(prevState => ({ // prevState는 현재의 상태 값
            ...prevState, // 현재 상태를 복사하고, 일부만 수정 가능하게 함.
            [name]: value // name 키값, value는 값
        }));
    };

    // 리뷰 내용 업데이트
    const updateReview = async () => {
        try {

            //Rating 계산
            const rating = (
                (parseFloat(editedReview.sugarRating || 0)) +
                (parseFloat(editedReview.acidityRating || 0)) +
                (parseFloat(editedReview.throatRating || 0))
            ) / 3.0;

            const updatedReview = {
                ...editedReview,
                reviewsId: JSON.parse(savedReview)[0].reviewsId,
                rating: rating.toFixed(1) // 소수점 첫째 자리까지
            };

            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/fixReviewContent`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedReview)
            });

            openAlert("리뷰가 수정되었습니다!", true);

            // 수정 모드 종료
            setIsEditing(false);

        } catch (error) {
            console.error("Error fetching updateReviews:", error);
        }
    };

    const startEditing = () => {
        setEditedReview(review[0]); // 현재 리뷰 데이터를 editedReview에 복사하여 초기화
        setIsEditing(true);
    };

    if (!review) {
        return <div>Loading...</div>;
    }

    const reviewItem = review[0];
    const enrolledDate = reviewItem.enrolledDate ? reviewItem.enrolledDate.split('T')[0] : '등록되지 않음';
    const modifiedDate = reviewItem.modifiedDate ? reviewItem.modifiedDate.split('T')[0] : '수정되지 않음';

    return (
        <div className="MyReview-wrapper">
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
                navigateOnClose={navigateOnClose}
                navigateClosePath={"/orderHistory"}
            />
            <div className="MyReview-container">

                <div className='MyReview-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>내가 작성한 리뷰</h1>
                    <button className="bag-button" onClick={() => { navigate('/basket') }}>
                        <img src={bag} alt="장바구니" />
                    </button>
                </div>

                <div className="MyReview-date">
                    <div>작성일자 : {enrolledDate}</div>
                    <div>마지막 수정일 : {modifiedDate}</div>
                </div>

                {isEditing ? (
                    <div className="MyReview-content">
                        <h4><strong>{editedReview.productName}</strong></h4>
                        <div className="MyReview-info-content">
                            <img src={editedReview.defaultImage} alt={editedReview.productName} className="MyReview-product-image" />
                            <div className="MyReview-info">
                                <span>
                                    <textarea name="content" value={editedReview.content} onChange={handleUpdateReview} />
                                </span>
                                <div className="re">
                                    <p>
                                        <strong>당도 : </strong>
                                        <input type="number" name="sugarRating" value={editedReview.sugarRating} onChange={handleUpdateReview} min="0" max="5" />
                                    </p>
                                    <p>
                                        <strong>산미 : </strong>
                                        <input type="number" name="acidityRating" value={editedReview.acidityRating} onChange={handleUpdateReview} min="0" max="5" />
                                    </p>
                                    <p>
                                        <strong>목넘김 : </strong>
                                        <input type="number" name="throatRating" value={editedReview.throatRating} onChange={handleUpdateReview} min="0" max="5" />
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="re-button">
                            <button onClick={updateReview}>저장하기</button>
                            <button onClick={() => setIsEditing(false)}>취소</button>
                        </div>
                    </div>
                ) : (
                    <div className="MyReview-content">
                        <h4><strong>{reviewItem.productName}</strong></h4>
                        <div className="MyReview-info-content">
                            <img src={reviewItem.defaultImage} alt={reviewItem.productName} className="MyReview-product-image" />
                            <div className="MyReview-info">
                                <span>"{reviewItem.content}"</span>
                                <p><strong>단맛 : </strong> {reviewItem.sugarRating}/5</p>
                                <p><strong>산미 : </strong> {reviewItem.acidityRating}/5</p>
                                <p><strong>목넘김 : </strong> {reviewItem.throatRating}/5</p>
                            </div>
                        </div>
                        <button onClick={startEditing}>수정하기</button>
                    </div>
                )}

                {/* 하단 네비게이션 바 */}
                <FooterComponent />

            </div>
        </div>
    );
};

export default CheckMyReviewComponent;

