// ============================================
// CTRL+ALT+HISTOIRE - QUIZ APPLICATION
// Version complète avec Supabase + QR Codes
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

// ==================== IMAGES UNIFORMES POUR LES RÉPONSES ====================

const ANSWER_IMAGES = [
    'carre.jpg',      // Réponse A
    'triangle.avif',  // Réponse B
    'rond_simple.png', // Réponse C
    'losange.png'     // Réponse D
];

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

async function getAllQuizzesFromSupabase() {
    if (!supabaseClient) {
        throw new Error('Supabase non initialisé');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('shared_quizzes')
            .select('code, quiz_data, created_at')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('✓ Quiz chargés depuis Supabase:', data.length);
        return data;
    } catch (error) {
        console.error('Erreur chargement quiz:', error);
        return [];
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
let allSupabaseQuizzes = [];

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
const quitQuizBtn = document.getElementById('quitQuizBtn');

// Éléments du quiz
const questionText = document.getElementById('questionText');
const timeDisplay = document.getElementById('timeDisplay');
const progressDisplay = document.getElementById('progressDisplay');
const questionImage = document.getElementById('questionImage');
const answerCards = document.querySelectorAll('.answer-card');
const questionProgressFill = document.getElementById('questionProgressFill');
const timeProgressFill = document.getElementById('timeProgressFill');

// ==================== GÉNÉRATION QR CODE ====================

function generateQRCode(code) {
    const url = `https://wok-vote-nsi.vercel.app/?quiz=${code}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    return qrApiUrl;
}

async function showQRModal(code) {
    const modal = document.createElement('div');
    modal.className = 'qr-modal active';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <button class="qr-modal-close" onclick="this.closest('.qr-modal').remove()">&times;</button>
            <h2 class="qr-modal-title">QR Code du Quiz</h2>
            <p class="qr-modal-subtitle">Scannez pour accéder au quiz</p>
            
            <div class="qr-code-container" style="text-align: center; margin: 30px 0;">
                <img src="${generateQRCode(code)}" alt="QR Code" style="max-width: 300px; border-radius: 12px;">
            </div>
            
            <div class="share-code-display">
                <div class="code-box">${code}</div>
                <p class="code-hint">https://wok-vote-nsi.vercel.app/?quiz=${code}</p>
            </div>
            
            <div class="share-buttons">
                <button class="btn-primary" onclick="navigator.clipboard.writeText('${code}'); showNotification('Code copié!')">Copier le code</button>
                <button class="btn-secondary" onclick="navigator.clipboard.writeText('https://wok-vote-nsi.vercel.app/?quiz=${code}'); showNotification('Lien copié!')">Copier le lien</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==================== DÉTECTION CODE DANS URL ====================

function checkURLForCode() {
    // Détecter le code dans les query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const potentialCode = urlParams.get('quiz');
    
    if (!potentialCode) return;
    
    // Format XXX-XXX ou XXXXXX
    const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$|^[A-Z0-9]{6}$/i;
    
    if (codeRegex.test(potentialCode)) {
        const normalizedCode = potentialCode.length === 6 
            ? potentialCode.slice(0, 3) + '-' + potentialCode.slice(3)
            : potentialCode.toUpperCase();
        
        console.log('Code détecté dans l\'URL:', normalizedCode);
        
        // Attendre que Supabase soit initialisé
        setTimeout(async () => {
            try {
                const quiz = await loadQuizFromSupabase(normalizedCode);
                
                showNotification('Quiz chargé ! Lancement...');
                
                // Nettoyer l'URL (retour à la racine)
                const baseUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, baseUrl);
                
                // Lancer le quiz automatiquement après un court délai
                setTimeout(() => {
                    startQuiz(quiz);
                }, 800);
                
            } catch (error) {
                showNotification('Erreur: ' + error.message, true);
                // Nettoyer l'URL même en cas d'erreur
                const baseUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, baseUrl);
            }
        }, 1000);
    }
}

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
    
    const message = `Rejoins mon quiz Ctrl+Alt+Histoire !\n\nCode: ${currentShareCode}\nLien: https://wok-vote-nsi.vercel.app/?quiz=${currentShareCode}\n\nTu as 7 jours pour le faire !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

shareModalClose.addEventListener('click', closeShareModal);
copyCodeBtn.addEventListener('click', copyShareCode);
shareWhatsappBtn.addEventListener('click', shareViaWhatsApp);

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        closeShareModal();
    }
});

// ==================== FONCTIONS REJOINDRE QUIZ ====================

function openJoinModal() {
    joinModal.classList.add('active');
    joinCodeInput.value = '';
    joinStatus.textContent = '';
    joinCodeInput.focus();
}

function closeJoinModal() {
    joinModal.classList.remove('active');
}

async function joinQuizWithCode() {
    const code = joinCodeInput.value.trim().toUpperCase();
    
    if (!code || code.length < 6) {
        joinStatus.textContent = 'Code invalide';
        joinStatus.className = 'join-status error';
        return;
    }
    
    joinStatus.textContent = 'Chargement...';
    joinStatus.className = 'join-status loading';
    
    try {
        const quiz = await loadQuizFromSupabase(code);
        
        joinStatus.textContent = 'Quiz chargé ! Lancement...';
        joinStatus.className = 'join-status success';
        
        setTimeout(() => {
            closeJoinModal();
            // Lancer le quiz directement
            startQuiz(quiz);
        }, 800);
        
    } catch (error) {
        joinStatus.textContent = 'Erreur: ' + error.message;
        joinStatus.className = 'join-status error';
    }
}

joinModalClose.addEventListener('click', closeJoinModal);
joinQuizBtn.addEventListener('click', joinQuizWithCode);
joinQuizOpenBtn.addEventListener('click', openJoinModal);

joinCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinQuizWithCode();
    }
});

joinModal.addEventListener('click', (e) => {
    if (e.target === joinModal) {
        closeJoinModal();
    }
});

// ==================== CHARGEMENT QUIZ DEPUIS SUPABASE ====================

async function loadAllSupabaseQuizzes() {
    try {
        const quizzes = await getAllQuizzesFromSupabase();
        
        // Filtrer les doublons basés sur le contenu du quiz
        const uniqueQuizzes = [];
        const seenQuizzes = new Set();
        
        for (const item of quizzes) {
            const quizString = JSON.stringify(item.quiz_data);
            if (!seenQuizzes.has(quizString)) {
                seenQuizzes.add(quizString);
                uniqueQuizzes.push(item);
            }
        }
        
        allSupabaseQuizzes = uniqueQuizzes;
        
        // Ajouter à importedQuizzes s'ils n'existent pas déjà
        for (const item of uniqueQuizzes) {
            const alreadyImported = importedQuizzes.some(q => 
                JSON.stringify(q.quiz) === JSON.stringify(item.quiz_data)
            );
            
            if (!alreadyImported) {
                importedQuizzes.push({
                    quiz: item.quiz_data,
                    code: item.code
                });
            }
        }
        
        displayImportedQuizzes();
        console.log('✓ Quiz Supabase chargés:', uniqueQuizzes.length);
        
    } catch (error) {
        console.error('Erreur chargement quiz Supabase:', error);
    }
}

// ==================== GESTION QUIZ IMPORTÉS ====================

function saveImportedQuizzes() {
    try {
        localStorage.setItem('importedQuizzes', JSON.stringify(importedQuizzes));
    } catch (error) {
        console.error('Erreur sauvegarde localStorage:', error);
    }
}

function loadImportedQuizzes() {
    try {
        const saved = localStorage.getItem('importedQuizzes');
        if (saved) {
            importedQuizzes = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Erreur chargement localStorage:', error);
        importedQuizzes = [];
    }
}

function displayImportedQuizzes() {
    if (importedQuizzes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    importedQuizzesGrid.innerHTML = '';
    
    importedQuizzes.forEach((item, index) => {
        const quiz = item.quiz;
        const code = item.code || '';
        
        const card = document.createElement('div');
        card.className = 'imported-quiz-card';
        
        const questionsCount = quiz.questions ? quiz.questions.length : 0;
        const duration = quiz.duration ? Math.floor(quiz.duration / 60) : 5;
        
        card.innerHTML = `
            <h2 class="card-title">${quiz.title || 'Quiz sans titre'}</h2>
            <p class="card-description">${quiz.description || quiz.subtitle || 'Aucune description'}</p>
            <div class="card-footer">
                <span class="card-meta">${questionsCount} questions · ${duration} min</span>
                ${code ? `<button class="card-qr-btn" data-code="${code}">QR Code</button>` : ''}
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('card-qr-btn')) {
                startQuiz(quiz);
            }
        });
        
        if (code) {
            const qrBtn = card.querySelector('.card-qr-btn');
            qrBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQRModal(code);
            });
        }
        
        importedQuizzesGrid.appendChild(card);
    });
}

function removeImportedQuiz(index) {
    importedQuizzes.splice(index, 1);
    saveImportedQuizzes();
    displayImportedQuizzes();
}

// ==================== IMPORT FICHIER JSON ====================

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
            
            if (!data.quiz || !data.quiz.questions) {
                showNotification('Format JSON invalide', true);
                return;
            }
            
            // Vérifier si déjà importé
            const alreadyImported = importedQuizzes.some(q => 
                JSON.stringify(q.quiz) === JSON.stringify(data.quiz)
            );
            
            if (alreadyImported) {
                showNotification('Quiz déjà importé!', true);
                return;
            }
            
            importedQuizzes.push({
                quiz: data.quiz,
                code: ''
            });
            
            saveImportedQuizzes();
            displayImportedQuizzes();
            showNotification('Quiz importé avec succès!');
            
        } catch (error) {
            showNotification('Erreur lors de la lecture du fichier', true);
        }
    };
    
    reader.readAsText(file);
    e.target.value = '';
});

// ==================== QUIZ PRESET ====================

let presetQuizData = null;

async function loadPresetQuiz() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        presetQuizData = data.quiz;
        
        // Appliquer les images uniformes au quiz preset
        if (presetQuizData && presetQuizData.questions) {
            presetQuizData.questions.forEach(question => {
                question.answerImages = [...ANSWER_IMAGES];
            });
        }
    } catch (error) {
        console.error('Erreur chargement questions.json:', error);
    }
}

presetQuizCard.addEventListener('click', () => {
    if (presetQuizData) {
        startQuiz(presetQuizData);
    } else {
        showNotification('Quiz non disponible', true);
    }
});

// ==================== CRÉATION DE QUIZ ====================

createQuizCard.addEventListener('click', () => {
    homepage.style.display = 'none';
    createQuizPage.style.display = 'block';
    initializeQuizCreator();
});

document.getElementById('backFromCreateBtn').addEventListener('click', () => {
    createQuizPage.style.display = 'none';
    homepage.style.display = 'block';
});

function initializeQuizCreator() {
    createdQuiz = {
        title: 'Mon Quiz',
        subtitle: 'Description du quiz',
        description: 'Testez vos connaissances',
        duration: 300,
        questions: []
    };
    
    document.getElementById('quizTitle').value = createdQuiz.title;
    document.getElementById('quizSubtitle').value = createdQuiz.subtitle;
    document.getElementById('quizDescription').value = createdQuiz.description;
    document.getElementById('quizDuration').value = createdQuiz.duration;
    
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    if (createdQuiz.questions.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">Aucune question. Cliquez sur "+ Ajouter" pour commencer.</p>';
        return;
    }
    
    createdQuiz.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-editor';
        questionDiv.innerHTML = `
            <div class="question-editor-header">
                <h3>Question ${index + 1}</h3>
                <button class="btn-danger" onclick="removeQuestion(${index})">Supprimer</button>
            </div>
            <div class="form-group">
                <label class="form-label">Question</label>
                <input type="text" class="form-input" value="${q.question}" onchange="updateQuestion(${index}, 'question', this.value)">
            </div>
            <div class="answer-inputs">
                ${q.answers.map((answer, i) => `
                    <div class="form-group">
                        <label class="form-label">Réponse ${String.fromCharCode(65 + i)}</label>
                        <input type="text" class="form-input" value="${answer}" onchange="updateAnswer(${index}, ${i}, this.value)">
                    </div>
                `).join('')}
            </div>
            <div class="form-group">
                <label class="form-label">Bonne réponse (0-3)</label>
                <input type="number" class="form-input" min="0" max="3" value="${q.correctAnswer}" onchange="updateQuestion(${index}, 'correctAnswer', parseInt(this.value))">
            </div>
        `;
        container.appendChild(questionDiv);
    });
}

function addQuestion() {
    createdQuiz.questions.push({
        id: createdQuiz.questions.length + 1,
        question: 'Nouvelle question',
        answers: ['Réponse A', 'Réponse B', 'Réponse C', 'Réponse D'],
        correctAnswer: 0,
        image: '',
        answerImages: [...ANSWER_IMAGES]
    });
    renderQuestions();
}

function removeQuestion(index) {
    createdQuiz.questions.splice(index, 1);
    renderQuestions();
}

function updateQuestion(index, field, value) {
    createdQuiz.questions[index][field] = value;
}

function updateAnswer(questionIndex, answerIndex, value) {
    createdQuiz.questions[questionIndex].answers[answerIndex] = value;
}

document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);

document.getElementById('quizTitle').addEventListener('input', (e) => {
    createdQuiz.title = e.target.value;
});

document.getElementById('quizSubtitle').addEventListener('input', (e) => {
    createdQuiz.subtitle = e.target.value;
});

document.getElementById('quizDescription').addEventListener('input', (e) => {
    createdQuiz.description = e.target.value;
});

document.getElementById('quizDuration').addEventListener('input', (e) => {
    createdQuiz.duration = parseInt(e.target.value);
});

document.getElementById('saveQuizBtn').addEventListener('click', async () => {
    if (createdQuiz.questions.length === 0) {
        showNotification('Ajoutez au moins une question', true);
        return;
    }
    
    try {
        // Sauvegarder dans Supabase et obtenir le code
        const code = await saveQuizToSupabase(createdQuiz);
        
        const jsonData = {
            quiz: createdQuiz
        };
        
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_${createdQuiz.title.replace(/\s+/g, '_')}_${code}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification(`Quiz téléchargé et sauvegardé avec le code: ${code}`);
        
        // Afficher le QR code
        setTimeout(() => {
            showQRModal(code);
        }, 1000);
        
    } catch (error) {
        showNotification('Erreur: ' + error.message, true);
    }
});

document.getElementById('previewQuizBtn').addEventListener('click', () => {
    if (createdQuiz.questions.length === 0) {
        showNotification('Ajoutez au moins une question', true);
        return;
    }
    
    createQuizPage.style.display = 'none';
    startQuiz(createdQuiz);
});

// ==================== NOTIFICATIONS ====================

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${isError ? '#ff6b6b' : '#4ade80'};
        color: #000000;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 100000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== DÉMARRAGE QUIZ ====================

function startQuiz(quiz) {
    quizData = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    elapsedTime = 0;
    
    homepage.style.display = 'none';
    createQuizPage.style.display = 'none';
    resultspage.style.display = 'none';
    quizpage.style.display = 'block';
    
    startTime = Date.now();
    displayQuestion();
    startTimer();
}

// ==================== MODAL DE CONFIRMATION POUR QUITTER ====================

function showQuitConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'quit-modal';
    modal.innerHTML = `
        <div class="quit-modal-content">
            <h2 class="quit-modal-title">Quitter le quiz ?</h2>
            <p class="quit-modal-message">Votre progression sera perdue.</p>
            <div class="quit-modal-buttons">
                <button class="btn-secondary quit-cancel">Continuer le quiz</button>
                <button class="btn-danger quit-confirm">Quitter</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
    
    const cancelBtn = modal.querySelector('.quit-cancel');
    const confirmBtn = modal.querySelector('.quit-confirm');
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    confirmBtn.addEventListener('click', () => {
        stopTimer();
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            quizpage.style.display = 'none';
            homepage.style.display = 'block';
        }, 300);
    });
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

function quitQuiz() {
    showQuitConfirmation();
}

if (quitQuizBtn) {
    quitQuizBtn.addEventListener('click', quitQuiz);
}

function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    
    questionText.textContent = question.question;
    progressDisplay.textContent = `Question ${currentQuestionIndex + 1} / ${quizData.questions.length}`;
    
    const questionProgress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    questionProgressFill.style.width = `${questionProgress}%`;
    
    // Image de la question
    if (question.image) {
        questionImage.src = question.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.src = '';
        questionImage.style.display = 'none';
    }
    
    // Réponses avec images uniformes
    answerCards.forEach((card, index) => {
        const answerText = card.querySelector('.answer-text');
        answerText.textContent = question.answers[index] || '';
        
        card.classList.remove('selected', 'correct', 'incorrect');
    });
    
    nextBtn.disabled = true;
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    
    answerCards.forEach(card => card.classList.remove('selected'));
    answerCards[index].classList.add('selected');
    
    nextBtn.disabled = false;
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

window.addEventListener('load', async () => {
    initSupabase();
    loadPresetQuiz();
    loadImportedQuizzes();
    
    // Charger tous les quiz de Supabase
    await loadAllSupabaseQuizzes();
    
    // Vérifier si un code est dans l'URL
    checkURLForCode();
    
    displayImportedQuizzes();
});
