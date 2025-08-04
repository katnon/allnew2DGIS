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
 * 3️⃣ 🧭 나침반 (Compass) - 좌하단
 *    - 동서남북 방위 표시
 *    - 동적 회전 기능
 *    - 클릭 시 북쪽 정렬
 * 
 * 4️⃣ � 스케일 바 (Scale Bar) - 좌하단
 *    - 동적 거리 표시
 *    - 지도 줌 레벨에 따른 자동 조정
 *    - 미터/킬로미터 단위 자동 변환
 * 
 * 5️⃣ �🔍 POI 관련 UI - 좌측
 *    - 재검색 버튼: POI 데이터 갱신
 *    - POI 목록 패널: 검색 결과 표시
 * 
 * 6️⃣ 📷 이미지 저장 기능
 *    - 현재 화면 캡처 및 다운로드
 *    - 브라우저 기본 저장 다이얼로그 활용
 * 
 * 7️⃣ ⏳ 로딩 화면 (Loading Screen)
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
 * 나침반 컴포넌트 생성 및 초기화
 */
export function createCompass() {
    const compass = document.createElement('div');
    compass.id = 'compass';
    compass.className = 'compass-container';
    
    compass.innerHTML = `
        <div class="compass-circle">
            <div class="compass-needle" id="compass-needle">
                <div class="direction north">북</div>
                <div class="direction east">동</div>
                <div class="direction south">남</div>
                <div class="direction west">서</div>
                <div class="compass-center"></div>
            </div>
        </div>
    `;
    
    // 스타일 추가
    addCompassStyles();
    
    // 이벤트 리스너 등록
    setupCompassEvents(compass);
    
    // DOM에 추가
    document.body.appendChild(compass);
    
    console.log('🧭 나침반이 생성되었습니다.');
    return compass;
}

/**
 * 스케일 바 컴포넌트 생성 및 초기화
 */
export function createScaleBar() {
    const scaleBar = document.createElement('div');
    scaleBar.id = 'scale-bar';
    scaleBar.className = 'scale-bar-container';
    
    scaleBar.innerHTML = `
        <div class="scale-line" id="scale-line"></div>
        <div class="scale-text" id="scale-text">0 m</div>
    `;
    
    // 스타일 추가
    addScaleBarStyles();
    
    // DOM에 추가
    document.body.appendChild(scaleBar);
    
    console.log('📏 스케일 바가 생성되었습니다.');
    return scaleBar;
}

/**
 * 나침반 스타일 추가
 */
function addCompassStyles() {
    if (document.getElementById('compass-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'compass-styles';
    style.textContent = `
        .compass-container {
            position: absolute;
            bottom: 120px;
            left: 20px;
            width: 80px;
            height: 80px;
            z-index: 1000;
            user-select: none;
        }
        
        .compass-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.95);
            border: 3px solid #2c3e50;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .compass-needle {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .direction {
            position: absolute;
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
            transform: translate(-50%, -50%);
        }
        
        .direction.north {
            top: 15%;
            left: 50%;
            color: #e74c3c;
            font-size: 14px;
        }
        
        .direction.east {
            top: 50%;
            right: 10%;
            left: auto;
            transform: translate(50%, -50%);
        }
        
        .direction.south {
            bottom: 10%;
            left: 50%;
            top: auto;
            transform: translate(-50%, 50%);
        }
        
        .direction.west {
            top: 50%;
            left: 10%;
            transform: translate(-50%, -50%);
        }
        
        .compass-center {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            background: #e74c3c;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        
        .compass-center::before {
            content: '';
            position: absolute;
            top: -25px;
            left: 50%;
            width: 2px;
            height: 20px;
            background: #e74c3c;
            transform: translateX(-50%);
        }
        
        .compass-center::after {
            content: '';
            position: absolute;
            bottom: -25px;
            left: 50%;
            width: 2px;
            height: 20px;
            background: #34495e;
            transform: translateX(-50%);
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * 스케일 바 스타일 추가
 */
function addScaleBarStyles() {
    if (document.getElementById('scale-bar-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'scale-bar-styles';
    style.textContent = `
        .scale-bar-container {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 6px;
            padding: 8px 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            font-family: 'Segoe UI', sans-serif;
            z-index: 1000;
        }
        
        .scale-line {
            width: 100px;
            height: 4px;
            background: linear-gradient(to right, #000 0%, #000 20%, transparent 20%, transparent 40%, #000 40%, #000 60%, transparent 60%, transparent 80%, #000 80%, #000 100%);
            border: 1px solid #333;
            margin-bottom: 4px;
            transition: width 0.3s ease;
        }
        
        .scale-text {
            font-size: 11px;
            font-weight: 600;
            color: #2c3e50;
            text-align: center;
            line-height: 1;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * 나침반 이벤트 설정 (표시 전용, 클릭 비활성화)
 */
function setupCompassEvents(compass) {
    // 클릭 이벤트 제거 - 표시 전용으로 변경
    compass.style.cursor = 'default';
    
    // 호버 효과도 제거
    compass.addEventListener('mouseenter', function() {
        this.style.transform = 'none';
    });
}

/**
 * 나침반 회전 업데이트 (비활성화됨 - 표시 전용)
 * @param {number} rotation - 라디안 단위의 회전각 (사용하지 않음)
 */
export function updateCompassRotation(rotation) {
    // 나침반은 고정된 북쪽 방향만 표시
    // 회전 기능 비활성화
}

/**
 * 스케일 바 업데이트
 * @param {number} resolution - 현재 해상도
 */
export function updateScaleBar(resolution) {
    const scaleLine = document.getElementById('scale-line');
    const scaleText = document.getElementById('scale-text');
    
    if (!scaleLine || !scaleText) return;
    
    // 100px에 해당하는 실제 거리 계산 (미터 단위)
    const pixelDistance = 100;
    const realDistance = pixelDistance * resolution;
    
    let displayDistance;
    let unit;
    let scaleWidth;
    
    if (realDistance < 1000) {
        // 1km 미만은 미터 단위
        const roundedDistance = getRoundedDistance(realDistance);
        displayDistance = roundedDistance;
        unit = 'm';
        scaleWidth = (roundedDistance / realDistance) * pixelDistance;
    } else {
        // 1km 이상은 킬로미터 단위
        const distanceInKm = realDistance / 1000;
        const roundedDistance = getRoundedDistance(distanceInKm);
        displayDistance = roundedDistance;
        unit = 'km';
        scaleWidth = (roundedDistance * 1000 / realDistance) * pixelDistance;
    }
    
    scaleLine.style.width = `${scaleWidth}px`;
    scaleText.textContent = `${displayDistance} ${unit}`;
}

/**
 * 적절한 스케일 거리로 반올림
 * @param {number} distance - 원본 거리
 * @returns {number} - 반올림된 거리
 */
function getRoundedDistance(distance) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(distance)));
    const normalized = distance / magnitude;
    
    if (normalized < 2) return magnitude;
    if (normalized < 5) return 2 * magnitude;
    return 5 * magnitude;
}

/**
 * 📷 이미지 저장 기능 - CORS 안전한 버전
 * OpenLayers 지도를 안전하게 이미지로 저장합니다.
 */
export function saveMapAsImage() {
    try {
        // 파일명 입력 받기
        const fileName = prompt('저장할 파일명을 입력하세요:', `map-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`);
        
        if (fileName === null) return; // 취소한 경우
        
        // 상태 메시지 표시
        if (window.updateStatus) {
            window.updateStatus('이미지 생성 중...');
        }
        
        console.log('📷 이미지 저장 시작...');
        
        // html2canvas를 사용한 안전한 캡처
        captureWithHtml2Canvas(fileName);
        
    } catch (error) {
        console.error('이미지 저장 중 오류 발생:', error);
        alert('이미지 저장에 실패했습니다: ' + error.message);
        
        if (window.updateStatus) {
            window.updateStatus('이미지 저장 실패');
        }
    }
}

/**
 * html2canvas를 사용한 화면 캡처
 */
function captureWithHtml2Canvas(fileName) {
    // html2canvas 동적 로드 확인
    if (typeof html2canvas === 'undefined') {
        console.log('html2canvas 라이브러리 로딩 중...');
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = function() {
            console.log('html2canvas 라이브러리 로드 완료');
            executeScreenCapture(fileName);
        };
        
        script.onerror = function() {
            console.error('html2canvas 라이브러리 로드 실패');
            alert('이미지 저장 라이브러리를 로드할 수 없습니다.');
            
            if (window.updateStatus) {
                window.updateStatus('라이브러리 로드 실패');
            }
        };
        
        document.head.appendChild(script);
    } else {
        executeScreenCapture(fileName);
    }
}

/**
 * 화면 캡처 실행
 */
function executeScreenCapture(fileName) {
    console.log('화면 캡처 시작...');
    
    // 지도 영역만 캡처하도록 설정
    const mapContainer = document.querySelector('.main-content') || document.body;
    
    const options = {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: true,
        removeContainer: false,
        imageTimeout: 10000,
        // 특정 요소만 캡처
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
        x: 0,
        y: 0
    };
    
    html2canvas(mapContainer, options)
        .then(function(canvas) {
            console.log('📷 화면 캡처 성공, 이미지 생성 중...');
            
            // Canvas를 Blob으로 변환
            canvas.toBlob(function(blob) {
                if (blob) {
                    downloadImageBlob(blob, fileName);
                    
                    console.log('✅ 이미지 저장 완료');
                    if (window.updateStatus) {
                        window.updateStatus('이미지 저장 완료');
                    }
                } else {
                    console.error('Blob 생성 실패');
                    // Fallback: 데이터 URL 방식
                    fallbackToDataURL(canvas, fileName);
                }
            }, 'image/png', 1.0);
        })
        .catch(function(error) {
            console.error('html2canvas 실패:', error);
            alert('화면 캡처에 실패했습니다: ' + error.message);
            
            if (window.updateStatus) {
                window.updateStatus('화면 캡처 실패');
            }
        });
}

/**
 * 데이터 URL 방식 대체 방법
 */
function fallbackToDataURL(canvas, fileName) {
    try {
        console.log('Blob 생성 실패, 데이터 URL 방식 시도...');
        
        const dataURL = canvas.toDataURL('image/png', 1.0);
        
        // 데이터 URL로 직접 다운로드
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileName}.png`;
        
        // 링크를 DOM에 추가하고 클릭
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ 데이터 URL 방식으로 이미지 저장 완료');
        if (window.updateStatus) {
            window.updateStatus('이미지 저장 완료');
        }
        
    } catch (error) {
        console.error('데이터 URL 저장도 실패:', error);
        alert('이미지 저장에 완전히 실패했습니다.');
        
        if (window.updateStatus) {
            window.updateStatus('이미지 저장 실패');
        }
    }
}

/**
 * Blob을 파일로 다운로드
 */
function downloadImageBlob(blob, fileName) {
    try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `${fileName}.png`;
        
        // 링크를 DOM에 추가하고 클릭
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 메모리 정리
        URL.revokeObjectURL(url);
        
        console.log('📂 파일 다운로드 완료:', `${fileName}.png`);
        
    } catch (error) {
        console.error('파일 다운로드 실패:', error);
        throw error;
    }
}

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
