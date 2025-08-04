// 전역 변수
window.gisModules = {};
window.gisMap = null;
window.gisLayers = {};

/**
 * 애플리케이션 초기화
 */
async function initializeApplication() {
    console.log('🚀 애플리케이션 시작');
    
    try {
        // 1. 모듈 로딩
        console.log('📦 모듈 로딩...');
        window.gisModules.mapConfig = await import('./modules/mapConfig.js');
        window.gisModules.ui = await import('./modules/ui.js');
        window.gisModules.layerManager = await import('./modules/layerManager.js');
        console.log('✅ 모듈 로딩 완료');
        
        // 2. 지도 초기화
        console.log('🗺️ 지도 초기화...');
        const { mapConfig } = window.gisModules;
        
        // 좌표계 설정
        if (!mapConfig.setupProjection()) {
            throw new Error('좌표계 설정 실패');
        }
        
        // 레이어 생성
        const baseLayers = mapConfig.createBaseLayers();
        if (!baseLayers) {
            throw new Error('베이스 레이어 생성 실패');
        }
        
        const overlayResult = mapConfig.createOverlayLayers();
        if (!overlayResult) {
            throw new Error('오버레이 레이어 생성 실패');
        }
        
        // 지도 생성
        const map = mapConfig.createMap(baseLayers, overlayResult.layers);
        if (!map) {
            throw new Error('지도 생성 실패');
        }
        
        // 전역 변수에 저장
        window.gisMap = map;
        window.gisLayers.base = baseLayers;
        window.gisLayers.overlay = overlayResult.layers;
        window.gisLayers.sources = overlayResult.sources;
        
        console.log('✅ 지도 초기화 완료');
        
        // 3. UI 생성
        console.log('🎨 UI 생성...');
        window.gisModules.ui.createLayerPanel();
        console.log('✅ UI 생성 완료');
        
        // 4. 레이어 매니저 초기화
        console.log('🔗 레이어 매니저 초기화...');
        window.gisModules.layerManager.initializeLayerManager(
            window.gisMap,
            window.gisLayers.base,
            window.gisLayers.overlay
        );
        console.log('✅ 레이어 매니저 초기화 완료');
        
        // 5. 로딩 화면 숨기기
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        console.log('� 애플리케이션 초기화 완료!');
        
    } catch (error) {
        console.error('❌ 초기화 오류:', error);
        
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                    <div>오류: ${error.message}</div>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        새로고침
                    </button>
                </div>
            `;
        }
    }
}

// 애플리케이션 시작
initializeApplication();
