/**
 * 🎨 그리기 도구 관리 모듈 (Drawing Tools Management Module)
 * 
 * 【모듈 역할】
 * OpenLayers의 Draw 인터랙션을 활용하여 사용자가 지도 위에 다양한 도형을 그릴 수 있게 합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. UI 버튼 클릭 → toggleTool() 함수 호출
 * 2. 기존 인터랙션 정리 → 새로운 Draw 인터랙션 생성
 * 3. 지도에 인터랙션 추가 → 사용자 입력 대기
 * 4. 사용자 그리기 완료 → 'drawend' 이벤트 발생
 * 5. Feature 생성 → VectorSource에 추가 → 자동으로 도구 해제
 * 
 * 🎯 【제공 기능】
 * - 📏 선(LineString) 그리기: 연결된 점들로 구성된 선분, 우클릭으로 완성
 * - 🔷 다각형(Polygon) 그리기: 닫힌 영역 생성, 더블클릭으로 완성
 * - 🔵 원(Circle) 그리기: 중심점과 반지름 정의, 우클릭으로 취소
 * -  텍스트 라벨: 클릭한 위치에 사용자 입력 텍스트 표시
 * - 🔄 도구 전환: 한 번에 하나의 도구만 활성화, 상호 배타적 작동
 * - 🎭 버튼 상태 관리: 활성화 시 "취소"로 텍스트 변경, 시각적 피드백
 * 
 * 🖱️ 【우클릭 제어 기능】
 * - 선 그리기: 현재 점들로 선 완성
 * - 원 그리기: 그리기 취소
 * - 다른 도구: 기본 동작 유지
 * 
 * 📤 【데이터 연동 관계】
 * - vectorSource ← mapConfig.js 에서 생성된 Vector 소스
 * - map ← mapConfig.js 에서 생성된 지도 객체
 * - editTools.js와 연계하여 삭제 기능 위임
 * 
 * 🔧 【상태 관리】
 * - currentDrawInteraction: 현재 활성화된 그리기 인터랙션
 * - window.currentTool: 전역 도구 상태 관리
 * - 편집 모드와 상호 배타적 작동
 * - 그리기 완료 시 자동으로 도구 해제
 * - 토글 버튼 상태 및 텍스트 동기화
 * 
 * 🎨 【UI 상호작용】
 * - 도구 버튼 클릭 시 active 클래스 추가
 * - 텍스트 입력 시 팝업 인터페이스 제공
 * - 상태바를 통한 사용자 안내 메시지
 */

import { map, vectorSource, vectorLayer, updateStatus } from './mapConfig.js';
import { toggleSelectDeleteMode, clearAllDrawings as clearAll } from './editTools.js';

// 현재 활성화된 그리기 도구 상태
let currentDrawInteraction = null;

// 버튼 원래 텍스트 저장
const originalButtonTexts = {
    'text': '텍스트',
    'line': '선',
    'polygon': '면',
    'circle': '원'
};

/**
 * 버튼을 취소 모드로 설정
 */
function setButtonToCancelMode(button) {
    button.textContent = '취소';
}

/**
 * 버튼 텍스트를 원래대로 복원
 */
function resetButtonText(button, toolType) {
    const originalText = originalButtonTexts[toolType];
    if (originalText) {
        button.textContent = originalText;
    }
}

/**
 * 그리기 도구 토글
 * @param {string} toolType - 도구 타입 ('line', 'polygon', 'circle', 'text')
 * @param {HTMLElement} button - 클릭된 버튼 요소
 */
export function toggleTool(toolType, button) {
    // 편집 모드가 활성화되어 있다면 비활성화
    if (window.disableAllEditModes) {
        window.disableAllEditModes();
    }
    
    // 현재 도구가 활성화되어 있다면 해제
    if (window.currentTool === toolType) {
        deactivateTool();
        resetButtonText(button, toolType);
        window.currentTool = null;
        updateStatus('그리기 도구 해제');
        return;
    }
    
    // 다른 도구들 모두 해제
    deactivateTool();
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
        resetButtonText(btn, btn.onclick?.toString().match(/'(\w+)'/)?.[1] || '');
    });
    
    // 새 도구 활성화
    window.currentTool = toolType;
    button.classList.add('active');
    setButtonToCancelMode(button);
    
    if (toolType === 'text') {
        enableTextMode();
    } else {
        enableDrawing(toolType);
    }
}

/**
 * 현재 활성화된 도구 해제
 */
function deactivateTool() {
    if (currentDrawInteraction) {
        map.removeInteraction(currentDrawInteraction);
        currentDrawInteraction = null;
    }
    
    // 텍스트 모드 해제
    if (window.textModeHandler) {
        map.un('click', window.textModeHandler);
        window.textModeHandler = null;
    }
    
    // 우클릭 이벤트 제거
    if (window.rightClickHandler) {
        map.un('contextmenu', window.rightClickHandler);
        window.rightClickHandler = null;
    }
    
    // 모든 버튼 상태 초기화
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
        const toolType = extractToolTypeFromButton(btn);
        resetButtonText(btn, toolType);
    });
}

/**
 * 버튼에서 도구 타입 추출
 */
function extractToolTypeFromButton(button) {
    // onclick 속성에서 도구 타입 추출
    const onclickStr = button.getAttribute('onclick') || '';
    const match = onclickStr.match(/'(\w+)'/);
    return match ? match[1] : '';
}

/**
 * 그리기 도구 활성화
 * @param {string} type - 그리기 타입 ('line', 'polygon', 'circle')
 */
function enableDrawing(type) {
    let geometryType;
    
    switch(type) {
        case 'line':
            geometryType = 'LineString';
            updateStatus('지도를 클릭하여 선을 그리세요 (더블클릭으로 완료)');
            break;
        case 'polygon':
            geometryType = 'Polygon';
            updateStatus('지도를 클릭하여 다각형을 그리세요 (더블클릭으로 완료)');
            break;
        case 'circle':
            geometryType = 'Circle';
            updateStatus('지도를 클릭하고 드래그하여 원을 그리세요');
            break;
        default:
            return;
    }
    
    currentDrawInteraction = new ol.interaction.Draw({
        source: vectorSource,
        type: geometryType
    });
    
    // 우클릭 취소/완성 기능 추가
    window.rightClickHandler = function(event) {
        event.preventDefault(); // 기본 컨텍스트 메뉴 방지
        
        if (geometryType === 'LineString' && currentDrawInteraction) {
            // 선 그리기 중이면 현재 점들로 완성
            currentDrawInteraction.finishDrawing();
        } else if (geometryType === 'Circle' && currentDrawInteraction) {
            // 원 그리기 중이면 취소
            currentDrawInteraction.abortDrawing();
            deactivateTool();
            window.currentTool = null;
            updateStatus('원 그리기 취소됨');
        } else {
            // 다른 도구들은 취소
            deactivateTool();
            window.currentTool = null;
            updateStatus('그리기 취소됨');
        }
        
        return false;
    };
    
    map.on('contextmenu', window.rightClickHandler);
    
    // 그리기 완료 이벤트
    currentDrawInteraction.on('drawend', function(event) {
        // 그리기 완료 후 자동으로 도구 해제
        setTimeout(() => {
            deactivateTool();
            window.currentTool = null;
            updateStatus('그리기 완료');
        }, 100);
    });
    
    map.addInteraction(currentDrawInteraction);
}

/**
 * 텍스트 입력 모드 활성화
 */
function enableTextMode() {
    updateStatus('지도를 클릭하여 텍스트를 입력하세요');
    
    window.textModeHandler = function(event) {
        const coordinate = event.coordinate;
        
        // 텍스트 입력 받기
        const text = prompt('입력할 텍스트를 작성하세요:');
        if (text && text.trim()) {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(coordinate),
                text: text.trim()
            });
            
            vectorSource.addFeature(feature);
            updateStatus('텍스트 추가 완료');
        }
        
        // 텍스트 모드 해제
        deactivateTool();
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        window.currentTool = null;
    };
    
    map.on('click', window.textModeHandler);
}

/**
 * 모든 그린 도형 삭제 (editTools.js 모듈로 위임)
 */
export function clearAllDrawings() {
    clearAll();
}

/**
 * 선택된 도형 삭제 (editTools.js 모듈로 위임)
 */
export function deleteSelected() {
    toggleSelectDeleteMode();
}

/**
 * 텍스트 입력 확인 (텍스트 도구용)
 */
export function confirmText() {
    const textInput = document.getElementById('textInput');
    const popup = document.querySelector('.text-input-popup');
    
    if (textInput && popup) {
        const text = textInput.value.trim();
        if (text && window.pendingTextCoordinate) {
            // 텍스트 피처 생성
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(window.pendingTextCoordinate),
                text: text
            });
            
            vectorSource.addFeature(feature);
            updateStatus(`텍스트 "${text}" 추가됨`);
        }
        
        // 정리
        textInput.value = '';
        popup.style.display = 'none';
        window.pendingTextCoordinate = null;
    }
}

/**
 * 텍스트 입력 취소
 */
export function cancelText() {
    const textInput = document.getElementById('textInput');
    const popup = document.querySelector('.text-input-popup');
    
    if (textInput && popup) {
        textInput.value = '';
        popup.style.display = 'none';
        window.pendingTextCoordinate = null;
        updateStatus('텍스트 입력 취소됨');
    }
}
