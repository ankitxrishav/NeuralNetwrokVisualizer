import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Layers, Activity, Database } from 'lucide-react';

const CustomNode = ({ data }) => {
    // Determine color/icon based on strict Visual Logic
    let borderColor = 'border-slate-500';
    let bgColor = 'bg-slate-900';
    let Icon = Layers;

    const type = data.type || 'Unknown';

    // Color Rules from visual_logic.md - Enhanced for Visibility
    if (type.includes('Conv')) {
        borderColor = 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]';
        bgColor = 'bg-slate-900'; // Darker base for potential gradients
        Icon = Box;
    } else if (type.includes('Dense') || type.includes('Connected')) {
        borderColor = 'border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]';
        bgColor = 'bg-slate-900';
        Icon = Database;
    } else if (type.includes('Input')) {
        borderColor = 'border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.2)]';
        bgColor = 'bg-slate-900';
    } else if (type.includes('LSTM') || type.includes('GRU')) {
        borderColor = 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]';
        bgColor = 'bg-slate-900';
        Icon = Activity;
    } else if (type.includes('Pool') || type.includes('pool')) {
        borderColor = 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
        bgColor = 'bg-slate-900';
    } else if (type.includes('Norm') || type.includes('Dropout')) {
        borderColor = 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
        bgColor = 'bg-slate-900';
    }

    // Type-specific color for header badge
    const getBadgeColor = () => {
        if (type.includes('Conv')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (type.includes('Dense')) return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
        if (type.includes('Pool')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
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
            ${bgColor} 
            min-w-[240px] 
            text-white 
            transition-all duration-300 
            hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl
            overflow-hidden
        `}>
            {/* Glossy Header Background */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Input Handle */}
            <Handle type="target" position={Position.Top} className="!w-6 !h-3 !rounded-b-md !bg-gray-300 !border-0 hover:!bg-white transition-colors" />

            <div className="p-4 relative z-10">
                {/* Header Section */}
                <div className="flex items-center mb-4">
                    <div className={`p-2.5 rounded-lg bg-white/5 border border-white/10 mr-3 shadow-inner ring-1 ring-white/5`}>
                        <Icon size={22} className="text-gray-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-black text-white tracking-tight truncate leading-tight mb-1" title={data.name}>
                            {data.name}
                        </div>
                        <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor()}`}>
                            {data.type}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-px bg-white/10 rounded-lg overflow-hidden border border-white/5">
                    <div className="flex bg-black/40 px-3 py-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase w-10 shrink-0 py-0.5">IN</span>
                        <span className="font-mono text-xs text-blue-200 truncate font-medium">{fmt(data.input_shape)}</span>
                    </div>
                    <div className="flex bg-black/40 px-3 py-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase w-10 shrink-0 py-0.5">OUT</span>
                        <span className="font-mono text-xs text-purple-200 truncate font-medium">{fmt(data.output_shape)}</span>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-4 flex justify-between items-center px-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Params</span>
                        <span className="text-sm font-mono font-bold text-white">{Number(data.params).toLocaleString()}</span>
                    </div>
                    {data.flops > 0 && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">FLOPs</span>
                            <span className="text-sm font-mono font-bold text-gray-300">{Number(data.flops).toExponential(1)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Handle */}
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-3 !rounded-t-md !bg-gray-300 !border-0 hover:!bg-white transition-colors" />
        </div>
    );
};

export default memo(CustomNode);
