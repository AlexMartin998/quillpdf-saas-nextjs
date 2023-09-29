import { MaxWithWrapper } from './components/MaxWithWrapper';
import {
  FeatureSection,
  HeroSection,
  LandingDecorationSection,
} from './shared/components';

export default function Home() {
  return (
    <>
      <MaxWithWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <HeroSection />
      </MaxWithWrapper>

      {/* value position section: only for decoration,so avoid read it with aria-hidden */}
      <LandingDecorationSection />

      {/* feature section */}
      <FeatureSection />
    </>
  );
}
