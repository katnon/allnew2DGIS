/**
 * 🗺️ 지도 설정 및 초기화 모듈 (Map Configuration & Initialization Module)
 * 
 * 【모듈 역할】
 * 이 모듈은 OpenLayers 지도의 기본 설정을 담당하는 핵심 모듈입니다.
 * 다른 모든 모듈들이 의존하는 기반 시설을 제공합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * main.js → setupProjection() → proj4 좌표계 등록 
 * main.js → createBaseLayers() → 베이스 레이어 그룹 생성
 * main.js → createOverlayLayers() → 오버레이 레이어 그룹 생성  
 * main.js → createMap() → 완전한 지도 객체 생성
 * 
 * 🌐 【외부 의존성】
 * - OpenLayers (ol) 라이브러리
 * - proj4 좌표계 변환 라이브러리
 * 
 * 📤 【제공하는 데이터】
 * - 지도 객체 (Map instance)
 * - 베이스 레이어들 (OSM, Vworld Gray/Satellite)
 * - 오버레이 레이어들 (행정구역, POI, 그리기, 텍스트)
 * - 각 레이어의 VectorSource 객체들
 * 
 * 📍 【좌표계 정보】
 * - EPSG:5181: 한국 중부 원점 TM 좌표계 (Korea Central Belt 2010)
 * - EPSG:3857: 웹 메르카토르 투영법 (Web Mercator - 일반적인 웹 지도 표준)
 */
