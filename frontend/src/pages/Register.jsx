import { useEffect, useState } from 'react';
import '../styles/styles.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '', // "M" 또는 "F"
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      const response = await fetch("http://13.209.5.228:8000/auth/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          gender: formData.gender,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);  // 회원가입 성공 메시지
        window.location.href = '/login';
      } else {
        // 서버에서 반환하는 message 필드를 사용
        alert(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };
  

  useEffect(() => {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    toggle?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }, []);

  return (
    <div>
      <section className="auth-section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <h2>회원가입</h2>
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">이름</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group-row">
                <div className="form-group age-group">
                  <label htmlFor="age">나이</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    max="120"
                  />
                </div>

                <div className="form-group gender-group">
                  <label>성별</label>
                  <div className="gender-options">
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={formData.gender === "M"}
                        onChange={handleChange}
                        required
                      />
                      남자
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={formData.gender === "F"}
                        onChange={handleChange}
                        required
                      />
                      여자
                    </label>
                  </div>
                </div>
              </div>
                <div className="form-group">
                  <label htmlFor="password">비밀번호</label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">비밀번호 확인</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn primary-btn full-width">회원가입</button>
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
                <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
              </div>
            </div>
            <div className="auth-image">
              <img src="https://i.ibb.co/qM52XS6D/image.jpg" alt="회원가입 이미지" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;
