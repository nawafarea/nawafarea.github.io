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