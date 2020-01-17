import React, { useState } from "react";
import GoogleMap from "google-map-react";
import axios from "axios";
import "./style.css";

export const Map = () => {
  const [selectedLat, setSelectedLat] = useState(null);

  const [selectedLng, setSelectedLng] = useState(null);

  const [defaultCenter] = useState({
    lat: 56.41630331167829,
    lng: -114.81301656871508
  });

  const [selectedLocation, setSelectedLocation] = useState(
    "Click to select a location."
  );

  const onClick = event => {
    setSelectedLat(event.lat);
    setSelectedLng(event.lng);

    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        setSelectedLocation(
          "Selected: " + res.data.results[0].formatted_address
        );
      });
  };

  return (
    <div style={{ height: "90vh", width: "70vw" }}>
      <h2>{selectedLocation}</h2>
      <GoogleMap
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultCenter}
        center={defaultCenter}
        defaultZoom={6}
        onClick={onClick}
      >
        {selectedLat ? <Marker lat={selectedLat} lng={selectedLng} /> : null}
      </GoogleMap>
    </div>
  );
};
export default Map;

const Marker = () => {
  return (
    <>
      <div className="pin"></div>
      <div className="pulse"></div>
    </>
  );
};
