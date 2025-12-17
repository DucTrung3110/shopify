(function () {
  const slideshow = () => {
    $(".slideshow-section").each(function () {
      if ($(this).hasClass("slider_started")) {
        return "";
      }
      $(this).addClass("slider_started");
      const id = $(this).attr("id");
      const box = $(this).find(".slideshow");
      const autoplay = box.data("autoplay");
      const isLoop = box.data("loop");
      const stopAutoplay = box.data("stop-autoplay");
      const delay = box.data("delay") * 1000;
      const slideshowType = box.data("slideshow-type");
      const slideCount = box.data("slide-count");
      const splitScreenContentEffect = box.data("effect-split-screen");

      let autoplayParam;
      if (autoplay && slideCount > 1) {
        autoplayParam = {
          autoplay: {
            delay: delay,
            pauseOnMouseEnter: stopAutoplay,
            disableOnInteraction: false,
          },
        };
      } else {
        autoplayParam = {
          autoplay: false
        };
      }

      const commonParams = {
        speed: box.data("speed") * 1000,
        effect: box.data("effect"),
        loop: isLoop && slideCount > 1,
        autoHeight: false,
        calculateHeight: false,
        keyboard: true,
        mousewheel: {
          forceToAxis: true,
        },
        ...autoplayParam,
      };

      const swiperOverlayParams = {
        parallax: box.data("parallax"),
        centeredSlides: false,
        creativeEffect: {
          prev: {
            shadow: true,
            translate: [0, 0, -400],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        },
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
        navigation: {
          nextEl: `#${id} .swiper-button-next`,
          prevEl: `#${id} .swiper-button-prev`,
        },
        pagination: {
          el: `#${id} .swiper-pagination`,
          clickable: true,
        },
      };

      const swiperStandardParams = {
        creativeEffect: {
          prev: {
            shadow: false,
            translate: [0, 0, -400],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        },
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        },
        flipEffect: {
          slideShadows: false,
        },
      };

      const changeColorScheme = (context) => {
        const activeIndex = context.activeIndex;
        const activeSlide = context.slides[activeIndex];
        const changeItems = [
          context.navigation.nextEl,
          context.navigation.prevEl,
          context.pagination.el,
        ];

        const colorScheme = activeSlide.dataset.colorScheme;

        changeItems.forEach((item) => {
          if (item) {
            let classNames = item.getAttribute("class");
            classNames = classNames.replace(/color-background-\d+/g, "");
            item.setAttribute("class", classNames);
            item.classList.add(colorScheme);
          }
        });
      };

      if (slideshowType === "overlay") {
        const swiperOverlay = new Swiper(`#${id} .slideshow__swiper`, {
          ...commonParams,
          ...swiperOverlayParams,
        });

        changeColorScheme(swiperOverlay);
        swiperOverlay.on("beforeTransitionStart", function () {
          changeColorScheme(this);
        });
      }

      if (slideshowType === "standard") {
        const swiperContent = new Swiper(
          `#${id} .split-screen-slideshow__content-swiper`,
          {
            ...commonParams,
            ...swiperStandardParams,
            parallax: box.data("parallax"),
            autoplay: false,
            allowTouchMove: true,
            effect: splitScreenContentEffect,
            pagination: {
              el: `#${id} .split-screen-slideshow__content-slider .swiper-pagination`,
              clickable: true,
            },
            breakpoints: {
              990: {
                allowTouchMove: false,
              }
            }
          }
        );

        const swiperImage = new Swiper(
          `#${id} .split-screen-slideshow__image-swiper`,
          {
            ...commonParams,
            ...swiperStandardParams,
            allowTouchMove: true,
            navigation: {
              nextEl: `#${id} .split-screen-slideshow__image-slider .swiper-button-next`,
              prevEl: `#${id} .split-screen-slideshow__image-slider .swiper-button-prev`,
            },
            pagination: {
              el: `#${id} .split-screen-slideshow__image-slider .swiper-pagination`,
              clickable: true,
            },
          }
        );
        swiperContent.controller.control = swiperImage;
        swiperImage.controller.control = swiperContent;

        changeColorScheme(swiperContent);
        swiperContent.on("beforeTransitionStart", function () {
          changeColorScheme(this);
        });
        swiperImage.on("beforeTransitionStart", function () {
          changeColorScheme(swiperContent);
        });
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    slideshow();
    document.addEventListener("shopify:section:load", function () {
      slideshow();
    });
  });
})();
