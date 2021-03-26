import * as d3 from "d3";
import '../css/style.scss';

"use strict";

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

const getRenderConfig = () => ({
  link: {
    opacity: d => 1,
    strokeWidth: d => Math.sqrt(d.value),
  },
  node: {
  },
  zoomLevel: {
    showLabelsAfter: 2,
    max: 10,
    min: 1
  }
});

const getLinks = (parentD3Element, linksData) => {
  parentD3Element.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("opacity", getRenderConfig().link.opacity)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

  return parentD3Element.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", getRenderConfig().link.opacity)
    .attr("marker-end", "url(#arrow)")
    .selectAll("line")
    .data(linksData)
    .enter().append("line")
    .attr("stroke-width", getRenderConfig().link.strokeWidth);
};

const getNodes = (parentD3Element, nodesData) => {
 return parentD3Element.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodesData)
    .enter().append("circle")
    .attr("r", getNodeSize)
    .attr("fill", colour)
    .attr("class", getNodeClasses);
};

const getLabels = (parentD3Element, nodesData) => {
  return parentD3Element.append("g")
    .attr("id", "labels")
    .attr("class", "hide")
    .selectAll("g")
    .data(nodesData)
    .enter().append("g")
    .append("text")
    .attr("x", 1)
    .attr("y", ".31em")
    .attr("opacity", 1)
    .attr("pointer-events", "none")
    .style("font-family", "sans-serif")
    .style("font-size", "0.25em")
    .attr("class", getNodeClasses)
    .text(function(d) { return d.id; })
};

const onZoomOrPan = (parentD3Element) => (event) => {
  const { x, y, k } = event.transform;
  const inverseK = 1 / k;
  const isZoomEvent = event.sourceEvent.type === "wheel";

  if (isZoomEvent) {
    if (k > getRenderConfig().zoomLevel.showLabelsAfter) {
      document.getElementById("labels").classList.remove("hide");
    } else {
      document.getElementById("labels").classList.add("hide");
    }
  }

  parentD3Element.attr(
    "transform",
    `translate(${x}, ${y}) scale(${k})`);
};

const init = (data) => {
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));
  initSvg();

  const dims = getDimensions();
  const minDistanceBetweenNodes = 4;

  const simulation = d3.forceSimulation(nodes)
    // .force('charge', d3.forceManyBody().strength(5))
    .force('center', d3.forceCenter(dims.center.x, dims.center.y))
    .force('link', d3.forceLink(links).id(d => d.id))
    .force("r", d3.forceRadial(dims.radius, dims.center.x, dims.center.y).strength(0.04))
    .force('collision', d3.forceCollide().radius(function(d) {
      return getNodeSize(d) + minDistanceBetweenNodes;
    }))

  const svg = d3.select("svg");
  const parentD3Element = svg.append("g");

  const link = getLinks(parentD3Element, links);
  const node = getNodes(parentD3Element, nodes).call(drag(simulation));
  const text = getLabels(parentD3Element, nodes);

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

  svg.call(d3.zoom()
    .scaleExtent([getRenderConfig().zoomLevel.min, getRenderConfig().zoomLevel.max])
    .on("zoom", onZoomOrPan(parentD3Element)));

  return svg.node();
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
