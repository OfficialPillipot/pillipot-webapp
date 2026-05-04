import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service | Pillipot",
  description: "Terms of Service and Conditions for Pillipot",
};

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Pillipot ("we," "us" or "our"), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">2. Intellectual Property Rights</h2>
                <p className="mb-3">
                  Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Content and the Marks are provided on the Site "AS IS" for your information and personal use only.</li>
                  <li>Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">3. User Representations</h2>
                <p className="mb-3">
                  By using the Site, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All registration information you submit will be true, accurate, current, and complete.</li>
                  <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                  <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                  <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
                  <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">4. Products and Services</h2>
                <p>
                  We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">5. Modifications and Interruptions</h2>
                <p>
                  We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">6. Governing Law</h2>
                <p>
                  These Terms shall be governed by and defined following the laws of the jurisdiction in which our company is registered. Pillipot and yourself irrevocably consent that the courts of that jurisdiction shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">7. Contact Us</h2>
                <p>
                  In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                  <br />
                  <span className="font-medium text-pp-primary mt-1 inline-block">support.pillipot@gmail.com</span>
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
