declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: any);
      setCenter(location: LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    class Marker {
      constructor(options: any);
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }

    class InfoWindow {
      constructor();
      setContent(content: string): void;
      open(map: Map, marker: Marker): void;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface Icon {
      url: string;
      scaledSize: Size;
      anchor: Point;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    namespace places {
      class PlacesService {
        constructor(map: Map);
        nearbySearch(request: any, callback: (results: any[], status: any) => void): void;
      }

      enum PlacesServiceStatus {
        OK = 'OK'
      }

      interface PlacePhoto {
        getUrl(options: any): string;
      }
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 