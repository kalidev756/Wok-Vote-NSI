// ============================================
// CTRL+ALT+HISTOIRE - QUIZ APPLICATION
// Version complète avec Supabase
// ============================================

// ==================== CONFIGURATION SUPABASE ====================

const SUPABASE_URL = 'https://yolerewyvuihwyinmxgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbGVyZXd5dnVpaHd5aW5teGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDg4NDQsImV4cCI6MjA4NTcyNDg0NH0.hlcDI9hHGHGOZNP8CcFOu9n6WoTBb0WvtEs1FSxa1bg';

// Client Supabase
let supabaseClient = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase initialisé');
        return true;
    } else {
        console.warn('⚠ Supabase non disponible');
        return false;
    }
}
// ==================== FONCTIONS SUPABASE ====================

async function generateUniqueCode() {
    if (!supabaseClient) {
        return generateCodeClientSide();
    }
    
    try {
        const { data, error } = await supabaseClient.rpc('generate_unique_code');
        if (error) throw error;
        return data;
    } catch (error) {
        console.warn('RPC non disponible, génération côté client');
        return generateCodeClientSide();
    }
}

function generateCodeClientSide() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        if (i === 3) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function saveQuizToSupabase(quizData) {
    if (!supabaseClient) {
        throw new Error('Supabase non initialisé');
    }
    
    try {
        const code = await generateUniqueCode();
        
        const { data, error } = await supabaseClient
            .from('shared_quizzes')
            .insert([{ code: code, quiz_data: quizData }])
            .select();
        
        if (error) {
            if (error.code === '23505') {
                return saveQuizToSupabase(quizData);
            }
            throw error;
        }
        
        console.log('✓ Quiz sauvegardé:', code);
        return code;
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        throw new Error('Impossible de sauvegarder le quiz');
    }
}

async function loadQuizFromSupabase(code) {
    if (!supabaseClient) {
        throw new Error('Supabase non initialisé');
    }
    
    try {
        const normalizedCode = code.toUpperCase().trim();
        
        const { data, error } = await supabaseClient
            .from('shared_quizzes')
            .select('quiz_data, access_count, created_at')
            .eq('code', normalizedCode)
            .gt('expires_at', new Date().toISOString())
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Code invalide ou quiz expiré');
            }
            throw error;
        }
        
        await supabaseClient
            .from('shared_quizzes')
            .update({ 
                access_count: data.access_count + 1,
                last_accessed_at: new Date().toISOString()
            })
            .eq('code', normalizedCode);
        
        console.log('✓ Quiz chargé:', normalizedCode);
        return data.quiz_data;
    } catch (error) {
        console.error('Erreur chargement:', error);
        throw error;
    }
}

// ==================== VARIABLES GLOBALES ====================

let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = 0;
let timerInterval = null;
let elapsedTime = 0;
let createdQuiz = null;
let importedQuizzes = [];
let certificateId = '';
let currentShareCode = null;

// ==================== ÉLÉMENTS DOM ====================

const homepage = document.getElementById('homepage');
const quizpage = document.getElementById('quizpage');
const resultspage = document.getElementById('resultspage');
const createQuizPage = document.getElementById('createQuizPage');
const jsonFileInput = document.getElementById('jsonFileInput');
const importedQuizzesGrid = document.getElementById('importedQuizzesGrid');
const emptyState = document.getElementById('emptyState');

// Modals
const shareModal = document.getElementById('shareModal');
const shareModalClose = document.getElementById('shareModalClose');
const shareCodeDisplay = document.getElementById('shareCodeDisplay');
const shareStatus = document.getElementById('shareStatus');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');

const joinModal = document.getElementById('joinModal');
const joinModalClose = document.getElementById('joinModalClose');
const joinCodeInput = document.getElementById('joinCodeInput');
const joinQuizBtn = document.getElementById('joinQuizBtn');
const joinStatus = document.getElementById('joinStatus');
const joinQuizOpenBtn = document.getElementById('joinQuizOpenBtn');

// Boutons
const presetQuizCard = document.getElementById('presetQuizCard');
const createQuizCard = document.getElementById('createQuizCard');
const importQuizBtn = document.getElementById('importQuizBtn');
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

// ==================== FONCTIONS DE PARTAGE ====================

async function showShareModal(quiz) {
    shareModal.classList.add('active');
    shareCodeDisplay.textContent = '...';
    shareStatus.textContent = 'Génération du code...';
    shareStatus.className = 'share-status';
    
    try {
        const code = await saveQuizToSupabase(quiz);
        currentShareCode = code;
        
        shareCodeDisplay.textContent = code;
        shareStatus.textContent = 'Quiz partagé avec succès!';
        shareStatus.className = 'share-status';
    } catch (error) {
        shareCodeDisplay.textContent = 'ERREUR';
        shareStatus.textContent = 'Erreur: ' + error.message;
        shareStatus.className = 'share-status error';
    }
}

function closeShareModal() {
    shareModal.classList.remove('active');
    currentShareCode = null;
}

async function copyShareCode() {
    if (!currentShareCode) return;
    
    try {
        await navigator.clipboard.writeText(currentShareCode);
        shareStatus.textContent = 'Code copié!';
        shareStatus.className = 'share-status';
        
        setTimeout(() => {
            shareStatus.textContent = 'Quiz partagé avec succès!';
        }, 2000);
    } catch (error) {
        const input = document.createElement('input');
        input.value = currentShareCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        
        shareStatus.textContent = 'Code copié!';
        setTimeout(() => {
            shareStatus.textContent = 'Quiz partagé avec succès!';
        }, 2000);
    }
}

function shareViaWhatsApp() {
    if (!currentShareCode) return;
    
    const message = `Rejoins mon quiz Ctrl+Alt+Histoire !\n\nCode: ${currentShareCode}\n\nTu as 7 jours pour le faire !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ==================== FONCTIONS REJOINDRE QUIZ ====================

function openJoinModal() {
    joinModal.classList.add('active');
    joinCodeInput.value = '';
    joinCodeInput.focus();
    joinStatus.textContent = '';
}

function closeJoinModal() {
    joinModal.classList.remove('active');
    joinCodeInput.value = '';
    joinStatus.textContent = '';
}

async function joinQuizWithCode() {
    const code = joinCodeInput.value.trim().toUpperCase();
    
    if (!code || code.length < 6) {
        joinStatus.textContent = 'Attention: Entrez un code valide';
        joinStatus.className = 'join-status error';
        return;
    }
    
    const formattedCode = code.length === 6 && !code.includes('-') 
        ? code.substring(0, 3) + '-' + code.substring(3)
        : code;
    
    joinStatus.textContent = 'Chargement du quiz...';
    joinStatus.className = 'join-status loading';
    
    try {
        const quiz = await loadQuizFromSupabase(formattedCode);
        
        importedQuizzes.push(quiz);
        renderImportedQuizzes();
        
        closeJoinModal();
        showNotification(`Quiz "${quiz.title}" importé avec succès!`);
        
        quizData = quiz;
        startQuiz();
        
    } catch (error) {
        joinStatus.textContent = 'Erreur: ' + error.message;
        joinStatus.className = 'join-status error';
    }
}

// Event listeners modals
shareModalClose.addEventListener('click', closeShareModal);
copyCodeBtn.addEventListener('click', copyShareCode);
shareWhatsappBtn.addEventListener('click', shareViaWhatsApp);

joinModalClose.addEventListener('click', closeJoinModal);
joinQuizOpenBtn.addEventListener('click', openJoinModal);
joinQuizBtn.addEventListener('click', joinQuizWithCode);

joinCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinQuizWithCode();
});

joinCodeInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (value.length > 3) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6);
    }
    e.target.value = value;
});

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) closeShareModal();
});

joinModal.addEventListener('click', (e) => {
    if (e.target === joinModal) closeJoinModal();
});

// ==================== QUIZ LOADING ====================

async function loadPresetQuiz() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        quizData = data.quiz;
        console.log('Quiz preset chargé');
    } catch (error) {
        console.error('Erreur chargement preset:', error);
        showNotification('Erreur de chargement du quiz preset', true);
    }
}

// ==================== HOMEPAGE ====================

presetQuizCard.addEventListener('click', () => {
    loadPresetQuiz().then(() => {
        if (quizData) startQuiz();
    });
});

createQuizCard.addEventListener('click', showCreateQuizPage);

importQuizBtn.addEventListener('click', () => {
    jsonFileInput.click();
});

jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            const quiz = data.quiz || data;
            
            importedQuizzes.push(quiz);
            renderImportedQuizzes();
            showNotification('Quiz importé avec succès !');
        } catch (error) {
            showNotification('Erreur lors de la lecture du fichier JSON', true);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

function renderImportedQuizzes() {
    if (importedQuizzes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    importedQuizzesGrid.innerHTML = '';
    
    importedQuizzes.forEach((quiz, index) => {
        const card = document.createElement('div');
        card.className = 'imported-quiz-card';
        
        card.innerHTML = `
            <h2 class="card-title">${quiz.title}</h2>
            <p class="card-description">${quiz.description || quiz.subtitle}</p>
            <div class="card-footer">
                <span class="card-meta">${quiz.questions.length} questions · ${Math.ceil(quiz.duration / 60)} min</span>
                <button class="card-qr-btn" data-index="${index}">Partager</button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-qr-btn')) return;
            quizData = quiz;
            startQuiz();
        });
        
        const shareBtn = card.querySelector('.card-qr-btn');
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showShareModal(quiz);
        });
        
        importedQuizzesGrid.appendChild(card);
    });
}

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
        answerImages: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop"
        ]
    };
    createdQuiz.questions.push(newQuestion);
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    createdQuiz.questions.forEach((q, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-editor';
        questionDiv.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${qIndex + 1}</span>
                <button class="btn-delete" data-index="${qIndex}">Supprimer</button>
            </div>
            <input type="text" class="form-input question-input" data-index="${qIndex}" 
                   placeholder="Texte de la question" value="${q.question}">
            <div class="form-group">
                <label class="form-label">Image de la question (URL)</label>
                <input type="url" class="form-input question-image-input" data-index="${qIndex}" 
                       placeholder="https://example.com/image.jpg" value="${q.image}">
            </div>
            <div class="answers-editor">
                ${q.answers.map((ans, aIndex) => `
                    <div class="answer-editor">
                        <input type="text" class="form-input answer-input" 
                               data-qindex="${qIndex}" data-aindex="${aIndex}"
                               placeholder="Réponse ${String.fromCharCode(65 + aIndex)}" 
                               value="${ans}">
                    </div>
                `).join('')}
                <div class="form-group">
                    <label class="form-label">Bonne réponse</label>
                    <select class="form-input correct-answer-select" data-index="${qIndex}">
                        <option value="0" ${q.correctAnswer === 0 ? 'selected' : ''}>A</option>
                        <option value="1" ${q.correctAnswer === 1 ? 'selected' : ''}>B</option>
                        <option value="2" ${q.correctAnswer === 2 ? 'selected' : ''}>C</option>
                        <option value="3" ${q.correctAnswer === 3 ? 'selected' : ''}>D</option>
                    </select>
                </div>
            </div>
        `;
        container.appendChild(questionDiv);
    });
    
    // Event listeners
    document.querySelectorAll('.question-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].question = e.target.value;
        });
    });
    
    document.querySelectorAll('.question-image-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].image = e.target.value;
        });
    });
    
    document.querySelectorAll('.answer-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const qIndex = parseInt(e.target.dataset.qindex);
            const aIndex = parseInt(e.target.dataset.aindex);
            createdQuiz.questions[qIndex].answers[aIndex] = e.target.value;
        });
    });
    
    document.querySelectorAll('.correct-answer-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].correctAnswer = parseInt(e.target.value);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions.splice(index, 1);
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
    
    // Afficher la modal de partage après téléchargement
    setTimeout(() => {
        showShareModal(createdQuiz);
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
    
    // Réponses avec images de fond
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
    
    // Barre de progression
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
    
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / quizData.questions.length * 100).toFixed(1);
    
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

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

answerCards.forEach((card, index) => {
    card.addEventListener('click', () => selectAnswer(index));
});

// Télécharger le certificat PDF
downloadCertificateBtn.addEventListener('click', async () => {
    try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let correctAnswers = 0;
            quizData.questions.forEach((question, index) => {
                if (userAnswers[index] === question.correctAnswer) {
                    correctAnswers++;
                }
            });
            const score = (correctAnswers / quizData.questions.length * 100).toFixed(1);
            
            doc.setFontSize(28);
            doc.setFont(undefined, 'bold');
            doc.text('CERTIFICAT DE COMPLETION', 105, 40, { align: 'center' });
            
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(20, 50, 190, 50);
            
            doc.setFontSize(18);
            doc.setFont(undefined, 'normal');
            doc.text('Quiz:', 20, 70);
            doc.setFont(undefined, 'bold');
            doc.text(quizData.title, 40, 70);
            
            doc.setFontSize(16);
            doc.setFont(undefined, 'normal');
            doc.text('Score obtenu:', 20, 85);
            doc.setFont(undefined, 'bold');
            doc.text(`${correctAnswers} / ${quizData.questions.length} (${score}%)`, 65, 85);
            
            doc.setFont(undefined, 'normal');
            const date = new Date().toLocaleDateString('fr-FR');
            doc.text(`Date: ${date}`, 20, 100);
            
            doc.setFontSize(12);
            doc.text(`ID Certificat: ${certificateId}`, 20, 110);
            
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
                
                doc.setFont(undefined, 'bold');
                doc.text(`Q${index + 1}: ${question.question.substring(0, 60)}${question.question.length > 60 ? '...' : ''}`, 20, yPos);
                
                doc.setFont(undefined, 'normal');
                const userAnswerText = question.answers[userAnswers[index]] || 'Pas de reponse';
                doc.setTextColor(isCorrect ? 0 : 255, isCorrect ? 128 : 0, 0);
                doc.text(`Votre reponse: ${userAnswerText} ${status}`, 25, yPos + 5);
                
                if (!isCorrect) {
                    doc.setTextColor(0, 128, 0);
                    doc.text(`Bonne reponse: ${question.answers[question.correctAnswer]}`, 25, yPos + 10);
                    yPos += 20;
                } else {
                    yPos += 15;
                }
                
                doc.setTextColor(0, 0, 0);
            });
            
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Ctrl+Alt+Histoire - Certificat ${certificateId}`, 105, 290, { align: 'center' });
                doc.text(`Page ${i} / ${pageCount}`, 105, 285, { align: 'center' });
            }
            
            doc.save(`Certificat_${quizData.title.replace(/\s+/g, '_')}_${certificateId}.pdf`);
            
            showNotification('Certificat téléchargé avec succès !');
        };
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showNotification('Erreur lors de la génération du certificat', true);
    }
});

// ==================== CURSOR HALO ====================

const halo = document.getElementById('halo');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    halo.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
});

// ==================== INITIALIZATION ====================

window.addEventListener('load', () => {
    initSupabase();
    loadPresetQuiz();
});
