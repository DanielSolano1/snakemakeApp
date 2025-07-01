import * as React from 'react';
import { useCallback, useState } from 'react';
import { ReactFlow,Controls,Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
// import bwa from 'rules/bwa_mem.json';
// import sort from 'rules/samtools_sort.json';
import { createNodeFromJson } from './createNodeFromJson';
import DynamicNode from './dynamicNode';

const rfStyle = {
  backgroundColor: '#B8CEFF',
};

const initialNodes = [
  {
    id: 'node-1',
    type: 'textUpdater',
    position: { x: 10, y: 100 },
    data: { value: 123 },
  },
  {
    id: 'node-2',
    type: 'textUpdater',
    position: { x: 300, y: 100 },
    data: { value: 123 },
  },
];

const initialEdges = [{ id: '1', source: 'node-1', target: 'node-2' }];

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode, dynamic: DynamicNode };

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  function addNodes() {
    const newNode = {
      id: `node-${+new Date()}`,
      type: 'textUpdater',
      // Random position for the new node
      position: { x: Math.random() * 100, y: Math.random() * 150 },
      data: { value: 123, label: 'new Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  function addWrapperNode() {

    fetch('/rules/samtools_sort.json') 
    .then((res) => res.json())
    .then((data) => {
      const newWrapperNode = createNodeFromJson(data);
      newWrapperNode.position = { 
        x: Math.random() * 100, 
        y: Math.random() * 150 };
      setNodes((prev) => [...prev, newWrapperNode]);
      console.log('New wrapper node added:', newWrapperNode);
    })
    .catch((err) => {
      console.error('Failed to load rule:', err);
    });
  }
    // const newWrapperNode = createNodeFromJson(bwa);
    // // bwa is just the first rule we created bwa_mem.json
    // //we are using sort right now
    //newWrapperNode.position = { 
    //x: Math.random() * 100, 
    //y: Math.random() * 150 };
    // setNodes((nds) => [...nds, newWrapperNode]);
    // console.log('New wrapper node added:', newWrapperNode);


  return (
    <div className="flow-container">
      <button onClick={addNodes} className="add-basic-node-button">
        Add Basic Node
      </button>

      <button onClick={addWrapperNode} className="add-wrapper-node-button">
        Add Wrapper Node
      </button>

      <ReactFlow
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        style={rfStyle}
      >
      <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
