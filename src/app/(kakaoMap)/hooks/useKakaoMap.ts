import { useEffect, useRef } from "react";

export function useKakaoMap(containerId: string, center: { lat: number; lng: number }, onMapReady?: (map: KakaoMap) => void) {
  const mapRef = useRef<unknown>(null);
  const mapCreatedRef = useRef(false);

  useEffect(() => {
    // containerId가 비어있으면 실행하지 않음
    if (!containerId) return;
    
    // 카카오 맵 객체와 window 객체가 있는지 확인
    if (typeof window === 'undefined' || !window.kakao || !window.kakao.maps) {
      console.log("카카오맵 API가 아직 로드되지 않음");
      return;
    }

    // 컨테이너 요소가 있는지 확인
    const container = document.getElementById(containerId);
    if (!container) {
      console.log("지도 컨테이너를 찾을 수 없음:", containerId);
      return;
    }

    // 이미 지도가 생성되었다면 중복 생성 방지
    if (mapCreatedRef.current && mapRef.current) {
      console.log("지도가 이미 생성되어 있음");
      return;
    }

    try {
      console.log("지도 생성 시작:", { lat: center.lat, lng: center.lng });
      
      // 지도 옵션 설정
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 2, // 더 확대된 레벨 (1-14, 숫자가 작을수록 확대)
        draggable: true, // 드래그는 가능
        scrollwheel: false, // 마우스 휠 줌 비활성화
        disableDoubleClick: true, // 더블클릭 줌 비활성화
        disableDoubleClickZoom: true, // 더블클릭 줌 비활성화
      };
      
      // 지도 생성
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;
      mapCreatedRef.current = true;
      
      // 줌 컨트롤 비활성화
      map.setZoomable(false);
      
      console.log("지도 생성 완료");

      // 지도 생성 완료 콜백 호출
      if (onMapReady) {
        onMapReady(map);
      }

    } catch (error) {
      console.error("카카오 지도 초기화 중 오류 발생:", error);
    }

    return () => {
      // 마운트 해제 시 필요한 정리 작업
      mapRef.current = null;
      mapCreatedRef.current = false;
    };
  }, [containerId, center.lat, center.lng, onMapReady]);

  return mapRef;
}