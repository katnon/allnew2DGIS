/**
 * ✏️ 편집 도구 관리 모듈 (Edit Tools Management Module)
 * 
 * 【모듈 역할】
 * 기존에 그려진 도형들의 편집, 수정, 삭제 기능을 제공하는 모듈입니다.
 * OpenLayers의 Select와 Modify 인터랙션을 활용하여 사용자 친화적인 편집 환경을 제공합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. UI 버튼 클릭 → enable*Mode() 함수 호출
 * 2. Select 인터랙션 생성 → 지도에 추가 → 도형 선택 대기
 * 3. 사용자 도형 클릭 → 선택 이벤트 발생
 * 4. 편집 모드: Modify 인터랙션으로 도형 변형
 * 5. 삭제 모드: VectorSource에서 피처 즉시 제거
 * 6. 연관된 데이터 정리 (텍스트↔점 마커, 측정 결과)
 * 
 * 🎯 【제공 기능】
 * - ✏️ 편집 모드: 선택한 도형의 점을 드래그하여 모양 수정
 * - 🗑️ 삭제 모드: 클릭한 도형을 즉시 삭제
 * - 🧹 전체 삭제: 모든 그려진 도형과 텍스트 일괄 제거
 * - 🔗 연관 데이터 관리: 텍스트-점 마커 쌍, 측정 결과 오버레이 연동 삭제
 * 
 * 📤 【데이터 연동 관계】
 * - drawSource/textSource ← mapConfig.js 에서 생성
 * - drawLayer/textLayer ← main.js 에서 참조
 * - 측정 결과 ← measurement.js 모듈과 연동
 * - window.gisMap ← main.js 에서 설정
 * 
 * 🔧 【상태 관리】
 * - 편집/삭제 모드 상호 배타적 활성화
 * - Select/Modify 인터랙션 생명주기 관리
 * - 모드 전환 시 기존 인터랙션 자동 정리
 * - 연관 데이터 일관성 유지
 */

import { map, vectorSource, vectorLayer, updateStatus } from './mapConfig.js';

// 편집 도구 상태
let selectInteraction = null;
let modifyInteraction = null;
let isEditMode = false;
let isSelectDeleteMode = false;

/**
 * 편집 모드 활성화/비활성화
 */
export function toggleEditMode() {
    if (isEditMode) {
        disableEditMode();
    } else {
        enableEditMode();
    }
}

/**
 * 편집 모드 활성화
 */
function enableEditMode() {
    // 다른 모드 비활성화
    if (isSelectDeleteMode) {
        disableSelectDeleteMode();
    }
    
    // 그리기 모드 비활성화
    if (window.currentTool) {
        window.currentTool = null;
        // 모든 그리기 도구 버튼 비활성화
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            // 버튼 텍스트가 '취소'인 경우 원래 텍스트로 복원
            if (btn.textContent === '취소') {
                const buttonId = btn.id;
                switch(buttonId) {
                    case 'textBtn': btn.textContent = '텍스트'; break;
                    case 'lineBtn': btn.textContent = '선'; break;
                    case 'polygonBtn': btn.textContent = '면'; break;
                    case 'circleBtn': btn.textContent = '원'; break;
                    case 'pointBtn': btn.textContent = '점'; break;
                }
            }
        });
    }
    
    isEditMode = true;
    
    // 편집 모드 버튼 활성화 스타일
    const editButton = document.getElementById('editBtn');
    if (editButton) {
        editButton.classList.add('active');
        editButton.textContent = '편집 종료';
    }
    
    // Select 인터랙션 생성
    selectInteraction = new ol.interaction.Select({
        layers: [vectorLayer],
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.1)'
            }),
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: '#ff0000' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });
    
    // Modify 인터랙션 생성
    modifyInteraction = new ol.interaction.Modify({
        features: selectInteraction.getFeatures()
    });
    
    map.addInteraction(selectInteraction);
    map.addInteraction(modifyInteraction);
    
    updateStatus('편집 모드 활성화 - 도형을 선택한 후 점을 드래그하여 수정하세요');
}

/**
 * 편집 모드 비활성화
 */
function disableEditMode() {
    isEditMode = false;
    
    // 편집 모드 버튼 비활성화 스타일
    const editButton = document.getElementById('editBtn');
    if (editButton) {
        editButton.classList.remove('active');
        editButton.textContent = '편집 모드';
    }
    
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
    }
    
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
    }
    
    updateStatus('편집 모드 비활성화');
}

/**
 * 선택 삭제 모드 활성화/비활성화
 */
export function toggleSelectDeleteMode() {
    if (isSelectDeleteMode) {
        disableSelectDeleteMode();
    } else {
        enableSelectDeleteMode();
    }
}

/**
 * 선택 삭제 모드 활성화
 */
function enableSelectDeleteMode() {
    // 다른 모드 비활성화
    if (isEditMode) {
        disableEditMode();
    }
    
    isSelectDeleteMode = true;
    
    // 버튼 텍스트 변경
    const deleteButton = document.querySelector('.clear-btn');
    if (deleteButton && deleteButton.textContent === '선택 삭제') {
        deleteButton.textContent = '삭제 취소';
    }
    
    // 지도 클릭 이벤트 핸들러 설정
    window.deleteClickHandler = function(event) {
        event.preventDefault();
        
        // 클릭한 위치의 피처 찾기
        const feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            if (layer === vectorLayer) {
                return feature;
            }
        });
        
        if (feature) {
            // 피처 삭제
            vectorSource.removeFeature(feature);
            updateStatus('도형이 삭제되었습니다');
        }
    };
    
    // 우클릭으로 삭제 모드 종료
    window.deleteRightClickHandler = function(event) {
        event.preventDefault();
        disableSelectDeleteMode();
        return false;
    };
    
    map.on('click', window.deleteClickHandler);
    map.on('contextmenu', window.deleteRightClickHandler);
    
    updateStatus('선택 삭제 모드 활성화 - 삭제할 도형을 클릭하세요 (우클릭으로 종료)');
}

/**
 * 선택 삭제 모드 비활성화
 */
function disableSelectDeleteMode() {
    isSelectDeleteMode = false;
    
    // 버튼 텍스트 복원
    const deleteButton = document.querySelector('.clear-btn');
    if (deleteButton && deleteButton.textContent === '삭제 취소') {
        deleteButton.textContent = '선택 삭제';
    }
    
    // 이벤트 핸들러 제거
    if (window.deleteClickHandler) {
        map.un('click', window.deleteClickHandler);
        window.deleteClickHandler = null;
    }
    
    if (window.deleteRightClickHandler) {
        map.un('contextmenu', window.deleteRightClickHandler);
        window.deleteRightClickHandler = null;
    }
    
    updateStatus('선택 삭제 모드 비활성화');
}

/**
 * 모든 그리기 삭제
 */
export function clearAllDrawings() {
    vectorSource.clear();
    
    // 팝업들도 닫기
    if (window.closePOIPopup) {
        window.closePOIPopup();
    }
    
    updateStatus('모든 그리기가 삭제되었습니다');
}

/**
 * 현재 모든 편집 모드 비활성화
 */
export function disableAllEditModes() {
    if (isEditMode) {
        disableEditMode();
    }
    if (isSelectDeleteMode) {
        disableSelectDeleteMode();
    }
}
