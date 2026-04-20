import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/layout/CategoryBar";
import ProductCard from "@/components/product/ProductCard";
import { getProducts, getCategories, type Product, type Category } from "@/lib/api";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch concurrently on the server
  const [products, cList] = await Promise.all([
    getProducts(id),
    getCategories()
  ]);

  const category = cList.find(c => c.id === id);
  const categoryName = category?.name || "Category";

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f6]">
      <Header />
      <CategoryBar categories={cList} />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-2 py-2 sm:px-4 sm:py-4">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">

          {/* Filters Sidebar - Flipkart Style */}
          <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-tight mb-4 block">Categories</span>
                <nav className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-pp-primary">
                    <span className="text-gray-400">‹</span> {categoryName}
                  </div>
                </nav>
              </div>

              <div className="p-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-tight mb-4 block">Price</span>
                <div className="px-2">
                  <input type="range" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pp-primary" />
                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <div className="border border-gray-200 rounded px-2 py-1 min-w-[60px]">₹0</div>
                    <div className="border border-gray-200 rounded px-2 py-1 min-w-[60px]">₹1,50,000+</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-gray-100">
                <FilterSection title="Customer Ratings" items={["4★ & above", "3★ & above"]} />
              </div>

              <div className="p-4">
                <FilterSection title="Offers" items={["Buy More Save More", "Special Price"]} />
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 bg-white shadow-sm border border-gray-200">
            {/* Breadcrumbs & Title strip */}
            <div className="p-4 border-b border-gray-100">
              <nav className="text-[10px] sm:text-xs text-gray-500 mb-2 flex items-center gap-1">
                <a href="/">Home</a> <span>›</span> <a href="/">{categoryName}</a>
              </nav>
              <h1 className="text-base font-bold text-gray-900">
                {categoryName}
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Showing {products.length} products)
                </span>
              </h1>
            </div>

            {/* Sort Bar - Mobile friendly */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="font-bold text-gray-900 shrink-0">Sort By</span>
              {["Relevance", "Popularity", "Price -- Low to High", "Price -- High to Low", "Newest First"].map((sort, i) => (
                <button
                  key={sort}
                  className={`px-1 py-1 transition-colors ${i === 0 ? "text-pp-primary font-bold border-b-2 border-pp-primary" : "text-gray-600 hover:text-pp-primary"}`}
                >
                  {sort}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="p-2 sm:p-4">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-gray-400 text-lg font-medium mb-4">No products found for this category</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function FilterSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      {items.map(item => (
        <label key={item} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-pp-primary">
          <input type="checkbox" className="w-3.5 h-3.5 rounded accent-pp-primary" />
          {item}
        </label>
      ))}
    </div>
  );
}
