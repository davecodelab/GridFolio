import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  initExpeditionsList();
  initExpeditionsInteractions();
});

const EXPEDITIONS_DATA = [
  {
    name: "Frontend Development",
    type: "NextJs",
    project: "GSAP",
    label: "Active",
  },
  {
    name: "Brand Identity",
    type: "Logo",
    project: "Branding",
    label: "Active",
  },
  {
    name: "Backend Development",
    type: "APIs",
    project: "System Engineering",
    label: "Active",
  },
  {
    name: "UI/ UX",
    type: "Web Design",
    project: "Figma",
    label: "Active",
  },
  {
    name: "Web Applications",
    type: "Mobile App",
    project: "Android",
    label: "iOS App",
  },
  {
    name: "Motion Design",
    type: "Animation",
    project: "Marketing",
    label: "Sales",
  },
  {
    name: "Video Editing",
    type: "Footages",
    project: "Content Creation",
    label: "UX Writing",
  },
  {
    name: "Project Management",
    type: "Fullstack",
    project: "User Journey",
    label: "Active",
  },
  {
    name: "ML & AI",
    type: "Automation",
    project: "DevOps",
    label: "Active",
  },
  {
    name: "Data Analyst",
    type: "Python",
    project: "Photography",
    label: "Active",
  },
  {
    name: "Cybersecurity",
    type: "Networking",
    project: "SOC & NOC",
    label: "Active",
  },
  {
    name: "Hardware & IoT",
    type: "Engineering",
    project: "MVP",
    label: "Active",
  },
];

const POSITIONS = {
  BOTTOM: "0%",
  MIDDLE: "-33.333%",
  TOP: "-66.666%",
};

// expeditions section - creates and renders expedition list items
function initExpeditionsList() {
  const expeditionsListContainer = document.querySelector(".expeditions-list");
  if (!expeditionsListContainer) return;

  EXPEDITIONS_DATA.forEach((expedition) => {
    const expeditionElement = document.createElement("div");
    expeditionElement.className = "expedition";

    expeditionElement.innerHTML = `
      <div class="expedition-wrapper">
        <div class="expedition-name">
          <h2>${expedition.name}</h2>
          <h2>${expedition.type}</h2>
        </div>
        <div class="expedition-project">
          <h2>${expedition.project}</h2>
          <h2>${expedition.label}</h2>
        </div>
        <div class="expedition-name">
          <h2>${expedition.name}</h2>
          <h2>${expedition.type}</h2>
        </div>
      </div>
    `;

    expeditionsListContainer.appendChild(expeditionElement);
  });
}

// expeditions section - mouse and scroll interaction handlers
function initExpeditionsInteractions() {
  const expeditionsList = document.querySelector(".expeditions-list");
  if (!expeditionsList) return;

  const expeditionsElements = document.querySelectorAll(".expedition");
  let lastMousePosition = { x: 0, y: 0 };
  let activeExpedition = null;
  let ticking = false;
  let hoverHandlers = new Map();
  let expeditionPositions = new Map();
  let mousemoveHandler = null;
  let scrollHandler = null;

  function updateExpeditions() {
    if (activeExpedition) {
      const rect = activeExpedition.getBoundingClientRect();
      const isStillOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (!isStillOver) {
        const wrapper = activeExpedition.querySelector(".expedition-wrapper");
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeExpedition = null;
      }
    }

    expeditionsElements.forEach((expedition) => {
      if (expedition === activeExpedition) return;

      const rect = expedition.getBoundingClientRect();
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (isMouseOver) {
        const wrapper = expedition.querySelector(".expedition-wrapper");
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
        activeExpedition = expedition;
      }
    });

    ticking = false;
  }

  function setupMouseListeners() {
    const isMobile = window.innerWidth < 1000;

    if (mousemoveHandler) {
      document.removeEventListener("mousemove", mousemoveHandler);
      mousemoveHandler = null;
    }
    if (scrollHandler) {
      document.removeEventListener("scroll", scrollHandler);
      scrollHandler = null;
    }

    if (!isMobile) {
      mousemoveHandler = (e) => {
        lastMousePosition.x = e.clientX;
        lastMousePosition.y = e.clientY;
      };
      document.addEventListener("mousemove", mousemoveHandler);

      scrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateExpeditions();
          });
          ticking = true;
        }
      };
      document.addEventListener("scroll", scrollHandler, { passive: true });
    }
  }

  function setupHoverListeners() {
    const isMobile = window.innerWidth < 1000;

    expeditionsElements.forEach((expedition) => {
      const wrapper = expedition.querySelector(".expedition-wrapper");

      if (hoverHandlers.has(expedition)) {
        const handlers = hoverHandlers.get(expedition);
        expedition.removeEventListener("mouseenter", handlers.enter);
        expedition.removeEventListener("mouseleave", handlers.leave);
        hoverHandlers.delete(expedition);
      }

      if (!isMobile) {
        if (!expeditionPositions.has(expedition)) {
          expeditionPositions.set(expedition, POSITIONS.TOP);
        }

        const enterHandler = (e) => {
          activeExpedition = expedition;
          const rect = expedition.getBoundingClientRect();
          const enterFromTop = e.clientY < rect.top + rect.height / 2;
          const currentPosition = expeditionPositions.get(expedition);

          if (enterFromTop || currentPosition === POSITIONS.BOTTOM) {
            expeditionPositions.set(expedition, POSITIONS.MIDDLE);
            gsap.to(wrapper, {
              y: POSITIONS.MIDDLE,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };

        const leaveHandler = (e) => {
          activeExpedition = null;
          const rect = expedition.getBoundingClientRect();
          const leavingFromTop = e.clientY < rect.top + rect.height / 2;
          const newPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
          expeditionPositions.set(expedition, newPosition);
          gsap.to(wrapper, {
            y: newPosition,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        expedition.addEventListener("mouseenter", enterHandler);
        expedition.addEventListener("mouseleave", leaveHandler);

        hoverHandlers.set(expedition, {
          enter: enterHandler,
          leave: leaveHandler,
        });
      } else {
        expeditionPositions.set(expedition, POSITIONS.TOP);
        gsap.set(wrapper, { y: POSITIONS.TOP });
      }
    });
  }

  setupMouseListeners();
  setupHoverListeners();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupHoverListeners();
      setupMouseListeners();
    }, 100);
  });
}
