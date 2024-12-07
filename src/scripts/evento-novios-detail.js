const novioId = localStorage.getItem('novioId');
const eventoNombre = localStorage.getItem('eventoNombre');
const apiKey = ''; 
let novios;
let evento;


document.getElementById('back-svg').addEventListener('click', () => {
    window.api.goBack();
});

(async () => {
    novios = await window.api.getNovioById(novioId);
    
    evento = novios.eventos.find(e => e.nombre === eventoNombre);
    document.getElementById("nombre-evento-title").textContent = evento.nombre;
    document.getElementById("evento-imagen").src = evento.multimedia.portada;
    console.log("POrtada: ", evento.multimedia.portada);
    document.getElementById("nombre-evento").value = evento.nombre;
    document.getElementById("portada-evento").value = evento.multimedia.portada;
    document.getElementById('cantidad-imagenes-evento').value = evento.cantidadImagenes;
   
    
})();

function extractFileId(webViewLink) {
    const match = webViewLink.match(/\/file\/d\/([^/]+)\//);
    return match ? match[1] : null;
  }

function mostrarError(mensaje){
    const errorElement = document.getElementById('mensaje-error-eventos');
    errorElement.textContent = mensaje;
    errorElement.style.visibility = 'visible';

    setTimeout(() => {
      errorElement.style.visibility = 'hidden';
    }, 3000); // 3000 milisegundos = 3 segundos
  }

document.getElementById("borrar-evento").onclick = async() =>{
    const eventos = novios.eventos.filter(e => e.nombre !== evento.nombre);
    novios.eventos = eventos;
    await window.api.updateNovio(novios.id, novios);

    window.api.goBack();
}

document.getElementById("actualizar-evento").onclick = async() => {
    const nombre = document.getElementById("nombre-evento").value;
    let portada = document.getElementById("portada-evento").value;
    const cantidadImagenes = document.getElementById('cantidad-imagenes-evento').value;

    let nombreExiste = false;
    novios.eventos.forEach(e => {
        if(nombre === e.nombre){
            if(nombre !== evento.nombre){
                nombreExiste = true;
            } 
        }
    });

    if(nombreExiste){
        mostrarError("Los novios ya tiene un evento con este nombre");
        return;
    }

    if(portada !== evento.multimedia.portada){
        const portadaId = extractFileId(portada);
        if(portadaId === null){
            mostrarError("Url de portada incorrecta.");
            console.log("Url de portada incorrecta");
            return;
        } 
        portada = `https://drive.google.com/thumbnail?id=${portadaId}&sz=w1500`;
    }

    evento.nombre = nombre.toLowerCase();
    evento.multimedia.portada = portada;
    evento.cantidadImagenes = cantidadImagenes;

    await window.api.updateNovio(novios.id, novios);
    window.api.goBack();
     
}

document.getElementById('descargar-qr-evento').onclick = function() {
  const text = novios.nombre + " - " + evento.nombre;

  // Generar el código QR
  const qr = qrcode(0, 'L');
  qr.addData(text);
  qr.make();

  // Crear un canvas para dibujar el QR code
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 256; // Tamaño del QR code
  canvas.width = size;
  canvas.height = size;

  // Dibujar el QR code en el canvas
  const cellSize = size / qr.getModuleCount();
  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      ctx.fillStyle = qr.isDark(row, col) ? '#000000' : '#ffffff';
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  const qrCodeImage = canvas.toDataURL('image/png');
  
    const downloadLink = document.createElement('a');
    downloadLink.href = qrCodeImage;
    downloadLink.download = text + '.png';
    
    downloadLink.click();
  };

  //Imagenes polaroid

  function drawPolaroid(img, logo, caption) {
    // Aumentar la resolución del canvas
    const scaleFactor = 4; // Factor de escala para aumentar la resolución

    const frameWidth = 400 * scaleFactor; // Width of the polaroid frame
    const frameHeight = 500 * scaleFactor; // Height of the polaroid frame

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    ctx.scale(scaleFactor, scaleFactor);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, frameWidth / scaleFactor, frameHeight / scaleFactor);

    const imageWidth = (frameWidth / scaleFactor) - 40; // Margin from the sides
    const imageHeight = (img.height / img.width) * imageWidth; // Maintain aspect ratio
    const imageX = 20; // Margin from the left
    const imageY = 20; // Margin from the top

    if (imageHeight > (frameHeight / scaleFactor) - 100) {
        // Adjust image height if it's too big for the frame
        imageHeight = (frameHeight / scaleFactor) - 100;
        imageWidth = (img.width / img.height) * imageHeight;
    }

    ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);

    // Draw the caption
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = `20px Roboto`;
    const captionX = (frameWidth / scaleFactor) / 2;
    const captionY = (frameHeight / scaleFactor) - 65; // Positioning the text 60 pixels from the bottom
    ctx.fillText(caption, captionX, captionY);

    // Calculate the logo dimensions to maintain aspect ratio
    const maxLogoWidth = 20 * scaleFactor; // Maximum width of the logo
    const maxLogoHeight = 20 * scaleFactor; // Maximum height of the logo
    let logoWidth = maxLogoWidth;
    let logoHeight = (logo.height / logo.width) * logoWidth;

    if (logoHeight > maxLogoHeight) {
        logoHeight = maxLogoHeight;
        logoWidth = (logo.width / logo.height) * logoHeight;
    }

    const logoX = ((frameWidth / scaleFactor) - (logoWidth / scaleFactor)) / 2;
    const logoY = (frameHeight / scaleFactor) - 40; // Positioning the logo below the text

    // Draw the logo onto a temporary canvas to invert its colors
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = logo.width;
    tempCanvas.height = logo.height;
    tempCtx.drawImage(logo, 0, 0);

    // Invert the colors of the logo
    const imageData = tempCtx.getImageData(0, 0, logo.width, logo.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
    }
    tempCtx.putImageData(imageData, 0, 0);

    // Draw the inverted logo onto the main canvas
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, logoX, logoY, logoWidth / scaleFactor, logoHeight / scaleFactor);

    return canvas;
}

document.getElementById("descargar-imagenes-polaroid").onclick = async () => {
    const logoUrl = "https://drive.google.com/thumbnail?id=1Zt0tGMQiPJwUfhcJ9F9Irhn4kXHdNTwY&sz=w2500";
    const caption = document.getElementById("texto-polaroid-evento").value;
    const imageUrls = evento.multimedia.urls;

    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Error loading image'));
            img.src = url;
        });
    }

    const zip = new JSZip();
    const logo = await loadImage(logoUrl);

    for (let i = 0; i < imageUrls.length; i++) {
        const img = await loadImage(imageUrls[i]);
        const canvas = drawPolaroid(img, logo, caption);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(`${evento.nombre}_${i + 1}.png`, base64Data, {base64: true});
    }

    zip.generateAsync({type: 'blob'}).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${evento.nombre}.zip`;
        link.click();
    }).catch((error) => {
        console.error('Error generating ZIP file', error);
    });
};
