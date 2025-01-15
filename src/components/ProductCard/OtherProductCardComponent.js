import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import bag from '../../assets/common/bag.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import filledHeart from '../../assets/common/fill-heart.png';
import star from '../../assets/common/star.png';
import './OtherProductCardComponent.css';

import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton.js';

const OtherProductCardComponent = ({ products = [] }) => {  // 기본값으로 빈 배열을 설정
    const [invToStore, setinvToStore] = useState([]);
    const currentStoreId = localStorage.getItem("currentStoreId");
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [likedProducts, setLikedProducts] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [product, setProduct] = useState([]);
    const { category1, productId } = useParams(); // URL 파라미터 가져오기

    useEffect(() => {
        // 현재 스토어의 재고를 가져옴.
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findInventoryByStoreId/${parseInt(currentStoreId)}`);
                    const invData = await response.json();
                    setinvToStore(invData);
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
                    const updatedProducts = invData.map(product => ({
                        ...product,
                        liked: likedProductIds.has(product.productId)
                    }));

                    setProduct(updatedProducts);

                    if (productId) {
                        const foundProduct = invData.find(prod => prod.productId === parseInt(productId));
                        setProduct(foundProduct || null);
                    }
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, [currentStoreId]);

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

    // 제품 클릭 시 상세 페이지로 이동
    const handleProductClickEvent = (productId) => {
        const clickedProduct = products.find(product => product.productId === productId);
        if (clickedProduct) {
            const category2 = clickedProduct.category2;
            navigate(`/allproduct/${clickedProduct.category1}/${category2}/${productId}`);
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
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

    // Like 기능
    const handleClick1 = (event, productId) => {
        event.stopPropagation();
        setLikedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));
    };

    // Review 기능
    const handleClick2 = (event, productId) => {
        event.stopPropagation();
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

    // CartBag 기능
    const handleClick3 = (event, productId) => {
        event.stopPropagation();
        saveInBasket(productId);
    };

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

    // 3개씩 그룹화하여 렌더링
    const groupedProducts = [];
    for (let i = 0; i < products.length; i += 3) {
        groupedProducts.push(products.slice(i, i + 3));
    }

    return (
        <div className="ProductCard2"> {/* 가로 스크롤을 지원하는 컨테이너 */}
            {groupedProducts.length > 0 ? (  // products가 있을 때만 렌더링
                groupedProducts.map((group, index) => (

                    <div className="ProductCardSet" key={index}> {/* 세로로 3개씩 묶는 컨테이너 */}
                        {group.map(product => {

                            return (
                                <div className="productCard-box2" key={product.productId} onClick={() => handleProductClickEvent(product.productId)} >
                                    <div className="productImage-box2">
                                        <img className="productImage2" src={product.defaultImage} alt={product.productName} />
                                    </div>
                                    <div className="productInfo-box2">
                                        <div className="productInfo-info2">
                                            <div className="productInfo-name2">{product.productName}</div>
                                            <div className="productInfo-price2">{Number(product.price).toLocaleString()} 원</div>
                                        </div>

                                        <div className="productInfo-button2">

                                            <div className="productInfo-review2" onClick={(e) => handleClick2(e, product.productId)}>
                                                <img className="productInfo-reviewIcon2" src={star} alt=" " />
                                                <span className="productInfo-reviewRating2">{product.rating ? product.rating : 0}</span>
                                            </div>

                                            <div className="productInfo-button2-tag">
                                                <div className="productInfo-tag2">
                                                    {Array.isArray(invToStore) && invToStore.some(inv =>
                                                        inv.productId === product.productId && inv.quantity > 0) ? (
                                                        <div className="today-product-tag2">오늘픽업</div>
                                                    ) : (
                                                        <div className="today-product-tag-placeholder2"></div>
                                                    )}
                                                </div>

                                                <LikeButton
                                                    onClick={addDibs}
                                                    productId={product.productId}
                                                    liked={product.liked} // 제품의 현재 좋아요 상태를 전달
                                                />

                                                <button className="productInfo-bag2" onClick={(e) => handleClick3(e, product.productId)}>
                                                    <img className="productInfo-bagIcon2" src={bag} alt=" " />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>

                ))
            ) : (
                <p>No products available.</p>  // products가 없을 때 표시할 내용
            )}

            <AlertModalOfClickBasketButton
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
                navigateOnYes={goToBasketPage}
                navigateOnNo={stayOnPage}
            />
        </div>

    );
};

export default OtherProductCardComponent;
