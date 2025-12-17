(function () {
  const getNumbers = (section) => {
    const element = section.querySelector(".image-banner__percent-value");
    const content = element?.dataset.content;
    const regex = /[0-9]*[.,]?[0-9]+/g;

    return content?.trim().match(regex);
  };

  const initNumbers = (section) => {
    const element = section.querySelector(".image-banner__percent-value");

    if (element) {
      const content = element.dataset.content;
      const regex = /[0-9]*[.,]?[0-9]+/g;
  
      element.innerHTML = content.replace(
        regex,
        `<span class="js-num">$&</span>`
      );
    }
  };

  const initAnimation = (section) => {
    let od = [];

    section.querySelectorAll(".js-num").forEach((num, i) => {
      od[i] = new Odometer({
        el: num,
        format: "d",
        theme: "default",
        value: 0,
      });
    });

    return od;
  };
  
  const initSection = (section) => {
    if (section && section.classList.contains('image-banner-section')) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target) {
            const od = initAnimation(entry.target);
            const numbers = getNumbers(entry.target);

            if (entry.isIntersecting) {
              entry.target.querySelectorAll(".js-num").forEach((num, i) => {
                const odometerNumber = numbers[i];
                od[i].update(odometerNumber);
              });
            } 
            //else {
            //  entry.target.querySelectorAll(".js-num").forEach((num, i) => {
            //    od[i].update(0);
            //  });
            //}
          }
        })
      });

      const inner = section.querySelector('.image-banner');
      const isAnimation = JSON.parse(inner.dataset.isAnimation)

      if (isAnimation) {
        initNumbers(section);

        sectionObserver.observe(section);
      }
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (section) {
    initSection(section.target);
  });
})();