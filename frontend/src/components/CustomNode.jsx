import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Layers, Activity, Database } from 'lucide-react';

const CustomNode = ({ data }) => {
    // Defines base themes for Light/Dark modes
    // Dark: bg-slate-900 border-color
    // Light: bg-white border-color

    let borderColor = 'border-slate-500 shadow-slate-900/10 dark:shadow-[0_0_20px_rgba(0,0,0,0.3)]';
    // Base colors are applied via classes below

    let Icon = Layers;
    const type = data.type || 'Unknown';

    // Color Rules - tailored for both modes
    if (type.includes('Conv')) {
        borderColor = 'border-blue-500 shadow-blue-500/20 dark:shadow-[0_0_20px_rgba(59,130,246,0.2)]';
        Icon = Box;
    } else if (type.includes('Dense') || type.includes('Connected')) {
        borderColor = 'border-violet-500 shadow-violet-500/20 dark:shadow-[0_0_20px_rgba(139,92,246,0.2)]';
        Icon = Database;
    } else if (type.includes('Input')) {
        borderColor = 'border-slate-400 shadow-slate-400/20 dark:shadow-[0_0_20px_rgba(148,163,184,0.2)]';
    } else if (type.includes('LSTM') || type.includes('GRU')) {
        borderColor = 'border-orange-500 shadow-orange-500/20 dark:shadow-[0_0_20px_rgba(249,115,22,0.2)]';
        Icon = Activity;
    } else if (type.includes('Pool') || type.includes('pool')) {
        borderColor = 'border-emerald-500 shadow-emerald-500/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]';
    } else if (type.includes('Norm') || type.includes('Dropout')) {
        borderColor = 'border-cyan-500 shadow-cyan-500/20 dark:shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    }

    // Badge styling (Light/Dark)
    const getBadgeColor = () => {
        if (type.includes('Conv')) return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
        if (type.includes('Dense')) return 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20';
        if (type.includes('Pool')) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-gray-400 dark:bg-gray-500/10 dark:border-gray-500/20';
    };

    // Helper to format shape
    const fmt = (s) => Array.isArray(s) ? s.join('×') : s;

    return (
        <div className={`
            relative group
            px-0 py-0 
            rounded-xl 
            border-[3px] 
            ${borderColor} 
            bg-white dark:bg-slate-900 
            min-w-[240px] 
            transition-all duration-300 
            hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl
            overflow-hidden
        `}>
            {/* Glossy Header Background - subtle in light mode */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-slate-100/50 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />

            {/* Input Handle */}
            <Handle type="target" position={Position.Top} className="!w-6 !h-3 !rounded-b-md !bg-slate-300 dark:!bg-gray-300 !border-0 hover:!bg-slate-400 dark:hover:!bg-white transition-colors" />

            <div className="p-4 relative z-10">
                {/* Header Section */}
                <div className="flex items-center mb-4">
                    <div className={`p-2.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 mr-3 shadow-sm dark:shadow-inner`}>
                        <Icon size={22} className="text-slate-700 dark:text-gray-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-black text-slate-800 dark:text-white tracking-tight truncate leading-tight mb-1" title={data.name}>
                            {data.name}
                        </div>
                        <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor()}`}>
                            {data.type}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-px bg-slate-200 dark:bg-white/10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5">
                    <div className="flex bg-slate-50 dark:bg-black/40 px-3 py-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase w-10 shrink-0 py-0.5">IN</span>
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-200 truncate font-medium">{fmt(data.input_shape)}</span>
                    </div>
                    <div className="flex bg-slate-50 dark:bg-black/40 px-3 py-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase w-10 shrink-0 py-0.5">OUT</span>
                        <span className="font-mono text-xs text-purple-600 dark:text-purple-200 truncate font-medium">{fmt(data.output_shape)}</span>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-4 flex justify-between items-center px-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Params</span>
                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-white">{Number(data.params).toLocaleString()}</span>
                    </div>
                    {data.flops > 0 && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">FLOPs</span>
                            <span className="text-sm font-mono font-bold text-slate-600 dark:text-gray-300">{Number(data.flops).toExponential(1)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Handle */}
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-3 !rounded-t-md !bg-slate-300 dark:!bg-gray-300 !border-0 hover:!bg-slate-400 dark:hover:!bg-white transition-colors" />
        </div>
    );
};

export default memo(CustomNode);
