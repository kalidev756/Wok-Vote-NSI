/* Reset et base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    background-color: #000000;
    color: #ffffff;
    line-height: 1.5;
    overflow-x: hidden;
}

/* ==================== MODALS QR CODE ==================== */

.qr-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.qr-modal.active {
    display: flex;
}

.qr-modal-content {
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    position: relative;
    animation: slideUp 0.3s ease;
}

.qr-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.qr-modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
}

.qr-modal-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 10px;
    text-align: center;
}

.qr-modal-subtitle {
    font-size: 1rem;
    color: #aaaaaa;
    margin-bottom: 30px;
    text-align: center;
}

/* Affichage du code de partage */
.share-code-display {
    text-align: center;
    margin-bottom: 30px;
}

.code-box {
    background: #000000;
    color: #ffffff;
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: 0.3rem;
    padding: 30px 20px;
    border-radius: 16px;
    margin-bottom: 15px;
    font-family: 'Courier New', monospace;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    user-select: all;
}

.code-hint {
    color: #888888;
    font-size: 0.9rem;
}

/* Boutons de partage */
.share-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.share-buttons button {
    flex: 1;
}

.share-status {
    text-align: center;
    color: #4ade80;
    font-size: 0.95rem;
    min-height: 24px;
}

/* Input pour rejoindre */
.join-input-container {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.code-input {
    flex: 1;
    min-width: 200px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.2rem;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    transition: all 0.2s ease;
}

.code-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 0.08);
}

.code-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.3rem;
}

.join-input-container .btn-primary {
    min-width: 140px;
}

.join-status {
    text-align: center;
    font-size: 0.95rem;
    min-height: 24px;
}

.join-status.loading {
    color: #888888;
}

.join-status.success {
    color: #4ade80;
}

.join-status.error {
    color: #ff6b6b;
}

/* ==================== HOMEPAGE ==================== */

.homepage {
    min-height: 100vh;
    padding: 0;
    max-width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
    position: relative;
}

.homepage-header {
    text-align: center;
    padding: 120px 60px 60px;
    position: relative;
    z-index: 1;
}

.main-title {
    font-size: 4.5rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 20px;
    letter-spacing: -0.03em;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
}

.main-subtitle {
    font-size: 1.4rem;
    color: #cccccc;
    font-weight: 400;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.8);
}

/* Cartes principales */
.main-cards-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
    margin: 0 auto 120px;
    max-width: 1400px;
    width: 100%;
    padding: 0 60px;
    position: relative;
    z-index: 1;
}

.main-card {
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 60px 50px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(20px);
    overflow: hidden;
}

.main-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.main-card:hover::before {
    opacity: 1;
}

.main-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(10, 10, 10, 0.9);
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.card-icon {
    display: none;
}

.card-title {
    font-size: 2.2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
}

.card-description {
    font-size: 1.1rem;
    color: #aaaaaa;
    margin-bottom: 30px;
    line-height: 1.7;
    flex: 1;
}

.card-footer {
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.card-meta {
    font-size: 0.95rem;
    color: #777777;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.card-qr-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
}

.card-qr-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

/* Section importée */
.imported-section {
    flex: 1;
    padding: 0 60px 80px;
    position: relative;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.447);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 20px;
}

.header-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.02em;
}

.import-btn {
    background: #ffffff;
    color: #000000;
    border: none;
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.import-btn:hover {
    background: #e3e3e3;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

.scanner-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.scanner-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.btn-icon {
    font-size: 1.2rem;
}

/* Grille des quiz importés */
.imported-quizzes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 28px;
}

.imported-quiz-card {
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 220px;
    backdrop-filter: blur(20px);
}

.imported-quiz-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(10, 10, 10, 0.9);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.imported-quiz-card .card-icon {
    display: none;
}

.imported-quiz-card .card-title {
    font-size: 1.5rem;
    margin-bottom: 12px;
}

.imported-quiz-card .card-description {
    font-size: 1rem;
    margin-bottom: 20px;
}

.imported-quiz-card .card-footer {
    padding-top: 20px;
}

/* État vide */
.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 100px 20px;
}

.empty-icon {
    display: none;
}

.empty-state p {
    color: #666666;
    font-size: 1.1rem;
}

.empty-state p:first-of-type {
    font-size: 1.4rem;
    color: #888888;
    margin-bottom: 12px;
    font-weight: 500;
}

.empty-hint {
    font-size: 1rem !important;
    margin-top: 16px;
}

/* ==================== CREATE QUIZ PAGE ==================== */

.create-quiz-page {
    display: none;
    min-height: 100vh;
    background: #000000;
    padding: 40px 60px;
}

.page-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 20px;
    margin-bottom: 50px;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
}

.back-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
}

.create-content {
    max-width: 100%;
    margin: 0 auto;
}

.config-section,
.questions-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 32px;
}

.section-heading {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 32px;
}

.section-header-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 15px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #ffffff;
}

.form-input {
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 1rem;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

/* Questions editor */
#questionsContainer {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.question-editor {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 32px;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.question-number {
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffffff;
}

.btn-delete {
    background: rgba(255, 0, 0, 0.1);
    color: #ff6b6b;
    border: 1px solid rgba(255, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.btn-delete:hover {
    background: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
}

.answers-editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.answer-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.question-editor input,
.question-editor textarea,
.question-editor select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 1rem;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    margin-bottom: 16px;
    font-family: inherit;
}

.question-editor textarea {
    min-height: 100px;
    resize: vertical;
}

.question-editor input:focus,
.question-editor textarea:focus,
.question-editor select:focus {
    outline: none;
    border-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.actions-bar {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-primary {
    background: #ffffff;
    color: #000000;
    border: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: #e3e3e3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}

/* ==================== QUIZ PAGE ==================== */

.quiz-page {
    display: none;
    min-height: 100vh;
    background: #000000;
    padding: 40px 60px;
}

.quiz-header {
    max-width: 100%;
    margin: 0 auto 50px;
}

.quiz-progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 1rem;
    color: #888888;
}

.progress-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #ffffff;
    transition: width 0.3s ease;
    width: 0%;
}

.time-bar .progress-fill {
    background: #666666;
}

.quiz-content {
    max-width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
}

.quiz-main {
    display: flex;
    flex-direction: column;
}

.question-text {
    font-size: 2.5rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 50px;
    line-height: 1.3;
}

.answers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 50px;
    flex: 1;
}

.answer-card {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    min-height: 200px;
}

.answer-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 40%;
    height: 100%;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15;
    z-index: 0;
}

.answer-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
    transform: scale(1.02);
}

.answer-card.selected {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
}

.answer-content {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 28px;
    position: relative;
    z-index: 1;
    flex: 1;
}

.answer-label {
    font-weight: 700;
    font-size: 1.2rem;
    color: #666666;
    min-width: 32px;
}

.answer-card.selected .answer-label {
    color: #ffffff;
}

.answer-card .answer-text {
    font-size: 1.1rem;
    color: #ffffff;
    line-height: 1.6;
    flex: 1;
}

.quiz-next-btn {
    align-self: flex-end;
}

.quiz-sidebar {
    display: flex;
    flex-direction: column;
}

.question-image-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    height: 100%;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.question-image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: none;
}

.question-image-container img[src]:not([src=""]) {
    display: block;
}

/* ==================== RESULTS PAGE ==================== */

.results-page {
    display: none;
    min-height: 100vh;
    background: #000000;
    padding: 80px 60px;
}

.results-container {
    max-width: 1200px;
    margin: 0 auto;
}

.results-header {
    text-align: center;
    margin-bottom: 50px;
}

.results-title {
    font-size: 3rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 30px;
}

.score-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 50px;
    margin-bottom: 30px;
    text-align: center;
}

.score-text {
    font-size: 2.5rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
}

.results-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 50px;
    flex-wrap: wrap;
}

.download-certificate-btn {
    background: #ffffff;
    color: #000000;
    border: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.download-certificate-btn:hover {
    background: #e3e3e3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.results-details {
    text-align: left;
}

.result-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 20px;
}

.result-item h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
}

.result-item p {
    font-size: 1rem;
    color: #ffffff;
    margin-bottom: 8px;
}

.result-item .correct {
    color: #4ade80;
    font-weight: 600;
}

.result-item .incorrect {
    color: #ff6b6b;
    font-weight: 600;
}

/* ==================== ANIMATIONS ==================== */

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* ==================== RESPONSIVE ==================== */

@media (max-width: 1200px) {
    .quiz-content {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    
    .quiz-sidebar {
        display: none;
    }
}

@media (max-width: 992px) {
    .main-title {
        font-size: 3rem;
    }
    
    .question-text {
        font-size: 2rem;
    }
    
    .homepage-header {
        padding: 80px 40px 40px;
    }
    
    .main-cards-container,
    .imported-section,
    .create-quiz-page,
    .quiz-page,
    .results-page {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 768px) {
    .homepage-header {
        padding: 60px 20px 30px;
    }
    
    .main-title {
        font-size: 2.5rem;
    }
    
    .main-subtitle {
        font-size: 1.1rem;
    }
    
    .main-cards-container {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 0 20px;
        margin-bottom: 60px;
    }
    
    .main-card {
        padding: 40px 30px;
        min-height: 250px;
    }
    
    .card-title {
        font-size: 1.8rem;
    }
    
    .imported-section {
        padding: 0 20px 60px;
    }
    
    .section-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .header-buttons {
        width: 100%;
        justify-content: stretch;
    }
    
    .import-btn,
    .scanner-btn {
        flex: 1;
        justify-content: center;
    }
    
    .imported-quizzes-grid {
        grid-template-columns: 1fr;
    }
    
    .create-quiz-page,
    .quiz-page,
    .results-page {
        padding: 20px;
    }
    
    .page-header {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .page-title {
        font-size: 2rem;
    }
    
    .back-btn {
        justify-self: start;
    }
    
    .config-section,
    .questions-section {
        padding: 24px;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .question-editor {
        padding: 20px;
    }
    
    .answer-inputs {
        grid-template-columns: 1fr;
    }
    
    .answers-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .answer-card {
        min-height: 120px;
    }
    
    .answer-content {
        padding: 20px;
    }
    
    .question-text {
        font-size: 1.5rem;
        margin-bottom: 30px;
    }
    
    .results-title {
        font-size: 2rem;
    }
    
    .score-text {
        font-size: 2rem;
    }
    
    .result-item {
        padding: 20px;
    }
    
    .qr-modal-content {
        padding: 30px 20px;
        width: 95%;
    }
    
    .qr-code-container {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .main-title {
        font-size: 2rem;
    }
    
    .main-subtitle {
        font-size: 1rem;
    }
    
    .card-title {
        font-size: 1.5rem;
    }
    
    .card-description {
        font-size: 1rem;
    }
    
    .question-text {
        font-size: 1.3rem;
    }
    
    .answer-card .answer-text {
        font-size: 1rem;
    }
    
    .btn-primary,
    .btn-secondary,
    .import-btn {
        padding: 12px 24px;
        font-size: 0.95rem;
    }
    
    .qr-modal-title {
        font-size: 1.5rem;
    }
}

/* ==================== VIDEO BACKGROUND ==================== */

.video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
}

.video1, .video2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
}

.video1 {
    z-index: -2;
}

.video2 {
    z-index: -1;
    animation: essuieGlace 8s ease-in-out infinite;
}

@keyframes essuieGlace {
    0% {
        clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 20% 100%);
    }
    50% {
        clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 80% 100%);
    }
    100% {
        clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 20% 100%);
    }
}

/* Overlay sombre pour améliorer la lisibilité */
.homepage::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 0;
    pointer-events: none;
}

.cursor-halo {
    position: fixed;
    top: 0;
    left: 0;
    width: 1250px;
    height: 1250px;
    background: radial-gradient(
        circle, 
        rgba(215, 215, 215, 0.321) 0%, 
        rgba(255, 255, 255, 0) 70%
    );
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 10;
    transition: transform 0.1s cubic-bezier(0.23, 1, 0.32, 1);
    will-change: transform;
}

@media (max-width: 768px) {
    .cursor-halo {
        display: none;
    }
}
