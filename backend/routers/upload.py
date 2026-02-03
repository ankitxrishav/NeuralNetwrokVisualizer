from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
import traceback
from core.loader import ModelLoader
from core.parser import GraphExtracter
# from ..schemas.igr import IGRResponse # Optional: Validation

router = APIRouter()

UPLOAD_DIR = "/tmp/neural_viz_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_model(file: UploadFile = File(...)):
    print(f"Received upload request for: {file.filename}")
    
    # 1. Validation
    file_extension = file.filename.split(".")[-1]
    if file_extension not in ["h5", "keras"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only .h5 and .keras supported.")
    
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        # 2. Save File
        print(f"Saving file to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Load Model
        print("Starting model loading...")
        try:
            model = ModelLoader.load(file_path)
        except ValueError as e:
            # Catch known loader errors
            raise HTTPException(status_code=400, detail=str(e))
        
        # 4. Parse Graph
        print("Starting graph extraction...")
        nodes, edges, summary = GraphExtracter.extract_graph(model)
        
        # 5. Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
            
        print(f"Success! {len(nodes)} nodes, {len(edges)} edges.")
        
        return {
            "model_summary": summary,
            "nodes": nodes,
            "edges": edges
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        traceback.print_exc()
        # Clean up if failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
