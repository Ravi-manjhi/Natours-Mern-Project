export const displayMap = (apiLocation) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoib3V0bGF3ei1ydiIsImEiOiJjbGNub2JuNDExYnl2M3FtcXIxdjJkNjA0In0._V5YDA6W3y1YYUjgElEFOQ";

  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/outlawz-rv/clcnps2gl005m14qn9xjqf56d",
    scrollZoom: false,
    // center: [-80.185942, 25.774772],
    // zoom: 5,
  });

  const bounds = new mapboxgl.LngLatBounds();

  apiLocation.forEach((loc) => {
    const el = document.createElement("div");
    el.className = "marker";

    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // new popup

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
