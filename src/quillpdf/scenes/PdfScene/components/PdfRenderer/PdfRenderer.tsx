'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import SimpleBar from 'simplebar-react';
import { z } from 'zod';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { useToast } from '@/shared/components/ui/use-toast';
import { cn } from '@/shared/lib/utils';
import { PdfFullscreen } from '..';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type PdfRendererProps = { url: string };

const PdfRenderer: React.FC<PdfRendererProps> = ({ url }) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // form & input page validator
  const CustomPageValidator = z.object({
    page: z.string().refine(num => +num > 0 && +num <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: { page: '1' },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrentPage(+page);
    setValue('page', page.toString());
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* pdf options */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        {/* navigatation */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
                setValue('page', String(currentPage - 1));
              }
            }}
            disabled={currentPage <= 1}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register('page')}
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500'
              )}
              onKeyUp={e => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>
          <Button
            onClick={() => {
              if (currentPage < numPages!) {
                setCurrentPage(prev => prev + 1);
                setValue('page', String(currentPage + 1));
              }
            }}
            disabled={currentPage >= numPages! || currentPage === undefined}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* zoom pdf view & others opts */}
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" variant="ghost" className="gap-1.5">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation(prev => prev + 90)}
            aria-label="rotate 90 degrees"
            variant="ghost"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen url={url} />
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={url}
              className="max-h-full"
              loading={null}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => {
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
            >
              <Page
                width={width ?? 1}
                pageNumber={currentPage}
                loading={null}
                scale={scale}
                rotate={rotation}
              />
            </Document>
          </div>
        </SimpleBar>

        {!numPages && (
          <div className="flex justify-center">
            <Loader2 className="my-36 h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfRenderer;
