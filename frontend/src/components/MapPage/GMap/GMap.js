import React from 'react';
import GoogleMap from "google-map-react";
import {Marker} from '../Marker/Marker';
import {AlertMessage} from '../AlertMessage/AlertMessage';

export const GMap = ({isCalendarDisplayed, selectedLat, selectedLng, selectedLocation, onClick}) => {
    const defaultCenter = {lat: 56.41630331167829, lng: -114.81301656871508};
    const mapHeight = isCalendarDisplayed ? "22vh" : "70vh";
    const selectedPoint = {lat: selectedLat, lng: selectedLng}
    return (
        <div>
            <div style={{height: mapHeight, width: "70vw", paddingTop: "5px", transition: 'height 0.3s ease-out'}}>
            <GoogleMap
                bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY}}
                defaultCenter={defaultCenter}
                center={isCalendarDisplayed ? selectedPoint : defaultCenter}
                zoom={isCalendarDisplayed ? 3 : 5}
                onClick={onClick}>
                {selectedLat && <Marker lat={selectedLat} lng={selectedLng} />}
            </GoogleMap>
            </div>
            <AlertMessage message={selectedLocation} />
        </div>
    );
}