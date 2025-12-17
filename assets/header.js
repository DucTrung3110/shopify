(function () {
  const initHeader = () => {
    const header = document.querySelector(".shopify-section-header");
    if (!header) return;
    const menu = document.querySelector(".list-menu--inline");
    const menuLinks = document.querySelectorAll(".list-menu-item");
    const search = document.querySelector("details-modal.header__search");
    const searchModal = document.querySelector("details-modal.header__search > details");
    const mobileMenuModal = document.querySelector("header-drawer > details");
    const allSubmenu = document.querySelectorAll(".header__submenu");
    const allMegaMenuItemsDesktop = document.querySelectorAll('.list-menu--megamenu');

    header.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && search.isOpen) {
        search.close();
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        if (link.classList.contains("list-menu--megamenu")) {
          link.classList.add("list-menu--megamenu-visible");

          menuLinks.forEach((el) => {
            el.classList.add("list-menu-item--inactive");
            el.classList.remove("list-menu-item--active");
            if (el !== link) {
              el.classList.remove("list-menu--megamenu-visible");
            }
          });
          link.classList.remove("list-menu-item--inactive");
          link.classList.add("list-menu-item--active");
        } else {
          menuLinks.forEach((el) => {
            el.classList.add("list-menu-item--inactive");
            el.classList.remove("list-menu-item--active");
            el.classList.remove("list-menu--megamenu-visible");
          });
          link.classList.remove("list-menu-item--inactive");
          link.classList.add("list-menu-item--active");
        }
      });
    });

    allSubmenu.forEach((submenu) => {
      const links = submenu.querySelectorAll(".header__submenu-item:not(.header__submenu-item--grandchild)");

      links.forEach((link) => {
        const childLinks = link.parentElement.querySelectorAll(".header__submenu-item--grandchild");

        link.addEventListener("mouseenter", (e) => {
          links.forEach((el) => {
            el.classList.add("header__submenu-item--inactive");
          });
          link.classList.remove("header__submenu-item--inactive");
        });

        childLinks.forEach((childLink) => {
          childLink.addEventListener("mouseenter", (e) => {
            childLinks.forEach((el) => {
              el.classList.add("header__submenu-item--inactive");
            });
            childLink.classList.remove("header__submenu-item--inactive");
          });
        });

        link.addEventListener("mouseleave", (e) => {
          childLinks.forEach((el) => {
            el.classList.remove("header__submenu-item--inactive");
          });
        });
      });

      submenu.addEventListener("mouseleave", (e) => {
        links.forEach((el) => {
          el.classList.remove("header__submenu-item--inactive");
        });
      });
    });

    menu?.addEventListener("mouseleave", (e) => {
      menuLinks.forEach((link) => {
        link.classList.remove("list-menu-item--inactive");
        link.classList.remove("list-menu-item--active");
        link.classList.remove("list-menu--megamenu-visible");
      });

      document.querySelectorAll(".header__submenu-item").forEach((link) => {
        link.classList.remove("header__submenu-item--inactive");
      })
    });

    if (header && header.classList.contains("color-background-overlay")) {
      header.addEventListener("mouseenter", () => {
        header.classList.remove("color-background-overlay");
        header.classList.add("color-background-overlay-hidden");
      });

      header.addEventListener("mouseleave", () => {
        if (!searchModal.hasAttribute("open") && !mobileMenuModal.hasAttribute("open")) {
          header.classList.add("color-background-overlay");
          header.classList.remove("color-background-overlay-hidden");
        }
      });
    }

    const calcMegaMenuPosition = (items) => {
      const headerRect = header.getBoundingClientRect()
  
      items.forEach((item) => {
        const megaMenuEl = item.querySelector('.mega-menu')
        if (!megaMenuEl) return
        const itemRect = item.getBoundingClientRect()
        megaMenuEl.style.removeProperty("top");
        if (headerRect.bottom > itemRect.bottom) {
          const diffTop = headerRect.bottom - itemRect.bottom
          megaMenuEl.style.top = `calc(100% - ${diffTop}px)`
        }
      })
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        calcMegaMenuPosition(allMegaMenuItemsDesktop)
      });
    });

    observer.observe(header);
  };

  const initAnnBar = () => {
    const annBar = document.querySelector(".section-announcement");
    if (!annBar) return;
    let annBarObserver;
    const createAnnBarObserver = () => {
      if (annBarObserver) annBarObserver.disconnect();
      annBarObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const annBarHeight = annBar?.getBoundingClientRect().height || 0;
              document.documentElement.style.setProperty(
                "--ann-height",
                `${(annBarHeight * entry.intersectionRatio).toFixed(2)}px`
              );
            } else {
              document.documentElement.style.setProperty("--ann-height", "0px");
            }
          });
        },
        {
          threshold: Array.from({ length: 1000 }, (_, i) => i / 1000),
        }
      );

      if (annBar) annBarObserver.observe(annBar);
    };
    createAnnBarObserver();
  }

  const initHeaderGroup = () => {
    initAnnBar();
    initHeader();
  }

  document.addEventListener("shopify:section:load", initHeaderGroup);
  document.addEventListener("shopify:section:unload", initHeaderGroup);
  document.addEventListener("shopify:section:reorder", initHeaderGroup);

  initHeaderGroup();
})();
