/**
 * 🎨 그리기 도구 관리 모듈 (Drawing Tools Management Module)
 * 
 * 【모듈 역할】
 * OpenLayers의 Draw 인터랙션을 활용하여 사용자가 지도 위에 다양한 도형을 그릴 수 있게 합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. UI 버튼 클릭 → enable*Drawing() 함수 호출
 * 2. 기존 인터랙션 정리 → 새로운 Draw 인터랙션 생성
 * 3. 지도에 인터랙션 추가 → 사용자 입력 대기
 * 4. 사용자 그리기 완료 → 'drawend' 이벤트 발생
 * 5. Feature 생성 → VectorSource에 추가 → 레이어 활성화
 * 
 * 🎯 【제공 기능】
 * - 📏 선(LineString) 그리기: 연결된 점들로 구성된 선분
 * - 🔷 다각형(Polygon) 그리기: 닫힌 영역 생성 
 * - 🔵 원(Circle) 그리기: 중심점과 반지름으로 정의
 * - 📝 텍스트 라벨: 클릭한 위치에 사용자 입력 텍스트 표시
 * 
 * 📤 【데이터 출력 경로】
 * - drawSource (일반 도형) ← mapConfig.js 에서 생성
 * - textSource (텍스트) ← mapConfig.js 에서 생성
 * - window.gisLayers.* ← main.js 에서 설정
 * 
 * 🔧 【상태 관리】
 * - 한 번에 하나의 그리기 도구만 활성화 가능
 * - 도구 전환 시 이전 인터랙션 자동 정리
 * - 그리기 완료 시 해당 레이어 자동 활성화
 */
