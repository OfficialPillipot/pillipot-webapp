import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      
      {/* CategoryBar Skeleton */}
      <div className="bg-white pp-shadow border-b border-gray-100 py-3">
        <div className="pp-container flex items-center px-4 lg:px-8 gap-8 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="w-10 h-2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 pp-container px-4 py-8">
        {/* Banner Skeleton */}
        <div className="w-full h-[200px] md:h-[280px] bg-gray-200 animate-pulse rounded-3xl mb-12" />
        
        {/* Badges Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-3 border border-gray-50 h-20">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
              <div className="flex flex-col gap-2 justify-center flex-1">
                <div className="w-24 h-3 bg-gray-100 animate-pulse rounded" />
                <div className="w-32 h-2.5 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Section Skeleton */}
        <div className="mb-10">
          <div className="w-48 h-6 bg-gray-100 animate-pulse rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-50 p-4 h-[320px] flex flex-col gap-4">
                <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-xl" />
                <div className="w-2/3 h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-1/3 h-5 bg-gray-100 animate-pulse rounded" />
                <div className="mt-auto w-full h-10 bg-gray-100 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
