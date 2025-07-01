import {Node} from '@xyflow/react';


export function createNodeFromJson(wrapper: any): Node{
    return {
        id: `${wrapper.name}-${Date.now().toString().substring(0, 5)}`,
        type: wrapper.type || "dynamic",
        position: wrapper.position || { 
            x: Math.random() * 100, 
            y: Math.random() * 150 },
        data:{
            name: wrapper.name,
            input: wrapper.inputs || [],
            output: wrapper.output || [],
            params: wrapper.params || {},
        }
    };
}
