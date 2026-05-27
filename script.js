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
const geoTravelled = document.querySelector("#geo-travelled");
const geoVehicle = document.querySelector("#geo-vehicle");
const geoSpeed = document.querySelector("#geo-speed");
const geoCoordinates = document.querySelector("#geo-coordinates");
const geoZone = document.querySelector("#geo-zone");
const geoToggle = document.querySelector("#geo-toggle");
const geoCenter = document.querySelector("#geo-center");

if (
  geoPath &&
  geoTravelled &&
  geoVehicle &&
  geoSpeed &&
  geoCoordinates &&
  geoZone &&
  geoToggle &&
  geoCenter
) {
  const routeLength = geoPath.getTotalLength();
  const routeDuration = 14500;
  const routeZones = ["A-7 / Valencia", "V-30 / Quart de Poblet", "AP-7 / Sagunto", "A-23 / Puzol"];
  let routeStart;
  let routeProgress = 0;
  let trackingActive = true;

  geoTravelled.style.strokeDasharray = `${routeLength}`;
  geoTravelled.style.strokeDashoffset = `${routeLength}`;

  const updateVehicle = (progress) => {
    const point = geoPath.getPointAtLength(routeLength * progress);
    const latitude = 39.4702 + progress * 0.3261;
    const longitude = -0.3768 + progress * 0.1645;
    const speed = Math.round(78 + Math.sin(progress * Math.PI * 7) * 12);
    const zoneIndex = Math.min(routeZones.length - 1, Math.floor(progress * routeZones.length));

    geoVehicle.setAttribute("transform", `translate(${point.x} ${point.y})`);
    geoTravelled.style.strokeDashoffset = `${routeLength * (1 - progress)}`;
    geoSpeed.textContent = `${speed} km/h`;
    geoCoordinates.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    geoZone.textContent = routeZones[zoneIndex];
  };

  const trackVehicle = (time) => {
    if (trackingActive) {
      if (routeStart === undefined) {
        routeStart = time - routeProgress * routeDuration;
      }

      routeProgress = ((time - routeStart) % routeDuration) / routeDuration;
      updateVehicle(routeProgress);
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

  updateVehicle(0);
  requestAnimationFrame(trackVehicle);
}
