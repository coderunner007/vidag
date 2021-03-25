import * as d3 from "d3";
import '../css/style.scss';

const scale = d3.scaleOrdinal(d3.schemeCategory10);
const colour = d => scale(getNodeColor(d));
const height = window.innerHeight;
const width = window.innerWidth;

const svgElementSize = () => {
  const svgEl = document.getElementsByTagName("svg")[0];
  const height = window.innerHeight;
  const width = window.innerWidth;
  svgEl.setAttribute("width", width);
  svgEl.setAttribute("height", height);
}

const initSvg = () => {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  svgElementSize();
  window.addEventListener("resize", svgElementSize);
}

const getDimensions = () => {
  const height = window.innerHeight;
  const width = window.innerWidth;

  return {
    radius: (((Math.min(width, height) / 2) - 100) || 50),
    center: {
      x: width / 2,
      y: height / 2
    }
  }
};

const getNodeSize = (node) => {
  return (node.from || 0) + 6;
}

const getNodeColor = (node) => {
  return (node.to || 0);
}

const getNodeClasses = (node) =>  {
  return [ ...node.allFacets, node.id].join(" ");
};

const init = (data) => {
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));
  initSvg();

  const dims = getDimensions();
  const minDistanceBetweenNodes = 4;
  const arrowOpacity = 0.1;
  const opacityDiffFactor = 0.01;

  const simulation = d3.forceSimulation(nodes)
    // .force('charge', d3.forceManyBody().strength(5))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink(links).id(d => d.id))
    .force("r", d3.forceRadial(dims.radius, dims.center.x, dims.center.y).strength(0.04))
    .force('collision', d3.forceCollide().radius(function(d) {
      return getNodeSize(d) + minDistanceBetweenNodes;
    }))

  const svgT = d3.select("svg");
  const svg = svgT.append("g");

  const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", arrowOpacity)
    .attr("marker-end", "url(#arrow)")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", getNodeSize)
    .attr("fill", colour)
    .attr("class", getNodeClasses)
    .call(drag(simulation));

  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("opacity", arrowOpacity)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

  node.append("title")
    .text(d => d.id);

  const text = svg.append("g")
    .attr("id", "labels")
    .attr("class", "hide")
    .selectAll("g")
    .data(nodes)
    .enter().append("g");

  text.append("text")
    .attr("x", 1)
    .attr("y", ".31em")
    .attr("opacity", 1)
    .attr("pointer-events", "none")
    .style("font-family", "sans-serif")
    .style("font-size", "0.25em")
    .attr("class", getNodeClasses)
    .text(function(d) { return d.id; })


  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    text
      .attr("transform",
        function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  });

  // invalidation.then(() => simulation.stop());

  svgT.call(d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed));

  function zoomed(e) {
    const { x, y, k } = e.transform;
    const inverseK = 1 / k;
    const isZoomEvent = e.sourceEvent.type === "wheel";
    const showLabelsAfterZoomLevel = 2;

    if (isZoomEvent) {
      if (k > showLabelsAfterZoomLevel) {
        document.getElementById("labels").classList.remove("hide");
      } else {
        document.getElementById("labels").classList.add("hide");
      }
    }

    svg.attr(
      "transform",
      `translate(${x}, ${y}) scale(${k})`);
  }

  return svgT.node();
}

const drag = simulation => {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

export { init };
