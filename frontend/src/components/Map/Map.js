import React, { Component } from "react";
import * as topojson from "topojson";
import * as d3 from "d3";

class Map extends Component {
  constructor() {
    super();
    this.state = {
      usData: null,
      usCongress: null
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }

  componentWillMount() {
    const files = [
      "https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us.json",
      "https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us-congress-113.json"
    ];
    const promises = [];

    files.forEach(function(url) {
      promises.push(d3.json(url));
    });
    Promise.all(promises).then(values => {
      console.log(values[0]);
      this.setState({
        usData: values[0],
        usCongress: values[1]
      });
    });

    // d3.queue()
    //   .defer(
    //     d3.json,
    //     "https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us.json"
    //   )
    //   .defer(
    //     d3.json,
    //     "https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us-congress-113.json"
    //   )
    //   .await((error, usData, usCongress) => {
    //     this.setState({
    //       usData,
    //       usCongress
    //     });
    //   });
  }

  componentDidUpdate() {
    const svg = d3.select(this.refs.anchor),
      { width, height } = this.props;

    const projection = d3
      .geoAlbers()
      .scale(1070)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection);

    const us = this.state.usData,
      congress = this.state.usCongress;

    // svg
    //   .append("defs")
    //   .append("path")
    //   .attr("id", "land")
    //   .datum(topojson.feature(us, us.objects.land))
    //   .attr("d", path);

    // svg
    //   .append("clipPath")
    //   .attr("id", "clip-land")
    //   .append("use")
    //   .attr("xlink:href", "#land");

    //   svg
    //   .append("rect")
    //   .attr("class", "background")
    //   .attr("height", "land")
    //   .datum(topojson.feature(us, us.objects.land))
    //   .attr("d", path);

    svg
      .append("g")
      .attr("class", "districts")
      .attr("clip-path", "url(#clip-land)")
      .selectAll("path")
      .data(topojson.feature(congress, congress.objects.districts).features)
      .enter()
      .append("path")
      .attr("d", path)
      .append("title")
      .text(function(d) {
        return d.id;
      });

    svg
      .append("path")
      .attr("class", "district-boundaries")
      .datum(
        topojson.mesh(congress, congress.objects.districts, function(a, b) {
          return a !== b && ((a.id / 1000) | 0) === ((b.id / 1000) | 0);
        })
      )
      .attr("d", path);

    svg
      .append("path")
      .attr("class", "state-boundaries")
      .datum(
        topojson.mesh(us, us.objects.states, function(a, b) {
          return a !== b;
        })
      )
      .attr("d", path);
  }

  render() {
    const { usData, usCongress } = this.state;

    if (!usData || !usCongress) {
      return null;
    }

    return <g ref="anchor" />;
  }
}

export default Map;
