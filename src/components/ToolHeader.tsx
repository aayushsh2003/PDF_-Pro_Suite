import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  onBack: () => void;
}

export default function ToolHeader({ title, description, icon, onBack }: ToolHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to tools</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            <p className="text-slate-600 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
