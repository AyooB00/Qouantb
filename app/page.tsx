
export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold text-center">QuoantB</h1>
        <p className="text-xl text-center text-muted-foreground max-w-2xl">
          AI-Powered Stock Analysis Platform
        </p>
        
        <div className="flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-semibold">Available Tools</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/swing-trading"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium text-center"
            >
              Swing Trading Opportunities
            </a>
            <a
              href="/stock-analysis"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium text-center"
            >
              AI Investment Analysis
            </a>
          </div>
        </div>

      </main>
      <footer className="row-start-3 text-center text-sm text-muted-foreground">
        <p>AI-powered stock analysis for educational purposes only. Not financial advice.</p>
      </footer>
    </div>
  );
}
