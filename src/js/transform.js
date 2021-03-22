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


const getGraphCenter = () => {
  var docEl = document.documentElement,
    bodyEl = document.getElementsByTagName('body')[0];

  var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

  return {
    x: width/2 - 25,
    y: height/2 - 25
  };
};


const noOfNodesPerCircle = 4;

const circleRadius = (index) => {
  const nextCircleRadius = 200;

  return (index / noOfNodesPerCircle) * nextCircleRadius;
};

const angleOfNode = (index) => {
  let nodeIndexOnCircle = index % noOfNodesPerCircle;
  return nodeIndexOnCircle ? ((Math.PI * 2) / (nodeIndexOnCircle)) : 0;
};

const getGraphNodeX = (graphNode, index) => {
  if (index === 0) {
    return 0;
  } else {
    return circleRadius(index) * Math.cos(angleOfNode(index));
  }
};

const getGraphNodeY = (graphNode, index) => {
  if (index === 0) {
    return 0;
  } else {
    return circleRadius(index) * Math.sin(angleOfNode(index));
  }
};

const toGraphNodes = (data) => {
  let outEdgesFromNodeCount = data.edges.reduce((acc, edge) => {
    acc[edge.source] =  (acc[edge.source] || 0) + 1;

    return acc;
  }, {});
  let nodesGroupedBySourceNode = data.edges.reduce((acc, edge) => {
    acc[edge.source] = acc[edge.source]
      ? [ ...acc[edge.source], edge.target ]
      : [edge.target]

    return acc;
  }, {});

  let nodesMap = data.nodes
    .reduce(
      (acc, name, index) => {
        acc[name] = {
          id: name,
          group: 20,
          count: (outEdgesFromNodeCount[name] || 0)
        };

        return acc;
      },
      {}
    );

  let allNodesSingleGroup = Object.values(nodesMap).sort(
    (firstNode, secondNode) => secondNode.count - firstNode.count
  );

  const totalGroups = 15;
  for (let i = 0; i < totalGroups; i++) {
    let sourceNode = allNodesSingleGroup[i];
    nodesMap[sourceNode.id] = {
      ...nodesMap[sourceNode.id],
      group: i + 1
    };

    let allTargetNodesFromThisSource = nodesGroupedBySourceNode[sourceNode.id];
    for (let i = 0; i < allTargetNodesFromThisSource.length; i++) {
      let targetNode = allTargetNodesFromThisSource[i];
      nodesMap[targetNode.id] = {
        ...nodesMap[targetNode.id],
        group: i + 1
      };
    }
  }

  return Object.values(nodesMap);
};

const getGraphNodesIndexMap = (graphNodes) => {
  return graphNodes.reduce(
    (acc, graphNode, index) => {
      acc[graphNode.title] = index;

      return acc;
    },
    {});
};

const toGraphEdges = (data, graphNodes) => {
  const graphNodesIndexMap = getGraphNodesIndexMap(graphNodes);

  return data.edges.map(edge => (
    {
      ...edge,
      value: 1
    }
  ));
};

const toGraphInput = (data) => {
  if (!data || !data.edges || !data.nodes) {
    return {};
  }

  let graphNodes = toGraphNodes(data);
  let graphEdges = toGraphEdges(data, graphNodes);

  console.log(graphEdges, graphNodes);
  return {
    nodes: graphNodes,
    links: graphEdges
  };
};

export { toGraphInput };
