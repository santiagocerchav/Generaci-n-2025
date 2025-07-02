// Firebase configuration will be in firebase-config.js

// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // Show login modal immediately
    const loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'flex';
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Hardcoded credentials
        if (username === 'Generación 2025' && password === 'Innova123') {
            // Successful login
            loginModal.style.display = 'none';
            document.getElementById('mainContent').classList.remove('hidden');
            
            // Initialize the application
            initApp();
        } else {
            // Failed login
            loginError.textContent = 'Usuario o contraseña incorrectos';
            loginError.style.display = 'block';
            
            // Shake animation for error
            loginForm.classList.add('animate__animated', 'animate__headShake');
            setTimeout(() => {
                loginForm.classList.remove('animate__animated', 'animate__headShake');
            }, 1000);
        }
    });
    
    // Initialize moderator button
    const moderatorBtn = document.getElementById('moderatorBtn');
    moderatorBtn.addEventListener('click', function() {
        showModeratorModal();
    });
});

// Initialize the application
async function initApp() {
    // Load motivational phrase
    loadMotivationalPhrase();
    
    // Initialize students section
    initStudentsSection();
    
    // Initialize teachers section
    initTeachersSection();
    
    // Initialize gallery
    initGallery();

    // Initialize parents videos section
    initParentsVideosSection();
    
    // Initialize upload section
    initUploadSection();
    
    // Initialize messages section
    initMessagesSection();
    
    // Initialize attendance section
    await initAttendanceSection();
}

// Motivational phrase
function loadMotivationalPhrase() {
    const motivationalPhrase = document.getElementById('motivationalPhrase');
    
    const phrase = "Recordar es volver a vivir, y hoy queremos revivir contigo cada momento especial que compartimos. " +
        "Los días de clases, las risas en el recreo, los proyectos que nos unieron, las metas que alcanzamos juntos. " +
        "Cada instante fue una pieza única en este mosaico de experiencias que llamamos Generación 2025. " +
        "Aunque el tiempo pase y los caminos se dividan, estos recuerdos permanecerán como un tesoro en nuestros corazones. " +
        "Porque fuimos más que compañeros, fuimos una familia que creció, aprendió y soñó junta. " +
        "Que esta página sea un refugio de nostalgia donde siempre podamos volver a encontrarnos.";
    
    motivationalPhrase.textContent = phrase;
    
    motivationalPhrase.style.opacity = 0;
    let i = 0;
    const typingEffect = setInterval(() => {
        if (i <= phrase.length) {
            motivationalPhrase.textContent = phrase.substring(0, i);
            motivationalPhrase.style.opacity = i / phrase.length;
            i++;
        } else {
            clearInterval(typingEffect);
        }
    }, 30);
}

// Students section
function initStudentsSection() {
    const groupButtons = document.querySelectorAll('.group-btn');
    const studentsContainer = document.getElementById('studentsContainer');
    
    fetch('students-quote.json')
        .then(response => response.json())
        .then(data => {
            window.studentsData = data;
            showStudentsGroup('A');
            
            groupButtons.forEach(button => {
                button.addEventListener('click', function() {
                    groupButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    showStudentsGroup(this.dataset.group);
                });
            });
        })
        .catch(error => {
            console.error('Error loading students data:', error);
            studentsContainer.innerHTML = '<p>Error al cargar los datos de los estudiantes.</p>';
        });
}

function showStudentsGroup(group) {
    const studentsContainer = document.getElementById('studentsContainer');
    studentsContainer.innerHTML = '';
    
    if (!window.studentsData) return;
    
    const groupStudents = window.studentsData.filter(student => student.group === group);
    
    if (groupStudents.length === 0) {
        studentsContainer.innerHTML = '<p>No hay estudiantes en este grupo.</p>';
        return;
    }
    
    groupStudents.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        card.innerHTML = `
            <div class="student-card-inner">
                <div class="student-card-front">
                    <img src="students-images/${student.group}/${student.name.replace(/\s+/g, '-')}.jpg" alt="${student.name}" class="student-img">
                    <div class="student-name">${student.name}</div>
                </div>
                <div class="student-card-back">
                    <p class="student-quote">"${student.quote}"</p>
                    <div class="student-name">${student.name}</div>
                    <div class="student-group">3ro ${student.group}</div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        studentsContainer.appendChild(card);
    });
}

// Teachers section
function initTeachersSection() {
    const teachersContainer = document.getElementById('teachersContainer');
    
    fetch('teachers-quote.json')
        .then(response => response.json())
        .then(data => {
            window.teachersData = data;
            
            data.forEach(teacher => {
                const card = document.createElement('div');
                card.className = 'teacher-card';
                
                card.innerHTML = `
                    <div class="teacher-card-inner">
                        <div class="teacher-card-front">
                            <img src="teachers-images/${teacher.name.replace(/\s+/g, '-')}.jpg" alt="${teacher.name}" class="teacher-img">
                            <div class="teacher-name">${teacher.name}</div>
                            <div class="teacher-subject">${teacher.subject}</div>
                        </div>
                        <div class="teacher-card-back">
                            <p class="teacher-quote">"${teacher.quote}"</p>
                            <div class="teacher-name">${teacher.name}</div>
                            <div class="teacher-subject">${teacher.subject}</div>
                        </div>
                    </div>
                `;
                
                card.addEventListener('click', function() {
                    this.classList.toggle('flipped');
                });
                
                teachersContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading teachers data:', error);
            teachersContainer.innerHTML = '<p>Error al cargar los datos de los profesores.</p>';
        });
}

// Attendance Section
async function initAttendanceSection() {
    try {
        const { realtimeDb, databaseRef, onValue, set } = await import('./firebase-config.js');
        
        const students = { "3A": [], "3B": [] };
        let currentStudent = null;
        let currentTab = '3A';

        const studentIdInput = document.getElementById('studentId');
        const verifyBtn = document.getElementById('verifyBtn');
        const messageDiv = document.getElementById('message');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        const table3A = document.querySelector('#table3A tbody');
        const table3B = document.querySelector('#table3B tbody');

        async function loadStudentsFromJSON() {
            try {
                const [response3A, response3B] = await Promise.all([
                    fetch('data/3A.json').then(res => res.json()),
                    fetch('data/3B.json').then(res => res.json())
                ]);

                students["3A"] = response3A.map(s => ({
                    id: s.matricula.toString(),
                    name: s.nombre,
                    number: s.numero_lista,
                    group: "3A",
                    present: false
                }));
                
                students["3B"] = response3B.map(s => ({
                    id: s.matricula.toString(),
                    name: s.nombre,
                    number: s.numero_lista,
                    group: "3B",
                    present: false
                }));
            } catch (error) {
                console.error("Error cargando estudiantes:", error);
                showMessage("Error al cargar datos de estudiantes", 'error');
                throw error;
            }
        }

        function setupFirebaseListeners() {
            const asistenciaRef3A = databaseRef(realtimeDb, 'asistencia/3A');
            const asistenciaRef3B = databaseRef(realtimeDb, 'asistencia/3B');
            
            onValue(asistenciaRef3A, (snapshot) => {
                updateAttendanceStatus('3A', snapshot.val() || {});
                renderStudentsTables();
            });
            
            onValue(asistenciaRef3B, (snapshot) => {
                updateAttendanceStatus('3B', snapshot.val() || {});
                renderStudentsTables();
            });
        }

        function updateAttendanceStatus(group, attendanceData) {
            students[group].forEach(student => {
                student.present = attendanceData[student.id] || false;
            });
        }

        async function registerAttendance(student) {
            try {
                const studentRef = dbRef(realtimeDb, `asistencia/${student.group}/${student.id}`);
                
                await set(studentRef, true);
                showMessage(`Asistencia registrada para ${student.name}`, 'success');
                
                student.present = true;
                currentStudent = null;
                studentIdInput.value = '';
                renderStudentsTables();
            } catch (error) {
                console.error("Error registrando asistencia:", error);
                showMessage("Error al registrar asistencia", 'error');
            }
        }

        function renderStudentsTables(lockAll = false) {
            renderTable('3A', table3A, lockAll);
            renderTable('3B', table3B, lockAll);
        }

        function renderTable(group, tableElement, lockAll = true) {
            tableElement.innerHTML = '';
            
            students[group].forEach(student => {
                const row = document.createElement('tr');

                // Número
                row.appendChild(createCell(student.number));

                // Nombre
                row.appendChild(createCell(student.name));
                
                // Asistencia
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `check-${group}-${student.id}`;
                checkbox.checked = student.present;

                // Siempre bloqueado a menos que sea el estudiante verificado y no haya marcado asistencia
                checkbox.disabled = !(currentStudent && currentStudent.id === student.id && !student.present);
                
                if (currentStudent && currentStudent.id === student.id && !student.present) {
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            registerAttendance(student);
                            checkbox.disabled = true;
                        }
                    });
                }
                
                const cell = document.createElement('td');
                cell.className = 'checkbox-cell';
                cell.appendChild(checkbox);
                row.appendChild(cell);
                
                tableElement.appendChild(row);
            });
        }

        function createCell(content) {
            const cell = document.createElement('td');
            cell.textContent = content;
            return cell;
        }

        function setupUIEvents() {
            verifyBtn.addEventListener('click', verifyStudent);
            
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentTab = btn.getAttribute('data-tab');
                    switchTab(currentTab);
                });
            });
            
            studentIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') verifyStudent();
            });
        }

        function verifyStudent() {
            const enteredId = studentIdInput.value.trim();
            
            if (!/^\d{6}$/.test(enteredId)) {
                showMessage('Matrícula debe tener 6 dígitos', 'error');
                return;
            }
            
            for (const group of ['3A', '3B']) {
                const student = students[group].find(s => s.id === enteredId);
                if (student) {
                    if (student.present) {
                        showMessage('Ya registraste tu asistencia', 'error');
                        return;
                    }
                    
                    currentStudent = student;
                    showMessage(`Verificado: ${student.name}`, 'success');
                    
                    if (currentTab !== student.group) {
                        switchTab(student.group);
                    }
                    
                    renderStudentsTables();
                    return;
                }
            }
            
            showMessage('Matrícula no encontrada', 'error');
        }

        function switchTab(tabId) {
            currentTab = tabId;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        }

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.classList.remove('hidden');
            
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 5000);
        }

        // Initialize attendance system
        await loadStudentsFromJSON();
        setupFirebaseListeners();
        setupUIEvents();
        renderStudentsTables(true);
    } catch (error) {
        console.error("Error inicializando attendance:", error);
    }
}

// Gallery section
function initGallery() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const galleryContents = document.querySelectorAll('.gallery-content');
    
    // Switch between images and videos tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            galleryContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`gallery${this.dataset.tab.charAt(0).toUpperCase() + this.dataset.tab.slice(1)}`).classList.add('active');
        });
    });
    
    // Load gallery images from Firebase Storage
    loadGalleryImages();
    loadGalleryVideos();
}

function loadGalleryImages() {
    const imagesGrid = document.getElementById('imagesGrid');
    imagesGrid.innerHTML = '<p>Cargando imágenes...</p>';
    
    // Simulación de carga de imágenes
    setTimeout(() => {
        imagesGrid.innerHTML = '';
        
        const defaultImages = [
            { url: 'assets/images/gallery1.jpg', name: 'Mañana Escolar' },
            { url: 'assets/images/gallery2.jpg', name: 'Fiesta de graduación' },
            { url: 'assets/images/gallery3.jpg', name: 'Proyecto de ciencias' },
            { url: 'assets/images/gallery4.jpg', name: 'Día deportivo' },
            { url: 'assets/images/gallery5.jpg', name: 'Concurso de talentos' },
            { url: 'assets/images/gallery6.jpg', name: 'Último día de clases' }
        ];
        
        defaultImages.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item animate__animated animate__fadeIn';
            
            item.innerHTML = `
                <img src="${image.url}" alt="${image.name}" class="gallery-img">
                <div class="gallery-caption">${image.name}</div>
            `;
            
            imagesGrid.appendChild(item);
        });
    }, 1000);
}

function loadGalleryVideos() {
    const videosGrid = document.getElementById('videosGrid');
    videosGrid.innerHTML = '<p>Cargando videos...</p>';
    
    // Simulación de carga de videos
    setTimeout(() => {
        videosGrid.innerHTML = '';
        
        const defaultVideos = [
            { url: 'assets/videos/video1.mp4', name: 'Ceremonia de premiación' },
            { url: 'assets/videos/video2.mp4', name: 'Presentación musical' },
            { url: 'assets/videos/video3.mp4', name: 'Obra de teatro' }
        ];
        
        defaultVideos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'gallery-item animate__animated animate__fadeIn';
            
            item.innerHTML = `
                <video controls class="gallery-video">
                    <source src="${video.url}" type="video/mp4">
                    Tu navegador no soporta el elemento de video.
                </video>
                <div class="gallery-caption">${video.name}</div>
            `;
            
            videosGrid.appendChild(item);
        });
    }, 1000);
}

// Parents videos section
async function initParentsVideosSection() {
    try {
        const { realtimeDb, dbRef, onValue } = await import('./firebase-config.js');
        
        // Variables de estado
        let currentStudent = null;
        const parentStudentIdInput = document.getElementById('parentStudentId');
        const verifyParentBtn = document.getElementById('verifyParentBtn');
        const parentVideoMessage = document.getElementById('parentVideoMessage');
        const parentsVideosContainer = document.getElementById('parentsVideosContainer');
        const groupButtons = document.querySelectorAll('#parents-videos .group-btn');
        let currentGroup = 'A';
        let studentsData = { "A": [], "B": [] };

        // Cargar datos de estudiantes
        const loadStudentsData = async () => {
            try {
                const [responseA, responseB] = await Promise.all([
                    fetch('data/3A.json').then(res => res.json()),
                    fetch('data/3B.json').then(res => res.json())
                ]);
                studentsData["A"] = responseA;
                studentsData["B"] = responseB;
            } catch (error) {
                console.error("Error cargando datos:", error);
                showParentMessage("Error cargando datos", 'error');
            }
        };

        // Verificar matrícula
        const verifyParentStudent = () => {
            const enteredId = parentStudentIdInput.value.trim();
            
            if (!/^\d{6}$/.test(enteredId)) {
                showParentMessage('Matrícula debe tener 6 dígitos', 'error');
                return;
            }
            
            const student = studentsData[currentGroup].find(s => s.matricula.toString() === enteredId);
            
            if (student) {
                currentStudent = student;
                showParentMessage(`Videos desbloqueados para ${student.nombre}`, 'success');
                renderParentVideos();
            } else {
                showParentMessage('Matrícula no encontrada', 'error');
                currentStudent = null;
                renderParentVideos();
            }
        };

        // Mostrar mensajes
        const showParentMessage = (text, type) => {
            parentVideoMessage.textContent = text;
            parentVideoMessage.className = `message ${type}`;
            parentVideoMessage.classList.remove('hidden');
            setTimeout(() => parentVideoMessage.classList.add('hidden'), 5000);
        };

        // Renderizar videos
        const renderParentVideos = () => {
            parentsVideosContainer.innerHTML = '';
            
            const groupVideos = studentsData[currentGroup]
                .filter(student => student.videos && student.videos.length > 0)
                .map(student => ({
                    ...student,
                    isUnlocked: currentStudent && currentStudent.matricula === student.matricula
                }));
            
            if (groupVideos.length === 0) {
                parentsVideosContainer.innerHTML = '<p>No hay videos disponibles</p>';
                return;
            }
            
            groupVideos.forEach(student => {
                const studentContainer = document.createElement('div');
                studentContainer.className = 'student-videos-group';
                
                student.videos.forEach(video => {
                    const videoContainer = document.createElement('div');
                    videoContainer.className = `parent-video-container ${student.isUnlocked ? '' : 'locked'}`;
                    
                    videoContainer.innerHTML = student.isUnlocked ? `
                        <video controls class="parent-video-player">
                            <source src="${video.url}" type="video/mp4">
                        </video>
                    ` : `
                    <div class="parent-video-message">
                        ${video.disponible 
                            ? `
                                <h3>${student.nombre}</h3>
                                <div class="video-title">${student.shortName}, ¡Tienes un mensaje!</div>
                                <h4>Ingresa tu matrícula correspondiente para ver el contenido</h4>
                            `
                            : `
                                <h3>${student.nombre}</h3>
                                <div class="video-title no-messages">${student.shortName}, No tienes mensajes disponibles</div>
                            `
                        }
                    </div>
                    ${video.disponible 
                        ? `<video class="parent-video-player" preload="none">
                                <source src="${video.url}" type="video/mp4">
                            </video>`
                        : ''
                    }
                    `;
                    
                    studentContainer.appendChild(videoContainer);
                });
                
                parentsVideosContainer.appendChild(studentContainer);
            });
        };

        // Cambiar grupo
        const switchGroup = (group) => {
            currentGroup = group;
            currentStudent = null;
            parentStudentIdInput.value = '';
            renderParentVideos();
        };

        // Configurar event listeners
        verifyParentBtn.addEventListener('click', verifyParentStudent);
        parentStudentIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyParentStudent();
        });

        groupButtons.forEach(button => {
            button.addEventListener('click', function() {
                groupButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                switchGroup(this.dataset.group);
            });
        });

        // Inicialización
        await loadStudentsData();
        renderParentVideos();
    } catch (error) {
        console.error("Error inicializando sección de videos:", error);
    }
}

// Upload section
function initUploadSection() {
    const uploadTabButtons = document.querySelectorAll('.upload-tab-btn');
    const uploadContents = document.querySelectorAll('.upload-content');
    
    // Switch between photos and videos tabs
    uploadTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            uploadTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            uploadContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`upload${this.dataset.upload.charAt(0).toUpperCase() + this.dataset.upload.slice(1)}`).classList.add('active');
        });
    });
    
    // Photo upload form
    const photoUploadForm = document.getElementById('photoUploadForm');
    photoUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadFiles('photos');
    });
    
    // Video upload form
    const videoUploadForm = document.getElementById('videoUploadForm');
    videoUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadFiles('videos');
    });
    
    // Load uploaded items
    loadUploadedItems();
}

async function uploadFiles(type) {
    const { storage, storageRef, uploadBytes, getDownloadURL, db, collection, addDoc, serverTimestamp, auth } = await import('./firebase-config.js');
    
    const inputId = type === 'photos' ? 'photoInput' : 'videoInput';
    const files = document.getElementById(inputId).files;
    
    if (files.length === 0) {
        showAlert(`Por favor selecciona al menos un ${type === 'photos' ? 'imagen' : 'video'} para subir.`, 'error');
        return;
    }
    
    const uploadBtn = document.querySelector(`#upload${type.charAt(0).toUpperCase() + type.slice(1)} .upload-btn`);
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
    
    try {
        // Esperar autenticación si es necesario
        if (!auth.currentUser) {
            await new Promise(resolve => {
                const unsubscribe = auth.onAuthStateChanged(user => {
                    unsubscribe();
                    resolve();
                });
            });
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = `${type}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const fileRef = storageRef(storage, filePath);
            
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    uploadedBy: auth.currentUser?.uid || 'anonymous'
                }
            };

            // Subir el archivo
            await uploadBytes(fileRef, file, metadata);
            const downloadURL = await getDownloadURL(fileRef);
            
            // Guardar en Firestore
            await addDoc(collection(db, 'uploads'), {
                type: type,
                url: downloadURL,
                name: file.name,
                size: file.size,
                uploadedAt: serverTimestamp()
            });
        }
        
        showAlert('Archivos subidos correctamente!', 'success');
        loadUploadedItems();
    } catch (error) {
        console.error('Error al subir archivos:', error);
        showAlert(`Error al subir: ${error.message}`, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = type === 'photos' ? 'Subir Fotos' : 'Subir Videos';
    }
}

async function loadUploadedItems() {
    const { db, collection, query, orderBy, onSnapshot } = await import('./firebase-config.js');
    const uploadedPhotos = document.getElementById('uploadedPhotos');
    const uploadedVideos = document.getElementById('uploadedVideos');

    // Limpiar contenedores
    uploadedPhotos.innerHTML = '';
    uploadedVideos.innerHTML = '<p>Cargando...</p>';

    // Consulta para obtener los últimos archivos subidos
    const q = query(collection(db, 'uploads'), orderBy('uploadedAt', 'desc'));

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
        uploadedPhotos.innerHTML = '';
        uploadedVideos.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const item = doc.data();
            const container = item.type === 'photos' ? uploadedPhotos : uploadedVideos;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'uploaded-item animate__animated animate__fadeIn';
            
            if (item.type === 'photos') {
                itemElement.innerHTML = `
                    <img src="${item.url}" alt="${item.name}" class="uploaded-img">
                    <div class="upload-caption">${item.name}</div>
                `;
            } else {
                itemElement.innerHTML = `
                    <video controls class="uploaded-video">
                        <source src="${item.url}" type="video/mp4">
                        Tu navegador no soporta el elemento de video.
                    </video>
                    <div class="upload-caption">${item.name}</div>
                `;
            }
            
            container.appendChild(itemElement);
        });

        if (snapshot.empty) {
            uploadedPhotos.innerHTML = '<p>No hay fotos subidas aún</p>';
            uploadedVideos.innerHTML = '<p>No hay videos subidos aún</p>';
        }
    });

    return unsubscribe; // Para poder cancelar la suscripción luego
}

// Messages section
function initMessagesSection() {
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitMessage();
    });
    
    // Load existing messages
    loadMessages();
}

async function submitMessage() {
    const { storage, ref, uploadBytes, getDownloadURL, db, collection, addDoc, serverTimestamp } = await import('./firebase-config.js');
    
    const name = document.getElementById('senderName').value;
    const group = document.getElementById('senderGroup').value;
    const message = document.getElementById('messageContent').value;
    const mediaFile = document.getElementById('messageMedia').files[0];
    
    if (!name || !group || !message) {
        showAlert('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#messageForm .submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    
    try {
        let mediaURL = null;
        let mediaType = null;
        
        // Si hay un archivo multimedia, subirlo a Firebase Storage
        if (mediaFile) {
            mediaType = mediaFile.type.includes('image') ? 'image' : 'video';
            const filePath = `messages/${Date.now()}_${mediaFile.name}`;
            const storageRef = ref(storage, filePath);
            
            await uploadBytes(storageRef, mediaFile);
            mediaURL = await getDownloadURL(storageRef);
        }
        
        // Guardar el mensaje en Firestore
        await addDoc(collection(db, 'messages'), {
            name: name,
            group: group,
            message: message,
            mediaURL: mediaURL,
            mediaType: mediaType,
            createdAt: serverTimestamp()
        });
        
        showAlert('Mensaje publicado con éxito!', 'success');
        document.getElementById('messageForm').reset();
        loadMessages();
    } catch (error) {
        console.error('Error submitting message:', error);
        showAlert(`Error al publicar el mensaje: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar Mensaje';
    }
}

async function loadMessages() {
    try {
        const { db, collection, query, orderBy, onSnapshot } = await import('./firebase-config.js');
        
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '<p>Cargando mensajes...</p>';
        
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            messagesContainer.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const message = doc.data();
                addMessageToUI({
                    id: doc.id,
                    name: message.name,
                    group: message.group,
                    message: message.message,
                    mediaURL: message.mediaURL,
                    mediaType: message.mediaType,
                    timestamp: message.createdAt?.toDate().toISOString() || new Date().toISOString()
                });
            });
            
            if (snapshot.empty) {
                messagesContainer.innerHTML = '<p>No hay mensajes todavía. ¡Sé el primero en publicar!</p>';
            }
        }, (error) => {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = '<p>Error al cargar los mensajes.</p>';
        });

        // Devuelve la función para cancelar la suscripción si es necesario
        return unsubscribe;
    } catch (error) {
        console.error("Error en loadMessages:", error);
        throw error;
    }
}

function addMessageToUI(message) {
    const messagesContainer = document.getElementById('messagesContainer');
    
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    messageItem.dataset.id = message.id;
    
    const date = new Date(message.timestamp);
    const formattedDate = date.toLocaleDateString() + ' a las ' + date.toLocaleTimeString();
    
    let mediaHTML = '';
    if (message.mediaURL) {
        if (message.mediaType === 'image') {
            mediaHTML = `
                <div class="message-media">
                    <img src="${message.mediaURL}" alt="Media compartida" class="message-media-img">
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="message-media">
                    <video controls class="message-media-video">
                        <source src="${message.mediaURL}" type="video/mp4">
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
            `;
        }
    }
    
    messageItem.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${message.name} - 3ro ${message.group}</span>
            <span class="message-date">${formattedDate}</span>
        </div>
        <div class="message-content">
            <p>${message.message}</p>
        </div>
        ${mediaHTML}
    `;
    
    messagesContainer.appendChild(messageItem);
}

// Función auxiliar para mostrar alertas
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Moderator panel
function showModeratorModal() {
    const moderatorModal = document.getElementById('moderatorModal');
    moderatorModal.style.display = 'flex';
    
    // Mostrar el modal
    moderatorModal.style.display = 'flex';
    moderatorModal.classList.remove('hidden');

    // Resetear el panel de moderador (mostrar login)
    document.getElementById('moderatorLogin').classList.remove('hidden');
    document.getElementById('moderatorPanel').classList.add('hidden');

    // Cerrar modal al hacer clic en la X
    const closeModal = moderatorModal.querySelector('.close-modal');
    closeModal.onclick = function() {
        moderatorModal.style.display = 'none';
    };
    
    // Moderator login form
    const moderatorLoginForm = document.getElementById('moderatorLoginForm');
    moderatorLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('modUsername').value;
        const password = document.getElementById('modPassword').value;
        
        // Hardcoded moderator credentials
        if (username === 'moderador2025' && password === 'Mod25!') {
            // Hide login form, show moderator panel
            document.getElementById('moderatorLogin').classList.add('hidden');
            document.getElementById('moderatorPanel').classList.remove('hidden');
            
            // Load moderator content
            loadModeratorContent();
        } else {
            // Show error
            alert('Credenciales de moderador incorrectas');
        }
    });
    
    // Moderator tabs
    const modTabButtons = document.querySelectorAll('.mod-tab-btn');
    const modContents = document.querySelectorAll('.mod-content');
    
    modTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            modTabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all contents
            modContents.forEach(content => content.classList.remove('active'));
            // Show selected content
            document.getElementById(`mod${this.dataset.modTab.charAt(0).toUpperCase() + this.dataset.modTab.slice(1)}`).classList.add('active');
        });
    });
}

function loadModeratorContent() {
    // Photos
    const modPhotosList = document.getElementById('modPhotosList');
    modPhotosList.innerHTML = '';
    
    const samplePhotos = [
        { id: 'photo1', url: 'assets/images/mod1.jpg', name: 'Foto grupal', uploadedBy: 'Juan Pérez', date: '2023-05-10' },
        { id: 'photo2', url: 'assets/images/mod2.jpg', name: 'Excursión', uploadedBy: 'María García', date: '2023-05-09' }
    ];
    
    samplePhotos.forEach(photo => {
        const item = createModeratorItem(photo, 'photo');
        modPhotosList.appendChild(item);
    });
    
    // Videos
    const modVideosList = document.getElementById('modVideosList');
    modVideosList.innerHTML = '';
    
    const sampleVideos = [
        { id: 'video1', url: 'assets/videos/mod1.jpg', name: 'Broma en clase', uploadedBy: 'Carlos López', date: '2023-05-08' }
    ];
    
    sampleVideos.forEach(video => {
        const item = createModeratorItem(video, 'video');
        modVideosList.appendChild(item);
    });
    
    // Messages
    const modMessagesList = document.getElementById('modMessagesList');
    modMessagesList.innerHTML = '';
    
    const sampleMessages = [
        { id: 'msg1', content: '¡Qué increíble año hemos tenido!', author: 'Juan Pérez', group: 'A', date: '2023-05-15' },
        { id: 'msg2', content: 'Gracias a todos por hacer de esta experiencia algo inolvidable.', author: 'María García', group: 'B', date: '2023-05-14' }
    ];
    
    sampleMessages.forEach(msg => {
        const item = createModeratorItem(msg, 'message');
        modMessagesList.appendChild(item);
    });
}

function createModeratorItem(item, type) {
    const modItem = document.createElement('div');
    modItem.className = 'mod-item';
    
    let infoHTML = '';
    let previewHTML = '';
    
    if (type === 'photo' || type === 'video') {
        previewHTML = `<img src="${item.url}" alt="${item.name}" class="mod-item-preview">`;
        infoHTML = `
            <div><strong>Nombre:</strong> ${item.name}</div>
            <div><strong>Subido por:</strong> ${item.uploadedBy}</div>
            <div><strong>Fecha:</strong> ${item.date}</div>
        `;
    } else if (type === 'message') {
        infoHTML = `
            <div><strong>Autor:</strong> ${item.author} (3ro ${item.group})</div>
            <div><strong>Fecha:</strong> ${item.date}</div>
            <div><strong>Mensaje:</strong> ${item.content}</div>
        `;
    }
    
    modItem.innerHTML = `
        <div class="mod-item-info">
            ${previewHTML}
            ${infoHTML}
        </div>
        <div class="mod-item-actions">
            <button class="btn-delete" data-id="${item.id}" data-type="${type}">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `;
    
    // Add delete event listener
    const deleteBtn = modItem.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        confirmDelete(item.id, type);
    });
    
    return modItem;
}

function confirmDelete(id, type) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    // Mostrar el modal
    confirmModal.classList.remove('hidden');
    
    let confirmationStep = 1;
    const maxSteps = 3;
    
    // Configurar el primer mensaje
    updateConfirmationMessage();

    // Resetear los event listeners
    confirmYes.onclick = null;
    confirmNo.onclick = null;

    // Función para actualizar el mensaje
    function updateConfirmationMessage() {
        let itemType = '';
        switch (type) {
            case 'photo': itemType = 'imagen'; break;
            case 'video': itemType = 'video'; break;
            case 'message': itemType = 'mensaje'; break;
        }

        confirmTitle.textContent = `Confirmar eliminación (${confirmationStep}/${maxSteps})`;
        
        if (confirmationStep < maxSteps) {
            confirmMessage.textContent = `Esta es la confirmación ${confirmationStep} de ${maxSteps}. ¿Realmente quieres eliminar esta ${itemType}? No podrás recuperarla.`;
            confirmYes.textContent = 'Continuar';
        } else {
            confirmMessage.textContent = `¡Última confirmación! ¿Estás absolutamente seguro de eliminar esta ${itemType} permanentemente?`;
            confirmYes.textContent = 'SÍ, ELIMINAR DEFINITIVAMENTE';
        }
    }

    // Configurar el botón de confirmación
    confirmYes.onclick = function() {
        confirmationStep++;
        
        if (confirmationStep <= maxSteps) {
            updateConfirmationMessage();
        } else {
            // Eliminar el item y ocultar el modal
            deleteItem(id, type);
            confirmModal.classList.add('hidden');
        }
    };

    // Configurar el botón de cancelar
    confirmNo.onclick = function() {
        confirmModal.classList.add('hidden');
    };
}

function deleteItem(id, type) {
    // In a real implementation, this would delete from Firebase Storage and/or Firestore
    // For demo purposes, we'll just show a message
    
    let itemType = '';
    switch (type) {
        case 'photo':
            itemType = 'Imagen';
            break;
        case 'video':
            itemType = 'Video';
            break;
        case 'message':
            itemType = 'Mensaje';
            break;
    }
    
    alert(`${itemType} con ID ${id} ha sido eliminado.`);
    
    // Refresh moderator content
    loadModeratorContent();
}