import { onBeforeUnmount, onMounted, type ComponentPublicInstance } from "vue";

export function useScrollReveal() {
  const elements = new Set<HTMLElement>();
  let observer: IntersectionObserver | undefined;
  let isMounted = false;

  function show(element: HTMLElement): void {
    element.dataset.revealed = "true";
  }

  function observe(element: HTMLElement): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(element);
      return;
    }
    observer?.observe(element);
  }

  function setRevealElement(element: Element | ComponentPublicInstance | null): void {
    if (!(element instanceof HTMLElement)) return;
    elements.add(element);
    if (isMounted) observe(element);
  }

  onMounted(() => {
    isMounted = true;
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target as HTMLElement);
        observer?.unobserve(entry.target);
      }
    }, { threshold: 0.15 });
    elements.forEach(observe);
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { setRevealElement };
}
