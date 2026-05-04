import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LuMail, LuPhone, LuMapPin, LuClock } from "react-icons/lu";

export const metadata = {
  title: "Contact Us | Pillipot",
  description: "Get in touch with the Pillipot support team",
};

export default function ContactUs() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1">
        <section className="pp-container py-8 md:py-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-10 pp-shadow border border-pp-line">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Contact Us</h1>
            <p className="text-slate-500 mb-8 font-medium">We'd love to hear from you. Here's how you can reach us.</p>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Get in Touch</h2>
                  <p className="text-slate-600 mb-6">
                    Whether you have a question about our features, trials, pricing, need a demo, or anything else, our team is ready to answer all your questions.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                      <LuMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Email</h3>
                      <p className="text-slate-500 text-sm mb-1">Our friendly team is here to help.</p>
                      <a href="mailto:support.pillipot@gmail.com" className="font-medium text-pp-primary hover:underline">support.pillipot@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                      <LuPhone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Phone</h3>
                      <p className="text-slate-500 text-sm mb-1">24/7</p>
                      <a href="tel:+919024063005" className="font-medium text-pp-primary hover:underline">+91 9024063005</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                      <LuMapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Office</h3>
                      <p className="text-slate-500 text-sm mb-1">Come say hello at our office HQ.</p>
                      <span className="text-slate-600 font-medium"><br />Pillipot<br />Thodupuzha,Udumbannoor<br />kerala<br />India</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                      <LuClock className="h-6 w-6" />
                    </div> */}
                    {/* <div>
                      <h3 className="font-bold text-slate-800">Working Hours</h3>
                      <p className="text-slate-500 text-sm mb-1">When we're available.</p>
                      <span className="text-slate-600 font-medium">Monday - Friday: 9:00 AM - 6:00 PM IST<br />Weekend: Closed</span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Contact Form (Dummy) */}
              {/* <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-pp-primary focus:ring-2 focus:ring-pp-primary/20" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-pp-primary focus:ring-2 focus:ring-pp-primary/20" 
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-pp-primary focus:ring-2 focus:ring-pp-primary/20" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                    <textarea 
                      id="message" 
                      rows={4}
                      className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-pp-primary focus:ring-2 focus:ring-pp-primary/20 resize-none" 
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  <button 
                    type="button" 
                    className="w-full rounded-xl bg-pp-primary px-4 py-3 font-bold text-slate-900 transition-colors hover:bg-sky-300 active:scale-[0.98]"
                  >
                    Send Message
                  </button>
                </form>
              </div> */}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
