"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useKakaoMap } from "./hooks/useKakaoMap";
import { useKakaoPlaces } from "./hooks/useKakaoPlaces";
import { useRoulette } from "../contexts/RouletteContext";
import { getCategoryEmoji, getSimplifiedCategory } from "./utils/categoryUtils";

const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

const KakaoMap = () => {
	const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 기본값: 서울시청
	const [mapLoaded, setMapLoaded] = useState(false);
	const [mapObj, setMapObj] = useState<KakaoMap | null>(null);
	const [markers, setMarkers] = useState<KakaoMarker[]>([]);
	// const [isDarkMode, setIsDarkMode] = useState(false);
	const currentInfoWindowRef = useRef<KakaoInfoWindow | null>(null);
	const rouletteIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const placesRef = useRef<KakaoPlace[]>([]);
	const { setStartRoulette, setIsRouletting } = useRoulette();

	// 클라이언트 사이드에서만 렌더링
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	// 시스템 테마 감지
	useEffect(() => {
		if (typeof window === 'undefined') return;
		
		// const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		// setIsDarkMode(mediaQuery.matches);
		
		// const handleChange = (e: MediaQueryListEvent) => {
		// 	setIsDarkMode(e.matches);
		// };
		
		// mediaQuery.addEventListener('change', handleChange);
		// return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	// 1. 스크립트 로드 - 컴포넌트 마운트 시 한 번만 실행
	useEffect(() => {
		// 서버 사이드에서는 실행하지 않음
		if (typeof window === 'undefined') return;
		
		// 이미 로드된 경우 재로드하지 않음
		if (window.kakao && window.kakao.maps) {
			console.log("카카오맵 이미 로드됨");
			setMapLoaded(true);
			return;
		}
		
		try {
			console.log("카카오맵 스크립트 로드 시작");
			// 스크립트 생성 및 로드
			const script = document.createElement("script");
			script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false&libraries=services`;
			script.async = true;
			script.id = "kakao-map-script";
			
			// 스크립트 로드 완료 시 처리
			script.onload = () => {
				console.log("카카오맵 스크립트 로드 완료");
				if (window.kakao && window.kakao.maps) {
					window.kakao.maps.load(() => {
						console.log("카카오맵 API 로드 완료");
						setMapLoaded(true);
					});
				}
			};
			
			// 에러 처리
			script.onerror = (error) => {
				console.error("카카오맵 스크립트 로드 실패:", error);
			};
			
			document.head.appendChild(script);
			
			// 클린업 함수
			return () => {
				const kakaoScript = document.getElementById("kakao-map-script");
				if (kakaoScript && kakaoScript.parentNode) {
					kakaoScript.parentNode.removeChild(kakaoScript);
				}
			};
		} catch (error) {
			console.error("카카오맵 스크립트 초기화 중 오류:", error);
		}
	}, []);

	// 2. 내 위치 가져오기 - 맵 로드 후 실행
	useEffect(() => {
		if (typeof window === 'undefined' || !mapLoaded) return;
		
		console.log("위치 정보 가져오기 시도");
		try {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					// 성공 시
					(position) => {
						console.log("위치 정보 획득 성공:", position.coords);
						setCenter({
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						});
					},
					// 실패 시
					(error) => {
						console.warn("위치 정보를 가져올 수 없습니다:", error.message);
						console.log("기본 위치 사용: 서울시청");
						// 기본 위치 유지 (서울시청)
					},
					// 옵션
					{ 
						enableHighAccuracy: false, // 높은 정확도 비활성화로 빠른 응답
						timeout: 10000, // 10초로 타임아웃 증가
						maximumAge: 300000 // 5분까지 캐시된 위치 사용 가능
					}
				);
			} else {
				console.log("Geolocation API를 사용할 수 없습니다.");
			}
		} catch (error) {
			console.error("위치 정보 가져오기 오류:", error);
		}
	}, [mapLoaded]);

	// 3. 지도 생성 - 마운트되고 센터가 설정된 후
	const onMapReady = useCallback((map: KakaoMap) => {
		console.log("지도 준비 완료 콜백 호출");
		setMapObj(map);
	}, []);

	// 지도 훅 사용 - mapLoaded가 true일 때만 실행
	const shouldInitMap = mounted && mapLoaded;
	useKakaoMap(shouldInitMap ? "map" : "", center, onMapReady);

	// 5. 기존 마커 정리 함수 - useRef로 최신 markers 참조
	const markersRef = useRef<KakaoMarker[]>([]);
	markersRef.current = markers;
	
	const clearMarkers = useCallback(() => {
		markersRef.current.forEach(marker => {
			if (marker && marker.setMap) {
				marker.setMap(null);
			}
		});
		setMarkers([]);
	}, []);

	// 6. 장소 검색 결과 처리 및 마커 표시
	const handlePlacesFound = useCallback((places: KakaoPlace[]) => {
		if (!mapObj || !window.kakao || !window.kakao.maps) return;
		
		// 기존 마커 정리
		clearMarkers();
		
		const newMarkers = [];
		
		// 새 마커 생성
		for (const place of places) {
			try {
				const position = new window.kakao.maps.LatLng(
					Number(place.y),
					Number(place.x)
				);
				
				const marker = new window.kakao.maps.Marker({
					map: mapObj,
					position: position,
					title: place.place_name,
				});
				
				newMarkers.push(marker);
				
				// 실시간으로 테마 확인
				const currentIsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
				const infoWindowStyle = currentIsDark
					? 'z-index: 1000; padding:8px 12px;font-size:14px;background-color:#2d3748;color:#f7fafc;border:1px solid #4a5568;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;'
					: 'z-index: 1000; padding:8px 12px;font-size:14px;background-color:#ffffff;color:#2d3748;border:1px solid #e2e8f0;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;';
				
				// 카테고리 정보 처리
				const categoryEmoji = getCategoryEmoji(place.category_name);
				const simplifiedCategory = getSimplifiedCategory(place.category_name);
				
				// 고유 식별자 생성
				const infoWindowId = `info-${place.id}-${Date.now()}`;
				
				const infoWindowContent = `
					<div id="${infoWindowId}" style="${infoWindowStyle};min-width:150px;text-align:center;box-sizing:border-box;">
						<div style="font-weight:bold;margin-bottom:4px;">${place.place_name}</div>
						<div style="font-size:12px;opacity:0.8;display:flex;align-items:center;justify-content:center;gap:4px;">
							<span style="font-size:14px;">${categoryEmoji}</span>
							<span>${simplifiedCategory}</span>
						</div>
					</div>
					<style>
						/* 카카오맵 InfoWindow 외부 컨테이너 숨기기 */
						div[style*="background: rgb(255, 255, 255)"] {
							background: transparent !important;
							border: none !important;
						}
						/* 말풍선 꼬리 부분 숨기기 */
						div[style*="triangle.png"] {
							display: none !important;
						}
						/* InfoWindow 전체 배경 제거 */
						.infowindow,
						.infowindow * {
							background: transparent !important;
							border: none !important;
						}
					</style>
				`;
				
				const infowindow = new window.kakao.maps.InfoWindow({
					content: infoWindowContent,
					removable: false,
					// 말풍선의 표시 위치를 마커 중앙 상단으로 설정
					position: position,
					// Y축 오프셋 조정 (마커 위로 띄우기)
					yAnchor: 1.5
				});
				
				window.kakao.maps.event.addListener(marker, "click", function () {
					// 기존 InfoWindow 닫기
					if (currentInfoWindowRef.current) {
						currentInfoWindowRef.current.close();
					}
					// 새 InfoWindow 열기
					infowindow.open(mapObj, marker);
					currentInfoWindowRef.current = infowindow;
					
					// InfoWindow의 부모 요소들의 z-index 수정
					const fixZIndex = () => {
						console.log("=== InfoWindow z-index 디버깅 시작 ===");
						
						// 고유 ID로 InfoWindow 요소 찾기
						const targetDiv = document.getElementById(infoWindowId);
						console.log("찾은 InfoWindow div:", targetDiv);
						
						if (targetDiv) {
							let parent = targetDiv;
							let level = 0;
							
							// 부모 요소를 거슬러 올라가며 z-index 확인
							while (parent && parent.tagName !== 'BODY') {
								const computedStyle = window.getComputedStyle(parent);
								const inlineZIndex = parent.style.zIndex;
								
								console.log(`Level ${level}:`, {
									element: parent,
									tagName: parent.tagName,
									className: parent.className,
									computedZIndex: computedStyle.zIndex,
									inlineZIndex: inlineZIndex,
									position: computedStyle.position,
									style: parent.style.cssText
								});
								
								// z-index가 0이거나 auto가 아닌 낮은 값인 경우
								if (computedStyle.zIndex === '0' || (computedStyle.zIndex !== 'auto' && parseInt(computedStyle.zIndex) < 100)) {
									console.log(`z-index 변경 시도: ${computedStyle.zIndex} -> 100`);
									parent.style.zIndex = '100';
									parent.style.setProperty('z-index', '100', 'important');
								}
								
								parent = parent.parentElement as HTMLElement;
								level++;
							}
						} else {
							console.log("InfoWindow DOM 요소를 찾을 수 없습니다.");
						}
						
						console.log("=== InfoWindow z-index 디버깅 종료 ===");
					};
					
					// 즉시 실행 시도
					fixZIndex();
					
					// DOM이 완전히 렌더링되지 않았을 경우를 대비해 한 번 더 시도
					requestAnimationFrame(() => {
						fixZIndex();
					});
				});
			} catch (error) {
				console.error("마커 생성 중 오류 발생:", error);
			}
		}
		
		setMarkers(newMarkers);
		// 장소 데이터도 저장
		placesRef.current = places;
		
	}, [mapObj, clearMarkers]);

	// 장소 검색 훅 사용
	useKakaoPlaces(mapObj, center, handlePlacesFound);

	// 지도 클릭 시 InfoWindow 닫기
	useEffect(() => {
		if (!mapObj || !window.kakao || !window.kakao.maps) return;
		
		const mapClickHandler = () => {
			if (currentInfoWindowRef.current) {
				currentInfoWindowRef.current.close();
				currentInfoWindowRef.current = null;
			}
		};
		
		window.kakao.maps.event.addListener(mapObj, 'click', mapClickHandler);
		
		return () => {
			window.kakao.maps.event.removeListener(mapObj, 'click', mapClickHandler);
		};
	}, [mapObj]);

	// 랜덤 음식점 룰렛 함수
	const startRandomRoulette = useCallback(() => {
		if (!mapObj || !placesRef.current.length || !markersRef.current.length) return;

		// 기존 룰렛 중지
		if (rouletteIntervalRef.current) {
			clearInterval(rouletteIntervalRef.current);
		}

		// 기존 InfoWindow 닫기
		if (currentInfoWindowRef.current) {
			currentInfoWindowRef.current.close();
			currentInfoWindowRef.current = null;
		}

		setIsRouletting(true);
		
		let currentIndex = 0;
		let speed = 50; // 초기 속도 (ms)
		let totalSteps = 0;
		const minSteps = 20; // 최소 20스텝
		const maxSteps = 30; // 최대 30스텝 (약 2-3초)
		const targetSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps));
		const finalSelection = Math.floor(Math.random() * markersRef.current.length);

		const roulette = () => {
			// 이전 마커 원래 크기로
			if (markersRef.current[currentIndex]) {
				const marker = markersRef.current[currentIndex];
				marker.setZIndex(1);
			}

			// 다음 마커로
			currentIndex = (currentIndex + 1) % markersRef.current.length;
			totalSteps++;
			
			// 현재 마커 확대
			const currentMarker = markersRef.current[currentIndex];
			if (currentMarker) {
				currentMarker.setZIndex(10);
				mapObj.setCenter(currentMarker.getPosition());
			}

			// 마지막 몇 스텝에서 속도 점진적 감소
			if (totalSteps > targetSteps - 8) {
				speed += 15; // 점점 느려짐
			}

			// 종료 조건: 목표 스텝 도달
			if (totalSteps >= targetSteps) {
				// 최종 선택된 위치로 이동
				const finalMarker = markersRef.current[finalSelection];
				if (finalMarker) {
					// 모든 마커 원래 크기로
					markersRef.current.forEach(marker => marker.setZIndex(1));
					// 최종 마커만 확대
					finalMarker.setZIndex(10);
					mapObj.setCenter(finalMarker.getPosition());
				}

				clearInterval(rouletteIntervalRef.current!);
				setIsRouletting(false);
				
				// 최종 선택된 마커에 InfoWindow 열기
				setTimeout(() => {
					const finalPlace = placesRef.current[finalSelection];
					
					if (finalMarker && finalPlace) {
						const currentIsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
						const infoWindowStyle = currentIsDark
							? 'z-index: 1000; padding:8px 12px;font-size:14px;background-color:#2d3748;color:#f7fafc;border:1px solid #4a5568;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;'
							: 'z-index: 1000; padding:8px 12px;font-size:14px;background-color:#ffffff;color:#2d3748;border:1px solid #e2e8f0;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;';
						
						// 카테고리 정보 처리
						const categoryEmoji = getCategoryEmoji(finalPlace.category_name);
						const simplifiedCategory = getSimplifiedCategory(finalPlace.category_name);
						
						// 고유 식별자 생성
						const infoWindowId = `info-${finalPlace.id}-${Date.now()}`;
						
						const infoWindowContent = `
							<div id="${infoWindowId}" style="${infoWindowStyle};min-width:150px;text-align:center;box-sizing:border-box;">
								<div style="font-weight:bold;margin-bottom:4px;">${finalPlace.place_name}</div>
								<div style="font-size:12px;opacity:0.8;display:flex;align-items:center;justify-content:center;gap:4px;">
									<span style="font-size:14px;">${categoryEmoji}</span>
									<span>${simplifiedCategory}</span>
								</div>
							</div>
							<style>
								div[style*="background: rgb(255, 255, 255)"] {
									background: transparent !important;
									border: none !important;
								}
								div[style*="triangle.png"] {
									display: none !important;
								}
								.infowindow,
								.infowindow * {
									background: transparent !important;
									border: none !important;
								}
							</style>
						`;
						
						const infowindow = new window.kakao.maps.InfoWindow({
							content: infoWindowContent,
							removable: false,
							// 말풍선의 표시 위치를 마커 중앙 상단으로 설정
							position: finalMarker.getPosition(),
							// Y축 오프셋 조정 (마커 위로 띄우기)
							yAnchor: 1.5
						});
						
						infowindow.open(mapObj, finalMarker);
						currentInfoWindowRef.current = infowindow;
						
						// InfoWindow의 부모 요소들의 z-index 수정
						const fixZIndex = () => {
							console.log("=== 룰렛 InfoWindow z-index 디버깅 시작 ===");
							
							// 고유 ID로 InfoWindow 요소 찾기
							const targetDiv = document.getElementById(infoWindowId);
							console.log("찾은 InfoWindow div:", targetDiv);
							
							if (targetDiv) {
								let parent = targetDiv;
								let level = 0;
								
								// 부모 요소를 거슬러 올라가며 z-index 확인
								while (parent && parent.tagName !== 'BODY') {
									const computedStyle = window.getComputedStyle(parent);
									const inlineZIndex = parent.style.zIndex;
									
									console.log(`Level ${level}:`, {
										element: parent,
										tagName: parent.tagName,
										className: parent.className,
										computedZIndex: computedStyle.zIndex,
										inlineZIndex: inlineZIndex,
										position: computedStyle.position,
										style: parent.style.cssText
									});
									
									// z-index가 0이거나 auto가 아닌 낮은 값인 경우
									if (computedStyle.zIndex === '0' || (computedStyle.zIndex !== 'auto' && parseInt(computedStyle.zIndex) < 100)) {
										console.log(`z-index 변경 시도: ${computedStyle.zIndex} -> 100`);
										parent.style.zIndex = '100';
										parent.style.setProperty('z-index', '100', 'important');
									}
									
									parent = parent.parentElement as HTMLElement;
									level++;
								}
							} else {
								console.log("InfoWindow DOM 요소를 찾을 수 없습니다.");
							}
							
							console.log("=== 룰렛 InfoWindow z-index 디버깅 종료 ===");
						};
						
						// 즉시 실행 시도
						fixZIndex();
						
						// DOM이 완전히 렌더링되지 않았을 경우를 대비해 한 번 더 시도
						requestAnimationFrame(() => {
							fixZIndex();
						});
					}
				}, 500);
				
				return;
			}

			// 다음 루프 스케줄링
			rouletteIntervalRef.current = setTimeout(roulette, speed);
		};

		// 룰렛 시작
		roulette();
	}, [mapObj, setIsRouletting]);

	// 장소 데이터 로드 후 룰렛 함수 등록
	useEffect(() => {
		if (markers.length > 0 && mapObj) {
			console.log('Places loaded, registering roulette function');
			setStartRoulette(() => startRandomRoulette);
		}
	}, [markers.length, mapObj, setStartRoulette, startRandomRoulette]);



	// SSR에서는 렌더링하지 않음
	if (!mounted) return null;

	return (
		<div className="relative w-full h-full">
			<div id="map" className="w-full h-full" />
			{!mapLoaded && (
				<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
					<p className="text-lg font-semibold">지도를 불러오는 중...</p>
				</div>
			)}
		</div>
	);
};

export default KakaoMap;
