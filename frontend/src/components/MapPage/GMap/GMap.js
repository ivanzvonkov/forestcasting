import React from "react";
import GoogleMap from "google-map-react";
import { Marker } from "../Marker/Marker";
import { AlertMessage } from "../AlertMessage/AlertMessage";

export const GMap = ({
  currentPage,
  selectedLat,
  selectedLng,
  selectedLocation,
  onClick
}) => {
  const defaultCenter = { lat: 56.41630331167829, lng: -114.81301656871508 };
  const mapHeight =
    currentPage === "mapLocation"
      ? "70vh"
      : currentPage === "mapDate"
      ? "40vh"
      : "20vh";
  const selectedPoint = { lat: selectedLat, lng: selectedLng };
  return (
    <div>
      <div
        style={{
          height: mapHeight,
          paddingTop: "5px",
          transition: "height 0.3s ease-out",
          marginBottom: "10px"
        }}
      >
        <GoogleMap
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={defaultCenter}
          center={currentPage === "mapLocation" ? defaultCenter : selectedPoint}
          zoom={currentPage === "mapLocation" ? 5 : 3}
          onClick={onClick}
        >
          {selectedLat && <Marker lat={selectedLat} lng={selectedLng} />}
        </GoogleMap>
      </div>
      <AlertMessage
        message={selectedLocation}
        type={selectedLat ? "success" : "info"}
      />
    </div>
  );
};
