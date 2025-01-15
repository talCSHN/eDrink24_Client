import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./SearchComponent.css";
import FooterComponent from '../../components/footer/FooterComponent.js';
import AlertModal from '../../components/alert/AlertModal.js';
import back from '../../assets/common/backIcon.png'

function SearchComponent() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState(''); // 검색어
    const [products, setProducts] = useState([]);

    const fetchSearch = async () => {
        const trimKeyword = keyword.trim();

        if (!trimKeyword || trimKeyword.length < 2) {
            setAlertMessage("2글자 이상 입력해주세요.")
            openAlert(true);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/search/${encodeURIComponent(trimKeyword)}`, {
                method: "GET"
            });

            if (!response.ok) {
                setAlertMessage("서버통신 오류");
                openAlert(true);
                return;
            }

            const resData = await response.json();
            setProducts(resData);
        } catch (error) {
            setAlertMessage("서버통신 오류");
            openAlert(true);
        }
    }

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const openAlert = () => {
        setAlertOpen(true);
    }

    const closeAlert = () => {
        setAlertOpen(false);
    }

    // 제품사진 클릭했을 때 제품상세보기
    const handleProductClickEvent = (productId) => {
        const product = products.find(product => product.productId === productId);

        if (product) {
            const { category1, category2 } = product;
            navigate(`/allproduct/${category1}/${category2}/${productId}`);
        } else {
            console.error("Product not found");
        }
    };

    // 오늘픽업 필터링
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

    // "오늘픽업" 필터 적용
    const filterTodayPu = showTodayPu ? products.filter(product =>
        invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0))
        : products;

    return (
        <div className="search-container">
            <div className="search-header">
                <div className="search-navigation-bar">
                    <button className="search-back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="Back" className="search-nav-bicon" />
                    </button>

                    <input type="text" className="search-input"
                        placeholder="  키워드를 입력해주세요."
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                    />

                    <button type="submit"
                        className="search-keyword-button"
                        onClick={fetchSearch}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="search-body">
                <div className="search-pickup-container">
                    <input
                        id="today-pickup"
                        type="checkbox"
                        checked={showTodayPu}
                        onChange={(e) => setShowTodayPu(e.target.checked)}
                    />
                    <label htmlFor="today-pickup">오늘픽업</label>
                </div>
                <div className="search-product-grid">
                    {filterTodayPu.map(product => (
                        <div className="search-product-card" key={product.productId} onClick={() => handleProductClickEvent(product.productId)}>
                            <img src={product.defaultImage} alt={product.productName} className="search-product-defaultImage" />

                            <div className="search-product-info">
                                <div className="search-product-enrollDate">{product.enrollDate}</div>
                                <div className="search-product-name">{product.productName}</div>
                                <div className="search-product-price">{Number(product.price).toLocaleString()} 원</div>

                                {invToStore.some(inv =>
                                    inv.productId === product.productId && inv.quantity > 0) && (
                                        <div className="search-product-tag">오늘픽업</div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <FooterComponent />

            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
            />

        </div>
    );
}

export default SearchComponent;
