# Todolist

React + Spring Boot 기반 TodoList 서비스. 회원가입/로그인 후 본인의 할 일을 등록·조회·수정·삭제하고,
마감 임박 항목을 구분해 보여준다. 목록은 무한 스크롤로 조회한다.

**배포 URL:** _(배포 후 기재)_

## 모노레포 구성

```
todolist/
├── backend/            Spring Boot + JPA REST API (Java 21)   → backend/README.md
├── frontend/           React + Vite SPA                        → frontend/README.md
├── docker-compose.yml  mysql + app + web 통합 실행
└── .env.example        배포용 환경변수 템플릿
```

| 모듈 | 스택 | 상세 |
|---|---|---|
| backend | Spring Boot 3.3.5, Spring Data JPA, Spring Security, JWT, H2/MySQL | [backend/README.md](backend/README.md) |
| frontend | React 19, Vite 8, react-router-dom, axios | [frontend/README.md](frontend/README.md) |

## 기능

- Todo CRUD — 제목·내용·마감일·완료여부·카테고리(프리셋 8종 + 직접 입력)·우선순위(낮음/보통/높음)·**반복(매일/매주/매월)**
- **상단 스탯 카드** (전체 / 미완료 / 기한 초과 / 완료율) — `GET /api/todos/stats`
- **그룹 뷰** — 기한 초과 / 오늘 / 예정 / 완료 로 자동 분류, 빈 그룹은 숨김. 완료 그룹은 기본 접힘 + "완료 비우기"
- **반복 할 일** — 완료하면 서버가 다음 회차를 자동 생성
- **직접 정렬** — 정렬을 "직접 정렬"로 두면 그룹 없이 평면 목록 + 드래그로 순서 변경
- 완료 토글(체크 시 페이드아웃), **마감 임박(24시간 이내)** / 기한 초과 뱃지, 카테고리별 자동 색상 태그, 내용 더보기/접기
- **빠른 추가** — 목록 상단 입력창에 제목만 넣고 Enter
- **카드에서 바로** 우선순위 변경 · 마감일 미루기(오늘/내일/이번 주말/다음 주)
- 목록 + 제목·내용 검색, 세그먼트 상태 필터(기본 미완료), 카테고리·정렬 필터 — **필터는 URL 쿼리에 저장돼 새로고침/뒤로가기 시 유지**
- 삭제 시 인라인 확인(삭제? 확인/취소)
- JWT 인증 — 회원가입/로그인, 본인 Todo만 접근 (조회·수정·삭제 시 소유권 재검증)

## 로컬 개발

두 개의 터미널에서:

```bash
# 1) 백엔드 (H2 인메모리, 설치 불필요)
cd backend && ./mvnw spring-boot:run           # http://localhost:8080

# 2) 프론트엔드
cd frontend && npm install && npm run dev       # http://localhost:5173
```

프론트 개발 서버가 `/api` 요청을 `localhost:8080`으로 프록시하므로 CORS 설정 없이 동작한다.

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 콘솔: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:todolist`, user `sa`)

## 배포

단일 서버(EC2 등)에서 Docker Compose로 3개 컨테이너를 띄운다.

```
web (nginx :80)  ──/api──▶  app (Spring Boot :8080)  ──▶  mysql :3306
        └─ 정적 파일(React 빌드) 서빙
```

### 1. 사전 준비 (EC2, Ubuntu 기준)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker
```

보안그룹: `22`(SSH, 본인 IP), `80`(HTTP, 전체) 개방. `8080`은 열지 않아도 됨(nginx가 내부 프록시).

### 2. 클론 & 환경변수

```bash
git clone https://github.com/HurKyungsoo/todolist.git
cd todolist
cp .env.example .env
# .env 편집: JWT_SECRET(32자+), DB 비밀번호 3개
```

### 3. 실행

```bash
docker compose up -d --build
```

- 접속: `http://<EC2-퍼블릭-IP>`
- MySQL 데이터는 `mysql_data` 볼륨에 영속. `prod` 프로필은 `ddl-auto: update`로 스키마 자동 반영.
- 로그: `docker compose logs -f app`
- 중지: `docker compose down` (데이터 유지) / `docker compose down -v` (데이터 삭제)

### 환경변수

| 변수 | 설명 | 기본값 |
|---|---|---|
| `JWT_SECRET` | JWT 서명 키 (**최소 32바이트**, 필수) | — |
| `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | 애플리케이션 DB 계정 | `todolist` / `todouser` / `todopass` |
| `MYSQL_ROOT_PASSWORD` | MySQL root 비밀번호 | `rootpass` |
| `CORS_ALLOWED_ORIGINS` | API 직접 호출 허용 오리진 (콤마 구분) | `http://localhost` |

## API 요약

| 메서드 | 경로 | 인증 |
|---|---|---|
| POST | `/api/users/signup` · `/api/users/login` | ✗ |
| GET · POST | `/api/todos` (목록/생성, 목록은 `page`·`size`·`sort`·`category`·`completed`·`q`) | ✓ |
| GET | `/api/todos/stats` (전체/완료/기한초과 집계) · `/api/todos/categories` (쓰인 카테고리 목록) | ✓ |
| DELETE | `/api/todos/completed` (완료 항목 일괄 삭제) | ✓ |
| PATCH | `/api/todos/reorder` (`{ids:[...]}` 순서대로 정렬값 재부여) | ✓ |
| GET · PUT · DELETE | `/api/todos/{id}` | ✓ |
| PATCH | `/api/todos/{id}/complete` (완료 토글) | ✓ |

전체 명세는 [backend/README.md](backend/README.md#api) 또는 Swagger UI 참고.
