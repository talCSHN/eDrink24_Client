import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import eDrinkLogo from '../../assets/common/eDrinkLogo.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import filledHeart from '../../assets/common/fill-heart.png';
import filter from '../../assets/common/filter.png';
import star from '../../assets/common/star.png';
import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './AllProductComponent.css';
//import daum from './assets/daum.png';


// 카테고리 목록 상수
const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

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

// 메인 컴포넌트
const AllProductComponent = () => {
    const { category1, productId } = useParams(); // URL 파라미터 가져오기
    const [products, setProducts] = useState([]); // 제품 목록 상태
    const [selectedCategory, setSelectedCategory] = useState('와인'); // 선택된 카테고리 상태
    const navigate = useNavigate(); // 페이지 이동 함수
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
    const [quantity] = useState(1); // 장바구니에 추가할 수량
    const [product, setProduct] = useState(null); // 선택된 제품 상태
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (category1) {
            selectCategory1(selectedCategory);
        }
    }, [selectedCategory, category1]);

    // 카테고리에 따른 제품 목록 가져오기
    const selectCategory1 = async (category1) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            // 찜 목록 가져오기
            const likedResponse = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAllDibs/${userId}`, {
                method: "GET"
            });

            if (!likedResponse.ok) {
                throw new Error('Failed to fetch liked products');
            }

            const likedData = await likedResponse.json();
            const likedProductIds = new Set(likedData.map(dib => dib.productId));

            // 제품 목록에 찜 상태 추가
            const updatedProducts = resData.map(product => ({
                ...product,
                liked: likedProductIds.has(product.productId)
            }));

            setProducts(updatedProducts);

            if (productId) {
                const foundProduct = resData.find(prod => prod.productId === parseInt(productId));
                setProduct(foundProduct || null);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // 정렬 옵션에 따른 제품 목록 정렬
    const handleSortEvent = (e) => {
        const sortOption = e.target.value;
        let sortedProduct = [...products];

        if (sortOption === '낮은가격순') {
            sortedProduct.sort((a, b) => a.price - b.price);
        } else if (sortOption === '높은가격순') {
            sortedProduct.sort((a, b) => b.price - a.price);
        } else if (sortOption === '신상품순') {
            sortedProduct.sort((a, b) => new Date(b.enrollDate) - new Date(a.enrollDate));
        }
        setProducts(sortedProduct);
    };

    // 카테고리 버튼 클릭 처리
    const handleCategory1Click = (category1) => {
        setSelectedCategory(category1);
        navigate(`/allproduct/${category1}`);
    };

    // 홈으로 이동
    const returnHome = () => {
        navigate(`/`);
    };

    // 제품 클릭 시 상세 페이지로 이동
    const handleProductClickEvent = (productId) => {
        const clickedProduct = products.find(product => product.productId === productId);
        if (clickedProduct) {
            setProduct(clickedProduct);
            const category2 = clickedProduct.category2;
            navigate(`/allproduct/${selectedCategory}/${category2}/${productId}`);
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
    };

    // 현재 스토어의 재고를 가져오는 함수
    const [invToStore, setInvToStore] = useState([]);
    const [showTodayPu, setShowTodayPu] = useState(false);
    const currentStoreId = localStorage.getItem("currentStoreId");

    useEffect(() => {
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findInventoryByStoreId/${parseInt(currentStoreId)}`, {
                        method: 'GET'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch inventory');
                    }

                    const invData = await response.json();
                    setInvToStore(invData);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, [currentStoreId]);

    // 오늘 픽업 가능한 제품 필터링
    const filterTodayPu = showTodayPu
        ? products.filter(product =>
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
        navigate(`/allproduct/${category1}`);
    };

    // 카테고리-필터 바 가로 스크롤(=드래그) 기능
    useEffect(() => {
        const slider = document.querySelector('.allproduct-filter-bar');
        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const handleMouseLeaveOrUp = () => {
            isDown = false;
            slider.classList.remove('active');
        };

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // 드래그 속도 조절
            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeaveOrUp);
        slider.addEventListener('mouseup', handleMouseLeaveOrUp);
        slider.addEventListener('mousemove', handleMouseMove);

        // 클린업 함수
        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeaveOrUp);
            slider.removeEventListener('mouseup', handleMouseLeaveOrUp);
            slider.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

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

            if (response.ok) {
                // 위 api 실행되면 products에 liked 상태 변경
                // setProducts(prevProducts =>
                //     prevProducts.map(product =>
                //         product.productId === productId
                //             ? { ...product, liked: liked }
                //             : product
                //     )
                // );
                console.log(`Product ${liked ? 'added to' : 'removed from'} dibs:`, dibProducts);
            } else {
                throw new Error(`Failed to ${liked ? 'add' : 'remove'} product to dibs`);
            }

        } catch (error) {
            console.error(`Error ${liked ? 'adding' : 'removing'} product to dibs:`, error);
        }
    };


    return (
        <div className="allproduct-wrapper">
            <div className="allproduct-container">
                <div className='allproduct-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <img className="logoImg" src={eDrinkLogo} alt=" " />
                    <button className="bag-button" onClick={() => { navigate('/basket') }}>
                        <img src={bag} alt="장바구니" />
                    </button>
                </div>

                {/* 서브 네비게이션 바 */}
                <div className="allproduct-sub-nav">
                    {/* 카테고리 필터 */}
                    <div className="cc">
                        <div className="allproduct-filter-bar">
                            {categoryList.map((category1, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleCategory1Click(category1)}
                                    className={`allproduct-filter-button ${selectedCategory === category1 ? 'selected' : ''}`}
                                >
                                    {category1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='line2'></div>

                    {/* 체크 박스 / 드롭다운 박스 */}
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
                                    {/* 장바구니 버튼을 CartButton 컴포넌트로 변경 */}
                                    <ReviewButton
                                        rating={product.rating}
                                        onClick={() => console.log(`Reviewed product with ID: ${product.productId}`)}
                                    />
                                </div>

                                <div className="allproduct-button">
                                    {/* 오늘픽업 아이콘 */}
                                    <div className="allproduct-product-tag-container">
                                        {invToStore.some(inv =>
                                            inv.productId === product.productId && inv.quantity > 0) ? (
                                            <div className="allproduct-product-tag">오늘픽업</div>
                                        ) : (
                                            <div className="allproduct-product-tag-placeholder"></div> // 빈 공간을 위한 placeholder
                                        )}
                                    </div>
                                    <LikeButton
                                        onClick={addDibs}
                                        productId={product.productId}
                                        liked={product.liked} // 제품의 현재 좋아요 상태를 전달
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
};

export default AllProductComponent;
