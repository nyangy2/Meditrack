# frontend/Dockerfile
FROM node:18

# 작업 디렉토리 생성
WORKDIR /app

# package.json과 lock 파일 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 소스 복사
COPY . .

EXPOSE 5173

# Vite 개발 서버 실행 (개발용)
CMD ["npm", "run", "dev", "--", "--host"]

