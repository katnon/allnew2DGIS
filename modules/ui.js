/**
 * 🎨 UI 컴포넌트 관리 모듈 (User Interface Components Management Module)
 * 
 * 【모듈 역할】
 * 애플리케이션의 모든 사용자 인터페이스 요소를 동적으로 생성하고 관리합니다.
 * 사용자와 GIS 기능 사이의 브릿지 역할을 수행합니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * main → create*Panel() → DOM 요소 생성 → document.body 추가 → 사용자 상호작용
 * 사용자 액션 → 이벤트 리스너 → 해당 기능 모듈 호출 → 결과 UI 업데이트
 * 
 * 🎯 【제공하는 UI 컴포넌트】
 * 
 * 1️⃣ 🛠️ 도구 패널 (Tools Panel) - 우하단
 *    - 그리기 도구들: 선, 다각형, 원, 텍스트
 *    - 측정 도구들: 거리, 면적 측정
 *    - 편집 도구들: 수정, 삭제, 전체삭제
 *    - 유틸리티: 이미지 저장, 경로 설정
 * 
 * 2️⃣ 📋 레이어 패널 (Layers Panel) - 우상단  
 *    - 베이스 레이어 선택 (라디오 버튼)
 *    - 오버레이 레이어 토글 (체크박스)
 * 
 * 3️⃣ 🧭 나침반 (Compass) - 좌상단
 *    - 현재 지도 회전 각도 표시
 *    - 클릭 시 북쪽 정렬
 * 
 * 4️⃣ 🔍 POI 관련 UI - 좌측
 *    - 재검색 버튼: POI 데이터 갱신
 *    - POI 목록 패널: 검색 결과 표시
 * 
 * 5️⃣ ⏳ 로딩 화면 (Loading Screen)
 *    - 모듈 로딩 진행 상황 표시
 *    - 사용자 대기 경험 개선
 * 
 * 🎨 【UI 디자인 특징】
 * - 반응형 디자인: 다양한 화면 크기 대응
 * - 접기/펼치기: 공간 효율성 최대화
 * - 시각적 피드백: 호버, 활성화 상태 표시  
 * - 일관된 스타일: 통일된 색상과 레이아웃
 * 
 * 🔧 【상태 관리】
 * - 버튼 활성화 상태 동기화
 * - 패널 표시/숨김 상태 관리
 * - 사용자 설정 로컬스토리지 저장
 */

/**
 * 레이어 패널 생성 및 초기화
 */
export function createLayerPanel() {
    const layerPanel = document.createElement('div');
    layerPanel.id = 'layer-panel';
    layerPanel.className = 'panel layer-panel';
    
    layerPanel.innerHTML = `
        <div class="panel-header" onclick="toggleLayerPanel()">
            <span class="panel-icon">📋</span>
            <span class="panel-title">레이어</span>
            <span class="panel-toggle" id="layer-toggle">▼</span>
        </div>
        <div class="panel-content" id="layer-content">
            <!-- 베이스 레이어 섹션 -->
            <div class="layer-section">
                <h4 class="section-title">🗺️ 베이스 레이어</h4>
                <div class="layer-group">
                    <label class="layer-item">
                        <input type="radio" name="baseLayer" value="osm" checked>
                        <span class="layer-icon">🌍</span>
                        <span class="layer-name">OSM</span>
                    </label>
                    <label class="layer-item">
                        <input type="radio" name="baseLayer" value="vworldBase">
                        <span class="layer-icon">🏢</span>
                        <span class="layer-name">VWorld (Gray)</span>
                    </label>
                    <label class="layer-item">
                        <input type="radio" name="baseLayer" value="vworldSatellite">
                        <span class="layer-icon">🛰️</span>
                        <span class="layer-name">VWorld Satellite</span>
                    </label>
                </div>
            </div>
            
            <!-- 오버레이 레이어 섹션 -->
            <div class="layer-section">
                <h4 class="section-title">📍 오버레이 레이어</h4>
                <div class="layer-group">
                    <label class="layer-item">
                        <input type="checkbox" data-layer="admin">
                        <span class="layer-icon">🏛️</span>
                        <span class="layer-name">행정구역 경계</span>
                    </label>
                    <label class="layer-item">
                        <input type="checkbox" data-layer="poi">
                        <span class="layer-icon">📍</span>
                        <span class="layer-name">주요 지점(POI)</span>
                    </label>
                    <label class="layer-item">
                        <input type="checkbox" data-layer="draw">
                        <span class="layer-icon">✏️</span>
                        <span class="layer-name">그리기 레이어</span>
                    </label>
                    <label class="layer-item">
                        <input type="checkbox" data-layer="text">
                        <span class="layer-icon">📝</span>
                        <span class="layer-name">텍스트 레이어</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // 스타일 추가
    addLayerPanelStyles();
    
    // 이벤트 리스너 등록
    setupLayerPanelEvents(layerPanel);
    
    // DOM에 추가
    document.body.appendChild(layerPanel);
    
    console.log('📋 레이어 패널이 생성되었습니다.');
    return layerPanel;
}

/**
 * 레이어 패널 스타일 추가
 */
function addLayerPanelStyles() {
    if (document.getElementById('layer-panel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'layer-panel-styles';
    style.textContent = `
        .layer-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 250px;
            max-height: 400px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 1000;
            font-family: 'Segoe UI', sans-serif;
        }
        
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px 12px 0 0;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
        }
        
        .panel-header:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
        }
        
        .panel-icon {
            font-size: 16px;
            margin-right: 8px;
        }
        
        .panel-title {
            flex: 1;
            font-weight: 600;
            font-size: 14px;
        }
        
        .panel-toggle {
            font-size: 12px;
            transition: transform 0.2s ease;
        }
        
        .panel-toggle.collapsed {
            transform: rotate(-90deg);
        }
        
        .panel-content {
            max-height: 350px;
            overflow-y: auto;
            transition: all 0.3s ease;
        }
        
        .panel-content.collapsed {
            max-height: 0;
            overflow: hidden;
        }
        
        .layer-section {
            padding: 16px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .layer-section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            margin: 0 0 12px 0;
            font-size: 13px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
        }
        
        .layer-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .layer-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: transparent;
        }
        
        .layer-item:hover {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .layer-item input[type="radio"],
        .layer-item input[type="checkbox"] {
            margin-right: 8px;
            cursor: pointer;
        }
        
        .layer-icon {
            font-size: 14px;
            margin-right: 8px;
            width: 20px;
            text-align: center;
        }
        
        .layer-name {
            font-size: 13px;
            color: #444;
            font-weight: 500;
        }
        
        .layer-item input:checked + .layer-icon + .layer-name {
            color: #667eea;
            font-weight: 600;
        }
        
        /* 스크롤바 스타일링 */
        .panel-content::-webkit-scrollbar {
            width: 6px;
        }
        
        .panel-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        .panel-content::-webkit-scrollbar-thumb {
            background: #c0c0c0;
            border-radius: 3px;
        }
        
        .panel-content::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * 레이어 패널 이벤트 설정
 */
function setupLayerPanelEvents(layerPanel) {
    // 베이스 레이어 라디오 버튼 이벤트
    const baseLayerRadios = layerPanel.querySelectorAll('input[name="baseLayer"]');
    baseLayerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked && window.gisModules && window.gisModules.layerManager) {
                window.gisModules.layerManager.setBaseLayer(this.value);
            }
        });
    });
    
    // 오버레이 레이어 체크박스 이벤트
    const overlayCheckboxes = layerPanel.querySelectorAll('input[data-layer]');
    overlayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const layerName = this.getAttribute('data-layer');
            if (window.gisModules && window.gisModules.layerManager) {
                window.gisModules.layerManager.toggleOverlayLayer(layerName);
            }
        });
    });
}

/**
 * 레이어 패널 토글 함수 (전역 함수로 등록)
 */
window.toggleLayerPanel = function() {
    const content = document.getElementById('layer-content');
    const toggle = document.getElementById('layer-toggle');
    
    if (content && toggle) {
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
            content.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
            toggle.textContent = '▼';
        } else {
            content.classList.add('collapsed');
            toggle.classList.add('collapsed');
            toggle.textContent = '▶';
        }
    }
};

/**
 * 로딩 화면 숨기기
 */
export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('⏳ 로딩 화면을 숨겼습니다.');
    }
}

/**
 * 로딩 화면 표시
 */
export function showLoadingScreen(message = '로딩 중...') {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        const messageElement = loadingScreen.querySelector('div > div');
        if (messageElement) {
            messageElement.textContent = message;
        }
        console.log('⏳ 로딩 화면을 표시했습니다.');
    }
}
