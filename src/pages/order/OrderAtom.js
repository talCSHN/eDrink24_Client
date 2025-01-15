import { atom } from 'recoil';

export const orderState = atom({
  key: 'orderState',
  default: {
    basket: [],
    storeId: null,
    pickupDate: null,
    pickupType: null,
    coupon: null,
    pointUse: false,
    paymentMethod: '',
    totalPrice: 0,
    discount: 0,
    finalAmount: 0,
    selectedItems: [], // 바로 구매 버튼을 눌렀을 때 선택된 상품의 정보가 임시로 저장
  },
});
