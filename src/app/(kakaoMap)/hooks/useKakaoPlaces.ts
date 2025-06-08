import { useEffect, useRef } from "react";

// KakaoPlace 타입을 직접 사용
type Place = KakaoPlace;

export function useKakaoPlaces(
  map: unknown,
  center: { lat: number; lng: number },
  onPlaces: (places: Place[]) => void
) {
  // 이전 요청을 추적하기 위한 ref
  const searchRequestRef = useRef<boolean>(false);
  
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;
    
    // 카카오맵과 서비스 객체가 있는지 확인
    if (!map || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
    
    // 이미 요청 중인 경우 중복 요청 방지
    if (searchRequestRef.current) return;
    searchRequestRef.current = true;
    
    try {
      const ps = new window.kakao.maps.services.Places();

      // 1. 첫 페이지 요청
      ps.categorySearch(
        "FD6",
        (data: Place[], status: string, pagination: KakaoPagination) => {
          if (status !== window.kakao.maps.services.Status.OK) {
            searchRequestRef.current = false;
            return;
          }

          const totalPages = Math.min(pagination.last, 5); // 최대 5페이지
          const allResults: Place[][] = [];
          allResults[pagination.current - 1] = data;

          if (totalPages === 1) {
            onPlaces(data);
            searchRequestRef.current = false;
            return;
          }

          // 2. 2~5페이지 병렬 요청
          let completed = 1;
          for (let page = 2; page <= totalPages; page++) {
            ps.categorySearch(
              "FD6",
              (pageData: Place[], pageStatus: string, pagePagination: KakaoPagination) => {
                if (pageStatus === window.kakao.maps.services.Status.OK) {
                  allResults[pagePagination.current - 1] = pageData;
                }
                completed++;
                if (completed === totalPages) {
                  // 모든 요청 완료 시 합쳐서 반환
                  onPlaces(allResults.flat().filter(Boolean));
                  searchRequestRef.current = false;
                }
              },
              {
                location: new window.kakao.maps.LatLng(center.lat, center.lng),
                radius: 500,
                page,
              }
            );
          }
        },
        {
          location: new window.kakao.maps.LatLng(center.lat, center.lng),
          radius: 500,
          page: 1,
        }
      );
    } catch (error) {
      console.error("장소 검색 중 오류 발생:", error);
      searchRequestRef.current = false;
    }

    return () => {
      // 클린업 시 요청 상태 초기화
      searchRequestRef.current = false;
    };
  }, [map, center.lat, center.lng, onPlaces]);
}