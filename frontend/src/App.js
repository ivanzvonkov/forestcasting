import React, { useState } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { LoadingPage } from "./components/LoadingPage/LoadingPage";
import { MapPage } from "./components/MapPage/MapPage";
import { ResultsPage } from "./components/ResultsPage/ResultsPage";
import { Card } from "antd";
import { TemporaryPageToggle } from "./components/TemporaryPageToggle/TemporaryPageToggle";
import { MainDiv } from "./components/styled/MainDiv";

const App = () => {
  const [currentPage, setCurrentPage] = useState("results");

  const login = (username, password) => {
    //rest api call start
    setCurrentPage("loading");

    // rest api call done
    setCurrentPage("map");
  };

  const selectLocation = (latitude, longitude) => {
    //rest api call start
    setCurrentPage("loading");

    // rest api call done
    setCurrentPage("results");
  };

  const backToMap = () => {
    setCurrentPage("map");
  };

  const pageComponent = {
    login: <LoginPage login={login} />,
    loading: <LoadingPage />,
    map: <MapPage selectLocation={selectLocation} />,
    results: <ResultsPage backToMap={backToMap} />
  };

  const pageToggle = (
    <TemporaryPageToggle
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      pageComponent={pageComponent}
    />
  );

  return (
    <MainDiv>
      <Card title={currentPage} extra={pageToggle}>
        {pageComponent[currentPage]}
      </Card>
    </MainDiv>
  );
};
export default App;
