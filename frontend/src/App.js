import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { Button, Card, message } from "antd";
import { MainDiv } from "./components/styled/MainDiv";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const App = () => {
  const queryString = require("query-string");
  const [currentPage, setCurrentPage] = useState("map");
  const [analysisResult, setAnalysisResult] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);

  const login = (username, password) => {
    const key = "updatable";
    message.loading({ content: "Logging in...", key });
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        message.success({ content: "Logged in!", key });
        setCurrentPage("map");
      } else {
        message.error({ content: "Incorrect login credentials", key });
      }
    }, 500);
  };

  const [validRange, setValidRange] = useState(null);

  const selectLocationAndDate = (
    selectedLatitude,
    selectedLongitude,
    selectedDate,
    selectedRange,
    endDate,
    selectedAddress
  ) => {
    //rest api call start
    const key = "updatable";
    message.loading({ content: "Generating Analysis...", key });
    const stringDate = selectedDate.format("YYYY-MM-DD");
    axios
      .get(
        "/api/analysis?" +
          queryString.stringify({
            lat: selectedLatitude,
            lng: selectedLongitude,
            date: stringDate,
            range: selectedRange
          })
      )
      .then(
        response => {
          message.success({ content: "Analysis Generated.", key });
          setAnalysisResult(response.data);
          setValidRange([selectedDate, endDate]);
          setSelectedLocation([
            selectedLatitude,
            selectedLongitude,
            selectedAddress
          ]);
          setCurrentPage("results");
        },
        error => {
          // rest api call done
          message.error({
            content: "Server error. Ensure server is up and running.",
            key
          });
          console.error(error);
        }
      );
  };

  const handleDownloadPDF = () => {
    window.scrollTo(0, 0);
    document.getElementById('fullGoogleMap').style.display='none';
    document.getElementById('partialGoogleMap').style.display='block';
    html2canvas(document.querySelector("#divToPrint")).then(function(canvas) {
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const doc = new jsPDF('p', 'mm');

      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      doc.save('Results.pdf');
    });
    document.getElementById('fullGoogleMap').style.display='block';
    document.getElementById('partialGoogleMap').style.display='none';
  };

  const goBackToMap = () => {
    setCurrentPage("map");
    setAnalysisResult({});
  };

  const pageComponent = {
    login: <LoginPage login={login} />,
    map: <MapPage selectLocationAndDate={selectLocationAndDate} />,
    results: (
      <ResultsPage
        response={analysisResult}
        validRange={validRange}
        selectedLocation={selectedLocation}
      />
    )
  };

  const pageTitle = {
    login: "Forestcasting: Login",
    map: "Forestcasting: Map",
    results: "Forestcasting: Analysis"
  };

  let cardTopButton = (
    <>
      {currentPage === "results" && (
        <Button onClick={handleDownloadPDF} style={{ marginRight: "1em" }}>
          Generate PDF
        </Button>
      )}

      {currentPage === "results" && (
        <Button onClick={goBackToMap} style={{ marginRight: "1em" }}>
          Back to Map
        </Button>
      )}

      {(currentPage === "map" || currentPage === "results") && (
        <Button onClick={() => setCurrentPage("login")}>Logout</Button>
      )}
    </>
  );

  return (
    <MainDiv>
      <Card
        title={pageTitle[currentPage]}
        extra={cardTopButton}
        style={{ "width": "70vw", "minWidth": "1200px"}}
      >
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
