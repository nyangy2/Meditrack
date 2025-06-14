// context/symptom-context.jsx
import { createContext, useContext, useState, useEffect } from "react"
import api from "../api" // axios 인스턴스

const SymptomContext = createContext(null)

export function useSymptom() {
  const context = useContext(SymptomContext)
  if (!context) {
    throw new Error("useSymptom must be used within a SymptomProvider")
  }
  return context
}

export function SymptomProvider({ children }) {
  const [symptomKeyword, setSymptomKeyword] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSymptoms, setSelectedSymptoms] = useState([])

  // 자동 검색 기능 (타이핑 시)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (symptomKeyword.trim().length >= 1) {
        searchSymptoms(symptomKeyword)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delay)
  }, [symptomKeyword])

  // 증상 검색 함수 - 외부에서도 직접 호출 가능하도록 export
  const searchSymptoms = (keyword) => {
    if (!keyword.trim()) return

    setIsSearching(true)

    // 토큰 확인
    const token = localStorage.getItem("token")
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    api
      .get(`/symptoms/search?keyword=${encodeURIComponent(keyword)}`, { headers })
      .then((res) => {
        // API 응답 구조에 따라 데이터 추출
        // 일반적인 응답 구조인 경우
        if (res.data && Array.isArray(res.data)) {
          setSearchResults(res.data)
        }
        // 특정 응답 구조인 경우 (code와 result 포함)
        else if (res.data && res.data.code === "COMMON200") {
          setSearchResults(res.data.result || [])
        }
        // 다른 응답 구조인 경우
        else if (res.data && res.data.results) {
          setSearchResults(res.data.results)
        }
        // 기타 경우
        else {
          console.error("예상치 못한 API 응답 구조:", res.data)
          setSearchResults([])
        }
      })
      .catch((err) => {
        console.error("증상 검색 실패:", err.response ? err.response.data : err)
        setSearchResults([])
      })
      .finally(() => {
        setIsSearching(false)
      })
  }

  // 증상 선택 처리
  const selectSymptom = (symptom) => {
    // 이미 선택된 증상인지 확인 (문자열 비교)
    if (
      !selectedSymptoms.some(
        (item) => (typeof item === "string" && item === symptom) || (typeof item === "object" && item.name === symptom),
      )
    ) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
    setSymptomKeyword("") // 검색어 초기화
    setSearchResults([]) // 검색 결과 초기화
  }

  // 선택된 증상 제거
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(
      selectedSymptoms.filter((item) => {
        if (typeof item === "string" && typeof symptom === "string") {
          return item !== symptom
        } else if (typeof item === "object" && typeof symptom === "string") {
          return item.name !== symptom
        } else if (typeof item === "string" && typeof symptom === "object") {
          return item !== symptom.name
        } else {
          return item.name !== symptom.name
        }
      }),
    )
  }

  // 모든 선택된 증상 초기화
  const clearSymptoms = () => {
    setSelectedSymptoms([])
  }

  // 인기 증상 선택
  const selectPopularSymptom = (symptom) => {
    selectSymptom(symptom)
  }

  const value = {
    symptomKeyword,
    setSymptomKeyword,
    searchResults,
    isSearching,
    selectedSymptoms,
    selectSymptom,
    removeSymptom,
    clearSymptoms,
    selectPopularSymptom,
    searchSymptoms, // 검색 함수 export
  }

  return <SymptomContext.Provider value={value}>{children}</SymptomContext.Provider>
}
