import { useState } from 'react';

export default function Upload({ onToast }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      onToast('Please select a file first', 'error');
      return;
    }
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setFile(null);
          onToast('Database successfully updated from file!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Data Upload</h2>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
            Bulk import student records via Excel/CSV
          </p>
        </div>
        <button className="btn-secondary" onClick={() => onToast('Template downloaded', 'info')}>
          <span className="material-symbols-outlined text-sm">download</span> Download Template
        </button>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <form 
          className={`relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-200
            ${dragActive ? 'border-[#4ff07f] bg-[#4ff07f]/5' : 'border-gray-300 dark:border-white/10 bg-white dark:bg-[#1e1e32] hover:border-gray-400 dark:hover:border-white/20'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onSubmit={e => e.preventDefault()}
        >
          <input 
            type="file" id="file-upload" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
          
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-0 pointer-events-none">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-[#4ff07f]/20 text-[#4ff07f]' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-[#8890b5]'}`}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud_upload
              </span>
            </div>
            {file ? (
              <>
                <p className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-[#8890b5] mb-4">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  <span className="text-[#4ff07f]">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-[#8890b5]">
                  CSV, XLSX up to 10MB
                </p>
              </>
            )}
          </div>
        </form>

        {/* Upload Action / Progress */}
        <div className="mt-6 flex flex-col items-center">
          {uploading ? (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                <span>Processing records...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-[#4ff07f] transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={handleUpload}
              disabled={!file}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                file 
                ? 'bg-[#4ff07f] text-[#003915] hover:bg-[#25d366] hover:shadow-lg hover:shadow-[#4ff07f]/30 hover:-translate-y-0.5 cursor-pointer' 
                : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-[#8890b5] cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined font-bold text-[20px]">sync</span>
              Sync Database
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
