import * as React from "react";
import { createPortal } from "react-dom";
import { Document, Page } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, FileText, Maximize2 } from "lucide-react";

/** Worker is configured once in `src/lib/pdfWorkerSetup.ts` (imported from `main.tsx`). */

/** CSS scale applied on double-click (transform-origin = click point). */
const ZOOM_SCALE = 2.25;

/** Pixels pointer must move before pan starts (avoids pan stealing double-click). */
const DRAG_THRESHOLD_PX = 6;
const DRAG_THRESHOLD_SQ = DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;

export type PdfFlipViewerProps = {
  fileUrl: string;
  title?: string;
  onDownload?: () => void;
  /** Opens dedicated wide viewer (same pattern as student app full-width PDF route). */
  onFullWidth?: () => void;
  maxPageWidth?: number;
  /** Max height of the flipbook viewport (px). Defaults to 820. */
  viewerHeightCap?: number;
  className?: string;
  /** When true, pdf.js loads the URL with credentials (cookies). Default false for typical cross-origin `/Uploads/`. */
  withCredentials?: boolean;
};

/** Minimal magnifier icon (Google-Docs–style), ~18px — used as custom follow cursor (always black for visibility on pages). */
function MagnifierCursorGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="10" cy="10" r="6.5" stroke="#000000" strokeWidth="1.75" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#000000" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="#000000" strokeWidth="1.25" strokeLinecap="round" opacity={0.45} />
      <line x1="10" y1="7" x2="10" y2="13" stroke="#000000" strokeWidth="1.25" strokeLinecap="round" opacity={0.45} />
    </svg>
  );
}

const FlipPage = React.forwardRef<
  HTMLDivElement,
  {
    pageNumber: number;
    slotWidth: number;
    slotHeight: number;
  }
>(({ pageNumber, slotWidth, slotHeight }, ref) => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");
  const [scale, setScale] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  const [cursorPos, setCursorPos] = React.useState<{ x: number; y: number } | null>(null);
  const [hoveringSlot, setHoveringSlot] = React.useState(false);

  const dragSessionRef = React.useRef<{
    pointerId: number;
    panActive: boolean;
    startClient: { x: number; y: number };
    startPan: { x: number; y: number };
    el: HTMLElement;
  } | null>(null);
  const panRafRef = React.useRef<number | null>(null);
  const pendingPanRef = React.useRef<{ x: number; y: number } | null>(null);

  const cancelPanRaf = React.useCallback(() => {
    if (panRafRef.current != null) {
      cancelAnimationFrame(panRafRef.current);
      panRafRef.current = null;
    }
  }, []);

  const flushPendingPan = React.useCallback(() => {
    panRafRef.current = null;
    const p = pendingPanRef.current;
    if (p) {
      setPan(p);
      pendingPanRef.current = null;
    }
  }, []);

  const resetZoomAndPan = React.useCallback(() => {
    const d = dragSessionRef.current;
    if (d) {
      try {
        d.el.releasePointerCapture(d.pointerId);
      } catch {
        /* already released */
      }
    }
    dragSessionRef.current = null;
    cancelPanRaf();
    pendingPanRef.current = null;
    setScale(1);
    setIsZoomed(false);
    setOrigin("50% 50%");
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [cancelPanRaf]);

  const releaseDragSession = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragSessionRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      try {
        d.el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      cancelPanRaf();
      if (pendingPanRef.current) {
        setPan(pendingPanRef.current);
        pendingPanRef.current = null;
      }
      dragSessionRef.current = null;
      setIsDragging(false);
    },
    [cancelPanRaf],
  );

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const showMagnifierCursor = !isZoomed && hoveringSlot && typeof document !== "undefined";

  const onMouseMoveSlot = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) return;
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, [isZoomed]);

  const onMouseEnterSlot = React.useCallback(() => {
    if (!isZoomed) setHoveringSlot(true);
  }, [isZoomed]);

  const onMouseLeaveSlot = React.useCallback(() => {
    setHoveringSlot(false);
    setCursorPos(null);
  }, []);

  const handleDoubleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isZoomed) {
        resetZoomAndPan();
        return;
      }

      cancelPanRaf();
      pendingPanRef.current = null;
      const d = dragSessionRef.current;
      if (d) {
        try {
          d.el.releasePointerCapture(d.pointerId);
        } catch {
          /* noop */
        }
        dragSessionRef.current = null;
        setIsDragging(false);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      setPan({ x: 0, y: 0 });
      setOrigin(`${ox}px ${oy}px`);
      setScale(ZOOM_SCALE);
      setIsZoomed(true);
    },
    [isZoomed, resetZoomAndPan, cancelPanRaf],
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed || e.button !== 0) return;
      e.stopPropagation();
      cancelPanRaf();
      pendingPanRef.current = null;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragSessionRef.current = {
        pointerId: e.pointerId,
        panActive: false,
        startClient: { x: e.clientX, y: e.clientY },
        startPan: { x: pan.x, y: pan.y },
        el: e.currentTarget,
      };
    },
    [isZoomed, pan.x, pan.y, cancelPanRaf],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragSessionRef.current;
      if (!d || e.pointerId !== d.pointerId || !isZoomed) return;
      const dx = e.clientX - d.startClient.x;
      const dy = e.clientY - d.startClient.y;
      if (!d.panActive) {
        if (dx * dx + dy * dy < DRAG_THRESHOLD_SQ) return;
        d.panActive = true;
        setIsDragging(true);
      }
      const nx = d.startPan.x + dx;
      const ny = d.startPan.y + dy;
      pendingPanRef.current = { x: nx, y: ny };
      if (panRafRef.current == null) {
        panRafRef.current = requestAnimationFrame(flushPendingPan);
      }
    },
    [isZoomed, flushPendingPan],
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      releaseDragSession(e);
    },
    [releaseDragSession],
  );

  React.useEffect(() => {
    if (!isZoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetZoomAndPan();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isZoomed, resetZoomAndPan]);

  React.useEffect(() => () => cancelPanRaf(), [cancelPanRaf]);

  const slotCursorClass = !isZoomed ? "cursor-none" : isDragging ? "cursor-grabbing" : "cursor-grab";

  const magnifierPortal =
    showMagnifierCursor && cursorPos
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[9999] text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: "translate(4px, 4px)",
            }}
            aria-hidden
          >
            <MagnifierCursorGlyph />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {magnifierPortal}
      <div
        ref={setRefs}
        role="button"
        tabIndex={0}
        aria-label={
          isZoomed
            ? `Page ${pageNumber}, zoomed — double-click or Escape to zoom out, drag to pan`
            : `Page ${pageNumber} — double-click to zoom in at pointer`
        }
        aria-pressed={isZoomed}
        onDoubleClick={handleDoubleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseMove={onMouseMoveSlot}
        onMouseEnter={onMouseEnterSlot}
        onMouseLeave={onMouseLeaveSlot}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isZoomed) {
              resetZoomAndPan();
            } else {
              cancelPanRaf();
              pendingPanRef.current = null;
              setPan({ x: 0, y: 0 });
              setOrigin("50% 50%");
              setScale(ZOOM_SCALE);
              setIsZoomed(true);
            }
          }
        }}
        style={{
          width: slotWidth,
          height: slotHeight,
          overflow: "hidden",
          position: "relative",
          touchAction: isZoomed ? "none" : undefined,
        }}
        className={`bg-white select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${slotCursorClass}`}
      >
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
            willChange: isDragging ? "transform" : undefined,
          }}
        >
          <div
            style={{
              width: slotWidth,
              transform: `scale(${scale})`,
              transformOrigin: origin,
              transition: isDragging ? "none" : "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
          {isZoomed ? (
            <div
              style={{
                width: slotWidth,
                height: slotHeight,
                overflow: "hidden",
              }}
            >
              {/*
                Render the page at ZOOM_SCALE × width, then scale down by 1/ZOOM_SCALE so the
                layout stays slot-sized while the canvas has enough pixels; outer scale(ZOOM_SCALE)
                then magnifies without upscaling a low-res bitmap (avoids blurry text).
              */}
              <div
                style={{
                  width: slotWidth * ZOOM_SCALE,
                  transform: `scale(${1 / ZOOM_SCALE})`,
                  transformOrigin: "top left",
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={slotWidth * ZOOM_SCALE}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading=""
                />
              </div>
            </div>
          ) : (
            <Page
              pageNumber={pageNumber}
              width={slotWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading=""
            />
          )}
          </div>
        </div>
      </div>
    </>
  );
});
FlipPage.displayName = "FlipPage";

export default function PdfFlipViewer({
  fileUrl,
  title,
  onDownload,
  onFullWidth,
  maxPageWidth = 440,
  viewerHeightCap = 820,
  className = "",
  withCredentials = false,
}: PdfFlipViewerProps) {
  const [numPages, setNumPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [pageWidth, setPageWidth] = React.useState(0);

  const documentFile = React.useMemo(() => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("blob:") || fileUrl.startsWith("data:")) return fileUrl;
    if (withCredentials) return { url: fileUrl, withCredentials: true as const };
    return fileUrl;
  }, [fileUrl, withCredentials]);

  React.useEffect(() => {
    setLoadError(false);
    setIsLoading(true);
    setNumPages(0);
    setCurrentPage(0);
  }, [fileUrl]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const PAGE_ASPECT = 1.414;
    const VERTICAL_PADDING = 48;
    const HORIZONTAL_PADDING = 40;

    const measure = () => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const availableW = el.clientWidth;
      const measuredH = el.clientHeight;
      const availableH =
        measuredH > 120 ? measuredH - VERTICAL_PADDING : viewerHeightCap - VERTICAL_PADDING;

      const maxWFromWidth = Math.max(Math.floor((availableW - HORIZONTAL_PADDING) / 2), 200);
      const maxWFromHeight = Math.max(Math.floor(availableH / PAGE_ASPECT), 140);

      setPageWidth(Math.min(maxWFromWidth, maxWFromHeight, maxPageWidth));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [maxPageWidth, viewerHeightCap, fileUrl]);

  const pageHeight = pageWidth > 0 ? Math.round(pageWidth * 1.414) : 0;

  const basePageWidth = pageWidth > 0 ? Math.max(100, pageWidth) : 0;
  const basePageHeight = pageHeight > 0 ? Math.max(140, pageHeight) : 0;

  const flipMaxHeight = basePageHeight > 0 ? basePageHeight : 640;
  const bookAreaHeight = basePageHeight > 0 ? basePageHeight + 48 : 400;

  const flipNext = React.useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const flipPrev = React.useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const isFirstSpread = currentPage === 0;
  const isLastSpread = currentPage >= numPages - 2;

  const totalSpreads = numPages > 0 ? Math.ceil(numPages / 2) : 0;
  const currentSpread = Math.ceil((currentPage + 1) / 2);

  React.useEffect(() => {
    if (numPages <= 0 || isLoading) return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const el = target;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return Boolean(el.closest("input, textarea, select, [contenteditable='true']"));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;

      if (e.key === "ArrowLeft" && !isFirstSpread) {
        e.preventDefault();
        flipPrev();
      } else if (e.key === "ArrowRight" && !isLastSpread) {
        e.preventDefault();
        flipNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [numPages, isLoading, isFirstSpread, isLastSpread, flipPrev, flipNext]);
  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/80 border-b border-border">
        <div className="flex items-center gap-2 text-foreground min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium truncate">{title ?? "PDF document"}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 ml-2 shrink-0">
          {numPages > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentSpread} / {totalSpreads}
            </span>
          ) : null}
          {numPages > 0 && !isLoading ? (
            <span className="text-xs text-muted-foreground hidden sm:inline max-w-[16rem] truncate" title="Tip">
              Double-click to zoom · double-click again or Escape to reset · drag to pan when zoomed
            </span>
          ) : null}
          {onFullWidth ? (
            <Button
              size="sm"
              type="button"
              className="h-7 text-xs rounded-full gap-1 bg-gradient-to-r from-[#c0f22c] to-[#91c71f] hover:opacity-90 text-zinc-950 border-none shadow-md shadow-lime-500/20"
              onClick={onFullWidth}
            >
              <Maximize2 className="h-3 w-3" />
              Full view
            </Button>
          ) : null}
          {onDownload ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs rounded-full gap-1"
              type="button"
              onClick={onDownload}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          ) : null}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex w-full min-h-0 flex-1 items-start justify-center overflow-visible bg-muted px-1 py-3"
        style={{
          minHeight: basePageHeight > 0 ? bookAreaHeight : viewerHeightCap,
        }}
      >
        {isLoading && !loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-muted">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading PDF…</p>
          </div>
        ) : null}

        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-muted px-4">
            <p className="text-sm text-destructive text-center font-medium">Failed to load PDF.</p>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              If the file opens in a new tab but not here, enable CORS on static files or use a dev proxy for{" "}
              <code className="text-[10px] bg-background px-1 rounded border">/Uploads</code>.
            </p>
          </div>
        ) : null}

        {numPages > 0 && !isLoading ? (
          <>
            <button
              type="button"
              onClick={flipPrev}
              disabled={isFirstSpread}
              aria-label="Previous page"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={flipNext}
              disabled={isLastSpread}
              aria-label="Next page"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        ) : null}

        {documentFile ? (
          <Document
            key={fileUrl}
            file={documentFile}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setIsLoading(false);
              setLoadError(false);
            }}
            onLoadError={(err) => {
              console.error("[PdfFlipViewer] PDF load error:", err);
              setLoadError(true);
              setIsLoading(false);
            }}
            loading=""
          >
            {numPages > 0 && basePageWidth > 0 && basePageHeight > 0 ? (
              <div className="flex w-full max-w-full items-start justify-center overflow-visible py-2 drop-shadow-2xl">
                <HTMLFlipBook
                  ref={bookRef}
                  width={basePageWidth}
                  height={basePageHeight}
                  className=""
                  style={{}}
                  size="fixed"
                  minWidth={100}
                  maxWidth={Math.max(maxPageWidth, basePageWidth)}
                  minHeight={140}
                  maxHeight={flipMaxHeight}
                  startPage={0}
                  drawShadow
                  flippingTime={650}
                  usePortrait={false}
                  startZIndex={10}
                  autoSize={false}
                  maxShadowOpacity={0.5}
                  showCover={false}
                  mobileScrollSupport
                  clickEventForward
                  useMouseEvents={false}
                  swipeDistance={30}
                  showPageCorners={false}
                  disableFlipByClick
                  onFlip={(e: { data: number }) => setCurrentPage(e.data)}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <FlipPage
                      key={i}
                      pageNumber={i + 1}
                      slotWidth={basePageWidth}
                      slotHeight={basePageHeight}
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            ) : null}
          </Document>
        ) : null}
      </div>

      {numPages > 0 && !isLoading ? (
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-card border-t border-border">
          <Button variant="outline" size="sm" className="rounded-full gap-1 h-8" type="button" disabled={isFirstSpread} onClick={flipPrev}>
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            Pages {currentPage + 1}
            {currentPage + 1 < numPages ? `–${Math.min(currentPage + 2, numPages)}` : ""} of {numPages}
          </span>

          <Button variant="outline" size="sm" className="rounded-full gap-1 h-8" type="button" disabled={isLastSpread} onClick={flipNext}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
