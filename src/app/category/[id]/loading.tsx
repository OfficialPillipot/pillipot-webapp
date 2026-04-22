import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CategoryLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-pp-surface">
      <Header />

      {/* CategoryBar skeleton (match sticky offset + sizing) */}
      <div className="sticky top-14 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl">
        <div className="pp-container py-1.5 md:py-2.5">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto md:gap-2.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex min-w-[68px] flex-col items-center gap-1.5 rounded-[1.25rem] border border-white/40 bg-white/65 px-2 py-1.5 text-center md:min-w-[92px] md:gap-2 md:rounded-[1.55rem] md:px-3 md:py-2.5"
              >
                <div className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse min-[360px]:h-9 min-[360px]:w-9 md:h-12 md:w-12 md:rounded-2xl" />
                <div className="h-2 w-10 rounded bg-slate-100 animate-pulse md:w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="pp-container flex-1 py-6 md:py-8">
        {/* Header strip skeleton (match category header height) */}
        <section className="mb-6 rounded-[2rem] border border-white/60 bg-white/62 p-4 pp-shadow md:p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            <div className="h-3 w-14 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-3 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="h-7 w-56 rounded bg-slate-100 animate-pulse md:h-9 md:w-96" />
            <div className="h-8 w-44 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* FilterSidebar skeleton */}
          <aside className="hidden lg:flex w-[300px] shrink-0 flex-col rounded-[1.8rem] border border-white/60 bg-white/72 pp-shadow">
            <div className="border-b border-slate-100 p-5">
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="space-y-4 p-5">
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="h-10 w-full rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="h-2 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-2 w-5/6 rounded bg-slate-100 animate-pulse" />
              <div className="mt-2 h-3 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          </aside>

          {/* Results area skeleton */}
          <div className="flex-1 rounded-[2rem] border border-white/60 bg-white/72 pp-shadow">
            {/* Subcategory filter placeholder (height matches the real bar) */}
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="h-8 w-full rounded-2xl bg-slate-100 animate-pulse" />
            </div>

            {/* Sort bar placeholder */}
            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto border-b border-slate-100 px-5 py-4 whitespace-nowrap">
              <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-9 w-36 rounded-full bg-slate-100 animate-pulse" />
              ))}
            </div>

            {/* Grid placeholder */}
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[280px] rounded-[1.75rem] border border-white/55 bg-white/84 p-3 pp-shadow"
                  >
                    <div className="h-40 w-full rounded-[1.35rem] bg-slate-100 animate-pulse" />
                    <div className="mt-4 h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-6 h-6 w-28 rounded bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
