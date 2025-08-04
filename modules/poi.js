/**
 * 📍 POI 관리 모듈 (Point of Interest Management Module)
 * 
 * 【모듈 역할】
 * Kakao REST API를 사용하여 카테고리별 POI를 검색하고 지도에 표시하는 모듈입니다.
 * 
 * 🔄 【정보 흐름 (Data Flow)】
 * 1. POI 레이어 활성화 → searchNearbyPOIs() 자동 호출
 * 2. 현재 지도 중심점과 반경 기반 Kakao API 요청
 * 3. 카테고리별 POI 데이터 수신 및 파싱
 * 4. Feature 생성 → poiSource에 추가 → 지도에 마커 표시
 * 5. POI 클릭 → 상세 정보 팝업 표시
 * 
 * 🎯 【제공 기능】
 * - 🔍 자동 POI 검색: 지도 중심 기준 반경 1.5km 내 모든 카테고리 통합 검색
 * - 📍 카테고리별 분류: 음식점, 카페, 주유소, 지하철역, 은행, 편의점, 병원, 약국 등
 * - 🎯 클릭 기반 검색: 지도 클릭 시 해당 좌표에서 가장 가까운 POI 검색
 * - 📊 거리 계산: 정확한 미터/킬로미터 단위 거리 표시
 * - 💬 팝업 시스템: POI 상세 정보 표시 (이름, 주소, 전화번호, 거리)
 * - 🟢 임시 마커: 클릭한 위치에 녹색 마커로 시각적 피드백
 * - 📋 리스트 패널: 검색 결과를 목록으로 표시 및 개별 접근
 * - 🔄 재검색 기능: 지도 이동 후 현재 위치에서 다시 검색
 * 
 * 📤 【데이터 연동 관계】
 * - poiSource ← mapConfig.js 에서 생성된 VectorSource
 * - map ← mapConfig.js 에서 생성된 지도 객체
 * - KAKAO_REST_KEY ← mapConfig.js 에서 가져온 API 키
 * 
 * 🔧 【상태 관리】
 * - currentPOIs: 현재 검색된 POI 데이터 배열
 * - isSearching: 검색 중 상태 플래그
 * - poiPopup: 팝업 오버레이 객체
 * - window.tempPOIFeature: 임시 마커 피처
 */

import { map, poiSource, poiLayer, KAKAO_REST_KEY, updateStatus } from './mapConfig.js';

// 팝업 오버레이
let poiPopup = null;
let poiPopupElement = null;

// 현재 POI 데이터 저장
let currentPOIs = [];

// 검색할 카테고리들 (모든 카테고리를 통합 검색)
const POI_CATEGORIES = [
    'FD6',    // 음식점
    'CE7',    // 카페
    'OL7',    // 주유소
    'SW8',    // 지하철역
    'BK9',    // 은행
    'CS2',    // 편의점
    'HP8',    // 병원
    'PM9',    // 약국
    'MT1',    // 대형마트
    'SC4',    // 학교
    'AC5',    // 학원
    'PK6',    // 주차장
    'AT4'     // 관광명소
];

// 현재 검색 상태
let isSearching = false;

/**
 * 주변 POI 자동 검색 (모든 카테고리 통합)
 */
export async function searchNearbyPOIs() {
    if (isSearching) {
        updateStatus('검색 중입니다...');
        return;
    }
    
    isSearching = true;
    updateStatus('주변 POI 검색 중...');
    
    try {
        // POI 레이어 초기화
        poiSource.clear();
        
        // 현재 지도 중심점 가져오기
        const view = map.getView();
        const center = ol.proj.toLonLat(view.getCenter());
        const [longitude, latitude] = center;
        
        let allPOIs = [];
        
        // 각 카테고리별로 검색
        for (const category of POI_CATEGORIES) {
            try {
                const response = await fetch(
                    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=${longitude}&y=${latitude}&radius=1500&size=5`,
                    {
                        headers: {
                            'Authorization': `KakaoAK ${KAKAO_REST_KEY}`
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.documents && data.documents.length > 0) {
                        allPOIs.push(...data.documents);
                    }
                }
            } catch (error) {
                console.warn(`카테고리 ${category} 검색 실패:`, error);
            }
        }
        
        if (allPOIs.length > 0) {
            // 중복 제거 (같은 place_id 기준)
            const uniquePOIs = [];
            const seenIds = new Set();
            
            allPOIs.forEach(poi => {
                if (!seenIds.has(poi.id)) {
                    seenIds.add(poi.id);
                    uniquePOIs.push(poi);
                }
            });
            
            // 거리를 숫자로 변환 (Kakao API에서 distance는 미터 단위 문자열)
            uniquePOIs.forEach(poi => {
                poi.distance = parseFloat(poi.distance) || 0; // 미터 단위
            });
            uniquePOIs.sort((a, b) => a.distance - b.distance);
            const finalPOIs = uniquePOIs.slice(0, 50);
            
            // POI 데이터를 지도에 추가
            finalPOIs.forEach(poi => {
                const coordinate = ol.proj.fromLonLat([parseFloat(poi.x), parseFloat(poi.y)]);
                
                const feature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinate),
                    name: poi.place_name,
                    address: poi.address_name,
                    phone: poi.phone || '',
                    category: poi.category_group_name || '기타',
                    distance: poi.distance
                });
                
                poiSource.addFeature(feature);
            });
            
            // POI 리스트 UI 업데이트
            updatePOIList(finalPOIs);
            
            // 현재 POI 데이터 저장
            currentPOIs = finalPOIs;
            
            // POI 클릭 이벤트 설정
            setupPOIClickHandler();
            
            // POI 레이어 활성화
            poiLayer.setVisible(true);
            updateStatus(`주변 POI ${finalPOIs.length}개 검색 완료`);
        } else {
            updateStatus('주변 POI 검색 결과 없음');
        }
        
    } catch (error) {
        console.error('POI 검색 오류:', error);
        updateStatus('POI 검색 중 오류가 발생했습니다.');
    } finally {
        isSearching = false;
    }
}

/**
 * POI 레이어 토글
 */
export function togglePOILayer() {
    const isVisible = poiLayer.getVisible();
    const newVisibility = !isVisible;
    
    poiLayer.setVisible(newVisibility);
    
    // 재검색 버튼 표시/숨김
    const researchButton = document.getElementById('research-poi-btn');
    if (researchButton) {
        researchButton.style.display = newVisibility ? 'block' : 'none';
    }
    
    if (newVisibility) {
        updateStatus('주변검색(POI) 레이어 활성화');
        // 자동으로 주변 POI 검색 실행
        searchNearbyPOIs();
    } else {
        updateStatus('주변검색(POI) 레이어 비활성화');
        // POI 데이터 초기화
        poiSource.clear();
        currentPOIs = [];
        
        // 팝업 닫기
        if (window.closePOIPopup) {
            window.closePOIPopup();
        }
        
        // 클릭 핸들러 제거
        if (window.poiClickHandler) {
            map.un('click', window.poiClickHandler);
            window.poiClickHandler = null;
        }
    }
}

/**
 * POI 레이어 초기화
 */
export function clearPOI() {
    poiSource.clear();
    poiLayer.setVisible(false);
    
    // 재검색 버튼 숨김
    const researchButton = document.getElementById('research-poi-btn');
    if (researchButton) {
        researchButton.style.display = 'none';
    }
    
    updateStatus('POI 레이어 초기화 완료');
}

/**
 * POI 리스트 UI 업데이트
 */
function updatePOIList(pois) {
    const listContent = document.getElementById('poiListContent');
    const countElement = document.getElementById('poiCount');
    
    if (!listContent || !countElement) {
        console.warn('POI 리스트 UI 요소를 찾을 수 없습니다.');
        return;
    }
    
    listContent.innerHTML = '';
    countElement.textContent = pois.length;
    
    pois.forEach((poi, index) => {
        const div = document.createElement('div');
        div.className = 'poi-item';
        div.dataset.poiIndex = index; // POI 인덱스 저장
        
        // 거리 텍스트 포맷팅 (distance는 미터 단위)
        const distanceText = (poi.distance && poi.distance < 1000) ? 
            `${Math.round(poi.distance)}m` : 
            `${(poi.distance / 1000).toFixed(1)}km`;
        
        div.innerHTML = `
            <div class="poi-name">${poi.place_name}</div>
            <div class="poi-category">${poi.category_group_name || '기타'}</div>
            <div class="poi-address">${poi.address_name}</div>
            <div class="poi-distance">${distanceText}</div>
        `;
        
        div.addEventListener('click', () => {
            const coordinate = ol.proj.fromLonLat([parseFloat(poi.x), parseFloat(poi.y)]);
            
            // 지도 이동
            map.getView().animate({
                center: coordinate,
                zoom: 17,
                duration: 500
            });
            
            // 팝업 표시
            showPOIPopup(coordinate, poi);
        });
        
        listContent.appendChild(div);
    });
    
    // POI 리스트 패널 표시
    const poiListPanel = document.getElementById('poiListPanel');
    if (poiListPanel) {
        poiListPanel.style.display = 'block';
    }
}

/**
 * POI 클릭 이벤트 설정
 */
function setupPOIClickHandler() {
    // 기존 핸들러 제거
    if (window.poiClickHandler) {
        map.un('click', window.poiClickHandler);
    }
    
    window.poiClickHandler = function(event) {
        // POI 레이어가 활성화되어 있을 때만 처리
        if (!poiLayer.getVisible()) return;
        
        // 클릭된 POI 피처 찾기
        const feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            if (layer === poiLayer) return feature;
        });
        
        if (feature) {
            // 기존 POI 피처 클릭
            const coordinate = feature.getGeometry().getCoordinates();
            const poi = {
                place_name: feature.get('name'),
                address_name: feature.get('address'),
                phone: feature.get('phone'),
                category_group_name: feature.get('category'),
                distance: feature.get('distance')
            };
            showPOIPopup(coordinate, poi);
        } else {
            // 빈 곳 클릭 시 해당 좌표에서 가장 가까운 POI 검색
            const clickCoordinate = event.coordinate;
            const clickLonLat = ol.proj.toLonLat(clickCoordinate);
            
            // 클릭한 좌표에서 새로운 POI 검색 수행
            searchPOIAtCoordinate(clickLonLat, clickCoordinate);
        }
    };
    
    map.on('click', window.poiClickHandler);
}

/**
 * 특정 좌표에서 가장 가까운 POI 검색
 * @param {Array} lonLat - [경도, 위도] 배열
 * @param {Array} coordinate - 클릭한 좌표 (투영 좌표계)
 */
async function searchPOIAtCoordinate(lonLat, coordinate) {
    try {
        updateStatus('클릭한 위치에서 POI 검색 중...');
        
        // 기존 임시 점 제거
        removeTempPOIPoint();
        
        const [longitude, latitude] = lonLat;
        
        // 키워드 검색으로 변경 (더 안정적)
        const keywords = ['음식점', '카페', '편의점', '병원', '은행'];
        let nearestPOI = null;
        let minDistance = Infinity;
        
        // 각 키워드별로 검색하여 가장 가까운 POI 찾기
        for (const keyword of keywords) {
            try {
                const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&x=${longitude}&y=${latitude}&radius=1000&size=5&sort=distance`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `KakaoAK ${KAKAO_REST_KEY}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.documents && data.documents.length > 0) {
                        // 가장 가까운 POI 확인
                        const closestInCategory = data.documents[0];
                        const distance = parseFloat(closestInCategory.distance) || 0;
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestPOI = closestInCategory;
                        }
                    }
                }
            } catch (err) {
                console.warn(`키워드 "${keyword}" 검색 실패:`, err);
                continue;
            }
        }
        
        if (nearestPOI) {
            // 거리를 미터 단위로 변환
            nearestPOI.distance = parseFloat(nearestPOI.distance) || 0;
            
            // 클릭한 위치에 임시 점 추가
            const tempFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinate),
                name: nearestPOI.place_name,
                address: nearestPOI.address_name,
                phone: nearestPOI.phone || '',
                category: nearestPOI.category_group_name || '기타',
                distance: nearestPOI.distance,
                isTemp: true // 임시 마커 표시
            });
            
            // 녹색 스타일 적용
            tempFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({ color: '#00ff00' }), // 녹색
                    stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                })
            }));
            
            poiSource.addFeature(tempFeature);
            window.tempPOIFeature = tempFeature;
            
            // 팝업 표시
            showPOIPopup(coordinate, nearestPOI);
            
            updateStatus(`가장 가까운 POI: ${nearestPOI.place_name} (${nearestPOI.distance}m)`);
        } else {
            updateStatus('근처에 POI가 없습니다');
        }
        
    } catch (error) {
        console.error('POI 검색 오류:', error);
        updateStatus('POI 검색 중 오류가 발생했습니다');
    }
}

/**
 * 임시 POI 점 제거
 */
function removeTempPOIPoint() {
    if (window.tempPOIFeature) {
        poiSource.removeFeature(window.tempPOIFeature);
        window.tempPOIFeature = null;
    }
}

/**
 * 가장 가까운 POI 찾기
 */
function findNearestPOI(clickLonLat, pois) {
    let nearestPOI = null;
    let minDistance = Infinity;
    
    pois.forEach(poi => {
        const poiLonLat = [parseFloat(poi.x), parseFloat(poi.y)];
        const distance = calculateDistance(clickLonLat, poiLonLat);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestPOI = poi;
        }
    });
    
    return nearestPOI;
}

/**
 * 거리 계산 (Haversine formula)
 */
function calculateDistance(coord1, coord2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * POI 팝업 표시
 */
function showPOIPopup(coordinate, poi) {
    // 팝업 엘리먼트가 없으면 생성
    if (!poiPopupElement) {
        createPOIPopup();
    }
    
    // 팝업 내용 설정 (distance는 미터 단위)
    const distanceText = (poi.distance && poi.distance < 1000) ? 
        `${Math.round(poi.distance)}m` : 
        `${(poi.distance / 1000).toFixed(1)}km`;
    
    poiPopupElement.innerHTML = `
        <div class="poi-popup-header">
            <h3>${poi.place_name}</h3>
            <button class="poi-popup-close" onclick="window.closePOIPopup()">×</button>
        </div>
        <div class="poi-popup-content">
            <p><strong>카테고리:</strong> ${poi.category_group_name || '기타'}</p>
            <p><strong>주소:</strong> ${poi.address_name}</p>
            ${poi.phone ? `<p><strong>전화:</strong> ${poi.phone}</p>` : ''}
            <p><strong>거리:</strong> ${distanceText}</p>
        </div>
    `;
    
    // 팝업 위치 설정
    poiPopup.setPosition(coordinate);
}

/**
 * POI 팝업 생성
 */
function createPOIPopup() {
    // 팝업 엘리먼트 생성
    poiPopupElement = document.createElement('div');
    poiPopupElement.className = 'poi-popup';
    poiPopupElement.id = 'poi-popup';
    
    // 팝업 스타일 추가
    if (!document.getElementById('poi-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'poi-popup-styles';
        style.textContent = `
            .poi-popup {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                min-width: 250px;
                max-width: 300px;
                font-family: 'Segoe UI', sans-serif;
            }
            .poi-popup-header {
                background: #3498db;
                color: white;
                padding: 10px 15px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .poi-popup-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            .poi-popup-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .poi-popup-close:hover {
                background: rgba(255,255,255,0.2);
                border-radius: 4px;
            }
            .poi-popup-content {
                padding: 15px;
            }
            .poi-popup-content p {
                margin: 8px 0;
                font-size: 14px;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 팝업 오버레이 생성
    poiPopup = new ol.Overlay({
        element: poiPopupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    
    map.addOverlay(poiPopup);
    
    // 전역 함수로 팝업 닫기 등록
    window.closePOIPopup = function() {
        if (poiPopup) {
            poiPopup.setPosition(undefined);
        }
        // 임시 POI 점 제거
        removeTempPOIPoint();
    };
}
