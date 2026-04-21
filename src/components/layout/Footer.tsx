import Link from "next/link";
import { Globe, MessageCircle, Play, Camera, Mail, Phone, MapPin, ShieldCheck, CreditCard, Truck } from "lucide-react";

export default function Footer() {
  const SECTIONS = [
    {
      title: "SHOP",
      links: ["All Categories", "Deals of the Day", "New Arrivals", "Top Brands", "Trending"],
    },
    {
      title: "CUSTOMER SERVICE",
      links: ["Help Center", "Track Order", "Returns & Exchanges", "Shipping Info", "FAQ"],
    },
    {
      title: "COMPANY",
      links: ["About Pillipot", "Careers", "Press", "Sustainability", "Investor Relations"],
    },
    {
      title: "LEGAL",
      links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility"],
    },
  ];

  return (
    <footer className="bg-pp-dark text-white mt-10">
      {/* Trust badges */}
      <div className="border-b border-white/10">
        <div className="pp-container py-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <ShieldCheck className="w-6 h-6 text-pp-accent" />
            <span><b className="text-white">100%</b> Authentic Products</span>
          </div>
          {/* <div className="flex items-center gap-3 text-sm text-white/70">
            <Truck className="w-6 h-6 text-pp-accent-warm" />
            <span><b className="text-white">Free Shipping</b> above ₹499</span>
          </div> */}
          <div className="flex items-center gap-3 text-sm text-white/70">
            <CreditCard className="w-6 h-6 text-pp-success" />
            <span><b className="text-white">Secure</b> Payments</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="pp-container py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white/40 tracking-widest mb-1">{section.title}</h4>
            {section.links.map((link) => (
              <a key={link} href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-4 col-span-2 md:col-span-4 lg:col-span-1">
          <h4 className="text-xs font-bold text-white/40 tracking-widest mb-1">CONNECT WITH US</h4>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Camera className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Play className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-col gap-2 mt-2 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              support@pillipot.com
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              1800-123-4567
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="pp-container py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 pp-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span>© {new Date().getFullYear()} Pillipot Marketplace. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
