import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { PdfViewer } from "@/components/PdfViewer";
import { ChatInterface } from "@/components/ChatInterface";
import { FileText } from "lucide-react";

const Index = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elegant">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">NotebookLM Clone</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Document Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 h-[calc(100vh-88px)]">
        {!pdfFile ? (
          <div className="flex items-center justify-center h-full">
            <FileUpload onFileSelect={setPdfFile} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <PdfViewer file={pdfFile} currentPage={currentPage} onPageChange={setCurrentPage} />
            <ChatInterface pdfFile={pdfFile} onCitationClick={setCurrentPage} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
