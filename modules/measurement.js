/**
 * 📐 측정 도구 관리 모듈 (Measurement Tools Management Module)
 * 
 * 【모듈 역할】
 * 지도 상의 그려진 도형(선, 다각형, 원)에 대한 거리 측정 기능을 제공하며, 측정 결과를 팝업으로 표시합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. UI 버튼 클릭 → enableDistanceMeasure() 함수 호출
 * 2. 지도 클릭 이벤트 등록 → 사용자 피처 클릭 대기
 * 3. forEachFeatureAtPixel() → 클릭된 위치의 피처 검색
 * 4. 피처 도형 타입 분석 → 적절한 계산 함수 호출
 * 5. 측정 결과 계산 → Overlay 생성 → 지도에 표시
 * 6. 토글 기능으로 표시/숨김 제어
 * 
 * 🎯 【제공 기능】
 * - 📏 거리 측정: 선분 길이, 다각형 둘레, 원 둘레
 * - 📊 면적 측정: 다각형 내부 면적, 원 면적
 * - 🏷️ 측정 결과 오버레이: 도형에 결과 표시
 * - 🔄 토글 기능: 같은 피처 클릭 시 결과 표시/숨김
 * - 📊 단위 자동 변환: 미터/킬로미터, 제곱미터/제곱킬로미터 단위로 표시
 * 
 * 📤 【데이터 연동 관계】
 * - vectorLayer ← mapConfig.js 에서 생성된 그리기 레이어
 * - map ← mapConfig.js 에서 생성된 지도 객체
 * - Feature 검색 → OpenLayers forEachFeatureAtPixel()
 * - 측정 결과 → Overlay → 지도 표시
 * 
 * 🔧 【상태 관리】
 * - isDistanceMeasureActive: 거리 측정 모드 활성화 상태
 * - isAreaMeasureActive: 면적 측정 모드 활성화 상태
 * - measurementOverlays: 생성된 오버레이 목록 관리
 * - 피처별 측정 결과 캐시 및 토글 상태
 */

import { map, vectorLayer, updateStatus } from './mapConfig.js';

// 측정 모드 상태
let isDistanceMeasureActive = false;
let isAreaMeasureActive = false;

// 측정 결과 오버레이 관리
let measurementOverlays = new Map(); // feature -> overlay 매핑

// 측정 모드 클릭 핸들러
let measureClickHandler = null;

/**
 * 거리 측정 모드 토글
 */
export function toggleDistanceMeasure() {
    if (isDistanceMeasureActive) {
        disableDistanceMeasure();
    } else {
        enableDistanceMeasure();
    }
}

/**
 * 면적 측정 모드 토글
 */
export function toggleAreaMeasure() {
    if (isAreaMeasureActive) {
        disableAreaMeasure();
    } else {
        enableAreaMeasure();
    }
}

/**
 * 거리 측정 모드 활성화
 */
function enableDistanceMeasure() {
    // 다른 도구들 비활성화
    if (window.disableAllEditModes) {
        window.disableAllEditModes();
    }
    
    // 면적 측정 모드 비활성화
    if (isAreaMeasureActive) {
        disableAreaMeasure();
    }
    
    // 그리기 도구 비활성화
    if (window.currentTool) {
        window.currentTool = null;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    isDistanceMeasureActive = true;
    updateStatus('도형을 클릭하여 거리를 측정하세요');
    
    // 클릭 이벤트 등록
    measureClickHandler = function(event) {
        const feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            if (layer === vectorLayer) {
                return feature;
            }
        });
        
        if (feature) {
            toggleDistanceMeasurementDisplay(feature, event.coordinate);
        }
    };
    
    map.on('click', measureClickHandler);
    
    // 버튼 스타일 업데이트
    const measureBtn = document.querySelector('[onclick*="toggleDistanceMeasure"]');
    if (measureBtn) {
        measureBtn.classList.add('active');
        measureBtn.textContent = '거리 측정 종료';
    }
}

/**
 * 면적 측정 모드 활성화
 */
function enableAreaMeasure() {
    // 다른 도구들 비활성화
    if (window.disableAllEditModes) {
        window.disableAllEditModes();
    }
    
    // 거리 측정 모드 비활성화
    if (isDistanceMeasureActive) {
        disableDistanceMeasure();
    }
    
    // 그리기 도구 비활성화
    if (window.currentTool) {
        window.currentTool = null;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    isAreaMeasureActive = true;
    updateStatus('면 또는 원을 클릭하여 면적을 측정하세요');
    
    // 클릭 이벤트 등록
    measureClickHandler = function(event) {
        const feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            if (layer === vectorLayer) {
                return feature;
            }
        });
        
        if (feature) {
            toggleAreaMeasurementDisplay(feature, event.coordinate);
        }
    };
    
    map.on('click', measureClickHandler);
    
    // 버튼 스타일 업데이트
    const measureBtn = document.querySelector('[onclick*="toggleAreaMeasure"]');
    if (measureBtn) {
        measureBtn.classList.add('active');
        measureBtn.textContent = '면적 측정 종료';
    }
}

/**
 * 거리 측정 모드 비활성화
 */
function disableDistanceMeasure() {
    isDistanceMeasureActive = false;
    updateStatus('거리 측정 모드 해제');
    
    // 클릭 이벤트 제거
    if (measureClickHandler) {
        map.un('click', measureClickHandler);
        measureClickHandler = null;
    }
    
    // 모든 측정 오버레이 숨기기
    measurementOverlays.forEach(overlay => {
        overlay.setPosition(undefined);
    });
    
    // 버튼 스타일 업데이트
    const measureBtn = document.querySelector('[onclick*="toggleDistanceMeasure"]');
    if (measureBtn) {
        measureBtn.classList.remove('active');
        measureBtn.textContent = '거리 측정';
    }
}

/**
 * 면적 측정 모드 비활성화
 */
function disableAreaMeasure() {
    isAreaMeasureActive = false;
    updateStatus('면적 측정 모드 해제');
    
    // 클릭 이벤트 제거
    if (measureClickHandler) {
        map.un('click', measureClickHandler);
        measureClickHandler = null;
    }
    
    // 모든 측정 오버레이 숨기기
    measurementOverlays.forEach(overlay => {
        overlay.setPosition(undefined);
    });
    
    // 버튼 스타일 업데이트
    const measureBtn = document.querySelector('[onclick*="toggleAreaMeasure"]');
    if (measureBtn) {
        measureBtn.classList.remove('active');
        measureBtn.textContent = '면적 측정';
    }
}

/**
 * 거리 측정 결과 표시/숨김 토글
 * @param {ol.Feature} feature - 측정할 피처
 * @param {Array} coordinate - 클릭한 좌표
 */
function toggleDistanceMeasurementDisplay(feature, coordinate) {
    const existingOverlay = measurementOverlays.get(feature);
    
    if (existingOverlay && existingOverlay.getPosition()) {
        // 이미 표시 중이면 숨기기
        existingOverlay.setPosition(undefined);
        updateStatus('측정 결과 숨김');
    } else {
        // 측정 결과 계산 및 표시
        const distance = calculateDistance(feature);
        if (distance !== null) {
            showDistanceMeasurementResult(feature, distance, coordinate);
            updateStatus(`거리 측정 완료: ${formatDistance(distance)}`);
        } else {
            updateStatus('거리를 측정할 수 없는 도형입니다');
        }
    }
}

/**
 * 면적 측정 결과 표시/숨김 토글
 * @param {ol.Feature} feature - 측정할 피처
 * @param {Array} coordinate - 클릭한 좌표
 */
function toggleAreaMeasurementDisplay(feature, coordinate) {
    const existingOverlay = measurementOverlays.get(feature);
    
    if (existingOverlay && existingOverlay.getPosition()) {
        // 이미 표시 중이면 숨기기
        existingOverlay.setPosition(undefined);
        updateStatus('측정 결과 숨김');
    } else {
        // 측정 결과 계산 및 표시
        const area = calculateArea(feature);
        if (area !== null) {
            showAreaMeasurementResult(feature, area, coordinate);
            updateStatus(`면적 측정 완료: ${formatArea(area)}`);
        } else {
            updateStatus('면적을 측정할 수 없는 도형입니다 (선은 면적이 없습니다)');
        }
    }
}

/**
 * 피처의 거리 계산
 * @param {ol.Feature} feature - 측정할 피처
 * @returns {number|null} - 거리 (미터 단위) 또는 null
 */
function calculateDistance(feature) {
    const geometry = feature.getGeometry();
    const geometryType = geometry.getType();
    
    switch (geometryType) {
        case 'LineString':
            return geometry.getLength();
            
        case 'Polygon':
            // 다각형의 둘레 계산 - 좌표 기반으로 계산
            try {
                const coordinates = geometry.getCoordinates();
                let totalLength = 0;
                
                // 외부 링과 내부 홀 모두 계산
                coordinates.forEach(ring => {
                    // 각 링을 LineString으로 만들어서 길이 계산
                    const lineGeometry = new ol.geom.LineString(ring);
                    totalLength += lineGeometry.getLength();
                });
                
                return totalLength;
            } catch (error) {
                console.error('다각형 둘레 계산 오류:', error);
                return null;
            }
            
        case 'Circle':
            // 원의 둘레 계산 (2πr)
            const radius = geometry.getRadius();
            return 2 * Math.PI * radius;
            
        default:
            return null;
    }
}

/**
 * 피처의 면적 계산
 * @param {ol.Feature} feature - 측정할 피처
 * @returns {number|null} - 면적 (제곱미터 단위) 또는 null
 */
function calculateArea(feature) {
    const geometry = feature.getGeometry();
    const geometryType = geometry.getType();
    
    switch (geometryType) {
        case 'Polygon':
            // 다각형의 면적 계산
            try {
                return geometry.getArea();
            } catch (error) {
                console.error('다각형 면적 계산 오류:', error);
                return null;
            }
            
        case 'Circle':
            // 원의 면적 계산 (πr²)
            const radius = geometry.getRadius();
            return Math.PI * radius * radius;
            
        case 'LineString':
            // 선분은 면적이 없음
            return null;
            
        default:
            return null;
    }
}

/**
 * 거리 측정 결과를 지도에 표시
 * @param {ol.Feature} feature - 측정된 피처
 * @param {number} distance - 계산된 거리 (미터)
 * @param {Array} clickCoordinate - 클릭한 좌표
 */
function showDistanceMeasurementResult(feature, distance, clickCoordinate) {
    let overlay = measurementOverlays.get(feature);
    
    if (!overlay) {
        // 새 오버레이 생성
        const element = document.createElement('div');
        element.className = 'measurement-popup';
        element.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        overlay = new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10]
        });
        
        map.addOverlay(overlay);
        measurementOverlays.set(feature, overlay);
    }
    
    // 콘텐츠 업데이트
    overlay.getElement().textContent = formatDistance(distance);
    
    // 도형의 중심점 또는 상단에 위치 설정
    const position = getOptimalDistancePosition(feature.getGeometry(), clickCoordinate);
    overlay.setPosition(position);
}

/**
 * 면적 측정 결과를 지도에 표시
 * @param {ol.Feature} feature - 측정된 피처
 * @param {number} area - 계산된 면적 (제곱미터)
 * @param {Array} clickCoordinate - 클릭한 좌표
 */
function showAreaMeasurementResult(feature, area, clickCoordinate) {
    let overlay = measurementOverlays.get(feature);
    
    if (!overlay) {
        // 새 오버레이 생성
        const element = document.createElement('div');
        element.className = 'measurement-popup area-measurement';
        element.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        overlay = new ol.Overlay({
            element: element,
            positioning: 'top-center',
            stopEvent: false,
            offset: [0, 10]
        });
        
        map.addOverlay(overlay);
        measurementOverlays.set(feature, overlay);
    }
    
    // 콘텐츠 업데이트
    overlay.getElement().textContent = formatArea(area);
    
    // 도형의 중심점 또는 하단에 위치 설정
    const position = getOptimalAreaPosition(feature.getGeometry(), clickCoordinate);
    overlay.setPosition(position);
}

/**
 * 거리 측정용 오버레이의 최적 위치 계산
 * @param {ol.geom.Geometry} geometry - 도형
 * @param {Array} clickCoordinate - 클릭한 좌표
 * @returns {Array} - 오버레이 위치 좌표
 */
function getOptimalDistancePosition(geometry, clickCoordinate) {
    const geometryType = geometry.getType();
    
    switch (geometryType) {
        case 'LineString':
            // 선분의 중점
            const coordinates = geometry.getCoordinates();
            const midIndex = Math.floor(coordinates.length / 2);
            return coordinates[midIndex];
            
        case 'Polygon':
            // 다각형의 중심점 (상단 쪽으로 오프셋)
            const extent = geometry.getExtent();
            const centerX = (extent[0] + extent[2]) / 2;
            const centerY = extent[3] - (extent[3] - extent[1]) * 0.1; // 상단 10% 지점
            return [centerX, centerY];
            
        case 'Circle':
            // 원의 중심점 (상단 쪽으로 오프셋)
            const center = geometry.getCenter();
            const radius = geometry.getRadius();
            return [center[0], center[1] + radius * 0.7]; // 반지름의 70% 위쪽
            
        default:
            return clickCoordinate;
    }
}

/**
 * 면적 측정용 오버레이의 최적 위치 계산
 * @param {ol.geom.Geometry} geometry - 도형
 * @param {Array} clickCoordinate - 클릭한 좌표
 * @returns {Array} - 오버레이 위치 좌표
 */
function getOptimalAreaPosition(geometry, clickCoordinate) {
    const geometryType = geometry.getType();
    
    switch (geometryType) {
        case 'Polygon':
            // 다각형의 중심점 (하단 쪽으로 오프셋)
            const extent = geometry.getExtent();
            const centerX = (extent[0] + extent[2]) / 2;
            const centerY = extent[1] + (extent[3] - extent[1]) * 0.3; // 하단 30% 지점
            return [centerX, centerY];
            
        case 'Circle':
            // 원의 중심점 (하단 쪽으로 오프셋)
            const center = geometry.getCenter();
            const radius = geometry.getRadius();
            return [center[0], center[1] - radius * 0.3]; // 반지름의 30% 아래쪽
            
        default:
            return clickCoordinate;
    }
}

/**
 * 면적 포맷팅 함수
 * @param {number} area - 면적 (제곱미터)
 * @returns {string} - 포맷된 면적 문자열
 */
function formatArea(area) {
    if (area >= 1000000) {
        // 제곱킬로미터 단위로 변환 (1km² = 1,000,000m²)
        const areaInKm = (area / 1000000).toFixed(2);
        return `${areaInKm} km²`;
    } else {
        // 제곱미터 단위
        return `${area.toFixed(2)} m²`;
    }
}

/**
 * 거리를 적절한 단위로 포맷
 * @param {number} distance - 거리 (미터)
 * @returns {string} - 포맷된 거리 문자열
 */
function formatDistance(distance) {
    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    } else {
        return `${(distance / 1000).toFixed(2)}km`;
    }
}

/**
 * 모든 측정 결과 지우기
 */
export function clearAllMeasurements() {
    measurementOverlays.forEach(overlay => {
        map.removeOverlay(overlay);
    });
    measurementOverlays.clear();
    updateStatus('모든 측정 결과 지워짐');
}

/**
 * 측정 모드가 활성화되어 있는지 확인
 * @returns {boolean}
 */
export function isDistanceMeasureMode() {
    return isDistanceMeasureActive;
}

// 전역에서 접근 가능하도록 등록
window.toggleDistanceMeasure = toggleDistanceMeasure;
window.toggleAreaMeasure = toggleAreaMeasure;
window.clearAllMeasurements = clearAllMeasurements;

// editTools에서 측정 모드 비활성화할 수 있도록
window.disableMeasureMode = disableDistanceMeasure;
window.disableAreaMeasureMode = disableAreaMeasure;
