const activeScrollLocks = new Set<string>();
const DEFAULT_SCROLL_LOCK_SOURCE = "default";

let originalBodyOverflow = "";
let originalBodyPaddingRight = "";
let originalBodyOverscrollBehavior = "";

export const lockScroll = (source = DEFAULT_SCROLL_LOCK_SOURCE) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (activeScrollLocks.has(source)) {
    return;
  }

  if (activeScrollLocks.size === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    originalBodyOverscrollBehavior = document.body.style.overscrollBehavior;

    const scrollBarGap =
      window.innerWidth - document.documentElement.clientWidth;
    const shouldCompensateScrollbar =
      scrollBarGap > 0 && window.matchMedia("(min-width: 768px)").matches;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    if (shouldCompensateScrollbar) {
      document.body.style.paddingRight = `${scrollBarGap}px`;
    }
  }

  activeScrollLocks.add(source);
};

export const unlockScroll = (source = DEFAULT_SCROLL_LOCK_SOURCE) => {
  if (typeof document === "undefined" || !activeScrollLocks.has(source)) {
    return;
  }

  activeScrollLocks.delete(source);

  if (activeScrollLocks.size === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
    document.body.style.overscrollBehavior = originalBodyOverscrollBehavior;
  }
};
