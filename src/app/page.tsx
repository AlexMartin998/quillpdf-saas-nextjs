import {
  FeatureSection,
  HeroSection,
  LandingDecorationSection,
  LandingImage,
} from '@/landing/components';
import { MaxWidthWrapper } from '@/shared/components';

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <HeroSection />
      </MaxWidthWrapper>

      {/* value position section: only for decoration,so avoid read it with aria-hidden */}
      <LandingDecorationSection />

      {/* feature section */}
      <FeatureSection />

      {/* image */}
      <LandingImage
        imagePath="/file-upload-preview.jpg"
        height={732}
        width={1419}
        quality={100}
        alt="uploading preview"
        className="pb-40"
      />
    </>
  );
}
