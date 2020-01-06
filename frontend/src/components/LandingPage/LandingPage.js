import React from "react";
import "./styles.css";

class LandingPage extends React.Component {
  render() {
    return (
      <div className="landing-page">
        <div className="main-title">
          <h3 style={{ fontSize: "50px" }}>Forestcasting</h3>
          <div className="button">
            <h1 style={{ fontSize: "20px", margin: "0" }}>Login</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
