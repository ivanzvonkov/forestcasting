import React, { useState } from "react";
import GoogleMap from "google-map-react";
import axios from "axios";

export const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(
    "Click to select a location."
  );

  const [defaultCenter] = useState({ lat: 62.227, lng: -105.3809 });

  const onClick = event => {
    console.log("Lat:", event.lat);
    console.log("Lng:", event.lng);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        setSelectedLocation(res.data.results[0].formatted_address);
      });
  };

  return (
    <div style={{ height: "90vh", width: "70vw" }}>
      <h2>{selectedLocation}</h2>
      <GoogleMap
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultCenter}
        center={defaultCenter}
        defaultZoom={3}
        onClick={onClick}
      />
    </div>
  );
};
export default Map;
