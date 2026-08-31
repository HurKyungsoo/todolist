#!/usr/bin/env bash
# 로컬(H2)에서 애플리케이션 실행 후 사용: bash scripts/test-local.sh
# IntelliJ에서 TodolistApplication 먼저 실행해두고 돌릴 것.

set -e
BASE_URL="http://localhost:8080"
USERNAME="tester_$(date +%s)"
PASSWORD="test1234"
EMAIL="${USERNAME}@example.com"

echo "== 1. 회원가입 =="
curl -s -X POST "$BASE_URL/api/users/signup" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\",\"email\":\"$EMAIL\"}"
echo -e "\n"

echo "== 2. 로그인 =="
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RES"
TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo -e "발급된 토큰: $TOKEN\n"

AUTH="Authorization: Bearer $TOKEN"
DUE_SOON=$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -v+2H +"%Y-%m-%dT%H:%M:%S")
DUE_LATER=$(date -u -d "+10 days" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -v+10d +"%Y-%m-%dT%H:%M:%S")

echo "== 3. Todo 생성 (마감 임박 - 2시간 후, 우선순위 높음) =="
CREATE_RES=$(curl -s -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"임박 테스트\",\"content\":\"24시간 이내 마감\",\"dueDate\":\"$DUE_SOON\",\"category\":\"업무\",\"priority\":2}")
echo "$CREATE_RES"
TODO_ID=$(echo "$CREATE_RES" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo -e "생성된 todoId: $TODO_ID (dueSoon:true 여야 정상)\n"

echo "== 4. Todo 생성 (마감 여유 - 10일 후) =="
curl -s -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"여유 테스트\",\"content\":\"10일 후 마감\",\"dueDate\":\"$DUE_LATER\",\"category\":\"개인\"}"
echo -e "\n"

echo "== 5. Todo 목록 조회 (페이지네이션, page=0&size=10) =="
curl -s "$BASE_URL/api/todos?page=0&size=10" -H "$AUTH"
echo -e "\n"

echo "== 5b. 검색 + 우선순위 정렬 (q=테스트&sort=priority,desc) =="
curl -s "$BASE_URL/api/todos?q=%ED%85%8C%EC%8A%A4%ED%8A%B8&sort=priority,desc" -H "$AUTH"
echo -e "\n"

echo "== 6. Todo 상세 조회 =="
curl -s "$BASE_URL/api/todos/$TODO_ID" -H "$AUTH"
echo -e "\n"

echo "== 7. Todo 수정 =="
curl -s -X PUT "$BASE_URL/api/todos/$TODO_ID" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d "{\"title\":\"임박 테스트(수정됨)\",\"content\":\"내용 수정\",\"dueDate\":\"$DUE_SOON\",\"category\":\"업무\"}"
echo -e "\n"

echo "== 8. Todo 완료 처리 토글 =="
curl -s -X PATCH "$BASE_URL/api/todos/$TODO_ID/complete" -H "$AUTH"
echo -e "\n"

echo "== 9. Todo 삭제 (204 No Content 예상) =="
curl -s -o /dev/null -w "status: %{http_code}\n" -X DELETE "$BASE_URL/api/todos/$TODO_ID" -H "$AUTH"

echo -e "\n== 10. 토큰 없이 접근 (401 예상) =="
curl -s -o /dev/null -w "status: %{http_code}\n" "$BASE_URL/api/todos"

echo -e "\n완료. Swagger UI: $BASE_URL/swagger-ui/index.html"
