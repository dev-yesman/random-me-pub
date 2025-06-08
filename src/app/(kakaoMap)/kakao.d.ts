declare global {
	interface KakaoLatLng {
		getLat(): number;
		getLng(): number;
		equals(latlng: KakaoLatLng): boolean;
		toString(): string;
		toCoords(): unknown;
	}

	interface KakaoInfoWindow {
		open(map: KakaoMap, marker: KakaoMarker): void;
		close(): void;
		setContent(content: string): void;
		getContent(): string;
		setPosition(position: KakaoLatLng): void;
		getPosition(): KakaoLatLng;
		setZIndex(zIndex: number): void;
		getZIndex(): number;
		// 필요시 추가 메서드 선언 가능
	}

	interface KakaoMap {
		setCenter(latlng: KakaoLatLng): void;
		getCenter(): KakaoLatLng;
		setLevel(level: number): void;
		getLevel(): number;
		panTo(latlng: KakaoLatLng): void;
		setZoomable(zoomable: boolean): void;
		addControl(control: KakaoZoomControl, position: string): void;
		removeControl(control: KakaoZoomControl): void;
		// 필요시 추가 메서드 선언 가능
	}

	interface KakaoMapOptions {
		center: KakaoLatLng;
		level?: number;
		mapTypeId?: string;
		draggable?: boolean;
		scrollwheel?: boolean;
		disableDoubleClick?: boolean;
		disableDoubleClickZoom?: boolean;
		// 필요시 추가 옵션 선언 가능
	}

	interface KakaoMarker {
		setMap(map: KakaoMap | null): void;
		getMap(): KakaoMap | null;
		setPosition(position: KakaoLatLng): void;
		getPosition(): KakaoLatLng;
		setTitle(title: string): void;
		getTitle(): string;
		setZIndex(zIndex: number): void;
		// 필요시 추가 메서드 선언 가능
	}

	interface KakaoZoomControl {
		getPosition(): string;
	}

	interface KakaoPlace {
		id: string;
		place_name: string;
		x: string;
		y: string;
		distance?: string;
		place_url?: string;
		phone?: string;
		address_name?: string;
		road_address_name?: string;
		category_name: string;
		category_group_code: string;
		category_group_name: string;
	}

	interface KakaoPagination {
		current: number;
		last: number;
		hasNextPage: boolean;
		nextPage(): void;
	}

	interface KakaoPlaces {
		categorySearch(
			code: string,
			callback: (
				data: KakaoPlace[],
				status: string,
				pagination: KakaoPagination,
			) => void,
			options?: {
				location?: KakaoLatLng;
				radius?: number;
				page?: number;
			},
		): void;
		// 필요시 추가 메서드 선언 가능
	}

	interface Window {
		kakao: {
			maps: {
				load: (callback: () => void) => void;
				LatLng: new (lat: number, lng: number) => KakaoLatLng;
				Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
				Marker: new (options: {
					map: KakaoMap;
					position: KakaoLatLng;
					title?: string;
				}) => KakaoMarker;
				InfoWindow: new (options: { 
					content: string; 
					removable?: boolean;
					position?: KakaoLatLng;
					yAnchor?: number;
					zIndex?: number;
				}) => KakaoInfoWindow;
				ZoomControl: new () => KakaoZoomControl;
				ControlPosition: {
					TOP: string;
					TOPLEFT: string;
					TOPRIGHT: string;
					LEFT: string;
					RIGHT: string;
					BOTTOMLEFT: string;
					BOTTOM: string;
					BOTTOMRIGHT: string;
				};
				Pagination: KakaoPagination;
				event: {
					addListener: (target: KakaoMap | KakaoMarker, type: string, handler: () => void) => void;
					removeListener: (target: KakaoMap | KakaoMarker, type: string, handler: () => void) => void;
				};
				services: {
					Places: new () => KakaoPlaces;
					Status: {
						OK: string;
						ZERO_RESULT: string;
						ERROR: string;
					};
				};
			};
		};
	}
}

export {};
