import h5py
import json

def load_with_weights_only(model_path):
    """
    Try to reconstruct model architecture from h5 file config
    """
    try:
        with h5py.File(model_path, 'r') as f:
            if 'model_config' in f.attrs:
                config = json.loads(f.attrs['model_config'])
                # Attempt to build from config
                import tensorflow as tf
                return tf.keras.models.model_from_json(json.dumps(config))
    except:
        pass
    return None

def parse_h5_directly(model_path):
    """
    Parse h5 file directly to extract layer information
    """
    import h5py
    import json
    
    try:
        with h5py.File(model_path, 'r') as f:
            # Try to get model config
            if 'model_config' not in f.attrs:
                return {"error": "No model_config found in h5 file"}
            
            config_str = f.attrs['model_config']
            if isinstance(config_str, bytes):
                config_str = config_str.decode('utf-8')
            
            config = json.loads(config_str)
            
            nodes = []
            edges = []
            
            # Extract layers from config
            layers_config = []
            if isinstance(config, dict):
                inner_config = config.get('config', {})
                if isinstance(inner_config, dict):
                     # Case 1: Functional API: config -> layers
                     layers_config = inner_config.get('layers', [])
                elif isinstance(inner_config, list):
                     # Case 2: Sequential API: config IS the list of layers
                     layers_config = inner_config
                
                # Check top-level fallback
                if not layers_config:
                    layers_config = config.get('layers', [])

            elif isinstance(config, list):
                # Case 3: config IS the list of layers (rare but possible raw dump)
                layers_config = config

            total_params = 0
            
            for i, layer_cfg in enumerate(layers_config):
                # Normalize layer config
                if isinstance(layer_cfg, dict) and 'config' in layer_cfg:
                    # Standard Keras serialization
                    layer_name = layer_cfg['config'].get('name', f'layer_{i}')
                    # attributes often stored in 'config'
                    attrs = layer_cfg['config']
                elif isinstance(layer_cfg, dict):
                    # Sometimes direct flat structure
                    layer_name = layer_cfg.get('name', f'layer_{i}')
                    attrs = layer_cfg
                else:
                    continue

                layer_type = layer_cfg.get('class_name', 'Unknown') if isinstance(layer_cfg, dict) else 'Unknown'
                
                node = {
                    "id": layer_name,
                    "label": layer_name,
                    "type": layer_type,
                    "data": {
                        "name": layer_name,
                        "type": layer_type,
                        "params": 0,
                        "input_shape": "N/A",  # Hard to infer from purely config without weights
                        "output_shape": "N/A",
                        "attributes": attrs, # Pass full attributes for inspector
                        "trainable": attrs.get('trainable', True) if isinstance(attrs, dict) else True,
                    }
                }
                nodes.append(node)
                
                # Try to build edges from inbound_nodes (Functional API)
                inbound = layer_cfg.get('inbound_nodes', []) if isinstance(layer_cfg, dict) else []
                if inbound and len(inbound) > 0:
                    for conn in inbound[0]:
                        if isinstance(conn, list) and len(conn) > 0:
                            source_layer = conn[0]
                            edges.append({
                                "id": f"{source_layer}->{layer_name}",
                                "source": source_layer,
                                "target": layer_name,
                                "label": ""
                            })
            
            # If no edges, assume sequential
            if not edges and len(nodes) > 1:
                for i in range(len(nodes) - 1):
                    edges.append({
                        "id": f"{nodes[i]['id']}->{nodes[i+1]['id']}",
                        "source": nodes[i]['id'],
                        "target": nodes[i+1]['id']
                    })
            
            model_type = config.get('class_name', 'Sequential') if isinstance(config, dict) else 'Sequential'

            return {
                "model_summary": {
                    "total_params": total_params,
                    "layers_count": len(nodes),
                    "model_type": model_type
                },
                "nodes": nodes,
                "edges": edges
            }
            
    except Exception as e:
        return {"error": f"H5 parsing error: {str(e)}"}
