export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const mark =
    size === "lg"
      ? "h-20 w-20 rounded-[28px] text-4xl"
      : "h-9 w-9 rounded-2xl text-lg";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${mark} flex items-center justify-center bg-[#A3E635] font-black tracking-tighter text-black shadow-[0_0_24px_rgba(163,230,53,0.35)]`}
      >
        E
      </div>
      <span className="text-xl font-semibold tracking-tight text-white">
        EVRY
      </span>
    </div>
  );
}
