import { useEffect, useState, useRef } from "react"
import { useMedication } from "../context/medication-context"

function InteractionCheck() {
  const {
    medications,
    searchKeyword,
    searchResults,
    isSearching,
    showSearchResults,
    isLoading,
    interactionMedication,
    setSearchKeyword,
    setShowSearchResults,
    setInteractionDrug,
    clearInteractionDrug,
    addMedication,
    getInteractionLevelInfo,
  } = useMedication()

  const [interactionResults, setInteractionResults] = useState(null)
  const [isCheckingInteraction, setIsCheckingInteraction] = useState(false)

  const searchInputRef = useRef(null)
  const searchResultsRef = useRef(null)

  // 검색어 변경 시 검색 결과 표시 상태 업데이트
  useEffect(() => {
    if (searchKeyword.trim().length >= 2 && searchResults.length > 0) {
      setShowSearchResults(true)
    }
  }, [searchResults, searchKeyword, setShowSearchResults])

  // 검색 결과 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowSearchResults])

  // 약품 선택 처리
  const handleSelectMedication = (medication) => {
    setInteractionDrug(medication)
    setShowSearchResults(false)
    setSearchKeyword("")
  }

  // 상호작용 확인 처리
  const handleCheckInteraction = async () => {
    if (!interactionMedication || medications.length === 0) {
      alert("현재 복용 중인 약품과 확인하려는 약품을 모두 선택해주세요.")
      return
    }

    setIsCheckingInteraction(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.")
      }

      const response = await fetch(`http://13.209.5.228:8000/medications/check-interaction`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_medication_id: interactionMedication.item_seq,
        }),
      })

      if (response.status === 401) {
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
      }

      if (!response.ok) {
        throw new Error("상호작용 확인 중 오류가 발생했습니다.")
      }

      const data = await response.json()
      console.log("API 응답:", data)

      // 대체 약품 데이터 찾기 - 여러 가능한 필드명 확인
      let alternatives = []
      const possibleFields = ["alternative_ingredients", "alternatives", "recommended_drugs", "alternative_drugs"]

      for (const field of possibleFields) {
        if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
          console.log(`대체 약품을 ${field} 필드에서 발견:`, data[field])
          alternatives = data[field]
          break
        }
      }

      // 상호작용 데이터 처리
      const interactions = data.interactions || []
      const hasHighRiskInteraction = interactions.some((interaction) => {
        return ["병용금기", "중복성분", "주의"].includes(interaction.interaction_type)
      })

      const highestRiskLevel = interactions.reduce((highest, interaction) => {
        const currentInfo = getInteractionLevelInfo(interaction.interaction_type)
        const highestInfo = getInteractionLevelInfo(highest)
        return currentInfo.priority > highestInfo.priority ? interaction.interaction_type : highest
      }, "안전")

      const highestRiskInfo = getInteractionLevelInfo(highestRiskLevel)

      const processedInteractions = interactions.map((interaction) => {
        const levelInfo = getInteractionLevelInfo(interaction.interaction_type || "안전")
        return {
          medication1: interactionMedication.item_name,
          medication2: interaction.product_a,
          level: interaction.interaction_type,
          severity: levelInfo.severity,
          description: interaction.detail,
          recommendation: levelInfo.message,
          color: levelInfo.color,
          bgColor: levelInfo.bgColor,
          icon: levelInfo.icon,
        }
      })

      const processedAlternatives = alternatives.map((alt) => ({
        item_seq: alt.item_seq,
        item_name: alt.item_name,
        manufacturer: alt.manufacturer,
        ingredient: alt.ingredient,
        entp_name: alt.manufacturer,
      }))

      console.log("처리된 대체 약품:", processedAlternatives)

      setInteractionResults({
        summary: {
          hasWarning: hasHighRiskInteraction,
          level: highestRiskLevel,
          message: hasHighRiskInteraction
            ? `${interactionMedication.item_name}과(와) 현재 복용 중인 약품 사이에 ${highestRiskLevel} 수준의 상호작용이 있습니다.`
            : "모든 약품이 안전하게 함께 복용 가능합니다.",
          color: highestRiskInfo.color,
          bgColor: highestRiskInfo.bgColor,
          icon: highestRiskInfo.icon,
        },
        interactions: processedInteractions,
        alternatives: processedAlternatives,
      })
    } catch (error) {
      console.error("상호작용 확인 실패:", error)
      alert(error.message || "상호작용 확인 중 오류가 발생했습니다.")
      setInteractionResults(null)
    } finally {
      setIsCheckingInteraction(false)
    }
  }

  // 대체 약품 추가 처리
  const handleAddAlternative = (alternative) => {
    if (medications.some((med) => med.item_seq === alternative.item_seq)) {
      alert("이미 추가된 약품입니다.")
      return
    }

    const medicationToAdd = {
      item_seq: alternative.item_seq,
      item_name: alternative.item_name,
      entp_name: alternative.manufacturer,
      ingredient: alternative.ingredient,
    }

    addMedication(medicationToAdd)
  }

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>약품 상호작용 확인</h1>
        </header>

        <div className="content-body">
          <div className="card">
            <div className="card-header">
              <h3>약품 상호작용 확인</h3>
            </div>
            <div className="card-body">
              <p className="info-text">현재 복용 중인 약품과 새로 복용하려는 약품 간의 상호작용을 확인하세요.</p>

              <div className="interaction-form">
                <div className="form-section">
                  <h4>현재 복용 중인 약품</h4>
                  <div className="current-medications">
                    {medications.length === 0 ? (
                      <p className="no-data">등록된 복용약이 없습니다. 대시보드에서 복용약을 추가해주세요.</p>
                    ) : (
                      medications.map((medication) => (
                        <div className="medication-tag" key={medication.item_seq}>
                          <span>{medication.item_name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>확인하려는 약품</h4>
                  <div className="search-container">
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="search-input"
                      placeholder="약품명을 입력하세요"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onFocus={() => {
                        if (searchKeyword.trim().length >= 2 && searchResults.length > 0) {
                          setShowSearchResults(true)
                        }
                      }}
                      disabled={isLoading}
                    />
                    {isSearching && <span className="search-spinner"></span>}

                    {showSearchResults && searchResults.length > 0 && (
                      <div className="search-results" ref={searchResultsRef}>
                        <ul>
                          {searchResults.map((medication) => (
                            <li key={medication.item_seq}>
                              <button
                                onClick={() => handleSelectMedication(medication)}
                                disabled={medications.some((med) => med.item_seq === medication.item_seq)}
                              >
                                <span className="medication-name">{medication.item_name}</span>
                                <span className="medication-company">{medication.entp_name}</span>
                                <span className="medication-seq" style={{ fontSize: "0.7em", color: "#888" }}>
                                  코드: {medication.item_seq}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {interactionMedication && (
                    <div className="selected-check-medication">
                      <div className="medication-tag">
                        <span>{interactionMedication.item_name}</span>
                        <button type="button" className="tag-remove" onClick={() => clearInteractionDrug()}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn primary-btn full-width"
                    onClick={handleCheckInteraction}
                    disabled={isCheckingInteraction || !interactionMedication || medications.length === 0}
                  >
                    {isCheckingInteraction ? "확인 중..." : "상호작용 확인하기"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 상호작용 결과 */}
          {interactionResults && (
            <div className="card interaction-results">
              <div className="card-header">
                <h3>상호작용 결과</h3>
              </div>
              <div className="card-body">
                <div className="interaction-summary" style={{ backgroundColor: interactionResults.summary.bgColor }}>
                  <div className="interaction-icon" style={{ color: interactionResults.summary.color }}>
                    <i className={`fas ${interactionResults.summary.icon}`}></i>
                  </div>
                  <div className="interaction-text">
                    <h4 style={{ color: interactionResults.summary.color }}>{interactionResults.summary.level}</h4>
                    <p>{interactionResults.summary.message}</p>
                  </div>
                </div>

                {interactionResults.interactions.length > 0 && (
                  <div className="interaction-details">
                    <h4>상세 정보</h4>
                    {interactionResults.interactions.map((interaction, index) => (
                      <div className="interaction-item" key={index}>
                        <div className="interaction-header">
                          <h5>
                            {interaction.medication1} + {interaction.medication2}
                          </h5>
                          <span
                            className={`interaction-level ${interaction.severity}`}
                            style={{
                              backgroundColor: interaction.bgColor,
                              color: interaction.color,
                            }}
                          >
                            {interaction.level}
                          </span>
                        </div>
                        <div className="interaction-content">
                          <p>{interaction.description}</p>
                          <p>
                            <strong>권장사항:</strong> {interaction.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {interactionResults.alternatives && interactionResults.alternatives.length > 0 && (
                  <div className="alternative-medications">
                    <h4>대체 약품 추천</h4>
                    <p>더 안전한 대안 약품입니다:</p>
                    <div className="alternative-list">
                      {interactionResults.alternatives.map((alternative, index) => {
                        const isAlreadyAdded = medications.some((med) => med.item_seq === alternative.item_seq)

                        return (
                          <div className="alternative-item" key={`${alternative.item_seq}-${index}`}>
                            <div className="alternative-info">
                              <h5>{alternative.item_name}</h5>
                              <p>
                                <strong>성분명:</strong> {alternative.ingredient}
                              </p>
                              <p>
                                <strong>제조사:</strong> {alternative.manufacturer}
                              </p>
                              <p className="medication-code">
                                <strong>약품코드:</strong> {alternative.item_seq}
                              </p>
                            </div>
                            <div className="alternative-actions">
                              <button
                                className={`btn ${isAlreadyAdded ? "disabled-btn" : "add-btn"}`}
                                onClick={() => handleAddAlternative(alternative)}
                                disabled={isAlreadyAdded}
                              >
                                {isAlreadyAdded ? "이미 추가됨" : "복용약에 추가"}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {interactionResults.alternatives && interactionResults.alternatives.length === 0 && (
                  <div className="no-alternatives">
                    <h4>대체 약품</h4>
                    <p>현재 추천할 수 있는 대체 약품이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default InteractionCheck
