'use client';

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useResizeDetector } from 'react-resize-detector';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useToast } from '@/shared/components/ui/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type PdfRendererProps = { url: string };

const PdfRenderer: React.FC<PdfRendererProps> = ({ url }) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(3);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* pdf options */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
            disabled={currentPage <= 1}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* navigate */}
          <div className="flex items-center gap-1.5">
            <Input className="w-12 h-8" />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          <Button
            onClick={() =>
              currentPage < numPages! && setCurrentPage(prev => prev + 1)
            }
            disabled={currentPage >= numPages! || currentPage === undefined}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            file={url}
            className="max-h-full"
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => {
              toast({
                title: 'Error loading PDF',
                description: 'Please try again later',
                variant: 'destructive',
              });
            }}
          >
            <Page width={width ?? 1} pageNumber={currentPage} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
