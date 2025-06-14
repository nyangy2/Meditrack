import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // Docker 외부 접속 허용
    port: 5173,     // 명시적으로 포트 설정
  },
})

