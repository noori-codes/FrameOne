import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  providerLogoUrl,
  type TmdbWatchProvider,
  type WatchProviderOffer,
} from "@/lib/tmdb";

type WhereToWatchProps = {
  offer: WatchProviderOffer;
  title: string;
  className?: string;
};

function ProviderRow({
  label,
  providers,
  href,
}: {
  label: string;
  providers: TmdbWatchProvider[];
  href: string | null;
}) {
  if (providers.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.18em] text-cream/40 uppercase">
        {label}
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-2.5">
        {providers.map((provider) => {
          const logo = providerLogoUrl(provider.logo_path);
          const content = (
            <>
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-lg object-cover"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-lg bg-stage text-[10px] font-semibold text-cream/50">
                  {provider.provider_name.slice(0, 2)}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-cream/85">
                {provider.provider_name}
              </span>
            </>
          );

          return (
            <li key={`${label}-${provider.provider_id}`}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-w-[9.5rem] items-center gap-2.5 rounded-xl border border-cream/10 bg-black/30 px-2.5 py-2 transition-[border-color,background-color] hover:border-amber/40 hover:bg-amber/5"
                >
                  {content}
                </a>
              ) : (
                <div className="flex min-w-[9.5rem] items-center gap-2.5 rounded-xl border border-cream/10 bg-black/30 px-2.5 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * JustWatch-powered availability (free / stream / rent / buy) for the configured region.
 */
export function WhereToWatch({ offer, title, className }: WhereToWatchProps) {
  const hasAny =
    offer.free.length > 0 ||
    offer.flatrate.length > 0 ||
    offer.rent.length > 0 ||
    offer.buy.length > 0;
  if (!hasAny) return null;

  return (
    <section
      aria-labelledby="where-to-watch-heading"
      className={className}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
            Available on
          </p>
          <h2
            id="where-to-watch-heading"
            className="mt-2 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl"
          >
            Where to watch
          </h2>
          <p className="mt-1.5 text-xs text-cream/40">
            Region {offer.region}
          </p>
        </div>
        {offer.link ? (
          <a
            href={offer.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-cream/55 transition-colors hover:text-amber"
          >
            All options
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </div>

      <div className="mt-6 space-y-5">
        <ProviderRow label="Free" providers={offer.free} href={offer.link} />
        <ProviderRow
          label="Stream"
          providers={offer.flatrate}
          href={offer.link}
        />
        <ProviderRow label="Rent" providers={offer.rent} href={offer.link} />
        <ProviderRow label="Buy" providers={offer.buy} href={offer.link} />
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-cream/35">
        Availability for{" "}
        <span className="text-cream/50">{title}</span> via JustWatch. Links open
        TMDB’s watch guide — FrameOne doesn’t stream titles.
      </p>
    </section>
  );
}
