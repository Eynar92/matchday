import type { Team, Match, Stat, PerformanceBarData } from "@/lib/types";
import type { Event, Competitor, Detail } from "./types";

function getHomeCompetitor(event: Event): Competitor {
  return event.competitions[0].competitors.find((c) => c.homeAway === "home")!;
}

function getAwayCompetitor(event: Event): Competitor {
  return event.competitions[0].competitors.find((c) => c.homeAway === "away")!;
}

function mapTeam(competitor: Competitor): Team {
  return {
    src: competitor.team.logo,
    name: competitor.team.displayName,
  };
}

function calcPercent(home: number, away: number): number {
  const total = home + away;
  if (total === 0) return 50;
  return Math.round((home / total) * 100);
}

function parseStatValue(value: string): number {
  return Number.parseFloat(value) || 0;
}

export function mapToHeroEvent(event: Event): {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  liveTime: string;
  isLive: boolean;
} {
  const home = getHomeCompetitor(event);
  const away = getAwayCompetitor(event);

  return {
    homeTeam: mapTeam(home),
    awayTeam: mapTeam(away),
    homeScore: Number.parseInt(home.score, 10) || 0,
    awayScore: Number.parseInt(away.score, 10) || 0,
    liveTime: event.status.displayClock,
    isLive: event.status.type.state === "in",
  };
}

export function mapToMatchEvents(event: Event): Array<{
  icon: string;
  text: string;
  iconClass?: string;
  muted?: boolean;
}> {
  const homeId = getHomeCompetitor(event).id;

  return event.competitions[0].details
    .filter((d) => d.scoringPlay)
    .slice(0, 2)
    .map((d) => {
      const playerName = d.athletesInvolved?.[0]?.shortName ?? "";
      const time = d.clock.displayValue;
      const isHome = d.team.id === homeId;

      if (d.yellowCard) {
        return {
          icon: "Square",
          text: `${time} ${playerName}`,
          iconClass: "text-yellow-500",
          muted: !isHome,
        };
      }

      if (d.redCard) {
        return {
          icon: "Square",
          text: `${time} ${playerName}`,
          iconClass: "text-destructive",
          muted: !isHome,
        };
      }

      return {
        icon: "Soccer",
        text: `${time} ${playerName}`,
        muted: !isHome,
      };
    });
}

export function mapToMatch(event: Event): Match {
  const home = getHomeCompetitor(event);
  const away = getAwayCompetitor(event);

  return {
    date: event.date,
    homeTeam: mapTeam(home),
    awayTeam: mapTeam(away),
  };
}

export function mapToResult(event: Event): {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  performances: PerformanceBarData[];
  stats: Stat[];
} {
  const home = getHomeCompetitor(event);
  const away = getAwayCompetitor(event);
  const details = event.competitions[0].details;

  const homeStats = home.statistics;
  const awayStats = away.statistics;

  const getStat = (stats: typeof homeStats, name: string) =>
    stats.find((s) => s.name === name);

  const homePossession = parseStatValue(getStat(homeStats, "possessionPct")?.displayValue ?? "50");
  const awayPossession = parseStatValue(getStat(awayStats, "possessionPct")?.displayValue ?? "50");
  const homeShots = parseStatValue(getStat(homeStats, "totalShots")?.displayValue ?? "0");
  const awayShots = parseStatValue(getStat(awayStats, "totalShots")?.displayValue ?? "0");
  const homeSog = parseStatValue(getStat(homeStats, "shotsOnTarget")?.displayValue ?? "0");
  const awaySog = parseStatValue(getStat(awayStats, "shotsOnTarget")?.displayValue ?? "0");
  const homeCorners = parseStatValue(getStat(homeStats, "wonCorners")?.displayValue ?? "0");
  const awayCorners = parseStatValue(getStat(awayStats, "wonCorners")?.displayValue ?? "0");

  const homeYellows = details.filter((d) => d.yellowCard && d.team.id === home.id).length;
  const awayYellows = details.filter((d) => d.yellowCard && d.team.id === away.id).length;
  const homeReds = details.filter((d) => d.redCard && d.team.id === home.id).length;
  const awayReds = details.filter((d) => d.redCard && d.team.id === away.id).length;

  return {
    homeTeam: mapTeam(home),
    awayTeam: mapTeam(away),
    homeScore: Number.parseInt(home.score, 10) || 0,
    awayScore: Number.parseInt(away.score, 10) || 0,
    performances: [
      {
        label: "Possession",
        homeValue: `${homePossession}%`,
        awayValue: `${awayPossession}%`,
        homePercent: Math.round(homePossession),
      },
      {
        label: "Total Shots",
        homeValue: `${homeShots}`,
        awayValue: `${awayShots}`,
        homePercent: calcPercent(homeShots, awayShots),
      },
      {
        label: "Shots on Target",
        homeValue: `${homeSog}`,
        awayValue: `${awaySog}`,
        homePercent: calcPercent(homeSog, awaySog),
      },
      {
        label: "Corners",
        homeValue: `${homeCorners}`,
        awayValue: `${awayCorners}`,
        homePercent: calcPercent(homeCorners, awayCorners),
      },
    ],
    stats: [
      {
        icon: "Square",
        value1: homeYellows,
        value2: awayYellows,
        iconClass: "text-yellow-500",
      },
      {
        icon: "Square",
        value1: homeReds,
        value2: awayReds,
        iconClass: "text-destructive",
      },
    ],
  };
}

export function isEventLive(event: Event): boolean {
  return event.status.type.state === "in";
}

export function isEventPre(event: Event): boolean {
  return event.status.type.state === "pre";
}

export function isEventPost(event: Event): boolean {
  return event.status.type.state === "post";
}
