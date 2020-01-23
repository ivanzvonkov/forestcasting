import React, {useState} from "react";
import { GMap } from './GMap/GMap';
import { AlertMessage } from './AlertMessage/AlertMessage';
import { Steps, Button, message, Calendar } from "antd";
import moment from "moment";
import axios from "axios";

export const MapPage = ({selectLocationAndDate}) => {
    const { Step } = Steps;
    const [current, setCurrent] = useState(0);

    const [selectedLat, setSelectedLat] = useState(null);
    const [selectedLng, setSelectedLng] = useState(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [defaultDate, setDefaultDate] = useState(moment());
    const validDates = [moment(), moment().add(14, 'days')]

    const [selectedLocation, setSelectedLocation] = useState("Click on the map to select a location.");

    const analyze = () => {
        message.success("Sending information to analyze!");
        selectLocationAndDate(selectedLat, selectedLng, selectedDate);
    }

    const onPanelChange = value => {
        setSelectedDate(null);
        if(value.format('M')-1 === moment().month()){
        setDefaultDate(moment())
        }else{
        setDefaultDate(moment().add(1,'months').startOf('month'))
        }
    };

    const clickMap = event => {
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

    const isCalendarDisplayed = current === 1;

    return (
        <>
            <Steps current={current}>
                <Step title="Select Location" />
                <Step title="Select Forecast Date" />
            </Steps>
            <GMap
                isCalendarDisplayed={isCalendarDisplayed}
                selectedLat={selectedLat}
                selectedLng={selectedLng}
                onClick={clickMap} 
                selectedLocation={selectedLocation}/>
            
            {isCalendarDisplayed && 
                <Calendar
                    fullscreen={false}
                    value={selectedDate ? selectedDate : defaultDate}
                    onSelect={setSelectedDate}
                    onPanelChange={onPanelChange}
                    validRange={validDates}
                />
            }

            {isCalendarDisplayed && selectedDate && 
                <AlertMessage message={`You selected date: ${selectedDate && selectedDate.format("YYYY-MM-DD")}`}/>
            }
        <div style={{paddingTop:'1em', textAlign: 'center'}}>
            {!isCalendarDisplayed && selectedLat && 
                <Button type="primary" onClick={() => setCurrent(current + 1)}>Next</Button>}
            {isCalendarDisplayed && 
                <Button onClick={() => setCurrent(current - 1)}>Previous</Button>}
            {isCalendarDisplayed && selectedDate && 
                <Button style={{marginLeft: '1em'}} type="primary" onClick={analyze}>Done</Button>}
        </div>
        </>
    );
}

