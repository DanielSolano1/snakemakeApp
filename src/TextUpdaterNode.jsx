import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function TextUpdaterNode(props) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.name, evt.target.value);
  }, []);

  const nodeId = props.id; // Unique ID for this node instance

  return (
    <div className="text-updater-node" style={{ position: 'relative' }}>
      <div className="rule_header">
        <label htmlFor={`ruleName-${nodeId}`}><strong>Rule name:</strong></label>
        <input id={`ruleName-${nodeId}`} name="ruleName" onChange={onChange} />
      </div>

      {/* Input field with left handle */}
      <div style={{ position: 'relative', marginTop: 20 }}>
        <Handle
          type="target"
          position={Position.Left}
          id={`input-handle-${nodeId}`}
          style={{ top: 33, transform: 'translateY(-50%)', left: -10 }}
        />
        <label htmlFor={`input-${nodeId}`}>Input</label>
        <input id={`input-${nodeId}`} name="input" onChange={onChange} className="nodrag" />
      </div>

      {/* Output field with right handle */}
      <div style={{ position: 'relative', marginTop: 20 }}>
        <Handle
          type="source"
          position={Position.Right}
          id={`output-handle-${nodeId}`}
          style={{ top: 34, transform: 'translateY(-50%)', right: -3 }}
        />
        <label htmlFor={`output-${nodeId}`}>Output</label>
        <input id={`output-${nodeId}`} name="output" onChange={onChange} className="nodrag" />
      </div>
    </div>
  );
}

export default TextUpdaterNode;
