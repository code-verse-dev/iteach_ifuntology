const { hostname } = window.location;

const servers = {
  local: "http://localhost:3030",
  live: "https://api.iteach-ifuntology.com",
};

function normalizeApiBase(raw: string | undefined): string {
  if (raw == null) return "";
  return raw.trim().replace(/\/+$/, "");
}

const viteApi = normalizeApiBase(import.meta.env.VITE_API_URL as string | undefined);

let URL = viteApi;
if (!URL) {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes("local")
  ) {
    URL = servers.local;
  } else {
    URL = servers.live;
  }
}

export const SOCKET_URL = URL;
export const UPLOADS_URL = URL ? `${URL}/Uploads/` : "/Uploads/";
export const BASE_URL = URL ? `${URL}/api` : "/api";
export const PUBLIC_URL = "/";
export const WORKFORCE_EXPLORATION_FORM_PDF =
  "https://ifuntology.com/pdfs/iFuntology-Career-Exploration.pdf";
export const IFUNTOLOGY_GLOSSARY_PDF =
  "https://ifuntology.com/pdfs/iFuntology-Glossary.pdf";
export const CAREER_SUCCESS_PLANNER_PDF =
  "https://ifuntology.com/pdfs/iFuntology_Career_Success_Planner.pdf";
export const FUNTOLOGY_BRAIDING_PDF =
  "https://ifuntology.com/pdfs/Funtology-Braiding.pdf";
export const CLASSROOM_KITS_URL =
  "https://funtologyenrichmentsupplies.com/interactive-science-kits/";
