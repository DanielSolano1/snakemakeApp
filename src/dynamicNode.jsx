import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function DynamicNode(props) {
  const { data, id } = props;
  const { name, input, output, params } = data;

  const onChange = useCallback((event) => {
    console.log(event.target.name);
  }, []);

  const isInputObject = typeof input === 'object' && input !== null && !Array.isArray(input);
  const isOutputObject = typeof output === 'object' && output !== null && !Array.isArray(output);
  const isParamsObject = typeof params === 'object' && params !== null && !Array.isArray(params);

  return (
<div className="dynamic-updater-node" style={{ position: 'relative' }}>
  <div className="dynamic-header">
    <strong>Rule name:</strong> {name}
  </div>

  {/* Inputs */}
  <strong>Inputs:</strong>
  <div style={{ position: 'relative', marginBottom: '12px', paddingLeft: '20px' }}>
    {/* LEFT HANDLE next to the whole input block */}
    <Handle
      type="target"
      position={Position.Left}
      id={`input-handle-${id}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '-13px',
        transform: 'translateY(-50%)',
      }}
    />

    {/* Actual input content */}
    <div style={{
      padding: '10px',
      border: '1px solid #cbd5e0',
      borderRadius: '6px',
      backgroundColor: '#edf2f7',
    }}>
      {isInputObject ? (
        Object.entries(input).map(([key, value]) => (
          <div key={key}>
            {key}: {JSON.stringify(value)}
          </div>
        ))
      ) : (
        <div>{input}</div>
      )}
    </div>
  </div>

  {/* Outputs */}
  <strong>Outputs:</strong>
  <div style={{ position: 'relative', marginBottom: '12px', paddingRight: '20px' }}>
    <Handle
      type="source"
      position={Position.Right}
      id={`output-handle-${id}`}
      style={{
        position: 'absolute',
        top: '50%',
        right: '-10px',
        transform: 'translateY(-50%)',
      }}
    />
    <div style={{
      padding: '10px',
      border: '1px solid #cbd5e0',
      borderRadius: '6px',
      backgroundColor: '#edf2f7',
    }}>
      {isOutputObject ? (
        Object.entries(output).map(([key, value]) => (
          <div key={key}>
            {key}: {JSON.stringify(value)}
          </div>
        ))
      ) : (
        <div>{output}</div>
      )}
    </div>
  </div>

  {/* Params */}
  <strong>Params:</strong>
  <div style={{
    padding: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#f7fafc',
  }}>
    {isParamsObject ? (
      Object.entries(params).map(([key, value]) => (
        <div key={key}>
          {key}: {JSON.stringify(value)}
        </div>
      ))
    ) : (
      <div>{params}</div>
    )}
  </div>
</div>
  );
}

export default DynamicNode;
