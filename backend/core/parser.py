from .utils import safe_shape
from .analyzer import GraphAnalyzer

class GraphExtracter:
    """
    Extracts the Nodes and Edges from a loaded Keras model.
    Handles both Sequential and Functional APIs.
    """
    
    @staticmethod
    def extract_graph(model):
        nodes = []
        edges = []
        
        # If model comes from H5 fallback, it's already a dict IGR
        if isinstance(model, dict):
            # We can still try to run analysis on the dict nodes if needed, 
            # but for now return as is or enhance later.
            return model.get('nodes', []), model.get('edges', []), model.get('model_summary', {})

        # 1. Node Extraction
        for layer in model.layers:
            # Basic Attributes
            attributes = {}
            for attr in ['kernel_size', 'strides', 'padding', 'activation', 'units', 'rate', 'pool_size']:
                if hasattr(layer, attr):
                    val = getattr(layer, attr)
                    # Serialize common types
                    if hasattr(val, 'numpy'): val = val.numpy().tolist()
                    if hasattr(val, '__name__'): val = val.__name__ # functions like relu
                    attributes[attr] = str(val)

            # FLOPs & Params (Placeholder for Analyzer, simple param count here)
            params = layer.count_params()
            
            node_data = {
                "name": layer.name,
                "type": layer.__class__.__name__,
                "params": params,
                "input_shape": safe_shape(getattr(layer, 'input_shape', None)),
                "output_shape": safe_shape(getattr(layer, 'output_shape', None)),
                "attributes": attributes,
                "trainable": getattr(layer, 'trainable', True)
            }
            
            # Calculate FLOPs
            flops = GraphAnalyzer.analyze_node(layer, node_data)
            node_data['flops'] = flops

            node = {
                "id": layer.name,
                "label": layer.name,
                "type": layer.__class__.__name__,
                "data": node_data
            }
            nodes.append(node)

        # 2. Edge Extraction
        # Keras Sequential: Linear connection
        if isinstance(model, tf.keras.Sequential):
            for i in range(len(nodes) - 1):
                edges.append({
                    "id": f"{nodes[i]['id']}->{nodes[i+1]['id']}",
                    "source": nodes[i]['id'],
                    "target": nodes[i+1]['id'],
                    "label": "" 
                })
        
        # Keras Functional / General: Use inbound_nodes
        else:
            for layer in model.layers:
                # In newer Keras, inbound nodes are objects
                if hasattr(layer, 'inbound_nodes'):
                    for inbound_node in layer.inbound_nodes:
                        try:
                            # Handling varies by Keras version
                            # Typically: inbound_node.inbound_layers
                            inbound_layers = getattr(inbound_node, 'inbound_layers', [])
                            
                            # Standardize to list
                            if not isinstance(inbound_layers, (list, tuple)):
                                inbound_layers = [inbound_layers]
                                
                            for src_layer in inbound_layers:
                                edges.append({
                                    "id": f"{src_layer.name}->{layer.name}",
                                    "source": src_layer.name,
                                    "target": layer.name,
                                    "label": safe_shape(src_layer.output_shape) if hasattr(src_layer, 'output_shape') else ""
                                })
                        except Exception as e:
                            print(f"Warning: Edge extraction failed for {layer.name}: {e}")
                            
        # Summary Stats
        summary = {
            "total_params": model.count_params(),
            "layers_count": len(model.layers),
            "model_type": model.__class__.__name__
        }
        
        return nodes, edges, summary
