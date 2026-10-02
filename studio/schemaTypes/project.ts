import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { ImagesIcon } from "@sanity/icons/Images";
import { BatchMediaUploadInput } from "../components/BatchMediaUploadInput";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ImagesIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Shown in the caption, e.g. “Still Life”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Shown after the dash, e.g. “Art Direction”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "media",
      title: "Images & videos",
      type: "array",
      description:
        "Drag to reorder. Use “Upload multiple images or videos” to add several at once. Up to three items show side by side on desktop; more scroll sideways.",
      options: { layout: "grid" },
      components: { input: BatchMediaUploadInput },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Describe the image for screen readers and search engines.",
            }),
          ],
        }),
        defineArrayMember({ type: "video" }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "role", first: "media.0", firstPoster: "media.0.poster" },
    prepare: ({ title, subtitle, first, firstPoster }) => ({
      title,
      subtitle,
      media: first?._type === "image" ? first : (firstPoster ?? ImagesIcon),
    }),
  },
});
