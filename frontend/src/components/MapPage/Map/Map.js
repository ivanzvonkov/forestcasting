import React, { useState } from "react";
import { Steps, Button, message, Calendar, Alert, DatePicker } from "antd";
import moment from "moment";

import GoogleMap from "google-map-react";
import axios from "axios";
import "./style.css";

export const Map = () => {
  const { Step } = Steps;

  const [current, setCurrent] = useState(0);

  const [selectedLat, setSelectedLat] = useState(null);

  const [selectedLng, setSelectedLng] = useState(null);

  const [date, setDate] = useState(moment("2017-01-25"));

  const [selectedDate, setSelectedDate] = useState(null);

  const [defaultCenter] = useState({
    lat: 56.41630331167829,
    lng: -114.81301656871508
  });

  const [selectedLocation, setSelectedLocation] = useState(
    "Click on the map to select a location."
  );

  const next = () => {
    var temp = current + 1;
    setCurrent(temp);
  };

  const prev = () => {
    var temp = current - 1;
    setCurrent(temp);
  };

  const onSelect = value => {
    setDate(value);
    setSelectedDate(value);
  };

  const onPanelChange = value => {
    setDate(value);
  };

  const onClick = event => {
    setSelectedLat(event.lat);
    setSelectedLng(event.lng);

    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        setSelectedLocation(
          "You selected: " + res.data.results[0].formatted_address
        );
      });
  };

  const steps = [
    {
      title: "Select Location",
      content: (
        <div
          style={{
            height: "72.5vh",
            width: "70vw",
            paddingTop: "5px"
          }}
        >
          <GoogleMap
            bootstrapURLKeys={{
              key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
            }}
            defaultCenter={defaultCenter}
            center={defaultCenter}
            defaultZoom={6}
            onClick={onClick}
          >
            {selectedLat ? (
              <Marker lat={selectedLat} lng={selectedLng} />
            ) : null}
          </GoogleMap>
          <div style={{ marginTop: "10px", fontSize: "18px" }}>
            <Alert message={selectedLocation} />
          </div>
        </div>
      )
    },
    {
      title: "Select Forecast Date",
      content: (
        <div
          style={{
            height: "70vh",
            width: "70vw",
            paddingTop: "5px"
          }}
        >
          <div
            style={{
              height: "27vh",
              width: "70vw",
              paddingTop: "5px",
              marginBottom: "50px"
            }}
          >
            <GoogleMap
              bootstrapURLKeys={{
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
              }}
              defaultCenter={defaultCenter}
              center={defaultCenter}
              defaultZoom={0}
              onClick={onClick}
            >
              {selectedLat ? (
                <Marker lat={selectedLat} lng={selectedLng} />
              ) : null}
            </GoogleMap>

            <div style={{ marginTop: "10px", fontSize: "18px" }}>
              <Alert message={selectedLocation} />
            </div>
          </div>
          <Calendar
            fullscreen={false}
            value={date}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
          />
          {selectedDate ? (
            <div style={{ marginTop: "10px", fontSize: "18px" }}>
              <Alert
                message={`You selected date: ${selectedDate &&
                  selectedDate.format("YYYY-MM-DD")}`}
              />
            </div>
          ) : null}
        </div>
      )
    }
  ];
  return (
    <div className="center" style={{ height: "90vh", width: "70vw" }}>
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current < steps.length - 1 &&
          (selectedLat ? (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          ) : null)}
        {current === steps.length - 1 &&
          (selectedDate ? (
            <Button
              type="primary"
              onClick={() => message.success("Sending information to analyze!")}
            >
              Done
            </Button>
          ) : null)}
        {current > 0 && (
          <Button style={{ marginLeft: 8 }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div>
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
