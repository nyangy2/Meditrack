import { useEffect, useState } from "react"
import "../styles/my-medications.css"

function CustomAlert({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="custom-alert-overlay" onClick={onCancel}>
      <div className="custom-alert-container" onClick={(e) => e.stopPropagation()}>
        <div className="custom-alert-header">
          <h3 className="custom-alert-title">{title}</h3>
        </div>
        <div className="custom-alert-body">
          <p className="custom-alert-message">{message}</p>
        </div>
        <div className="custom-alert-footer">
          <button className="custom-alert-btn custom-alert-btn-cancel" onClick={onCancel}>
            취소
          </button>
          <button className="custom-alert-btn custom-alert-btn-confirm" onClick={onConfirm}>
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomAlert