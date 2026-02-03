from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class NodeData(BaseModel):
    name: str
    type: str
    params: int
    input_shape: Any
    output_shape: Any
    attributes: Dict[str, Any]
    trainable: bool

class Node(BaseModel):
    id: str
    label: str
    type: str # Layer class name
    data: NodeData
    # position: Optional[Dict[str, float]] = None # Calculated by frontend

class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = ""

class ModelMeta(BaseModel):
    total_params: int
    layers_count: int
    model_type: str

class IGRResponse(BaseModel):
    meta: ModelMeta
    nodes: List[Node]
    edges: List[Edge]
