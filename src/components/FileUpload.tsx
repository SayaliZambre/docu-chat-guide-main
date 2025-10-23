import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
        toast.success("PDF uploaded successfully!");
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full max-w-2xl p-12 border-2 border-dashed rounded-2xl
        transition-all duration-300 cursor-pointer animate-fade-in
        ${
          isDragActive
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border bg-card hover:border-primary/50 hover:shadow-elegant"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-accent blur-xl opacity-50"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            {isDragActive ? (
              <FileText className="w-10 h-10 text-primary-foreground animate-pulse" />
            ) : (
              <Upload className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            {isDragActive ? "Drop your PDF here" : "Upload PDF Document"}
          </h3>
          <p className="text-muted-foreground">
            Drag and drop your PDF file here, or click to browse
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span>PDF files only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span>Up to 100MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
