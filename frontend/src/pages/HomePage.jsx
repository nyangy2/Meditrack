"use client"

import { useEffect } from "react"
import "../styles/styles.css" // 또는 './styles/styles.css' (상대경로 맞춰서)

function HomePage() {
  useEffect(() => {
    const toggle = document.querySelector(".menu-toggle")
    const navLinks = document.querySelector(".nav-links")
    if (toggle && navLinks) {
      const handleToggle = () => {
        navLinks.classList.toggle("active")
      }
      toggle.addEventListener("click", handleToggle)

      // 클린업 함수
      return () => {
        toggle.removeEventListener("click", handleToggle)
      }
    }
  }, [])

  return (
    <div>
      {/* 히어로 */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>당신의 건강을 위한 스마트한 약품 관리</h1>
            <p>약품 정보 확인, 복용 알림, 상호작용 체크까지 한번에</p>
            <a href="/register" className="btn primary-btn">
              지금 시작하기
            </a>
          </div>
          <div className="hero-image">
            <img
              src="https://cdn.prod.website-files.com/609fcf792d95d5535b5cf0ad/646e4649e0a9f6df542c487b_Medication%20Management%20Software.png"
              alt="스마트폰으로 약품을 관리하는 모습"
            />
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">주요 기능</h2>
          <div className="feature-grid">
            <Feature icon="search" title="증상 기반 약품 검색" desc="증상을 입력하면 적합한 약품을 추천해드립니다." />
            <Feature icon="pills" title="상비약 추천" desc="카테고리별로 필요한 상비약을 추천받고 구비하세요." />
            <Feature
              icon="exchange-alt"
              title="약품 상호작용 확인"
              desc="약학정보원과 연계하여 약품 간의 상호작용을 확인할 수 있습니다."
            />
            <Feature
              icon="camera"
              title="약품 스캔"
              desc="카메라로 약품을 스캔하여 정보를 확인하고 관리할 수 있습니다."
            />
            <Feature
              icon="user-md"
              title="개인 건강 정보 관리"
              desc="알레르기, 기저질환 등 개인 건강 정보를 등록하고 관리하세요."
            />
            <Feature icon="bell" title="복용 알림" desc="정해진 시간에 알림을 받아 건강 관리를 하세요." />
          </div>
        </div>
      </section>

      {/* 소개 */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>안전한 약품 사용을 위한 최고의 선택</h2>
              <p>MediTrack은 사용자의 건강 정보를 기반으로 안전한 약품 사용을 도와드립니다.</p>
              <a href="/register" className="btn primary-btn">
                무료로 시작하기
              </a>
            </div>
            <div className="about-image">
              <img
                src="https://viveinfuse.com/wp-content/uploads/2024/02/what-is-medication-management.jpg"
                alt="의료진이 환자와 상담하는 모습"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

export default HomePage
