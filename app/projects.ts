export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  title: string;
  role: string;
  images: ProjectImage[];
};

export const projects: Project[] = [
  {
    slug: "dom-perignon",
    title: "Dom Perignon The Portrait Campaign",
    role: "Art Direction",
    images: [
      {
        src: "/work/dom-perignon.jpg",
        alt: "Black and white portrait for the Dom Pérignon campaign",
        width: 2539,
        height: 1128,
      },
    ],
  },
  {
    slug: "etudes-studio",
    title: "Etudes Studio Backstage",
    role: "Art Direction, Réalisation",
    images: [
      {
        src: "/work/etudes-1.jpg",
        alt: "White shirt and tie under a cream patent corset",
        width: 825,
        height: 1128,
      },
      {
        src: "/work/etudes-2.jpg",
        alt: "Black leather dress cinched with two belts",
        width: 825,
        height: 1128,
      },
      {
        src: "/work/etudes-3.jpg",
        alt: "Close-up of a model with tousled hair across the face",
        width: 825,
        height: 1128,
      },
    ],
  },
  {
    slug: "still-life",
    title: "Still Life",
    role: "Art Direction",
    images: [
      {
        src: "/work/still-life-1.jpg",
        alt: "Translucent blue Chloé sandal on black",
        width: 820,
        height: 1128,
      },
      {
        src: "/work/still-life-2.jpg",
        alt: "Black Chloé slingback heel with gold-capped stiletto",
        width: 822,
        height: 1128,
      },
      {
        src: "/work/still-life-3.jpg",
        alt: "Tangle of gold chains, pearls and shell charms",
        width: 825,
        height: 1128,
      },
    ],
  },
  {
    slug: "seance-de-travail",
    title: "Séance de Travail Photographed by Sofiane Lahcen",
    role: "Art Direction",
    images: [
      {
        src: "/work/seance-de-travail.jpg",
        alt: "Open magazine spread from Séance de Travail",
        width: 1728,
        height: 1149,
      },
    ],
  },
];
