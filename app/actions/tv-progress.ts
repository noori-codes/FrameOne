"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTvSeason } from "@/lib/tmdb";

export type TvProgressState = {
  error?: string;
  success?: string;
};

function revalidateShow(showId: number) {
  revalidatePath(`/tv/${showId}`);
  revalidatePath("/watched");
  revalidatePath("/profile");
}

function parseShowId(formData: FormData) {
  const showId = Number(formData.get("showId"));
  if (!Number.isFinite(showId) || showId <= 0) {
    return { error: "Invalid show." as const };
  }
  return { showId };
}

function parseSeasonEpisode(formData: FormData) {
  const seasonNumber = Number(formData.get("seasonNumber"));
  const episodeNumber = Number(formData.get("episodeNumber"));
  if (
    !Number.isInteger(seasonNumber) ||
    seasonNumber < 0 ||
    !Number.isInteger(episodeNumber) ||
    episodeNumber < 1
  ) {
    return { error: "Invalid episode." as const };
  }
  return { seasonNumber, episodeNumber };
}

/**
 * Toggle a single episode watched / unwatched.
 */
export async function toggleTvEpisode(
  _prev: TvProgressState,
  formData: FormData,
): Promise<TvProgressState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to track progress." };
  }

  const show = parseShowId(formData);
  if ("error" in show) return { error: show.error };
  const ep = parseSeasonEpisode(formData);
  if ("error" in ep) return { error: ep.error };

  const userId = session.user.id;
  const { showId } = show;
  const { seasonNumber, episodeNumber } = ep;

  const existing = await prisma.tvEpisodeWatch.findUnique({
    where: {
      userId_showId_seasonNumber_episodeNumber: {
        userId,
        showId,
        seasonNumber,
        episodeNumber,
      },
    },
  });

  if (existing) {
    await prisma.tvEpisodeWatch.delete({ where: { id: existing.id } });
    revalidateShow(showId);
    return { success: "Episode unmarked." };
  }

  await prisma.tvEpisodeWatch.create({
    data: {
      userId,
      showId,
      seasonNumber,
      episodeNumber,
      watchedAt: new Date(),
    },
  });

  revalidateShow(showId);
  return { success: "Episode logged." };
}

/**
 * Mark every episode in a season watched (fetches episode list from TMDB).
 */
export async function markTvSeasonWatched(
  _prev: TvProgressState,
  formData: FormData,
): Promise<TvProgressState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to track progress." };
  }

  const show = parseShowId(formData);
  if ("error" in show) return { error: show.error };

  const seasonNumber = Number(formData.get("seasonNumber"));
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    return { error: "Invalid season." };
  }

  const season = await getTvSeason(show.showId, seasonNumber);
  if (!season?.episodes?.length) {
    return { error: "Couldn’t load that season." };
  }

  const userId = session.user.id;
  const now = new Date();
  const rows = season.episodes
    .filter((episode) => Number.isInteger(episode.episode_number))
    .map((episode) => ({
      userId,
      showId: show.showId,
      seasonNumber,
      episodeNumber: episode.episode_number,
      watchedAt: now,
    }));

  if (rows.length === 0) {
    return { error: "No episodes in this season." };
  }

  await prisma.tvEpisodeWatch.createMany({
    data: rows,
    skipDuplicates: true,
  });

  revalidateShow(show.showId);
  return { success: "Season marked watched." };
}

/**
 * Clear all episode watches for one season of a show.
 */
export async function clearTvSeasonProgress(
  _prev: TvProgressState,
  formData: FormData,
): Promise<TvProgressState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to track progress." };
  }

  const show = parseShowId(formData);
  if ("error" in show) return { error: show.error };

  const seasonNumber = Number(formData.get("seasonNumber"));
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    return { error: "Invalid season." };
  }

  await prisma.tvEpisodeWatch.deleteMany({
    where: {
      userId: session.user.id,
      showId: show.showId,
      seasonNumber,
    },
  });

  revalidateShow(show.showId);
  return { success: "Season progress cleared." };
}
