// Variables globales
let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = 0;
let timerInterval = null;
let elapsedTime = 0;
let createdQuiz = null;

// Éléments DOM
const homepage = document.getElementById('homepage');
const quizpage = document.getElementById('quizpage');
const resultspage = document.getElementById('resultspage');
const createQuizPage = document.getElementById('createQuizPage');
const carouselTrack = document.getElementById('carouselTrack');
const jsonFileInput = document.getElementById('jsonFileInput');

// Boutons du quiz
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const questionText = document.getElementById('questionText');
const timeDisplay = document.getElementById('timeDisplay');
const progressDisplay = document.getElementById('progressDisplay');
const questionImage = document.getElementById('questionImage');
const answerBoxes = document.querySelectorAll('[data-answer]');

// Chargement du quiz preset
async function loadQuizData() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        quizData = data.quiz;
        
        console.log('Quiz chargé:', quizData);
        initializeCarousel();
    } catch (error) {
        console.error('Erreur de chargement du quiz:', error);
    }
}

// Initialiser le carousel avec les cartes
function initializeCarousel() {
    const cards = [
        {
            type: 'preset',
            title: quizData.title,
            description: quizData.description || quizData.subtitle,
            image: quizData.cardImage || '',
            icon: '🎮',
            action: () => startQuiz()
        },
        {
            type: 'upload',
            title: 'Import Quiz',
            description: 'Importez votre propre fichier JSON de quiz personnalisé',
            icon: '📁',
            action: () => document.getElementById('jsonFileInput').click()
        },
        {
            type: 'create',
            title: 'Create Quiz',
            description: 'Créez votre propre quiz avec notre éditeur intuitif',
            icon: '✏️',
            action: () => showCreateQuizPage()
        }
    ];
    
    // Dupliquer les cartes pour l'effet de boucle infinie
    const allCards = [...cards, ...cards, ...cards];
    
    carouselTrack.innerHTML = '';
    allCards.forEach(card => {
        const cardElement = createCard(card);
        carouselTrack.appendChild(cardElement);
    });
}

// Créer une carte
function createCard(cardData) {
    const card = document.createElement('div');
    card.className = `quiz-card ${cardData.type}-card`;
    
    const imageSection = document.createElement('div');
    imageSection.className = 'quiz-card-image';
    
    if (cardData.image && cardData.type === 'preset') {
        const img = document.createElement('img');
        img.src = cardData.image;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imageSection.appendChild(img);
    } else {
        imageSection.textContent = cardData.icon;
    }
    
    const content = document.createElement('div');
    content.className = 'quiz-card-content';
    
    const title = document.createElement('div');
    title.className = 'quiz-card-title';
    title.textContent = cardData.title;
    
    const description = document.createElement('div');
    description.className = 'quiz-card-description';
    description.textContent = cardData.description;
    
    content.appendChild(title);
    content.appendChild(description);
    
    card.appendChild(imageSection);
    card.appendChild(content);
    
    card.addEventListener('click', cardData.action);
    
    return card;
}

// Gestion de l'upload de fichier JSON
jsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            quizData = data.quiz;
            
            document.getElementById('mainTitle').textContent = quizData.title;
            document.getElementById('mainSubtitle').textContent = quizData.subtitle;
            
            alert('Quiz chargé avec succès !');
            startQuiz();
        } catch (error) {
            alert('Erreur lors de la lecture du fichier JSON : ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset l'input pour permettre de recharger le même fichier
    e.target.value = '';
});

// === CRÉATION DE QUIZ ===

// Boutons de création
const addQuestionBtn = document.getElementById('addQuestionBtn');
const saveQuizBtn = document.getElementById('saveQuizBtn');
const previewQuizBtn = document.getElementById('previewQuizBtn');
const backFromCreateBtn = document.getElementById('backFromCreateBtn');

function showCreateQuizPage() {
    homepage.style.display = 'none';
    createQuizPage.style.display = 'block';
    
    // Initialiser avec une question par défaut
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
        answerImages: ["carre.jpg", "triangle.avif", "rond_simple.png", "losange.png"]
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
            
            <label>Question:
                <textarea class="question-text" data-index="${index}">${question.question}</textarea>
            </label>
            
            <label>Réponses:</label>
            <div class="answer-inputs">
                ${question.answers.map((answer, ansIndex) => `
                    <div class="answer-input-group">
                        <label>Réponse ${ansIndex + 1}:</label>
                        <input type="text" class="answer-input" data-index="${index}" data-answer="${ansIndex}" value="${answer}">
                    </div>
                `).join('')}
            </div>
            
            <div class="correct-answer-selector">
                <label>Bonne réponse:
                    <select class="correct-answer" data-index="${index}">
                        <option value="0" ${question.correctAnswer === 0 ? 'selected' : ''}>Réponse 1</option>
                        <option value="1" ${question.correctAnswer === 1 ? 'selected' : ''}>Réponse 2</option>
                        <option value="2" ${question.correctAnswer === 2 ? 'selected' : ''}>Réponse 3</option>
                        <option value="3" ${question.correctAnswer === 3 ? 'selected' : ''}>Réponse 4</option>
                    </select>
                </label>
            </div>
            
            <label>URL de l'image d'illustration:
                <input type="text" class="question-image" data-index="${index}" value="${question.image}" placeholder="https://...">
            </label>
            
            <div class="question-actions">
                <button class="delete-question-btn" data-index="${index}">Supprimer</button>
            </div>
        `;
        container.appendChild(questionDiv);
    });
    
    // Ajouter les event listeners
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
    
    // Images
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
            if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
                createdQuiz.questions.splice(index, 1);
                // Réindexer les IDs
                createdQuiz.questions.forEach((q, i) => q.id = i + 1);
                renderQuestions();
            }
        });
    });
}

// Ajouter une question
addQuestionBtn.addEventListener('click', addNewQuestion);

// Sauvegarder le quiz
saveQuizBtn.addEventListener('click', () => {
    // Mettre à jour les config
    createdQuiz.title = document.getElementById('quizTitle').value;
    createdQuiz.subtitle = document.getElementById('quizSubtitle').value;
    createdQuiz.description = document.getElementById('quizDescription').value;
    createdQuiz.cardImage = document.getElementById('quizCardImage').value;
    createdQuiz.duration = parseInt(document.getElementById('quizDuration').value);
    
    // Créer le fichier JSON
    const jsonData = JSON.stringify({ quiz: createdQuiz }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Télécharger
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mon-quiz.json';
    a.click();
    
    URL.revokeObjectURL(url);
    alert('Quiz téléchargé !');
});

// Prévisualiser le quiz
previewQuizBtn.addEventListener('click', () => {
    // Mettre à jour les config
    createdQuiz.title = document.getElementById('quizTitle').value;
    createdQuiz.subtitle = document.getElementById('quizSubtitle').value;
    createdQuiz.description = document.getElementById('quizDescription').value;
    createdQuiz.cardImage = document.getElementById('quizCardImage').value;
    createdQuiz.duration = parseInt(document.getElementById('quizDuration').value);
    
    if (createdQuiz.questions.length === 0) {
        alert('Ajoutez au moins une question avant de prévisualiser');
        return;
    }
    
    // Vérifier que toutes les questions ont du texte
    const emptyQuestions = createdQuiz.questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
        alert('Certaines questions sont vides. Veuillez les compléter.');
        return;
    }
    
    // Charger le quiz créé
    quizData = createdQuiz;
    document.getElementById('mainTitle').textContent = quizData.title;
    document.getElementById('mainSubtitle').textContent = quizData.subtitle;
    
    // Cacher la page de création et démarrer le quiz
    createQuizPage.style.display = 'none';
    homepage.style.display = 'flex';
    startQuiz();
});

// Retour au menu depuis création
backFromCreateBtn.addEventListener('click', () => {
    createQuizPage.style.display = 'none';
    homepage.style.display = 'flex';
    document.getElementById('mainSubtitle').textContent = 'Choisissez votre quiz';
});


// Démarrer le quiz
function startQuiz() {
    if (!quizData) {
        alert('Le questionnaire n\'est pas encore chargé');
        return;
    }
    
    // Réinitialiser les variables
    currentQuestionIndex = 0;
    userAnswers = [];
    elapsedTime = 0;
    
    // Animation de glissement vers le haut (le quiz passe PAR DESSUS)
    quizpage.style.display = 'flex';
    
    // Attendre un court instant avant d'ajouter la classe slide-up au quiz
    setTimeout(() => {
        quizpage.classList.add('slide-up');
    }, 50);
    
    // Démarrer le chronomètre
    startTime = Date.now();
    startTimer();
    
    // Afficher la première question
    displayQuestion();
}

// Afficher une question
function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    
    // Mettre à jour le texte de la question
    questionText.textContent = question.question;
    
    // Mettre à jour la progression
    progressDisplay.textContent = `Question: ${currentQuestionIndex + 1} / ${quizData.questions.length}`;
    
    // Mettre à jour la jauge de progression
    const progressPercent = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    document.querySelector('.advencement_progress').style.setProperty('--progress', progressPercent + '%');
    
    // Afficher les réponses avec leurs images
    answerBoxes.forEach((box, index) => {
        if (question.answers[index]) {
            // Créer ou mettre à jour le texte de la réponse
            box.innerHTML = `<span class="answer-text">${question.answers[index]}</span>`;
            box.style.display = 'flex';
            box.classList.remove('selected', 'correct', 'incorrect');
            
            // Appliquer l'image de fond si elle existe
            if (question.answerImages && question.answerImages[index]) {
                box.style.setProperty('--bg-image', `url('${question.answerImages[index]}')`);
            } else {
                box.style.setProperty('--bg-image', 'none');
            }
        } else {
            box.style.display = 'none';
        }
    });
    
    // Afficher l'image d'illustration si elle existe
    if (question.image && question.image !== '') {
        questionImage.src = question.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }
    
    // Vérifier si l'utilisateur a déjà répondu à cette question
    if (userAnswers[currentQuestionIndex] !== undefined) {
        highlightAnswer(userAnswers[currentQuestionIndex]);
    }
}

// Gérer le chronomètre
function startTimer() {
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = quizData.duration - elapsedTime;
        
        timeDisplay.textContent = `Temps: ${elapsedTime}s / ${quizData.duration}s`;
        
        // Mettre à jour la jauge de temps
        const timePercent = (elapsedTime / quizData.duration) * 100;
        document.querySelector('.time_progress').style.setProperty('--progress', timePercent + '%');
        
        // Si le temps est écoulé
        if (remainingTime <= 0) {
            endQuiz();
        }
    }, 1000);
}

// Arrêter le chronomètre
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Gérer la sélection d'une réponse
function selectAnswer(answerIndex) {
    // Enregistrer la réponse
    userAnswers[currentQuestionIndex] = answerIndex;
    
    // Mettre en évidence la réponse sélectionnée
    highlightAnswer(answerIndex);
}

// Mettre en évidence une réponse
function highlightAnswer(answerIndex) {
    answerBoxes.forEach((box, index) => {
        if (index === answerIndex) {
            box.classList.add('selected');
        } else {
            box.classList.remove('selected');
        }
    });
}

// Passer à la question suivante
function nextQuestion() {
    // Vérifier si une réponse a été sélectionnée
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Veuillez sélectionner une réponse avant de continuer');
        return;
    }
    
    // Passer à la question suivante ou terminer
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        endQuiz();
    }
}

// Terminer le quiz
function endQuiz() {
    stopTimer();
    
    // Cacher le quiz, afficher les résultats
    quizpage.style.display = 'none';
    resultspage.style.display = 'flex';
    
    // Calculer le score
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / quizData.questions.length * 100).toFixed(1);
    
    // Afficher le score
    document.getElementById('scoreDisplay').textContent = 
        `Score: ${correctAnswers} / ${quizData.questions.length} (${score}%)`;
    
    // Afficher les détails
    displayDetailedResults();
}

// Afficher les résultats détaillés
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

// Recommencer le quiz
function restartQuiz() {
    resultspage.style.display = 'none';
    
    // Réinitialiser les animations
    quizpage.classList.remove('slide-up');
    
    // Attendre la fin de l'animation avant de cacher
    setTimeout(() => {
        quizpage.style.display = 'none';
        // Retour au menu principal avec carousel
        homepage.style.display = 'flex';
        document.getElementById('mainSubtitle').textContent = 'Choisissez votre quiz';
    }, 1000);
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// Ajouter des event listeners aux réponses
answerBoxes.forEach((box, index) => {
    box.addEventListener('click', () => selectAnswer(index));
});

// Charger les données au chargement de la page
loadQuizData();
