import '../styles/styles.css';

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>MediTrack</h2>
            <p>당신의 건강을 위한 스마트한 약품 관리</p>
          </div>
          <div className="footer-links">
            <h3>바로가기</h3>
            <ul>
              <li><a href="/">홈</a></li>
              <li><a href="/dashboard">대시보드</a></li>
              <li><a href="/my-medications">내 약품 관리</a></li>
              <li><a href="/symptom-search">증상 검색</a></li>
              <li><a href="/interaction-check">상호작용 확인</a></li>
              <li><a href="/lens">약품 스캔</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3>문의하기</h3>
            <p><i className="fas fa-envelope"></i> info@meditrack.com</p>
            <p><i className="fas fa-phone"></i> 02-2260-8755</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 MediTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
