/**
 * pdf.js worker must match the API version bundled with react-pdf.
 *
 * Do NOT use Vite's bundled `pdf.worker.*.mjs` from `?url` in production: many hosts
 * serve those assets with an empty or wrong Content-Type, which breaks module workers.
 *
 * Default: jsDelivr CDN (correct MIME, HTTPS, same version as `pdfjs.version`).
 * Override: set `VITE_PDF_WORKER_SRC` to a full URL (e.g. self-hosted worker with
 * `Content-Type: application/javascript` or `text/javascript`).
 */
import { pdfjs } from "react-pdf";

const explicit = import.meta.env.VITE_PDF_WORKER_SRC?.trim();
const version = pdfjs.version;
const cdnWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

pdfjs.GlobalWorkerOptions.workerSrc = explicit || cdnWorkerSrc;
