import React from 'react';
import './TodayItemComponent.css';

function TodayItem({
    baskets,
    selectedBaskets,
    toggleSelectAll,
    deleteSelectedBaskets,
    toggleSelectBasket,
    updateQuantity,
}) {
    return (
        <div>
            
            {/* 체크박스 */}
            <div className="basket-today-pickup-content">
                <label>
                    <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedBaskets.length === baskets.length && baskets.length > 0}
                        value="0"
                    />
                    전체 선택
                </label>
                <button onClick={deleteSelectedBaskets} className="basket-delete-button">
                    삭제 하기
                </button>
            </div>

            {/* 상품정보 */}
            <div className="basket-table">

                {baskets.map(basket => (
                    <div key={basket.basketId} className="basket-item-container">
                    <div>
                        <input
                            type="checkbox"
                            name='basketId'
                            value={basket.basketId}
                            checked={selectedBaskets.includes(basket.basketId)}
                            onChange={() => toggleSelectBasket(basket.basketId)}
                        />
                    </div>

                    <div className="basket-item">
                        <div className="basket-item-info">
                            <img
                                src={basket.items[0].defaultImage}
                                alt={basket.items[0].productName}
                                className="basket-item-image"
                            />
                            <div className="basket-item-name">
                                {basket.items[0].productName}
                            </div>
                        </div>
                    </div>

                    <div className="basket-quantitiy-content">
                        <div className="basket-quantitiy-box">
                            <button onClick={() => updateQuantity(basket.basketId, -1)}>-</button>
                            <button className="basket-quantitiy">{basket.items[0].basketQuantity}</button>
                            <button onClick={() => updateQuantity(basket.basketId, 1)}>+</button>
                        </div>

                        <div className="basket-original-price">
                            <div className="basket-price">{basket.items[0].price.toLocaleString()}원</div>
                        </div>
                    </div>
                    </div>
                ))}

            </div>

        </div>
    );
}

export default TodayItem;
