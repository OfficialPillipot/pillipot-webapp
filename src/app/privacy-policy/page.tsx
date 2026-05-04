import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | Pillipot",
  description: "Privacy Policy for Pillipot",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introduction</h2>
                <p>
                  Welcome to Pillipot. We respect your privacy and are committed to protecting your personal data.
                  This privacy policy will inform you as to how we look after your personal data when you visit our website
                  and tell you about your privacy rights and how the law protects you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">2. The Data We Collect About You</h2>
                <p className="mb-3">
                  We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-slate-700">Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                  <li><strong className="text-slate-700">Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                  <li><strong className="text-slate-700">Financial Data</strong> includes payment card details.</li>
                  <li><strong className="text-slate-700">Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Personal Data</h2>
                <p className="mb-3">
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Security</h2>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
                  In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">5. Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our privacy practices, please contact us at:
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
