// Functions to transfrom the data
// to the expected graph input.
//
//
// FROM:
// {
//   edges: [ 
//     { source: "val", target: "val2" },
//     { source: "val", target: "val3" },
//   ],
//   nodes: [ "val", "val2", "val3" ]
// };
//
// TO:
// {
//   edges: [
//     {title: "val", id: 0, x: xLoc, y: yLoc},
//     {title: "val2", id: 1, x: xLoc, y: yLoc + 200},
//     {title: "val3", id: 2, x: xLoc + 200, y: yLoc},
//   ],
//   nodes: [
//     {source: nodes[0], target: nodes[1]},
//     {source: nodes[0], target: nodes[2]},
//   ]
// }


const toGraphInput = (data) => {
  if (!data || !data.edges || !data.nodes) {
    return {};
  }
  
  let outEdgesFromNodeCount = data.edges.reduce((acc, edge) => {
    acc[edge.source] =  (acc[edge.source] || 0) + 1;

    return acc;
  }, {});

  let nodes = data.nodes
    .map(
      (name, index) => ({
        title: name,
        id: index,
        count: (outEdgesFromNodeCount[name] || 0)
      })
    )
    .sort(
      (firstNode, secondNode) => secondNode.count - firstNode.count
    );

  return nodes;
};

export { toGraphInput };
