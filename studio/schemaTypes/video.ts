import { defineField, defineType } from "sanity";
import { DocumentVideoIcon } from "@sanity/icons/DocumentVideo";
import { VideoInput } from "../components/VideoInput";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "object",
  icon: DocumentVideoIcon,
  components: { input: VideoInput },
  fields: [
    defineField({
      name: "file",
      title: "Video file",
      type: "file",
      description: "MP4 (H.264) plays everywhere. Keep files small: the video plays silently on a loop.",
      options: { accept: "video/mp4,video/webm,video/quicktime" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      description: "Optional still shown before the video starts playing.",
    }),
    defineField({
      name: "alt",
      title: "Description",
      type: "string",
      description: "Describe the video for screen readers and search engines.",
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: { alt: "alt", poster: "poster", filename: "file.asset.originalFilename" },
    prepare: ({ alt, poster, filename }) => ({
      title: alt || filename || "Video",
      subtitle: "Video",
      media: poster ?? DocumentVideoIcon,
    }),
  },
});
