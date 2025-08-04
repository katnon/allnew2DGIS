/**
 * 📍 POI(Point of Interest) 관리 모듈 (POI Management Module)
 * 
 * 【모듈 역할】
 * OpenStreetMap의 Overpass API를 사용하여 주변 관심지점(POI)을 검색하고 지도에 표시하는 모듈입니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. POI 레이어 활성화 → fetchAndShowPOIs() 호출
 * 2. 지도 중심점과 뷰포트 크기 기반 검색 반경 자동 계산
 * 3. Overpass API 쿼리 생성 → HTTP 요청 → JSON 응답 수신
 * 4. POI 데이터 필터링 (이름 없는 POI 제거, 거리순 정렬)
 * 5. Feature 생성 → poiSource에 추가 → 지도에 마커 표시
 * 6. POI 목록 UI 업데이트 → 사이드 패널에 리스트 표시
 * 7. POI 클릭 → 상세 정보 팝업 표시 → 해당 위치로 지도 이동
 * 
 * 🎯 【제공 기능】
 * - 🔍 동적 POI 검색: 지도 뷰포트에 따른 자동 반경 계산
 * - 🗂️ 카테고리별 검색: amenity, shop, tourism, office, leisure, healthcare
 * - 📋 POI 목록 표시: 거리순/우선순위 정렬된 사이드 패널
 * - 🏷️ 상세 정보 팝업: 클릭 시 POI 정보 오버레이 표시
 * - ⭐ 유명 POI 우선 표시: 관광지, 박물관 등 우선순위 부여
 * 
 * 📤 【데이터 연동 관계】
 * - poiSource ← mapConfig.js 에서 생성된 VectorSource
 * - poiLayer ← main.js 에서 참조
 * - UI 패널 ← ui.js 에서 생성된 DOM 요소들
 * - Overpass API ← 외부 OpenStreetMap 데이터 소스
 * 
 * 🔧 【상태 관리】
 * - 검색 진행 상태 추적 (중복 요청 방지)
 * - 캐시된 검색 조건 (중심점, 반경)
 * - 현재 표시된 팝업 오버레이 관리
 * - 지도 클릭 핸들러 생명주기 관리
 */
