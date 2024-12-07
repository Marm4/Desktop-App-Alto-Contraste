const productoId = localStorage.getItem('productoId');
let producto;

document.getElementById('back-svg').addEventListener('click', () => {
    window.api.goBack();
  });

(async () => {
    producto = await window.api. getProductoById(productoId);

    if (producto) {
      document.getElementById('nombre-producto').value = producto.nombre;
      document.getElementById('portada-producto').value = producto.url;
      document.getElementById('descripcion-producto').value = producto.descrpicion;
      const img = document.createElement('img');
      img.src = producto.url;
      img.style.width = '100%';
      img.style.height = '200px';
      img.style.objectFit = 'cover'; 
      img.style.objectPosition = 'center';
      console.log("Url: ", producto.url);
    
      const contenedor = document.getElementById('producto-container');
      if (contenedor) {
        contenedor.appendChild(img);
      } else {
        console.error('No se encontró el contenedor para agregar la imagen.');
      }
    }
    else{
      console.error("No se encontro el producto");
    }


    document.getElementById('borrar-producto').onclick = () =>{
        window.api.deleteProducto(producto.id);
        window.api.goBack();
    }

     function extractFileId(webViewLink) {
    const match = webViewLink.match(/\/file\/d\/([^/]+)\//);
    return match ? match[1] : null;
  }

    document.getElementById('guardar-producto').onclick = async () =>{
      let nuevoNombre = document.getElementById('nombre-producto').value;
      let nuevaPortada = document.getElementById('portada-producto').value;
      if(nuevoNombre !== producto.nombre){
        if(await window.api.isProductoPresent(nuevoNombre)) {
          console.error("El nombre ya existe en la lista de productos.");
          return;
        }
      }
      if(nuevaPortada !== producto.url){
        const portadaId = extractFileId(nuevaPortada);
        if(portadaId === null){
          console.error("Url portada incorrecta");
          return;
        }
        const finalPortada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`
        producto.url = finalPortada;
      }
      producto.descrpicion = document.getElementById('descripcion-producto').value;
      producto.nombre = nuevoNombre;
      window.api.updateProducto(producto.id, producto);
      window.api.goBack();
    }


    function extractFileId(webViewLink) {
      const match = webViewLink.match(/\/file\/d\/([^/]+)\//);
      return match ? match[1] : null;
    }
  
  })();