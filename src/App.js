import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import CategoryComponent from './pages/category/CategoryComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import MypageComponent from './pages/mypage/MypageComponent';
import SearchComponent from './pages/search/SearchComponent';
import HistoryComponent from './pages/history/HistoryComponent';
import UpdateCustomerComponent from './pages/mypage/UpdateCustomerComponent';
import OrderComponent from './pages/order/OrderComponent';
import ListToBasketComponent, { loader as basketLoader } from './pages/basket/ListToBasketComponent';
import AllProductComponent from './pages/product/AllProductComponent';
import CategoriesProductComponent from './pages/product/CategoriesProductComponent';
import ProductDetailComponent from './pages/product/ProductDetailComponent';
import AdminOrderComponent from './pages/admin/AdminOrderComponent';
import KakaoLoginHandler from './pages/login/kakao/KakaoLoginHandler';
import KakaoSignupHandler from './pages/login/kakao/KakaoSignupHandler';

import RootLayout from './pages/rootLayout/root';
import ProtectedRoute from './components/ProtectedRouter';
import SetPlaceComponent from './pages/setPlace/SetPlaceComponent';

import { RecoilRoot } from 'recoil'; // RecoilRoot 임포트 추가
import { tokenLoader } from './util/auth';
import AdminOrderListComponent from './pages/admin/AdminOrderListComponent';
import ShowReservationPickupComponent from './pages/admin/ShowReservationPickupComponent';
import AdminComponent from './pages/admin/AdminComponent';
import ShowTodayPickupPageComponent from './pages/admin/ShowTodayPickupPageComponent';
import TodayPickupCompletedPageComponent from './pages/admin/TodayPickupCompletedPageComponent';
import PaymentApproval from './components/payment/PaymentApproval';
import PaymentCancelOrFail from './components/payment/PaymentCancelOrFail';
import OrderHistoryComponent from './pages/order/OrderHistoryComponent';
import ReviewComponent from './pages/review/ReviewComponent';
import CheckMyReviewComponent from './pages/review/CheckMyReviewComponent';
import OrderHistoryDetailsComponent from './pages/order/OrderHistoryDetailsComponent';
import DibsComponent from './pages/dibs/DibsComponent';
import ManagerComponent from './pages/manager/ManagerComponent';


// test yoon
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    loader: tokenLoader,
    children: [
      { path: '', element: <HomeComponent /> },
      { path: '/allproduct/:category1', element: <AllProductComponent /> },
      { path: '/allproduct/:category1/:category2', element: <CategoriesProductComponent /> },
      { path: '/allproduct/:category1/:category2/:productId', element: <ProductDetailComponent /> },
      { path: '/category', element: <CategoryComponent /> },
      { path: '/search', element: <SearchComponent /> },
      {
        path: '/login', element: <LoginComponent />,
        action: loginAction
      },
      {
        path: '/signup', element: <SignupComponent />,
        action: signUpAction
      },
      { path: "/mypage", element: <MypageComponent /> },
      { // 카카오 로그인 대기창
        path: '/login/oauth2/callback/kakao', element: <KakaoLoginHandler />,
      },
      { // 카카오 회원가입시, 추가정보 입력창
        path: '/kakao/signup', element: <KakaoSignupHandler />
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/basket', element: <ListToBasketComponent />,
            loader: basketLoader
          },
          { path: "/mypage/updateCustomer", element: <UpdateCustomerComponent /> },
          { path: "/myplace_store", element: <SetPlaceComponent /> },
          { path: "/order/approval", element: <PaymentApproval /> }, // 결제완료처리페이지
          { path: "/order/cancelOrFail", element: <PaymentCancelOrFail /> }, // 결제취소or오류
          { path: '/history', element: <HistoryComponent /> },
          {
            path: '/order', element: <OrderComponent />
          },
          {
            path: '/orderHistory', element: <OrderHistoryComponent />
          },
          {
            path: '/orderHistoryDetails', element: <OrderHistoryDetailsComponent />
          },
          {
            path: '/dibs', element: <DibsComponent />
          },
          {
            path: '/admin', element: <AdminComponent />
          },
          {
            path: '/manager', element: <ManagerComponent />
          },
          {
            path: '/review', element: <ReviewComponent />
          },
          {
            path: '/checkMyReview', element: <CheckMyReviewComponent />
          },
          {
            path: '/todayPickup', element: <ShowTodayPickupPageComponent />
          },
          {
            path: '/admin/todayPickupCompleted', element: <TodayPickupCompletedPageComponent />
          },
          {
            path: '/admin/adminOrder', element: <AdminOrderComponent />
          },
          {
            path: '/admin/ShowReservationPickup', element: <ShowReservationPickupComponent />
          },
          {
            path: '/admin/adminOrderList', element: <AdminOrderListComponent />
          },

        ]
      }
    ]
  }
])

function App() {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>

  );
}

export default App;