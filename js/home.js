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
      const path = cardContainer.querySelector(".process-line-path");
      const lineContainer = cardContainer.querySelector(".process-line-container");

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 1. Context setup to ensure clean reversion of ScrollTriggers and animations
      const ctx = gsap.context(() => {
        if (prefersReducedMotion) {
          if (lineContainer) lineContainer.style.display = "none";
          gsap.set(processCards, { opacity: 1, y: 0 });
          if (path) gsap.set(path, { strokeDashoffset: 0 });
          return;
        }

        // Reset elements before entering view
        gsap.set(processCards, { opacity: 0, y: 40 });

        // Dynamic Path Calculation
        function updatePath() {
          if (!path) return null;
          const containerRect = cardContainer.getBoundingClientRect();
          const rect1 = cardOne.getBoundingClientRect();
          const rect2 = cardTwo.getBoundingClientRect();
          const rect3 = cardThree.getBoundingClientRect();

          // Calculate center points relative to cardContainer
          const x = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;
          const y3 = rect3.top + rect3.height / 2 - containerRect.top;

          path.setAttribute("d", `M ${x} ${y1} L ${x} ${y2} L ${x} ${y3}`);

          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
          });

          return { length, y1, y2, y3 };
        }

        let pathData = updatePath();

        // Recalculate path on window resize
        let resizeTimeout;
        const resizeHandler = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            pathData = updatePath();
            ScrollTrigger.refresh();
          }, 150);
        };
        window.addEventListener("resize", resizeHandler);

        // Keep track of event listener for custom cleanup
        ctx.add(() => {
          return () => window.removeEventListener("resize", resizeHandler);
        });

        // 2. Single GSAP Timeline for Line segments and Card entrances
        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardContainer,
            start: "top 80%",
            once: true
          }
        });

        // Card 1 Fade & Slide Up
        mainTl.to(cardOne, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.4)"
        });

        // Line Segment 1 draw (starting 0.2s after Card 1 begins)
        if (path && pathData) {
          const { length, y1, y2 } = pathData;
          const segment1Length = y2 - y1;
          const targetOffset1 = length - segment1Length;

          mainTl.to(path, {
            strokeDashoffset: targetOffset1,
            duration: 0.8,
            ease: "power2.inOut"
          }, "-=0.4"); // Starts 0.2s after Card 1 entrance starts (0.6s duration - 0.4s offset = 0.2s elapsed)
        }

        // Card 2 Fade & Slide Up (starts 0.3s before first line segment finishes drawing)
        mainTl.to(cardTwo, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.4)"
        }, "-=0.3");

        // Line Segment 2 draw (starting 0.2s after Card 2 begins)
        if (path && pathData) {
          mainTl.to(path, {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: "power2.inOut"
          }, "-=0.4"); // Starts 0.2s after Card 2 entrance starts
        }

        // Card 3 Fade & Slide Up (starts 0.3s before second line segment finishes drawing)
        mainTl.to(cardThree, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.4)"
        }, "-=0.3");

        // 3. Tactile Tap Interactions (touchstart, touchend, touchcancel)
        processCards.forEach((card) => {
          const handleTouchStart = () => {
            gsap.to(card, {
              scale: 0.97,
              rotate: -1,
              duration: 0.15,
              ease: "power2.out"
            });
          };

          const handleTouchEnd = () => {
            gsap.to(card, {
              scale: 1,
              rotate: 0,
              duration: 0.3,
              ease: "back.out(2)"
            });
          };

          card.addEventListener("touchstart", handleTouchStart, { passive: true });
          card.addEventListener("touchend", handleTouchEnd, { passive: true });
          card.addEventListener("touchcancel", handleTouchEnd, { passive: true });

          ctx.add(() => {
            return () => {
              card.removeEventListener("touchstart", handleTouchStart);
              card.removeEventListener("touchend", handleTouchEnd);
              card.removeEventListener("touchcancel", handleTouchEnd);
            };
          });
        });
      }, cardContainer);

      // Cleanup context
      return () => {
        ctx.revert();
        processCards.forEach((el) => (el.style = ""));
        cardContainer.style = "";
        stickyHeader.style = "";
        if (path) path.style = "";
      };
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
