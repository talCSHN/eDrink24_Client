import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import eDrinkLogo from '../../assets/common/eDrinkLogo.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import filledHeart from '../../assets/common/fill-heart.png';
import star from '../../assets/common/star.png';

import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './CategoriesProductComponent.css';

const subcategories = {
    '와인': ['레드와인', '화이트와인', '스파클링와인', '로제와인'],
    '양주': ['양주'],
    '전통주': ['약주', '과실주', '탁주', '리큐르', '전통소주', '전통주세트', '기타전통주'],
    '논알콜': ['무알콜맥주|칵테일'],
    '안주': ['안주'],
};

// 좋아요 버튼 컴포넌트
const LikeButton = ({ onClick, productId, liked }) => {
    const [isLiked, setIsLiked] = useState(liked); // 좋아요 상태 관리

    const handleClick = (event) => {
        event.stopPropagation();
        const likeState = !isLiked;
        setIsLiked(likeState); // 클릭할 때마다 상태를 토글
        onClick(productId, likeState);
    };

    useEffect(() => {
        setIsLiked(liked); // liked prop이 변경될 때 상태 업데이트
    }, [liked]);

    return (
        <button className="allproduct-like-button" onClick={handleClick}>
            <img
                className="allproduct-like-icon"
                src={isLiked ? filledHeart : emptyHeart}
                alt="Like Icon"
            />
        </button>
    );
};

// 리뷰 버튼 컴포넌트
const ReviewButton = ({ onClick, rating }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        onClick();
    };

    return (
        <button className="allproduct-review-button" onClick={handleClick}>
            <img className="allproduct-review-icon" src={star} alt=" " />
            <span className="allproduct-review-rating">{rating ? rating : 0}</span>
        </button>
    );
};

// 장바구니 버튼 컴포넌트
const CartButton = ({ onClick, productId }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        onClick(productId);
    };

    return (
        <button onClick={handleClick} className="allproduct-bag-button">
            <img className="allproduct-bag-icon" src={bag} alt=" " />
        </button>
    );
};

const CategoriesProductComponent = () => {
    const { category1, category2 } = useParams();
    const [products, setProducts] = useState([]);
    const [category2List, setCategory2List] = useState([]);
    const [category, setCategory] = useState(''); // 선택된 하위 카테고리 상태
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
    const userId = localStorage.getItem('userId');
    const [quantity] = useState(1); // 장바구니에 추가할 수량

    useEffect(() => {
        if (subcategories[category1]) {
            setCategory2List(subcategories[category1]);

            if (category2) {
                setCategory(category2);
                selectCategory2(category2);
            } else {
                const defaultCategory2 = subcategories[category1][0];
                setCategory(defaultCategory2);
                selectCategory2(defaultCategory2);
            }
        }
    }, [category1, category2]);


    //카테고리2별로 제품 보여주기
    async function selectCategory2(category2) {
        setCategory(category2); // 선택된 카테고리2 상태 업데이트
        const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory2/${category2}`, {
            method: "GET"
        });

        if (response.ok) {
            const resData = await response.json();
            setProducts(resData);
            navigate(`/allproduct/${category1}/${category2}`);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    //사이드바 선택한거에 따라서 제품 보여주기
    const handleSortEvent = (e) => {
        const sortOption = e.target.value;
        let sortedProduct = [...products];

        if (sortOption === '낮은가격순') {
            sortedProduct.sort((a, b) => a.price - b.price);
        }
        else if (sortOption === '높은가격순') {
            sortedProduct.sort((a, b) => b.price - a.price);
        }
        else if (sortOption === '신상품순') {
            sortedProduct.sort((a, b) => new Date(b.enrollDate) - new Date(a.enrollDate));
        }
        setProducts(sortedProduct);
    };

    //제품사진 클릭했을 때 제품상세보기
    const handleProductClickEvent = (productId) => {
        navigate(`/allproduct/${category1}/${category2}/${productId}`);
    };

    // 오늘픽업 필터링 - Young5097
    const currentStoreId = localStorage.getItem("currentStoreId");
    const [invToStore, setInvToStore] = useState([]);
    const [showTodayPu, setShowTodayPu] = useState(false);

    useEffect(() => {
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {

                try {
                    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findInventoryByStoreId/${parseInt(currentStoreId)}`,
                        { method: 'GET' }
                    );
                    if (response.ok) {
                        const invData = await response.json();
                        setInvToStore(invData);
                    } else {
                        console.error(`Error: ${response.status} - ${response.statusText}`)
                    }

                } catch (error) {
                    console.error(error);
                } // try-catch

            } else {
                console.error('Not found in localStorage');
            } // if-else
        }
        fetchInvByStoreId();
    }, [currentStoreId]);

    // "오늘픽업" 필터 적용- Young5097
    const filterTodayPu = showTodayPu ? products.filter(product =>
        invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0))
        : products;

    // 장바구니에 제품을 저장하는 함수
    const saveInBasket = async (productId) => {
        const productToSave = products.find(prod => prod.productId === productId);
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
                        basketQuantity: quantity
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

    // 현재 페이지에 머무름
    const stayOnPage = () => {
        setModalIsOpen(false);
    };

    // 찜목록 저장
    const addDibs = async (productId, liked) => {
        const dibProducts = products.find(prod => prod.productId === productId);
        if (!dibProducts) {
            console.error('No dibProducts found');
            return;
        }

        const url = liked
            ? `${process.env.REACT_APP_SERVER_API_URL}/addDibs/${userId}` // liked가 true면 찜 추가
            : `${process.env.REACT_APP_SERVER_API_URL}/cancelDIb/${userId}/${productId}`; // liked가 false면 찜 삭제

        try {
            const response = await fetch(url, {
                method: liked ? "POST" : "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    productId: dibProducts.productId
                })
            });
        } catch (error) {
            console.error(`Error ${liked ? 'adding' : 'removing'} product to dibs:`, error);
        }
    };

    // 뒤로 가기 버튼 핸들러
    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="categories-wrapper">
            <div className="categories-container">
                <div className='categories-header'>
                    <button className="back-button" onClick={handleGoBack}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <img className="logoImg" src={eDrinkLogo} alt=" " />
                    <button className="bag-button" onClick={() => { navigate('/basket') }}>
                        <img src={bag} alt="장바구니" />
                    </button>
                </div>

                <div className="allproduct-sub-nav">
                    <div className="cc">
                        {/* 카테고리 바 => 선택한 category1에 따라 동적 변경 */}
                        <div className="allproduct-filter-bar">
                            {category2List.map((category2, index) => (
                                <button key={index}
                                    onClick={() => selectCategory2(category2)}
                                    className={`allproduct-filter-button ${category === category2 ? 'selected' : ''}`}>
                                    {category2}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='line2'></div>

                    {/* 오늘픽업 체크박스 / 인기순,신상품,등등 */}
                    <div className="allproduct-click-bar">

                        <div className="allproduct-check-box">
                            <input
                                id="today-pickup"
                                type="checkbox"
                                checked={showTodayPu}
                                onChange={(e) => setShowTodayPu(e.target.checked)}
                            />
                            <label htmlFor="today-pickup">오늘픽업</label>
                        </div>

                        <div className="allproduct-dropdown-box">
                            <select onChange={handleSortEvent}>
                                <option value="낮은가격순">낮은가격순</option>
                                <option value="높은가격순">높은가격순</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="aa">
                    {filterTodayPu.map(product => (
                        <div
                            className="allproduct-product-card"
                            key={product.productId}
                            onClick={() => handleProductClickEvent(product.productId)}
                        >
                            <div className="allproduct-product-card-img">
                                <img src={product.defaultImage} alt={product.productName} className="allproduct-product-defaultImage" />
                            </div>

                            <div className="allproduct-product-info">
                                <div className="allproduct-product-enrollDate">{product.enrollDate}</div>
                                <div className="allproduct-product-name">{product.productName}</div>
                                <div className="allproduct-product-price">{Number(product.price).toLocaleString()} 원</div>
                            </div>

                            <div className="allproduct-icon-button">
                                <div className="allproduct-review">
                                    <ReviewButton
                                        rating={product.rating}
                                        onClick={() => console.log(`Reviewed product with ID: ${product.productId}`)}
                                    />
                                </div>

                                <div className="allproduct-button">
                                    <div className="allproduct-product-tag-container">
                                        {invToStore.some(inv =>
                                            inv.productId === product.productId && inv.quantity > 0) ? (
                                            <div className="allproduct-product-tag">오늘픽업</div>
                                        ) : (
                                            <div className="allproduct-product-tag-placeholder"></div>
                                        )}
                                    </div>
                                    <LikeButton
                                        onClick={addDibs}
                                        productId={product.productId}
                                        liked={product.liked}
                                    />
                                    <CartButton onClick={saveInBasket} productId={product.productId} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <AlertModalOfClickBasketButton
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
                    navigateOnYes={goToBasketPage}
                    navigateOnNo={stayOnPage}
                />

                <FooterComponent />
            </div>
        </div>
    );
}

export default CategoriesProductComponent;
