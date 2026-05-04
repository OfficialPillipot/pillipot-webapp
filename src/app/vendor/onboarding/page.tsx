import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";

export const metadata = {
  title: "Vendor Onboarding | Pillipot",
  description: "Start your vendor journey with Pillipot marketplace.",
};

export default function VendorOnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pp-container py-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-pp-line bg-white p-6 shadow-[0_20px_60px_rgba(10,20,50,0.08)] md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr] lg:items-start">
              <div>
                <p className="mb-4 inline-flex rounded-full bg-pp-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-pp-primary">
                  Vendor Onboarding
                </p>
                <h1 className="text-4xl font-black text-slate-950 sm:text-5xl">
                  Join Pillipot as a vendor and sell to thousands of customers.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  Pillipot is building a vibrant marketplace for high-quality brands and sellers. Complete your onboarding to list products, manage orders, and grow your business with easy tools and trusted support.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href="mailto:support@pillipot.com"
                    className="inline-flex items-center justify-center rounded-full bg-pp-primary px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                  >
                    Contact Vendor Support
                  </a>
                  <a
                    href="/vendor/onboarding"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Learn About Requirements
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
                <h2 className="text-xl font-bold">Quick Start</h2>
                <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
                  <li>
                    <span className="font-semibold text-white">1.</span> Register as a vendor and set up your store profile.
                  </li>
                  <li>
                    <span className="font-semibold text-white">2.</span> Upload your product catalogue with images and pricing.
                  </li>
                  <li>
                    <span className="font-semibold text-white">3.</span> Submit your listings for review and approval.
                  </li>
                  <li>
                    <span className="font-semibold text-white">4.</span> Start receiving orders and track them from your vendor dashboard.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="pp-container py-10 md:py-16">
          <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Left side: Benefits */}
            <div>
              <h2 className="text-3xl font-black text-slate-950 mb-6">Get Started Today</h2>
              <div className="space-y-5">
                <div className="rounded-2xl border border-pp-line bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">📋 Complete Verification</h3>
                  <p className="text-sm text-slate-600">Submit your business details, tax information, and bank account for verification.</p>
                </div>
                <div className="rounded-2xl border border-pp-line bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">✅ Get Approved</h3>
                  <p className="text-sm text-slate-600">Our team reviews your application within 24-48 hours and notifies you of approval.</p>
                </div>
                <div className="rounded-2xl border border-pp-line bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">🚀 Start Selling</h3>
                  <p className="text-sm text-slate-600">Once approved, upload your products and start receiving orders immediately.</p>
                </div>
                <div className="rounded-2xl border border-pp-line bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">💰 Manage Earnings</h3>
                  <p className="text-sm text-slate-600">Track sales, manage inventory, and receive payouts directly to your bank account.</p>
                </div>
              </div>
            </div>

            {/* Right side: Registration Form */}
            <div className="rounded-[2rem] border border-pp-line bg-white p-6 shadow-[0_20px_60px_rgba(10,20,50,0.08)] md:p-8">
              <VendorRegistrationForm />
            </div>
          </div>
        </section>

        {/* Why Sell Section */}
        <section className="pp-container py-10 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-[1.75rem] border border-pp-line bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950 mb-6">Why sell on Pillipot?</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-3xl bg-pp-surface p-6 shadow-sm hover:bg-pp-surface/80">
                  <h3 className="font-semibold text-slate-900">Trusted customers</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Access a growing audience with secure checkout and fast delivery options.</p>
                </div>
                <div className="rounded-3xl bg-pp-surface p-6 shadow-sm hover:bg-pp-surface/80">
                  <h3 className="font-semibold text-slate-900">Easy onboarding</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Complete verification in 4 simple steps and get approved within 24 hours.</p>
                </div>
                <div className="rounded-3xl bg-pp-surface p-6 shadow-sm hover:bg-pp-surface/80">
                  <h3 className="font-semibold text-slate-900">Order management</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Track sales, manage inventory, and view order status from one place.</p>
                </div>
                <div className="rounded-3xl bg-pp-surface p-6 shadow-sm hover:bg-pp-surface/80">
                  <h3 className="font-semibold text-slate-900">Support & growth</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Get personal assistance from our vendor success team and grow with Pillipot.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
