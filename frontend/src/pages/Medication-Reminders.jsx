"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "../styles/medication-reminders.css"
import { useMedication } from "../context/medication-context"
import { Clock, CheckCircle, Circle, Sun, Moon, Pill, TrendingUp } from 'lucide-react'

function MedicationReminders() {
  const { medications, isLoading, updateMedicationSchedule, getTodayProgress } = useMedication()

  // 시간대 정보
  const timeSlots = [
    { key: "morning", label: "아침", icon: Sun, time: "08:00", color: "#f59e0b" },
    { key: "afternoon", label: "점심", icon: Sun, time: "13:00", color: "#0ea5e9" },
    { key: "evening", label: "저녁", icon: Moon, time: "19:00", color: "#8b5cf6" },
  ]

  // 복용 상태 토글
  const handleToggleReminder = (medicationId, timeSlot, currentStatus) => {
    updateMedicationSchedule(medicationId, timeSlot, !currentStatus)
  }

  // 진행률 정보 가져오기
  const progressInfo = getTodayProgress()

  // 시간대별 완료율 계산
  const getTimeSlotCompletion = (timeSlot) => {
    if (medications.length === 0) return 0
    const completed = medications.filter((med) => med[timeSlot]).length
    return Math.round((completed / medications.length) * 100)
  }

  // 전체 복용 완료된 약품 수 계산
  const getFullyCompletedMedications = () => {
    return medications.filter((med) => med.morning && med.afternoon && med.evening).length
  }

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>복용 알림</h1>
        </header>

        <div className="content-body">
          {/* 오늘의 진행률 카드 */}
          <div className="card progress-card">
            <div className="card-header">
              <h3>오늘 복용 현황</h3>
              <div className="progress-stats">
                <span className="progress-text">
                  {progressInfo.completed}/{progressInfo.total} 완료
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="main-progress">
                <div className="progress-circle">
                  <div className="progress-value">{progressInfo.percentage}%</div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressInfo.percentage}%` }}></div>
                  </div>
                  <div className="progress-labels">
                    <span>전체 진행률</span>
                    <span>{progressInfo.percentage}% 완료</span>
                  </div>
                </div>
              </div>

              {/* 시간대별 진행률 */}
              <div className="time-slot-progress">
                {timeSlots.map((slot) => {
                  const SlotIcon = slot.icon
                  const completion = getTimeSlotCompletion(slot.key)
                  return (
                    <div key={slot.key} className="time-slot-item">
                      <div className="time-slot-header">
                        <SlotIcon size={20} style={{ color: slot.color }} />
                        <span className="time-slot-label">{slot.label}</span>
                        <span className="time-slot-time">{slot.time}</span>
                      </div>
                      <div className="mini-progress">
                        <div
                          className="mini-progress-fill"
                          style={{
                            width: `${completion}%`,
                            backgroundColor: slot.color,
                          }}
                        ></div>
                      </div>
                      <span className="completion-rate">{completion}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 간단한 통계 카드 */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Pill size={24} />
              </div>
              <div className="stat-content">
                <h4>등록된 복용약</h4>
                <p className="stat-value">{medications.length}개</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <h4>완전 복용 완료</h4>
                <p className="stat-value">{getFullyCompletedMedications()}개</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <h4>남은 복용</h4>
                <p className="stat-value">{progressInfo.total - progressInfo.completed}개</p>
              </div>
            </div>
          </div>

          {/* 복용약별 상세 알림 */}
          <div className="card">
            <div className="card-header">
              <h3>복용약별 상세 현황</h3>
              <Link to="/my-medications" className="card-link">
                약품 관리
              </Link>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="loading-state">
                  <span className="loading-spinner"></span>
                  <p>복용 현황을 불러오는 중...</p>
                </div>
              ) : medications.length === 0 ? (
                <div className="empty-state">
                  <p className="no-data">등록된 복용약이 없습니다.</p>
                  <Link to="/my-medications" className="btn primary-btn">
                    복용약 추가하기
                  </Link>
                </div>
              ) : (
                <div className="medication-reminders-list">
                  {medications.map((medication) => {
                    const completedSlots = [medication.morning, medication.afternoon, medication.evening].filter(
                      Boolean,
                    ).length

                    return (
                      <div key={medication.item_seq} className="medication-reminder-card">
                        <div className="medication-header">
                          <div className="medication-info">
                            <h4>{medication.item_name}</h4>
                            <p className="medication-company">{medication.entp_name}</p>
                          </div>
                          <div className="medication-progress">
                            <span className="progress-fraction">{completedSlots}/3</span>
                            <div className="mini-medication-progress">
                              <div
                                className="mini-medication-fill"
                                style={{ width: `${(completedSlots / 3) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="time-slots">
                          {timeSlots.map((slot) => {
                            const isCompleted = medication[slot.key]
                            const SlotIcon = slot.icon

                            return (
                              <div key={slot.key} className="time-slot">
                                <button
                                  className={`time-slot-button ${isCompleted ? "completed" : "pending"}`}
                                  onClick={() => handleToggleReminder(medication.item_seq, slot.key, isCompleted)}
                                  disabled={isLoading}
                                  style={{ borderColor: slot.color }}
                                >
                                  <div className="slot-icon" style={{ color: slot.color }}>
                                    <SlotIcon size={16} />
                                  </div>
                                  <div className="slot-info">
                                    <span className="slot-label">{slot.label}</span>
                                    <span className="slot-time">{slot.time}</span>
                                  </div>
                                  <div className="slot-status">
                                    {isCompleted ? (
                                      <CheckCircle size={20} className="check-icon completed" />
                                    ) : (
                                      <Circle size={20} className="check-icon pending" />
                                    )}
                                  </div>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 복용 팁 카드 */}
          <div className="card tips-card">
            <div className="card-header">
              <h3>복용 팁</h3>
            </div>
            <div className="card-body">
              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-icon">💊</div>
                  <div className="tip-content">
                    <h4>규칙적인 복용</h4>
                    <p>매일 같은 시간에 복용하면 효과가 더 좋습니다.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🥛</div>
                  <div className="tip-content">
                    <h4>충분한 물과 함께</h4>
                    <p>약물 복용 시 충분한 양의 물과 함께 드세요.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🍽️</div>
                  <div className="tip-content">
                    <h4>식사와의 관계</h4>
                    <p>약물별 복용 시점(식전/식후)을 확인하세요.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">⏰</div>
                  <div className="tip-content">
                    <h4>복용 체크</h4>
                    <p>복용 후 바로 체크하여 중복 복용을 방지하세요.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default MedicationReminders
