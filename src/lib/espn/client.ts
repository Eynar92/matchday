import type { WorldCupScoreBoardLive } from "./types";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getScoreboard(date: string): Promise<WorldCupScoreBoardLive> {
  const res = await fetch(`${BASE_URL}/scoreboard?dates=${date}`);

  if (!res.ok) {
    throw new ApiError(res.status, `ESPN API request failed`);
  }

  return res.json();
}

export async function getScoreboardRange(start: string, end: string): Promise<WorldCupScoreBoardLive> {
  const res = await fetch(`${BASE_URL}/scoreboard?dates=${start}-${end}`);

  if (!res.ok) {
    throw new ApiError(res.status, `ESPN API range request failed`);
  }

  return res.json();
}

export async function getEventSummary(eventId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/summary?event=${eventId}`);

  if (!res.ok) {
    throw new ApiError(res.status, `ESPN API summary request failed`);
  }

  return res.json();
}
