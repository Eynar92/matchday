export interface WorldCupScoreBoardLive {
  leagues: League[];
  events: Event[];
  provider: Provider;
}

export interface Event {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: EventSeason;
  competitions: Competition[];
  status: Status;
  venue: EventVenue;
  links: Link[];
}

export interface Competition {
  id: string;
  uid: string;
  date: string;
  startDate: string;
  attendance: number;
  timeValid: boolean;
  recent: boolean;
  status: Status;
  venue: CompetitionVenue;
  format: Format;
  notes: Note[];
  broadcasts: Broadcast[];
  competitors: Competitor[];
  details: Detail[];
  headlines?: Headline[];
  odds: Array<Odd | null>;
  wasSuspended: boolean;
  playByPlayAvailable: boolean;
}

export interface Competitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: string;
  winner: boolean;
  advance?: boolean;
  score: string;
  team: CompetitorTeam;
  statistics: Statistic[];
  shootoutScore?: number;
}

export interface Statistic {
  name: string;
  abbreviation: string;
  displayValue: string;
}

export interface CompetitorTeam {
  id: string;
  uid: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  name: string;
  location: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logo: string;
  links: Link[];
}

export interface Detail {
  type: DetailType;
  clock: Clock;
  team: DetailTeam;
  scoreValue: number;
  scoringPlay: boolean;
  redCard: boolean;
  yellowCard: boolean;
  penaltyKick: boolean;
  ownGoal: boolean;
  shootout: boolean;
  athletesInvolved?: AthleteInvolved[];
}

export interface AthleteInvolved {
  id: string;
  displayName: string;
  shortName: string;
  fullName: string;
  jersey: string;
  team: DetailTeam;
  position: string;
  headshot?: string;
}

export interface DetailTeam {
  id: string;
}

export interface DetailType {
  id: string;
  text: string;
}

export interface Clock {
  value: number;
  displayValue: string;
}

export interface Format {
  regulation: Regulation;
}

export interface Regulation {
  periods: number;
}

export interface Broadcast {
  market: string;
  names: string[];
}

export interface Headline {
  description: string;
  type: string;
  shortLinkText: string;
}

export interface Note {
  text: string;
  headline: string;
  type: string;
}

export interface Odd {
  provider: Provider;
  details: string;
}

export interface Provider {
  id: string;
  name: string;
  priority: number;
  displayName: string;
  logos: ProviderLogo[];
}

export interface ProviderLogo {
  href: string;
  rel: string[];
}

export interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

export interface StatusType {
  id: string;
  name: string;
  state: string;
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
}

export interface CompetitionVenue {
  id: string;
  fullName: string;
  address: Address;
}

export interface Address {
  city: string;
  country: string;
}

export interface EventVenue {
  displayName: string;
}

export interface EventSeason {
  year: number;
  type: number;
  slug: string;
}

export interface Link {
  rel: string[];
  href: string;
  text: string;
  shortText?: string;
  isExternal: boolean;
  isPremium: boolean;
  isHidden?: boolean;
  language?: string;
}

export interface League {
  id: string;
  uid: string;
  name: string;
  abbreviation: string;
  slug: string;
  season: LeagueSeason;
  logos: LeagueLogo[];
}

export interface LeagueLogo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
}

export interface LeagueSeason {
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
  type: SeasonType;
}

export interface SeasonType {
  id: string;
  type: number;
  name: string;
  abbreviation: string;
}
