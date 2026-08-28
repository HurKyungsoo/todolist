# Todolist Frontend

React + Vite 기반 TodoList 프론트엔드. 모노레포의 `frontend/` 모듈.
백엔드([`../backend`](../backend))의 REST API + JWT 인증을 사용한다. 통합 배포는 [루트 README](../README.md) 참고.

## 기술 스택

| 구분 | 사용 |
|---|---|
| 빌드 | Vite 8 |
| UI | React 19 (함수형 컴포넌트 + Hooks) |
| 라우팅 | react-router-dom 7 |
| HTTP | axios (인터셉터로 JWT 자동 첨부 / 401 처리) |
| 상태관리 | Context API (인증) + 커스텀 훅 (목록) — 외부 라이브러리 없음 |
| 스타일 | 순수 CSS (CSS 변수 기반 디자인 토큰, 다크모드 대응) |
| 배포 | Docker (build → nginx 정적 서빙 + `/api` 프록시) |

## 요구사항 대응

| 과제 요구사항 | 구현 위치 |
|---|---|
| Todo 등록/조회/수정/삭제 | `src/api/todos.js`, `src/pages/TodosPage.jsx`, `src/components/TodoForm.jsx` |
| 제목·내용·마감일·완료여부·카테고리 | `TodoForm.jsx` (입력) / `TodoItem.jsx` (표시) |
| 완료 처리 | `TodoItem.jsx` 체크박스 → `PATCH /api/todos/{id}/complete` |
| 마감 임박(24h) 구분 표시 | 백엔드 `dueSoon` 플래그로 "마감 임박" 뱃지, 추가로 `utils/date.js`에서 기한 초과/남은 시간 계산 |
| 무한 스크롤 목록 조회 | `src/hooks/useTodos.js` + `src/components/TodoList.jsx` (IntersectionObserver) |
| 사용자별 로그인 / 본인 Todo만 조회 | `src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, JWT를 localStorage에 저장 후 모든 요청에 첨부 |

## 폴더 구조

```
src/
├── api/
│   ├── client.js        axios 인스턴스 · JWT 인터셉터 · 401 리다이렉트 · 에러 메시지 파서
│   ├── auth.js          signup / login
│   └── todos.js         Todo CRUD + 목록(페이지네이션 파라미터)
├── context/
│   └── AuthContext.jsx  token · user 상태, localStorage 영속화, login/logout/signup 제공
├── hooks/
│   └── useTodos.js      무한 스크롤 목록 상태(페이지 누적, 필터 변경 시 리셋, 낙관적 업데이트 헬퍼)
├── components/
│   ├── ProtectedRoute.jsx  미인증 시 /login 으로 (원위치 기억)
│   ├── Navbar.jsx          사용자명 + 로그아웃
│   ├── TodoForm.jsx        생성/수정 겸용 폼
│   ├── TodoItem.jsx        단일 항목: 뱃지(마감 임박/기한 초과/완료), 완료 토글, 수정/삭제
│   ├── TodoList.jsx        목록 + 무한 스크롤 sentinel
│   └── Modal.jsx           폼 모달 (ESC/backdrop 닫기)
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx      가입 성공 시 자동 로그인 → 목록 이동
│   └── TodosPage.jsx       필터(카테고리/완료/정렬) + 목록 + CRUD 오케스트레이션
├── utils/
│   └── date.js          datetime-local ↔ 서버 포맷 변환, 남은 시간/기한 초과 계산
├── App.jsx             라우트 정의
└── main.jsx            BrowserRouter · AuthProvider 마운트
```

## 상태 관리 방식

- **인증 상태**: `AuthContext` 하나로 관리. `token`(localStorage `todolist.token`), `user`(`todolist.user`)를 앱 시작 시 복원.
- **목록 상태**: `useTodos(filters)` 훅. 필터(JSON 문자열)가 바뀌면 `items`를 비우고 page 0부터 다시 로드. 스크롤로 다음 페이지를 이어 붙임(누적). 요청 세대(`reqId`)로 경쟁 상태 방지.
- **뮤테이션 반영**:
  - 완료 토글 / 삭제 → 낙관적 업데이트(`patchItem` / `removeItem`). 완료 필터가 걸린 상태에서 조건을 벗어나면 목록에서 제거.
  - 생성 / 수정 → 정렬 위치가 바뀔 수 있어 `refresh()`로 첫 페이지 재로드.

## API 연동

- 베이스 URL: `import.meta.env.VITE_API_BASE_URL || '/api'`
- **개발**: `.env` 비워둠 → `vite.config.js`의 proxy가 `/api` → `http://localhost:8080` 전달 (CORS 불필요)
- **배포**: nginx가 `/api` → 백엔드 컨테이너로 프록시 (역시 CORS 불필요)
- 모든 요청에 `Authorization: Bearer <token>` 자동 첨부. 응답이 401이면 토큰 삭제 후 `/login` 이동.

사용하는 엔드포인트:

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/users/signup` | 회원가입 |
| POST | `/api/users/login` | 로그인 → `{ token, userId, username }` |
| GET | `/api/todos?page&size&sort&category&completed` | 목록 (Spring `Page`) |
| POST | `/api/todos` | 생성 |
| PUT | `/api/todos/{id}` | 수정 |
| PATCH | `/api/todos/{id}/complete` | 완료 여부 토글 |
| DELETE | `/api/todos/{id}` | 삭제 |

## 로컬 실행

```bash
npm install
npm run dev              # http://localhost:5173
```

> API 주소는 `VITE_API_BASE_URL`(선택). 지정하지 않으면 `/api`를 쓰고,
> 개발 서버에서는 `vite.config.js`의 proxy가 `http://localhost:8080`으로 전달한다.

> 백엔드가 `http://localhost:8080`에서 먼저 떠 있어야 한다.
> `cd ../backend && ./mvnw spring-boot:run`

## 빌드 / 배포

```bash
npm run build           # dist/ 생성
```

Docker 배포는 레포 루트의 `docker-compose.yml`이 `mysql + app(백엔드) + web(이 모듈)`을 한 번에 띄운다.
`web` 컨테이너의 nginx가 정적 파일을 서빙하고 `/api` 요청을 `app:8080`으로 프록시한다.

```bash
cd ..                   # 레포 루트
cp .env.example .env     # JWT_SECRET 등 설정
docker compose up -d --build   # → http://localhost
```

자세한 배포 순서는 [루트 README](../README.md#배포).

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 프로덕션 번들 (`dist/`) |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint` | oxlint |
