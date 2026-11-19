import type { NewsCategory } from "@/lib/types";

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  publication: "New publication",
  "research-update": "Research update",
  conference: "Conference",
  lecture: "Invited lecture",
  perspective: "Perspective",
  project: "Project announcement",
  award: "Award",
  media: "Media coverage",
};
