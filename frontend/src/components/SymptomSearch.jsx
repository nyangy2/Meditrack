// components/SymptomSearch.jsx
import { useRef, useEffect, useState } from "react"
import { useSymptom } from "../context/symptom-context" // 경로 수정
import axios from "axios"

function SymptomSearchInput({ popularSymptoms = [] }) {
  const {
    symptomKeyword,
    setSymptomKeyword,
    searchResults,
    isSearching,
    selectedSymptoms,
    selectSymptom,
    removeSymptom,
    searchSymptoms, // 직접 검색 함수 사용
  } = useSymptom()

  const [recommendedMedications, setRecommendedMedications] = useState([])
  const [isLoadingMedications, setIsLoadingMedications] = useState(false)
  const [medicationError, setMedicationError] = useState(null)

  const searchResultsRef = useRef(null)
  const inputRef = useRef(null)

  // 검색 결과 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        // 검색 결과 닫기 (검색어는 유지)
        if (searchResults.length > 0) {
          setSymptomKeyword(symptomKeyword)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [searchResults, symptomKeyword, setSymptomKeyword])

  // 검색 버튼 클릭 또는 폼 제출 시 처리
  const handleSubmit = (e) => {
    e.preventDefault()
    if (symptomKeyword.trim()) {
      // 직접 검색 함수 호출
      searchSymptoms(symptomKeyword)
    }
  }

  // 인기 증상 클릭 처리
  const handlePopularSymptomClick = (symptom) => {
    const symptomText = typeof symptom === "string" ? symptom : symptom.name
    selectSymptom(symptomText)
  }

  // 약품 추천 요청
  const getRecommendedMedications = async () => {
    if (selectedSymptoms.length === 0) {
      setMedicationError("선택된 증상이 없습니다.")
      return
    }

    setIsLoadingMedications(true)
    setMedicationError(null)
    setRecommendedMedications([])

    const token = localStorage.getItem("token")
    if (!token) {
      setMedicationError("로그인이 필요합니다.")
      setIsLoadingMedications(false)
      return
    }

    // 선택된 증상들을 쉼표로 구분된 문자열로 변환
    const symptomsString = selectedSymptoms
      .map((symptom) => (typeof symptom === "string" ? symptom : symptom.name))
      .join(", ")

    try {
      const response = await axios.post(
        "http://13.209.5.228:8000/symptoms/search",
        {
          symptoms: [symptomsString],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data && Array.isArray(response.data)) {
        setRecommendedMedications(response.data)
      } else if (response.data && response.data.code === "COMMON200" && response.data.result) {
        setRecommendedMedications(response.data.result)
      } else {
        console.error("예상치 못한 API 응답 구조:", response.data)
        setMedicationError("약품 추천을 가져오는데 실패했습니다.")
      }
    } catch (error) {
      console.error("약품 추천 요청 실패:", error)
      setMedicationError(
        error.response?.data?.message || error.message || "약품 추천을 가져오는데 오류가 발생했습니다.",
      )
    } finally {
      setIsLoadingMedications(false)
    }
  }

  return (
    <div className="symptom-search-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            value={symptomKeyword}
            onChange={(e) => setSymptomKeyword(e.target.value)}
            placeholder="증상을 입력하세요 (예: 두통, 기침)"
            className="search-input"
            id="symptom-input"
          />
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <ul className="search-suggestions" ref={searchResultsRef}>
            {searchResults.map((symptom, index) => (
              <li
                key={symptom.id || index}
                onClick={() => selectSymptom(symptom.name || symptom)}
                className="search-suggestion-item"
              >
                {symptom.name || symptom}
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* 자주 검색되는 증상 */}
      {popularSymptoms.length > 0 && (
        <div className="common-symptoms">
          <h4>자주 검색되는 증상</h4>
          <div className="symptom-tags popular-tags">
            {popularSymptoms.map((symptom, idx) => (
              <button
                key={idx}
                type="button"
                className="symptom-tag popular-tag"
                onClick={() => handlePopularSymptomClick(symptom)}
              >
                {typeof symptom === "string" ? symptom : symptom.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 증상 표시 */}
      {selectedSymptoms.length > 0 && (
        <div className="selected-symptoms">
          <h4>선택된 증상</h4>
          <div className="symptom-tags">
            {selectedSymptoms.map((symptom, index) => (
              <div key={index} className="symptom-tag">
                <span>{typeof symptom === "string" ? symptom : symptom.name}</span>
                <button
                  onClick={() => removeSymptom(typeof symptom === "string" ? symptom : symptom.name)}
                  className="remove-symptom"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="symptom-actions">
            <button
              type="button"
              className="btn primary-btn recommend-btn"
              onClick={getRecommendedMedications}
              disabled={isLoadingMedications || selectedSymptoms.length === 0}
            >
              {isLoadingMedications ? <span className="loading-spinner"></span> : "약품 추천 받기"}
            </button>
          </div>
        </div>
      )}

      {/* 추천 약품 표시 */}
      {(recommendedMedications.length > 0 || medicationError || isLoadingMedications) && (
        <div className="recommended-medications">
          <h4>추천 약품</h4>

          {isLoadingMedications && (
            <div className="loading-container">
              <span className="loading-spinner"></span>
              <span>약품 추천 중...</span>
            </div>
          )}

          {medicationError && <div className="error-message">{medicationError}</div>}

          {!isLoadingMedications && !medicationError && recommendedMedications.length > 0 && (
            <div className="medication-list">
              {recommendedMedications.map((medication, index) => (
                <div key={medication.drug_id || index} className="medication-card">
                  <div className="medication-info">
                    <h4>{medication.drug_name}</h4>
                    <p className="medication-company">{medication.entp_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingMedications && !medicationError && recommendedMedications.length === 0 && (
            <p className="no-data">추천 약품이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SymptomSearchInput
