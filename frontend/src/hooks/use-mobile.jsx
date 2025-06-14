import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 모바일 기기 감지 함수
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      
      // 모바일 기기 감지를 위한 정규식
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      
      setIsMobile(mobileRegex.test(userAgent))
    }

    // 초기 체크
    checkMobile()

    // 윈도우 크기 변경 시 체크 (태블릿 모드 전환 등을 위해)
    const handleResize = () => {
      checkMobile()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
