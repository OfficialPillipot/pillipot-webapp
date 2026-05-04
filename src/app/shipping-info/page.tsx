import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Shipping Information | Pillipot",
  description: "Shipping Information and Policies for Pillipot",
};

export default function ShippingInfo() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Shipping Information</h1>
            <p className="text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">1. Order Processing Time</h2>
                <p>
                  All orders are processed within 1 to 3 business days (excluding weekends and holidays) after receiving your order confirmation email.
                  You will receive another notification when your order has shipped.
                </p>
                <p className="mt-2 text-sm text-slate-500 italic">
                  *Please note that processing times may be delayed during high volume seasons or due to unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">2. Domestic Shipping Rates and Estimates</h2>
                <p className="mb-3">
                  Shipping charges for your order will be calculated and displayed at checkout. We offer several tiers of shipping:
                </p>
                <div className="overflow-x-auto rounded-xl border border-pp-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Shipping Option</th>
                        <th className="px-4 py-3 font-semibold">Estimated Delivery Time</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pp-line">
                      <tr>
                        <td className="px-4 py-3">Standard Shipping</td>
                        <td className="px-4 py-3">3 to 5 business days</td>
                        <td className="px-4 py-3">Free on eligible orders</td>
                      </tr>
                      {/* <tr>
                        <td className="px-4 py-3">Expedited Shipping</td>
                        <td className="px-4 py-3">1 to 2 business days</td>
                        <td className="px-4 py-3">$15.00</td>
                      </tr> */}
                      {/* <tr>
                        <td className="px-4 py-3">Next Day Delivery</td>
                        <td className="px-4 py-3">Next business day</td>
                        <td className="px-4 py-3">$25.00</td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">3. International Shipping</h2>
                <p>
                  We currently offer international shipping to select countries. Shipping charges for your order will be calculated and displayed at checkout.
                </p>
                <p className="mt-2">
                  Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country.
                  Pillipot is not responsible for these charges if they are applied and are your responsibility as the customer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">4. How Do I Check the Status of My Order?</h2>
                <p>
                  When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status.
                  Please allow 48 hours for the tracking information to become available.
                </p>
                <p className="mt-2">
                  If you haven't received your order within 7 days of receiving your shipping confirmation email, please contact us at support.pillipot@gmail.com with your name and order number, and we will look into it for you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">5. Shipping to P.O. Boxes</h2>
                <p>
                  Some carriers have limitations around shipping to P.O. Boxes. If one of your carriers falls into this group, please ensure you provide a physical address to prevent delays in processing your order.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-3">6. Refunds, Returns, and Exchanges</h2>
                <p>
                  We accept returns up to 3 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.
                </p>
                <p className="mt-2">
                  For full details, please view our <a href="/return-and-refund" className="text-pp-primary hover:underline font-medium">Return & Refund Policy</a>.
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
