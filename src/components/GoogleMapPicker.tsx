import { useEffect, useMemo, useRef, useState } from "react";

type LocationValue = {
  text: string;
  lat: number | null;
  lng: number | null;
};

type GoogleMapPickerProps = {
  apiKey?: string;
  value: LocationValue;
  onChange: (nextValue: LocationValue) => void;
  required?: boolean;
};

const DEFAULT_CENTER = { lat: -17.3935, lng: -66.157 };
const SCRIPT_ID = "google-maps-js-sdk";

let googleMapsPromise: Promise<GoogleMapsApi | undefined> | null = null;

function getGoogleApi() {
  return window.google?.maps;
}

function loadGoogleMapsApi(apiKey: string) {
  const existingApi = getGoogleApi();
  if (existingApi) {
    return Promise.resolve(existingApi);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(getGoogleApi()));
      existingScript.addEventListener("error", () =>
        reject(new Error("No se pudo cargar Google Maps."))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.onload = () => resolve(getGoogleApi());
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

async function reverseGeocode(
  geocoder: GoogleMapsGeocoder,
  lat: number,
  lng: number
) {
  return new Promise<string>((resolve) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results?.[0]?.formatted_address) {
          resolve(results[0].formatted_address);
          return;
        }

        resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    );
  });
}

export default function GoogleMapPicker({
  apiKey,
  value,
  onChange,
  required = false,
}: GoogleMapPickerProps) {
  const onChangeRef = useRef(onChange);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapsMap | null>(null);
  const markerRef = useRef<GoogleMapsMarker | null>(null);
  const clickListenerRef = useRef<GoogleMapsListener | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const hasCoordinates = value.lat !== null && value.lng !== null;
  const mapLink = useMemo(() => {
    if (!hasCoordinates) {
      return "";
    }

    return `https://www.google.com/maps/search/?api=1&query=${value.lat},${value.lng}`;
  }, [hasCoordinates, value.lat, value.lng]);

  useEffect(() => {
    if (!apiKey || !mapRef.current) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    void loadGoogleMapsApi(apiKey)
      .then((mapsApi) => {
        if (cancelled || !mapRef.current || !mapsApi) {
          return;
        }

        const initialCenter = hasCoordinates
          ? { lat: value.lat as number, lng: value.lng as number }
          : DEFAULT_CENTER;

        const map = new mapsApi.Map(mapRef.current, {
          center: initialCenter,
          zoom: hasCoordinates ? 17 : 6,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        const marker = new mapsApi.Marker({
          map,
          position: hasCoordinates ? initialCenter : undefined,
        });

        const geocoder = new mapsApi.Geocoder();

        clickListenerRef.current = map.addListener("click", async (event) => {
          const lat = event.latLng?.lat?.();
          const lng = event.latLng?.lng?.();

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return;
          }

          const nextLat = Number(lat);
          const nextLng = Number(lng);

          marker.setPosition({ lat: nextLat, lng: nextLng });
          map.panTo({ lat: nextLat, lng: nextLng });
          const nextText = await reverseGeocode(geocoder, nextLat, nextLng);
          onChangeRef.current({ text: nextText, lat: nextLat, lng: nextLng });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "No se pudo cargar Google Maps."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (clickListenerRef.current) {
        window.google?.maps?.event?.removeListener?.(clickListenerRef.current);
      }
    };
  }, [apiKey, hasCoordinates, value.lat, value.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !hasCoordinates) {
      return;
    }

    const nextPosition = { lat: value.lat as number, lng: value.lng as number };
    markerRef.current.setPosition(nextPosition);
    mapInstanceRef.current.panTo(nextPosition);
  }, [hasCoordinates, value.lat, value.lng]);

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm text-stone-200">
        <span>
          Ubicacion del proyecto
          {required ? " *" : ""}
        </span>
        <input
          value={value.text}
          onChange={(event) =>
            onChange({
              text: event.target.value,
              lat: value.lat,
              lng: value.lng,
            })
          }
          placeholder="Direccion, referencia o punto marcado"
          className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
          required={required}
        />
      </label>

      {apiKey ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
          <div
            ref={mapRef}
            className="h-[280px] w-full"
            aria-label="Mapa interactivo para marcar ubicacion"
          />
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100">
          Agrega `VITE_GOOGLE_MAPS_API_KEY` en `.env.local` para habilitar el mapa interactivo.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
        <span>
          {loading
            ? "Cargando mapa..."
            : hasCoordinates
              ? `Punto guardado: ${value.lat?.toFixed(6)}, ${value.lng?.toFixed(6)}`
              : "Haz clic en el mapa para guardar el punto exacto."}
        </span>
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#FFDC63]/25 bg-[#FFDC63]/10 px-3 py-1 text-[#FFDC63]"
          >
            Ver en Google Maps
          </a>
        ) : null}
      </div>

      {loadError ? (
        <p className="text-sm text-rose-300">{loadError}</p>
      ) : null}
    </div>
  );
}
