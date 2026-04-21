import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/layout/CategoryBar";
import ProductCard from "@/components/product/ProductCard";
import SubcategoryFilter from "@/components/category/SubcategoryFilter";
import FilterSidebar from "@/components/category/FilterSidebar";
import { getProducts, getCategories, getSubcategories, type Product, type Category } from "@/lib/api";

export default async function CategoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ 
    subcategory?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sort?: string;
  }>
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const { 
    subcategory: subId,
    minPrice,
    maxPrice,
    minRating,
    sort
  } = sParams;

  // Fetch concurrently on the server
  const [products, cList, subcategories] = await Promise.all([
    getProducts(
      id, 
      undefined, 
      subId, 
      minPrice ? Number(minPrice) : undefined, 
      maxPrice ? Number(maxPrice) : undefined,
      minRating ? Number(minRating) : undefined,
      sort
    ),
    getCategories(),
    getSubcategories(id)
  ]);

  const category = cList.find(c => c.id === id);
  const categoryName = category?.name || "Category";

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f6]">
      <Header />
      <CategoryBar categories={cList} />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-2 py-2 sm:px-4 sm:py-4">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">

          {/* Filters Sidebar - Interactive Component */}
          <FilterSidebar categoryName={categoryName} />

          {/* Results Area */}
          <div className="flex-1 bg-white shadow-sm border border-gray-200">
            {/* Breadcrumbs & Title strip */}
            {/*Breadcrumbs & Title strip */}
            <div className="p-4 border-b border-gray-100">
              <nav className="text-[10px] sm:text-xs text-gray-500 mb-2 flex items-center gap-1">
                <a href="/">Home</a> <span>›</span> <a href={`/category/${id}`}>{categoryName}</a>
                {subId && subcategories.find(s => s.id === subId) && (
                  <>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">
                      {subcategories.find(s => s.id === subId)?.name}
                    </span>
                  </>
                )}
              </nav>
              <h1 className="text-base font-bold text-gray-900">
                {categoryName}
                {subId && subcategories.find(s => s.id === subId) && (
                  <span className="text-pp-primary ml-1">: {subcategories.find(s => s.id === subId)?.name}</span>
                )}
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Showing {products.length} products)
                </span>
              </h1>
            </div>

            {/* Subcategory stylish pills */}
            {subcategories.length > 0 && (
              <SubcategoryFilter subcategories={subcategories} categoryId={id} />
            )}

            {/* Sort Bar */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="font-black text-gray-400 uppercase tracking-widest text-[10px] shrink-0 mr-2">Sort By</span>
              {[
                { label: "Relevance", key: "" },
                { label: "Popularity", key: "popularity" },
                { label: "Price -- Low to High", key: "price_low" },
                { label: "Price -- High to Low", key: "price_high" },
                { label: "Newest First", key: "newest" }
              ].map((s) => {
                const isActive = (sort || "") === s.key;
                return (
                  <SortLink 
                    key={s.key} 
                    label={s.label} 
                    sortKey={s.key} 
                    isActive={isActive} 
                    currentParams={sParams}
                  />
                );
              })}
            </div>

            {/* Product Grid */}
            <div className="p-2 sm:p-4">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

import Link from "next/link";
function SortLink({ label, sortKey, isActive, currentParams }: { label: string; sortKey: string; isActive: boolean; currentParams: any }) {
  const query = { ...currentParams };
  if (sortKey) query.sort = sortKey;
  else delete query.sort;
  
  return (
    <Link
      href={{ query }}
      scroll={false}
      className={`px-1 py-1 transition-all ${isActive ? "text-pp-primary font-black border-b-2 border-pp-primary" : "text-gray-500 font-bold hover:text-pp-primary"}`}
    >
      {label}
    </Link>
  );
}
