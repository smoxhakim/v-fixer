"use client";

import { useEffect } from "react";
import { prepare, layout } from "@chenglou/pretext";

/**
 * usePretextHeights — Pretext-driven uniform-height text management.
 *
 * Marks any DOM element with `data-pretext` for measurement. After fonts
 * have loaded, Pretext measures each element's text content against its
 * computed font + width, then sets `style.height` to the laid-out height.
 *
 * Elements that share `data-pretext-group="some-key"` all snap to the max
 * height in the group — used to keep product-card titles aligned in a grid
 * even when individual titles wrap to 1 vs 2 lines.
 *
 * Re-measures on window resize (ResizeObserver on document.body).
 * Re-measures on inline text edits when the element is contenteditable.
 *
 * Call once high in the component tree (page or layout). Idempotent —
 * calling from multiple places is safe but redundant.
 *
 * Timing: the hook awaits `document.fonts.ready` before the first measure.
 * Measuring against the fallback font would produce heights that snap
 * during the swap-in window and cause layout jump.
 */
export function usePretextHeights(): void {
  useEffect(() => {
    let cancelled = false;
    const handles = new WeakMap<HTMLElement, ReturnType<typeof prepare>>();
    const mutationObservers: MutationObserver[] = [];
    let resizeObserver: ResizeObserver | null = null;

    function getElements(): HTMLElement[] {
      return Array.from(
        document.querySelectorAll<HTMLElement>("[data-pretext]"),
      );
    }

    function readFont(el: HTMLElement): string {
      const cs = getComputedStyle(el);
      const style = cs.fontStyle || "normal";
      const weight = cs.fontWeight || "400";
      const size = cs.fontSize || "16px";
      const lineHeight =
        cs.lineHeight && cs.lineHeight !== "normal" ? cs.lineHeight : "1.5";
      const family = cs.fontFamily || "sans-serif";
      return `${style} normal ${weight} ${size}/${lineHeight} ${family}`;
    }

    function readLineHeight(el: HTMLElement): number {
      const cs = getComputedStyle(el);
      if (cs.lineHeight === "normal") {
        return parseFloat(cs.fontSize) * 1.5;
      }
      const lh = parseFloat(cs.lineHeight);
      return Number.isFinite(lh) ? lh : parseFloat(cs.fontSize) * 1.5;
    }

    function readContentWidth(el: HTMLElement): number {
      const cs = getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      return Math.max(0, el.clientWidth - pl - pr);
    }

    function rebuildHandles(): void {
      for (const el of getElements()) {
        const text = el.textContent?.trim() ?? "";
        handles.set(el, prepare(text, readFont(el)));
      }
    }

    function relayout(): void {
      const elements = getElements();
      const naturalHeights = new Map<HTMLElement, number>();

      // Pass 1: each element's natural height at its current rendered width.
      for (const el of elements) {
        const handle = handles.get(el);
        if (!handle) continue;
        const width = readContentWidth(el);
        if (width <= 0) {
          naturalHeights.set(el, 0);
          continue;
        }
        const { height } = layout(handle, width, readLineHeight(el));
        naturalHeights.set(el, height);
      }

      // Pass 2: per group, the maximum height.
      const groupMax = new Map<string, number>();
      for (const el of elements) {
        const group = el.dataset.pretextGroup;
        if (!group) continue;
        const h = naturalHeights.get(el) ?? 0;
        if (h > (groupMax.get(group) ?? 0)) groupMax.set(group, h);
      }

      // Pass 3: apply. Grouped elements get the group max; ungrouped
      // elements get their own natural height.
      for (const el of elements) {
        const naturalH = naturalHeights.get(el) ?? 0;
        const group = el.dataset.pretextGroup;
        const applied = group ? (groupMax.get(group) ?? naturalH) : naturalH;
        el.style.height = `${applied}px`;
      }
    }

    async function init(): Promise<void> {
      // Wait for fonts. Critical — measurement before fonts load would use
      // next/font's fallback metric font and produce heights that snap on
      // swap-in, causing visible layout jump.
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;

      rebuildHandles();
      relayout();

      // ResizeObserver on body — catches every viewport-width change.
      resizeObserver = new ResizeObserver(() => {
        if (!cancelled) relayout();
      });
      resizeObserver.observe(document.body);

      // MutationObserver per contenteditable element — re-prepare and
      // relayout on inline text edits.
      for (const el of getElements()) {
        if (!el.isContentEditable) continue;
        const mo = new MutationObserver(() => {
          const text = el.textContent?.trim() ?? "";
          handles.set(el, prepare(text, readFont(el)));
          relayout();
        });
        mo.observe(el, {
          characterData: true,
          subtree: true,
          childList: true,
        });
        mutationObservers.push(mo);
      }
    }

    init();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mutationObservers.forEach((mo) => mo.disconnect());
      // Clear inline heights so the page falls back to natural layout
      // if the hook unmounts.
      for (const el of getElements()) {
        el.style.height = "";
      }
    };
  }, []);
}
