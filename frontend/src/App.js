import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Map from "./components/Map/Map";
import LandingPage from "./components/LandingPage/LandingPage";

function App() {
  return (
    <div className="App">
      <LandingPage />
      <svg width="960" height="1000">
        <Map width={960} height={1000} />
      </svg>
    </div>
  );
}
export default App;
