import { useState } from 'react';
import { FileText, Combine, Scissors, RotateCw, FileStack, Trash2, Droplet, Copy, ArrowUpDown, Hash, Palette, Info, FilePlus, Camera } from 'lucide-react';
import { ToolType } from './types';
import Scanner from './components/Scanner';
import MergeTool from './components/MergeTool';
import SplitTool from './components/SplitTool';
import RotateTool from './components/RotateTool';
import ExtractTool from './components/ExtractTool';
import DeleteTool from './components/DeleteTool';
import WatermarkTool from './components/WatermarkTool';
import RemoveDuplicatesTool from './components/RemoveDuplicatesTool';
import ReverseTool from './components/ReverseTool';
import PageNumberTool from './components/PageNumberTool';
import GrayscaleTool from './components/GrayscaleTool';
import MetadataTool from './components/MetadataTool';
import BlankPageTool from './components/BlankPageTool';

function App() {
  const [selectedView, setSelectedView] = useState<ToolType | 'scanner' | 'home' | null>('home');

  const tools = [
    {
      id: 'scanner' as const,
      name: 'Document Scanner',
      description: 'Scan documents with camera and create PDFs',
      icon: Camera,
      color: 'bg-blue-600',
    },
    {
      id: 'merge' as ToolType,
      name: 'Merge PDFs',
      description: 'Combine multiple PDF files into one',
      icon: Combine,
      color: 'bg-blue-500',
    },
    {
      id: 'split' as ToolType,
      name: 'Split PDF',
      description: 'Split a PDF into separate pages',
      icon: Scissors,
      color: 'bg-green-500',
    },
    {
      id: 'rotate' as ToolType,
      name: 'Rotate PDF',
      description: 'Rotate pages in your PDF',
      icon: RotateCw,
      color: 'bg-orange-500',
    },
    {
      id: 'extract' as ToolType,
      name: 'Extract Pages',
      description: 'Extract specific pages from a PDF',
      icon: FileStack,
      color: 'bg-teal-500',
    },
    {
      id: 'delete' as ToolType,
      name: 'Delete Pages',
      description: 'Remove unwanted pages from PDF',
      icon: Trash2,
      color: 'bg-red-500',
    },
    {
      id: 'watermark' as ToolType,
      name: 'Add Watermark',
      description: 'Add watermark to all pages',
      icon: Droplet,
      color: 'bg-cyan-500',
    },
    {
      id: 'remove-duplicates' as ToolType,
      name: 'Remove Duplicates',
      description: 'Remove duplicate pages',
      icon: Copy,
      color: 'bg-cyan-400',
    },
    {
      id: 'reverse' as ToolType,
      name: 'Reverse Pages',
      description: 'Reverse page order',
      icon: ArrowUpDown,
      color: 'bg-sky-500',
    },
    {
      id: 'page-numbers' as ToolType,
      name: 'Page Numbers',
      description: 'Add page numbers to PDF',
      icon: Hash,
      color: 'bg-emerald-500',
    },
    {
      id: 'grayscale' as ToolType,
      name: 'Grayscale',
      description: 'Convert PDF to grayscale',
      icon: Palette,
      color: 'bg-slate-500',
    },
    {
      id: 'metadata' as ToolType,
      name: 'Edit Metadata',
      description: 'Edit PDF properties',
      icon: Info,
      color: 'bg-fuchsia-500',
    },
    {
      id: 'blank-pages' as ToolType,
      name: 'Blank Pages',
      description: 'Insert blank pages',
      icon: FilePlus,
      color: 'bg-amber-500',
    },
  ];

  const renderView = () => {
    switch (selectedView) {
      case 'scanner':
        return <Scanner onBack={() => setSelectedView('home')} />;
      case 'merge':
        return <MergeTool onBack={() => setSelectedView('home')} />;
      case 'split':
        return <SplitTool onBack={() => setSelectedView('home')} />;
      case 'rotate':
        return <RotateTool onBack={() => setSelectedView('home')} />;
      case 'extract':
        return <ExtractTool onBack={() => setSelectedView('home')} />;
      case 'delete':
        return <DeleteTool onBack={() => setSelectedView('home')} />;
      case 'watermark':
        return <WatermarkTool onBack={() => setSelectedView('home')} />;
      case 'remove-duplicates':
        return <RemoveDuplicatesTool onBack={() => setSelectedView('home')} />;
      case 'reverse':
        return <ReverseTool onBack={() => setSelectedView('home')} />;
      case 'page-numbers':
        return <PageNumberTool onBack={() => setSelectedView('home')} />;
      case 'grayscale':
        return <GrayscaleTool onBack={() => setSelectedView('home')} />;
      case 'metadata':
        return <MetadataTool onBack={() => setSelectedView('home')} />;
      case 'blank-pages':
        return <BlankPageTool onBack={() => setSelectedView('home')} />;
      default:
        return null;
    }
  };

  if (selectedView !== 'home') {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{renderView()}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">PDF Pro Suite</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete PDF solution - scan documents, merge, split, rotate, extract, and more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedView(tool.id)}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${tool.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{tool.name}</h3>
                <p className="text-slate-600 leading-relaxed">{tool.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">All processing happens in your browser - your files never leave your device</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
