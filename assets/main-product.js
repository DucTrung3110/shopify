(function () {
  const initProductAccordion = () => {
    const aboutToggleItems = $('.about__accordion-toggle');

    aboutToggleItems.each(function () {
      const currentToggle = $(this);
      const siblingToggles = currentToggle.siblings('.about__accordion-description');

      currentToggle.click(function () {
        if (!currentToggle.hasClass('active')) {
          aboutToggleItems.each(function () {
            const siblingToggle = $(this);
            siblingToggle.removeClass('active');
            siblingToggle.siblings('.about__accordion-description').stop().slideUp(300);
          });

          currentToggle.addClass('active');

          siblingToggles.stop().slideDown(300);
        } else {
          currentToggle.removeClass('active');
          siblingToggles.stop().slideUp(300);
        }
      });
    });
  };

  const initZoomImage = () => {
    const imagesWrapper = document.querySelector('.product-media-modal__content');
    const images = imagesWrapper?.querySelectorAll('.js-image-zoom') || [];

    images.forEach((el) => {
      el.addEventListener('click', (e) => {
        imagesWrapper.classList.toggle('zoom');
      });
    });
  };

  /* Product gallery enhancements: custom hover cursor and click-left/right to navigate */
  const initProductGalleryEnhancements = () => {
    if (typeof window === 'undefined') return;

    // disable on touch devices
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    // Force zoom button inline styles to ensure bottom-right positioning
    const fixZoomButtonPosition = () => {
      document.querySelectorAll('.product__zoom-button').forEach((btn) => {
        btn.style.cssText = 'position:absolute !important; right:1.2rem !important; bottom:1.2rem !important; left:auto !important; top:auto !important; width:4rem !important; height:4rem !important; border-radius:50% !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; z-index:40 !important; pointer-events:auto !important; visibility:visible !important; opacity:1 !important;';
      });
    };
    
    // Run immediately and after DOM ready
    fixZoomButtonPosition();
    window.addEventListener('load', fixZoomButtonPosition);
    setTimeout(fixZoomButtonPosition, 100);
    setTimeout(fixZoomButtonPosition, 500);


    document.querySelectorAll('.js-media-list').forEach((mediaList) => {
      const container = mediaList.closest('.product__main') || mediaList;
      if (!container) return;

      // create cursor element once per container
      if (container._customCursor) return;
      const cursor = document.createElement('div');
      cursor.className = 'product-slide-cursor';
      cursor.innerHTML = '<span class="icon icon-arrow"></span>';
      document.body.appendChild(cursor);
      container._customCursor = cursor;

      const swiper = mediaList.swiper;

      const updateCursor = (e) => {
        const rect = mediaList.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        // position cursor where the mouse is
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        // make cursor visible only after mousemove to avoid stale overlay
        cursor.style.display = 'flex';
        cursor.classList.add('visible');
        const icon = cursor.querySelector('.icon');
        if (e.clientX < centerX) {
          // left
          icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
          // right
          icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
      };

      const hideCursor = () => {
        cursor.classList.remove('visible');
        cursor.style.left = '-9999px';
        cursor.style.top = '-9999px';
        cursor.style.display = 'none';
      };

      const onClickNav = (e) => {
        if (!swiper) return;
        const rect = mediaList.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        if (e.clientX < centerX) {
          swiper.slidePrev();
        } else {
          swiper.slideNext();
        }
      };

      // Hide cursor when hovering over zoom button
      const zoomButton = mediaList.querySelector('.product__zoom-button');
      if (zoomButton) {
        zoomButton.addEventListener('mouseenter', () => {
          cursor.style.display = 'none';
          cursor.classList.remove('visible');
        });
        zoomButton.addEventListener('mouseleave', () => {
          // Keep cursor visible when leaving zoom button if still inside media list
        });
      }

      // Only show cursor after a real mousemove (prevents an orphaned overlay at page load)
      mediaList.addEventListener('mousemove', (e) => {
        // Don't show cursor if hovering over zoom button
        const zoomBtn = mediaList.querySelector('.product__zoom-button');
        if (zoomBtn && e.target.closest('.product__zoom-button')) {
          hideCursor();
        } else {
          updateCursor(e);
        }
      });
      mediaList.addEventListener('mouseleave', hideCursor);
      mediaList.addEventListener('click', onClickNav);
    });
  };

  const formatFreeShippingAmount = (value) => {
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = theme.moneyFormat;

    return formatString.replace(placeholderRegex, value);
  };

  const setTotalFreeShipping = () => {
    if (document.querySelector('.js-free-shipping')) {
      const freeShippingTotal = document.querySelector('.free-shipping-total');
      if (freeShippingTotal) {
        const minSpend = Number(freeShippingTotal.dataset.minSpend);
        if (minSpend && minSpend > 0) {
          freeShippingTotal.innerText = `${formatFreeShippingAmount(
            Math.round(minSpend * (Shopify.currency.rate || 1)),
          )}`;
        }
      }
    }
  };

  const revealStickyAddToCart = (section) => {
    if (!section && section.classList.contains('.product-section')) return;
    const buyButtons = section.querySelector('.product__buy-buttons > product-form');
    const stickyBar = section.querySelector('.sticky-add-to-cart');
    const footerBottom = document.querySelector(
      '.shopify-section-group-footer-group .footer__content-bottom',
    );

    if (!stickyBar) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.01,
    };

    const isElementBelowScroll = (element) => {
      return element ? element.getBoundingClientRect().top > 0 : false;
    };

    const toggleStickyBar = (isVisible) => {
      if (isVisible || isElementBelowScroll(buyButtons)) {
        stickyBar.classList.remove('active');
      } else {
        stickyBar.classList.add('active');
      }
    };

    const handleIntersect = (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      toggleStickyBar(isVisible);
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (buyButtons) observer.observe(buyButtons);
    if (footerBottom) observer.observe(footerBottom);
  };

  document.addEventListener('shopify:section:load', function (event) {
    initProductAccordion();
    initZoomImage();
    initProductGalleryEnhancements();
    setTotalFreeShipping();
    revealStickyAddToCart(event.target);
  });

  initProductAccordion();
  initZoomImage();
  initProductGalleryEnhancements();
  setTotalFreeShipping();
  revealStickyAddToCart(document.currentScript.parentElement);
})();
