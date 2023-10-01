'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type PdfRendererProps = { url: string };

const PdfRenderer: React.FC<PdfRendererProps> = ({ url }) => {
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* pdf options */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">PDF</div>
      </div>

      {/* Right side */}
      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document file={url} className="max-h-full">
            <Page pageNumber={1} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
