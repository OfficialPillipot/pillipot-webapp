import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Return & Refund Policy | Pillipot",
  description: "Return and Refund Policy for Pillipot",
};

export default function ReturnAndRefund() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      
      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Return & Refund Policy</h1>
            <p className="text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">1. Return Policy Overview</h2>
                <p>
                  At Pillipot, we want you to be completely satisfied with your purchase. If you are not completely satisfied 
                  with your order, you may return it to us for a full refund or an exchange, subject to the conditions outlined below.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">2. Eligibility for Returns</h2>
                <p className="mb-3">
                  To be eligible for a return, your item must meet the following criteria:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The item must be unused and in the same condition that you received it.</li>
                  <li>The item must be in the original packaging.</li>
                  <li>The return request must be initiated within 14 days of receiving your order.</li>
                  <li>Certain items such as perishable goods, custom products, and personal care items cannot be returned.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">3. Refund Process</h2>
                <p className="mb-3">
                  Once your return is received and inspected, we will send you an email to notify you that we have received 
                  your returned item. We will also notify you of the approval or rejection of your refund.
                </p>
                <p>
                  If you are approved, then your refund will be processed, and a credit will automatically be applied to your 
                  credit card or original method of payment, within a certain amount of days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">4. Exchanges</h2>
                <p>
                  We only replace items if they are defective or damaged. If you need to exchange it for the same item, 
                  send us an email and we will provide instructions on where to send your item for an exchange.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">5. Shipping Returns</h2>
                <p>
                  To return your product, you should mail your product to the address provided by our support team. 
                  You will be responsible for paying for your own shipping costs for returning your item. 
                  Shipping costs are non-refundable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">6. Contact Us</h2>
                <p>
                  If you have any questions on how to return your item to us, contact us at:
                  <br />
                  <span className="font-medium text-pp-primary mt-1 inline-block">support@pillipot.com</span>
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
