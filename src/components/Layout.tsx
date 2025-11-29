export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-background">
      {children}
    </div>
  );
}
