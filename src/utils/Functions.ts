export const getBasename = () => "";

export const ImageUrl = (image: string) => {
  const name = image.replace(/^\/+/, "");
  return `/images/${encodeURIComponent(name)}`;
};

export const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "U";
