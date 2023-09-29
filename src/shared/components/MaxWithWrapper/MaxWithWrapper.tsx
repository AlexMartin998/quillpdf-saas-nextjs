export interface MaxWithWrapperProps {
  className?: string;
  children: React.ReactNode;
}

const MaxWithWrapper: React.FC<MaxWithWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`mx-auto w-full max-w-screen-lg px-2.5 md:px-20 ${className}`}
    >
      {children}
    </div>
  );
};

export default MaxWithWrapper;
