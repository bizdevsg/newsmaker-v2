import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-100 grid place-items-center bg-[#1061B3] backdrop-blur-sm">
      <div className="flex w-full max-w-[min(52vw,180px)] flex-col items-center px-3 sm:max-w-[220px] md:max-w-[240px]">
        <Image
          src="/assets/NewsMaker-White 1.png"
          alt="Logo Newsmaker23"
          width={240}
          height={66}
          sizes="(max-width: 640px) 52vw, (max-width: 768px) 220px, 240px"
          priority
          className="h-auto w-full animate-pulse"
        />
      </div>
    </div>
  );
}

