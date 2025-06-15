import { createContext, useContext, useState, useEffect } from "react"
import api from "../api" // api.js에서 axios 인스턴스 가져오기

// 컨텍스트 생성
const MedicationContext = createContext(null)

// 컨텍스트 훅
export function useMedication() {
  const context = useContext(MedicationContext)
  if (!context) {
    throw new Error("useMedication must be used within a MedicationProvider")
  }
  return context
}

// 프로바이더 컴포넌트
export function MedicationProvider({ children }) {
  // 복용약 관련 상태
  const [medications, setMedications] = useState([]) // 사용자의 현재 복용약 목록 (morning, afternoon, evening 포함)
  const [searchKeyword, setSearchKeyword] = useState("") // 약물 검색어
  const [searchResults, setSearchResults] = useState([]) // 검색 결과
  const [isSearching, setIsSearching] = useState(false) // 검색 중 여부
  const [showSearchResults, setShowSearchResults] = useState(false) // 검색 결과 표시 여부
  const [isLoading, setIsLoading] = useState(false) // 로딩 상태
  const [interactionMedication, setInteractionMedication] = useState(null) // 상호작용 확인용 약품

  // 상호작용 레벨별 설정
  const getInteractionLevelInfo = (level) => {
    const levelMap = {
      "안전": {
        severity: "safe",
        color: "#16a34a",
        bgColor: "#f0fdf4",
        icon: "fa-check-circle",
        priority: 1,
        message: "안전하게 함께 복용 가능합니다."
      },
      "주의": {
        severity: "warning", 
        color: "#f59e0b",
        bgColor: "#fffbeb",
        icon: "fa-exclamation-triangle",
        priority: 2,
        message: "주의하여 복용하세요. 의사나 약사와 상담을 권장합니다."
      },
      "중복성분": {
        severity: "duplicate",
        color: "#eab308", 
        bgColor: "#fefce8",
        icon: "fa-copy",
        priority: 3,
        message: "동일 성분이 중복됩니다. 과다 복용 위험이 있으니 주의하세요."
      },
      "병용금기": {
        severity: "contraindicated",
        color: "#dc2626",
        bgColor: "#fef2f2", 
        icon: "fa-ban",
        priority: 4,
        message: "함께 복용하면 안 됩니다. 즉시 의사와 상담하세요."
      }
    }
    
    return levelMap[level] || levelMap["안전"]
  }

  // 로컬 스토리지에서 복용 상태 불러오기
  const loadMedicationSchedules = () => {
    try {
      const saved = localStorage.getItem("medicationSchedules")
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error("복용 상태 불러오기 실패:", error)
      return {}
    }
  }

  // 로컬 스토리지에 복용 상태 저장하기
  const saveMedicationSchedules = (schedules) => {
    try {
      localStorage.setItem("medicationSchedules", JSON.stringify(schedules))
    } catch (error) {
      console.error("복용 상태 저장 실패:", error)
    }
  }

  // 컴포넌트가 마운트될 때 토큰 설정 및 복용약 가져오기
  useEffect(() => {
    // localStorage에서 토큰 가져와서 API 인스턴스에 설정
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchMedications() // 토큰이 있을 때만 데이터 가져오기
    }
  }, [])

  // 검색어 입력 시 자동완성 결과 가져오기
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKeyword.trim().length >= 2) {
        searchMedications(searchKeyword)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchKeyword])

  // 복용약 가져오기
  const fetchMedications = () => {
    setIsLoading(true)
    api
      .get("/user_health/drugs")
      .then((res) => {
        console.log("=== 백엔드 API 응답 분석 ===")
        console.log("전체 응답:", res)
        console.log("응답 데이터:", res.data)
        console.log("데이터 타입:", typeof res.data)
        console.log("배열인가?", Array.isArray(res.data))

        if (res.data && res.data.length > 0) {
          console.log("첫 번째 약물 데이터:", res.data[0])
          console.log("첫 번째 약물의 키들:", Object.keys(res.data[0]))

          // 각 약물의 시간대 필드 확인
          res.data.forEach((medication, index) => {
            console.log(`약물 ${index + 1} (${medication.item_name || "Unknown"}):`)
            console.log(`  - morning: ${medication.morning} (타입: ${typeof medication.morning})`)
            console.log(`  - afternoon: ${medication.afternoon} (타입: ${typeof medication.afternoon})`)
            console.log(`  - evening: ${medication.evening} (타입: ${typeof medication.evening})`)
            console.log(`  - 전체 객체:`, medication)
          })
        }

        // 로컬 스토리지에서 복용 상태 불러오기
        const savedSchedules = loadMedicationSchedules()

        // 백엔드에서 받은 데이터와 로컬 상태 병합
        const medicationsWithSchedule = res.data.map((medication) => {
          const medicationId = medication.item_seq
          const savedSchedule = savedSchedules[medicationId] || {}

          // 백엔드에서 온 값이 있으면 사용, 없으면 로컬 저장값 사용, 그것도 없으면 false
          const processedMedication = {
            ...medication,
            morning:
              medication.morning !== undefined
                ? Boolean(medication.morning)
                : savedSchedule.morning !== undefined
                  ? savedSchedule.morning
                  : false,
            afternoon:
              medication.afternoon !== undefined
                ? Boolean(medication.afternoon)
                : savedSchedule.afternoon !== undefined
                  ? savedSchedule.afternoon
                  : false,
            evening:
              medication.evening !== undefined
                ? Boolean(medication.evening)
                : savedSchedule.evening !== undefined
                  ? savedSchedule.evening
                  : false,
          }

          console.log(`처리된 약물 ${processedMedication.item_name}:`, {
            original_morning: medication.morning,
            saved_morning: savedSchedule.morning,
            final_morning: processedMedication.morning,
            original_afternoon: medication.afternoon,
            saved_afternoon: savedSchedule.afternoon,
            final_afternoon: processedMedication.afternoon,
            original_evening: medication.evening,
            saved_evening: savedSchedule.evening,
            final_evening: processedMedication.evening,
          })

          return processedMedication
        })

        console.log("최종 처리된 복용약 목록:", medicationsWithSchedule)
        setMedications(medicationsWithSchedule)
      })
      .catch((err) => {
        console.error("복용약 불러오기 실패:", err)
        if (err.response) {
          console.error("응답 상태:", err.response.status)
          console.error("응답 데이터:", err.response.data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 복용약 검색하기
  const searchMedications = (keyword) => {
    if (keyword.trim().length < 2) return

    setIsSearching(true)
    api
      .get(`/user_health/drugs/search?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => {
        console.log("약물 검색 결과:", res.data)
        setSearchResults(res.data)
        // 검색 결과가 있을 때만 드롭다운 표시
        if (res.data && res.data.length > 0) {
          setShowSearchResults(true)
        }
      })
      .catch((err) => {
        console.error("약물 검색 실패:", err.response ? err.response.data : err)
        setSearchResults([])
        setShowSearchResults(false)
      })
      .finally(() => {
        setIsSearching(false)
      })
  }

  // 복용약 추가하기
  const addMedication = (medication) => {
    // 이미 추가된 약물인지 확인
    if (medications.some((med) => med.item_seq === medication.item_seq)) {
      setShowSearchResults(false)
      return
    }

    setIsLoading(true)
    api
      .post("/user_health/drugs", {
        item_seq: medication.item_seq, // 백엔드로 item_seq 전송
        // 필요한 경우 UI 표시용 데이터도 함께 전송
        item_name: medication.item_name,
      })
      .then((response) => {
        console.log("약물 추가 응답:", response.data)

        // 새로 추가된 약품은 기본적으로 모든 시간대가 false
        const newMedication = {
          ...medication,
          morning: false,
          afternoon: false,
          evening: false,
        }
        setMedications((prev) => [...prev, newMedication])
        setSearchKeyword("")
        setShowSearchResults(false)
      })
      .catch((err) => {
        console.error("약물 추가 실패:", err.response ? err.response.data : err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 복용약 삭제하기
  const deleteMedication = (itemId) => {
    setIsLoading(true)
    api
      .delete(`/user_health/drugs/${itemId}`)
      .then(() => {
        setMedications((prev) => prev.filter((med) => med.item_seq !== itemId))

        // 로컬 스토리지에서도 해당 약물의 복용 상태 제거
        const savedSchedules = loadMedicationSchedules()
        delete savedSchedules[itemId]
        saveMedicationSchedules(savedSchedules)
      })
      .catch((err) => {
        console.error("복용약 삭제 실패:", err.response ? err.response.data : err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 복용 상태 업데이트
  const updateMedicationSchedule = (medicationId, timeSlot, status) => {
    console.log(`=== 복용 상태 업데이트 시작 ===`)
    console.log(`약물 ID: ${medicationId}`)
    console.log(`시간대: ${timeSlot}`)
    console.log(`상태: ${status}`)

    setIsLoading(true)

    const updateData = {
      [timeSlot]: status,
    }

    console.log("전송할 데이터:", updateData)

    // 백엔드 API 호출
    api
      .patch(`/user_health/drugs/${medicationId}`, updateData)
      .then((response) => {
        console.log("PATCH 응답:", response.data)

        // 로컬 상태 업데이트
        setMedications((prev) =>
          prev.map((med) => {
            if (med.item_seq === medicationId) {
              const updatedMed = { ...med, [timeSlot]: status }
              console.log(`약물 ${med.item_name} 상태 업데이트:`, updatedMed)
              return updatedMed
            }
            return med
          }),
        )

        // 로컬 스토리지에도 저장
        const savedSchedules = loadMedicationSchedules()
        if (!savedSchedules[medicationId]) {
          savedSchedules[medicationId] = {}
        }
        savedSchedules[medicationId][timeSlot] = status
        saveMedicationSchedules(savedSchedules)

        console.log(`약품 ${medicationId}의 ${timeSlot} 상태가 ${status}로 업데이트됨`)
      })
      .catch((err) => {
        console.error("복용 상태 업데이트 실패:", err)
        if (err.response) {
          console.error("응답 상태:", err.response.status)
          console.error("응답 데이터:", err.response.data)
        }
        // 에러 발생 시 사용자에게 알림
        throw new Error("복용 상태 업데이트에 실패했습니다.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 오늘의 진행률 계산
  const getTodayProgress = () => {
    if (medications.length === 0) return { completed: 0, total: 0, percentage: 0 }

    const totalSlots = medications.length * 3 // 각 약품당 3개 시간대
    const completedSlots = medications.reduce((acc, med) => {
      return acc + (med.morning ? 1 : 0) + (med.afternoon ? 1 : 0) + (med.evening ? 1 : 0)
    }, 0)

    return {
      completed: completedSlots,
      total: totalSlots,
      percentage: totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0,
    }
  }

  // 상호작용 확인용 약품 설정
  const setInteractionDrug = (medication) => {
    setInteractionMedication(medication)
  }

  // 상호작용 확인용 약품 초기화
  const clearInteractionDrug = () => {
    setInteractionMedication(null)
  }

  // 약품 상호작용 확인
  const checkInteractions = async () => {
    if (!interactionMedication || medications.length === 0) return null

    setIsLoading(true)
    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.")
      }

      // 실제 API 호출 - POST 요청으로 변경
      const response = await fetch(`http://13.209.5.228:8000/medications/check-interaction`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 인증 토큰 추가
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

      // JSON 응답 처리
      const data = await response.json()
      console.log("API 응답 데이터:", data)

      // 상호작용 레벨별 우선순위 확인
      const interactions = data.interactions || []
      const hasHighRiskInteraction = interactions.some(interaction => 
        ["병용금기", "중복성분", "주의"].includes(interaction.level)
      )

      // 가장 높은 위험도 레벨 찾기
      const highestRiskLevel = interactions.reduce((highest, interaction) => {
        const currentInfo = getInteractionLevelInfo(interaction.level)
        const highestInfo = getInteractionLevelInfo(highest)
        return currentInfo.priority > highestInfo.priority ? interaction.level : highest
      }, "안전")

      const highestRiskInfo = getInteractionLevelInfo(highestRiskLevel)

      setIsLoading(false)
      return {
        summary: {
          hasWarning: hasHighRiskInteraction,
          level: highestRiskLevel,
          message: hasHighRiskInteraction
            ? `${interactionMedication.item_name}과(와) 현재 복용 중인 약품 사이에 ${highestRiskLevel} 수준의 상호작용이 있습니다.`
            : "모든 약품이 안전하게 함께 복용 가능합니다.",
          color: highestRiskInfo.color,
          bgColor: highestRiskInfo.bgColor,
          icon: highestRiskInfo.icon
        },
        interactions: interactions.map((interaction) => {
          const levelInfo = getInteractionLevelInfo(interaction.level)
          return {
            medication1: interactionMedication.item_name,
            medication2: interaction.with,
            level: interaction.level,
            severity: levelInfo.severity,
            description: interaction.description,
            recommendation: levelInfo.message,
            color: levelInfo.color,
            bgColor: levelInfo.bgColor,
            icon: levelInfo.icon
          }
        }),
        alternatives: data.alternative_ingredients || [],
      }
    } catch (error) {
      console.error("상호작용 확인 실패:", error)
      setIsLoading(false)
      return null
    }
  }

  const value = {
    medications,
    searchKeyword,
    searchResults,
    isSearching,
    showSearchResults,
    isLoading,
    interactionMedication,
    setSearchKeyword,
    setShowSearchResults,
    fetchMedications,
    searchMedications,
    addMedication,
    deleteMedication,
    updateMedicationSchedule,
    getTodayProgress,
    setInteractionDrug,
    clearInteractionDrug,
    checkInteractions,
    getInteractionLevelInfo,
  }

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>
}
