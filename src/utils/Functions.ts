export const getBasename = () => {
  const { hostname } = window.location;
  let basename = "";
  if (hostname.includes("react.customdev.solutions")) {
    basename = "/iteach_ifuntology/";
  }
  return basename;
};

export const ImageUrl = (image: string) => {
  const name = image.replace(/^\/+/, "");
  return `/images/${encodeURIComponent(name)}`;
};

export const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "U";
