// Variables globales
let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = 0;
let timerInterval = null;
let elapsedTime = 0;
let createdQuiz = null;
let importedQuizzes = []; // Stockage des quiz importés
let certificateId = ''; // ID du certificat
let currentQrQuiz = null; // Quiz actuellement affiché dans la modal QR

// Éléments DOM
const homepage = document.getElementById('homepage');
const quizpage = document.getElementById('quizpage');
const resultspage = document.getElementById('resultspage');
const createQuizPage = document.getElementById('createQuizPage');
const jsonFileInput = document.getElementById('jsonFileInput');
const importedQuizzesGrid = document.getElementById('importedQuizzesGrid');
const emptyState = document.getElementById('emptyState');

// Modals
const qrModal = document.getElementById('qrModal');
const qrModalClose = document.getElementById('qrModalClose');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const downloadQrBtn = document.getElementById('downloadQrBtn');

const scannerModal = document.getElementById('scannerModal');
const scannerModalClose = document.getElementById('scannerModalClose');
const scannerVideo = document.getElementById('scannerVideo');
const scannerCanvas = document.getElementById('scannerCanvas');
const scannerStatus = document.getElementById('scannerStatus');

// Boutons
const presetQuizCard = document.getElementById('presetQuizCard');
const createQuizCard = document.getElementById('createQuizCard');
const importQuizBtn = document.getElementById('importQuizBtn');
const scanQrBtn = document.getElementById('scanQrBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');

// Éléments du quiz
const questionText = document.getElementById('questionText');
const timeDisplay = document.getElementById('timeDisplay');
const progressDisplay = document.getElementById('progressDisplay');
const questionImage = document.getElementById('questionImage');
const answerCards = document.querySelectorAll('.answer-card');
const questionProgressFill = document.getElementById('questionProgressFill');
const timeProgressFill = document.getElementById('timeProgressFill');

// ==================== QR CODE FUNCTIONS ====================

function showQrModal(quiz) {
    currentQrQuiz = quiz;
    qrCodeContainer.innerHTML = '';
    
    // Créer le JSON du quiz
    const quizJson = JSON.stringify({ quiz: quiz });
    
    // Générer le QR code
    new QRCode(qrCodeContainer, {
        text: quizJson,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
    
    qrModal.classList.add('active');
}

function closeQrModal() {
    qrModal.classList.remove('active');
    currentQrQuiz = null;
}

function downloadQrCode() {
    const canvas = qrCodeContainer.querySelector('canvas');
    if (!canvas) {
        showNotification('Erreur lors de la génération du QR code', true);
        return;
    }
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.download = `QR_${currentQrQuiz.title.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showNotification('QR code téléchargé avec succès !');
}

// ==================== QR SCANNER FUNCTIONS ====================

let scannerStream = null;
let scannerAnimationFrame = null;

async function openScanner() {
    scannerModal.classList.add('active');
    scannerStatus.textContent = 'Initialisation de la caméra...';
    scannerStatus.className = 'scanner-status';
    
    try {
        scannerStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        
        scannerVideo.srcObject = scannerStream;
        scannerStatus.textContent = 'Scannez un QR code...';
        scannerStatus.className = 'scanner-status scanning';
        
        // Démarrer la détection
        requestAnimationFrame(scanQrCode);
    } catch (error) {
        console.error('Erreur caméra:', error);
        scannerStatus.textContent = 'Impossible d\'accéder à la caméra';
        scannerStatus.className = 'scanner-status error';
    }
}

function closeScanner() {
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
    
    if (scannerAnimationFrame) {
        cancelAnimationFrame(scannerAnimationFrame);
        scannerAnimationFrame = null;
    }
    
    scannerModal.classList.remove('active');
}

function scanQrCode() {
    if (!scannerStream) return;
    
    const canvas = scannerCanvas;
    const video = scannerVideo;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            try {
                const data = JSON.parse(code.data);
                if (data.quiz) {
                    closeScanner();
                    importedQuizzes.push(data.quiz);
                    renderImportedQuizzes();
                    showNotification('Quiz importé depuis QR code !');
                    return;
                }
            } catch (error) {
                console.error('Erreur de parsing QR:', error);
            }
        }
    }
    
    scannerAnimationFrame = requestAnimationFrame(scanQrCode);
}

// Event listeners pour les modals
qrModalClose.addEventListener('click', closeQrModal);
downloadQrBtn.addEventListener('click', downloadQrCode);
scannerModalClose.addEventListener('click', closeScanner);
scanQrBtn.addEventListener('click', openScanner);

qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
});

scannerModal.addEventListener('click', (e) => {
    if (e.target === scannerModal) closeScanner();
});

// ==================== QUIZ LOADING ====================

// Chargement du quiz preset au démarrage
async function loadPresetQuiz() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        quizData = data.quiz;
        console.log('Quiz preset chargé:', quizData);
    } catch (error) {
        console.error('Erreur de chargement du quiz:', error);
    }
}

// Event listeners pour les cartes principales
presetQuizCard.addEventListener('click', () => {
    loadPresetQuiz().then(() => {
        if (quizData) {
            startQuiz();
        }
    });
});

createQuizCard.addEventListener('click', showCreateQuizPage);

importQuizBtn.addEventListener('click', () => {
    jsonFileInput.click();
});

// Gestion de l'import de fichier JSON
jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            const quiz = data.quiz;
            
            // Ajouter le quiz à la liste des importés
            importedQuizzes.push(quiz);
            renderImportedQuizzes();
            
            // Notification
            showNotification('Quiz importé avec succès !');
        } catch (error) {
            showNotification('Erreur lors de la lecture du fichier JSON', true);
        }
    };
    reader.readAsText(file);
    
    // Reset l'input
    e.target.value = '';
});

// Afficher les quiz importés
function renderImportedQuizzes() {
    if (importedQuizzes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Vider la grille sauf l'empty state
    importedQuizzesGrid.innerHTML = '';
    
    importedQuizzes.forEach((quiz, index) => {
        const card = document.createElement('div');
        card.className = 'imported-quiz-card';
        
        card.innerHTML = `
            <h2 class="card-title">${quiz.title}</h2>
            <p class="card-description">${quiz.description || quiz.subtitle}</p>
            <div class="card-footer">
                <span class="card-meta">${quiz.questions.length} questions · ${Math.ceil(quiz.duration / 60)} min</span>
                <button class="card-qr-btn" data-index="${index}">QR Code</button>
            </div>
        `;
        
        // Event listener pour lancer le quiz
        card.addEventListener('click', (e) => {
            // Ne pas lancer le quiz si on clique sur le bouton QR
            if (e.target.classList.contains('card-qr-btn')) return;
            
            quizData = quiz;
            startQuiz();
        });
        
        // Event listener pour le bouton QR
        const qrBtn = card.querySelector('.card-qr-btn');
        qrBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showQrModal(quiz);
        });
        
        importedQuizzesGrid.appendChild(card);
    });
}

// Notification simple
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? '#eb5757' : '#0f7b6c'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== CRÉATION DE QUIZ ====================

const addQuestionBtn = document.getElementById('addQuestionBtn');
const saveQuizBtn = document.getElementById('saveQuizBtn');
const previewQuizBtn = document.getElementById('previewQuizBtn');
const backFromCreateBtn = document.getElementById('backFromCreateBtn');

function showCreateQuizPage() {
    homepage.style.display = 'none';
    createQuizPage.style.display = 'block';
    
    if (!createdQuiz) {
        createdQuiz = {
            title: "Mon Quiz",
            subtitle: "Description du quiz",
            description: "Testez vos connaissances",
            cardImage: "",
            duration: 300,
            questions: []
        };
        addNewQuestion();
    }
    renderQuestions();
}

function addNewQuestion() {
    const newQuestion = {
        id: createdQuiz.questions.length + 1,
        question: "",
        answers: ["", "", "", ""],
        correctAnswer: 0,
        image: "",
        answerImages: []
    };
    createdQuiz.questions.push(newQuestion);
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    createdQuiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-editor';
        questionDiv.innerHTML = `
            <h3>Question ${index + 1}</h3>
            
            <label>Intitulé de la question
                <textarea class="question-text" data-index="${index}">${question.question}</textarea>
            </label>
            
            <label>Réponses</label>
            <div class="answer-inputs">
                ${question.answers.map((answer, ansIndex) => `
                    <div class="answer-input-group">
                        <label>Réponse ${String.fromCharCode(65 + ansIndex)}</label>
                        <input type="text" class="answer-input" data-index="${index}" data-answer="${ansIndex}" value="${answer}">
                    </div>
                `).join('')}
            </div>
            
            <div class="correct-answer-selector">
                <label>Bonne réponse
                    <select class="correct-answer" data-index="${index}">
                        <option value="0" ${question.correctAnswer === 0 ? 'selected' : ''}>Réponse A</option>
                        <option value="1" ${question.correctAnswer === 1 ? 'selected' : ''}>Réponse B</option>
                        <option value="2" ${question.correctAnswer === 2 ? 'selected' : ''}>Réponse C</option>
                        <option value="3" ${question.correctAnswer === 3 ? 'selected' : ''}>Réponse D</option>
                    </select>
                </label>
            </div>
            
            <label>Image d'illustration (URL optionnelle)
                <input type="text" class="question-image" data-index="${index}" value="${question.image}" placeholder="https://...">
            </label>
            
            ${createdQuiz.questions.length > 1 ? `
                <button class="delete-question-btn" data-index="${index}">Supprimer cette question</button>
            ` : ''}
        `;
        
        container.appendChild(questionDiv);
    });
    
    // Event listeners pour les inputs
    attachQuestionEventListeners();
}

function attachQuestionEventListeners() {
    // Questions
    document.querySelectorAll('.question-text').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].question = e.target.value;
        });
    });
    
    // Réponses
    document.querySelectorAll('.answer-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const qIndex = parseInt(e.target.dataset.index);
            const aIndex = parseInt(e.target.dataset.answer);
            createdQuiz.questions[qIndex].answers[aIndex] = e.target.value;
        });
    });
    
    // Bonne réponse
    document.querySelectorAll('.correct-answer').forEach(select => {
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].correctAnswer = parseInt(e.target.value);
        });
    });
    
    // Image
    document.querySelectorAll('.question-image').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].image = e.target.value;
        });
    });
    
    // Supprimer question
    document.querySelectorAll('.delete-question-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions.splice(index, 1);
            // Réindexer les IDs
            createdQuiz.questions.forEach((q, i) => q.id = i + 1);
            renderQuestions();
        });
    });
}

function updateCreatedQuiz() {
    createdQuiz.title = document.getElementById('quizTitle').value;
    createdQuiz.subtitle = document.getElementById('quizSubtitle').value;
    createdQuiz.description = document.getElementById('quizDescription').value;
    createdQuiz.duration = parseInt(document.getElementById('quizDuration').value);
}

function saveQuiz() {
    updateCreatedQuiz();
    
    const quizJson = JSON.stringify({ quiz: createdQuiz }, null, 2);
    const blob = new Blob([quizJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdQuiz.title.replace(/\s+/g, '_')}.json`;
    a.click();
    
    showNotification('Quiz téléchargé avec succès !');
    
    // Afficher la modal QR après téléchargement
    setTimeout(() => {
        showQrModal(createdQuiz);
    }, 500);
}

function previewQuiz() {
    updateCreatedQuiz();
    quizData = createdQuiz;
    startQuiz();
}

function backToHome() {
    createQuizPage.style.display = 'none';
    homepage.style.display = 'block';
}

// Event listeners
addQuestionBtn.addEventListener('click', addNewQuestion);
saveQuizBtn.addEventListener('click', saveQuiz);
previewQuizBtn.addEventListener('click', previewQuiz);
backFromCreateBtn.addEventListener('click', backToHome);

// ==================== QUIZ LOGIC ====================

function startQuiz() {
    homepage.style.display = 'none';
    createQuizPage.style.display = 'none';
    quizpage.style.display = 'block';
    
    currentQuestionIndex = 0;
    userAnswers = [];
    elapsedTime = 0;
    startTime = Date.now();
    
    displayQuestion();
    startTimer();
}

function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    
    questionText.textContent = question.question;
    progressDisplay.textContent = `Question ${currentQuestionIndex + 1} / ${quizData.questions.length}`;
    
    // Image de la question
    if (question.image) {
        questionImage.src = question.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.src = '';
        questionImage.style.display = 'none';
    }
    
    // Réponses
    answerCards.forEach((card, index) => {
        const answerText = card.querySelector('.answer-text');
        answerText.textContent = question.answers[index];
        card.classList.remove('selected');
        
        // Image de fond pour la réponse
        if (question.answerImages && question.answerImages[index]) {
            card.style.setProperty('--bg-image', `url(${question.answerImages[index]})`);
        } else {
            card.style.setProperty('--bg-image', 'none');
        }
    });
    
    // Mise à jour de la barre de progression
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    questionProgressFill.style.width = `${progress}%`;
}

function selectAnswer(answerIndex) {
    answerCards.forEach(card => card.classList.remove('selected'));
    answerCards[answerIndex].classList.add('selected');
    userAnswers[currentQuestionIndex] = answerIndex;
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        showNotification('Veuillez sélectionner une réponse', true);
        return;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const timeProgress = (elapsedTime / quizData.duration) * 100;
        
        timeDisplay.textContent = `${elapsedTime}s / ${quizData.duration}s`;
        timeProgressFill.style.width = `${Math.min(timeProgress, 100)}%`;
        
        if (elapsedTime >= quizData.duration) {
            endQuiz();
        }
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function generateCertificateId() {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hash = hashCode(JSON.stringify(userAnswers) + timestamp);
    return `${randomPart}-${hash.toString(36).substring(0, 6).toUpperCase()}`;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function endQuiz() {
    stopTimer();
    
    quizpage.style.display = 'none';
    resultspage.style.display = 'block';
    
    // Calculer le score
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / quizData.questions.length * 100).toFixed(1);
    
    // Générer l'ID du certificat
    certificateId = generateCertificateId();
    
    document.getElementById('scoreDisplay').textContent = 
        `${correctAnswers} / ${quizData.questions.length} (${score}%)`;
    document.getElementById('certificateId').textContent = 
        `ID Certificat: ${certificateId}`;
    
    displayDetailedResults();
}

function displayDetailedResults() {
    const detailedResults = document.getElementById('detailedResults');
    detailedResults.innerHTML = '';
    
    quizData.questions.forEach((question, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        
        const isCorrect = userAnswers[index] === question.correctAnswer;
        const userAnswerText = question.answers[userAnswers[index]] || 'Pas de réponse';
        const correctAnswerText = question.answers[question.correctAnswer];
        
        resultDiv.innerHTML = `
            <h3>Question ${index + 1}: ${question.question}</h3>
            <p>Votre réponse: <span class="${isCorrect ? 'correct' : 'incorrect'}">${userAnswerText}</span></p>
            ${!isCorrect ? `<p>Bonne réponse: <span class="correct">${correctAnswerText}</span></p>` : ''}
        `;
        
        detailedResults.appendChild(resultDiv);
    });
}

function restartQuiz() {
    resultspage.style.display = 'none';
    quizpage.style.display = 'none';
    homepage.style.display = 'block';
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

answerCards.forEach((card, index) => {
    card.addEventListener('click', () => selectAnswer(index));
});

// Télécharger le certificat PDF
downloadCertificateBtn.addEventListener('click', async () => {
    try {
        // Import de jsPDF depuis CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Calculer le score
            let correctAnswers = 0;
            quizData.questions.forEach((question, index) => {
                if (userAnswers[index] === question.correctAnswer) {
                    correctAnswers++;
                }
            });
            const score = (correctAnswers / quizData.questions.length * 100).toFixed(1);
            
            // Titre
            doc.setFontSize(28);
            doc.setFont(undefined, 'bold');
            doc.text('CERTIFICAT DE COMPLETION', 105, 40, { align: 'center' });
            
            // Ligne décorative
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(20, 50, 190, 50);
            
            // Nom du quiz
            doc.setFontSize(18);
            doc.setFont(undefined, 'normal');
            doc.text('Quiz:', 20, 70);
            doc.setFont(undefined, 'bold');
            doc.text(quizData.title, 40, 70);
            
            // Score
            doc.setFontSize(16);
            doc.setFont(undefined, 'normal');
            doc.text('Score obtenu:', 20, 85);
            doc.setFont(undefined, 'bold');
            doc.text(`${correctAnswers} / ${quizData.questions.length} (${score}%)`, 65, 85);
            
            // Date
            doc.setFont(undefined, 'normal');
            const date = new Date().toLocaleDateString('fr-FR');
            doc.text(`Date: ${date}`, 20, 100);
            
            // ID du certificat
            doc.setFontSize(12);
            doc.text(`ID Certificat: ${certificateId}`, 20, 110);
            
            // Détails des questions
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Detail des reponses:', 20, 130);
            
            let yPos = 145;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            quizData.questions.forEach((question, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const isCorrect = userAnswers[index] === question.correctAnswer;
                const status = isCorrect ? '[CORRECT]' : '[INCORRECT]';
                
                // Question
                doc.setFont(undefined, 'bold');
                doc.text(`Q${index + 1}: ${question.question.substring(0, 60)}${question.question.length > 60 ? '...' : ''}`, 20, yPos);
                
                // Réponse
                doc.setFont(undefined, 'normal');
                const userAnswerText = question.answers[userAnswers[index]] || 'Pas de reponse';
                doc.setTextColor(isCorrect ? 0 : 255, isCorrect ? 128 : 0, 0);
                doc.text(`Votre reponse: ${userAnswerText} ${status}`, 25, yPos + 5);
                
                // Bonne réponse si incorrect
                if (!isCorrect) {
                    doc.setTextColor(0, 128, 0);
                    doc.text(`Bonne reponse: ${question.answers[question.correctAnswer]}`, 25, yPos + 10);
                    yPos += 20;
                } else {
                    yPos += 15;
                }
                
                doc.setTextColor(0, 0, 0);
            });
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Ctrl+Alt+Histoire - Certificat ${certificateId}`, 105, 290, { align: 'center' });
                doc.text(`Page ${i} / ${pageCount}`, 105, 285, { align: 'center' });
            }
            
            // Télécharger
            doc.save(`Certificat_${quizData.title.replace(/\s+/g, '_')}_${certificateId}.pdf`);
            
            showNotification('Certificat téléchargé avec succès !');
        };
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du certificat', true);
    }
});

// ==================== ANIMATIONS ====================

// Animations CSS inline
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== CURSOR HALO ====================

const halo = document.getElementById('halo');

// On écoute le mouvement de la souris sur tout le document
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    halo.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
});

// ==================== INITIALIZATION ====================

// Charger le quiz preset au démarrage
loadPresetQuiz();
