import { X, Activity, Box, Database, Cpu, Settings } from 'lucide-react';
import { memo } from 'react';

const Inspector = ({ node, onClose }) => {
    if (!node) return null;

    const data = node.data;

    // Attribute Formatting
    const renderAttributes = () => {
        if (!data.attributes || Object.keys(data.attributes).length === 0) {
            return <div className="text-gray-400 italic text-sm py-2">No configuration attributes.</div>;
        }
        return Object.entries(data.attributes).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                <span className="text-sm text-gray-300 font-medium capitalize tracking-wide">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm text-white font-mono text-right max-w-[180px] break-all" title={String(value)}>
                    {String(value)}
                </span>
            </div>
        ));
    };

    return (
        <div className="absolute top-6 right-6 w-96 bg-slate-900 border border-blue-500/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 z-50 max-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-tight">{data.name}</h2>
                    <div className="text-sm font-bold font-mono text-blue-400 mt-1 uppercase tracking-wider">{data.type}</div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-5 space-y-8 bg-slate-950/50">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 shadow-sm relative group">
                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Database size={16} />
                            <span className="text-xs uppercase font-black tracking-widest">Params</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-white tracking-tight">
                            {Number(data.params).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 shadow-sm relative group">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <Cpu size={16} />
                            <span className="text-xs uppercase font-black tracking-widest">FLOPs</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-white tracking-tight">
                            {data.flops ? Number(data.flops).toExponential(1) : '-'}
                        </div>
                    </div>
                </div>

                {/* Tensor Dimension Visualizer */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                        <Activity size={14} /> Tensor Flow
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-white/10 space-y-4">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 ml-1">Input Shape</div>
                            <div className="font-mono text-base font-medium text-blue-300 bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-500/20">
                                {Array.isArray(data.input_shape) ? data.input_shape.join(' × ') : String(data.input_shape)}
                            </div>
                        </div>

                        {/* Arrow separator */}
                        <div className="flex justify-center -my-2 opacity-30">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                                <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 ml-1">Output Shape</div>
                            <div className="font-mono text-base font-medium text-purple-300 bg-purple-950/30 px-3 py-2 rounded-lg border border-purple-500/20">
                                {Array.isArray(data.output_shape) ? data.output_shape.join(' × ') : String(data.output_shape)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer Configuration */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">
                        <Settings size={14} /> Configuration
                    </div>
                    <div className="bg-slate-800/30 rounded-xl border border-white/10 px-4 py-2">
                        {renderAttributes()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default memo(Inspector);
