import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "About Us | Pillipot",
  description: "Learn more about Pillipot and our mission",
};

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">About Pillipot</h1>
            <p className="text-slate-500 mb-8 font-medium">Your trusted online marketplace.</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Our Mission</h2>
                <p>
                  We believe that shopping online should be straightforward and enjoyable, offering a curated selection of products that meet our high standards for quality and value.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Our Story</h2>
                <p className="mb-3">
                  Pillipot started with a simple idea: to create a marketplace where local vendors could reach a broader audience without the complex hurdles of traditional online platforms. Over time, we've grown into a bustling community of trusted sellers and passionate buyers.
                </p>
                <p>
                  Today, we continue to innovate, ensuring that our technology serves the people who use it, making every transaction smooth from browsing to delivery.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-slate-700">Curated Quality:</strong> We meticulously vet our vendors to ensure that every product listed meets our rigorous quality standards.</li>
                  <li><strong className="text-slate-700">Secure Transactions:</strong> Your security is our top priority. We utilize state-of-the-art encryption to protect your data and payments.</li>
                  <li><strong className="text-slate-700">Fast Delivery:</strong> Partnering with top-tier logistics providers ensures that your orders reach you swiftly and safely.</li>
                  <li><strong className="text-slate-700">Dedicated Support:</strong> Our customer service team is always on standby to assist you with any inquiries or issues.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Join Our Community</h2>
                <p>
                  Whether you are looking to discover unique products or you are a vendor aiming to expand your reach, Pillipot is the place for you. We are constantly expanding our offerings and features, driven by the feedback and needs of our community.
                </p>
                <p className="mt-4">
                  Welcome to Pillipot — where quality meets convenience.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
