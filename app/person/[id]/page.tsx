import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Cake,
  Clapperboard,
  ExternalLink,
  MapPin,
  Sparkles,
  Tv,
} from "lucide-react";
import { notFound } from "next/navigation";
import { MovieCard } from "@/components/movie-card";
import { SiteFooter } from "@/components/site-footer";
import {
  backdropUrl,
  getPerson,
  getPersonCombinedCredits,
  getPersonKnownFor,
  personCreditTitle,
  profileUrl,
  type TmdbPersonCredit,
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: string | null) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function creditYear(credit: TmdbPersonCredit) {
  const raw = credit.release_date || credit.first_air_date || "";
  return raw.slice(0, 4) || null;
}

function ageFromDates(birthday: string | null, deathday: string | null) {
  if (!birthday) return null;
  const birth = new Date(`${birthday}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const end = deathday ? new Date(`${deathday}T00:00:00Z`) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  let age = end.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = end.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && end.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function splitBio(biography: string) {
  const trimmed = biography.trim();
  if (!trimmed) {
    return {
      lead: "No biography is available for this person yet.",
      rest: null as string | null,
    };
  }
  const parts = trimmed.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    const sentenceBreak = trimmed.match(/^(.+?[.!?])\s+([\s\S]+)$/);
    if (sentenceBreak) {
      return { lead: sentenceBreak[1]!, rest: sentenceBreak[2]! };
    }
    return { lead: trimmed, rest: null };
  }
  return { lead: parts[0]!, rest: parts.slice(1).join("\n\n") };
}

function ExternalChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-cream/15 bg-black/35 px-4 text-xs font-medium tracking-wide text-cream/80 backdrop-blur-md transition-[border-color,background-color,color,transform] duration-300 hover:border-amber/45 hover:bg-amber/10 hover:text-amber active:scale-[0.98]"
    >
      {label}
      <ExternalLink
        className="size-3 opacity-50 transition-opacity group-hover:opacity-90"
        aria-hidden
      />
    </a>
  );
}

function MetaStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-sm border border-cream/10 bg-black/25 px-3 py-2.5 backdrop-blur-sm">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-cream/40 uppercase">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-cream/90">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-cream/8 py-3.5 last:border-0 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-relaxed text-cream/88">{value}</dd>
    </div>
  );
}

function pickHeroBackdrop(knownFor: TmdbPersonCredit[]) {
  for (const credit of knownFor) {
    if (credit.backdrop_path) return backdropUrl(credit.backdrop_path);
  }
  return null;
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) return { title: "Person not found" };
  const bio = person.biography?.trim();
  return {
    title: person.name,
    description: bio
      ? bio.slice(0, 160)
      : `${person.name} on FrameOne — filmography and details from TMDB.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const [person, credits] = await Promise.all([
    getPerson(id),
    getPersonCombinedCredits(id),
  ]);
  if (!person) notFound();

  const department = person.known_for_department || "Acting";
  const knownFor = getPersonKnownFor(credits, department, 24);
  const portrait = profileUrl(person.profile_path, "h632");
  const backdrop = pickHeroBackdrop(knownFor);
  const birthday = formatDate(person.birthday);
  const deathday = formatDate(person.deathday);
  const age = ageFromDates(person.birthday, person.deathday);
  const aka = person.also_known_as?.filter(Boolean).slice(0, 8) ?? [];
  const external = person.external_ids;
  const { lead, rest } = splitBio(person.biography ?? "");

  const movieCredits = knownFor.filter((c) => c.media_type === "movie");
  const tvCredits = knownFor.filter((c) => c.media_type === "tv");
  const titleCount = knownFor.length;

  const nameParts = person.name.trim().split(/\s+/);
  const lastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1]! : null;
  const firstNames =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : person.name;

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <section className="relative isolate flex min-h-0 flex-col overflow-hidden border-b border-cream/10">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none scale-105 object-cover object-[center_20%] opacity-40"
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(7,10,11,0.98)_0%,rgba(7,10,11,0.82)_42%,rgba(7,10,11,0.55)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#070a0b_0%,rgba(7,10,11,0.4)_38%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_28%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_52%)]"
        />
        <div className="film-grain absolute inset-0" />

        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16 lg:px-8 lg:pb-10 lg:pt-18">
          <Link
            href="/"
            className="inline-flex min-h-9 w-fit items-center gap-2 border-b border-cream/20 pb-1.5 text-xs font-medium text-cream/70 transition-colors hover:border-amber hover:text-amber sm:text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to browse
          </Link>

          <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(160px,220px)_minmax(0,1fr)] lg:gap-12">
            <div className="relative mx-auto w-full max-w-[180px] sm:max-w-[200px] lg:mx-0 lg:max-w-none">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_22%,transparent),transparent_68%)] blur-2xl"
              />
              <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-stage shadow-[0_28px_70px_-28px_rgba(0,0,0,0.95)] ring-1 ring-cream/25">
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={person.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 200px, 220px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-6xl text-cream/20">
                    {person.name.slice(0, 1)}
                  </div>
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent"
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase backdrop-blur-sm sm:text-xs">
                <Sparkles className="size-3.5" aria-hidden />
                {department}
              </p>

              <h1
                aria-label={person.name}
                className="max-w-4xl font-display leading-[0.9] text-balance wrap-break-word text-cream uppercase"
              >
                <span className="block text-3xl text-cream/75 sm:text-4xl md:text-5xl">
                  {firstNames}
                </span>
                {lastName ? (
                  <span className="mt-0.5 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                    {lastName}
                  </span>
                ) : null}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-2.5 lg:max-w-xl">
                {age != null ? (
                  <MetaStat
                    label={deathday ? "Age at death" : "Age"}
                    value={`${age}`}
                    icon={<Cake className="size-3 text-amber" aria-hidden />}
                  />
                ) : null}
                {person.place_of_birth ? (
                  <MetaStat
                    label="From"
                    value={
                      person.place_of_birth
                        .split(",")
                        .slice(-2)
                        .join(",")
                        .trim() || person.place_of_birth
                    }
                    icon={<MapPin className="size-3 text-amber" aria-hidden />}
                  />
                ) : null}
                {titleCount > 0 ? (
                  <MetaStat
                    label="Known titles"
                    value={String(titleCount)}
                    icon={
                      <Clapperboard className="size-3 text-amber" aria-hidden />
                    }
                  />
                ) : null}
              </div>

              {(external?.imdb_id ||
                external?.instagram_id ||
                external?.twitter_id ||
                person.homepage) && (
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                  {external?.imdb_id ? (
                    <ExternalChip
                      href={`https://www.imdb.com/name/${external.imdb_id}`}
                      label="IMDb"
                    />
                  ) : null}
                  {external?.instagram_id ? (
                    <ExternalChip
                      href={`https://www.instagram.com/${external.instagram_id}`}
                      label="Instagram"
                    />
                  ) : null}
                  {external?.twitter_id ? (
                    <ExternalChip
                      href={`https://x.com/${external.twitter_id}`}
                      label="X"
                    />
                  ) : null}
                  {person.homepage ? (
                    <ExternalChip href={person.homepage} label="Website" />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-stage/40 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
            <div className="min-w-0 space-y-16 sm:space-y-20">
              <section aria-labelledby="bio-heading">
                <div className="flex items-end justify-between gap-4 border-b border-cream/10 pb-5">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                      Life on record
                    </p>
                    <h2
                      id="bio-heading"
                      className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
                    >
                      Biography
                    </h2>
                  </div>
                </div>

                <p className="mt-8 max-w-3xl font-display text-2xl leading-snug text-cream/90 sm:text-3xl sm:leading-[1.25]">
                  {lead}
                </p>
                {rest ? (
                  <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-cream/65 sm:text-[17px] sm:leading-9">
                    {rest.split(/\n+/).map((paragraph, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}
              </section>

              {movieCredits.length > 0 ? (
                <KnownForSection
                  id="known-movies"
                  eyebrow="Cinema"
                  title="Films"
                  icon={<Clapperboard className="size-4" aria-hidden />}
                  credits={movieCredits}
                />
              ) : null}

              {tvCredits.length > 0 ? (
                <KnownForSection
                  id="known-series"
                  eyebrow="Television"
                  title="Series"
                  icon={<Tv className="size-4" aria-hidden />}
                  credits={tvCredits}
                />
              ) : null}
            </div>

            <aside className="lg:pt-1">
              <div className="overflow-hidden rounded-sm border border-cream/10 bg-[linear-gradient(180deg,rgba(16,22,23,0.9),rgba(7,10,11,0.55))] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.85)] backdrop-blur-md lg:sticky lg:top-24">
                <div className="border-b border-cream/10 px-5 py-4">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
                    Profile
                  </p>
                  <p className="mt-1 font-display text-2xl uppercase tracking-wide text-cream">
                    Details
                  </p>
                </div>
                <dl className="px-5 py-2">
                  <DetailRow label="Craft" value={department} />
                  <DetailRow label="Born" value={birthday} />
                  <DetailRow
                    label={deathday ? "Age at death" : "Age"}
                    value={age}
                  />
                  <DetailRow label="Died" value={deathday} />
                  <DetailRow
                    label="Birthplace"
                    value={person.place_of_birth}
                  />
                </dl>
                {aka.length > 0 ? (
                  <div className="border-t border-cream/10 px-5 py-4">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-cream/40 uppercase">
                      Also known as
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {aka.map((name) => (
                        <li
                          key={name}
                          className="rounded-full border border-cream/12 bg-black/30 px-2.5 py-1 text-xs text-cream/70"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function KnownForSection({
  id,
  eyebrow,
  title,
  icon,
  credits,
}: {
  id: string;
  eyebrow: string;
  title: string;
  icon: ReactNode;
  credits: TmdbPersonCredit[];
}) {
  return (
    <section aria-labelledby={id}>
      <div className="flex items-end justify-between gap-4 border-b border-cream/10 pb-5">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
            <span className="text-amber">{icon}</span>
            {eyebrow}
          </p>
          <h2
            id={id}
            className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
          >
            {title}
          </h2>
        </div>
        <span className="mb-1 text-xs tracking-wide text-cream/40">
          {credits.length} titles
        </span>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {credits.map((credit) => {
          const year = creditYear(credit);
          return (
            <li
              key={`${credit.media_type}-${credit.id}`}
              className="min-w-0"
            >
              <MovieCard
                id={credit.id}
                title={personCreditTitle(credit)}
                posterPath={credit.poster_path}
                voteAverage={credit.vote_average}
                mediaType={credit.media_type}
                showTitle
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 160px"
              />
              <p
                className={cn(
                  "mt-1.5 line-clamp-2 text-xs leading-snug text-cream/40",
                )}
              >
                {credit.character ? (
                  <>
                    <span className="text-cream/55">as {credit.character}</span>
                    {year ? (
                      <span className="text-cream/30"> · {year}</span>
                    ) : null}
                  </>
                ) : credit.job ? (
                  <>
                    <span className="text-cream/55">{credit.job}</span>
                    {year ? (
                      <span className="text-cream/30"> · {year}</span>
                    ) : null}
                  </>
                ) : year ? (
                  year
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
