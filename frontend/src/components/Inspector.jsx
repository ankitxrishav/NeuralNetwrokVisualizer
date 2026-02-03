import { X, Activity, Box, Database, Cpu, Settings } from 'lucide-react';
import { memo } from 'react';

const Inspector = ({ node, onClose }) => {
    if (!node) return null;

    const data = node.data;

    // Attribute Formatting
    const renderAttributes = () => {
        if (!data.attributes || Object.keys(data.attributes).length === 0) {
            return <div className="text-slate-400 dark:text-slate-500 italic text-sm py-4 text-center">No configuration attributes.</div>;
        }
        return Object.entries(data.attributes).map(([key, value]) => (
            <div key={key} className="flex flex-col py-3 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded transition-colors group">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm text-slate-700 dark:text-slate-200 font-mono break-all leading-tight" title={String(value)}>
                    {String(value)}
                </span>
            </div>
        ));
    };

    return (
        <div className="absolute top-8 right-8 w-96 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 z-50 max-h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{data.name}</h2>
                    <div className="text-xs font-bold font-mono text-blue-500 dark:text-blue-400 mt-1.5 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {data.type}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 -mt-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white dark:bg-slate-900">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                            <Database size={40} className="text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-purple-500 dark:text-purple-400">
                            <Database size={16} />
                            <span className="text-xs uppercase font-black tracking-widest">Params</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-tight relative z-10">
                            {Number(data.params).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                            <Cpu size={40} className="text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-emerald-500 dark:text-emerald-400">
                            <Cpu size={16} />
                            <span className="text-xs uppercase font-black tracking-widest">FLOPs</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-tight relative z-10">
                            {data.flops ? Number(data.flops).toExponential(1) : '-'}
                        </div>
                    </div>
                </div>

                {/* Tensor Dimension Visualizer */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Activity size={14} /> Tensor Pipeline
                    </div>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Input Tensor</div>
                            <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-between">
                                <span>{Array.isArray(data.input_shape) ? data.input_shape.join(' × ') : String(data.input_shape)}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600">SHAPE</span>
                            </div>
                        </div>

                        {/* Flow Arrow */}
                        <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div className="relative">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Output Tensor</div>
                            <div className="font-mono text-sm font-bold text-purple-600 dark:text-purple-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-between">
                                <span>{Array.isArray(data.output_shape) ? data.output_shape.join(' × ') : String(data.output_shape)}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600">SHAPE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer Configuration */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Settings size={14} /> Configuration
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        {renderAttributes()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default memo(Inspector);
