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
    data: { name: "node-1", value: 123 },
  },
  {
    id: 'node-2',
    type: 'textUpdater',
    position: { x: 300, y: 100 },
    data: { name: "node-2", value: 123 },
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
  const [showTextbox, setShowTextbox] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [exportText, setShowExport] = useState(false);
  const [snakefileText, setSnakefileText] = useState("");




  const addNodes = () => {
    setShowTextbox(false);
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
    // Validate connection before adding it

    let isValid = true;
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);

    if (!sourceNode || !targetNode) return;
    const canConnect = false;
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

    // Check compatibility of input/output types and set them to output/input
    const output = sourceNode.data?.output_types || [];
    const input = targetNode.data?.input_types || [];
    console.log(targetNode, " ", sourceNode);
    console.log(output, " ", input);
    console.log(typeof (input));

    if ((Array.isArray(output) && output.length === 0 || Array.isArray(input) && input.length === 0) || output === undefined || input === undefined) {
      setEdges((eds) => addEdge(connection, eds)), [nodes, edges];
      return;
    }

    // checks if output_types overlap with input_types
    if (Array.isArray(input) && Array.isArray(output) && !output.some(type => input.includes(type))) {
      console.error("Incompatible connection: No matching output/input file types.");
      isValid = false;
    }
    const inputTypes = (Array.isArray(input) ? input : []).flatMap(type => {
      console.log(`Processing input type: ${type}`);
      const extracted = extractFileTypes(type);
      console.log(`From input "${type}" → extracted:`, extracted);
      return extracted;
    });

    const outTypes = (Array.isArray(output) ? output : []).flatMap(type => {
      console.log(`Processing output type: ${type}`);
      const extracted = extractFileTypes(type);
      console.log(`From output "${type}" → extracted:`, extracted);
      return extracted;
    });

    console.log("Input Types:", inputTypes);
    console.log("Output Types:", outTypes);
    if (!isValid) {
      inputTypes.some((type) => outTypes.includes(type)) ? isValid = true : console.error("Input and Output types do not match.");
    }
    if (isValid) {
      setEdges((eds) => addEdge(connection, eds));
    }
  }, [nodes, edges]);

  function extractFileTypes(str: string): string[] {
    return str.toLowerCase().split(/[\/\s]+/).filter(type => type !== 'file' && type !== '(optional)' && type !== 'index');
  }

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
    setShowTextbox(false);
    const minimalNodes = nodes.map(node => ({
      id: node.id,
      data: node.data,
    }));
    console.log('--- Exported SnakeMake ---\n', snakefileText);
    console.log('--- Exported Nodes ---\n', JSON.stringify(minimalNodes, null, 2));
    console.log('--- Exported Edges ---\n', JSON.stringify(edges, null, 2));
    
// Create a Blob object from the content
const blob = new Blob([snakefileText], { type: 'text/plain;charset=utf-8' });

// Create a URL for the Blob
const url = URL.createObjectURL(blob);

// Create a temporary anchor element
const a = document.createElement('a');
a.href = url;
a.download = 'Snakefile'; // Set the desired filename for download

// Programmatically click the anchor element to trigger download
document.body.appendChild(a); // Append to body to ensure it's in the DOM
a.click();

// Clean up by revoking the object URL and removing the anchor element
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

  const addWrapperNode = () => {
    setShowTextbox(false);
    setShowExport(false);
    fetch("rules/parsed_rule.json")
      .then((res) => res.json())
      .then((data) => {
        setRules(data.rules || []);
        setShowDropdown(true);
      })
      .catch((err) => {
        console.error('Failed to load combined rules:', err);
      });
  };

  function buildAdjacencyList(): Record<string, string[]> {
    const tempEdges = [...edges];
    const adjacencyList: Record<string, string[]> = {};

    tempEdges.forEach(({ source, target }) => {
      if (!adjacencyList[source]) {
        adjacencyList[source] = [];
      }
      adjacencyList[source].push(target);
    });
    return adjacencyList;
  }

  function showSnakemake() {
/* 
  This function generates a Snakemake file based on the current nodes and edges.
  It collects the rules from the nodes and formats them into a Snakemake script.
  It also includes wildcards specified by the user in an input field.
*/ 

    let wildcards = (document.getElementById('wildcard2') as HTMLInputElement).value;
    let seen = new Set<string>();
    let lastEdge = edges[edges.length - 1];
    let lastNode = nodes.find(node => node.id === lastEdge.target);
    
    let output = lastNode?.data.output || [];
    console.log("Last Node: ", output);
    console.log(Object.values(output));
    console.log(Object.values(output)[0]);

    let outputValue = Object.values(output)[0];
    let samples: string[] = [];
    wildcards.split(/[ ,]+/).forEach((blah, index) => {
            console.log(`Wildcard ${index}:`, blah.toString());
            samples.push(`"${blah}"`);
        });



    let result = `SAMPLES = [${samples}]\n\nrule all:\n    input:\n        expand("${outputValue}",sample = SAMPLES)\n\n`;    

    edges.forEach((element, index) => {
      const sourceNode = nodes.find(node => node.id === element.source);
      const targetNode = nodes.find(node => node.id === element.target);
      console.log(`Edge ${index}:`, element);
      [sourceNode, targetNode].forEach(node => {
        if(node && !seen.has(node.id)) {
          seen.add(node.id);
          result += `${node.data.rule}\n`;
        }
    });
  });
  setShowExport(true);
  setSnakefileText(result); 
  setOutputText(result);
  setShowTextbox(true); // now that it's populated, show the box
}

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShowTextbox(false);
    setShowExport(false);

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
            <option key={index} value={rule.name}>{rule.name.replace(/[-_]/g, ' ')}</option>
          ))}
        </select>
      )}
      {exportText && <button onClick={exportRule} className="export-button">
        Export
      </button>}
      <button onClick={showSnakemake} className="show-connected-button">
        Show SNAKEMAKE
      </button>
      {showTextbox && (<textarea id="textarea" value={outputText} readOnly ></textarea>)}
        
      <input type="text" id="wildcard2" placeholder="Enter Wildcards"/>
      <ReactFlow
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          style: { stroke: 'black', strokeWidth: 3 }, // Apply custom style
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'black',
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