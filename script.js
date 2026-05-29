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
  geoToggle &&
  geoCenter &&
  pinStart &&
  pinEnd &&
  pinEndDot
) {
  const baseRoutes = [
    {
      path: "M 470 82 C 466 95 462 109 458 123 C 454 137 449 151 444 165 C 439 179 434 191 428 203 C 422 215 416 226 409 237 C 401 249 392 260 383 270 C 373 281 362 290 350 298 C 337 307 323 314 308 320 C 293 326 278 330 262 332 C 246 334 229 334 214 331 C 204 327 196 319 190 309",
      start: { x: 470, y: 82 },
      end: { x: 190, y: 309 },
      from: { lat: 43.4627, lng: -3.8093 },
      to: { lat: 42.5987, lng: -5.5671 },
      zones: ["S-10 / Santander", "A-67 / Torrelavega", "A-67 / Reinosa", "A-67 / Osorno", "A-231 / Sahagun", "A-231 / Leon"]
    },
    {
      path: "M 190 309 L 219 319 L 251 333 L 288 347 L 324 364 L 349 392 L 365 433 L 362 468 L 358 498",
      start: { x: 190, y: 309 },
      end: { x: 358, y: 498 },
      from: { lat: 42.5987, lng: -5.5671 },
      to: { lat: 41.6523, lng: -4.7245 },
      zones: ["A-231 / Leon", "A-231 / Sahagun", "A-67 / Palencia", "A-62 / Valladolid"]
    },
    {
      path: "M 358 498 L 368 468 L 379 435 L 398 405 L 423 377 L 452 351 L 488 326 L 522 303 L 554 281 L 582 255 L 608 233 L 636 211 L 662 196",
      start: { x: 358, y: 498 },
      end: { x: 662, y: 196 },
      from: { lat: 41.6523, lng: -4.7245 },
      to: { lat: 42.8467, lng: -2.6727 },
      zones: ["A-62 / Valladolid", "A-62 / Palencia", "A-62 / Burgos", "AP-1 / Miranda de Ebro", "A-1 / Vitoria-Gasteiz"]
    }
  ];
  const geoModeTransforms = {
    desktop: { scaleX: 1, scaleY: 1, tx: 0, ty: 0 },
    tablet: { scaleX: 1, scaleY: 1, tx: 0, ty: 0 },
    mobile: { scaleX: 1, scaleY: 1, tx: 0, ty: 0 }
  };
  const getGeoMode = () => {
    if (window.matchMedia("(max-width: 720px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 1100px)").matches) return "tablet";
    return "desktop";
  };
  const transformPoint = (point, transform) => ({
    x: point.x * transform.scaleX + transform.tx,
    y: point.y * transform.scaleY + transform.ty
  });
  const transformPath = (path, transform) => {
    const tokens = path.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
    const output = [];
    let currentCommand = "";
    let coordIndex = 0;

    tokens.forEach((token) => {
      if (/^[A-Za-z]$/.test(token)) {
        currentCommand = token;
        coordIndex = 0;
        output.push(token);
        return;
      }

      const value = Number(token);
      if (Number.isNaN(value)) return;

      const shouldTransform = currentCommand === "M" || currentCommand === "L" || currentCommand === "C";
      const transformed = shouldTransform
        ? coordIndex % 2 === 0
          ? value * transform.scaleX + transform.tx
          : value * transform.scaleY + transform.ty
        : value;
      coordIndex += shouldTransform ? 1 : 0;
      output.push(`${Math.round(transformed * 100) / 100}`);
    });

    return output.join(" ");
  };
  const buildRoute = (route, mode) => {
    const transform = geoModeTransforms[mode] ?? geoModeTransforms.desktop;
    return {
      ...route,
      path: transformPath(route.path, transform),
      start: transformPoint(route.start, transform),
      end: transformPoint(route.end, transform)
    };
  };

  let activeGeoMode = getGeoMode();
  let routes = baseRoutes.map((route) => buildRoute(route, activeGeoMode));
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

  const refreshRoutes = () => {
    routes = baseRoutes.map((route) => buildRoute(route, activeGeoMode));
  };

  const setRoute = (index, progress = 0) => {
    const route = routes[index];

    geoRoad.setAttribute("d", route.path);
    geoPath.setAttribute("d", route.path);
    geoTravelled.setAttribute("d", route.path);
    pinStart.setAttribute("cx", `${route.start.x}`);
    pinStart.setAttribute("cy", `${route.start.y}`);
    setEndPin(route.end);

    routeLength = geoPath.getTotalLength();
    geoTravelled.style.strokeDasharray = `${routeLength}`;
    routeProgress = progress;
    geoTravelled.style.strokeDashoffset = `${routeLength * (1 - progress)}`;
    routeStart = undefined;
    updateVehicle(progress);
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
    if (geoSpeed) geoSpeed.textContent = `${speed} km/h`;
    if (geoCoordinates) geoCoordinates.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    if (geoZone) geoZone.textContent = route.zones[zoneIndex];
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

  const syncRouteForViewport = () => {
    const nextMode = getGeoMode();
    if (nextMode === activeGeoMode) return;

    const savedProgress = routeProgress;
    activeGeoMode = nextMode;
    refreshRoutes();
    setRoute(routeIndex, savedProgress);

    if (trackingActive) {
      routeStart = performance.now() - savedProgress * routeDuration;
    }
  };

  window.addEventListener("resize", syncRouteForViewport, { passive: true });

  setRoute(0);
  requestAnimationFrame(trackVehicle);
}
