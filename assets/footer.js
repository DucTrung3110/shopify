;(function () {
  const getDistanceToNext = (element, nextElement) => {
    if (element && nextElement) {
      return (nextElement.getBoundingClientRect().left - element.getBoundingClientRect().right);
    }
  }

  const getDistanceToPrev = (element, prevElement) => {
    if (element && prevElement) {
      return (prevElement.getBoundingClientRect().right - element.getBoundingClientRect().left);
    }
  }

  const footer = () => {
    const footerSections = document.querySelectorAll(".footer");

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width >= 990) {
          const blockLogo = entry.target.querySelector(".footer-block--logo");
          const blockContacts = entry.target.querySelector(".footer-block--contacts");

          const calculatePaddingLeft = (element) => {
            if (element) {
              if (element.previousElementSibling?.classList.contains("footer-block--menu")) {
                const distance = getDistanceToPrev(element, element.previousElementSibling) / 2;
    
                element.style.setProperty("--border-left-distance", `${distance}px`);
              } else {
                element.style.setProperty("--border-left-distance", `-12px`);
                element.style.marginLeft = 0;
                if (entry.contentRect.width >= 1360) {
                  element.style.setProperty("--border-left-distance", `-32px`);
                }
              }
            }

            if (element && (!blockLogo || !blockContacts)) {
              element.style.setProperty("--border-left-distance", `-12px`);
              element.style.marginLeft = 0;
              if (entry.contentRect.width >= 1360) {
                element.style.setProperty("--border-left-distance", `-32px`);
              }
            }
          }

          const calculatePaddingRight = (element) => {
            if (element) {
              if (element.nextElementSibling?.nextElementSibling?.classList.contains("footer-block--menu")) {
                const distance = (-1 / 2) * getDistanceToNext(element, element.nextElementSibling?.nextElementSibling);
    
                element.style.setProperty("--border-right-distance", `${distance}px`);
              } else {
                element.style.setProperty("--border-right-distance", `-12px`);
                element.style.marginRight = 0;
                if (entry.contentRect.width >= 1360) {
                  element.style.setProperty("--border-right-distance", `-32px`);
                }
              }
            }

            if (element && (!blockLogo || !blockContacts)) {
              element.style.setProperty("--border-right-distance", `-12px`);
              element.style.marginRight = 0;
              if (entry.contentRect.width >= 1360) {
                element.style.setProperty("--border-right-distance", `-32px`);
              }
            }
          }

          calculatePaddingLeft(blockLogo);
          calculatePaddingRight(blockLogo);
          calculatePaddingLeft(blockContacts);
          calculatePaddingRight(blockContacts);
        }
      })
    })

    footerSections.forEach((section) => {
      resizeObserver.observe(section);
    })
  }

  document.addEventListener("shopify:section:load", footer)
  footer();
})()
