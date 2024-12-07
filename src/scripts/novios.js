(async () => {
  const noviosGlobal = await window.api.getNovios();
  console.log("Novios recuperados:", noviosGlobal);

  function displayNovios(novios) {
    const noviosContainer = document.getElementById("lista-novios");
    if (noviosContainer) {
      noviosContainer.innerHTML = "";
      novios.forEach(novio => {
        const novioElement = document.createElement("div");
        novioElement.textContent = novio.nombre; // Ajusta esto según la estructura de tus datos
        noviosContainer.appendChild(novioElement);
        novioElement.onclick = () => showNovioDetail(novio);
      });
    } else {
      console.error("No se encontró el contenedor de novios");
    }
  }

  function showNovioDetail(novio) {
    // Guarda el ID del novio en el almacenamiento local o en algún otro lugar
    localStorage.setItem('novioId', novio.id);

    // Navega a la vista de detalles del novio
    window.api.navigateTo('src/views/novios-detail.html');
  }

  // Mostrar todos los novios al cargar la vista
  displayNovios(noviosGlobal);

  // Filtrar novios al escribir en el campo de búsqueda
  document.getElementById("search-novios").addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredNovios = noviosGlobal.filter(novio => novio.nombre.toLowerCase().includes(searchTerm));
    displayNovios(filteredNovios);
  });

  document.getElementById('button-guardar-novios').onclick = async () => {
    const nombre = document.getElementById('nombre-novios').value.toLowerCase();
    const palabraClave = document.getElementById('palabra-clave-novios').value.toLowerCase();
    
    if (nombre === "" || palabraClave === "") {
      mostrarMensaje("El nombre o la palabra clave están vacíos.")
      console.error("El nombre o la palabra clave están vacíos.");
      return;
    }
  
    var nombreExistente = false;
    noviosGlobal.forEach(novio => {
      if (novio.nombre === nombre) {
        nombreExistente = true;
      }
    });
  
    if (nombreExistente) {
      mostrarMensaje("El nombre ya existe en la lista de novios.")
      console.error("El nombre ya existe en la lista de novios.");
      return;
    }

    const checkbox = document.getElementById('myCheckbox');
    
    let noviosNuevo = {
      id: "newId",
      nombre: nombre,
      palabraClave: palabraClave,
      formularioActivo: !checkbox.checked,
      formulario: {
        complete: 1,
        dniNovia: "",
        dniNovio: "",
        fechaCeremonia: "",
        fechaCivil: "",
        fechaFiesta: "",
        fechaEstimadaCeremonia: false,
        fechaEstimadaCivil: false,
        fechaEstimadaFiesta: false,
        mailNovio: "",
        mailNovia: "",
        nombreNovio: "",
        nombreNovia: "",
        ubicacionCeremonia: "",
        ubicacionCivil: "",
        ubicacionFiesta: ""
      }
    };
  
    try {
      noviosNuevo.id = await window.api.addNovio(noviosNuevo);
      noviosGlobal.push(noviosNuevo); // Añadir el nuevo novio a la lista global
      console.log("Nuevo novio guardado:", noviosNuevo.id);
      addNoviosView(noviosNuevo);
    } catch (error) {
      console.error("Error al guardar el nuevo novio:", error);
    }
  }

  function addNoviosView(novios){
    const noviosContainer = document.getElementById("lista-novios");
    if (noviosContainer) {
      const novioElement = document.createElement("div");
      novioElement.textContent = novios.nombre; 
      noviosContainer.appendChild(novioElement);
      novioElement.onclick = () => showNovioDetail(novios);
    } 
    document.getElementById('nombre-novios').value = ""
    document.getElementById('palabra-clave-novios').value = ""
  }
  

  function mostrarMensaje(mensaje) {
    const errorElement = document.getElementById('menasje-error-novios');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }
 
})();