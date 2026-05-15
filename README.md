# 2026_SW_engineering

# 실행 방법
 
## 사전 요구사항
 
- Node.js 및 npm
- Java 17+
- Gradle
- MySQL 8.0+
---
 
## 1. 데이터베이스 설정
 
MySQL에 접속한 후 데이터베이스를 생성합니다.
 
```sql
CREATE DATABASE wordtama;
```
 
---
 
## 2. 백엔드 설정 및 실행
 
### `application.properties` 설정
 
`src/main/resources/application.properties` 파일에서 DB 정보를 본인 환경에 맞게 수정합니다.
 
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/wordtama
spring.datasource.username=본인_MySQL_아이디
spring.datasource.password=본인_MySQL_비밀번호
```
 
### 백엔드 실행
 
```bash
./gradlew bootRun
```
 
---
 
## 3. 프론트엔드 설정 및 실행
 
```bash
cd frontend
npm install
npm start
```
 
브라우저에서 `http://localhost:3000` 으로 접속합니다.
 
---
 
## 실행 순서 요약
 
1. MySQL에서 `wordtama` 데이터베이스 생성
2. `application.properties`에 DB 계정 정보 입력
3. 백엔드 실행 (`./gradlew bootRun`)
4. 프론트엔드 실행 (`npm install` → `npm start`)
5. `http://localhost:3000` 접속
