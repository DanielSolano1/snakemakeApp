import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TextUpdaterNode from './TextUpdaterNode';
import DynamicNode from './dynamicNode';
import { createNodeFromJson } from './createNodeFromJson';

const rfStyle = {
  backgroundColor: '#B8CEFF',
};

// Define the structure of your Rule object (based on combined.json)
interface Rule {
  name: string;
  [key: string]: any; // other optional fields
}

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [{ id: '1', source: 'node-1', target: 'node-2' }];

const nodeTypes = { textUpdater: TextUpdaterNode, dynamic: DynamicNode };

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [rules, setRules] = useState<Rule[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const addNodes = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'textUpdater',
      position: { x: Math.random() * 100, y: Math.random() * 150 },
      data: { value: 123, label: 'New Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  function exportRule() {
    console.log(nodes)
    const minimalNodes = nodes.map(node => ({
      id: node.id,
      data: node.data,
    }));
     
    const edgeData = JSON.stringify(edges, null, 2);
    const blah = JSON.stringify(minimalNodes, null, 2);
    console.log('--- Exported Nodes ---\n', blah);
    console.log('--- Exported Edges ---\n', edgeData);
  
    // Optionally return a combined JSON object
    const exportObject = {
      nodes: minimalNodes,
      edges
    };
  
    return JSON.stringify(exportObject, null, 2);
  }

  const addWrapperNode = () => {
    fetch('rules/combined.json')
      .then((res) => res.json())
      .then((data) => {
        console.log('Loaded rules:', data.rules);
        setRules(data.rules || []);
        setShowDropdown(true);
      })
      .catch((err) => {
        console.error('Failed to load combined rules:', err);
      });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = rules.find((rule) => rule.name === e.target.value);
    setSelectedRule(selected || null);
    console.log('Selected rule:', selected);
    const newNode = createNodeFromJson(selected);
      if (newNode) {
        setNodes((nds) => [...nds, newNode]);
      } else {
        console.error('Failed to create node from selected rule');
      }
      e.target.value = "";
  };

  return (
    <div className="flow-container" style={{ padding: '1rem', position: 'absolute' }}>
    <button onClick={addNodes} className="add-basic-node-button" style={{ marginRight: '10px' }}>
      Add Basic Node
    </button>
  
    <button onClick={addWrapperNode} className="add-wrapper-node-button">
      Add Wrapper Node
    </button>
  
    {showDropdown && (
      <select
        onChange={handleSelect}
        defaultValue=""
        className="canvas-dropdown"
      >
        <option value="" disabled>Select a rule...</option>
        {rules.map((rule, index) => (
          <option key={index} value={rule.name}>{rule.name}</option>
        ))}
      </select>
    )}
  
  <button onClick= {exportRule} className="export-button">
    Export
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
