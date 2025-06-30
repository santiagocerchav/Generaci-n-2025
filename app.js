// Firebase configuration
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

// Show login modal on page load
document.addEventListener('DOMContentLoaded', () => {
    loginModal.show();
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Hardcoded credentials for regular user
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

// Admin panel button click
adminPanelBtn.addEventListener('click', () => {
    adminLoginModal.show();
});

// Admin login form submission
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Hardcoded credentials for admin
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

// Exit admin panel
exitAdminPanelBtn.addEventListener('click', () => {
    adminPanel.classList.add('d-none');
    mainContent.classList.remove('d-none');
    isAdmin = false;
});

// Logout button
logoutBtn.addEventListener('click', () => {
    mainContent.classList.add('d-none');
    adminPanel.classList.add('d-none');
    loginModal.show();
    resetForms();
    currentUser = null;
    isAdmin = false;
});

// Group buttons for students
groupButtons.forEach(button => {
    button.addEventListener('click', () => {
        groupButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentGroup = button.dataset.group;
        loadStudents(currentGroup);
    });
});

// Upload image form
uploadImageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('imageUpload').files[0];
    
    if (file) {
        uploadFile(file, 'shared-images/', 'image');
    }
});

// Upload video form
uploadVideoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('videoUpload').files[0];
    
    if (file) {
        uploadFile(file, 'shared-videos/', 'video');
    }
});

// Message form
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('messageName').value;
    const group = document.getElementById('messageGroup').value;
    const content = document.getElementById('messageContent').value;
    const mediaFile = document.getElementById('messageMedia').files[0];
    
    if (mediaFile) {
        // Upload media first, then save message with media URL
        const uploadPath = `message-media/${Date.now()}_${mediaFile.name}`;
        const storageRef = storage.ref(uploadPath);
        
        storageRef.put(mediaFile).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
            saveMessageToFirestore(name, group, content, downloadURL, mediaFile.type.includes('image') ? 'image' : 'video');
        }).catch(error => {
            console.error("Error uploading media:", error);
            Swal.fire('Error', 'Hubo un problema al subir el archivo multimedia', 'error');
        });
    } else {
        // Save message without media
        saveMessageToFirestore(name, group, content);
    }
});

// Delete confirmation
confirmDeleteBtn.addEventListener('click', () => {
    deleteConfirmations++;
    
    if (deleteConfirmations === 1) {
        deleteConfirmationText.innerHTML = `¿Estás <strong>realmente</strong> seguro que deseas eliminar este elemento?<br>Esta acción no se puede deshacer.`;
    } else if (deleteConfirmations === 2) {
        deleteConfirmationText.innerHTML = `¿Estás <strong>absolutamente</strong> seguro?<br>Esta acción es permanente y no se puede revertir.`;
    } else if (deleteConfirmations === 3) {
        // Perform deletion
        if (itemToDelete) {
            if (itemToDelete.type === 'message') {
                db.collection('messages').doc(itemToDelete.id).delete()
                    .then(() => {
                        Swal.fire('Eliminado', 'El mensaje ha sido eliminado permanentemente.', 'success');
                        loadAdminContent();
                    })
                    .catch(error => {
                        console.error("Error deleting message:", error);
                        Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error');
                    });
            } else if (itemToDelete.type === 'image') {
                const storageRef = storage.refFromURL(itemToDelete.url);
                storageRef.delete()
                    .then(() => {
                        if (itemToDelete.collection === 'shared-images') {
                            db.collection('shared-images').doc(itemToDelete.id).delete()
                                .then(() => {
                                    Swal.fire('Eliminado', 'La imagen ha sido eliminada permanentemente.', 'success');
                                    loadAdminContent();
                                });
                        } else {
                            // It's from a message
                            db.collection('messages').doc(itemToDelete.messageId).update({
                                mediaUrl: firebase.firestore.FieldValue.delete(),
                                mediaType: firebase.firestore.FieldValue.delete()
                            }).then(() => {
                                Swal.fire('Eliminado', 'La imagen ha sido eliminada permanentemente.', 'success');
                                loadAdminContent();
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting image:", error);
                        Swal.fire('Error', 'No se pudo eliminar la imagen.', 'error');
                    });
            } else if (itemToDelete.type === 'video') {
                const storageRef = storage.refFromURL(itemToDelete.url);
                storageRef.delete()
                    .then(() => {
                        if (itemToDelete.collection === 'shared-videos') {
                            db.collection('shared-videos').doc(itemToDelete.id).delete()
                                .then(() => {
                                    Swal.fire('Eliminado', 'El video ha sido eliminado permanentemente.', 'success');
                                    loadAdminContent();
                                });
                        } else {
                            // It's from a message
                            db.collection('messages').doc(itemToDelete.messageId).update({
                                mediaUrl: firebase.firestore.FieldValue.delete(),
                                mediaType: firebase.firestore.FieldValue.delete()
                            }).then(() => {
                                Swal.fire('Eliminado', 'El video ha sido eliminado permanentemente.', 'success');
                                loadAdminContent();
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting video:", error);
                        Swal.fire('Error', 'No se pudo eliminar el video.', 'error');
                    });
            }
        }
        deleteConfirmationModal.hide();
        deleteConfirmations = 0;
        itemToDelete = null;
    }
});

// Cancel delete
cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmationModal.hide();
    deleteConfirmations = 0;
    itemToDelete = null;
});

// Functions
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

function loadStudents(group) {
    studentsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
    
    const folderPath = `students-images/${group}/`;
    const storageRef = storage.ref(folderPath);
    
    storageRef.listAll().then(result => {
        studentsContainer.innerHTML = '';
        
        if (result.items.length === 0) {
            studentsContainer.innerHTML = '<div class="col-12 text-center">No se encontraron estudiantes</div>';
            return;
        }
        
        result.items.forEach(itemRef => {
            itemRef.getDownloadURL().then(url => {
                // Extract student name from filename (assuming filename is the student's name)
                const studentName = itemRef.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                
                const col = document.createElement('div');
                col.className = 'col-md-4 col-lg-2 mb-4';
                col.innerHTML = `
                    <div class="student-card" onclick="flipCard(this)">
                        <div class="student-card-inner">
                            <div class="student-card-front">
                                <img src="${url}" alt="${studentName}" class="student-img">
                                <h3 class="student-name">${studentName}</h3>
                            </div>
                            <div class="student-card-back">
                                <p class="student-quote">"La educación es el pasaporte hacia el futuro"</p>
                                <p class="student-name">${studentName}</p>
                                <small>3ro ${group}</small>
                            </div>
                        </div>
                    </div>
                `;
                studentsContainer.appendChild(col);
            });
        });
    }).catch(error => {
        console.error("Error loading students:", error);
        studentsContainer.innerHTML = '<div class="col-12 text-center">Error al cargar los estudiantes</div>';
    });
}

function loadTeachers() {
    teachersContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
    
    const folderPath = 'teachers-images/';
    const storageRef = storage.ref(folderPath);
    
    storageRef.listAll().then(result => {
        teachersContainer.innerHTML = '';
        
        if (result.items.length === 0) {
            teachersContainer.innerHTML = '<div class="col-12 text-center">No se encontraron profesores</div>';
            return;
        }
        
        result.items.forEach(itemRef => {
            itemRef.getDownloadURL().then(url => {
                // Extract teacher name from filename
                const teacherName = itemRef.name.replace(/\.[^/.]+$/, "");
                
                const col = document.createElement('div');
                col.className = 'col-md-4 col-lg-3 mb-4';
                col.innerHTML = `
                    <div class="student-card" onclick="flipCard(this)">
                        <div class="student-card-inner">
                            <div class="student-card-front">
                                <img src="${url}" alt="${teacherName}" class="student-img">
                                <h3 class="student-name">${teacherName}</h3>
                            </div>
                            <div class="student-card-back">
                                <p class="student-quote">"Enseñar es aprender dos veces"</p>
                                <p class="student-name">${teacherName}</p>
                                <small>Profesor</small>
                            </div>
                        </div>
                    </div>
                `;
                teachersContainer.appendChild(col);
            });
        });
    }).catch(error => {
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
                
                // Initialize lightbox after adding elements
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
                
                // Initialize lightbox after adding elements
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
                        <button class="btn btn-danger btn-sm" onclick="prepareDelete('${doc.id}', 'message', null, '${data.content.substring(0, 30)}...')">
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
    
    // Load shared images
    db.collection('shared-images').orderBy('timestamp', 'desc').get()
        .then(querySnapshot => {
            adminImagesTable.innerHTML = '';
            
            if (querySnapshot.empty) {
                adminImagesTable.innerHTML = '<div class="col-12 text-center">No hay imágenes compartidas</div>';
            } else {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = new Date(data.timestamp.seconds * 1000);
                    const dateStr = date.toLocaleDateString();
                    
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-lg-3 mb-4';
                    col.innerHTML = `
                        <div class="admin-item">
                            <img src="${data.url}" alt="Imagen compartida" class="img-fluid mb-2">
                            <p class="small mb-1">Subido el: ${dateStr}</p>
                            <button class="btn btn-danger btn-sm admin-delete-btn" onclick="prepareDelete('${doc.id}', 'image', '${data.url}', null, 'shared-images')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    adminImagesTable.appendChild(col);
                });
            }
            
            // Also load images from messages
            return db.collection('messages').where('mediaType', '==', 'image').orderBy('timestamp', 'desc').get();
        })
        .then(querySnapshot => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = new Date(data.timestamp.seconds * 1000);
                    const dateStr = date.toLocaleDateString();
                    
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-lg-3 mb-4';
                    col.innerHTML = `
                        <div class="admin-item">
                            <img src="${data.mediaUrl}" alt="Imagen de mensaje" class="img-fluid mb-2">
                            <p class="small mb-1">Subido por: ${data.name}</p>
                            <p class="small mb-1">Fecha: ${dateStr}</p>
                            <button class="btn btn-danger btn-sm admin-delete-btn" onclick="prepareDelete('${doc.id}', 'image', '${data.mediaUrl}', null, 'messages', '${data.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    adminImagesTable.appendChild(col);
                });
            }
            
            if (adminImagesTable.innerHTML === '') {
                adminImagesTable.innerHTML = '<div class="col-12 text-center">No hay imágenes</div>';
            }
        })
        .catch(error => {
            console.error("Error loading admin images:", error);
            adminImagesTable.innerHTML = '<div class="col-12 text-center">Error al cargar las imágenes</div>';
        });
}

function loadAdminVideos() {
    adminVideosTable.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
    
    // Load shared videos
    db.collection('shared-videos').orderBy('timestamp', 'desc').get()
        .then(querySnapshot => {
            adminVideosTable.innerHTML = '';
            
            if (querySnapshot.empty) {
                adminVideosTable.innerHTML = '<div class="col-12 text-center">No hay videos compartidos</div>';
            } else {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = new Date(data.timestamp.seconds * 1000);
                    const dateStr = date.toLocaleDateString();
                    
                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 mb-4';
                    col.innerHTML = `
                        <div class="admin-item">
                            <video controls class="img-fluid mb-2">
                                <source src="${data.url}" type="video/mp4">
                            </video>
                            <p class="small mb-1">Subido el: ${dateStr}</p>
                            <button class="btn btn-danger btn-sm admin-delete-btn" onclick="prepareDelete('${doc.id}', 'video', '${data.url}', null, 'shared-videos')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    adminVideosTable.appendChild(col);
                });
            }
            
            // Also load videos from messages
            return db.collection('messages').where('mediaType', '==', 'video').orderBy('timestamp', 'desc').get();
        })
        .then(querySnapshot => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = new Date(data.timestamp.seconds * 1000);
                    const dateStr = date.toLocaleDateString();
                    
                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 mb-4';
                    col.innerHTML = `
                        <div class="admin-item">
                            <video controls class="img-fluid mb-2">
                                <source src="${data.mediaUrl}" type="video/mp4">
                            </video>
                            <p class="small mb-1">Subido por: ${data.name}</p>
                            <p class="small mb-1">Fecha: ${dateStr}</p>
                            <button class="btn btn-danger btn-sm admin-delete-btn" onclick="prepareDelete('${doc.id}', 'video', '${data.mediaUrl}', null, 'messages', '${data.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    adminVideosTable.appendChild(col);
                });
            }
            
            if (adminVideosTable.innerHTML === '') {
                adminVideosTable.innerHTML = '<div class="col-12 text-center">No hay videos</div>';
            }
        })
        .catch(error => {
            console.error("Error loading admin videos:", error);
            adminVideosTable.innerHTML = '<div class="col-12 text-center">Error al cargar los videos</div>';
        });
}

function uploadFile(file, path, type) {
    const uploadPath = path + Date.now() + '_' + file.name;
    const storageRef = storage.ref(uploadPath);
    const uploadTask = storageRef.put(file);
    
    Swal.fire({
        title: 'Subiendo archivo',
        html: 'Por favor espera...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    uploadTask.on('state_changed', 
        (snapshot) => {
            // Progress tracking can be added here if needed
        }, 
        (error) => {
            Swal.fire('Error', 'Hubo un problema al subir el archivo', 'error');
            console.error("Upload error:", error);
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                // Save to Firestore
                const collectionName = type === 'image' ? 'shared-images' : 'shared-videos';
                const data = {
                    url: downloadURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                db.collection(collectionName).add(data)
                    .then(() => {
                        Swal.fire('Éxito', 'Archivo subido correctamente', 'success');
                        if (type === 'image') {
                            loadSharedImages();
                        } else {
                            loadSharedVideos();
                        }
                    })
                    .catch(error => {
                        console.error("Error saving to Firestore:", error);
                        Swal.fire('Error', 'Hubo un problema al guardar la información', 'error');
                    });
            });
        }
    );
}

function saveMessageToFirestore(name, group, content, mediaUrl = null, mediaType = null) {
    const data = {
        name: name,
        group: group,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (mediaUrl && mediaType) {
        data.mediaUrl = mediaUrl;
        data.mediaType = mediaType;
    }
    
    db.collection('messages').add(data)
        .then(docRef => {
            Swal.fire('Éxito', 'Mensaje publicado correctamente', 'success');
            document.getElementById('messageForm').reset();
            loadMessages();
            
            if (isAdmin) {
                loadAdminMessages();
                if (mediaType === 'image') {
                    loadAdminImages();
                } else if (mediaType === 'video') {
                    loadAdminVideos();
                }
            }
        })
        .catch(error => {
            console.error("Error saving message:", error);
            Swal.fire('Error', 'Hubo un problema al publicar el mensaje', 'error');
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
        <div class="message-content">
            <p>${data.content}</p>
            ${data.mediaUrl ? 
                (data.mediaType === 'image' ? 
                    `<a href="${data.mediaUrl}" data-lightbox="message-media" data-title="Media de ${data.name}">
                        <img src="${data.mediaUrl}" alt="Media" class="message-media img-fluid">
                    </a>` : 
                    `<video controls class="message-media img-fluid">
                        <source src="${data.mediaUrl}" type="video/mp4">
                        Tu navegador no soporta el elemento de video.
                    </video>`
                ) : ''
            }
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Initialize lightbox if there's an image
    if (data.mediaUrl && data.mediaType === 'image') {
        lightbox.init();
    }
}

function prepareDelete(id, type, url = null, content = null, collection = null, name = null) {
    itemToDelete = { id, type, url, collection };
    deleteConfirmations = 0;
    
    if (type === 'message') {
        deleteConfirmationText.innerHTML = `¿Estás seguro que deseas eliminar este mensaje?<br><strong>"${content}"</strong><br>Esta acción no se puede deshacer.`;
    } else if (type === 'image') {
        deleteConfirmationText.innerHTML = `¿Estás seguro que deseas eliminar esta imagen${name ? ' de ' + name : ''}?<br>Esta acción no se puede deshacer.`;
    } else if (type === 'video') {
        deleteConfirmationText.innerHTML = `¿Estás seguro que deseas eliminar este video${name ? ' de ' + name : ''}?<br>Esta acción no se puede deshacer.`;
    }
    
    deleteConfirmationModal.show();
}

function flipCard(element) {
    element.classList.toggle('flipped');
}

function resetForms() {
    loginForm.reset();
    adminLoginForm.reset();
    uploadImageForm.reset();
    uploadVideoForm.reset();
    messageForm.reset();
}

// Global function for card flipping
window.flipCard = flipCard;