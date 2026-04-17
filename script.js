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
