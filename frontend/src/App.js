import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { Card, message } from "antd";
import { MainDiv } from "./components/styled/MainDiv";
import axios from 'axios';

const App = () => {
  const queryString = require('query-string');
  const [currentPage, setCurrentPage] = useState("login");
  const [analysisResult, setAnalysisResult] = useState({});

  const login = (username, password) => {
    const key = 'updatable';
    message.loading({content: 'Loggin in...', key});
    setTimeout(() => {
      if(username === 'admin' && password === 'admin'){
        message.success({content: 'Logged in!', key})
        setCurrentPage("map");
      }else{
        message.error({content: 'Incorrect login credentials', key});  
      }
    }, 500);
  };

  const selectLocationAndDate = (selectedLatitude, selectedLongitude, selectedDate) => {
    //rest api call start
    const stringDate = selectedDate.format('YYYY-MM-DD');
    axios.get('/api/analysis?' + queryString.stringify({
      lat: selectedLatitude,
      lng: selectedLongitude,
      date: stringDate
    }))
    .then((response) => {
      // rest api call done
      setAnalysisResult(response.data);
      setCurrentPage("results");
    }, (error) => {
      // rest api call done
      console.error(error);
    });
  };

  const backToMap = () => {
    setCurrentPage("map");
  };

  const pageComponent = {
    login: <LoginPage login={login} />,
    map: <MapPage selectLocationAndDate={selectLocationAndDate} />,
    results: <ResultsPage backToMap={backToMap} response={analysisResult} />
  };

  const pageTitle = {
    login: 'Forestcasting: Login',
    map: 'Forestcasting: Map',
    results: 'Forestcasting: Analysis'
  }

  return (
    <MainDiv>
      <Card title={pageTitle[currentPage]}>
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
