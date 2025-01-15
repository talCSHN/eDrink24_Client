import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton.js';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './DibsComponent.css';

function DibsComponent() {

    const [dibs, setDibs] = useState([]);
    const userId = localStorage.getItem('userId');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const navigate = useNavigate();

    // 찜 목록 가져오기
    const fetchDibs = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAllDibs/${userId}`);
            if (response.status === 200) {
                const data = await response.json();
                setDibs(data);
            } else {
                console.error('Failed to fetch dibs items. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching dibs items:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchDibs();
    }, [userId]);

    // 찜 목록을 업데이트하는 함수
    const updateDibs = async (productId, liked) => {
        try {
            if (liked) {
                // 찜 추가
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/addDibs/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                });
                if (response.ok) {
                    setDibs(prevDibs => [...prevDibs, { productId }]);
                }
            } else {
                // 찜 삭제
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/cancelDIb/${userId}/${productId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setDibs(prevDibs => prevDibs.filter(dib => dib.productId !== productId));
                }
            }
        } catch (error) {
            console.error(`Error ${liked ? 'adding to' : 'removing from'} dibs:`, error);
        }
    };

    // 찜 목록 삭제 기능 추가
    const deleteDibs = async (productId, event) => {
        event.stopPropagation(); // 버튼 클릭 시 상세 페이지로 이동 방지
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/cancelDIb/${userId}/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setDibs(dibs.filter(item => item.productId !== productId));
            } else {
                console.error('Failed to delete from dibs');
            }
        } catch (error) {
            console.error('Error deleting from dibs:', error);
        }
    };

    // 장바구니에 제품 추가
    const saveInBasket = async (productId) => {
        const productToSave = dibs.find(prod => prod.productId === productId);

        if (!productToSave) {
            console.error('No product found');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/saveProductToBasket`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    items: [{
                        productId: productToSave.productId,
                        defaultImage: productToSave.defaultImage,
                        productName: productToSave.productName,
                        price: productToSave.price,
                        basketQuantity: 1
                    }]
                })
            });

            if (response.ok) {
                setModalIsOpen(true);
            } else {
                throw new Error('Failed to save product to basket');
            }
        } catch (error) {
            console.error('Error saving product to basket:', error);
        }
    };

    // 장바구니 페이지로 이동
    const goToBasketPage = () => {
        setModalIsOpen(false);
        navigate('/basket');
    };

    return (
        <div className="dibs-wrapper">
            <div className="dibs-container">

                <div className='dibs-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>관심 상품</h1>
                    <div>
                        <button className="bag-button" onClick={() => { navigate('/basket') }}>
                            <img src={bag} alt="장바구니" />
                        </button>
                    </div>
                </div>

                <div className="dibs-section">
                    {dibs.length > 0 ? (
                        dibs.map((item) => (
                            <div key={item.productId} className="dibs-item">
                                {/* ProductCardComponent 대신 수동으로 제품 정보 렌더링 */}
                                <div className="dibs-info-container" onClick={() => navigate(`/allproduct/${item.category1}/${item.category2}/${item.productId}`)}>
                                    <div className="dibs-info-img">
                                        <img
                                            src={item.defaultImage}
                                            alt={item.productName}
                                            className="product-image"
                                            style={{ width: '100px', height: 'auto' }}
                                        />
                                    </div>
                                    <span>{item.productName}</span>
                                    <span>{item.price.toLocaleString()} 원</span>
                                </div>
                                <div className="dibs-actions">
                                    <button
                                        onClick={(e) => deleteDibs(item.productId, e)}
                                        className="delete-button">
                                        삭제하기
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            saveInBasket(item.productId);
                                        }}
                                        className="basket-button">
                                        장바구니 담기
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>찜 목록이 비어있습니다.</p>
                    )}
                </div>

                <AlertModalOfClickBasketButton
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
                    navigateOnYes={goToBasketPage}
                    navigateOnNo={() => setModalIsOpen(false)}
                />

                <FooterComponent />
            </div>
        </div>
    );
}

export default DibsComponent;
