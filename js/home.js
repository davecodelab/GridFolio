import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  initHeroTimer();
  initIntroCopyAnimation();
  initStickyWorkHeaderAnimation();
});

// hero section - updates timezone display every minute
function initHeroTimer() {
  const timeElement = document.querySelector(".hero-timer p");
  if (!timeElement) return;

  function updateTime() {
    const options = {
      timeZone: "America/Toronto",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    };

    const torontoTime = new Date().toLocaleString("en-US", options);
    const hour = parseInt(torontoTime.split(":")[0]);
    const sector = Math.floor(hour / 4) + 1;
    const sectorFormatted = String(sector).padStart(2, "0");

    timeElement.textContent = `Zone ${sectorFormatted} __ ${torontoTime}`;
  }

  updateTime();
  setInterval(updateTime, 60000);
}

// intro section - text fill animation on scroll
function initIntroCopyAnimation() {
  const introCopyH3 = document.querySelector(".intro-copy h3");
  if (!introCopyH3) return;

  const split = SplitText.create(introCopyH3, {
    type: "words, chars",
    charsClass: "char",
  });

  ScrollTrigger.create({
    trigger: ".intro-copy",
    start: "top 75%",
    end: "bottom 30%",
    onUpdate: (self) => {
      const progress = self.progress;
      const totalChars = split.chars.length;
      const charsToColor = Math.floor(progress * totalChars);

      split.chars.forEach((char, index) => {
        if (index < charsToColor) {
          char.style.color = "var(--base-100)";
        } else {
          char.style.color = "var(--base-300)";
        }
      });
    },
  });
}

// featured missions header section - pins header while missions section scrolls
function initStickyWorkHeaderAnimation() {
  const workHeaderSection = document.querySelector(".featured-missions-header");
  const homeWorkSection = document.querySelector(".featured-missions");

  if (!workHeaderSection || !homeWorkSection) return;

  ScrollTrigger.create({
    trigger: workHeaderSection,
    start: "top top",
    endTrigger: homeWorkSection,
    end: "bottom bottom",
    pin: true,
    pinSpacing: false,
  });
}

// process card section - animates cards on scroll
 const cardContainer = document.querySelector(".card-container");
  const stickyHeader = document.querySelector(".sticky-header h1");
  let isGapAnimationCompleted = false;
  let isFlipAnimationCompleted = false;

  function initAnimations() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const mm = gsap.matchMedia();

    mm.add("(max-width: 999px)", () => {
      document
        .querySelectorAll(".process .card, .card-container, .sticky-header h1")
        .forEach((el) => (el.style = ""));
      return {};
    });

    mm.add("(min-width: 1000px)", () => {
      ScrollTrigger.create({
        trigger: ".process",
        start: "top top",
        end: `+=${window.innerHeight * 4}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress >= 0.1 && progress <= 0.25) {
            const headerProgress = gsap.utils.mapRange(
              0.1,
              0.25,
              0,
              1,
              progress
            );
            const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
            const opacityValue = gsap.utils.mapRange(
              0,
              1,
              0,
              1,
              headerProgress
            );

            gsap.set(stickyHeader, {
              y: yValue,
              opacity: opacityValue,
            });
          } else if (progress < 0.1) {
            gsap.set(stickyHeader, {
              y: 40,
              opacity: 0,
            });
          } else if (progress > 0.25) {
            gsap.set(stickyHeader, {
              y: 0,
              opacity: 1,
            });
          }

          if (progress <= 0.25) {
            const widthPercentage = gsap.utils.mapRange(
              0,
              0.25,
              75,
              60,
              progress
            );
            gsap.set(cardContainer, { width: `${widthPercentage}%` });
          } else {
            gsap.set(cardContainer, { width: "60%" });
          }

          if (progress >= 0.35 && !isGapAnimationCompleted) {
            gsap.to(cardContainer, {
              gap: "20px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(["#card-1", "#card-2", "#card-3"], {
              borderRadius: "20px",
              duration: 0.5,
              ease: "power3.out",
            });

            isGapAnimationCompleted = true;
          } else if (progress < 0.35 && isGapAnimationCompleted) {
            gsap.to(cardContainer, {
              gap: "0px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to("#card-1", {
              borderRadius: "20px 0 0 20px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to("#card-2", {
              borderRadius: "0px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to("#card-3", {
              borderRadius: "0 20px 20px 0",
              duration: 0.5,
              ease: "power3.out",
            });

            isGapAnimationCompleted = false;
          }

          if (progress >= 0.7 && !isFlipAnimationCompleted) {
            gsap.to(".process .card", {
              rotationY: 180,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: 0.1,
            });

            gsap.to(["#card-1", "#card-3"], {
              y: 30,
              rotationZ: (i) => [-15, 15][i],
              duration: 0.75,
              ease: "power3.inOut",
            });

            isFlipAnimationCompleted = true;
          } else if (progress < 0.7 && isFlipAnimationCompleted) {
            gsap.to(".process .card", {
              rotationY: 0,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: -0.1,
            });

            gsap.to(["#card-1", "#card-3"], {
              y: 0,
              rotationZ: 0,
              duration: 0.75,
              ease: "power3.inOut",
            });

            isFlipAnimationCompleted = false;
          }
        },
      });
      return () => {};
    });
  }

  initAnimations();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initAnimations();
    }, 250);
  });

export { initHeroTimer };
