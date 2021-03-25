const getAllFacets = (node, nodeEdgesMap) => {
  if (node.from) {
    return node.toEdges.reduce(
      (acc, toNode) => ([ ...acc, toNode, ...getAllFacets(nodeEdgesMap[toNode], nodeEdgesMap) ])
      , []);
  } else {
    return [];
  }
};

const getNodeDetailsMap = (data) => {
  let nodeEdges = data.edges.reduce((acc, edge) => {
    acc[edge.source] =  {
      ...acc[edge.source],
      name: edge.source,
      from: ((acc[edge.source] || {}).from || 0) + 1,
      toEdges: [
        ...((acc[edge.source] || {}).toEdges || []),
        edge.target
      ]
    };
    acc[edge.target] =  {
      ...acc[edge.target],
      name: edge.target,
      to: ((acc[edge.target] || {}).from || 0) + 1
    };

    return acc;
  }, {});

  return Object.keys(nodeEdges).reduce((acc, key) => {
    acc[key] = {
      ...nodeEdges[key],
      allFacets: [...new Set(getAllFacets(nodeEdges[key], nodeEdges))]
    }

    return acc;
  }, {});
};

const toGraphNodes = (data) => {
  let nodeDetailsMap = getNodeDetailsMap(data);

  let x = data.nodes
    .map(name => ({
      id: name,
      from: ((nodeDetailsMap[name] || {}).from || 0),
      to: ((nodeDetailsMap[name] || {}).to || 0),
      allFacets: ((nodeDetailsMap[name] || {}).allFacets || [])
    }));

  console.log(x.filter(y => y.id === "CustomizationToken"));
  return x;
};

const toGraphEdges = (data, graphNodes) => {
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
