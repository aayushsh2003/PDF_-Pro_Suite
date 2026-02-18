import { useState } from 'react';
import { Combine, Download, X, GripVertical, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { mergePDFs, downloadPDF } from '../utils/pdfHelpers';

interface MergeToolProps {
  onBack: () => void;
}

export default function MergeTool({ onBack }: MergeToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      const mergedPdf = await mergePDFs(files);
      downloadPDF(mergedPdf, 'merged.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Merge PDFs"
        description="Combine multiple PDF files into a single document"
        icon={<Combine className="w-6 h-6 text-white" />}
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <FileUpload onFilesSelected={handleFilesSelected} multiple={true} disabled={isProcessing} />

        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Selected Files ({files.length})
              </h3>
              {files.length >= 2 && (
                <button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Merge & Download
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  draggable={!isProcessing}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-200 transition-all ${
                    !isProcessing ? 'cursor-move hover:shadow-md' : ''
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  {!isProcessing && <GripVertical className="w-5 h-5 text-slate-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      #{index + 1}
                    </span>
                    {!isProcessing && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {files.length < 2 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  Add at least one more PDF file to merge
                </p>
              </div>
            )}
          </div>
        )}

        {files.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-500">Upload multiple PDF files to merge them into one</p>
          </div>
        )}
      </div>
    </div>
  );
}
