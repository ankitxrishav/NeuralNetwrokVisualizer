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
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { getLayoutedElements } from './utils/layout';
import { Upload, Loader2, FileUp, Sparkles } from 'lucide-react';

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

  const { theme } = useTheme(); // Use global theme hook

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
        // Dynamic edge color based on theme is hard in ReactFlow style object
        // So we default to a neutral gray that works on both dark/light
        style: { stroke: '#64748b', strokeWidth: 2 }
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
      className="w-screen h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Full Screen Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[100] bg-blue-50/80 dark:bg-blue-950/80 backdrop-blur-sm border-4 border-blue-400 border-dashed flex items-center justify-center animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border-2 border-blue-400 shadow-2xl flex flex-col items-center">
            <div className="p-6 bg-blue-500 rounded-full mb-6 animate-bounce shadow-lg shadow-blue-500/50">
              <FileUp size={64} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Drop Model File Here</h2>
            <p className="text-blue-600 dark:text-blue-200 mt-4 text-lg font-medium">Release to visualize neural architecture</p>
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
        colorMode={theme} // Dynamic ReactFlow Mode
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-600 !shadow-xl [&>button]:!fill-slate-700 dark:[&>button]:!fill-slate-200 [&>button]:!border-slate-200 dark:[&>button]:!border-slate-600 hover:[&>button]:!bg-slate-50 dark:hover:[&>button]:!bg-slate-700" />
        <MiniMap
          style={{
            background: theme === 'light' ? '#f8fafc' : '#0f172a',
            border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #334155'
          }}
          nodeColor="#3b82f6"
          maskColor={theme === 'light' ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)"}
        />
        <Background
          color={theme === 'light' ? '#cbd5e1' : '#334155'}
          gap={24}
          size={1}
        />

        {/* Top Right: Theme Toggle */}
        <Panel position="top-right" className="m-8">
          <ThemeToggle />
        </Panel>

        {/* Brand & Upload Panel - Solid, High Contrast */}
        <Panel position="top-left" className="m-8">
          <div className="bg-white dark:bg-slate-900 p-0 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] w-80 overflow-hidden flex flex-col transition-colors duration-300">

            {/* Header Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
                    NEURAL<br />VISUALIZER
                  </h1>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
              {/* Upload Zone */}
              <label
                className={`
                    flex flex-col items-center justify-center w-full h-44 
                    rounded-xl border-2 border-dashed 
                    transition-all duration-200 cursor-pointer group relative overflow-hidden
                    ${loading
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {loading ? (
                  <div className="flex flex-col items-center relative z-10">
                    <Loader2 className="animate-spin text-blue-500 dark:text-blue-400 mb-3" size={36} />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300 animate-pulse uppercase tracking-wide">Parsing...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4 relative z-10">
                    <div className="p-3.5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 group-hover:border-blue-500 group-hover:bg-blue-600 transition-all duration-200 mb-4 shadow-lg dark:shadow-xl">
                      <Upload className="text-slate-400 dark:text-slate-300 group-hover:text-white" size={28} />
                    </div>
                    <span className="text-base font-bold text-slate-700 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors">
                      Upload Model
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                      Drag & drop .h5 / .keras
                    </span>
                  </div>
                )}

                <input type="file" className="hidden" accept=".h5,.keras" onChange={onFileChange} disabled={loading} />
              </label>

              {/* Model Stats - Only show if loaded */}
              {modelInfo ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-inner">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Layers</div>
                      <div className="text-lg font-mono font-bold text-blue-500 dark:text-blue-400">{modelInfo.layers_count}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-inner">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Params</div>
                      <div className="text-lg font-mono font-bold text-purple-500 dark:text-purple-400 truncate" title={Number(modelInfo.total_params).toLocaleString()}>
                        {(Number(modelInfo.total_params) / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No model loaded yet.</p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span>v1.0.0</span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Ready
              </span>
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
