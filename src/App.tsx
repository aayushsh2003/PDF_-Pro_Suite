import { useState } from 'react';
import { FileText, Combine, Scissors, RotateCw, FileStack, Trash2, Droplet, Copy, ArrowUpDown, Hash, Palette, Info, FilePlus, Camera, Crop, Zap, BookMarked } from 'lucide-react';
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
import CropTool from './components/CropTool';
import OptimizeTool from './components/OptimizeTool';
import HeaderFooterTool from './components/HeaderFooterTool';
import CompressTool from './components/CompressTool';
import BatchTool from './components/BatchTool';
import ReorderTool from './components/ReorderTool';

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
    {
      id: 'crop' as ToolType,
      name: 'Crop Pages',
      description: 'Remove margins and crop pages',
      icon: Crop,
      color: 'bg-rose-500',
    },
    {
      id: 'optimize' as ToolType,
      name: 'Optimize PDF',
      description: 'Reduce file size and improve performance',
      icon: Zap,
      color: 'bg-yellow-500',
    },
    {
      id: 'header-footer' as ToolType,
      name: 'Header & Footer',
      description: 'Add header and footer text to pages',
      icon: BookMarked,
      color: 'bg-lime-500',
    },
    {
      id: 'compress' as ToolType,
      name: 'Compress PDF',
      description: 'Reduce file size while maintaining quality',
      icon: Zap,
      color: 'bg-cyan-500',
    },
    {
      id: 'batch' as ToolType,
      name: 'Batch Process',
      description: 'Apply operations to multiple PDFs',
      icon: Copy,
      color: 'bg-purple-500',
    },
    {
      id: 'reorder-advanced' as ToolType,
      name: 'Reorder Pages',
      description: 'Rearrange pages in any order',
      icon: ArrowUpDown,
      color: 'bg-pink-500',
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
      case 'crop':
        return <CropTool onBack={() => setSelectedView('home')} />;
      case 'optimize':
        return <OptimizeTool onBack={() => setSelectedView('home')} />;
      case 'header-footer':
        return <HeaderFooterTool onBack={() => setSelectedView('home')} />;
      case 'compress':
        return <CompressTool onBack={() => setSelectedView('home')} />;
      case 'batch':
        return <BatchTool onBack={() => setSelectedView('home')} />;
      case 'reorder-advanced':
        return <ReorderTool onBack={() => setSelectedView('home')} />;
      default:
        return null;
    }
  };

  if (selectedView !== 'home') {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{renderView()}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">PDF Ki Bari</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete PDF solution - scan documents, merge, split, rotate, extract, and more
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <section aria-label="PDF Tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.id}>
                <button
                  onClick={() => setSelectedView(tool.id)}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:-translate-y-1 w-full text-center"
                  aria-label={`${tool.name}: ${tool.description}`}
                >
                  {/* CENTERED ICON */}
                  <div className="flex justify-center mb-4">
                    <div className={`flex items-center justify-center w-14 h-14 ${tool.color} rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-7 h-7 text-white stroke-[2.2]" />
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-slate-800 mb-2">{tool.name}</h2>
                  <p className="text-slate-600 leading-relaxed">{tool.description}</p>
                </button>
              </article>
            );
          })}
        </section>

        <section className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="text-sm text-slate-600">All processing happens in your browser - your files never leave your device</span>
          </div>
        </section>

        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Why Choose PDF Ki Bari?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">100% Secure</h3>
                <p className="text-sm text-slate-600">All processing happens locally in your browser. Your files never leave your device.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Lightning Fast</h3>
                <p className="text-sm text-slate-600">Instant processing with no upload wait times. Works offline once loaded.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Completely Free</h3>
                <p className="text-sm text-slate-600">No hidden fees, no subscriptions. All 20+ tools are free forever.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800">How do I merge multiple PDF files?</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600 px-4">Click on the "Merge PDFs" tool, upload your PDF files, arrange them in the desired order by dragging, and click "Merge & Download". The combined PDF will be downloaded instantly.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800">Is there a file size limit?</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600 px-4">Since all processing happens in your browser, the only limit is your device's memory. Most modern devices can handle PDFs up to several hundred megabytes without issues.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800">Can I use this on my phone or tablet?</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600 px-4">Yes! PDF Ki Bari is fully responsive and works on all devices - smartphones, tablets, and desktop computers. The document scanner tool is particularly useful on mobile devices.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800">Do you store my files on your servers?</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600 px-4">No, we never store your files. All PDF processing happens entirely in your browser using JavaScript. Your files never leave your device, ensuring complete privacy and security.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800">What browsers are supported?</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600 px-4">PDF Ki Bari works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version of your preferred browser for the best experience.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="mt-16 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 shadow-sm border border-blue-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to Edit Your PDFs?</h2>
            <p className="text-lg text-slate-600 mb-6">Join millions of users who trust PDF Ki Bari for their PDF editing needs.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 shadow-sm">No Registration Required</span>
              <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 shadow-sm">100% Free Forever</span>
              <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 shadow-sm">Works Offline</span>
              <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 shadow-sm">20+ Tools Available</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-slate-200">
        <div className="text-center text-sm text-slate-600">
          <p className="mb-2">PDF Ki Bari - Free Online PDF Tools</p>
          <p>All processing happens in your browser. Your files are never uploaded to any server.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
