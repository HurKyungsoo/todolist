# syntax=docker/dockerfile:1

### 1단계: 빌드 (Maven Wrapper 사용, 로컬에 Maven 불필요) ###
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# 의존성 레이어 캐싱: pom + wrapper 먼저 복사 후 오프라인 의존성 다운로드
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline || true

# 소스 복사 후 패키징 (테스트는 CI에서 별도 수행)
COPY src/ src/
RUN ./mvnw -B -q clean package -DskipTests

### 2단계: 실행 (JRE만 포함한 경량 이미지) ###
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# 비루트 사용자로 실행
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /workspace/target/todolist.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
