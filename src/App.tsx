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
import { MarkerType } from '@xyflow/react';


const rfStyle = {
  backgroundColor: '#B8CEFF',
};

interface Rule {
  name: string;
  [key: string]: any;
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

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);

    if (!sourceNode || !targetNode) return;

    if (sourceNode.id === targetNode.id) {
      console.error('Cannot connect a node to itself:', sourceNode.id);
      return;
    }

    const tempEdges = [...edges, connection];
    const adjacencyList: Record<string, string[]> = {};

    tempEdges.forEach(({ source, target }) => {
      if (!adjacencyList[source]) {
        adjacencyList[source] = [];
      }
      adjacencyList[source].push(target);
    });

    if (hasCycle(adjacencyList)) {
      console.error('Cycle detected! Cannot add this edge:', connection);
      return;
    }

    // Check compatibility
    const output = sourceNode.data?.output_types;
    const input = targetNode.data?.input_types;


    console.log(targetNode, " ", sourceNode);


    console.log(input, " ", output);

    if(Array.isArray(input) && Array.isArray(output) && !output.some(type => input.includes(type))){
      console.error("Incompatible connection: No matching output/input file types.");
      return;
    }

    setEdges((eds) => addEdge(connection, eds));
  }, [nodes, edges]);

  function hasCycle(adjList: Record<string, string[]>): boolean {
    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};
    function dfs(node: string): boolean {
      visited[node] = true;
      recStack[node] = true;
      for (const neighbor of adjList[node] || []) {
        if (!visited[neighbor] && dfs(neighbor)) return true;
        else if (recStack[neighbor]) return true;
      }
      recStack[node] = false;
      return false;
    }
    for (const node in adjList) {
      if (!visited[node] && dfs(node)) return true;
    }
    return false;
  }

  function exportRule() {
    const minimalNodes = nodes.map(node => ({
      id: node.id,
      data: node.data,
    }));

    console.log('--- Exported Nodes ---\n', JSON.stringify(minimalNodes, null, 2));
    console.log('--- Exported Edges ---\n', JSON.stringify(edges, null, 2));

    return JSON.stringify({ nodes: minimalNodes, edges }, null, 2);
  }

  const addWrapperNode = () => {
    fetch('rules/combined.json')
      .then((res) => res.json())
      .then((data) => {
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
    const newNode = createNodeFromJson(selected);
    if (newNode) {
      setNodes((nds) => [...nds, newNode]);
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
        <select onChange={handleSelect} defaultValue="" className="canvas-dropdown">
          <option value="" disabled>Select a rule...</option>
          {rules.map((rule, index) => (
            <option key={index} value={rule.name}>{rule.name}</option>
          ))}
        </select>
      )}
      <button onClick={exportRule} className="export-button">
        Export
      </button>
      <ReactFlow
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 40,
            height: 40,
          }
        }))}
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