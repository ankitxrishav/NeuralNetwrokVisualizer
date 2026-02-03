import tensorflow as tf
from utils.h5_helpers import parse_h5_directly, load_with_weights_only
import os

class ModelLoader:
    """
    Responsible for safely and robustly loading Keras models.
    Implements multiple fallback strategies.
    """
    
    @staticmethod
    def load(path: str):
        """
        Attempts to load a model from the given path using multiple strategies.
        Returns:
            model (tf.keras.Model or dict): The loaded model object or a dict from direct parsing.
        Raises:
            Exception: If all strategies fail.
        """
        errors = []
        
        # Strategy 1: Standard Load (compile=False)
        # Best for: Standard, well-saved models
        try:
            print("DEBUG: Attempting standard load...")
            return tf.keras.models.load_model(path, compile=False)
        except Exception as e:
            errors.append(f"Standard load failed: {str(e)}")
            
        # Strategy 2: Unsafe Mode (Use with caution, simplified for this visualizer context)
        # Best for: Models with Lambda layers that trigger safe_mode restrictions
        try:
            print("DEBUG: Attempting safe_mode=False load...")
            return tf.keras.models.load_model(path, compile=False, safe_mode=False)
        except Exception as e:
            errors.append(f"Safe-mode disabled load failed: {str(e)}")

        # Strategy 3: Custom Objects (Empty)
        # Best for: Models with custom layers where we just want the structure, not execution
        try:
            print("DEBUG: Attempting custom_objects={} load...")
            return tf.keras.models.load_model(path, compile=False, custom_objects={})
        except Exception as e:
            errors.append(f"Custom objects load failed: {str(e)}")
            
        # Strategy 4: Weights Only / Config Reconstruction
        # Best for: JSON config saved in h5 attributes
        try:
            print("DEBUG: Attempting config reconstruction...")
            model = load_with_weights_only(path)
            if model:
                return model
        except Exception as e:
            errors.append(f"Config reconstruction failed: {str(e)}")

        # Strategy 5: Direct H5 Parse (Ultimate Fallback)
        # Best for: Totally broken environments or version mismatch (e.g., Keras 2 vs 3)
        try:
            print("DEBUG: Attempting direct H5 parse...")
            return parse_h5_directly(path)
        except Exception as e:
            errors.append(f"H5 Direct parse failed: {str(e)}")

        # If we get here, everything failed
        error_summary = "; ".join(errors)
        raise ValueError(f"Could not load model. Strategies attempted and failed: {error_summary}")
