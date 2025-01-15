import React, { useEffect, useState } from 'react';
import './AdminOrderComponent.css';
import AlertModal from '../../components/alert/AlertModal';

// 제품 카테고리 목록
const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

const AdminOrderComponent = () => {
    const [products, setProducts] = useState([]); // 제품 목록 상태
    const [selectedCategory, setSelectedCategory] = useState('와인'); // 선택된 카테고리 상태
    const [quantity, setQuantity] = useState(0); // 발주 수량 상태
    const [showQuantityModal, setShowQuantityModal] = useState(false); // 수량 입력 모달 표시 상태
    const [selectedProductId, setSelectedProductId] = useState(null); // 선택된 제품 ID 상태
    const [adminOrderList, setAdminOrderList] = useState([]); // 관리자 발주 목록 상태
    const [searchProduct, setSearchProduct] = useState(''); // 검색 입력 상태

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // 알림창 열기
    const openAlert = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    // 카테고리가 변경될 때마다 호출
    useEffect(() => {
        if (selectedCategory)
            selectCategory1(selectedCategory);
    }, [selectedCategory]);

    // 선택된 카테고리의 제품을 서버에서 가져오는 함수
    const selectCategory1 = async (category1) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            const resData = await response.json();
            setProducts(resData);

            // 관리자 발주 목록 초기화
            const newAdminOrderList = resData.map(product => ({
                storeId: 1,
                productId: product.productId,
                InventoryQuantity: 0,
                productName: product.productName
            }));

            setAdminOrderList(newAdminOrderList);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // 발주 버튼 클릭 시 호출되는 함수
    const handleOrderClick = (productId) => {
        setSelectedProductId(productId);
        setShowQuantityModal(true); // 수량 입력 모달 표시
    };

    // 발주 수량 입력 핸들러
    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value)); // 입력된 수량으로 상태 업데이트
    };

    // 발주 처리 함수
    const handleAdminOrder = async () => {
        const storeId = localStorage.getItem("myStoreId"); // 현재 상점 ID 가져오기
        if (selectedProductId && quantity > 0) {
            const selectedProduct = products.find(product => product.productId === selectedProductId);

            if (!selectedProduct) {
                return;
            }

            // 관리자 발주 목록에서 선택된 제품의 수량 업데이트
            const updatedOrderList = adminOrderList.map(item =>
                item.productId === selectedProductId ? { ...item, InventoryQuantity: quantity } : item
            );
            setAdminOrderList(updatedOrderList);

            // 발주 DTO 설정
            const InventoryDTO = {
                storeId,
                productId: selectedProductId,
                quantity: quantity,
                productName: selectedProduct.productName,
                adminOrderQuantity: quantity
            };
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/updateOrInsertInventory/${storeId}/${selectedProductId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(InventoryDTO)
                });

                const contentType = response.headers.get('Content-Type');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to place order: ${errorText}`);
                }

                if (contentType && contentType.includes('application/json')) {
                    const jsonResponse = await response.json();
                } else {
                    const textResponse = await response.text();
                }

                setShowQuantityModal(false); // 모달 닫기
                setQuantity(0); // 수량 상태 초기화
            } catch (error) {
                console.error('Error placing order:', error);
            }
        } else {
            openAlert("수량을 입력해주세요.");
        }
    };

    // 제품 정렬 함수
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
        setProducts(sortedProduct); // 정렬된 제품 목록으로 상태 업데이트
    };

    // 카테고리 클릭 시 호출되는 함수
    const handleCategory1Click = async (category1) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            const resData = await response.json();
            setProducts(resData);

        } catch (error) {
            console.log("SERVER ERROR")
        }
    };


    // 검색 입력 핸들러
    const handleSearchChange = (e) => {
        setSearchProduct(e.target.value);
    };

    // 필터링된 제품 목록
    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchProduct.toLowerCase())
    );



    return (
        <div className="aoProduct-allproduct-container">
            <AlertModal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                message={alertMessage}
            />
            <div className="aoProduct-header">
                <p className="aoProdut-header-text">즉시발주신청</p>

                <div className="aoProduct-navbar">
                    <div className="aoProdut-filter-bar2">
                        <div className="aoProdut-filter-list">
                            <select onChange={handleSortEvent}>
                                <option value="신상품순">신상품순</option>
                                <option value="판매량순">판매량순</option>
                                <option value="낮은가격순">낮은가격순</option>
                                <option value="높은가격순">높은가격순</option>
                            </select>
                        </div>
                    </div>

                    <div className="aoProdut-filter-bar">
                        {categoryList.map((category1, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    handleCategory1Click(category1)
                                    setSelectedCategory(category1)
                                }
                                }
                                className={`aoProdut-filter-button ${selectedCategory === category1 ? 'selected' : ''}`}
                            >
                                {category1}
                            </button>
                        ))}
                    </div>
                    {/* 검색창 추가 */}
                    <div className="aoProdut-search-bar">
                        <input
                            type="text"
                            placeholder="상품 이름 검색"
                            value={searchProduct}
                            onChange={handleSearchChange}
                            className="aoProdut-search-input"
                        />
                    </div>
                </div>

            </div>

            <div className="aoProdut-body">
                {/* 필터링된 제품 목록 렌더링 */}
                {filteredProducts.map(product => (
                    <div className="aoProdut-product-card" key={product.productId}>
                        < img src={product.defaultImage} alt={product.productName} className="aoProdut-product-defaultImage" />

                        <div className="aoProdut-product-info">
                            <div className="aoProdut-product-enrollDate">{product.enrollDate}</div>
                            <div className="aoProdut-product-name">{product.productName}</div>
                            <div className="aoProdut-product-price">{product.price} 원</div>
                            <button className="aoProduct-btn" onClick={() => handleOrderClick(product.productId)}>발주하기</button>
                        </div>
                    </div>
                ))}

                {/* 수량 입력 모달 */}
                {showQuantityModal && (
                    <div className="adminorder-quantity-modal">
                        <h3>발주할 수량을 입력하세요</h3>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                        />
                        <button onClick={handleAdminOrder}>발주</button>
                        <button onClick={() => setShowQuantityModal(false)}>취소</button>
                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminOrderComponent;
