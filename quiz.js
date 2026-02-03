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

// Éléments DOM
const homepage = document.getElementById('homepage');
const quizpage = document.getElementById('quizpage');
const resultspage = document.getElementById('resultspage');
const createQuizPage = document.getElementById('createQuizPage');
const jsonFileInput = document.getElementById('jsonFileInput');
const importedQuizzesGrid = document.getElementById('importedQuizzesGrid');
const emptyState = document.getElementById('emptyState');

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
            </div>
        `;
        
        card.addEventListener('click', () => {
            quizData = quiz;
            startQuiz();
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
            
            <div class="question-actions">
                <button class="delete-question-btn" data-index="${index}">Supprimer la question</button>
            </div>
        `;
        container.appendChild(questionDiv);
    });
    
    attachQuestionEditorListeners();
}

function attachQuestionEditorListeners() {
    // Texte des questions
    document.querySelectorAll('.question-text').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            createdQuiz.questions[index].question = e.target.value;
        });
    });
    
    // Réponses
    document.querySelectorAll('.answer-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const answerIndex = parseInt(e.target.dataset.answer);
            createdQuiz.questions[index].answers[answerIndex] = e.target.value;
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
    
    // Suppression
    document.querySelectorAll('.delete-question-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (createdQuiz.questions.length > 1) {
                createdQuiz.questions.splice(index, 1);
                // Réindexer les IDs
                createdQuiz.questions.forEach((q, i) => q.id = i + 1);
                renderQuestions();
            } else {
                showNotification('Un quiz doit contenir au moins une question', true);
            }
        });
    });
}

// Ajouter une question
addQuestionBtn.addEventListener('click', addNewQuestion);

// Sauvegarder le quiz
saveQuizBtn.addEventListener('click', () => {
    // Mettre à jour la config
    createdQuiz.title = document.getElementById('quizTitle').value;
    createdQuiz.subtitle = document.getElementById('quizSubtitle').value;
    createdQuiz.description = document.getElementById('quizDescription').value;
    createdQuiz.duration = parseInt(document.getElementById('quizDuration').value);
    
    // Vérifier qu'il n'y a pas de questions vides
    const emptyQuestions = createdQuiz.questions.filter(q => 
        !q.question || q.answers.some(a => !a)
    );
    
    if (emptyQuestions.length > 0) {
        showNotification('Certaines questions sont incomplètes', true);
        return;
    }
    
    // Créer le fichier JSON
    const dataStr = JSON.stringify({ quiz: createdQuiz }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${createdQuiz.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Quiz téléchargé avec succès !');
});

// Prévisualiser le quiz
previewQuizBtn.addEventListener('click', () => {
    // Mettre à jour la config
    createdQuiz.title = document.getElementById('quizTitle').value;
    createdQuiz.subtitle = document.getElementById('quizSubtitle').value;
    createdQuiz.description = document.getElementById('quizDescription').value;
    createdQuiz.duration = parseInt(document.getElementById('quizDuration').value);
    
    // Vérifier les questions
    const emptyQuestions = createdQuiz.questions.filter(q => 
        !q.question || q.answers.some(a => !a)
    );
    
    if (emptyQuestions.length > 0) {
        showNotification('Certaines questions sont incomplètes', true);
        return;
    }
    
    // Charger et démarrer
    quizData = createdQuiz;
    createQuizPage.style.display = 'none';
    startQuiz();
});

// Retour depuis création
backFromCreateBtn.addEventListener('click', () => {
    createQuizPage.style.display = 'none';
    homepage.style.display = 'block';
});

// ==================== QUIZ ====================

function startQuiz() {
    if (!quizData) {
        showNotification('Le questionnaire n\'est pas chargé', true);
        return;
    }
    
    // Réinitialiser
    currentQuestionIndex = 0;
    userAnswers = [];
    elapsedTime = 0;
    
    // Afficher la page quiz
    homepage.style.display = 'none';
    createQuizPage.style.display = 'none';
    resultspage.style.display = 'none';
    quizpage.style.display = 'block';
    
    // Démarrer le chrono
    startTime = Date.now();
    startTimer();
    
    // Afficher la première question
    displayQuestion();
}

function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    
    // Texte de la question
    questionText.textContent = question.question;
    
    // Progression
    progressDisplay.textContent = `Question ${currentQuestionIndex + 1} / ${quizData.questions.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    questionProgressFill.style.width = progressPercent + '%';
    
    // Réponses avec images en arrière-plan
    answerCards.forEach((card, index) => {
        const answerTextElement = card.querySelector('.answer-text');
        if (question.answers[index]) {
            answerTextElement.textContent = question.answers[index];
            card.style.display = 'flex';
            card.classList.remove('selected');
            
            // Appliquer l'image de fond si elle existe
            if (question.answerImages && question.answerImages[index]) {
                card.style.setProperty('--bg-image', `url('${question.answerImages[index]}')`);
            } else {
                card.style.setProperty('--bg-image', 'none');
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    // Image
    if (question.image && question.image !== '') {
        questionImage.src = question.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }
    
    // Vérifier si déjà répondu
    if (userAnswers[currentQuestionIndex] !== undefined) {
        highlightAnswer(userAnswers[currentQuestionIndex]);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = quizData.duration - elapsedTime;
        
        timeDisplay.textContent = `${elapsedTime}s / ${quizData.duration}s`;
        
        const timePercent = (elapsedTime / quizData.duration) * 100;
        timeProgressFill.style.width = Math.min(timePercent, 100) + '%';
        
        if (remainingTime <= 0) {
            endQuiz();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
    highlightAnswer(answerIndex);
}

function highlightAnswer(answerIndex) {
    answerCards.forEach((card, index) => {
        if (index === answerIndex) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        showNotification('Veuillez sélectionner une réponse', true);
        return;
    }
    
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        endQuiz();
    }
}

// Générer un ID de certificat unique avec pattern mathématique
function generateCertificateId() {
    const timestamp = Date.now();
    const quizHash = hashString(quizData.title);
    const scoreHash = userAnswers.reduce((acc, val) => acc + val, 0);
    
    // Pattern: QZ-XXXXXX-YYYY-ZZZZ
    const part1 = (timestamp % 999999).toString().padStart(6, '0');
    const part2 = (quizHash % 9999).toString().padStart(4, '0');
    const part3 = ((scoreHash * 137 + timestamp) % 9999).toString().padStart(4, '0');
    
    return `QZ-${part1}-${part2}-${part3}`;
}

// Fonction de hachage simple
function hashString(str) {
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

const halo = document.getElementById('halo');

        // On écoute le mouvement de la souris sur tout le document
        document.addEventListener('mousemove', (e) => {
            // Utilisation des coordonnées clientX et clientY
            const x = e.clientX;
            const y = e.clientY;

            // On met à jour la position avec translate3d pour de meilleures performances (GPU)
            // Le -50% est déjà géré par le CSS via transform: translate(-50%, -50%)
            // On concatène les deux ici :
            halo.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
        });

// Charger le quiz preset au démarrage
loadPresetQuiz();
