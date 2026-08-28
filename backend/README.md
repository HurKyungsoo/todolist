# Todolist Backend

Spring Boot + JPA 기반 TodoList REST API. JWT 인증으로 사용자별 Todo를 관리한다.
모노레포의 `backend/` 모듈. 프론트엔드는 [`../frontend`](../frontend), 통합 배포는 [루트 README](../README.md) 참고.

## 기술 스택

| 구분 | 사용 |
|---|---|
| 언어 / 빌드 | Java 21, Maven (Wrapper 포함) |
| 프레임워크 | Spring Boot 3.3.5 (Web, Data JPA, Validation, Security) |
| 인증 | JWT (io.jsonwebtoken jjwt 0.12.6, HS512) |
| DB | 로컬 H2 (in-memory) / 운영 MySQL 8 |
| 문서 | springdoc-openapi (Swagger UI) |
| 기타 | Lombok, Spring Data JPA Auditing |
| 배포 | Docker (멀티스테이지) + docker-compose (app + mysql) |

## 요구사항 대응

| 과제 요구사항 | 구현 |
|---|---|
| Todo 등록/조회/수정/삭제 | `TodoController` + `TodoService` |
| 제목·내용·마감일·완료여부·카테고리 | `entity/Todo` |
| 완료 처리 | `PATCH /api/todos/{id}/complete` (토글) |
| 마감 임박(24h) 구분 | `TodoResponseDto.dueSoon` — 미완료 && 마감까지 0~24시간이면 `true` |
| 페이지네이션 | Spring `Page` / `Pageable`, 기본 size 10, `dueDate` 정렬 |
| 사용자별 로그인 / 본인 Todo만 조회 | JWT 인증 → `@AuthenticationPrincipal`에서 userId 추출 → 조회·수정·삭제 시 소유권 재검증 |

## 프로젝트 구조

```
src/main/java/com/portfolio/todolist/
├── config/
│   ├── JwtTokenProvider.java      토큰 생성/파싱/검증 (HS512, 24h)
│   └── SecurityConfig.java        STATELESS, JWT 필터 등록, CORS, 401 EntryPoint
├── security/
│   ├── JwtAuthenticationFilter.java   요청 헤더의 Bearer 토큰 → SecurityContext
│   ├── CustomUserDetails.java
│   └── CustomUserDetailsService.java
├── controller/    TodoController, UserController
├── service/       TodoService(소유권 검증), UserService(가입/로그인)
├── repository/     TodoRepository, UserRepository
├── dto/            요청/응답 DTO (검증 애너테이션 포함)
├── entity/
│   ├── BaseTimeEntity.java   createdAt / updatedAt (JPA Auditing)
│   ├── User.java             username·email unique
│   └── Todo.java             User와 N:1, completed 기본 false
└── exception/
    ├── GlobalExceptionHandler.java   404 / 400(검증) / 403 통일 응답
    ├── ResourceNotFoundException.java
    └── AccessDeniedException.java
```

## 데이터 모델

```
users                          todos
─────────────                  ─────────────
id           PK                id           PK
username     unique, 50        title        not null, 200
password     (BCrypt)          content      TEXT
email        unique, 100       due_date
created_at                     completed    not null
updated_at                     category     50
                               user_id      FK → users.id
                               created_at
                               updated_at
```

## API

베이스 경로 `/api`. 인증이 필요한 요청은 `Authorization: Bearer <token>` 헤더 필수.

### 인증

| 메서드 | 경로 | 인증 | 본문 | 응답 |
|---|---|---|---|---|
| POST | `/api/users/signup` | ✗ | `{ username, password, email }` | 201 `{ id, username, email }` |
| POST | `/api/users/login` | ✗ | `{ username, password }` | 200 `{ token, tokenType, userId, username }` |

### Todo (모두 인증 필요, 본인 소유만 접근 가능)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/todos?page=0&size=10&sort=dueDate&category=&completed=` | 목록 (Spring `Page`), 카테고리·완료여부 필터 선택 |
| GET | `/api/todos/{id}` | 단건 조회 |
| POST | `/api/todos` | 생성 · 본문 `{ title, content, dueDate, category }` (title 필수) |
| PUT | `/api/todos/{id}` | 수정 |
| PATCH | `/api/todos/{id}/complete` | 완료 여부 토글 |
| DELETE | `/api/todos/{id}` | 삭제 (204) |

**TodoResponseDto**
```json
{
  "id": 1, "title": "발표 자료 준비", "content": "...",
  "dueDate": "2026-08-29T09:00:00", "completed": false,
  "category": "업무", "dueSoon": true,
  "createdAt": "2026-08-28T10:00:00", "updatedAt": "2026-08-28T10:00:00"
}
```

**에러 응답** (`GlobalExceptionHandler`)
```json
{ "timestamp": "...", "status": 400, "message": "입력값이 올바르지 않습니다.", "errors": { "title": "제목은 필수입니다." } }
```
| 상황 | 상태 코드 |
|---|---|
| 미인증 / 토큰 만료 | 401 |
| 남의 Todo 접근 | 403 |
| 존재하지 않는 리소스 | 404 |
| 검증 실패 / 중복 username·email | 400 |

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## 실행

### 로컬 (H2, 설치 불필요)

```bash
./mvnw spring-boot:run
# 기본 프로필 local → H2 in-memory, http://localhost:8080
```

- H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:todolist`, user `sa`, 비밀번호 없음)
- 재시작 시 데이터 초기화 (`ddl-auto: create-drop`)

### 빌드

```bash
./mvnw clean package          # target/todolist.jar (실행 가능 fat jar)
java -jar target/todolist.jar --spring.profiles.active=local
```

### 운영 (Docker Compose)

레포 루트의 `docker-compose.yml`이 `mysql + app + web`을 함께 띄운다. [루트 README](../README.md#배포) 참고.

```bash
cd ..                         # 레포 루트
cp .env.example .env
docker compose up -d --build
```

## 환경변수

| 변수 | 사용처 | 예시 |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | 프로필 | `prod` |
| `JWT_SECRET` | JWT 서명 키 (**최소 32바이트**) | 랜덤 문자열 32자+ |
| `CORS_ALLOWED_ORIGINS` | 허용 오리진 (콤마 구분) | `http://<EC2-IP>` |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USERNAME` `DB_PASSWORD` | prod DataSource | `mysql` / `3306` / `todolist` / … |

`application.yml`(공통) + `application-local.yml`(H2) + `application-prod.yml`(MySQL) 구조.
prod는 `ddl-auto: update` (포트폴리오 규모 기준).

## 프로필별 동작

| | local | prod |
|---|---|---|
| DB | H2 in-memory | MySQL |
| DDL | create-drop | update |
| show-sql | true | false |
| H2 콘솔 | 활성 | 비활성 |

## 테스트

```bash
./mvnw test
bash scripts/test-local.sh    # 앱 실행 후 회원가입~CRUD~401 시나리오 curl 테스트
```
> `scripts/test-local.sh`는 Windows Git Bash에서 한글 인코딩이 깨질 수 있음 (Linux/Mac는 정상).
