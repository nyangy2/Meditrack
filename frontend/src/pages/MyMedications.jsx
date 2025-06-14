import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import "../styles/my-medications.css"
import CustomAlert from "./custom-alert"
import { useMedication } from "../context/medication-context"
import { Info, Clock } from "lucide-react"

function MyMedications() {
  // 약품 관련 컨텍스트에서 가져오기
  const {
    medications,
    searchKeyword,
    searchResults,
    isSearching,
    showSearchResults,
    setSearchKeyword,
    setShowSearchResults,
    addMedication,
    deleteMedication,
  } = useMedication()

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
    itemId: null,
  })

  const searchInputRef = useRef(null)
  const searchResultsRef = useRef(null)

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

  // 복용약 추가하기
  const handleAddMedication = (medication) => {
    addMedication(medication)
  }

  // 삭제 확인 다이얼로그 열기
  const openDeleteConfirm = (itemId) => {
    setAlertState({
      isOpen: true,
      title: "복용약 삭제",
      message: "정말 이 복용약을 삭제하시겠습니까?",
      itemId: itemId,
    })
  }

  // 복용약 삭제하기
  const handleDelete = () => {
    const { itemId } = alertState
    if (!itemId) return

    deleteMedication(itemId)
    setAlertState({ ...alertState, isOpen: false })
  }

  // 약품 상세 정보 보기
  const handleShowDetail = (medication) => {
    setSelectedMedication(medication)
    setShowDetail(true)
  }

  // 상세 정보 모달 닫기
  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  // 시간대별 복용 예정 약품 생성
  const getScheduledMedications = (timeSlot) => {
    return medications
      .filter((med) => !med[timeSlot]) // 아직 복용하지 않은 약품만
      .map((med) => med.item_name)
      .slice(0, 3) // 최대 3개까지만 표시
  }

  const morningMeds = getScheduledMedications("morning")
  const afternoonMeds = getScheduledMedications("afternoon")
  const eveningMeds = getScheduledMedications("evening")

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>내 약품</h1>
        </header>

        <div className="content-body">
          {/* 약품 검색 섹션 */}
          <div className="card">
            <div className="card-header">
              <h3>약품 검색</h3>
            </div>
            <div className="card-body">
              <div className="medication-search">
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="복용 중인 약물을 검색하세요..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onFocus={() => searchKeyword.length >= 2 && setShowSearchResults(true)}
                    disabled={isLoading}
                  />
                  {isSearching && <span className="search-spinner"></span>}

                  {/* 검색 결과 드롭다운 */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results" ref={searchResultsRef}>
                      <ul>
                        {searchResults.map((medication) => (
                          <li key={medication.item_seq}>
                            <button
                              onClick={() => handleAddMedication(medication)}
                              disabled={medications.some((med) => med.item_seq === medication.item_seq)}
                            >
                              <span className="medication-name">{medication.item_name}</span>
                              <span className="medication-company">{medication.entp_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="search-hint">2글자 이상 입력하면 자동으로 검색됩니다</p>
              </div>
            </div>
          </div>

          {/* 복용약 목록 섹션 */}
          <div className="card">
            <div className="card-header">
              <h3>현재 복용 중인 약물</h3>
              <div className="card-actions">
                <Link to="/lens" className="btn outline-btn">
                  <i className="fas fa-camera"></i> 약품 스캔
                </Link>
                <Link to="/interaction-check" className="btn outline-btn">
                  <i className="fas fa-exchange-alt"></i> 상호작용 확인
                </Link>
              </div>
            </div>
            <div className="card-body">
              {medications.length === 0 && !isLoading ? (
                <div className="empty-state">
                  <p className="no-data">등록된 복용약이 없습니다.</p>
                  <p>약품을 검색하거나 약품 스캔을 통해 복용약을 추가해보세요.</p>
                </div>
              ) : (
                <div className="medications-grid">
                  {medications.map((medication) => (
                    <div className="medication-card" key={medication.item_seq}>
                      <div className="medication-info">
                        <h4>{medication.item_name}</h4>
                        <p className="medication-company">{medication.entp_name}</p>
                      </div>
                      <div className="medication-actions">
                        <button className="btn icon-btn" onClick={() => handleShowDetail(medication)}>
                          <Info size={18} />
                        </button>
                        <button
                          className="btn icon-btn delete-btn"
                          onClick={() => openDeleteConfirm(medication.item_seq)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 복용 일정 섹션 */}
          <div className="card">
            <div className="card-header">
              <h3>복용 일정</h3>
              <Link to="/medication-reminders" className="card-link">
                일정 관리
              </Link>
            </div>
            <div className="card-body">
              {medications.length === 0 ? (
                <div className="schedule-summary">
                  <p className="no-data">등록된 복용약이 없습니다.</p>
                </div>
              ) : (
                <div className="schedule-summary">
                  <div className="schedule-item">
                    <div className="schedule-icon morning">
                      <Clock size={20} />
                    </div>
                    <div className="schedule-content">
                      <h4>아침</h4>
                      <p>{morningMeds.length > 0 ? morningMeds.join(", ") : "복용 완료"}</p>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <div className="schedule-icon noon">
                      <Clock size={20} />
                    </div>
                    <div className="schedule-content">
                      <h4>점심</h4>
                      <p>{afternoonMeds.length > 0 ? afternoonMeds.join(", ") : "복용 완료"}</p>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <div className="schedule-icon evening">
                      <Clock size={20} />
                    </div>
                    <div className="schedule-content">
                      <h4>저녁</h4>
                      <p>{eveningMeds.length > 0 ? eveningMeds.join(", ") : "복용 완료"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 약품 상세 정보 모달 */}
      {showDetail && selectedMedication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{selectedMedication.item_name}</h3>
              <button className="modal-close" onClick={handleCloseDetail}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="medication-detail">
                <div className="detail-section">
                  <h4>제조사</h4>
                  <p>{selectedMedication.entp_name}</p>
                </div>
                {selectedMedication.efficacy && (
                  <div className="detail-section">
                    <h4>효능·효과</h4>
                    <p>{selectedMedication.efficacy}</p>
                  </div>
                )}
                {selectedMedication.use_method && (
                  <div className="detail-section">
                    <h4>용법·용량</h4>
                    <p>{selectedMedication.use_method}</p>
                  </div>
                )}
                {selectedMedication.warning && (
                  <div className="detail-section">
                    <h4>경고</h4>
                    <p>{selectedMedication.warning}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline-btn" onClick={handleCloseDetail}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MyMedications
