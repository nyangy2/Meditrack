import { useEffect, useState } from 'react';
import '../styles/styles.css';

function Header() {
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

  useEffect(() => {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    toggle?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // localStorage 변경 감지
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserEmail(localStorage.getItem('userEmail'));
    };

    window.addEventListener('storage', handleStorageChange);

    // 페이지 내부에서 localStorage 바뀌는 것도 감지하기 위해 interval 사용
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <header>
      <div className="container">
        <div className="logo">
          <h1><a href="/">MediTrack</a></h1>
        </div>
        <nav>
          <ul className="nav-links">
            <li><a href="/">홈</a></li>
            <li><a href="/dashboard">대시보드</a></li>
            <li><a href="/my-medications">내 약품 관리</a></li>
            <li><a href="/symptom-search">증상 검색</a></li>
            <li><a href="/interaction-check">상호작용 확인</a></li>
            <li><a href="/lens">약품 스캔</a></li>
          </ul>
        </nav>

        {userEmail ? (
          <div className="auth-buttons">
            <span className="welcome-message">👋 {userName}님<br /><small>{userEmail}</small></span>
            <button onClick={handleLogout} className="btn logout-btn">로그아웃</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <a href="/login" className="btn login-btn">로그인</a>
            <a href="/register" className="btn signup-btn">회원가입</a>
          </div>
        )}

        <div className="menu-toggle">
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </header>
  );
}

export default Header;
