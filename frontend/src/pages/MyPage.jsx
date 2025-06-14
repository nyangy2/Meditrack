import { useState, useEffect } from 'react';
import '../styles/styles.css';

function MyPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    gender: '',
  });
  const [provider, setProvider] = useState(''); // 회원 정보 provider (local or kakao)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login"; // 토큰이 없으면 로그인 페이지로 리디렉션
    } else {
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://13.209.5.228:8000/mypage/info", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            }
          });

          const data = await response.json();

          if (response.ok) {
            setFormData({
              email: data.email,
              name: data.name,
              age: data.age || '',
              gender: data.gender || '',
            });
            setProvider(data.provider || 'local');
          } else {
            alert(data.message || '사용자 정보를 가져오는 데 실패했습니다.');
          }
        } catch (error) {
          alert("서버 오류가 발생했습니다.");
          console.error(error);
        }
      };

      fetchUserData();
    }
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    try {
      // 이메일을 제외한 name, age, gender만 전송
      const { email, ...updateData } = formData;
  
      const response = await fetch("http://13.209.5.228:8000/mypage/edit", {
        method: "PATCH", // HTTP 메서드를 PATCH로 변경
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData), // 이메일을 제외한 데이터만 전송
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('회원 정보가 수정되었습니다.');
      } else {
        alert(data.message || '정보 수정 실패');
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <div className="content-body">
          <div className="card">
            <div className="card-header">
              <h3>회원 정보 수정</h3>
            </div>
            <div className="card-body">
              {/* 사용자 이메일 표시 (비활성화) */}
              <div className="form-group">
                <label>이메일</label>
                <div className="email-container">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="form-control"
                  />
                  <span className="provider-text">
                    {provider === 'kakao' ? '소셜 로그인 중' : '로컬 로그인 중'}
                  </span>
                </div>
              </div>
              {/* 정보 수정 폼 표시 */}
              <form className="profile-form" onSubmit={handleUpdateSubmit}>
                <div className="form-group">
                  <label htmlFor="name">이름</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">나이</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                    required
                    min="1"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label>성별</label>
                  <div className="gender-options">
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={formData.gender === "M"}
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
                        required
                      />
                      여자
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn primary-btn">
                  정보 수정
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyPage;
