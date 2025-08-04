/**
 * 📋 레이어 관리 모듈 (Layer Management Module)
 * 
 * 【모듈 역할】
 * 지도의 모든 레이어 가시성을 제어하고 UI와 동기화하는 중앙 관리 시스템입니다.
 * 사용자의 레이어 패널 조작을 실제 지도 레이어 상태 변경으로 연결합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 
 * 📥 INPUT 경로:
 * 1️⃣ UI 이벤트: 레이어 패널의 라디오버튼/체크박스 조작
 * 2️⃣ 프로그래밍 방식: 다른 모듈에서 setLayerVisibility() 호출
 * 
 * 🔄 PROCESSING:
 * - 베이스 레이어: 라디오 버튼 방식 (하나만 활성화)
 * - 오버레이 레이어: 체크박스 방식 (다중 선택)
 * - POI 레이어 특별 처리: 검색 버튼, 목록 패널 연동
 * 
 * 📤 OUTPUT:
 * - OpenLayers 레이어 객체의 setVisible() 호출
 * - UI 상태 동기화 (체크박스/라디오버튼 상태)
 * - POI 관련 UI 요소 표시/숨김
 * 
 * 🎯 【제어 대상 레이어】
 * 
 * 🗺️ 베이스 레이어 (Base Layers) - 상호 배타적
 * - OSM: 오픈스트리트맵 
 * - Vworld Base: 브이월드 기본 지도
 * - Vworld Satellite: 브이월드 위성 지도
 * 
 * 📍 오버레이 레이어 (Overlay Layers) - 독립적 토글
 * - Admin Layer: 행정구역 경계선
 * - POI Layer: 관심지점 (특별 처리 포함)
 * - Draw Layer: 사용자 그리기 결과
 * - Text Layer: 사용자 텍스트 라벨
 * 
 * 🔧 【특별 기능】
 * - POI 레이어 연동: 활성화 시 검색 버튼 표시, 자동 검색 실행
 * - 상태 조회: 현재 모든 레이어의 활성화 상태 반환
 * - 일괄 제어: 모든 오버레이 레이어 한 번에 숨기기
 * - UI 동기화: 프로그래밍 방식 변경 시에도 UI 상태 업데이트
 */

let gisMap = null;
let baseLayers = null;
let overlayLayers = null;

/**
 * 레이어 매니저 초기화
 */
export function initializeLayerManager(map, baseLayerGroup, overlayLayerGroup) {
    gisMap = map;
    baseLayers = baseLayerGroup;
    overlayLayers = overlayLayerGroup;
    
    console.log('📋 레이어 매니저가 초기화되었습니다.');
}

/**
 * 베이스 레이어 변경 (라디오 버튼 방식 - 하나만 활성화)
 */
export function setBaseLayer(layerName) {
    if (!baseLayers) {
        console.error('베이스 레이어가 초기화되지 않았습니다.');
        return;
    }

    // 모든 베이스 레이어 비활성화
    Object.values(baseLayers).forEach(layer => {
        layer.setVisible(false);
    });

    // 선택된 레이어만 활성화
    if (baseLayers[layerName]) {
        baseLayers[layerName].setVisible(true);
        console.log(`🗺️ 베이스 레이어를 "${layerName}"으로 변경했습니다.`);
        
        // UI 동기화
        updateBaseLayerUI(layerName);
    } else {
        console.error(`베이스 레이어 "${layerName}"을 찾을 수 없습니다.`);
    }
}

/**
 * 오버레이 레이어 가시성 토글 (체크박스 방식 - 다중 선택)
 */
export function toggleOverlayLayer(layerName) {
    if (!overlayLayers) {
        console.error('오버레이 레이어가 초기화되지 않았습니다.');
        return;
    }

    const layer = overlayLayers[layerName];
    if (layer) {
        const currentVisibility = layer.getVisible();
        const newVisibility = !currentVisibility;
        
        layer.setVisible(newVisibility);
        console.log(`📍 오버레이 레이어 "${layerName}"을 ${newVisibility ? '활성화' : '비활성화'}했습니다.`);
        
        // UI 동기화
        updateOverlayLayerUI(layerName, newVisibility);
        
        // POI 레이어 특별 처리
        if (layerName === 'poi') {
            handlePOILayerToggle(newVisibility);
        }
        
        return newVisibility;
    } else {
        console.error(`오버레이 레이어 "${layerName}"을 찾을 수 없습니다.`);
        return false;
    }
}

/**
 * 특정 오버레이 레이어의 가시성 설정
 */
export function setOverlayLayerVisibility(layerName, visible) {
    if (!overlayLayers) {
        console.error('오버레이 레이어가 초기화되지 않았습니다.');
        return;
    }

    const layer = overlayLayers[layerName];
    if (layer) {
        layer.setVisible(visible);
        console.log(`📍 오버레이 레이어 "${layerName}"을 ${visible ? '활성화' : '비활성화'}했습니다.`);
        
        // UI 동기화
        updateOverlayLayerUI(layerName, visible);
        
        // POI 레이어 특별 처리
        if (layerName === 'poi') {
            handlePOILayerToggle(visible);
        }
    } else {
        console.error(`오버레이 레이어 "${layerName}"을 찾을 수 없습니다.`);
    }
}

/**
 * 모든 오버레이 레이어 숨기기
 */
export function hideAllOverlayLayers() {
    if (!overlayLayers) {
        console.error('오버레이 레이어가 초기화되지 않았습니다.');
        return;
    }

    Object.keys(overlayLayers).forEach(layerName => {
        setOverlayLayerVisibility(layerName, false);
    });
    
    console.log('📋 모든 오버레이 레이어를 숨겼습니다.');
}

/**
 * 현재 활성화된 베이스 레이어 이름 반환
 */
export function getActiveBaseLayer() {
    if (!baseLayers) return null;
    
    for (const [name, layer] of Object.entries(baseLayers)) {
        if (layer.getVisible()) {
            return name;
        }
    }
    return null;
}

/**
 * 모든 레이어의 가시성 상태 반환
 */
export function getLayerStates() {
    const states = {
        baseLayers: {},
        overlayLayers: {}
    };

    if (baseLayers) {
        Object.entries(baseLayers).forEach(([name, layer]) => {
            states.baseLayers[name] = layer.getVisible();
        });
    }

    if (overlayLayers) {
        Object.entries(overlayLayers).forEach(([name, layer]) => {
            states.overlayLayers[name] = layer.getVisible();
        });
    }

    return states;
}

/**
 * 베이스 레이어 UI 동기화
 */
function updateBaseLayerUI(selectedLayerName) {
    const baseLayerRadios = document.querySelectorAll('input[name="baseLayer"]');
    baseLayerRadios.forEach(radio => {
        radio.checked = (radio.value === selectedLayerName);
    });
}

/**
 * 오버레이 레이어 UI 동기화
 */
function updateOverlayLayerUI(layerName, visible) {
    const checkbox = document.querySelector(`input[data-layer="${layerName}"]`);
    if (checkbox) {
        checkbox.checked = visible;
    }
}

/**
 * POI 레이어 특별 처리
 */
function handlePOILayerToggle(visible) {
    // POI 검색 버튼 표시/숨김
    const poiSearchButton = document.getElementById('poi-search-btn');
    const poiListPanel = document.getElementById('poi-list-panel');
    
    if (poiSearchButton) {
        poiSearchButton.style.display = visible ? 'block' : 'none';
    }
    
    if (poiListPanel) {
        if (!visible) {
            poiListPanel.style.display = 'none';
        }
    }
    
    // POI 레이어 활성화 시 자동 검색 실행 (선택사항)
    if (visible && window.gisModules && window.gisModules.poi) {
        // 자동 검색은 나중에 POI 모듈에서 구현
        console.log('🔍 POI 레이어가 활성화되었습니다. 자동 검색을 준비합니다.');
    }
}
