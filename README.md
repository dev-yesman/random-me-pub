# Randome - 주변 음식점 룰렛

사용자의 현재 위치를 기반으로 주변 음식점을 찾아주고, 룰렛을 통해 랜덤하게 선택해주는 웹 애플리케이션입니다.

## 🎯 주요 기능

- **위치 기반 음식점 검색**: 사용자의 현재 위치에서 반경 500m 내의 음식점 표시
- **카카오맵 연동**: 카카오맵 API를 활용한 지도 서비스
- **음식점 룰렛**: 찾은 음식점 중에서 랜덤하게 선택해주는 룰렛 기능
- **반응형 디자인**: 모바일과 데스크톱 모두에서 최적화된 사용자 경험
- **실시간 정보**: 음식점 이름, 카테고리 정보를 마커 클릭으로 확인

## 🛠 기술 스택

- **Frontend**: Next.js 15.3.2, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Map API**: 카카오맵 API
- **Build Tool**: ESLint, Biome

## 📋 사전 요구사항

- Node.js 18+ 
- npm 또는 yarn
- 카카오 개발자 계정 및 API 키

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd randome
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

#### 카카오맵 API 키 발급 방법
1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 애플리케이션 생성
3. 플랫폼 설정에서 웹 사이트 도메인 등록 (`http://localhost:3000`)
4. JavaScript 키를 복사하여 환경변수에 설정

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🎮 사용 방법

1. **위치 권한 허용**: 브라우저에서 위치 정보 접근을 허용해주세요
2. **음식점 확인**: 지도에 표시된 마커들이 주변 음식점입니다
3. **정보 보기**: 마커를 클릭하면 음식점 이름과 카테고리를 확인할 수 있습니다
4. **룰렛 시작**: 화면의 룰렛 버튼을 클릭하여 랜덤 음식점을 선택하세요

## 📝 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 타입 체크 및 린팅
```bash
npm run lint
```

### 빌드 파일 실행
```bash
npm start
```

## 🏗 프로젝트 구조

```
src/
├── app/
│   ├── (kakaoMap)/           # 카카오맵 관련 컴포넌트
│   │   ├── KakaoMap.tsx      # 메인 지도 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   ├── utils/            # 유틸리티 함수
│   │   └── kakao.d.ts        # 카카오맵 타입 정의
│   ├── components/           # 공통 컴포넌트
│   ├── contexts/             # React Context
│   └── globals.css           # 전역 스타일
```

## 🔧 주요 설정

- **기본 위치**: 서울시청 (위치 권한이 없을 경우)
- **검색 반경**: 500m
- **지도 레벨**: 2 (고정, 확대/축소 비활성화)
- **카테고리**: 음식점(FD6) 카테고리만 검색

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

All Rights Reserved. (복제/수정 금지)

## ⚠️ 주의사항

- 카카오맵 API 키는 공개되지 않도록 주의하세요
- 위치 정보 접근 권한이 필요합니다
- HTTPS 환경에서만 정확한 위치 정보를 가져올 수 있습니다