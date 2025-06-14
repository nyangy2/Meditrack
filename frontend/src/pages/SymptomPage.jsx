import { useState, useEffect } from "react"
import { SymptomProvider } from "../context/symptom-context"
import SymptomSearchInput from "../components/SymptomSearch"
import axios from "axios"
import "../styles/symptom-search.css"

function SymptomPage() {
  const [popularSymptoms, setPopularSymptoms] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem("token")
    setHasToken(!!token)

    if (token) {
      fetchPopularSymptoms(token)
    }
  }, [])

  const fetchPopularSymptoms = (token) => {
    setIsLoading(true)
    axios
      .get("http://13.209.5.228:8000/symptoms/popular", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.code === "COMMON200" && res.data.result) {
          setPopularSymptoms(res.data.result)
        }
      })
      .catch((err) => {
        console.error("증상 목록 불러오기 실패:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>증상 검색</h1>
          <div className="header-actions">
            <button className="btn icon-btn">
              <i className="fas fa-bell"></i>
            </button>
            <button className="btn icon-btn">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </header>

        <div className="content-body">
          <div className="tab-content active" id="symptom-search">
            <div className="card">
              <div className="card-header">
                <h3>증상 입력</h3>
              </div>
              <div className="card-body">
                <SymptomProvider>
                  <SymptomSearchInput popularSymptoms={popularSymptoms} />

                  {/* 자주 검색되는 증상 섹션은 SymptomSearchInput 컴포넌트로 이동 */}
                </SymptomProvider>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SymptomPage
