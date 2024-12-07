(async () => {
    const productos = await window.api.getProductos();

function displayProductos() {
    const productosContainer = document.getElementById("lista-productos");
    if (productosContainer) {
        productosContainer.innerHTML = "";
        productos.forEach(producto => {
          const productoElement = document.createElement("div");
          productoElement.textContent = producto.nombre; // Ajusta esto según la estructura de tus datos
          productosContainer.appendChild(productoElement);
          productoElement.onclick = () => showProductoDetail(producto.id);
      });
    } else {
      console.error("No se encontró el contenedor productos");
    }
  }
  displayProductos();

  function extractFileId(webViewLink) {
    const match = webViewLink.match(/\/file\/d\/([^/]+)\//);
    return match ? match[1] : null;
  }

  
  function showProductoDetail(productoId) {
    localStorage.setItem('productoId', productoId);
    window.api.navigateTo('src/views/producto-detail.html');
  }
  

  document.getElementById('guardar-producto').onclick = async () => {
    const nombre = document.getElementById('nombre-producto').value;
    const descripcion = document.getElementById('descripcion-producto').value;
    const portada =  document.getElementById('portada-producto').value;
    
    if (nombre === "" || descripcion === "" || portada === "") {
      console.error("Complete todos los campos");
      mostrarMensaje("Complete todos los campos")
      return;
    }

    var productoExistente = false;
    productos.forEach(producto => {
      if (producto.nombre === nombre) {
        productoExistente = true;
      }
    });
  
    if (productoExistente) {
      mostrarMensaje("El nombre ya existe en la lista de productos.")
      console.error("El nombre ya existe en la lista de productos.");
      return;
    }

    const portadaId = extractFileId(portada);
    if(portadaId === null){
      mostrarMensaje("Url portada incorrecta")
      console.error("Url portada incorrecta");
      return;
    }
    const finalPortada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`
  
   
  
    let productoNuevo = {
      id: "newId",
      nombre: nombre,
      descrpicion: descripcion,
      url: finalPortada
    };
  
    try {
      productoNuevo.id = await window.api.addProducto(productoNuevo);
      productos.push(productoNuevo); 
      console.log("Nuevo producto guardado:", productoNuevo.id);
      addProductoView(productoNuevo);
       document.getElementById('nombre-producto').value = "";
       document.getElementById('descripcion-producto').value = "";
        document.getElementById('portada-producto').value = "";
    } catch (error) {
      console.error("Error al guardar el nuevo producto:", error);
    }
  }

  function addProductoView(producto){
    const productosContainer = document.getElementById("lista-productos");
    if (productosContainer) {
      const productoElement = document.createElement("div");
      productoElement.textContent = producto.nombre; 
      productosContainer.appendChild(productoElement);
      productoElement.onclick = () => showProductoDetail(producto.id);
    }
  }

  function mostrarMensaje(mensaje) {
    const errorElement = document.getElementById('menasje-error-productos');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }
})();

