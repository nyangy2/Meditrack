import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function LoginSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // 토큰을 통해 사용자 정보를 받아오는 fetch 요청
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://13.209.5.228:8000/mypage/info", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            // 서버에서 받은 사용자 정보 저장
            const { name, email } = data;
            if (name) localStorage.setItem("userName", name);
            if (email) localStorage.setItem("userEmail", email);

            // 로그인 성공 후 홈 페이지로 리디렉션
            navigate("/");
          } else {
            alert(data.message || "사용자 정보를 가져오는 데 실패했습니다.");
            navigate("/login");
          }
        } catch (error) {
          alert("서버 오류가 발생했습니다.");
          console.error(error);
        }
      };

      fetchUserData();
    } else {
      alert("소셜 로그인에 실패했습니다.");
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>로그인 중입니다...</div>;
}

export default LoginSuccess;
