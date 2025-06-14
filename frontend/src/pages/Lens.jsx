"use client"

import { useEffect, useState, useRef } from "react"
import "../styles/lens.css"
import { Search, Upload, Camera, Clipboard, ImageIcon, Check, X } from 'lucide-react'
import { useMedication } from "../context/medication-context"
import { useMobile } from "../hooks/use-mobile"

function Lens() {
  const { addMedication } = useMedication()
  const isMobile = useMobile()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // 토스트 알림 상태
  const [toasts, setToasts] = useState([])

  // 이미지 업로드 및 스캔 관련 상태
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState([])
  const [scanError, setScanError] = useState(null)

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const scanPreviewRef = useRef(null)

  // 토스트 알림 추가 함수
  const addToast = (message, type = "success") => {
    const id = Date.now()
    const newToast = { id, message, type }
    setToasts((prev) => [...prev, newToast])

    // 3초 후 자동 제거
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  // 토스트 알림 제거 함수
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    // 이미지 선택 취소 시 미리보기 초기화
    if (!selectedImage) {
      setPreviewUrl(null)
    }

    // 클립보드 붙여넣기 이벤트 리스너 (PC 전용)
    if (!isMobile) {
      const handlePaste = (e) => {
        // 스캔 미리보기 영역이 포커스되어 있을 때만 처리
        if (document.activeElement === scanPreviewRef.current) {
          const items = e.clipboardData.items

          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              const blob = items[i].getAsFile()
              handleImageFile(blob)
              break
            }
          }
        }
      }

      window.addEventListener("paste", handlePaste)
      return () => window.removeEventListener("paste", handlePaste)
    }
  }, [selectedImage, isMobile])

  // 약품 검색 함수 (백엔드 연동 예시)
  const searchMedication = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)

    try {
      // 실제 구현 시 백엔드 API 호출로 대체
      // const response = await fetch(`/api/medications/search?query=${searchTerm}`);
      // const data = await response.json();

      // 임시 데이터 (백엔드 연동 전 테스트용)
      setTimeout(() => {
        const mockData = [
          {
            product_name: "타이레놀콜드-에스정",
            manufacturer: "한국존슨앤드존슨판매(유)",
            efficacy:
              "이 약은 감기의 제증상(여러증상)(콧물, 코막힘, 재채기, 인후(목구멍)통, 기침, 오한(춥고 떨리는 증상), 발열, 두통, 관절통, 근육통)의 완화에 사용합니다.\n",
            use_method: "만 15세 이상은 1회 1정씩, 1일 3회 식후 30분에 복용합니다.\n",
            warning:
              "매일 세 잔 이상 정기적 음주자가 이 약 또는 다른 해열진통제를 복용할 때는 의사 또는 약사와 상의하십시오. 간손상을 일으킬 수 있습니다...\n",
            caution: "이 약에 과민증 또는 경험자, 다른 해열진통제, 감기약 복용 시 ...\n",
            interaction:
              "MAO 억제제(항우울제, 항정신병제, 감정조절제, 항파킨슨제 등), 진해거담제(기침·가래약), 다른 감기약, 해열진통제....\n",
            side_effect: "발진·발적(충혈되어 붉어짐), 가려움...\n",
            storage_method: "습기와 빛을 피해 실온에서 보관하십시오.\n\n어린이의 손이 닿지 않는 곳에 보관하십시오.\n",
            image: "https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1OKRXo9l4Df",
            open_date: "2023-06-12 00:00:00",
          },
          {
            product_name: "타이레놀8시간이알서방정(아세트아미노펜)",
            manufacturer: "한국존슨앤드존슨판매(유)",
            efficacy:
              "이 약은 해열 및 감기에 의한 동통(통증)과 두통, 치통, 근육통, 허리통증, 생리통, 관절통의 완화에 사용합니다.\n",
            use_method: "12세 이상의 소아와 성인은 1회 2정을 매 8시간마다 복용....\n",
            warning: "매일 세잔 이상 정기적 음주자가 이 약...\n",
            caution: "이 약에 과민증, 소화성궤양, 심한 혈액 이상 환자....\n",
            interaction: "와파린, 플루클록사실린을 복용하는 환자는 의사 또는 약사와 상의하십시오.\n",
            side_effect: "쇽 증상...\n",
            storage_method: "실온에서 보관하십시오. 어린이의 손이 닿지 않는 곳에 보관하십시오.\n",
            image: "https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1OKRXo9l4DN",
            open_date: "2023-02-15 00:00:00",
          },
        ].filter((med) => med.product_name.includes(searchTerm))

        setSearchResults(mockData)
        setIsSearching(false)
      }, 500)
    } catch (error) {
      console.error("약품 검색 중 오류 발생:", error)
      setIsSearching(false)
    }
  }

  // 이미지 파일 처리 함수
  const handleImageFile = (file) => {
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setScanResults([]) // 새 이미지 선택 시 이전 스캔 결과 초기화
      setScanError(null)
    }
  }

  // 일반 이미지 선택 핸들러
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    handleImageFile(file)
  }

  // 카메라 촬영 핸들러 (모바일)
  const handleCameraCapture = (e) => {
    const file = e.target.files[0]
    handleImageFile(file)
  }

  // 이미지 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  // 카메라 버튼 클릭 핸들러 (모바일)
  const handleCameraClick = () => {
    cameraInputRef.current.click()
  }

  // 클립보드에서 붙여넣기 핸들러 (PC)
  const handlePasteClick = () => {
    // 스캔 미리보기 영역에 포커스를 주어 붙여넣기 이벤트를 받을 수 있게 함
    scanPreviewRef.current.focus()
    addToast("Ctrl+V를 눌러 클립보드의 이미지를 붙여넣으세요.", "info")
  }

  // 이미지 스캔 처리 함수
  const handleScanImage = async () => {
    if (!selectedImage) {
      setScanError("이미지를 먼저 선택해주세요.")
      return
    }

    setIsScanning(true)
    setScanError(null)

    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.")
      }

      // FormData 생성
      const formData = new FormData()
      formData.append("file", selectedImage) // "image"에서 "file"로 변경

      // API 호출
      const response = await fetch("http://13.209.5.228:8000/image/scan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
          // Content-Type은 FormData를 사용할 때 자동으로 설정되므로 명시적으로 설정하지 않음
        },
        body: formData,
      })

      if (response.status === 401) {
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
      }

      if (response.status === 422) {
        throw new Error("이미지 형식이 올바르지 않거나 서버에서 처리할 수 없습니다.")
      }

      if (!response.ok) {
        throw new Error("이미지 스캔 중 오류가 발생했습니다.")
      }

      const data = await response.json()
      console.log("스캔 결과:", data)

      if (data.length === 0) {
        setScanError("이미지에서 약품을 인식할 수 없습니다. 다른 이미지를 시도해보세요.")
      } else {
        setScanResults(data)
        addToast(`${data.length}개의 약품을 인식했습니다.`, "success")
      }
    } catch (error) {
      console.error("이미지 스캔 실패:", error)
      setScanError(error.message || "이미지 스캔 중 오류가 발생했습니다.")
      addToast("이미지 스캔에 실패했습니다.", "error")
    } finally {
      setIsScanning(false)
    }
  }

  // 복용약 추가 핸들러 (개선된 버전)
  const handleAddMedication = async (medication) => {
    try {
      await addMedication(medication)
      addToast(`${medication.item_name}이(가) 복용약에 추가되었습니다.`, "success")
    } catch (error) {
      console.error("약품 추가 실패:", error)
      addToast("약품 추가에 실패했습니다. 다시 시도해주세요.", "error")
    }
  }

  const handleShowDetail = (medication) => {
    setSelectedMedication(medication)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>약품 검색</h1>
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
          {/* 카메라 스캔 카드 */}
          <div className="card">
            <div className="card-header">
              <h3>이미지로 약품 스캔</h3>
            </div>
            <div className="card-body scan-body">
              <div
                className="scan-preview"
                ref={scanPreviewRef}
                tabIndex={0} // 포커스를 받을 수 있도록 tabIndex 설정
              >
                {previewUrl ? (
                  <img src={previewUrl || "/placeholder.svg"} alt="약품 이미지 미리보기" className="preview-image" />
                ) : (
                  <div className="empty-preview">
                    <Camera size={48} />
                    <p>이미지를 선택해주세요</p>
                    {!isMobile && <p className="paste-hint">클립보드에서 붙여넣기도 가능합니다 (Ctrl+V)</p>}
                  </div>
                )}
              </div>
              <div className="scan-instruction">
                <p>처방전이나 약 봉투 이미지를 업로드 하세요.</p>
                <div className="scan-actions">
                  {/* 일반 파일 업로드 (PC/모바일 공통) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  {/* 카메라 캡처 (모바일 전용) */}
                  {isMobile && (
                    <input
                      type="file"
                      ref={cameraInputRef}
                      onChange={handleCameraCapture}
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                    />
                  )}

                  {/* PC 환경 버튼 */}
                  {!isMobile && (
                    <>
                      <button className="btn outline-btn" onClick={handleUploadClick}>
                        <Upload size={16} />
                        <span>이미지 업로드</span>
                      </button>
                      <button className="btn outline-btn" onClick={handlePasteClick}>
                        <Clipboard size={16} />
                        <span>클립보드에서 붙여넣기</span>
                      </button>
                    </>
                  )}

                  {/* 모바일 환경 버튼 */}
                  {isMobile && (
                    <>
                      <button className="btn outline-btn" onClick={handleCameraClick}>
                        <Camera size={16} />
                        <span>카메라 촬영</span>
                      </button>
                      <button className="btn outline-btn" onClick={handleUploadClick}>
                        <ImageIcon size={16} />
                        <span>갤러리에서 선택</span>
                      </button>
                    </>
                  )}
                </div>

                {/* 스캔 버튼 (공통) */}
                <button
                  className="btn primary-btn scan-btn"
                  onClick={handleScanImage}
                  disabled={!selectedImage || isScanning}
                >
                  {isScanning ? "스캔 중..." : "스캔 시작"}
                </button>

                {scanError && <p className="scan-error">{scanError}</p>}
              </div>
            </div>
          </div>

          {/* 검색 결과 카드 */}
          {searchResults.length > 0 && (
            <div className="card search-results">
              <div className="card-header">
                <h3>검색 결과</h3>
                <span className="result-count">{searchResults.length}개 발견</span>
              </div>
              <div className="card-body">
                {searchResults.map((medication, index) => (
                  <div className="medication-item" key={index}>
                    <div className="medication-image">
                      <img src={medication.image || "https://placehold.co/80x80"} alt={medication.product_name} />
                    </div>
                    <div className="medication-info">
                      <h4>{medication.product_name}</h4>
                      <p className="manufacturer">{medication.manufacturer}</p>
                      <p className="efficacy">{medication.efficacy.substring(0, 100)}...</p>
                    </div>
                    <div className="medication-actions">
                      <button className="btn text-btn" onClick={() => handleShowDetail(medication)}>
                        상세정보
                      </button>
                      <button className="btn primary-btn small-btn">복용 추가</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 스캔된 약품 정보 */}
          {scanResults.length > 0 && (
            <div className="card scanned-results">
              <div className="card-header">
                <h3>스캔된 약품 정보</h3>
                <span className="result-count">{scanResults.length}개 발견</span>
              </div>
              <div className="card-body">
                {scanResults.map((medication, index) => (
                  <div className="scanned-item" key={index}>
                    <div className="medication-info">
                      <h4>{medication.item_name}</h4>
                      <p className="manufacturer">{medication.entp_name}</p>
                      <div className="scanned-tags">
                        <span className="tag">코드: {medication.item_seq}</span>
                      </div>
                    </div>
                    <div className="scanned-actions">
                      <button className="btn primary-btn small-btn" onClick={() => handleAddMedication(medication)}>
                        복용 추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 약품 상세 정보 모달 */}
      {showDetail && selectedMedication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{selectedMedication.product_name}</h3>
              <button className="modal-close" onClick={handleCloseDetail}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="medication-detail">
                <div className="medication-detail-image">
                  <img
                    src={selectedMedication.image || "https://placehold.co/200x200"}
                    alt={selectedMedication.product_name}
                  />
                </div>
                <div className="medication-detail-info">
                  <div className="detail-section">
                    <h4>제조사</h4>
                    <p>{selectedMedication.manufacturer}</p>
                  </div>
                  <div className="detail-section">
                    <h4>효능·효과</h4>
                    <p>{selectedMedication.efficacy}</p>
                  </div>
                  <div className="detail-section">
                    <h4>용법·용량</h4>
                    <p>{selectedMedication.use_method}</p>
                  </div>
                  <div className="detail-section">
                    <h4>경고</h4>
                    <p>{selectedMedication.warning}</p>
                  </div>
                  <div className="detail-section">
                    <h4>주의사항</h4>
                    <p>{selectedMedication.caution}</p>
                  </div>
                  <div className="detail-section">
                    <h4>상호작용</h4>
                    <p>{selectedMedication.interaction}</p>
                  </div>
                  <div className="detail-section">
                    <h4>부작용</h4>
                    <p>{selectedMedication.side_effect}</p>
                  </div>
                  <div className="detail-section">
                    <h4>보관방법</h4>
                    <p>{selectedMedication.storage_method}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn primary-btn" onClick={() => handleAddMedication(selectedMedication)}>
                복용 추가
              </button>
              <button className="btn outline-btn" onClick={handleCloseDetail}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && <Check size={20} />}
              {toast.type === "error" && <X size={20} />}
              {toast.type === "info" && <i className="fas fa-info-circle"></i>}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Lens
