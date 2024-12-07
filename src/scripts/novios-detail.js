const icons = document.querySelectorAll('.icon-novios-detail');
const novioId = localStorage.getItem('novioId');
const apiKey = '';
let isDownloading = false;
let novios;


//Iconos
icons.forEach(icon => {
  icon.addEventListener('click', () => {
    icons.forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
    icon.classList.add('active');
    const viewId = icon.getAttribute('data-view');
    document.getElementById(`view-${viewId}`).classList.add('active');
  });
});

document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
document.getElementById('view-fotos').classList.add('active');
document.querySelector('.icon-novios-detail[data-view="fotos"]').classList.add('active');


//Novios
(async () => {
  novios = await window.api.getNovioById(novioId);
    function displayNovios(novios) {
      if(novios){
        const fotos = document.getElementById("fotos-multimedia-novios-detail");
        const video = document.getElementById("video-multimedia-novios-detail");
        const carpetas = document.getElementById("carpetas-multimedia-novios-detail");
        const eventos = document.getElementById("eventos-multimedia-novios-detail");
        if (fotos && video) {
          fotos .innerHTML = "";
          video.innerHTML = "";
          const multimedia = novios.multimedia;
          if(multimedia){
            (multimedia).forEach(media =>{
              const mediaElement = document.createElement("div");
              mediaElement.textContent = media.nombre;
              mediaElement.id = media.nombre;
              mediaElement.onclick = () => showEditMedia(media, mediaElement);
              if(media.fotos){
                fotos.appendChild(mediaElement);
                
              }
              else{
                video.append(mediaElement);
              }
            })
          }
          
        }
        if(carpetas){
          carpetas.innerHTML = "";
          const carpetasNovios = novios.carpetas;
          if(carpetasNovios){
            (novios.carpetas).forEach(carpeta =>{
              const carpetaElement = document.createElement("div");
              carpetaElement.textContent = carpeta.nombre;
              carpetas.appendChild(carpetaElement);
              carpetaElement.onclick = () => showCarpetaDetail(carpeta);
            })
          }
        }
        if(eventos){
          eventos.innerHTML = "";
          const eventosNovios = novios.eventos;
          if(eventosNovios){
            eventosNovios.forEach(evento =>{
              const eventoElement = document.createElement("div");
              eventoElement.textContent = evento.nombre;
              eventos.appendChild(eventoElement);
              eventoElement.onclick = () => showEventoDetail(evento);
            })
          }
        }
      }
    }
    displayNovios(novios);
    document.getElementById("nombre-novios-title").textContent = novios.nombre;
    document.getElementById("edit-svg").onclick = () => showEditNovios(novios)
})();


function extractFolderId(url) {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractFileId(webViewLink) {
  const match = webViewLink.match(/\/file\/d\/([^/]+)\//);
  return match ? match[1] : null;
}

//Guardar fotos
document.getElementById('guardar-media-fotos').addEventListener('click', () => {
  if(!novios){
    return;
  }
  const nombre = document.getElementById('nombre-media-fotos').value;
  const urlCarpeta = document.getElementById('url-media-fotos').value;
  const urlPortada = document.getElementById('portada-media-fotos').value;

  function mostrarError(mensaje) {
    const errorElement = document.getElementById('mensaje-error-fotos');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }

  if(nombre !== "" && urlCarpeta !== "" && urlPortada !== ""){
    var nombreExiste = false;
    if(novios.multimedia !== null && novios.multimedia !== undefined){
      (novios.multimedia).forEach(media =>{
        if(media.nombre === nombre && media.fotos){
          nombreExiste = true;
        }
    })
    }
    if(nombreExiste){
      mostrarError("El nombre ya existe.");
      console.log("El nombre ya existe");
      return;
    }

    async function guardarMediaFotos(){
      const urls = await getUrls(urlCarpeta);
      if(urls === null){
        mostrarError("Url de carpeta incorrecta.");
        console.log("Url de carpeta incorrecta");
        return;
      }
      const portadaId = extractFileId(urlPortada);
      if(portadaId === null){
        mostrarError("Url de portada incorrecta.");
        console.log("Url de portada incorrecta");
        return;
      } 
      const portada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`;

      let multimedia = {
        fotos: true, 
        portada: portada,
        nombre: nombre,
        urls: urls
      };
      if(novios.multimedia){
        novios.multimedia.push(multimedia);
      }
      else{
        novios.multimedia = []
        novios.multimedia.push(multimedia);
      }
      document.getElementById('nombre-media-fotos').value = '';
      document.getElementById('url-media-fotos').value = '';
      document.getElementById('portada-media-fotos').value = '';
      addMediaView(multimedia, true);
      actulizarNovios();
      }
    guardarMediaFotos();
  }
  else{
    console.log("Contenido fotos-media vacio");
    mostrarError("Complete todos los campos.");
  }
});

//Guardar video
document.getElementById('guardar-media-video').addEventListener('click', () => {
  if(!novios){
    return;
  }

  const nombre = document.getElementById('nombre-media-video').value;
  const urlVideo= document.getElementById('url-media-video').value;
  const urlPortada = document.getElementById('portada-media-video').value;

  function mostrarError(mensaje) {
    const errorElement = document.getElementById('mensaje-error-video');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }
  
  if(nombre !== "" && urlVideo !== "" && urlPortada !== ""){
    var nombreExiste = false;
    if(novios.mulitmedia !== undefined){
      (novios.multimedia).forEach(media =>{
        if(media.nombre === nombre && !media.fotos){
          nombreExiste = true;
        }
        })
    }
    
    if(nombreExiste){
      mostrarError("El nombre ya existe.");
      console.log("El nombre ya existe");
       return;
    }
      const urls = [];
      const videoId = extractFileId(urlVideo)
      if(videoId === null){
        mostrarError("Url de video incorrect.a");
        return;
      } 
      const url = "https://drive.google.com/file/d/" + videoId + "/preview";
      urls.push(url);
      const portadaId = extractFileId(urlPortada);
      if(portadaId === null){
        mostrarError("Url de portada incorrecta.");
        return;
      }  
      const portada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`;

      let multimedia = {
        fotos: false, 
        portada: portada,
        nombre: nombre,
        urls: urls
      };
      if(novios.multimedia){
        novios.multimedia.push(multimedia);
      }
      else{
        novios.multimedia = []
        novios.multimedia.push(multimedia);
      }

      document.getElementById('nombre-media-video').value = '';
      document.getElementById('url-media-video').value = '';
      document.getElementById('portada-media-video').value = '';
      
      addMediaView(multimedia, false);
      actulizarNovios();

  }
  else{
    mostrarError("Complete todos los campos.");
    console.log("Contenido fotos-media vacio");
  }
});

function addMediaView(media, isFotos){
  if(isFotos){
    const fotos = document.getElementById('fotos-multimedia-novios-detail');
    if(fotos){
      const mediaElement = document.createElement("div");
      mediaElement.textContent = media.nombre;
      fotos.appendChild(mediaElement);
      mediaElement.onclick = () => showEditMedia(media, mediaElement);
    }
  }
  else{
    const video = document.getElementById('video-multimedia-novios-detail');
    if(video){
      const mediaElement = document.createElement("div");
      mediaElement.textContent = media.nombre;
      video.appendChild(mediaElement);
      mediaElement.onclick = () => showEditMedia(media, mediaElement);
    }
  }
}

async function actulizarNovios(){
  await window.api.updateNovio(novioId, novios);
}

async function getUrls(folderUrl) {
  

  const folderId = extractFolderId(folderUrl);
  if(folderId === null){
    return null;
  }
  const urls = [];
  let pageToken = null;

  do {
    let endpoint = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,webViewLink),nextPageToken`;
    if (pageToken) {
      endpoint += `&pageToken=${pageToken}`;
    }

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      const files = data.files;

      if (files.length) {
        files.forEach((file) => {
          const fileId = extractFileId(file.webViewLink);
          const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1500`;
          urls.push(url);
        });
      } else {
        console.log('No files found.');
      }

      pageToken = data.nextPageToken;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  } while (pageToken);

  return urls.reverse();
}

document.getElementById('back-svg').addEventListener('click', () => {
  window.api.goBack();
});


//Editar media

const nombreInput = document.getElementById('input-nombre-edit-media');
const portadaInput = document.getElementById('input-portada-edit-media');

function handleInputChangeMedia() {
  const nombre = document.getElementById('input-nombre-edit-media').value;
  const portada = document.getElementById('input-portada-edit-media').value;
  console.log("Cambiando");
  if(nombre !== "" || portada !== ""){
    
    document.getElementById('button-guardar-media').innerText = "Guardar"
  }
  else{
    document.getElementById('button-guardar-media').innerText = "Cancelar"
  }

}
nombreInput.addEventListener('input', handleInputChangeMedia);
portadaInput.addEventListener('input', handleInputChangeMedia);

function showEditMedia(media, mediaElement){
  document.getElementById('edit-media-container').style.visibility = 'visible';
  document.getElementById('nombre-edit-media').innerText = media.nombre;
  document.getElementById('input-nombre-edit-media').value = "";
  document.getElementById('input-portada-edit-media').value = "";
  
  document.getElementById('button-guardar-media').onclick = () => {
    const nombre = document.getElementById('input-nombre-edit-media').value;
    const portada = document.getElementById('input-portada-edit-media').value;
    if(nombre !== "" || portada !== ""){
      if(nombre !== ""){
        media.nombre = nombre;
        mediaElement.textContent = nombre;
      }
      if(portada !== ""){
        if(portadaId === null){
          return;
        }
        const portadaId = extractFileId(portada)
        media.portada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`;
       
      }
      actulizarNovios();
    }
    document.getElementById('edit-media-container').style.visibility = 'hidden';
  }
  
  document.getElementById('button-borrar-media').onclick = () => {
    const updatedList = novios.multimedia.filter(item => item !== media);
    novios.multimedia = updatedList;
    actulizarNovios();
    document.getElementById('edit-media-container').style.visibility = 'hidden';
   
    const mediaRemove = document.getElementById(media.nombre);
      if (mediaRemove) {
        mediaRemove.remove();
      }
  }
}

//Editar novios
const nombreNoviosInput = document.getElementById('input-nombre-edit-novios');

function handleInputChange() {
  const nombre = nombreNoviosInput.value;

  if(nombre === ""){
    document.getElementById('button-guardar-novios').innerText = "Cancelar"
  }
  else{
    document.getElementById('button-guardar-novios').innerText = "Guardar"
  }

}
nombreNoviosInput.addEventListener('input', handleInputChange);

async function showEditNovios(novios) {
  document.getElementById('edit-novios-container').style.visibility = 'visible';
  document.getElementById('nombre-edit-novios').innerText = novios.nombre;

  document.getElementById('button-guardar-novios').onclick = async () => {
    const nombre = document.getElementById('input-nombre-edit-novios').value.toLowerCase();
    if (nombre !== "") {
      novios.nombre = nombre;
      const isNoviosPresent = await window.api.isNoviosPresent(nombre);
      console.log("novios present: ", isNoviosPresent);
    
      if (!isNoviosPresent) {
        actulizarNovios();
        document.getElementById("nombre-novios-title").textContent = novios.nombre;
      }
    }
    document.getElementById('edit-novios-container').style.visibility = 'hidden';
  };

  document.getElementById('button-borrar-novios').onclick = async () => {
    await window.api.deleteNovios(novios.id);
    window.api.goBack();
    document.getElementById('edit-novios-container').style.visibility = 'hidden';
  };
}


//Carpetas
function showCarpetaDetail(carpeta) {
  localStorage.setItem('carpetaNombre', carpeta.nombre);
  window.api.navigateTo('./src/views/carpeta-novios-detail.html');
}

function showEventoDetail(evento){
  localStorage.setItem('eventoNombre', evento.nombre);
  window.api.navigateTo('./src/views/evento-novios-detail.html');
}

//Eventos
document.getElementById('guardar-media-eventos').addEventListener('click', async () => {
  if(!novios){
    return
  }

  function mostrarError(mensaje){
    const errorElement = document.getElementById('mensaje-error-eventos');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }

  const nombre = document.getElementById('nombre-media-eventos').value;
  const portada = document.getElementById('portada-media-eventos').value;
  const cantidadImagenes = parseInt(document.getElementById('cantidad-imagenes-media-eventos').value);
  let nombreExistente = false;

  if(nombre == "" && portada == "" && cantidadImagenes == ""){
    mostrarError("Complete todos los campos")
  }
  if(novios.eventos){
    (novios.eventos).forEach(evento =>{
      if(evento.nombre == nombre){
        nombreExistente = true;
      }
    })
  }
 

  if(nombreExistente){
    mostrarError("Los novios ya tiene un evento con este nombre");
    return;
  }
  
  const portadaId = extractFileId(portada);
  if(portadaId === null){
    mostrarError("Url de portada incorrecta.");
    console.log("Url de portada incorrecta");
    return;
  } 

  const finalPortada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`;
  let folderId;

  try {
    folderId = await window.api.createFolder(nombre);
  } catch (error) {
    mostrarError("Error al crear la carpeta: " + error);
    return;
  }

  const evento = {
    id: folderId,
    cantidadImagenes: cantidadImagenes,
    nombre: nombre.toLowerCase(),
    multimedia: {
      fotos: true, 
      portada: finalPortada,
      nombre: nombre,
      urls: []
    }
  }
  if(novios.eventos){
    novios.eventos.push(evento);
  }
  else{
    novios.eventos = []
    novios.eventos.push(evento);
  }
  await actulizarNovios();

  const eventos = document.getElementById('eventos-multimedia-novios-detail');
    if(eventos){
      const eventoElement = document.createElement("div");
      eventoElement.textContent = nombre;
      eventos.appendChild(eventoElement);
      eventoElement.onclick = () => showEventoDetail(evento);
    }

    document.getElementById('nombre-media-eventos').value = "";
    document.getElementById('portada-media-eventos').value = "";
    document.getElementById('cantidad-imagenes-media-eventos').value = "";

});

