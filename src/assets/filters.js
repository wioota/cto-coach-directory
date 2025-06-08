document.addEventListener("DOMContentLoaded", function () {
  const regionFilter = document.getElementById("region-filter");
  const geographyFilter = document.getElementById("geography-filter");
  const specialtyFilter = document.getElementById("specialty-filter");
  const remoteFilter = document.getElementById("remote-filter");
  const cards = document.querySelectorAll(".coach-card");

  function filterCards() {
    const region = regionFilter.value;
    const geography = geographyFilter.value;
    const specialty = specialtyFilter.value;
    const remote = remoteFilter.value;

    cards.forEach(card => {
      const cardRegion = card.getAttribute("data-region");
      const cardGeographies = card.getAttribute("data-geographies");
      const cardSpecialties = card.getAttribute("data-specialties");
      const cardRemote = card.getAttribute("data-remote");

      let show = true;
      if (region && cardRegion !== region) show = false;
      if (geography && (!cardGeographies || !cardGeographies.split(",").includes(geography))) show = false;
      if (specialty && (!cardSpecialties || !cardSpecialties.includes(specialty))) show = false;
      if (remote && String(cardRemote) !== remote) show = false;

      card.style.display = show ? "" : "none";
    });
  }

  regionFilter.addEventListener("change", filterCards);
  geographyFilter.addEventListener("change", filterCards);
  specialtyFilter.addEventListener("change", filterCards);
  remoteFilter.addEventListener("change", filterCards);
});
