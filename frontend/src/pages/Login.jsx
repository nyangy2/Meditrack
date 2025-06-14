import { useEffect, useState } from 'react';
import '../styles/styles.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    toggle?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://13.209.5.228:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        //  alert(data.message);
        localStorage.setItem("token", data.result.access_token);
        localStorage.setItem("userName", data.result.name);  // 이름 저장
        localStorage.setItem("userEmail", data.result.email); // 이메일 저장

        window.location.href = "/"; //로그인 후 메인화면으로 이동
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div>
      <section className="auth-section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <h2>로그인</h2>
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">비밀번호</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn primary-btn full-width">로그인</button>
              </form>
              <div className="auth-divider">
                <span>또는</span>
              </div>
              <div className="social-login">
                <a
                  className="btn social-btn kakao"
                  href={`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=a06920d44c605a26e1f58359e4309cc9&redirect_uri=http://13.209.5.228:8000/auth/kakao/callback`}
                >
                  <i className="fas fa-comment"></i> 카카오로 로그인
                </a>
              </div>
              <div className="auth-footer">
                <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
              </div>
            </div>
            <div className="auth-image">
              <img src="https://i.ibb.co/FkYGQFvy/image.jpg" alt="로그인 이미지" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
