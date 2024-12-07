const novioId = localStorage.getItem('novioId');
const carpetaNombre = localStorage.getItem('carpetaNombre');
const apiKey = '';
let isDownloading = false;
let novios;
let carpeta;


document.getElementById('back-svg').addEventListener('click', () => {
    window.api.goBack();
  });
  

(async () => {
    novios = await window.api.getNovioById(novioId);
    
    carpeta = novios.carpetas.find(c => c.nombre === carpetaNombre);

    document.getElementById("nombre-carpeta-title").textContent = carpeta.nombre;
    document.getElementById("descargar-fotos-carpeta").onclick = () => downloadCarpeta();

    async function displayCarpeta(){
        const section = document.getElementById('carpeta-fotos-section');
        section.innerHTML = '';

        for (const imgObj of carpeta.urlImagenes) {
        const container = document.createElement('div');
        container.className = 'image-container';
    
        const img = document.createElement('img');
        const nombreImg = await getImagenNombre(imgObj);
        img.src = imgObj;
        img.alt = nombreImg;
    
        const span = document.createElement('span');
        span.textContent = nombreImg;
    
        container.appendChild(img);
        container.appendChild(span);
    
        section.appendChild(container);
        }
    }
    displayCarpeta();
    
})();

async function getImagenNombre(urlAux){
    const fileId = extractCarpetaFotosId(urlAux)
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error al obtener los metadatos del archivo: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.name;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}



function extractCarpetaFotosId(url) {
    const match = url.match(/id=([^&]+)/);
    return match ? match[1] : null;
  }
  
  async function fetchImage(url) {
    const fileId = extractCarpetaFotosId(url);
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    return await window.api.fetchImage(downloadUrl);
  }
  
  async function downloadCarpeta(){
    if(isDownloading){
      console.log("Descarga en progreso");
      return;
    }
    isDownloading = true;
    const zip = new JSZip();
    const folder = zip.folder(carpeta.nombre);
    const progressBar = document.getElementById('progress-bar');
    document.getElementById('progress-bar-container').style.visibility = "visible";
    const imageUrls = carpeta.urlImagenes;
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const filename = extractCarpetaFotosId(url) + ".jpg";
      const blob = await fetchImage(url);
      folder.file(filename, blob);
      const progress = Math.round(((i + 1) / imageUrls.length) * 100);
      progressBar.style.width = progress + '%';
      
    }
  
    isDownloading = false;
    
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, carpeta.nombre + ".zip");
      document.getElementById('progress-bar-container').style.visibility = "hidden";
    });
  }
  