import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api"
import "../styles/dashboard.css"
import CustomAlert from "./custom-alert"
import { Pill, AlertTriangle, Heart } from 'lucide-react'
import { useMedication } from "../context/medication-context"

function Dashboard() {
  // 기저질환 관련 상태
  const [diseases, setDiseases] = useState([])
  const [conditionList, setConditionList] = useState([])
  const [isAddingDisease, setIsAddingDisease] = useState(false)

  // 복용약 관련 상태 (컨텍스트에서 가져오기)
  const { medications } = useMedication()

  // 실제 상호작용 경고 상태
  const [interactionWarnings, setInteractionWarnings] = useState([])
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false)

  // 공통 상태
  const [isLoading, setIsLoading] = useState(false)
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
    itemId: null,
    type: "",
  })

  // 컴포넌트가 마운트될 때 기존 기저질환 가져오기
  useEffect(() => {
    fetchDiseases()
  }, [])

  // 복용약이 변경될 때마다 상호작용 확인
  useEffect(() => {
    if (medications.length >= 2) {
      checkMedicationInteractions()
    } else {
      setInteractionWarnings([])
    }
  }, [medications])

  // 복용약 간 상호작용 확인 함수
  const checkMedicationInteractions = async () => {
    if (medications.length < 2) {
      setInteractionWarnings([])
      return
    }

    setIsCheckingInteractions(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("인증 토큰이 없습니다.")
        return
      }

      const warnings = []

      // 모든 약품 쌍에 대해 상호작용 확인
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i]
          const med2 = medications[j]

          try {
            // 각 약품을 새로운 약품으로 가정하고 상호작용 확인
            const response = await fetch(`http://13.209.5.228:8000/medications/check-interaction`, {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                new_medication_id: med2.item_seq,
              }),
            })

            if (response.ok) {
              const data = await response.json()

              // 상호작용이 있는 경우만 경고에 추가
              const hasInteraction = data.interactions.some(
                (interaction) =>
                  interaction.interaction_type === "주의" &&
                  (interaction.product_a === med1.item_name || interaction.product_b === med1.item_name),
              )

              if (hasInteraction) {
                const relevantInteractions = data.interactions.filter(
                  (interaction) =>
                    interaction.interaction_type === "주의" &&
                    (interaction.product_a === med1.item_name || interaction.product_b === med1.item_name),
                )

                relevantInteractions.forEach((interaction) => {
                  warnings.push({
                    id: `${med1.item_seq}-${med2.item_seq}-${interaction.id || warnings.length}`,
                    medications: [med1.item_name, med2.item_name],
                    severity: "moderate",
                    description: interaction.detail || "두 약품 간 상호작용이 있을 수 있습니다.",
                    manufacturer1: med1.entp_name,
                    manufacturer2: med2.entp_name,
                  })
                })
              }
            }
          } catch (error) {
            console.error(`${med1.item_name}과 ${med2.item_name} 상호작용 확인 실패:`, error)
          }
        }
      }

      // 중복 제거 및 설정
      const uniqueWarnings = warnings.filter(
        (warning, index, self) => index === self.findIndex((w) => w.id === warning.id),
      )

      setInteractionWarnings(uniqueWarnings)
    } catch (error) {
      console.error("상호작용 확인 중 오류:", error)
    } finally {
      setIsCheckingInteractions(false)
    }
  }

  // 기저질환 가져오기
  const fetchDiseases = () => {
    setIsLoading(true)
    api
      .get("/user_health/conditions")
      .then((res) => {
        console.log("기존 기저질환 목록:", res.data)
        setDiseases(res.data)
      })
      .catch((err) => {
        console.error("기저질환 불러오기 실패:", err.response ? err.response.data : err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 기저질환 목록 가져오기
  const handleAddConditions = () => {
    if (isAddingDisease) {
      setIsAddingDisease(false)
      return
    }

    setIsLoading(true)
    api
      .get("/user_health/conditions/list")
      .then((res) => {
        console.log("기저질환 목록:", res.data)
        setConditionList(res.data)
        setIsAddingDisease(true)
      })
      .catch((err) => {
        console.error("기저질환 목록 가져오기 실패:", err.response ? err.response.data : err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 기저질환 등록하기
  const handleSelectCondition = (condition) => {
    if (!diseases.some((disease) => disease.condition_id === condition.id)) {
      setIsLoading(true)
      api
        .post("/user_health/conditions", { condition_id: condition.id })
        .then(() => {
          const newCondition = {
            condition_id: condition.id,
            name: condition.name,
          }
          setDiseases((prevDiseases) => [...prevDiseases, newCondition])
          setIsAddingDisease(false)
        })
        .catch((err) => {
          console.error("기저질환 추가 실패:", err.response ? err.response.data : err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  // 삭제 확인 다이얼로그 열기 (기저질환)
  const openDeleteConfirm = (itemId, type) => {
    setAlertState({
      isOpen: true,
      title: "기저질환 삭제",
      message: "정말 이 기저질환을 삭제하시겠습니까?",
      itemId: itemId,
      type: type,
    })
  }

  // 항목 삭제하기 (기저질환)
  const handleDelete = () => {
    const { itemId, type } = alertState
    if (!itemId) return

    setIsLoading(true)

    if (type === "disease") {
      api
        .delete(`/user_health/conditions/${itemId}`)
        .then(() => {
          setDiseases((prev) => prev.filter((disease) => disease.condition_id !== itemId))
          setAlertState({ ...alertState, isOpen: false })
        })
        .catch((err) => {
          console.error("기저질환 삭제 실패:", err.response ? err.response.data : err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>대시보드</h1>
        </header>

        <div className="content-body">
          {/* 상단 요약 카드 섹션 */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <Pill size={24} />
              </div>
              <div className="summary-content">
                <h4>복용약</h4>
                <p className="summary-value">{medications.length}개</p>
              </div>
              <Link to="/my-medications" className="summary-action-btn">
                자세히 보기
              </Link>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Heart size={24} />
              </div>
              <div className="summary-content">
                <h4>기저질환</h4>
                <p className="summary-value">{diseases.length}개</p>
              </div>
              <button className="summary-action-btn" onClick={handleAddConditions}>
                관리하기
              </button>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="summary-content">
                <h4>약품 상호작용</h4>
                <p className="summary-value">
                  {isCheckingInteractions ? "확인 중..." : `${interactionWarnings.length}개 주의`}
                </p>
              </div>
              <Link to="/interaction-check" className="summary-action-btn">
                자세히 보기
              </Link>
            </div>
          </div>

          {/* 기저질환 섹션 */}
          <div className="card">
            <div className="card-header">
              <h3>기저질환</h3>
            </div>
            <div className="card-body disease-categories">
              <button
                className={`btn ${isAddingDisease ? "text-btn" : "add-condition-btn"}`}
                onClick={handleAddConditions}
                disabled={isLoading}
              >
                {isLoading && <span className="loading-spinner"></span>}
                {isAddingDisease ? "취소" : "기저질환 추가"}
              </button>

              {/* 기저질환 추가 모드에서 기저질환 목록 보여주기 */}
              {isAddingDisease && (
                <div className="condition-list">
                  <h4>기저질환 목록</h4>
                  <ul>
                    {conditionList.map((condition) => (
                      <li key={condition.id}>
                        <button
                          onClick={() => handleSelectCondition(condition)}
                          disabled={isLoading || diseases.some((disease) => disease.condition_id === condition.id)}
                        >
                          {condition.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 선택된 기저질환 목록 표시 */}
              <div className="selected-diseases">
                {diseases.length === 0 && !isLoading ? (
                  <p className="no-data">등록된 기저질환이 없습니다.</p>
                ) : (
                  diseases.map((disease) => (
                    <div className="medication-card" key={disease.condition_id || disease.id}>
                      <div className="medication-info">
                        <h4>{disease.name}</h4>
                      </div>
                      <div className="medication-actions">
                        <button
                          className="btn text-btn"
                          onClick={() => openDeleteConfirm(disease.condition_id, "disease")}
                          disabled={isLoading}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 현재 복용 중인 약물 목록 섹션 */}
          <div className="card">
            <div className="card-header">
              <h3>현재 복용 중인 약물</h3>
              <Link to="/my-medications" className="card-link">
                약물 관리
              </Link>
            </div>
            <div className="card-body">
              {medications.length === 0 ? (
                <p className="no-data">등록된 복용약이 없습니다.</p>
              ) : (
                <div className="simple-medication-list">
                  {medications.map((medication) => (
                    <div className="simple-medication-item" key={medication.item_seq}>
                      <div className="medication-info">
                        <h4>{medication.item_name}</h4>
                        <p className="manufacturer">{medication.entp_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 약품 상호작용 경고 섹션 */}
          {(interactionWarnings.length > 0 || isCheckingInteractions) && (
            <div className="card warning-card">
              <div className="card-header">
                <h3>약품 상호작용 주의</h3>
                <Link to="/interaction-check" className="card-link">
                  자세히 보기
                </Link>
              </div>
              <div className="card-body">
                {isCheckingInteractions ? (
                  <div className="checking-interactions">
                    <span className="loading-spinner"></span>
                    <p>복용약 간 상호작용을 확인하고 있습니다...</p>
                  </div>
                ) : interactionWarnings.length === 0 ? (
                  <p className="no-data">현재 복용 중인 약품 간 상호작용이 발견되지 않았습니다.</p>
                ) : (
                  interactionWarnings.map((warning) => (
                    <div className="warning-item" key={warning.id}>
                      <div className="warning-icon">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="warning-content">
                        <h4>{warning.medications.join(" + ")}</h4>
                        <p>{warning.description}</p>
                        {warning.manufacturer1 && warning.manufacturer2 && (
                          <p className="manufacturer-info">
                            <small>
                              {warning.manufacturer1} / {warning.manufacturer2}
                            </small>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 커스텀 알림창 */}
      <CustomAlert
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onConfirm={handleDelete}
        onCancel={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  )
}

export default Dashboard
