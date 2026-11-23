const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const site = {
  name: "Margin",
  url: new URL(configuredUrl).origin,
  description:
    "Notes on digital craft, deliberate living, and the small things that add up. An independent journal by Alex Morgan.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
  author: {
    name: "Alex Morgan",
    role: "Writer, maker & curious human",
    bio: "Exploring digital craft, building small things, and making room for a more considered life.",
  },
};

export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: short ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
