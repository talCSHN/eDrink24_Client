import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FooterComponent.css'; // Footer 전용 CSS 파일
import home from '../../assets/common/home.png'
import search from '../../assets/common/search.png'
import list from '../../assets/common/receipt.png'
import my from '../../assets/common/my.png'

const Footer = () => {
    const navigate = useNavigate();

    // 버튼 클릭 핸들러 함수
    const handleDirectHome = () => {
        navigate("/");
    };

    const handleDirectMyPage = () => {
        navigate("/mypage");
    };

    const handleDirectSearch = () => {
        navigate("/search");
    };

    const handleDirectHistory = () => {
        navigate("/orderHistory");
    };

    return (
        <div className="homePage-fix-nav-container">
            <div className="homePage-fix-nav-box">
                <button type="button" className="homeIcon" onClick={handleDirectHome}>
                    <img className="home-icon" src={home} alt="home-Button" />
                    <h1>홈</h1>
                </button>
                <button type="button" className="searchIcon" onClick={handleDirectSearch}>
                    <img className="search-icon" src={search} alt="search-Button" />
                    <h1>검색</h1>
                </button>
                <button type="button" className="listIcon" onClick={handleDirectHistory}>
                    <img className="list-icon" src={list} alt="receipt-Button" />
                    <h1>내역</h1>
                </button>
                <button type="button" className="myIcon" onClick={handleDirectMyPage}>
                    <img className="my-icon" src={my} alt="my-Button" />
                    <h1>마이</h1>
                </button>
            </div>
        </div>
    );
};

export default Footer;
