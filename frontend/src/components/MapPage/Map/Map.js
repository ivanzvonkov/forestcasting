import React, { Component } from "react";
import GoogleMap from "google-map-react";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyACzTyxDFrJHcmLz7RpvB17xlE34nIueRE";
const GEOCODING_API_KEY = "AIzaSyACzTyxDFrJHcmLz7RpvB17xlE34nIueRE";

class Map extends Component {
  constructor() {
    super();
    this.state = {
      center: { lat: 62.227, lng: -105.3809 },
      zoom: 3,
      selection: "Click to select a location"
    };
    this._onClick = this._onClick.bind(this);
  }

  static defaultProps = {
    center: { lat: 62.227, lng: -105.3809 },
    zoom: 3
  };

  _onClick(event) {
    console.log("Lat:", event.lat);
    console.log("Lng:", event.lng);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${GEOCODING_API_KEY}`
      )
      .then(res => {
        const selection = res.data.results[0].formatted_address;
        this.setState({ selection });
      });
  }

  render() {
    return (
      <div style={{ height: "90vh", width: "70vw" }}>
        <h2>{this.state.selection}</h2>
        <GoogleMap
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
          defaultCenter={this.props.center}
          center={this.state.center}
          defaultZoom={this.props.zoom}
          onClick={this._onClick}
        />
      </div>
    );
  }
}

export default Map;
