import { GraphCreator } from "./js/directedGraph.js";
import { fetchData } from "./js/api.js";
import { toGraphInput } from "./js/transform.js";

function init() {
  "use strict";

  var docEl = document.documentElement,
    bodyEl = document.getElementsByTagName('body')[0];

  var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

  // var xLoc = width/2 - 25,
  //   yLoc = 100;

  // initial node data
  // var nodes = [
  //   {title: "new concept0", id: 0, x: xLoc, y: yLoc},
  //   {title: "new concept1", id: 1, x: xLoc, y: yLoc + 200},
  //   {title: "new concept2", id: 2, x: xLoc + 200, y: yLoc},
  //   {title: "new concept3", id: 3, x: xLoc - 200, y: yLoc}
  // ];
  // var edges = [
  // {source: nodes[1], target: nodes[0]},
  // {source: nodes[2], target: nodes[0]},
  // {source: nodes[2], target: nodes[3]},
  // {source: nodes[1], target: nodes[2]},
  // {source: nodes[1], target: nodes[3]}
// ];
  const graphInput = toGraphInput(fetchData());


  /** MAIN SVG **/
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
  var graph = new GraphCreator(svg, graphInput.nodes, graphInput.edges);
  graph.setIdCt(2);
  graph.updateGraph();
}

init();
