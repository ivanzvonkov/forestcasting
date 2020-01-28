import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { Button, Card, message } from "antd";
import { MainDiv } from "./components/styled/MainDiv";
import axios from "axios";
import moment from "moment";

const App = () => {
  const queryString = require("query-string");
  const [currentPage, setCurrentPage] = useState("map");
  const [analysisResult, setAnalysisResult] = useState({});

  const login = (username, password) => {
    const key = "updatable";
    message.loading({ content: "Loggin in...", key });
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        message.success({ content: "Logged in!", key });
        setCurrentPage("map");
      } else {
        message.error({ content: "Incorrect login credentials", key });
      }
    }, 500);
  };

  /******** DATE RANGE CODE  */

  // let dateArray = [];
  const [validRange, setValidRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  // const addDays = (date, days) => {
  //   const copy = new Date(Number(date));
  //   copy.setDate(date.getDate() + days);
  //   console.log(copy);

  //   let year = copy.getUTCFullYear();
  //   let month = copy.getUTCMonth() + 1;

  //   if (month < 10) {
  //     month = "0" + month.toString();
  //   }

  //   let day = copy.getUTCDate();
  //   console.log(day);
  //   if (day < 10) {
  //     day = "0" + day.toString();
  //   }

  //   console.log(year + "-" + month + "-" + day);
  //   return year + "-" + month + "-" + day;
  // };

  // const getValidDates = (date, range) => {
  //   range = range - 1;

  //   date = new Date(date);

  //   for (let i = 0; i <= range; i++) {
  //     console.log(date, i);

  //     let newDate = addDays(date, i);
  //     console.log(newDate);
  //     dateArray.push(newDate);
  //   }
  //   setValidRange([
  //     moment(dateArray[0], "YYYY-MM-DD"),
  //     moment(dateArray[range - 1], "YYYY-MM-DD")
  //   ]);
  //   console.log(dateArray[0]);
  // };

  // const calendarMap = new Map();
  // const enumerateDaysBetweenDates = (startDate, endDate) => {
  //   var currDate = moment(startDate).startOf("day");
  //   calendarMap.set(1, currDate);

  //   var lastDate = moment(endDate).startOf("day");
  //   calendarMap.set(response.specificDate.analysisResults.length, lastDate);

  //   let i = 2;
  //   while (currDate.add(1, "days").diff(lastDate) < 0) {
  //     console.log(currDate.toDate());
  //     calendarMap.set(i, currDate.clone().toDate());
  //     i++;
  //   }
  //   console.log(calendarMap);
  // };
  /******** DATE RANGE CODE  */

  const selectLocationAndDate = (
    selectedLatitude,
    selectedLongitude,
    selectedDate,
    selectedRange,
    endDate
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
          setStartDate(selectedDate);
          setValidRange([selectedDate, endDate]);
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

  const goBackToMap = () => {
    setCurrentPage("map");
    setAnalysisResult({});
  };

  const pageComponent = {
    login: <LoginPage login={login} />,
    map: <MapPage selectLocationAndDate={selectLocationAndDate} />,
    results: <ResultsPage response={analysisResult} validRange={validRange} />
  };

  const pageTitle = {
    login: "Forestcasting: Login",
    map: "Forestcasting: Map",
    results: "Forestcasting: Analysis"
  };

  let cardTopButton = (
    <>
      {currentPage === "results" && (
        <Button onClick={goBackToMap} style={{ marginRight: "1em" }}>
          Back to map
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
        style={{ width: "70vw" }}
      >
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
