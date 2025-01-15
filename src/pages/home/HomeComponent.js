import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import all from '../../assets/common/all.png';
import bag from '../../assets/common/bag.png';
import dibs from '../../assets/common/dibs.png';
import eDrinkLogo from '../../assets/common/eDrinkLogo.png';
import gift from '../../assets/common/gift.png';
import menu from '../../assets/common/menu.png';
import CarouselComponent from '../../components/Banner/CarouselComponent.js';
import FooterComponent from '../../components/footer/FooterComponent.js';
import MyplaceComponent from '../../components/mainMyplace/MyplaceComponent.js';
import OtherProductCardComponent from '../../components/ProductCard/OtherProductCardComponent.js';
import ProductCardComponent from '../../components/ProductCard/ProductCardComponent.js';
import "./HomeComponent.css";

function HomeComponent() {
    const { category1 } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [invToStore, setInvToStore] = useState([]);  // 재고 데이터 상태 정의

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/와인`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();

        // 재고 데이터를 API 호출을 통해서 가져옴
        const fetchInvByStoreId = async () => {
            const currentStoreId = localStorage.getItem("currentStoreId");
            if (currentStoreId) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/findInventoryByStoreId/${parseInt(currentStoreId)}`);
                    const invData = await response.json();
                    // invData가 배열이 아니면 배열로 변환
                    const invArray = Array.isArray(invData) ? invData : Object.values(invData);
                    setInvToStore(invArray);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, []);

    // "오늘 픽업" 제품 필터링
    const todayPickupProducts = products.filter(product =>
        invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0)
    );

    const handleDirectHome = () => {
        navigate("/");
    };

    const handleDirectCategory = () => {
        navigate("/category");
    };

    const handleDirectAllproduct = () => {
        navigate(`/allproduct/${category1}`);
    };

    const handleDirectDibs = () => {
        navigate(`/dibs`);
    };

    return (
        <div className="homePage-wrapper">
            <div className="homePage-container">
                <div className="homePage-header">
                    <img className="homePage-logo" src={eDrinkLogo} alt=" " />
                    <div>
                        <button className="bag-button" onClick={() => navigate("/basket")}>
                            <img src={bag} alt="장바구니" />
                        </button>
                    </div>
                </div>

                <MyplaceComponent />
                <CarouselComponent />

                <div className="mainHome-icon">
                    <div className="mainHome-item-icon" onClick={handleDirectCategory}>
                        <img src={menu} alt="Menu Button" />
                        <span>카테고리</span>
                    </div>
                    <div className="mainHome-item-icon" onClick={handleDirectAllproduct}>
                        <img src={all} alt="Search Button" />
                        <span>모든상품</span>
                    </div>
                    <div className="mainHome-item-icon" onClick={handleDirectHome}>
                        <img src={gift} alt="Gift Button" />
                        <span>이벤트</span>
                    </div>
                    <div className="mainHome-item-icon" onClick={handleDirectDibs}>
                        <img src={dibs} alt="Chatbot Button" />
                        <span>찜</span>
                    </div>
                </div>

                <div className="homeProduct-container">
                    <div className='line'></div>
                    <div className="best-product">
                        <div className="bestTitle">
                            <h1>오늘픽업</h1>
                            <Link to="/allproduct/:category1" className='moreButton'>더보기 {">"}</Link>
                        </div>
                        <div className="ProductCard">
                            <ProductCardComponent products={todayPickupProducts.slice(0, 6)} />
                        </div>
                    </div>

                    <div className='line'></div>
                    <div className="best-product">
                        <div className="bestTitle">
                            <h1>전체상품</h1>
                            <Link to="/allproduct/:category1" className='moreButton'>더보기 {">"}</Link>
                        </div>
                        <div className="ProductCard2">
                            <OtherProductCardComponent products={products.slice(0, 9)} />
                        </div>
                    </div>
                </div>

                <FooterComponent />
            </div>
        </div>
    );
}

export default HomeComponent;
