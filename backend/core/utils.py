def safe_shape(shape_obj):
    """
    Converts various shape representations (tuple, list, TensorShape) into a clean string or list.
    """
    if shape_obj is None:
        return "None"
    try:
        # If it's a list (multiple inputs/outputs), recurse
        if isinstance(shape_obj, list):
            return [safe_shape(s) for s in shape_obj]
        
        # If it's a tuple or TensorShape, convert to list of strings
        if hasattr(shape_obj, 'as_list'):
            return [str(dim) if dim is not None else '?' for dim in shape_obj.as_list()]
        
        return [str(dim) if dim is not None else '?' for dim in shape_obj]
    except:
        return str(shape_obj)
