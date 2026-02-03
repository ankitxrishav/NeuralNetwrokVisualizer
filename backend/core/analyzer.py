import numpy as np

class GraphAnalyzer:
    """
    Analyzes the Keras model graph to estimate FLOPs and Parameter distributions.
    """
    
    @staticmethod
    def analyze_node(layer, node_data):
        """
        Enriches node_data with FLOPs and other stats based on layer type.
        """
        flops = 0
        layer_type = node_data['type']
        
        # Extract shapes (handling None/Batch dim)
        input_shape = GraphAnalyzer._parse_shape(node_data.get('input_shape'))
        output_shape = GraphAnalyzer._parse_shape(node_data.get('output_shape'))
        params = int(node_data.get('params', 0))
        
        try:
            if "Dense" in layer_type:
                # Dense FLOPs: 2 * Input * Output
                if input_shape and output_shape:
                    i = input_shape[-1]
                    o = output_shape[-1]
                    flops = 2 * i * o

            elif "Conv2D" in layer_type:
                # Conv2D FLOPs: 2 * H * W * C_in * K_h * K_w * C_out
                # output_shape is (H, W, C_out)
                if len(output_shape) >= 3:
                    h, w, c_out = output_shape[0], output_shape[1], output_shape[2]
                    # We need kernel size and input channels
                    # Estimating if specific attributes missing
                    kernel_size = node_data['attributes'].get('kernel_size', [3, 3])
                    if isinstance(kernel_size, str): # Safety for stringified attrs
                         kernel_size = eval(kernel_size) if '[' in kernel_size else [3, 3]
                    
                    kh, kw = kernel_size[0], kernel_size[1]
                    
                    # C_in from input
                    c_in = input_shape[-1] if input_shape else 1
                    
                    flops = 2 * h * w * c_in * kh * kw * c_out

            elif "SeparableConv2D" in layer_type:
                # Simplified estimation
                if len(output_shape) >= 3:
                     h, w, c_out = output_shape[0], output_shape[1], output_shape[2]
                     flops = h * w * c_out * 10 # Rough estimate

        except Exception as e:
            # Fallback for metric calculation errors
            print(f"Warning: Could not calc FLOPs for {node_data['name']}: {e}")
            flops = 0
            
        return flops

    @staticmethod
    def _parse_shape(shape_entry):
        """
        Parses list/string shape into a clean list of info integers.
        Replaces None/'?' with 1 for multiplication safety.
        """
        if not shape_entry or shape_entry == "N/A":
            return []
        
        dims = []
        try:
            # shape_entry might be "None, 28, 28, 1" list or stings
            for d in shape_entry:
                if d == "None" or d == "?":
                    continue # Skip batch dim
                try:
                    dims.append(int(d))
                except:
                    pass
            return dims
        except:
            return []
