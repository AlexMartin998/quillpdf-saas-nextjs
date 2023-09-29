import Image from 'next/image';

export type LandingImageProps = {
  imagePath: string;
  height: number;
  width: number;
  quality: number;
  alt: string;
  className?: string;
};

const LandingImage: React.FC<LandingImageProps> = ({
  imagePath,
  height,
  width,
  quality,
  alt,
  className,
}) => {
  return (
    <div className={`mx-auto max-w-6xl px-6 lg:px-8 ${className}`}>
      <div className="mt-16 flow-root sm:mt-24">
        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
          <Image
            src={imagePath}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            draggable="false"
            className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingImage;
