// src/components/ProtectedRoute.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(hasRun.current) return;
    hasRun.current = true;
    
    if (!token) {
      alert("로그인을 먼저 진행해주세요.");
      navigate("/login");
    } else {
      setChecking(false);
    }
  }, [navigate]);

  if (checking) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>로딩 중...</div>;
  }

  return children;
}

export default ProtectedRoute;
