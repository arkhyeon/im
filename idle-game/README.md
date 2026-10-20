# 광석 캐기 (React 방치형 게임)

광석을 탭해 골드를 캐고, 광부·드릴·공장·은행을 모아 자동으로 채굴하는 방치형 게임이에요.
Google 로그인, Firestore 저장, 실시간 TOP 3 랭킹을 지원해요.

## 게임 기능

- **골드 러시**: 빠르게 탭해서 게이지를 채우면 10초 동안 탭 x5, 생산 x3
- **티어**: 같은 일꾼을 10/25/50개 모으면 실버/골드/다이아로 바뀌고 생산량 x2
- **곡괭이**: 3레벨마다 나무 → 돌 → 철 → 황금 → 다이아 → 전설로 바뀌고 탭 파워 x2
- **광산**: 누적 채굴량에 따라 돌 광산 → 황금 광산 → 수정 동굴 → 다이아 광맥 → 운석 분화구
- **꼬마 광부**: 고용한 광부가 화면에서 광석까지 걸어가 캐고 자루를 메고 돌아가요
- **오프라인 보상**: 꺼 둔 동안 최대 8시간치 보상, 광고 보면 2배 (지금은 가짜 광고)

## 로컬 실행

```bash
npm install
npm run dev
```

Firebase 설정이 없으면 게스트 모드(브라우저 저장)로만 동작해요.

## Firebase 연결 (Google 로그인 + 랭킹)

1. https://console.firebase.google.com 에서 **프로젝트 추가**
2. **Authentication > 시작하기 > Sign-in method > Google** 사용 설정
3. **Firestore Database > 데이터베이스 만들기** (프로덕션 모드, 위치는 `asia-northeast3` 서울)
4. **프로젝트 설정 > 내 앱 > 웹 앱 추가(</>)** 후 나오는 `firebaseConfig` 값을 복사
5. `.env.example`을 `.env.local`로 복사해서 값 채우기

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_APP_ID=...
```

## 배포 (누구나 접속 가능한 주소 만들기)

```bash
npx firebase-tools login
npx firebase-tools use --add   # 위에서 만든 프로젝트 선택
npm run deploy                 # 빌드 + 호스팅 + Firestore 보안 규칙 배포
```

배포가 끝나면 `https://프로젝트ID.web.app` 주소로 누구나 접속할 수 있어요.

## 파일 구조

| 파일 | 내용 |
| --- | --- |
| `src/App.jsx` | 화면, 게임 루프, 저장, 랭킹 |
| `src/game.js` | 밸런스 값과 계산 함수 |
| `src/art.jsx` | SVG 그림 (광석, 일꾼, 곡괭이 등) |
| `src/firebase.js` | 로그인, Firestore 저장/불러오기, TOP 3 구독 |
| `src/styles.css` | 스타일과 애니메이션 |
| `firestore.rules` | 본인 기록만 쓰고 랭킹은 누구나 읽는 보안 규칙 |
