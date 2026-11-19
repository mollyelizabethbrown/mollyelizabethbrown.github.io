import { award, book, news, person, profile, project, publication, researchTheme, siteSettings } from "./documents";
import { figure, linkItem } from "./objects";

export const schemaTypes = [
  // objects
  figure, linkItem,
  // singletons
  profile, siteSettings,
  // collections
  researchTheme, project, publication, book, person, news, award,
];

export const SINGLETONS = ["profile", "siteSettings"] as const;
