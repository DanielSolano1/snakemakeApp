import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function DynamicNode(props) {
    //passing in everything that props has the name,output, input, params etc of selected rule
    console.log("the name of rule:" + props);
    const { data } = props;
    const { name, input, output, params } = data;

    const onChange = useCallback((event) => {
        console.log(event.target.name);
    }, []);

    const isInputObject = typeof input === 'object' && input !== null && !Array.isArray(input);
    const isOutputObject = typeof output === 'object' && output !== null && !Array.isArray(output);
    const isParamsObject = typeof params === 'object' && params !== null && !Array.isArray(params);

    return (
        <div className="dynamic-updater-node" style={{ position: 'relative' }}>
            <div className='dynamic-header'>
                <strong>Rule name: </strong> {name}
            </div>
            <div className='dynamic-content'>
                <strong>Inputs: </strong>
                {isInputObject ? (Object.entries(input).map(([key, value]) => (
                    <div key={key}>
                        {key}: {JSON.stringify(value)}
                    </div>
                ))) : (
                    <div>
                        <strong>Input:</strong> {(input)}
                    </div>
                )}
                <strong>Output:</strong>
                {isOutputObject ? (Object.entries(output).map(([key, value]) => (
                    <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                )))
                    : (
                        <div>
                             {(output)}
                        </div>
                    )}

                <strong>Params:</strong>
                {isParamsObject ? (Object.entries(params).map(([key, value]) => (
                    <div key={key}>
                        {key}: {JSON.stringify(value)}
                    </div>
                ))) : (
                        <div>
                            <strong>Params:</strong> {(params)}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default DynamicNode;