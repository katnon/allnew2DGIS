# 🗺️ AllNew2DGIS

모던 웹 기반 2D GIS 애플리케이션입니다. OpenLayers를 기반으로 하여 지도 시각화, POI 검색, 그리기 도구 등 다양한 GIS 기능을 제공합니다.

## ✨ 주요 기능

### 🗺️ 지도 기능
- **다중 베이스맵 지원**: OpenStreetMap, VWorld 기본지도, VWorld 위성지도
- **행정구역 표시**: 한국 행정구역 경계 데이터 오버레이
- **반응형 지도**: 다양한 화면 크기에 최적화된 지도 인터페이스

### 📍 POI 검색
- **카카오맵 API 연동**: 실시간 주변 관심지점 검색
- **카테고리별 검색**: 음식점, 카페, 병원, 약국, 편의점, 주유소, 은행, 학교, 공원, 관광명소
- **거리 기반 정렬**: 현재 위치에서 가까운 순으로 정렬
- **지능형 중복 제거**: 동일 장소 필터링으로 정확한 결과 제공

### �️ 그리기 도구
- **다양한 도형 지원**: 텍스트, 선, 면, 원 그리기
- **토글 방식 UI**: 직관적인 도구 활성화/비활성화
- **고급 상호작용**: 우클릭으로 선 완성, 면/원 그리기 중단
- **편집 기능**: 선택 삭제, 전체 삭제
- **측정 결과 오버레이**: 도형 위에 결과 표시

### 📍 POI (Point of Interest)
- **동적 POI 검색**: OpenStreetMap Overpass API 활용
- **카테고리별 검색**: amenity, shop, tourism, office, leisure, healthcare
- **POI 목록 표시**: 거리순/우선순위 정렬
- **상세 정보 팝업**: 클릭 시 POI 정보 표시

### 🗺️ 레이어 관리
- **베이스 레이어**: OSM, Vworld 기본/위성 지도
- **오버레이 레이어**: 행정구역, POI, 그리기, 텍스트
- **가시성 제어**: 레이어별 표시/숨김 토글

### 📷 이미지 내보내기
- **지도 스크린샷**: 현재 화면의 모든 레이어 캡처
- **PNG 형식**: 브라우저 다운로드 폴더에 자동 저장

## 🏗️ 프로젝트 구조

```
📁 allnew2DGIS/
├── 📄 index.html          # 메인 HTML 페이지
├── 📄 main.js             # 애플리케이션 진입점
├── 📄 server.js           # Express 개발 서버
├── 📄 package.json        # 프로젝트 설정 및 의존성
└── 📁 modules/            # 기능별 모듈들
    ├── 📄 mapConfig.js    # 지도 설정 및 초기화
    ├── 📄 ui.js           # UI 컴포넌트 관리
    ├── 📄 drawTools.js    # 그리기 도구
    ├── 📄 editTools.js    # 편집 도구
    ├── 📄 measurement.js  # 측정 도구
    ├── 📄 poi.js          # POI 관리
    ├── 📄 layerManager.js # 레이어 관리
    └── 📄 imageExport.js  # 이미지 내보내기
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd allnew2DGIS
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
# 또는
npm run dev
```

### 4. 브라우저에서 확인
```
http://localhost:3000
```

## 🛠️ 기술 스택

- **프론트엔드**: 
  - OpenLayers 8.2.0 (지도 라이브러리)
  - proj4 2.9.0 (좌표계 변환)
  - ES6 모듈 시스템
  - 순수 HTML/CSS/JavaScript

- **백엔드**:
  - Node.js
  - Express.js (정적 파일 서빙)

- **외부 API**:
  - OpenStreetMap (베이스맵)
  - Vworld API (한국 지도 서비스)
  - Overpass API (POI 데이터)

## 🔧 개발 가이드

### 모듈 시스템
- 각 기능은 독립적인 모듈로 구성
- ES6 import/export 문법 사용
- `main.js`에서 모든 모듈을 통합 관리

### 모듈 간 통신
- 전역 window 객체를 통한 참조 공유
- 함수 파라미터를 통한 직접 전달
- 이벤트 기반 통신

### 좌표계
- **EPSG:5181**: 한국 중부 원점 TM 좌표계
- **EPSG:3857**: 웹 메르카토르 투영법

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
