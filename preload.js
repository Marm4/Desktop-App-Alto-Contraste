const { contextBridge, ipcRenderer } = require("electron");
const { ref, get, update, push, set } = require('firebase/database');
const { db } = require("./firebase-config");
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/auth');

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    await getAccessToken(oAuth2Client);
  }

  return oAuth2Client;
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  ipcRenderer.send('open-auth-window', authUrl);

  return new Promise((resolve, reject) => {
    ipcRenderer.once('auth-code-received', async (event, code) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        resolve(oAuth2Client);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function createFolder(nombre) {
  const auth = await authenticate();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: nombre,
    mimeType: 'application/vnd.google-apps.folder',
  };

  try {
    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    return folder.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}


contextBridge.exposeInMainWorld('api', {
  fetchImage: async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  },
  getNovios: async () => {
    const snapshot = await get(ref(db, 'novios'));
    const novios = [];
    snapshot.forEach((childSnapshot) => {
      novios.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return novios;
  },
   getProductos: async () =>{
    const snapshot = await get(ref(db, 'productos'));
    const productos = []
    snapshot.forEach((childSnapshot) => {
      productos.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return productos;
  },
  getNovioById: async (id) => {
    const novioRef = ref(db, `novios/${id}`);
    const snapshot = await get(novioRef);
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    } else {
      throw new Error(`No se encontró el novio con ID: ${id}`);
    }
  },
  getProductoById: async (id) =>{
    const productosRef = ref(db,`productos/${id}`)
    const snapshot = await get(productosRef);
    if(snapshot.exists()){
      return { id: snapshot.key, ...snapshot.val() };
    } else {
      throw new Error(`No se encontró el producto con ID: ${id}`);
    }

  },
  updateNovio: async (id, data) => {
    const novioRef = ref(db, `novios/${id}`);
    await update(novioRef, data);
  },
  updateProducto: async(id, data) =>{
    const productoRef = ref(db,`productos/${id}`)
    await update(productoRef, data);
  },
  addNovio: async (data) => {
    const noviosRef = ref(db, 'novios');
    const newNovioRef = push(noviosRef);
    data.id = newNovioRef.key;
    const serializableData = JSON.parse(JSON.stringify(data));
    await set(newNovioRef, serializableData);
    return newNovioRef.key; // Devolver el nuevo novio con su ID asignado
  },
  addProducto: async(data) => {
    const productoRef = ref(db, 'productos');
    const newProductoRef = push(productoRef);
    data.id = newProductoRef.key;
    const serializableData = JSON.parse(JSON.stringify(data));
    await set(newProductoRef, serializableData);
    return newProductoRef.key;
  },
  deleteNovios: async (id) => {
    const novioRef = ref(db, `novios/${id}`);
    await set(novioRef, null);
  },
  deleteProducto: async(id) => {
    const productosRef = ref(db, `productos/${id}`);
    await set(productosRef, null);
  },
  navigateTo: (view) => {
    ipcRenderer.send('navigate-to', view);
  },
  goBack: () => {
    ipcRenderer.send('go-back');
  },
  isNoviosPresent: async (nombre) =>{
    const snapshot = await get(ref(db, 'novios'));
    const novios = [];
    snapshot.forEach((childSnapshot) => {
      novios.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    let noviosPresent = false;
    novios.forEach(novio => {
      if(novio.nombre === nombre){
        noviosPresent = true;
      }
    })
    return noviosPresent;
  },
  isProductoPresent: async (nombre) =>{
    const snapshot = await get(ref(db, 'productos'));
    const productos = [];
    snapshot.forEach((childSnapshot) => {
      productos.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    let productoPresent = false;
    productos.forEach(producto => {
      if(producto.nombre === nombre){
        productoPresent = true;
      }
    })
    return productoPresent;
  },
  authenticate: async () => authenticate(),
  getAccessToken: async () => getAccessToken(oAuth2Client),
  createFolder: async (nombre) => createFolder(nombre)
});