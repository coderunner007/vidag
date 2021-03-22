var data = {
  edges: [ 
    { source: "val", target: "val2" },
    { source: "val", target: "val3" },
  ],
  nodes: [ "val", "val2", "val3" ]
};

var nodes = [
  {title: "new concept0", id: 0, x: xLoc, y: yLoc},
  {title: "new concept1", id: 1, x: xLoc, y: yLoc + 200},
  {title: "new concept2", id: 2, x: xLoc + 200, y: yLoc},
  {title: "new concept3", id: 3, x: xLoc - 200, y: yLoc}
];
var edges = [
  {source: nodes[1], target: nodes[0]},
  {source: nodes[2], target: nodes[0]},
  {source: nodes[2], target: nodes[3]},
  {source: nodes[1], target: nodes[2]},
  {source: nodes[1], target: nodes[3]}
];


const toGraphInput = (data) => {
  if (!data || !data.edges || !data.nodes) {
    return {};
  }
  
  let crudeNodes = data.nodes;
  let crudeEdges = data.edges;

  crudeNodes.map(node)
};
