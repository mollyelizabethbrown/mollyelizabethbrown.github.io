export type ThemeId =
  | "earth-observation"
  | "food-security"
  | "climate-risk"
  | "applications"
  | "sustainable-food-systems";

export type Verification = {
  status: "verified" | "cv-only" | "needs-review" | "conflict" | "doi-unresolved";
  issues: string[];
};

export type PublicationType =
  | "journal-article"
  | "letter-commentary"
  | "magazine-article"
  | "book-review"
  | "dataset"
  | "report"
  | "book"
  | "book-chapter"
  | "conference-paper"
  | "editorial"
  | "patent";

export type PublicationStatus = "published" | "in-press" | "submitted" | "in-review" | "pending";

export type Publication = {
  id: string;
  type: PublicationType;
  status: PublicationStatus;
  year: number;
  title: string;
  authors: string[];
  container: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  editors?: string | null;
  isbn?: string | null;
  doi: string | null;
  url: string | null;
  cvSection: string;
  themes: ThemeId[];
  featured?: boolean;
  abstract?: string | null;
  verification: Verification;
};

export type Media = {
  id: string;
  file: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  credit: string;
  sourcePage: string;
  license: string;
  licenseUrl?: string | null;
  subjects?: ThemeId[];
};

export type Finding = { doi: string; text: string };

export type Theme = {
  id: ThemeId;
  order: number;
  title: string;
  short: string;
  kicker: string;
  summary: string;
  introduction: string[];
  questions: string[];
  methods: string[];
  findings: Finding[];
  image: Media | null;
};

export type Project = {
  id: string;
  title: string;
  abstract: string;
  goals: string[];
  periodStart: number;
  periodEnd: number | null;
  status: "active" | "completed";
  funder: string;
  program: string | null;
  role: string;
  leadPI: string | null;
  collaborators: string[];
  geography: string[];
  methods: string[];
  themes: ThemeId[];
  publicationDois: string[];
  related?: string[];
  featured: boolean;
};

export type Book = {
  id: string;
  title: string;
  year: number;
  publisher: string;
  isbn: { hardcover?: string | null; softcover?: string | null; ebook?: string | null } | null;
  doi: string | null;
  pages: string | null;
  series: string | null;
  publisherUrl: string | null;
  summary: string;
  cover: { file: string; width?: number; height?: number } | null;
  themes: ThemeId[];
};

export type Appointment = {
  id: string;
  title: string;
  organization: string;
  start: string;
  end: string | null;
  current: boolean;
  featured: boolean;
  category: "academic" | "industry" | "nasa" | "early";
  summary: string;
};

export type Award = { id: string; year: number; title: string; detail: string | null; featured: boolean };
export type Leadership = { id: string; role: string; body: string; period: string | null; featured: boolean };
export type Education = { degree: string; institution: string; year: number; detail: string | null };

export type ChainStep = { step: string; text: string };

export type Profile = {
  name: string;
  postNominal: string;
  designation: string;
  institution: string;
  department: string;
  tagline: string;
  statement: string;
  summary: string;
  biography: string[];
  approach: string[];
  chain: ChainStep[];
  contributions: { title: string; text: string }[];
  education: Education[];
  appointments: Appointment[];
  teaching: { title: string; organization: string; period: string; detail: string | null }[];
  awards: Award[];
  leadership: Leadership[];
  reviewing: string[];
  memberships: { body: string; period: string }[];
  contactAddress: string[];
  portrait: { src: string; alt: string; width: number; height: number } | null;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  category: "pi" | "collaborator" | "postdoc" | "graduate" | "alumni";
  affiliation: string;
  period: string | null;
  bio?: string | null;
  photo?: { src: string; alt: string } | null;
  url?: string | null;
};

export type NewsCategory =
  | "publication"
  | "research-update"
  | "conference"
  | "lecture"
  | "perspective"
  | "project"
  | "award";

export type NewsPost = {
  id: string;
  title: string;
  date: string;
  category: NewsCategory;
  excerpt: string;
  body: unknown; // Portable Text (CMS) or string[] (local)
  image: Media | null;
  relatedPublicationDois: string[];
  relatedProjectIds: string[];
};

export type ExternalLink = { label: string; url: string; kind?: string };

export type Settings = {
  siteTitle: string;
  siteDescription: string;
  hero: Media | null;
  featuredProjectIds: string[];
  featuredPublicationDois: string[];
  earthToDecisionsTitle: string;
  earthToDecisionsText: string;
  links: ExternalLink[];
  contactEmail: string | null;
  cvFileUrl: string | null;
};
