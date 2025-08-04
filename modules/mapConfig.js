/**
 * 🗺️ 지도 설정 및 초기화 모듈 (Map Configuration Module)
 * 
 * 【모듈 역할】
 * OpenLayers 지도 객체 생성, 베이스맵 레이어 설정, 전역 상태 관리를 담당하는 핵심 모듈입니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. 애플리케이션 시작 → initMap() 호출
 * 2. 베이스맵 레이어들 생성 (OSM, VWorld 기본/위성)
 * 3. 벡터 레이어들 생성 (그리기, 행정구역, POI)
 * 4. 지도 객체 생성 및 DOM에 마운트
 * 5. 기본 상호작용 설정 (줌, 패닝, 클릭 이벤트)
 * 6. 다른 모듈들에서 지도 객체 참조
 * 
 * 🎯 【제공 기능】
 * - 🗺️ 지도 초기화: OpenLayers Map 객체 생성 및 설정
 * - 🌍 베이스맵 관리: OSM, VWorld 기본지도, VWorld 위성지도
 * - 📊 레이어 구조: 벡터 레이어들 생성 및 계층 관리
 * - 🖱️ 기본 상호작용: 지도 클릭, 줌, 패닝 이벤트 처리
 * - 🔧 전역 상태: API 키, 지도 객체, 레이어 소스들 관리
 * 
 * 📤 【데이터 연동 관계】
 * - map → 모든 모듈에서 참조하는 중앙 지도 객체
 * - vectorSource → drawTools.js, editTools.js에서 사용
 * - adminSource → layerManager.js에서 관리
 * - poiSource → poi.js에서 관리
 * - 베이스맵 레이어들 → layerManager.js에서 전환 제어
 * 
 * 🔧 【상태 관리】
 * - 지도 뷰 상태 (중심점, 줌 레벨)
 * - 레이어 가시성 상태
 * - API 키 및 설정값 저장
 * - 현재 선택된 피처 상태
 */

// API 키 설정
export const KAKAO_REST_KEY = '01189c8b083647188b7952d1b7d92d9c';
export const VWORLD_KEY = '32775BCF-A14A-3B57-B0C6-C8C0743E7DD1';

// 전역 변수들
export let map;
export let vectorSource;
export let vectorLayer;
export let adminSource;
export let adminLayer;
export let poiSource;
export let poiLayer;
export let osmLayer, vworldLayer, satelliteLayer;

/**
 * 지도 초기화 함수
 * OpenLayers 지도 객체와 모든 레이어들을 생성하고 설정합니다.
 */
export function initMap() {
    // 벡터 소스와 레이어 (그리기용)
    vectorSource = new ol.source.Vector();
    vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: function(feature) {
            const geometryType = feature.getGeometry().getType();
            const isSelected = feature.get('selected');
            
            if (geometryType === 'Point') {
                // 텍스트 레이블
                const text = feature.get('text');
                if (text) {
                    return new ol.style.Style({
                        text: new ol.style.Text({
                            text: text,
                            font: '14px Arial',
                            fill: new ol.style.Fill({ color: '#000' }),
                            stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                            offsetY: -10
                        }),
                        image: new ol.style.Circle({
                            radius: 4,
                            fill: new ol.style.Fill({ color: isSelected ? '#ff0000' : '#ff6600' }),
                            stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
                        })
                    });
                }
                // 일반 포인트
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: isSelected ? '#ff0000' : '#ff6600' }),
                        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                    })
                });
            } else if (geometryType === 'LineString') {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: isSelected ? '#ff0000' : '#3399CC',
                        width: 3
                    })
                });
            } else if (geometryType === 'Polygon') {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: isSelected ? '#ff0000' : '#ffcc33',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: isSelected ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)'
                    })
                });
            } else if (geometryType === 'Circle') {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: isSelected ? '#ff0000' : '#cc33ff',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: isSelected ? 'rgba(255, 0, 0, 0.1)' : 'rgba(204, 51, 255, 0.1)'
                    })
                });
            }
        }
    });
    
    // 행정구역 레이어
    adminSource = new ol.source.Vector();
    adminLayer = new ol.layer.Vector({
        source: adminSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 255, 0.8)',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.05)'
            })
        })
    });
    
    // POI 레이어
    poiSource = new ol.source.Vector();
    poiLayer = new ol.layer.Vector({
        source: poiSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: '#ff0000' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });
    
    // 베이스맵 레이어들 생성
    osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    
    vworldLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`
        })
    });
    
    satelliteLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Satellite/{z}/{y}/{x}.jpeg`
        })
    });
    
    // 지도 생성 (모든 베이스맵을 레이어로 추가)
    map = new ol.Map({
        target: 'map',
        layers: [
            vworldLayer,  // 기본 베이스맵 (활성화)
            osmLayer,     // OSM (비활성화)
            satelliteLayer, // 위성지도 (비활성화)
            adminLayer,
            poiLayer,
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([127.0276, 37.4979]), // 강남역
            zoom: 11
        })
    });
    
    // 베이스맵 초기 설정 (VWorld만 활성화)
    osmLayer.setVisible(false);
    satelliteLayer.setVisible(false);
    vworldLayer.setVisible(true);
    
    // 오버레이 레이어들 기본적으로 비활성화
    adminLayer.setVisible(false);
    poiLayer.setVisible(false);
    
    // 클릭 이벤트 (피처 선택용)
    map.on('click', function(event) {
        // 그리기 모드일 때는 선택 기능 비활성화
        if (window.currentTool) return;
        
        // 모든 피처의 선택 상태 해제
        vectorSource.getFeatures().forEach(feature => {
            feature.set('selected', false);
        });
        
        // 클릭된 피처 찾기
        const feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            if (layer === vectorLayer) return feature;
        });
        
        if (feature) {
            feature.set('selected', true);
        }
        
        // 레이어 새로고침
        vectorLayer.getSource().changed();
    });
    
    updateStatus('지도 로딩 완료');
}

/**
 * 상태 메시지 업데이트
 * @param {string} message - 표시할 상태 메시지
 */
export function updateStatus(message) {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * 행정구역 데이터 로드
 */
export async function loadAdminData() {
    if (adminSource.getFeatures().length > 0) {
        // 이미 로드된 경우
        return;
    }
    
    try {
        updateStatus('행정구역 데이터 로딩 중...');
        const response = await fetch('/public/HangJeongDong_ver20250401.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojsonData = await response.json();
        
        // GeoJSON 형식으로 피처 추가
        const format = new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857' // Web Mercator
        });
        
        const features = format.readFeatures(geojsonData);
        adminSource.addFeatures(features);
        
        updateStatus(`행정구역 ${features.length}개 로드 완료`);
        
    } catch (error) {
        console.error('행정구역 데이터 로드 실패:', error);
        updateStatus('행정구역 데이터 로드 실패');
    }
}
