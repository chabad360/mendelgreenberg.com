document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll<HTMLImageElement>(".content img");

  images.forEach((image) => {
    image.addEventListener("click", () => {
      const lightbox = document.createElement("dialog");
      lightbox.classList.add("lightbox");

      const closeButton = document.createElement("button");
      closeButton.classList.add("lightbox-close");
      closeButton.textContent = "×";
      lightbox.appendChild(closeButton);

      const lightboxImage = document.createElement("img");
      lightboxImage.src = image.src;
      lightboxImage.srcset = image.srcset;
      lightboxImage.alt = image.alt;
      lightbox.appendChild(lightboxImage);

      document.body.appendChild(lightbox);
      lightbox.showModal();

      lightbox.addEventListener("click", () => {
        document.body.removeChild(lightbox);
      });
    });
    image.style.cursor = "zoom-in";
  });
});
