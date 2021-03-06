import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { Modal, Button, Card, message, PageHeader, Affix } from "antd";
import { MainDiv } from "./components/styled/MainDiv";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const App = () => {
  const supportedAreas = require("./assets/supportedAreas.PNG");
  const queryString = require("query-string");
  const [currentPage, setCurrentPage] = useState("map");
  const [analysisResult, setAnalysisResult] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [rangeInDays, setRangeInDays] = useState(0);

  const showSupportedAreas = () => {
    Modal.info({
      title: "Areas Supported by Forestcasting",
      centered: "true",
      width: "75%",
      content: (
        <div>
          <div>
            <img
              src={supportedAreas}
              alt="Valid areas map"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                display: "center"
              }}
            />
          </div>
          <div>
            <p>
              Image depicts Pythia's proprietary universal grid system. Invalid
              areas are shown in gray, while valid areas are shown in green &
              black grids.
            </p>
          </div>
        </div>
      )
    });
  };

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
    message.loading({ content: "Generating Analysis...", key, duration: 0 });
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
          // Check response.data
          const validKeys = [
            "location",
            "geography",
            "damage",
            "specificDate",
            "vicinityData"
          ]; //, 'protectedAreaData'];
          let validationError = false;
          for (const validKey of validKeys) {
            if (!(validKey in response.data)) {
              console.error("Missing:" + validKey);
              validationError = true;
            } else {
              let val = response.data[validKey];
              if (typeof val === "object" && Object.entries(val).length === 0) {
                validationError = true;
              } else if (Array.isArray(val)) {
                validationError = true;
              }
              if (validationError) {
                console.error(validKey + " is empty.");
              }
            }
          }

          if (validationError) {
            message.error({
              content: "Analysis provided invalid response",
              key,
              duration: 3
            });
          } else {
            message.success({
              content: "Analysis Generated.",
              key,
              duration: 3
            });
            setAnalysisResult(response.data);
            setValidRange([selectedDate, endDate]);
            setSelectedLocation([
              selectedLatitude,
              selectedLongitude,
              selectedAddress
            ]);
            setRangeInDays(selectedRange);
            setCurrentPage("results");
          }
        },
        error => {
          let errorMessage = "";
          if (error.response && error.response.status === 400) {
            errorMessage = "Insufficient information about grid.";
            console.error(error.response.data.message);
          } else if (error.response && error.response.status === 500) {
            errorMessage = "Received 500 error, server unavailable.";
            console.error(error.response.data);
          } else {
            errorMessage = "Server error. Ensure server is up and running.";
            console.error(error);
          }
          // rest api call done
          message.error({
            content: errorMessage,
            key,
            duration: 3
          });
        }
      );
  };

  const handleDownloadPDF = () => {
    window.scrollTo(0, 0);
    document.getElementById("fullGoogleMap").style.display = "none";
    document.getElementById("navbarText").style.display = "block";
    document.getElementById("possibleCircle").style.display = "none";
    document.getElementById("damageCircle").style.display = "none";
    document.getElementById("protectedCircle").style.display = "none";
    document.getElementById("coverageCircle").style.display = "none";
    document.getElementById("partialGoogleMap").style.display = "block";
    document.getElementById("possibleLine").style.display = "block";
    document.getElementById("damageLine").style.display = "block";
    document.getElementById("protectedLine").style.display = "block";
    document.getElementById("coverageLine").style.display = "block";
    html2canvas(document.querySelector("#divToPrint")).then(function(canvas) {
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 207;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const doc = new jsPDF("p", "mm");

      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      doc.save("Results.pdf");
    });
    document.getElementById("fullGoogleMap").style.display = "block";
    document.getElementById("navbarText").style.display = "none";
    document.getElementById("possibleCircle").style.display = "flex";
    document.getElementById("damageCircle").style.display = "block";
    document.getElementById("protectedCircle").style.display = "block";
    document.getElementById("coverageCircle").style.display = "block";
    document.getElementById("partialGoogleMap").style.display = "none";
    document.getElementById("possibleLine").style.display = "none";
    document.getElementById("damageLine").style.display = "none";
    document.getElementById("protectedLine").style.display = "none";
    document.getElementById("coverageLine").style.display = "none";
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
        rangeInDays={rangeInDays}
      />
    )
  };

  let cardTopButton = (
    <>
      {currentPage === "results" && (
        <Button onClick={goBackToMap} style={{ marginRight: "1em" }}>
          Back to Map
        </Button>
      )}
      {currentPage === "results" && (
        <Button onClick={handleDownloadPDF} style={{ marginRight: "1em" }}>
          Generate PDF
        </Button>
      )}
      {(currentPage === "map" || currentPage === "results") && (
        <Button onClick={showSupportedAreas} style={{ marginRight: "1em" }}>
          Supported Areas
        </Button>
      )}

      {(currentPage === "map" || currentPage === "results") && (
        <Button onClick={() => setCurrentPage("login")}>Logout</Button>
      )}
    </>
  );

  return (
    <MainDiv
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center"
      }}
    >
      <Affix
        style={{
          width: "100%"
        }}
      >
        <PageHeader
          style={{
            borderBottom: "1px solid rgb(202, 204, 207)",
            width: "100%",
            height: "85px",
            backgroundColor: "white"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <img
              src="forestcasting_logo_final.png"
              style={{
                height: "80px",
                display: "inline",
                marginLeft: "20px"
              }}
              alt=""
            />
            <div
              style={{
                marginRight: "20px"
              }}
            >
              {cardTopButton}
            </div>
          </div>
        </PageHeader>
      </Affix>

      <Card style={{ width: "90%", maxWidth: "1800px" }}>
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
