import Link from "next/link";
import {
  LuGlobe,
  LuInstagram,
  LuMessageCircle,
  LuMail,
  LuPhone,
  LuShieldCheck,
  LuCreditCard,
  LuTruck,
} from "react-icons/lu";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All Categories", href: "/" },
      { label: "Trending Now", href: "/" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track My Order", href: "/orders" },
      { label: "Shipping Info", href: "/shipping-info" },
      { label: "Return & Refund", href: "/return-and-refund" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Pillipot", href: "/about" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
];

const trustBadges = [
  { icon: LuTruck, label: "Free Delivery", sub: "On eligible orders" },
  { icon: LuShieldCheck, label: "Secure Payments", sub: "100% protected" },
  { icon: LuCreditCard, label: "Multiple Options", sub: "Pay your way" },
];

const socialLinks = [
  { icon: LuGlobe, href: "https://www.pillipot.com", label: "Website" },
  { icon: LuInstagram, href: "https://www.instagram.com/eden_e_cart?utm_source=qr&igsh=MXNydDNvMG0wNHczag==", label: "Instagram" },
  { icon: LuMessageCircle, href: "https://wa.me/message/HNFKP2BAWYBSJ1", label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-slate-200/60 bg-[#081120] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,111,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,190,92,0.1),transparent_22%)]" />

      <div className="pp-container relative">

        {/* Trust badges strip */}
        <div className="grid grid-cols-1 gap-3 border-b border-white/8 py-6 sm:grid-cols-3 md:py-8">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                <badge.icon className="h-5 w-5 text-pp-primary" />
              </div>
              <div>
                <p className="text-[0.8rem] font-bold text-white/90">{badge.label}</p>
                <p className="text-[0.7rem] text-white/40">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main footer grid */}
        <div className="grid gap-8 border-b border-white/8 py-8 md:grid-cols-[1.6fr_repeat(3,1fr)] md:py-10">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                <span className="bg-gradient-to-br from-pp-accent via-pp-primary to-pp-success bg-clip-text text-base font-black text-transparent">
                  P
                </span>
              </div>
              <span className="flex items-center text-lg font-black tracking-[-0.04em]">
                <span className="text-pp-accent">p</span>
                <span className="text-pp-cyan">i</span>
                <span className="text-pp-cyan">l</span>
                <span className="text-pp-primary">l</span>
                <span className="text-pp-primary">i</span>
                <span className="text-pp-accent-warm">p</span>
                <span className="text-pp-success">o</span>
                <span className="text-pp-accent">t</span>
              </span>
            </div>

            <p className="mt-4 max-w-[240px] text-[0.82rem] leading-[1.7] text-white/48">
              Your trusted online marketplace — curated products, fast delivery,
              and a seamless shopping experience.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:support@pillipot.com"
                className="flex items-center gap-2.5 text-[0.8rem] text-white/55 transition-colors hover:text-white"
              >
                <LuMail className="h-3.5 w-3.5 text-white/30" />
                support@pillipot.com
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2.5 text-[0.8rem] text-white/55 transition-colors hover:text-white"
              >
                <LuPhone className="h-3.5 w-3.5 text-white/30" />
                +91 9024063005
              </a>
            </div>

            {/* Socials */}
            <div className="mt-5 flex gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/55 transition-all duration-200 hover:border-white/20 hover:bg-white/12 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center justify-center rounded-full bg-pp-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-[0.68rem] font-black uppercase tracking-[0.22em] text-white/35">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.82rem] text-white/55 transition-colors duration-150 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 py-5 text-[0.75rem] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pillipot Marketplace. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
