// Hide swiper buttons when hovering over zoom button
(function() {
  // Stronger, inline-style approach to hide swiper nav when zoom is active.
  // This applies inline styles (and stores previous inline values) so theme CSS
  // cannot easily override it. It also sets a pointer cursor on the zoom button.

  function getSwipeButtons() {
    // Broader selector in case some themes place buttons outside the media-list
    return document.querySelectorAll('.product__media-list .swiper-button-next, .product__media-list .swiper-button-prev, .swiper-button-next, .swiper-button-prev');
  }

  function getZoomButton() {
    return document.querySelector('.product__media-list .product__zoom-button') || document.querySelector('.product__zoom-button');
  }

  function getMediaList() {
    return document.querySelector('.product__media-list');
  }

  // Store previous inline styles on the element's dataset, then apply hide styles
  function hideSwipeButtonsInline() {
    const buttons = getSwipeButtons();
    buttons.forEach(btn => {
      try {
        if (!btn.dataset._zoomPrevStyleSaved) {
          btn.dataset._zoomPrevDisplay = btn.style.display || '';
          btn.dataset._zoomPrevPointer = btn.style.pointerEvents || '';
          btn.dataset._zoomPrevVisibility = btn.style.visibility || '';
          btn.dataset._zoomPrevZindex = btn.style.zIndex || '';
          btn.dataset._zoomPrevStyleSaved = '1';
        }
        btn.style.display = 'none';
        btn.style.pointerEvents = 'none';
        btn.style.visibility = 'hidden';
        // push behind so it cannot overlap visually
        btn.style.zIndex = '0';
        btn.setAttribute('aria-hidden', 'true');
      } catch (e) {
        // ignore
      }
    });
  }

  // Restore previous inline styles from dataset
  function showSwipeButtonsInline() {
    const buttons = getSwipeButtons();
    buttons.forEach(btn => {
      try {
        if (btn.dataset._zoomPrevStyleSaved) {
          btn.style.display = btn.dataset._zoomPrevDisplay || '';
          btn.style.pointerEvents = btn.dataset._zoomPrevPointer || '';
          btn.style.visibility = btn.dataset._zoomPrevVisibility || '';
          btn.style.zIndex = btn.dataset._zoomPrevZindex || '';
          btn.removeAttribute('aria-hidden');
          delete btn.dataset._zoomPrevDisplay;
          delete btn.dataset._zoomPrevPointer;
          delete btn.dataset._zoomPrevVisibility;
          delete btn.dataset._zoomPrevZindex;
          delete btn.dataset._zoomPrevStyleSaved;
        }
      } catch (e) {
        // ignore
      }
    });
  }

  // Combined convenience functions for older code compatibility
  function hideSwipeButtons() { hideSwipeButtonsInline(); }
  function showSwipeButtons() { showSwipeButtonsInline(); }

  // Flag used to temporarily block slide interactions (drag/swipe) while zoom is active
  let _zoomBlockPointers = false;

  // Capture-level handler to prevent slide-starting pointer/touch events when zoom is active
  function _blockSlideInteraction(e) {
    try {
      if (!_zoomBlockPointers) return;
      const media = getMediaList();
      if (!media) return;
      // If the event target is inside the media list but NOT inside the zoom button, block it
      const zoomBtn = getZoomButton();
      const target = e.target;
      if (zoomBtn && zoomBtn.contains(target)) return; // allow events originating from zoom button
      if (media.contains(target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    } catch (err) {
      // ignore
    }
  }

  // Attach capture listeners once
  document.addEventListener('pointerdown', _blockSlideInteraction, true);
  // fallback for older browsers
  document.addEventListener('touchstart', _blockSlideInteraction, true);
  document.addEventListener('mousedown', _blockSlideInteraction, true);

  // Attach handlers to zoom button; clone to remove old listeners safely
  function attachHoverEvents() {
    const zoomBtn = getZoomButton();
    if (!zoomBtn) {
      // try again later
      return;
    }

    // If already processed, skip
    if (zoomBtn.dataset._zoomEnhanced === '1') return;

    // ensure pointer cursor
    try { zoomBtn.style.cursor = 'pointer'; } catch (e) {}

    // Clone to remove prior listeners
    const newZoomBtn = zoomBtn.cloneNode(true);
    try { zoomBtn.parentNode.replaceChild(newZoomBtn, zoomBtn); } catch (e) { /* ignore */ }

    // Mark processed
    newZoomBtn.dataset._zoomEnhanced = '1';

    // Hover handlers (desktop)
      newZoomBtn.addEventListener('mouseenter', function(e) {
        hideSwipeButtons();
        // Also hide any elements that visually overlap the zoom control
        hideOverlappingElements(newZoomBtn);
      });
      newZoomBtn.addEventListener('mouseleave', function(e) {
        showSwipeButtons();
        restoreOverlappingElements();
      });

    // Click handler: hide immediately and keep hidden while modal/dialog is open
    newZoomBtn.addEventListener('click', function() {
      hideSwipeButtons();

      // Poll for dialog presence and visibility; when closed, restore
      const checkModalClosed = setInterval(function() {
        const modals = document.querySelectorAll('[role="dialog"]');
        const isOpen = Array.from(modals).some(m => m && m.offsetParent !== null);
        if (!isOpen) {
          showSwipeButtons();
          clearInterval(checkModalClosed);
        }
      }, 150);
    });

    // Also attach touchstart to cover mobile taps
    newZoomBtn.addEventListener('touchstart', function() {
      hideSwipeButtons();
      setTimeout(showSwipeButtons, 1000);
    }, {passive: true});
  }

  // ----- New: hide elements overlapping the zoom button -----
  // Keep a Set of elements we hidden and their previous inline styles so we can restore later
  const _hiddenOverlap = new WeakMap();

  function _storeAndHide(el) {
    try {
      if (!_hiddenOverlap.has(el)) {
        const prev = {
          display: el.style.display || '',
          pointerEvents: el.style.pointerEvents || '',
          visibility: el.style.visibility || '',
          zIndex: el.style.zIndex || ''
        };
        _hiddenOverlap.set(el, prev);
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        el.style.visibility = 'hidden';
        el.style.zIndex = '0';
        el.setAttribute('aria-hidden', 'true');
      }
    } catch (e) { /* ignore */ }
  }

  function restoreOverlappingElements() {
    try {
      _hiddenOverlap && _hiddenOverlap.forEach && _hiddenOverlap.forEach((prev, el) => {});
    } catch (e) {}
    // WeakMap doesn't allow iteration across browsers reliably, so scan likely elements and restore
    const candidates = document.querySelectorAll('.swiper-button-next, .swiper-button-prev, .slick-arrow, .glide__arrow, [data-swiper-button], .product__media-nav');
    candidates.forEach(el => {
      try {
        const prev = el.dataset && el.dataset._zoomPrevStyleSaved ? {
          display: el.dataset._zoomPrevDisplay || '',
          pointerEvents: el.dataset._zoomPrevPointer || '',
          visibility: el.dataset._zoomPrevVisibility || '',
          zIndex: el.dataset._zoomPrevZindex || ''
        } : null;
        if (prev) {
          el.style.display = prev.display || '';
          el.style.pointerEvents = prev.pointerEvents || '';
          el.style.visibility = prev.visibility || '';
          el.style.zIndex = prev.zIndex || '';
          el.removeAttribute('aria-hidden');
          delete el.dataset._zoomPrevDisplay;
          delete el.dataset._zoomPrevPointer;
          delete el.dataset._zoomPrevVisibility;
          delete el.dataset._zoomPrevZindex;
          delete el.dataset._zoomPrevStyleSaved;
        } else {
          // best-effort restore for elements we hid via WeakMap isn't iterable; try a safe restore
          el.style.display = '';
          el.style.pointerEvents = '';
          el.style.visibility = '';
          el.style.zIndex = '';
          el.removeAttribute('aria-hidden');
        }
      } catch (e) { /* ignore */ }
    });
  }

  function hideOverlappingElements(zoomBtn) {
    if (!zoomBtn || !zoomBtn.getBoundingClientRect) return;
    const rect = zoomBtn.getBoundingClientRect();
    // sample points: center, left-middle, right-middle, top-middle, bottom-middle
    const points = [
      {x: rect.left + rect.width/2, y: rect.top + rect.height/2},
      {x: rect.left + 2, y: rect.top + rect.height/2},
      {x: rect.right - 2, y: rect.top + rect.height/2},
      {x: rect.left + rect.width/2, y: rect.top + 2},
      {x: rect.left + rect.width/2, y: rect.bottom - 2}
    ];

    const found = new Set();
    for (const p of points) {
      // elementFromPoint requires integers in many browsers
      const el = document.elementFromPoint(Math.round(p.x), Math.round(p.y));
      if (!el) continue;
      // climb up to find candidate nav elements
      let cand = el;
      for (let depth = 0; depth < 6 && cand; depth++) {
        const cls = (cand.className || '').toString();
        if (cand.matches && (cand.matches('.swiper-button-next') || cand.matches('.swiper-button-prev') || cand.matches('.slick-arrow') || cand.matches('.glide__arrow') || cand.matches('[data-swiper-button]') )) {
          found.add(cand);
          break;
        }
        // fallback: className pattern
        if (/swiper|arrow|prev|next|slick|glide|carousel/i.test(cls)) {
          found.add(cand);
          break;
        }
        cand = cand.parentElement;
      }
    }

    found.forEach(el => {
      // store previous inline styles on dataset if not already stored
      try {
        if (!el.dataset._zoomPrevStyleSaved) {
          el.dataset._zoomPrevDisplay = el.style.display || '';
          el.dataset._zoomPrevPointer = el.style.pointerEvents || '';
          el.dataset._zoomPrevVisibility = el.style.visibility || '';
          el.dataset._zoomPrevZindex = el.style.zIndex || '';
          el.dataset._zoomPrevStyleSaved = '1';
        }
        _storeAndHide(el);
      } catch (e) { /* ignore */ }
    });
  }
  // ----- end new overlapping-hiding helpers -----

  // Watch for modal open/close (in case modal is opened some other way)
  const modalObserver = new MutationObserver(function() {
    const modals = document.querySelectorAll('[role="dialog"]');
    const isModalOpen = Array.from(modals).some(m => m && m.offsetParent !== null);
    if (!isModalOpen) {
      showSwipeButtons();
    }
  });
  modalObserver.observe(document.body, { childList: true, subtree: true, attributes: false });

  // Watch Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      setTimeout(showSwipeButtons, 100);
    }
  });

  // Keep trying to attach until zoom button exists, and re-attach periodically
  const attachLoop = function() {
    try { attachHoverEvents(); } catch (e) {}
  };

  // Try immediately, then periodically to handle dynamic DOM
  attachLoop();
  const attachInterval = setInterval(attachLoop, 1500);

  // Also listen for additions where zoom or swipe buttons might be inserted
  const domObserver = new MutationObserver(function(mutations) {
    let needs = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) needs = true;
      if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'role')) needs = true;
    }
    if (needs) attachLoop();
  });
  domObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    clearInterval(attachInterval);
    modalObserver.disconnect();
    domObserver.disconnect();
  });
})();
