# syntax=docker/dockerfile:1

### 1단계: 빌드 ###
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_BASE_URL 을 비워두면 런타임에 nginx 가 /api 를 프록시 (권장)
RUN npm run build

### 2단계: nginx 정적 서빙 ###
FROM nginx:1.27-alpine AS runtime

# 템플릿을 두면 컨테이너 시작 시 ${BACKEND_URL} 이 환경변수로 치환됨
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# 백엔드 주소 기본값 (docker-compose 의 app 서비스명). compose 에서 덮어쓸 수 있음.
ENV BACKEND_URL=http://app:8080

EXPOSE 80
