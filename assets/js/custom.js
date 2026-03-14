/* document.addEventListener("DOMContentLoaded", () => {


  const backgrounds = document.querySelectorAll(
    "#background-image, .single_hero_background img"
  );

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener("mousemove", (e) => {
    targetX = (window.innerWidth / 2 - e.clientX) / 60;
    targetY = (window.innerHeight / 2 - e.clientY) / 60;
  });

  function animateBackground() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    backgrounds.forEach((bg) => {
      bg.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) scale(1.05)`;
    });

    requestAnimationFrame(animateBackground);
  }

  animateBackground();




  const images = document.querySelectorAll(
    ".prose img:not(.nozoom), .article-link--card img"
  );

  images.forEach((img) => {

    img.addEventListener("mousemove", (e) => {

      const rect = img.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = (x - centerX) / 20;
      const rotateX = (centerY - y) / 20;

      img.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

    });

    img.addEventListener("mouseleave", () => {
      img.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)";
    });

  });

});
 */
 
 
document.addEventListener("DOMContentLoaded", () => {
  const heroImages = document.querySelectorAll(
    "#background-image, #background-image-main, article > div.overflow-hidden.rounded-md img"
  );

  if (!heroImages.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener("mousemove", (e) => {
    targetX = (window.innerWidth / 2 - e.clientX) / 70;
    targetY = (window.innerHeight / 2 - e.clientY) / 70;
  });

  document.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function animateHero() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    heroImages.forEach((img) => {
      img.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.04)`;
      img.style.willChange = "transform";
    });

    requestAnimationFrame(animateHero);
  }

  animateHero();
});









document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(
    ".article-link--card, .article-link--related"
  );

  cards.forEach((card) => {
    let frame = null;
    const img = card.querySelector("img");

    const resetCard = () => {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
      if (img) {
        img.style.transform = "translateZ(0) scale(1)";
      }
    };

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = (x - centerX) / 9;
      const rotateX = (centerY - y) / 9;

      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

        if (img) {
          img.style.transform = "translateZ(24px) scale(1.08)";
        }
      });
    });

    card.addEventListener("mouseleave", () => {
      if (frame) cancelAnimationFrame(frame);
      resetCard();
    });

    card.addEventListener("blur", resetCard);
  });
});






document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------- */
  /* Tilt cards                       */
  /* -------------------------------- */
  const cards = document.querySelectorAll(
    ".article-link--card, .article-link--related"
  );

  cards.forEach((card) => {
    let frame = null;
    const img = card.querySelector("img");

    const resetCard = () => {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
      if (img) {
        img.style.transform = "translateZ(0) scale(1)";
      }
      card.style.removeProperty("--mouse-x");
      card.style.removeProperty("--mouse-y");
    };

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = (x - centerX) / 9;
      const rotateX = (centerY - y) / 9;

      const mouseX = `${x}px`;
      const mouseY = `${y}px`;

      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

        card.style.setProperty("--mouse-x", mouseX);
        card.style.setProperty("--mouse-y", mouseY);

        if (img) {
          img.style.transform = "translateZ(24px) scale(1.08)";
        }
      });
    });

    card.addEventListener("mouseleave", () => {
      if (frame) cancelAnimationFrame(frame);
      resetCard();
    });

    card.addEventListener("blur", resetCard);
  });



/* Card glow mouse tracking */
document.querySelectorAll(".article-link--card, .article-link--related")
.forEach(card => {

  card.addEventListener("mousemove", e => {

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

  });

});











/* -------------------------------- */
/* Reading progress circle          */
/* -------------------------------- */

const articleContent = document.querySelector(".article-content");

if (articleContent) {
  const circleWrapper = document.createElement("div");
  circleWrapper.id = "reading-progress-circle";

  circleWrapper.innerHTML = `
    <svg viewBox="0 0 36 36">
      <circle id="progress-bg" cx="18" cy="18" r="15.8"></circle>
      <circle
        id="progress-bar"
        cx="18"
        cy="18"
        r="15.8"
        stroke-dasharray="99.3"
        stroke-dashoffset="99.3">
      </circle>
    </svg>
    <div id="progress-percent">0%</div>
  `;

  document.body.appendChild(circleWrapper);

  const progressBar = document.getElementById("progress-bar");
  const progressPercent = document.getElementById("progress-percent");
  const circumference = 99.3;

  const updateProgress = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    let progress = 0;

    if (docHeight > 0) {
      progress = scrollTop / docHeight;
    }

    progress = Math.max(0, Math.min(progress, 1));

    const offset = circumference * (1 - progress);
    progressBar.style.strokeDashoffset = offset;
    progressPercent.textContent = `${Math.round(progress * 100)}%`;

    const glowStrength = 6 + progress * 10;
    progressBar.style.filter = `drop-shadow(0 0 ${glowStrength}px rgba(34,197,94,0.55))`;
  };

  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}});







