import {Node} from '@xyflow/react';


export function createNodeFromJson(wrapper: any): Node{
    return {
        id: `${wrapper.name}-${Date.now().toString().substring(0, 10)}`,
        type: wrapper.type || "dynamic",
        position: wrapper.position || { 
            x: Math.random() * 100, 
            y: Math.random() * 150 },
        data:{
            name: wrapper.name,
            input: wrapper.input || [],
            output: wrapper.output || [],
            params: wrapper.params || {},
            input_types : wrapper.input_types || [],
            output_types: wrapper.output_types || [],
        }
    };
}
