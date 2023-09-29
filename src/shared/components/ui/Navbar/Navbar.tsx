import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';
import Link from 'next/link';
import { MaxWithWrapper, buttonVariants } from '../..';

export type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWithWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>quillPDF</span>
          </Link>

          {/* TODO: mobile navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Pricing
              </Link>

              {/* external auth service */}
              <LoginLink
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Sign In
              </LoginLink>
              <RegisterLink className={buttonVariants({ size: 'sm' })}>
                Get started
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWithWrapper>
    </nav>
  );
};

export default Navbar;
