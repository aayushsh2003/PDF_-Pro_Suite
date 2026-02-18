import { useState, useEffect } from 'react';
import { Info, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { editMetadata, downloadPDF, getPDFPageCount, getPDFMetadata } from '../utils/pdfHelpers';

interface MetadataToolProps {
  onBack: () => void;
}

export default function MetadataTool({ onBack }: MetadataToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [originalMetadata, setOriginalMetadata] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setIsAnalyzing(true);

    try {
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);

      const metadata = await getPDFMetadata(selectedFile);
      setOriginalMetadata(metadata);
      setTitle(metadata.title);
      setAuthor(metadata.author);
      setSubject(metadata.subject);
      setKeywords('');
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      alert('Error analyzing PDF. Please try again.');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [];
      const modifiedPdf = await editMetadata(file, {
        title,
        author,
        subject,
        keywords: keywordsArray,
      });
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(modifiedPdf, `${baseName}_metadata.pdf`);
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Error saving metadata. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setTitle('');
    setAuthor('');
    setSubject('');
    setKeywords('');
    setOriginalMetadata(null);
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Edit Metadata"
        description="Edit PDF document metadata and properties"
        icon={<Info className="w-6 h-6 text-white" />}
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!file ? (
          <>
            <FileUpload onFilesSelected={handleFileSelected} multiple={false} disabled={isAnalyzing} />
            {isAnalyzing && (
              <div className="mt-8 flex items-center justify-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing PDF...</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{file.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB • {pageCount} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change File
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 border border-sky-200">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Document Metadata</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Document title"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Document author"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Document subject"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate keywords with commas</p>
                  </div>
                </div>

                {originalMetadata && (
                  <div className="mt-6 p-4 bg-white rounded-xl border border-sky-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Current Metadata:</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {originalMetadata.creator && (
                        <p><strong>Creator:</strong> {originalMetadata.creator}</p>
                      )}
                      {originalMetadata.producer && (
                        <p><strong>Producer:</strong> {originalMetadata.producer}</p>
                      )}
                      {originalMetadata.creationDate && (
                        <p><strong>Created:</strong> {originalMetadata.creationDate.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSaveMetadata}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Save & Download
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Metadata helps organize and identify PDF documents. It's visible in file properties and search results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
