/**
 * 📋 레이어 관리 모듈 (Layer Management Module)
 * 
 * 【모듈 역할】
 * 지도의 모든 레이어 가시성을 제어하고 UI와 동기화하는 중앙 관리 시스템입니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. UI 버튼 클릭 → switchBaseLayer() 또는 toggleLayer() 호출
 * 2. 레이어 가시성 변경 → OpenLayers 레이어 업데이트
 * 3. UI 상태 동기화 → 버튼 스타일 업데이트
 * 
 * 🎯 【제어 대상 레이어】
 * - 베이스 레이어: OSM, VWorld 기본, VWorld 위성
 * - 오버레이 레이어: 행정구역, POI, 그리기 레이어
 * 
 * 📤 【데이터 연동 관계】
 * - map, layers ← mapConfig.js에서 가져온 레이어들
 * - UI 버튼 상태 동기화
 * 
 * � 【상태 관리】
 * - 베이스 레이어 상호 배타적 활성화
 * - 오버레이 레이어 독립적 토글
 * - UI 버튼 상태와 레이어 상태 동기화
 */

import { map, osmLayer, vworldLayer, satelliteLayer, adminLayer, poiLayer, vectorLayer, updateStatus, loadAdminData } from './mapConfig.js';

/**
 * 베이스 레이어 전환 (새로운 모듈화 시스템)
 * @param {string} layerType - 전환할 레이어 타입 ('osm', 'vworld', 'satellite')
 */
export function switchBaseLayer(layerType) {
    // 새로운 시스템 사용
    if (baseLayers) {
        setBaseLayer(layerType);
        return;
    }
    
    // 기존 시스템 호환성 유지
    if (osmLayer && vworldLayer && satelliteLayer) {
        // 모든 베이스 레이어 비활성화
        osmLayer.setVisible(false);
        vworldLayer.setVisible(false);
        satelliteLayer.setVisible(false);
        
        // 선택된 레이어만 활성화
        switch(layerType) {
            case 'osm':
                osmLayer.setVisible(true);
                if (updateStatus) updateStatus('OSM 지도로 전환');
                break;
            case 'vworld':
                vworldLayer.setVisible(true);
                if (updateStatus) updateStatus('VWorld 기본지도로 전환');
                break;
            case 'satellite':
                satelliteLayer.setVisible(true);
                if (updateStatus) updateStatus('VWorld 위성지도로 전환');
                break;
        }
        
        // UI 버튼 상태 업데이트
        updateBaseLayerButtons(layerType);
    }
}

/**
 * 오버레이 레이어 토글 (통합 시스템)
 * @param {string} layerType - 토글할 레이어 타입 ('admin', 'poi', 'vector')
 */
export function toggleLayer(layerType) {
    // 새로운 시스템 사용
    if (overlayLayers) {
        const result = toggleOverlayLayer(layerType);
        return result;
    }
    
    // 기존 시스템 호환성 유지
    let layer;
    let layerName;
    
    switch(layerType) {
        case 'admin':
            layer = adminLayer;
            layerName = '행정구역';
            break;
        case 'poi':
            layer = poiLayer;
            layerName = 'POI';
            break;
        case 'vector':
            layer = vectorLayer;
            layerName = '그리기';
            break;
        default:
            return;
    }
    
    if (layer) {
        const isVisible = layer.getVisible();
        layer.setVisible(!isVisible);
        
        if (updateStatus) updateStatus(`${layerName} 레이어 ${!isVisible ? '활성화' : '비활성화'}`);
        
        // UI 버튼 상태 업데이트
        updateLayerButton(layerType, !isVisible);
        
        // 특별 처리
        if (layerType === 'poi') {
            handlePOILayerToggle(!isVisible);
        } else if (layerType === 'admin' && !isVisible) {
            // 행정구역 레이어 활성화 시 데이터 로드
            if (loadAdminData) {
                loadAdminData();
            }
        }
        
        return !isVisible;
    }
}

/**
 * 베이스 레이어 버튼 상태 업데이트
 * @param {string} activeLayer - 활성화된 레이어 타입
 */
function updateBaseLayerButtons(activeLayer) {
    // 라디오 버튼 업데이트
    const radios = document.querySelectorAll('input[name="baseLayer"]');
    radios.forEach(radio => {
        radio.checked = (radio.value === activeLayer);
    });
    
    // 기존 버튼 스타일도 지원 (있다면)
    const buttons = document.querySelectorAll('.base-layer-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.layer === activeLayer) {
            btn.classList.add('active');
        }
    });
}

/**
 * 개별 레이어 버튼 상태 업데이트
 * @param {string} layerType - 레이어 타입
 * @param {boolean} isVisible - 레이어 가시성 상태
 */
function updateLayerButton(layerType, isVisible) {
    // 체크박스 업데이트
    const checkbox = document.querySelector(`input#${layerType}`);
    if (checkbox) {
        checkbox.checked = isVisible;
    }
    
    // 기존 버튼 스타일도 지원 (있다면)
    const button = document.querySelector(`[data-layer="${layerType}"]`);
    if (button) {
        if (isVisible) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
}

/**
 * 모든 오버레이 레이어 숨기기 (통합 시스템)
 */
export function hideAllOverlays() {
    // 새로운 시스템 사용
    if (overlayLayers) {
        hideAllOverlayLayers();
        return;
    }
    
    // 기존 시스템 호환성 유지
    if (adminLayer) adminLayer.setVisible(false);
    if (poiLayer) poiLayer.setVisible(false);
    if (vectorLayer) vectorLayer.setVisible(false);
    
    // UI 버튼 상태 업데이트
    updateLayerButton('admin', false);
    updateLayerButton('poi', false);
    updateLayerButton('vector', false);
    
    if (updateStatus) updateStatus('모든 오버레이 레이어 숨김');
}

/**
 * 현재 레이어 상태 조회 (통합 시스템)
 * @returns {Object} 각 레이어의 가시성 상태
 */
export function getLayerStatus() {
    // 새로운 시스템 사용
    if (baseLayers && overlayLayers) {
        return getLayerStates();
    }
    
    // 기존 시스템 호환성 유지
    return {
        base: {
            osm: osmLayer ? osmLayer.getVisible() : false,
            vworld: vworldLayer ? vworldLayer.getVisible() : false,
            satellite: satelliteLayer ? satelliteLayer.getVisible() : false
        },
        overlay: {
            admin: adminLayer ? adminLayer.getVisible() : false,
            poi: poiLayer ? poiLayer.getVisible() : false,
            vector: vectorLayer ? vectorLayer.getVisible() : false
        }
    };
}
// 전역 변수들
let gisMap;
let baseLayers;
let overlayLayers;

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
    // 이 주변에서 다시 검색 버튼 표시/숨김
    const researchButton = document.getElementById('research-poi-btn');
    if (researchButton) {
        researchButton.style.display = visible ? 'block' : 'none';
    }
    
    // POI 리스트 패널 처리
    const poiListPanel = document.getElementById('poiListPanel');
    if (poiListPanel && !visible) {
        poiListPanel.style.display = 'none';
    }
    
    // POI 레이어 활성화 시 자동 검색 실행
    if (visible && window.searchNearbyPOIs) {
        console.log('🔍 POI 레이어가 활성화되었습니다. 자동 검색을 시작합니다.');
        window.searchNearbyPOIs();
    }
}
