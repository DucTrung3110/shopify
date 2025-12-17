(function () {
  const initTestimonials = () => {
    $(".testimonials-section").each(function () {
      if ($(this).hasClass("slider_started")) {
        return "";
      }
      $(this).addClass("slider_started");
      const id = $(this).attr("id");
      const box = $(this).find(".testimonials");
      const autoplay = box.data("autoplay");
      const isLoop = box.data("loop");
      const stopAutoplay = box.data("stop-autoplay");
      const delay = box.data("delay") * 1000;

      let autoplayParam;
      if (autoplay) {
        autoplayParam = {
          autoplay: {
            delay: delay,
            pauseOnMouseEnter: stopAutoplay,
            disableOnInteraction: false,
          },
        };
      } else {
        autoplayParam = { autoplay: false };
      }

      const swiperReviewsParams = {
        speed: box.data("speed") * 1000,
        effect: "slide",
        loop: isLoop,
        spaceBetween: 16,
        autoHeight: false,
        ...autoplayParam,
        centeredSlides: false,
        allowTouchMove: true,
        navigation: {
          nextEl: `#${id} .swiper-button-next`,
          prevEl: `#${id} .swiper-button-prev`,
        },
        breakpoints: {
          990: {
            direction: "vertical",
            autoHeight: true,
            keyboard: true,
          },
        },
        pagination: {
          el: `#${id} .testimonials__pagination`,
          clickable: true,
          type: "custom",
          renderCustom: function (swiper, current, total) {
            let out = "";
            for (let i = 1; i < total + 1; i++) {
              if (i == current) {
                out = `${out}<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
              } else {
                out = `${out}<span class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
              }
            }
            return out;
          },
        },
      };

      const swiperImageParams = {
        speed: box.data("speed") * 1000,
        effect: "fade",
        loop: isLoop,
        calculateHeight: false,
        autoplay: false,
        allowTouchMove: false,
        breakpoints: {
          320: {
            autoHeight: false,
          },
          1100: {
            autoHeight: false,
          },
        },
      };

      const swiperReviews = new Swiper(`#${id} .testimonials__swiper`, {
        ...swiperReviewsParams,
      });

      const swiperImage = new Swiper(`#${id} .testimonials__swiper-media`, {
        ...swiperImageParams,
      });

      swiperReviews.controller.control = swiperImage;
      swiperImage.controller.control = swiperReviews;

      const setSlideHeight = (swiper, isMobile = false) => {
        const slides = swiper.slides;
        const slideHeights = [];
        slides.forEach((slide) => {
          slideHeights.push(slide.children[0].clientHeight);
        });
        swiper.$el[0].style.height = !isMobile ? Math.max(...slideHeights) + "px" : Math.max(...slideHeights) + 32 + "px";
      };

      const sectionResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.contentRect.width >= 990) {
            setSlideHeight(swiperReviews);
            swiperReviews.on("init", function () {
              setSlideHeight(this);
            });
            swiperReviews.on("resize", function () {
              setSlideHeight(this);
            });
          } else {
            setSlideHeight(swiperReviews, true);
            swiperReviews.on("init", function () {
              setSlideHeight(this, true);
            });
            swiperReviews.on("resize", function () {
              setSlideHeight(this, true);
            });
          }
        });
      });

      sectionResizeObserver.observe(box.get(0));
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initTestimonials();
    document.addEventListener("shopify:section:load", function () {
      initTestimonials();
    });
  });
})();
