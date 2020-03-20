import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { PDFPage } from "./components/PDFPage/PDFPage";
import { Button, Card, message, PageHeader, Affix } from "antd";
import { MainDiv } from "./components/styled/MainDiv";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { pdfjs } from 'react-pdf';
import moment from "moment";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const App = () => {
  const queryString = require("query-string");
  const [currentPage, setCurrentPage] = useState("map");
  const [analysisResult, setAnalysisResult] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [rangeInDays, setRangeInDays] = useState(0);
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
    localStorage.setItem('persistent_selectedLatitude',selectedLatitude);
    localStorage.setItem('persistent_selectedLongitude' , selectedLongitude);
    localStorage.setItem('persistent_selectedDate' , selectedDate);
    localStorage.setItem('persistent_selectedRange' , selectedRange);
    localStorage.setItem('persistent_endDate' , endDate);
    localStorage.setItem('persistent_selectedAddress' , selectedAddress);
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
          setRangeInDays(selectedRange);
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

  const selectPDFLocationAndDate = () => {
      var selectedLatitude = localStorage.getItem("persistent_selectedLatitude");
      var selectedLongitude = localStorage.getItem("persistent_selectedLongitude");
      var selectedDate = localStorage.getItem("persistent_selectedDate");
      var selectedRange = localStorage.getItem("persistent_selectedRange");
      var endDate = localStorage.getItem("persistent_endDate");
      var selectedAddress = localStorage.getItem("persistent_selectedAddress");

      var selectedDate = localStorage.getItem("persistent_selectedDate");
      console.log("persistent_selectedDate after" + selectedDate);
    //rest api call start
    const key = "updatable";
    message.loading({ content: "Generating PDF...", key });
    console.log("stringDate before " + new Date(selectedDate));
    const stringDate =  moment(new Date(selectedDate)).format("YYYY-MM-DD")
    console.log("stringDate " + stringDate);
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
          message.success({ content: "PDF Generated.", key });
          setAnalysisResult(response.data);
          setValidRange([selectedDate, endDate]);
          setSelectedLocation([
            selectedLatitude,
            selectedLongitude,
            selectedAddress
          ]);
          setRangeInDays(selectedRange);
          setCurrentPage("pdf");
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
    // document.getElementById("fullGoogleMap").style.display = "none";
    // document.getElementById("partialGoogleMap").style.display = "block";
    html2canvas(document.querySelector("#divToPrint")).then(function(canvas) {
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      console.log("canvas height = " + canvas.height);
      console.log("canvas width = " + canvas.width);
      console.log("imgHeight = " + imgHeight);
      const doc = new jsPDF("p", "mm");

      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      doc.save("Results.pdf");
    });
    // document.getElementById("fullGoogleMap").style.display = "block";
    // document.getElementById("partialGoogleMap").style.display = "none";
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
    ),
    pdf: (
      <PDFPage
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
        <Button onClick={selectPDFLocationAndDate} style={{ marginRight: "1em" }}>
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

      <Card style={{ width: "70vw", minWidth: "1200px" }}>
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
