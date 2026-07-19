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
function initProcessCardAnimation() {
  const processSection = document.querySelector(".process");
  if (!processSection) return;

  const cardContainer = processSection.querySelector(".card-container");
  const stickyHeader = processSection.querySelector(".sticky-header h1");
  const processCards = Array.from(processSection.querySelectorAll(".card"));
  const cardOne = processSection.querySelector("#card-1");
  const cardTwo = processSection.querySelector("#card-2");
  const cardThree = processSection.querySelector("#card-3");

  if (
    !cardContainer ||
    !stickyHeader ||
    processCards.length < 3 ||
    !cardOne ||
    !cardTwo ||
    !cardThree
  ) {
    return;
  }

  let isGapAnimationCompleted = false;
  let isFlipAnimationCompleted = false;

  function initAnimations() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const mm = gsap.matchMedia();

    mm.add("(max-width: 999px)", () => {
      processCards.forEach((el) => (el.style = ""));
      cardContainer.style = "";
      stickyHeader.style = "";

      // Reset the card backs to be properly rotated for 3D flip (overriding mobile CSS transform:none)
      processCards.forEach((card) => {
        gsap.set(card.querySelector(".card-back"), {
          rotationY: 180,
          transformOrigin: "center center",
        });
        gsap.set(card, {
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
        });
      });

      // Mobile scroll animation for cards
      processCards.forEach((card, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "center 45%",
            scrub: 1.5,
          },
        });

        tl.fromTo(
          card,
          { opacity: 0.3, y: 80, rotationY: 0 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        ).to(
          card,
          { rotationY: 180, duration: 2, ease: "power2.inOut" },
          "-=0.5",
        );
      });

      return {};
    });

    mm.add("(min-width: 1000px)", () => {
      ScrollTrigger.create({
        trigger: processSection,
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
              progress,
            );
            const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
            const opacityValue = gsap.utils.mapRange(
              0,
              1,
              0,
              1,
              headerProgress,
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
              progress,
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

            gsap.to([cardOne, cardTwo, cardThree], {
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

            gsap.to(cardOne, {
              borderRadius: "20px 0 0 20px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(cardTwo, {
              borderRadius: "0px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(cardThree, {
              borderRadius: "0 20px 20px 0",
              duration: 0.5,
              ease: "power3.out",
            });

            isGapAnimationCompleted = false;
          }

          if (progress >= 0.7 && !isFlipAnimationCompleted) {
            gsap.to(processCards, {
              rotationY: 180,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: 0.1,
            });

            gsap.to([cardOne, cardThree], {
              y: 30,
              rotationZ: (i) => [-15, 15][i],
              duration: 0.75,
              ease: "power3.inOut",
            });

            isFlipAnimationCompleted = true;
          } else if (progress < 0.7 && isFlipAnimationCompleted) {
            gsap.to(processCards, {
              rotationY: 0,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: -0.1,
            });

            gsap.to([cardOne, cardThree], {
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
}

initProcessCardAnimation();

export { initHeroTimer };
