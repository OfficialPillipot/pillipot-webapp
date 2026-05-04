import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/layout/CategoryBar";
import ProductCard from "@/components/product/ProductCard";
import SubcategoryFilter from "@/components/category/SubcategoryFilter";
import FilterSidebar from "@/components/category/FilterSidebar";
import Link from "next/link";
import { getProducts, getCategories, getSubcategories } from "@/lib/api";

type CategorySearchParams = {
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
};

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<CategorySearchParams>
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
      undefined, // search
      undefined, // tag
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
    <div className="flex min-h-screen flex-col bg-pp-surface">
      <Header />
      <CategoryBar categories={cList} />

      <main className="pp-container flex-1 py-6 md:py-8">
        <section className="mb-6 rounded-[2rem] border border-white/60 bg-white/62 p-5 pp-shadow md:p-7">
          <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            <Link href="/">Home</Link>
            <span>•</span>
            <Link href={`/category/${id}`}>{categoryName}</Link>
            {subId && subcategories.find((s) => s.id === subId) ? (
              <>
                <span>•</span>
                <span className="text-pp-primary">{subcategories.find((s) => s.id === subId)?.name}</span>
              </>
            ) : null}
          </nav>

          <div className="mt-4 flex flex-col gap-2   md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
                {categoryName}
                {subId && subcategories.find((s) => s.id === subId) ? (
                  <span className="text-pp-primary"> / {subcategories.find((s) => s.id === subId)?.name}</span>
                ) : null}
              </h1>

            </div>
            <div className="pp-chip">
              Showing {products.length} product{products.length === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row">
          <FilterSidebar categoryName={categoryName} />

          <div className="flex-1 rounded-[2rem] border border-white/60 bg-white/72 pp-shadow">
            {subcategories.length > 0 && (
              <SubcategoryFilter subcategories={subcategories} categoryId={id} />
            )}

            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto border-b border-slate-100 px-5 py-4 whitespace-nowrap">
              <span className="mr-2 shrink-0 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Sort By</span>
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

            <div className="p-4 md:p-5">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-lg font-bold text-slate-700">No products found for this category</p>
                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    Try adjusting the filters or switching to a different sort to explore more results.
                  </p>
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

function SortLink({
  label,
  sortKey,
  isActive,
  currentParams,
}: {
  label: string;
  sortKey: string;
  isActive: boolean;
  currentParams: CategorySearchParams;
}) {
  const query = { ...currentParams };
  if (sortKey) query.sort = sortKey;
  else delete query.sort;

  const queryString = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1]))
  ).toString();
  const href = `?${queryString}`;

  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${isActive
        ? "bg-pp-surface-alt text-pp-primary"
        : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-pp-primary"
        }`}
    >
      {label}
    </Link>
  );
}
