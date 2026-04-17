import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black selection:bg-blue-100 selection:text-blue-900">
      <main className="flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl"></div>
          <Image
            className="relative dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-black dark:text-white mb-2">
          Pillipot
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium text-zinc-500 dark:text-zinc-400 mb-12 tracking-wide uppercase">
          Welcome to Pillipot
        </h2>

        <div className="relative group">
          <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 blur"></div>
          <p className="relative text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 py-2">
            Coming Soon...
          </p>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-transparent rounded-full mx-auto sm:mx-0"></div>
        </div>
      </main>

      <footer className="absolute bottom-8 text-zinc-400 text-sm font-medium tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Pillipot. All rights reserved.
      </footer>
    </div>
  );
}
