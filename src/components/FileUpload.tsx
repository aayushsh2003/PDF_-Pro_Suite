import { useRef } from 'react';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export default function FileUpload({ onFilesSelected, accept = '.pdf', multiple = false, disabled = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
        disabled
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
          : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${disabled ? 'bg-slate-200' : 'bg-blue-100'}`}>
          {multiple ? <Upload className={`w-8 h-8 ${disabled ? 'text-slate-400' : 'text-blue-600'}`} /> : <File className={`w-8 h-8 ${disabled ? 'text-slate-400' : 'text-blue-600'}`} />}
        </div>
        <div>
          <p className={`text-lg font-semibold mb-1 ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>
            {multiple ? 'Click to upload or drag and drop' : 'Click to upload PDF'}
          </p>
          <p className={`text-sm ${disabled ? 'text-slate-400' : 'text-slate-500'}`}>
            {multiple ? 'Upload multiple PDF files' : 'Upload a single PDF file'}
          </p>
        </div>
      </div>
    </div>
  );
}
