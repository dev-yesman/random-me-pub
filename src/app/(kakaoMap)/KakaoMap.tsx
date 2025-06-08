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
	const [mapLoadError, setMapLoadError] = useState<string | null>(null);
	const [locationLoading, setLocationLoading] = useState(true);
	const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'failed' | 'denied'>('loading');
	const [showLocationAlert, setShowLocationAlert] = useState(false);
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
		
		// API 키 확인
		if (!API_KEY) {
			console.error("카카오맵 API 키가 설정되지 않았습니다.");
			setMapLoadError("카카오맵 API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.");
			return;
		}

		try {
			console.log("카카오맵 스크립트 로드 시작");
			console.log("현재 도메인:", window.location.hostname);
			console.log("API 키 존재 여부:", !!API_KEY);
			console.log("API 키 길이:", API_KEY.length);
			
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
						setMapLoadError(null);
					});
				} else {
					console.error("window.kakao 객체를 찾을 수 없습니다.");
					setMapLoadError("카카오맵 API를 불러올 수 없습니다.");
				}
			};
			
			// 에러 처리
			script.onerror = (error) => {
				console.error("카카오맵 스크립트 로드 실패:", error);
				const hostname = window.location.hostname;
				setMapLoadError(`카카오맵을 불러올 수 없습니다. 
					
다음 사항을 확인해주세요:
1. 카카오 개발자 콘솔에서 JavaScript 키를 확인하세요
2. 사이트 도메인 (${hostname})이 등록되어 있는지 확인하세요
3. localhost 개발 시에는 http://localhost:3000 도 등록하세요`);
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
		
		// Geolocation API 지원 여부 확인
		if (!navigator.geolocation) {
			console.warn("이 브라우저는 위치 정보를 지원하지 않습니다.");
			return;
		}

		// 권한 상태 확인 (지원되는 브라우저에서)
		if ('permissions' in navigator) {
			navigator.permissions.query({ name: 'geolocation' }).then((result) => {
				console.log("위치 권한 상태:", result.state);
				if (result.state === 'denied') {
					console.warn("위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.");
				}
			}).catch((err) => {
				console.log("권한 확인 실패:", err);
			});
		}

		// 먼저 빠른 위치 획득 시도
		const fastOptions = {
			enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 60000 // 1분
		};

		const accurateOptions = {
			enableHighAccuracy: true,
			timeout: 15000,
			maximumAge: 300000 // 5분
		};

		const handleSuccess = (position: GeolocationPosition) => {
			const { latitude, longitude, accuracy } = position.coords;
			console.log(`위치 정보 획득 성공: (${latitude}, ${longitude}), 정확도: ${accuracy}m`);
			setCenter({
				lat: latitude,
				lng: longitude,
			});
			setLocationStatus('success');
			setLocationLoading(false);
			setShowLocationAlert(true);
			
			// 3초 후 알림 숨기기
			setTimeout(() => setShowLocationAlert(false), 3000);
		};

		const handleError = (error: GeolocationPositionError, isSecondTry = false) => {
			let errorMessage = "위치 정보를 가져올 수 없습니다: ";
			let status: 'failed' | 'denied' = 'failed';
			
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage += "위치 권한이 거부되었습니다.";
					status = 'denied';
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage += "위치 정보를 사용할 수 없습니다.";
					break;
				case error.TIMEOUT:
					errorMessage += "위치 정보 요청이 시간 초과되었습니다.";
					if (!isSecondTry) {
						console.log("정확한 위치 정보로 재시도...");
						navigator.geolocation.getCurrentPosition(
							handleSuccess,
							(err) => handleError(err, true),
							accurateOptions
						);
						return;
					}
					break;
				default:
					errorMessage += "알 수 없는 오류가 발생했습니다.";
					break;
			}
			
			console.warn(errorMessage);
			console.log("기본 위치 사용: 서울시청");
			setLocationStatus(status);
			setLocationLoading(false);
			setShowLocationAlert(true);
			
			// 5초 후 알림 숨기기 (에러 메시지는 조금 더 오래)
			setTimeout(() => setShowLocationAlert(false), 5000);
		};

		// 첫 번째 시도: 빠른 위치 획득
		try {
			navigator.geolocation.getCurrentPosition(
				handleSuccess,
				handleError,
				fastOptions
			);
		} catch (error) {
			console.error("위치 정보 가져오기 중 예외 발생:", error);
		}
	}, [mapLoaded]);

	// 3. 지도 생성 - 마운트되고 센터가 설정된 후
	const onMapReady = useCallback((map: KakaoMap) => {
		console.log("지도 준비 완료 콜백 호출");
		setMapObj(map);
	}, []);

	// 지도 훅 사용 - mapLoaded가 true일 때만 실행, 첫 번째 center로만 초기화
	const shouldInitMap = mounted && mapLoaded;
	const [initialCenter] = useState(center); // 최초 center 값으로 고정
	useKakaoMap(shouldInitMap ? "map" : "", initialCenter, onMapReady);

	// 지도가 준비된 후 center 변경 시 지도 중심 이동
	useEffect(() => {
		if (mapObj && !locationLoading) {
			console.log("지도 중심 이동:", center);
			const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
			mapObj.setCenter(newCenter);
		}
	}, [mapObj, center, locationLoading]);

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

	// 장소 검색 훅 사용 - 위치 로딩이 완료된 후에만
	useKakaoPlaces(mapObj && !locationLoading ? mapObj : null, center, handlePlacesFound);

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

	// 로딩 메시지 결정
	const getLoadingMessage = () => {
		if (!mapLoaded) {
			return "지도를 불러오는 중...";
		}
		if (locationLoading) {
			return "위치 정보를 가져오는 중...";
		}
		return "";
	};

	const getLocationStatusMessage = () => {
		switch (locationStatus) {
			case 'denied':
				return "📍 위치 권한이 거부되어 기본 위치(서울시청)를 사용합니다";
			case 'failed':
				return "📍 위치 정보를 가져올 수 없어 기본 위치(서울시청)를 사용합니다";
			case 'success':
				return "📍 현재 위치 기준으로 주변 음식점을 검색했습니다";
			default:
				return "";
		}
	};

	const showLoading = (!mapLoaded || locationLoading) && !mapLoadError;
	const showError = !!mapLoadError;

	return (
		<div className="relative w-full h-full">
			<div id="map" className="w-full h-full" />
			
			{/* 에러 표시 */}
			{showError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
					<div className="flex flex-col items-center space-y-4 p-6 max-w-md">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">지도를 불러올 수 없습니다</h3>
						<div className="text-sm text-gray-600 text-center whitespace-pre-line">
							{mapLoadError}
						</div>
						<button 
							onClick={() => window.location.reload()} 
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							페이지 새로고침
						</button>
					</div>
				</div>
			)}
			
			{/* 로딩 오버레이 */}
			{showLoading && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50">
					<div className="flex flex-col items-center space-y-4">
						{/* 로딩 스피너 */}
						<div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
						<p className="text-lg font-semibold text-gray-700">{getLoadingMessage()}</p>
						{locationLoading && (
							<p className="text-sm text-gray-500 text-center max-w-xs">
								정확한 맛집 추천을 위해 위치 권한을 허용해주세요
							</p>
						)}
					</div>
				</div>
			)}

			{/* 위치 상태 알림 */}
			{showLocationAlert && (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in-down">
					<div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
						locationStatus === 'success' 
							? 'bg-green-100 text-green-800 border border-green-200' 
							: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
					}`}>
						{getLocationStatusMessage()}
					</div>
				</div>
			)}
		</div>
	);
};

export default KakaoMap;
