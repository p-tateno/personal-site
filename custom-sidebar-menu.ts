import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

// Lucide Menu / X — ISC License, Copyright (c) 2026 Lucide Icons and Contributors.
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

export const sidebarMenuScript = `(() => {
  const root = document.documentElement;
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="menu-lines" d="M4 6h16M4 12h16M4 18h16"/><path class="menu-close" d="m6 6 12 12M6 18 18 6"/></svg>';
  function setOpen(open, restoreFocus = false) {
    root.classList.toggle("sidebar-menu-open", open);
    const sidebar = document.querySelector(".sidebar.left");
    const button = document.getElementById("sidebar-menu-toggle");
    if (sidebar) { sidebar.inert = !open; sidebar.setAttribute("aria-hidden", String(!open)); }
    if (button) {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      if (restoreFocus) button.focus();
    }
  }
  function setup() {
    const sidebar = document.querySelector(".sidebar.left");
    if (!sidebar) return;
    sidebar.id = "site-sidebar-menu";
    if (!document.getElementById("sidebar-menu-toggle")) {
      const button = document.createElement("button");
      button.id = "sidebar-menu-toggle";
      button.type = "button";
      button.setAttribute("aria-controls", sidebar.id);
      button.innerHTML = icon;
      document.body.appendChild(button);
    }
    if (!document.getElementById("sidebar-menu-backdrop")) {
      const backdrop = document.createElement("div");
      backdrop.id = "sidebar-menu-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }
    root.classList.add("sidebar-menu-ready");
    setOpen(false);
  }
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("#sidebar-menu-toggle")) {
      setOpen(!root.classList.contains("sidebar-menu-open"), true);
    } else if (event.target.closest("#sidebar-menu-backdrop")) {
      setOpen(false, true);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!root.classList.contains("sidebar-menu-open")) return;
    if (event.key === "Escape") { setOpen(false, true); return; }
    if (event.key !== "Tab") return;
    const button = document.getElementById("sidebar-menu-toggle");
    const sidebar = document.querySelector(".sidebar.left");
    const controls = [button, ...sidebar.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
      .filter((node) => node && !node.disabled && node.getClientRects().length);
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
  });
  document.addEventListener("nav", setup);
  setup();
})();`

export const CustomSidebarMenu: QuartzTransformerPlugin = () => ({
  name: "CustomSidebarMenu",
  externalResources() {
    return {
      js: [{ contentType: "inline", loadTime: "afterDOMReady", spaPreserve: true, script: sidebarMenuScript }],
      css: [{ inline: true, content: `
        #sidebar-menu-toggle {
          position: fixed; top: 16px; left: 16px; z-index: 10002;
          display: grid; place-items: center; width: 44px; height: 44px;
          padding: 0; border: 1px solid var(--lightgray); border-radius: 8px;
          color: var(--dark); background: var(--light); cursor: pointer;
        }
        #sidebar-menu-toggle:focus-visible { outline: 2px solid var(--secondary); outline-offset: 3px; }
        #sidebar-menu-toggle .menu-close { display: none; }
        .sidebar-menu-open #sidebar-menu-toggle .menu-lines { display: none; }
        .sidebar-menu-open #sidebar-menu-toggle .menu-close { display: initial; }
        #sidebar-menu-backdrop { display: none; }
        .sidebar-menu-open #sidebar-menu-backdrop {
          display: block; position: fixed; inset: 0; z-index: 10000;
          background: rgb(0 0 0 / 15%);
        }
        html.sidebar-menu-open { overflow: hidden; }
        html.sidebar-menu-ready .page > #quartz-body > .sidebar.left {
          position: fixed; inset: 0 auto 0 0; z-index: 10001;
          width: min(320px, calc(100vw - 24px)); height: 100dvh;
          display: flex; flex-direction: column; align-items: stretch; gap: 1.2rem;
          padding: 80px 24px 32px; margin: 0; box-sizing: border-box;
          overflow-y: auto; background: var(--light);
          border-right: 1px solid var(--lightgray);
          transform: translateX(-100%); visibility: hidden; pointer-events: none;
        }
        html.sidebar-menu-open .page > #quartz-body > .sidebar.left {
          transform: translateX(0); visibility: visible; pointer-events: auto;
        }
        /* スマートフォンでも独自メニュー内にフォルダ一覧を表示します。 */
        html.sidebar-menu-ready .sidebar.left .explorer { width: 100%; flex: 0 0 auto; overflow: visible; }
        html.sidebar-menu-ready .sidebar.left .explorer .mobile-explorer { display: none; }
        html.sidebar-menu-ready .sidebar.left .explorer .desktop-explorer { display: flex; }
        html.sidebar-menu-ready .sidebar.left .explorer .explorer-content {
          position: static; width: 100%; max-width: 100%; height: auto; max-height: none;
          transform: none; visibility: visible; padding: 0; overflow: visible;
        }
        @media (max-width: 1200px) {
          html.sidebar-menu-ready .page > #quartz-body {
            grid-template-columns: minmax(0, 850px); justify-content: center;
            grid-template-areas: "grid-header" "grid-center" "grid-footer";
          }
        }
        @media (max-width: 800px) {
          html.sidebar-menu-ready .page > #quartz-body > .page-header { margin-top: 80px; }
        }
      ` }],
    }
  },
})
