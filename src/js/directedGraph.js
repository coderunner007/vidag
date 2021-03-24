import * as d3 from "d3";
import '../css/style.scss';

const scale = d3.scaleOrdinal(d3.schemeCategory10);
const colour = d => scale(d.group);
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
  return (node.count || 0) + 6;
}

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
    .call(drag(simulation));

  node.on("mouseover", (d) => {
    link.style('stroke-opacity', function(l) {
      if (d === l.target) {
        return 1;
      } else {
        return arrowOpacity;
      }
    })
  }).on("mouseout", (d) => {
    link.style("stroke-opacity", arrowOpacity)
  });

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

  const text = svg.append("g").attr("class", "labels").selectAll("g")
    .data(nodes)
    .enter().append("g");

  text.append("text")
    .attr("x", 14)
    .attr("y", ".31em")
    .attr("opacity", 0.01)
    .attr("pointer-events", "none")
    .style("font-family", "sans-serif")
    .style("font-size", "0.7em")
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

  console.log(dims);
  function zoomed(e) {
    const transformFactor = Math.sqrt(e.transform.k);
    console.log(e.transform);

    const newCenter = {
      x: e.transform.x,
      y: e.transform.y
    };
    const transfromY = e.transform.y;
    // node.attr("r", d => getNodeSize(d) * transformFactor);
    svg.attr(
    "transform",
      `translate(${newCenter.x}, ${newCenter.y}) scale(${transformFactor})`);
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
