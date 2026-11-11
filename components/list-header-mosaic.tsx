import Image from "next/image";

type ListHeaderMosaicProps = {
  sources: string[];
};

/**
 * Bold poster collage for list headers — sharp art + heavy scrim, not mid-blur wallpaper.
 */
export function ListHeaderMosaic({ sources }: ListHeaderMosaicProps) {
  if (sources.length === 0) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-20 overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-3">
        {sources.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-2/3 w-[20%] max-w-52 min-w-28 overflow-hidden rounded-md shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/10"
            style={{
              transform: `translateY(${(i % 2 === 0 ? -1 : 1) * 6}%) rotate(${(i - 2) * 2.5}deg)`,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i < 3}
              sizes="200px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-background/55 via-background/82 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_srgb,var(--amber)_12%,transparent),transparent_55%)]" />
    </div>
  );
}
