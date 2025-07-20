import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const kecBounds = [
  [11.265, 77.590],
  [11.285, 77.620],
];

const departmentLocations = {
  "Current Location": null,
  "Library": [11.270985, 77.605334],
  "IT Park": [11.273584, 77.607018],
  "ECE": [11.272673, 77.605436],
  "Dheeran Hostel": [11.271299, 77.606594],
  "EIE & EEE Block":[11.274454,77.606944],
  "Food Court":[11.272886,77.606740],
  "Kongu playground":[11.273468,77.603782]
};

const SetViewToLocation = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 17);
    }
  }, [location, map]);
  return null;
};

const MapComponent = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [source, setSource] = useState("Current Location");
  const [destination, setDestination] = useState("Library");
  const [route, setRoute] = useState([]);
  const [mapType, setMapType] = useState("standard");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
      },
      (error) => console.error("Error getting location: ", error)
    );
  }, []);

  const fetchRoute = async (sourceLocation, destinationLocation) => {
    if (!sourceLocation || !destinationLocation) return;

    const apiKey = "5b3ce3597851110001cf62480cef2f06edde403bbce5ac59a8206bdb";

    const body = {
      coordinates: [[sourceLocation[1], sourceLocation[0]], [destinationLocation[1], destinationLocation[0]]],
      format: "geojson",
      profile: "foot-walking",
      preference: "shortest",
    };

    try {
      const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.features) {
        const routeCoords = data.features[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
        setRoute(routeCoords);
      } else {
        console.error("No route found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleEnter = () => {
    const sourceLocation = source === "Current Location" ? currentLocation : departmentLocations[source];
    const destinationLocation = departmentLocations[destination];

    if (sourceLocation && destinationLocation) {
      fetchRoute(sourceLocation, destinationLocation);
    } else {
      setRoute([]);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>🏫 Kongu College Navigation</h2>

      <label> Source: </label>
      <select value={source} onChange={(e) => setSource(e.target.value)}>
        {Object.keys(departmentLocations).map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      <label> Destination: </label>
      <select value={destination} onChange={(e) => setDestination(e.target.value)}>
        {Object.keys(departmentLocations).map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      <button onClick={handleEnter} style={{ marginLeft: "10px", padding: "5px 10px", cursor: "pointer" }}>
        Enter
      </button>

      <button
        onClick={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
        style={{ marginLeft: "10px", padding: "5px 10px", cursor: "pointer" }}
      >
        Toggle {mapType === "standard" ? "Satellite" : "Standard"} View
      </button>

      <MapContainer
        center={[11.275, 77.605]}
        zoom={16}
        style={{ height: "500px", width: "80%", margin: "20px auto" }}
        maxBounds={kecBounds}
        maxBoundsViscosity={1.0}
      >
        {/* Toggle between standard and satellite maps */}
        {mapType === "standard" ? (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        ) : (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        )}

        {/* Show user's current location */}
        {currentLocation && source === "Current Location" && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>📍 Your Location</Popup>
          </Marker>
        )}

        {currentLocation && source === "Current Location" && <SetViewToLocation location={currentLocation} />}

        {/* Markers for Departments */}
        {Object.entries(departmentLocations).map(
          ([name, position]) =>
            position && (
              <Marker key={name} position={position} icon={customIcon}>
                <Popup>{name}</Popup>
              </Marker>
            )
        )}

        {/* Route line from selected source to destination */}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;