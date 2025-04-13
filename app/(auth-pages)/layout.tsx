export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="w-full max-w-lg mx-auto py-12">
        {children}
      </div>
    </div>
  );
}
