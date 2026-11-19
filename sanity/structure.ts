import { CogIcon } from "@sanity/icons/Cog";
import { UserIcon } from "@sanity/icons/User";
import type { StructureResolver } from "sanity/structure";

/** Studio sidebar: the two singletons first, then each collection, in the order an editor thinks about them. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website content")
    .items([
      S.listItem().title("Profile & biography").icon(UserIcon).id("profile")
        .child(S.document().schemaType("profile").documentId("profile").title("Profile & biography")),
      S.listItem().title("Site settings & homepage").icon(CogIcon).id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings & homepage")),
      S.divider(),
      S.documentTypeListItem("news").title("News & perspectives"),
      S.documentTypeListItem("publication").title("Publications"),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("researchTheme").title("Research themes"),
      S.documentTypeListItem("book").title("Books"),
      S.documentTypeListItem("person").title("People"),
      S.documentTypeListItem("award").title("Awards"),
    ]);
