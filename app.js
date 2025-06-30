// Firebase configuration (REEMPLAZA CON TUS DATOS)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBQpHrqERod-iq_t4lDQtJtEKEQ8JXvvQo",
    authDomain: "gen25-2-prueba1.firebaseapp.com",
    databaseURL: "https://gen25-2-prueba1-default-rtdb.firebaseio.com",
    projectId: "gen25-2-prueba1",
    storageBucket: "gen25-2-prueba1.firebasestorage.app",
    messagingSenderId: "365588361777",
    appId: "1:365588361777:web:1afec145b43110dea11b10",
    measurementId: "G-GXZ6CP23D3"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const adminLoginModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
const deleteConfirmationModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
const loginForm = document.getElementById('loginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const adminLoginError = document.getElementById('adminLoginError');
const mainContent = document.getElementById('mainContent');
const adminPanel = document.getElementById('adminPanel');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const exitAdminPanelBtn = document.getElementById('exitAdminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const studentsContainer = document.getElementById('studentsContainer');
const teachersContainer = document.getElementById('teachersContainer');
const groupButtons = document.querySelectorAll('.group-btn');
const imageGallery = document.getElementById('imageGallery');
const videoGallery = document.getElementById('videoGallery');
const uploadImageForm = document.getElementById('uploadImageForm');
const uploadVideoForm = document.getElementById('uploadVideoForm');
const sharedImages = document.getElementById('sharedImages');
const sharedVideos = document.getElementById('sharedVideos');
const messageForm = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messagesContainer');
const adminMessagesTable = document.getElementById('adminMessagesTable');
const adminImagesTable = document.getElementById('adminImagesTable');
const adminVideosTable = document.getElementById('adminVideosTable');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteConfirmationText = document.getElementById('deleteConfirmationText');

// Global variables
let currentUser = null;
let isAdmin = false;
let itemToDelete = null;
let deleteConfirmations = 0;
let currentGroup = 'A';

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// Initialize Lightbox
lightbox.option({
  'resizeDuration': 200,
  'wrapAround': true,
  'alwaysShowNavOnTouchDevices': true
});

// ======================
// EVENT LISTENERS
// ======================

// Show login modal on page load
window.addEventListener('load', () => {
  loginModal.show();
});

// Login form submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (email === "Generación 2025" && password === "Innova123") {
      loginError.classList.add('d-none');
      loginModal.hide();
      mainContent.classList.remove('d-none');
      currentUser = { email: email, isAdmin: false };
      loadAllContent();
    } else {
      loginError.textContent = "Usuario o contraseña incorrectos";
      loginError.classList.remove('d-none');
    }
  });
}

// Admin login form submission
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (email === "moderador2025" && password === "Mod25!") {
      adminLoginError.classList.add('d-none');
      adminLoginModal.hide();
      mainContent.classList.add('d-none');
      adminPanel.classList.remove('d-none');
      isAdmin = true;
      loadAdminContent();
    } else {
      adminLoginError.textContent = "Credenciales de moderador incorrectas";
      adminLoginError.classList.remove('d-none');
    }
  });
}

// Admin panel button
if (adminPanelBtn) {
  adminPanelBtn.addEventListener('click', () => {
    adminLoginForm.reset();
    adminLoginError.classList.add('d-none');
    adminLoginModal.show();
  });
}

// Exit admin panel
if (exitAdminPanelBtn) {
  exitAdminPanelBtn.addEventListener('click', () => {
    adminPanel.classList.add('d-none');
    mainContent.classList.remove('d-none');
    isAdmin = false;
  });
}

// Logout button
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    mainContent.classList.add('d-none');
    adminPanel.classList.add('d-none');
    loginModal.show();
    resetForms();
    currentUser = null;
    isAdmin = false;
  });
}

// Group buttons for students
if (groupButtons.length > 0) {
  groupButtons.forEach(button => {
    button.addEventListener('click', () => {
      groupButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentGroup = button.dataset.group;
      loadStudents(currentGroup);
    });
  });
}

// Upload image form
if (uploadImageForm) {
  uploadImageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('imageUpload').files[0];
    
    if (file) {
      uploadFile(file, 'shared-images/', 'image');
    }
  });
}

// Upload video form
if (uploadVideoForm) {
  uploadVideoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('videoUpload').files[0];
    
    if (file) {
      uploadFile(file, 'shared-videos/', 'video');
    }
  });
}

// Message form
if (messageForm) {
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('messageName').value.trim();
    const group = document.getElementById('messageGroup').value;
    const content = document.getElementById('messageContent').value.trim();
    const mediaFile = document.getElementById('messageMedia').files[0];
    
    if (!name || !group || !content) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    if (mediaFile) {
      const uploadPath = `message-media/${Date.now()}_${mediaFile.name}`;
      const storageRef = storage.ref(uploadPath);
      
      Swal.fire({
        title: 'Subiendo archivo',
        html: 'Por favor espera...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      storageRef.put(mediaFile).then(snapshot => {
        return snapshot.ref.getDownloadURL();
      }).then(downloadURL => {
        const mediaType = mediaFile.type.includes('image') ? 'image' : 'video';
        saveMessageToFirestore(name, group, content, downloadURL, mediaType);
      }).catch(error => {
        console.error("Error uploading media:", error);
        Swal.fire('Error', 'Hubo un problema al subir el archivo', 'error');
      });
    } else {
      saveMessageToFirestore(name, group, content);
    }
  });
}

// Delete confirmation
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', () => {
    deleteConfirmations++;
    
    if (deleteConfirmations === 1) {
      deleteConfirmationText.innerHTML = `¿Estás <strong>realmente</strong> seguro?<br>Esta acción no se puede deshacer.`;
    } else if (deleteConfirmations === 2) {
      deleteConfirmationText.innerHTML = `¿Estás <strong>absolutamente</strong> seguro?<br>El elemento se borrará permanentemente.`;
    } else if (deleteConfirmations === 3) {
      deleteItem();
      deleteConfirmationModal.hide();
      deleteConfirmations = 0;
      itemToDelete = null;
    }
  });
}

// Cancel delete
if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmationModal.hide();
    deleteConfirmations = 0;
    itemToDelete = null;
  });
}

// ======================
// MAIN FUNCTIONS
// ======================

function loadAllContent() {
  loadStudents(currentGroup);
  loadTeachers();
  loadGalleryImages();
  loadGalleryVideos();
  loadSharedImages();
  loadSharedVideos();
  loadMessages();
}

function loadAdminContent() {
  loadAdminMessages();
  loadAdminImages();
  loadAdminVideos();
}

// Modifica la función loadStudents para obtener datos específicos de Firestore
function loadStudents(group) {
  studentsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  // Referencia a la colección de estudiantes en Firestore
  db.collection('students').where('group', '==', group).get()
    .then(querySnapshot => {
      studentsContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        studentsContainer.innerHTML = '<div class="col-12 text-center">No hay estudiantes en este grupo</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const student = doc.data();
        const folderPath = `students-images/${group}/`;
        const imageName = `${student.name}.jpg`; // Asume que las imágenes se nombran como "Nombre.jpg"
        const storageRef = storage.ref(folderPath + imageName);
        
        storageRef.getDownloadURL().then(url => {
          const col = document.createElement('div');
          col.className = 'col-md-4 col-lg-2 mb-4';
          col.innerHTML = `
            <div class="student-card" onclick="flipCard(this)">
              <div class="student-card-inner">
                <div class="student-card-front">
                  <img src="${url}" alt="${student.name}" class="student-img">
                  <h3 class="student-name">${student.name}</h3>
                </div>
                <div class="student-card-back">
                  <p class="student-quote">"${student.quote || 'La educación es el pasaporte hacia el futuro'}"</p>
                  <p>${student.name}</p>
                  <small>3ro ${group}</small>
                </div>
              </div>
            </div>
          `;
          studentsContainer.appendChild(col);
        }).catch(() => {
          // Si no encuentra la imagen, muestra un placeholder
          const col = document.createElement('div');
          col.className = 'col-md-4 col-lg-2 mb-4';
          col.innerHTML = `
            <div class="student-card" onclick="flipCard(this)">
              <div class="student-card-inner">
                <div class="student-card-front">
                  <img src="placeholder.jpg" alt="${student.name}" class="student-img">
                  <h3 class="student-name">${student.name}</h3>
                </div>
                <div class="student-card-back">
                  <p class="student-quote">"${student.quote || 'La educación es el pasaporte hacia el futuro'}"</p>
                  <p>${student.name}</p>
                  <small>3ro ${group}</small>
                </div>
              </div>
            </div>
          `;
          studentsContainer.appendChild(col);
        });
      });
    })
    .catch(error => {
      console.error("Error loading students:", error);
      studentsContainer.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar estudiantes</div>';
    });
}

// Modifica la función loadTeachers de manera similar
function loadTeachers() {
  teachersContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('teachers').get()
    .then(querySnapshot => {
      teachersContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        teachersContainer.innerHTML = '<div class="col-12 text-center">No se encontraron profesores</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const teacher = doc.data();
        const folderPath = 'teachers-images/';
        const imageName = `${teacher.name}.jpg`;
        const storageRef = storage.ref(folderPath + imageName);
        
        storageRef.getDownloadURL().then(url => {
          const col = document.createElement('div');
          col.className = 'col-md-4 col-lg-3 mb-4';
          col.innerHTML = `
            <div class="student-card" onclick="flipCard(this)">
              <div class="student-card-inner">
                <div class="student-card-front">
                  <img src="${url}" alt="${teacher.name}" class="student-img">
                  <h3 class="student-name">${teacher.name}</h3>
                </div>
                <div class="student-card-back">
                  <p class="student-quote">"${teacher.quote || 'Enseñar es aprender dos veces'}"</p>
                  <p class="student-name">${teacher.name}</p>
                  <small>${teacher.subject || 'Profesor'}</small>
                </div>
              </div>
            </div>
          `;
          teachersContainer.appendChild(col);
        }).catch(() => {
          // Placeholder si no encuentra la imagen
          const col = document.createElement('div');
          col.className = 'col-md-4 col-lg-3 mb-4';
          col.innerHTML = `
            <div class="student-card" onclick="flipCard(this)">
              <div class="student-card-inner">
                <div class="student-card-front">
                  <img src="placeholder.jpg" alt="${teacher.name}" class="student-img">
                  <h3 class="student-name">${teacher.name}</h3>
                </div>
                <div class="student-card-back">
                  <p class="student-quote">"${teacher.quote || 'Enseñar es aprender dos veces'}"</p>
                  <p class="student-name">${teacher.name}</p>
                  <small>${teacher.subject || 'Profesor'}</small>
                </div>
              </div>
            </div>
          `;
          teachersContainer.appendChild(col);
        });
      });
    })
    .catch(error => {
      console.error("Error loading teachers:", error);
      teachersContainer.innerHTML = '<div class="col-12 text-center">Error al cargar los profesores</div>';
    });
}

function loadGalleryImages() {
  imageGallery.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  const folderPath = 'gallery-images/';
  const storageRef = storage.ref(folderPath);
  
  storageRef.listAll().then(result => {
    imageGallery.innerHTML = '';
    
    if (result.items.length === 0) {
      imageGallery.innerHTML = '<div class="col-12 text-center">No hay imágenes en la galería</div>';
      return;
    }
    
    result.items.forEach((itemRef, index) => {
      itemRef.getDownloadURL().then(url => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
          <a href="${url}" data-lightbox="gallery-images" data-title="Imagen ${index + 1}" class="gallery-item">
            <img src="${url}" alt="Imagen de la galería" class="img-fluid rounded">
          </a>
        `;
        imageGallery.appendChild(col);
        lightbox.init();
      });
    });
  }).catch(error => {
    console.error("Error loading gallery images:", error);
    imageGallery.innerHTML = '<div class="col-12 text-center">Error al cargar las imágenes</div>';
  });
}

function loadGalleryVideos() {
  videoGallery.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  const folderPath = 'gallery-videos/';
  const storageRef = storage.ref(folderPath);
  
  storageRef.listAll().then(result => {
    videoGallery.innerHTML = '';
    
    if (result.items.length === 0) {
      videoGallery.innerHTML = '<div class="col-12 text-center">No hay videos en la galería</div>';
      return;
    }
    
    result.items.forEach((itemRef, index) => {
      itemRef.getDownloadURL().then(url => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
          <div class="gallery-item">
            <video controls class="img-fluid rounded">
              <source src="${url}" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        `;
        videoGallery.appendChild(col);
      });
    });
  }).catch(error => {
    console.error("Error loading gallery videos:", error);
    videoGallery.innerHTML = '<div class="col-12 text-center">Error al cargar los videos</div>';
  });
}

function loadSharedImages() {
  sharedImages.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('shared-images').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      sharedImages.innerHTML = '';
      
      if (querySnapshot.empty) {
        sharedImages.innerHTML = '<div class="col-12 text-center">No hay imágenes compartidas aún</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
          <a href="${data.url}" data-lightbox="shared-images" data-title="Imagen compartida" class="gallery-item">
            <img src="${data.url}" alt="Imagen compartida" class="img-fluid rounded">
          </a>
        `;
        sharedImages.appendChild(col);
        lightbox.init();
      });
    })
    .catch(error => {
      console.error("Error loading shared images:", error);
      sharedImages.innerHTML = '<div class="col-12 text-center">Error al cargar las imágenes compartidas</div>';
    });
}

function loadSharedVideos() {
  sharedVideos.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('shared-videos').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      sharedVideos.innerHTML = '';
      
      if (querySnapshot.empty) {
        sharedVideos.innerHTML = '<div class="col-12 text-center">No hay videos compartidos aún</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
          <div class="gallery-item">
            <video controls class="img-fluid rounded">
              <source src="${data.url}" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        `;
        sharedVideos.appendChild(col);
      });
    })
    .catch(error => {
      console.error("Error loading shared videos:", error);
      sharedVideos.innerHTML = '<div class="col-12 text-center">Error al cargar los videos compartidos</div>';
    });
}

function loadMessages() {
  messagesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('messages').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      messagesContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        messagesContainer.innerHTML = '<div class="col-12 text-center">No hay mensajes aún</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        addMessageToDOM(doc.id, data);
      });
    })
    .catch(error => {
      console.error("Error loading messages:", error);
      messagesContainer.innerHTML = '<div class="col-12 text-center">Error al cargar los mensajes</div>';
    });
}

function loadAdminMessages() {
  adminMessagesTable.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
  
  db.collection('messages').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      adminMessagesTable.innerHTML = '';
      
      if (querySnapshot.empty) {
        adminMessagesTable.innerHTML = '<tr><td colspan="5" class="text-center">No hay mensajes</td></tr>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp.seconds * 1000);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${dateStr}</td>
          <td>${data.name}</td>
          <td>${data.group}</td>
          <td>${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="prepareDelete('${doc.id}', 'message')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        adminMessagesTable.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error loading admin messages:", error);
      adminMessagesTable.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar los mensajes</td></tr>';
    });
}

function loadAdminImages() {
  adminImagesTable.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('shared-images').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      adminImagesTable.innerHTML = '';
      
      if (querySnapshot.empty) {
        adminImagesTable.innerHTML = '<div class="col-12 text-center">No hay imágenes compartidas</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp.seconds * 1000);
        const dateStr = date.toLocaleDateString();
        
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
          <div class="card h-100">
            <img src="${data.url}" class="card-img-top" alt="Imagen compartida" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <p class="card-text small">Subido el: ${dateStr}</p>
              <button class="btn btn-danger btn-sm w-100" onclick="prepareDelete('${doc.id}', 'image', '${data.url}')">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        `;
        adminImagesTable.appendChild(col);
      });
    })
    .catch(error => {
      console.error("Error loading admin images:", error);
      adminImagesTable.innerHTML = '<div class="col-12 text-center">Error al cargar las imágenes</div>';
    });
}

function loadAdminVideos() {
  adminVideosTable.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  db.collection('shared-videos').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      adminVideosTable.innerHTML = '';
      
      if (querySnapshot.empty) {
        adminVideosTable.innerHTML = '<div class="col-12 text-center">No hay videos compartidos</div>';
        return;
      }
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp.seconds * 1000);
        const dateStr = date.toLocaleDateString();
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
          <div class="card h-100">
            <video controls class="card-img-top" style="height: 200px; background: #000;">
              <source src="${data.url}" type="video/mp4">
            </video>
            <div class="card-body">
              <p class="card-text small">Subido el: ${dateStr}</p>
              <button class="btn btn-danger btn-sm w-100" onclick="prepareDelete('${doc.id}', 'video', '${data.url}')">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        `;
        adminVideosTable.appendChild(col);
      });
    })
    .catch(error => {
      console.error("Error loading admin videos:", error);
      adminVideosTable.innerHTML = '<div class="col-12 text-center">Error al cargar los videos</div>';
    });
}

function addMessageToDOM(id, data) {
  const date = new Date(data.timestamp.seconds * 1000);
  const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-card';
  messageDiv.innerHTML = `
    <div class="message-header">
      <div>
        <span class="message-author">${data.name}</span>
        <span class="message-group">${data.group}</span>
      </div>
      <div class="message-date">${dateStr}</div>
    </div>
    <div class="message-content">${data.content}</div>
    ${data.mediaUrl ? 
      (data.mediaType === 'image' ? 
        `<a href="${data.mediaUrl}" data-lightbox="message-media"><img src="${data.mediaUrl}" class="message-media" alt="Media del mensaje"></a>` : 
        `<video controls class="message-media">
          <source src="${data.mediaUrl}" type="video/mp4">
          Tu navegador no soporta el elemento de video.
        </video>`
      ) : ''
    }
  `;
  messagesContainer.appendChild(messageDiv);
  
  if (data.mediaUrl && data.mediaType === 'image') {
    lightbox.init();
  }
}

function saveMessageToFirestore(name, group, content, mediaUrl = null, mediaType = null) {
  db.collection('messages').add({
    name: name,
    group: group,
    content: content,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    Swal.fire('Éxito', 'Mensaje publicado correctamente', 'success');
    messageForm.reset();
    loadMessages();
  }).catch(error => {
    console.error("Error saving message:", error);
    Swal.fire('Error', 'Hubo un problema al publicar tu mensaje', 'error');
  });
}

function uploadFile(file, path, type) {
  const uploadPath = path + Date.now() + '_' + file.name;
  const storageRef = storage.ref(uploadPath);
  
  Swal.fire({
    title: 'Subiendo archivo',
    html: 'Por favor espera...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  storageRef.put(file).then(snapshot => {
    return snapshot.ref.getDownloadURL();
  }).then(downloadURL => {
    const collectionName = type === 'image' ? 'shared-images' : 'shared-videos';
    db.collection(collectionName).add({
      url: downloadURL,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      Swal.fire('Éxito', 'Archivo subido correctamente', 'success');
      if (type === 'image') {
        loadSharedImages();
        if (isAdmin) loadAdminImages();
      } else {
        loadSharedVideos();
        if (isAdmin) loadAdminVideos();
      }
    });
  }).catch(error => {
    console.error("Error uploading file:", error);
    Swal.fire('Error', 'Error al subir el archivo', 'error');
  });
}

function prepareDelete(id, type, url = null, contentPreview = null) {
  itemToDelete = { id, type, url };
  deleteConfirmations = 0;
  
  let itemDescription = '';
  if (type === 'message') {
    itemDescription = `el mensaje: "${contentPreview}"`;
  } else if (type === 'image') {
    itemDescription = 'esta imagen';
  } else if (type === 'video') {
    itemDescription = 'este video';
  }
  
  deleteConfirmationText.innerHTML = `¿Estás seguro que deseas eliminar ${itemDescription}?`;
  deleteConfirmationModal.show();
}

function deleteItem() {
  if (!itemToDelete) return;

  const { id, type, url } = itemToDelete;
  let deletePromise;

  if (type === 'message') {
    deletePromise = db.collection('messages').doc(id).delete()
      .then(() => {
        loadAdminMessages();
        if (!isAdmin) loadMessages();
      });
  } else if (type === 'image') {
    const storageRef = storage.refFromURL(url);
    deletePromise = storageRef.delete()
      .then(() => db.collection('shared-images').doc(id).delete())
      .then(() => {
        loadAdminImages();
        loadSharedImages();
      });
  } else if (type === 'video') {
    const storageRef = storage.refFromURL(url);
    deletePromise = storageRef.delete()
      .then(() => db.collection('shared-videos').doc(id).delete())
      .then(() => {
        loadAdminVideos();
        loadSharedVideos();
      });
  }

  deletePromise.then(() => {
    Swal.fire('Eliminado', 'El elemento ha sido eliminado correctamente', 'success');
  }).catch(error => {
    console.error("Error deleting item:", error);
    Swal.fire('Error', 'Hubo un problema al eliminar el elemento', 'error');
  });
}

function resetForms() {
  if (loginForm) loginForm.reset();
  if (adminLoginForm) adminLoginForm.reset();
  if (uploadImageForm) uploadImageForm.reset();
  if (uploadVideoForm) uploadVideoForm.reset();
  if (messageForm) messageForm.reset();
}

// Global function for card flipping
window.flipCard = function(element) {
  element.classList.toggle('flipped');
};