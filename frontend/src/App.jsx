import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './components/CustomNode';
import Inspector from './components/Inspector';
import { getLayoutedElements } from './utils/layout';
import { Upload, Loader2, Info, FileUp, Sparkles } from 'lucide-react';

const nodeTypes = {
  default: CustomNode
};

const initialNodes = [];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- Graph Handlers ---
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const closeInspector = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // --- File Upload Logic ---
  const handleFileUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    setSelectedNode(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse model');
      }

      const data = await response.json();

      const rfNodes = data.nodes.map(n => ({
        ...n,
        type: 'default', // Map all to CustomNode
        data: { ...n.data, type: n.type }
      }));

      const rfEdges = data.edges.map(e => ({
        ...e,
        animated: true,
        style: { stroke: '#475569', strokeWidth: 2 }
      }));

      // Apply Layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setModelInfo(data.model_summary);

    } catch (error) {
      console.error(error);
      alert(`Upload Error: ${error.message}`);
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  // --- Drag & Drop Handlers ---
  const onDragOver = (event) => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    if (event.relatedTarget === null) {
      setIsDragging(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-slate-950 relative overflow-hidden font-sans"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Full Screen Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[100] bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed flex items-center justify-center animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-slate-900/90 p-8 rounded-2xl border border-blue-500/50 shadow-2xl flex flex-col items-center">
            <div className="p-4 bg-blue-500/20 rounded-full mb-4 animate-bounce">
              <FileUp size={48} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Drop Model File Here</h2>
            <p className="text-blue-200 mt-2">Release to visualize neural architecture</p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls className="!bg-slate-800 !border-slate-700 !shadow-xl [&>button]:!fill-white [&>button]:!border-slate-700" />
        <MiniMap
          style={{ background: '#0f172a', border: '1px solid #334155' }}
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.4)"
        />
        <Background color="#334155" gap={20} size={1} />

        {/* Brand & Upload Panel */}
        <Panel position="top-left" className="m-6">
          <div className="bg-slate-900/95 p-6 rounded-2xl border border-white/10 backdrop-blur-xl text-white shadow-2xl w-80">
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  NEURAL<br />VISUALIZER
                </h1>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload Zone */}
              <label
                className={`
                            flex flex-col items-center justify-center w-full h-40 
                            rounded-xl border-2 border-dashed 
                            transition-all duration-300 cursor-pointer group
                            ${loading ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'}
                        `}
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                    <span className="text-sm font-bold text-blue-400 animate-pulse">Parsing Architecture...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="p-3 rounded-full bg-slate-800 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 mb-3">
                      <Upload className="text-slate-400 group-hover:text-blue-400" size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">
                      Upload Keras Model
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">
                      Drag & drop .h5 / .keras
                    </span>
                  </div>
                )}
                <input type="file" className="hidden" accept=".h5,.keras" onChange={onFileChange} disabled={loading} />
              </label>

              {/* Model Stats - Only show if loaded */}
              {modelInfo && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                    <span className="text-xs font-bold text-slate-400 uppercase">Layers</span>
                    <span className="text-sm font-mono font-bold text-blue-400">{modelInfo.layers_count}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Params</span>
                    <span className="text-sm font-mono font-bold text-purple-400">{Number(modelInfo.total_params).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Inspector Panel */}
        {selectedNode && (
          <Inspector node={selectedNode} onClose={closeInspector} />
        )}
      </ReactFlow>
    </div>
  );
}
