const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelectorAll(
  ".status-card, .dashboard-card, .wide-panel, .side-panel, .report-card, .geo-card, .download-card, .hardware-card, .alert-card, .glass-card, .feature-card"
).forEach((card, index) => {
  card.classList.add("floating");
  card.style.transitionDelay = `${Math.min(index * 40, 320)}ms`;
});

const downloadFill = document.querySelector("#download-fill");
const downloadPercent = document.querySelector("#download-percent");
const downloadBar = document.querySelector(".download-bar");
const downloadState = document.querySelector("#download-state");

if (downloadFill && downloadPercent && downloadBar && downloadState) {
  const transferDuration = 6500;
  const restartDelay = 1100;
  let startTime;

  const renderProgress = (progress) => {
    const percentage = Math.min(100, Math.floor(progress * 100));
    downloadFill.style.width = `${percentage}%`;
    downloadPercent.textContent = `${percentage}%`;
    downloadBar.setAttribute("aria-valuenow", `${percentage}`);
    downloadState.textContent =
      percentage === 100
        ? "Estado: descarga completada"
        : "Estado: transfiriendo data_v4.tgd ...";
  };

  const animateDownload = (time) => {
    if (startTime === undefined) {
      startTime = time;
    }

    const progress = Math.min((time - startTime) / transferDuration, 1);
    renderProgress(progress);

    if (progress < 1) {
      requestAnimationFrame(animateDownload);
      return;
    }

    window.setTimeout(() => {
      startTime = undefined;
      renderProgress(0);
      requestAnimationFrame(animateDownload);
    }, restartDelay);
  };

  requestAnimationFrame(animateDownload);
}

const geoPath = document.querySelector("#geo-path");
const geoRoad = document.querySelector("#geo-road");
const geoTravelled = document.querySelector("#geo-travelled");
const geoVehicle = document.querySelector("#geo-vehicle");
const geoSpeed = document.querySelector("#geo-speed");
const geoCoordinates = document.querySelector("#geo-coordinates");
const geoZone = document.querySelector("#geo-zone");
const geoToggle = document.querySelector("#geo-toggle");
const geoCenter = document.querySelector("#geo-center");
const pinStart = document.querySelector("#pin-start");
const pinEnd = document.querySelector("#pin-end");
const pinEndDot = document.querySelector("#pin-end-dot");

if (
  geoPath &&
  geoRoad &&
  geoTravelled &&
  geoVehicle &&
  geoSpeed &&
  geoCoordinates &&
  geoZone &&
  geoToggle &&
  geoCenter &&
  pinStart &&
  pinEnd &&
  pinEndDot
) {
  const routes = [
    {
      path: "M 477 52 L 438 84 L 423 182 L 403 241 L 392 297 L 387 348 L 348 369 L 278 359 L 214 324 L 190 296",
      start: { x: 477, y: 52 },
      end: { x: 190, y: 296 },
      from: { lat: 43.4627, lng: -3.8093 },
      to: { lat: 42.5987, lng: -5.5671 },
      zones: ["S-10 / Santander", "A-67 / Torrelavega", "A-67 / Reinosa", "A-67 / Osorno", "A-231 / Sahagun", "A-231 / Leon"]
    },
    {
      path: "M 190 296 L 214 324 L 278 359 L 348 369 L 358 460 L 357 497 L 327 559",
      start: { x: 190, y: 296 },
      end: { x: 327, y: 559 },
      from: { lat: 42.5987, lng: -5.5671 },
      to: { lat: 41.6523, lng: -4.7245 },
      zones: ["A-231 / Leon", "A-231 / Sahagun", "A-67 / Palencia", "A-62 / Valladolid"]
    },
    {
      path: "M 327 559 L 340 537 L 357 497 L 365 485 L 358 460 L 394 453 L 485 456 L 495 367 L 556 310 L 591 286 L 618 271 L 662 226",
      start: { x: 327, y: 559 },
      end: { x: 662, y: 226 },
      from: { lat: 41.6523, lng: -4.7245 },
      to: { lat: 42.8467, lng: -2.6727 },
      zones: ["A-62 / Valladolid", "A-62 / Palencia", "A-62 / Burgos", "AP-1 / Miranda de Ebro", "A-1 / Vitoria-Gasteiz"]
    }
  ];
  const routeDuration = 14500;
  let routeStart;
  let routeProgress = 0;
  let routeIndex = 0;
  let routeLength = 0;
  let trackingActive = true;

  const setEndPin = ({ x, y }) => {
    pinEnd.setAttribute("d", `M${x} ${y - 10}c-6 0-10 4-10 10 0 8 10 19 10 19s10-11 10-19c0-6-4-10-10-10z`);
    pinEndDot.setAttribute("cx", `${x}`);
    pinEndDot.setAttribute("cy", `${y}`);
  };

  const setRoute = (index) => {
    const route = routes[index];

    geoRoad.setAttribute("d", route.path);
    geoPath.setAttribute("d", route.path);
    geoTravelled.setAttribute("d", route.path);
    pinStart.setAttribute("cx", `${route.start.x}`);
    pinStart.setAttribute("cy", `${route.start.y}`);
    setEndPin(route.end);

    routeLength = geoPath.getTotalLength();
    geoTravelled.style.strokeDasharray = `${routeLength}`;
    geoTravelled.style.strokeDashoffset = `${routeLength}`;
    routeProgress = 0;
    routeStart = undefined;
    updateVehicle(0);
  };

  const updateVehicle = (progress) => {
    const route = routes[routeIndex];
    const point = geoPath.getPointAtLength(routeLength * progress);
    const nextPoint = geoPath.getPointAtLength(routeLength * Math.min(progress + 0.01, 1));
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI - 90;
    const latitude = route.from.lat + (route.to.lat - route.from.lat) * progress;
    const longitude = route.from.lng + (route.to.lng - route.from.lng) * progress;
    const speed = Math.round(84 + Math.sin(progress * Math.PI * 7) * 10);
    const zoneIndex = Math.min(route.zones.length - 1, Math.floor(progress * route.zones.length));

    geoVehicle.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    geoTravelled.style.strokeDashoffset = `${routeLength * (1 - progress)}`;
    geoSpeed.textContent = `${speed} km/h`;
    geoCoordinates.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    geoZone.textContent = route.zones[zoneIndex];
  };

  const trackVehicle = (time) => {
    if (trackingActive) {
      if (routeStart === undefined) {
        routeStart = time - routeProgress * routeDuration;
      }

      const elapsed = time - routeStart;
      routeProgress = Math.min(elapsed / routeDuration, 1);
      updateVehicle(routeProgress);

      if (elapsed >= routeDuration) {
        routeIndex = (routeIndex + 1) % routes.length;
        setRoute(routeIndex);
        routeStart = time;
      }
    }

    requestAnimationFrame(trackVehicle);
  };

  geoToggle.addEventListener("click", () => {
    trackingActive = !trackingActive;
    geoToggle.textContent = trackingActive ? "Pausar seguimiento" : "Reanudar seguimiento";
    geoToggle.classList.toggle("is-active", !trackingActive);

    if (trackingActive) {
      routeStart = undefined;
    }
  });

  geoCenter.addEventListener("click", () => {
    geoVehicle.classList.remove("is-centered");
    requestAnimationFrame(() => geoVehicle.classList.add("is-centered"));
    window.setTimeout(() => geoVehicle.classList.remove("is-centered"), 1450);
  });

  setRoute(0);
  requestAnimationFrame(trackVehicle);
}
