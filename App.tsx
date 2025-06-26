import * as React from 'react';
import { useCallback, useState } from 'react';
import { ReactFlow,Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

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
const nodeTypes = { textUpdater: TextUpdaterNode };

function App() {
  const [nodes, setNodes] = useState(initialNodes);
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

  return (
    <div className="flow-container">
      <button onClick={addNodes} className="add-node-button">
        Add Node
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
