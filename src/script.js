document.addEventListener("DOMContentLoaded", async () => {
  const navItems = document.querySelectorAll(".bottom-bar nav ul li");

  // Función para cargar y mostrar una vista
  function loadView(sectionId) {
    const content = document.getElementById("content");
    let section = document.getElementById(sectionId);

    if (!section) {
      const url = `views/${sectionId}.html`;
      fetch(url)
        .then(response => response.text())
        .then(data => {
          section = document.createElement("div");
          section.id = sectionId;
          section.classList.add("section");
          section.innerHTML = data;
          content.appendChild(section);

          // Importar el script correspondiente a la vista cargada
          const script = document.createElement("script");
          script.src = `scripts/${sectionId}.js`;
          document.body.appendChild(script);

          showView(sectionId);
        })
        .catch(err => console.error("Error cargando la vista:", err));
    } else {
      showView(sectionId);
    }
  }

  // Función para mostrar una vista y ocultar las demás
  function showView(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
      section.style.display = section.id === sectionId ? "block" : "none";
    });

    document.querySelectorAll(".bottom-bar nav ul li").forEach(item => {
      item.classList.remove("active");
    });
    document.getElementById(`nav-${sectionId}`).classList.add("active");
  }

  // Navegar a la primera sección por defecto
  loadView("novios");

  // Añadir evento de clic a los elementos de navegación
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const sectionId = item.id.replace("nav-", "");
      loadView(sectionId);
    });
  });
});


const icons = document.querySelectorAll('.icon-menu-detail');

icons.forEach(icon => {
  icon.addEventListener('click', () => {
    icons.forEach(i => i.classList.remove('active'));
    icon.classList.add('active');
  });
});

document.getElementById('novios-icon').classList.add('active');