import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import maplibre from "npm:maplibre-gl";

export default function Map() {
  useEffect(() => {
    if (IS_BROWSER) {
      const _map = new maplibre.Map({
        container: "map",
        style: "https://demotiles.maplibre.org/style.json", // Open-source style
        center: [0, 0],
        zoom: 2,
      });
    }
  }, []);

  return <div id="map" style="height: 100vh; width: 100%;"></div>;
}
