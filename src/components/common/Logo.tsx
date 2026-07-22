interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export default function Logo({
  variant = "dark",
  className = "",
}: LogoProps) {
  const isLight = variant === "light";

  return (
    <div className={`flex items-center select-none ${className}`}>
      <span className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
        Pillipot<span className="text-[#22B1C3]">.</span>
      </span>
    </div>
  );
}
