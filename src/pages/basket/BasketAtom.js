import { atom } from 'recoil';

// 장바구니의 전체 항목을 관리
export const basketState = atom({
  
  key: 'basketState',
  default: []
  
});

// 사용자가 선택한 항목을 관리(오늘픽업)
export const selectedTodayPickupBaskets = atom({
  
  key: 'selectedTodayPickupBaskets',
  default: []
  
});

// 사용자가 선택한 항목을 관리(예약픽업)
export const selectedReservationPickupBaskets = atom({
  
  key: 'selectedReservationPickupBaskets',
  default: []
  
});

export const basketPickupTypesState = atom({
  key: 'basketPickupTypesState',
  default: {}, // { basketId: '픽업 유형', ... }
});
