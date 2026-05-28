declare module "@barba/core";
declare module "three";

type GoogleMapsLatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleMapsClickEvent = {
  latLng?: {
    lat: () => number;
    lng: () => number;
  };
};

type GoogleMapsListener = object;

type GoogleMapsMap = {
  addListener: (
    eventName: "click",
    handler: (event: GoogleMapsClickEvent) => void
  ) => GoogleMapsListener;
  panTo: (position: GoogleMapsLatLngLiteral) => void;
};

type GoogleMapsMarker = {
  setPosition: (position: GoogleMapsLatLngLiteral) => void;
};

type GoogleMapsGeocoderResult = {
  formatted_address?: string;
};

type GoogleMapsGeocoder = {
  geocode: (
    request: { location: GoogleMapsLatLngLiteral },
    callback: (
      results: GoogleMapsGeocoderResult[] | null,
      status: string
    ) => void
  ) => void;
};

type GoogleMapsApi = {
  Map: new (
    element: Element,
    options: {
      center: GoogleMapsLatLngLiteral;
      zoom: number;
      streetViewControl: boolean;
      mapTypeControl: boolean;
      fullscreenControl: boolean;
    }
  ) => GoogleMapsMap;
  Marker: new (options: {
    map: GoogleMapsMap;
    position?: GoogleMapsLatLngLiteral;
  }) => GoogleMapsMarker;
  Geocoder: new () => GoogleMapsGeocoder;
  event?: {
    removeListener?: (listener: GoogleMapsListener) => void;
  };
};

interface Window {
  google?: {
    maps?: GoogleMapsApi;
  };
}
