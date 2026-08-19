export function toggleFullscreen(targetElement?: HTMLElement): void {
  const el = targetElement || document.documentElement;
  const doc = document as unknown as {
    fullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    exitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };

  const isFs = !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );

  if (!isFs) {
    const elWithFs = el as unknown as {
      requestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      webkitRequestFullScreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (elWithFs.requestFullscreen) {
      elWithFs.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    } else if (elWithFs.webkitRequestFullscreen) {
      elWithFs.webkitRequestFullscreen().catch?.(() => {});
    } else if (elWithFs.webkitRequestFullScreen) {
      elWithFs.webkitRequestFullScreen();
    } else if (elWithFs.mozRequestFullScreen) {
      elWithFs.mozRequestFullScreen();
    } else if (elWithFs.msRequestFullscreen) {
      elWithFs.msRequestFullscreen();
    }
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {});
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }
}

export function isFullscreen(): boolean {
  const doc = document as unknown as {
    fullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  };
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}
