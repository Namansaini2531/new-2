// Quiz Application - DBT Knowledge Challenge (Fixed Version)
class DBTQuiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = []; // Array to store user answers for each question
        this.questionScored = []; // Array to track which questions have been scored
        this.startTime = null;
        this.participantData = {};
        this.questions = [
            {
                question: "What is the main difference between Aadhaar linking and Aadhaar seeding?",
                options: [
                    "There is no difference, both terms mean the same thing",
                    "Aadhaar linking is for identification only, while Aadhaar seeding enables DBT capabilities",
                    "Aadhaar seeding is only for government employees",
                    "Aadhaar linking is more secure than Aadhaar seeding"
                ],
                correct: 1,
                explanation: "Aadhaar linking simply connects your Aadhaar to your bank account for identification, while Aadhaar seeding enables DBT capabilities for receiving government benefits directly."
            },
            {
                question: "What does DBT stand for in the context of government schemes?",
                options: [
                    "Digital Banking Transfer",
                    "Direct Benefit Transfer",
                    "Database Transaction",
                    "Digital Benefit Technology"
                ],
                correct: 1,
                explanation: "DBT stands for Direct Benefit Transfer, which ensures government subsidies and benefits reach intended beneficiaries directly through their bank accounts."
            },
            {
                question: "What is the income limit for Pre-Matric Scholarships for SC students?",
                options: [
                    "₹1.50 lakh per annum",
                    "₹2.00 lakh per annum",
                    "₹2.50 lakh per annum",
                    "₹3.00 lakh per annum"
                ],
                correct: 2,
                explanation: "The income limit for Pre-Matric Scholarships for SC students is ₹2.50 lakh per annum."
            },
            {
                question: "Which classes are covered under Pre-Matric Scholarships?",
                options: [
                    "Classes I to VIII",
                    "Classes I to X",
                    "Classes VI to X",
                    "Classes IX to XII"
                ],
                correct: 1,
                explanation: "Pre-Matric Scholarships for SC students cover classes I to X to encourage regular school attendance and completion of school education."
            },
            {
                question: "How can you verify if your bank account is DBT-enabled?",
                options: [
                    "Only by visiting the bank branch",
                    "Send SMS 'UIDAI STATE your_aadhaar_number' to 51969",
                    "Check your Aadhaar card",
                    "Call the bank customer service"
                ],
                correct: 1,
                explanation: "You can verify DBT status by sending SMS 'UIDAI STATE your_aadhaar_number' to 51969, or check online at resident.uidai.gov.in."
            },
            {
                question: "What documents are required for Aadhaar seeding at the bank?",
                options: [
                    "Only Aadhaar card",
                    "Only bank passbook",
                    "Aadhaar card, bank passbook, and mobile phone for OTP",
                    "Aadhaar card and PAN card"
                ],
                correct: 2,
                explanation: "For Aadhaar seeding, you need your original Aadhaar card, bank passbook, and mobile phone for OTP verification. Identity proof may be needed if names differ."
            },
            {
                question: "What is the emergency helpline number for urgent scholarship-related issues?",
                options: [
                    "1800-11-1234",
                    "1800-12-3456",
                    "1800-11-2345",
                    "1800-10-1234"
                ],
                correct: 0,
                explanation: "The emergency helpline number for urgent scholarship-related issues is 1800-11-1234, which is available 24/7."
            },
            {
                question: "Which of the following is NOT a benefit of the DBT system?",
                options: [
                    "Direct receipt of benefits without delays",
                    "No intermediary commissions or deductions", 
                    "Guaranteed approval of all applications",
                    "Real-time status tracking of payments"
                ],
                correct: 2,
                explanation: "DBT ensures direct transfers, eliminates intermediaries, and provides tracking, but it doesn't guarantee approval of all applications - eligibility criteria still apply."
            },
            {
                question: "What should you do if your scholarship payment is delayed?",
                options: [
                    "Wait indefinitely as delays are normal",
                    "Apply for the scholarship again",
                    "Check DBT status, verify account details, and contact support if needed",
                    "Change your bank account immediately"
                ],
                correct: 2,
                explanation: "For delayed payments, check your DBT status, verify account details match Aadhaar, contact your bank for account issues, and check application status on the scholarship portal."
            },
            {
                question: "What is the primary objective of Post-Matric Scholarships for SC students?",
                options: [
                    "To provide free food to students",
                    "To enable SC students to pursue higher education",
                    "To provide employment opportunities",
                    "To offer free transportation"
                ],
                correct: 1,
                explanation: "The primary objective of Post-Matric Scholarships for SC students is to enable them to pursue higher education from Class XI onwards, including professional courses."
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTotalQuestions();
        // Initialize tracking arrays
        this.userAnswers = new Array(this.questions.length).fill(undefined);
        this.questionScored = new Array(this.questions.length).fill(false);
    }
    
    setupEventListeners() {
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }
    }
    
    updateTotalQuestions() {
        const totalElements = document.querySelectorAll('#totalQuestions');
        totalElements.forEach(el => el.textContent = this.questions.length);
        
        const maxScoreElements = document.querySelectorAll('#maxScore');
        maxScoreElements.forEach(el => el.textContent = this.questions.length);
    }
    
    handleRegistration(e) {
        e.preventDefault();
        
        // Collect participant data
        this.participantData = {
            name: document.getElementById('participantName').value.trim(),
            phone: document.getElementById('phoneNumber').value.trim(),
            district: document.getElementById('district').value.trim(),
            state: document.getElementById('state').value
        };
        
        // Validate phone number
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(this.participantData.phone)) {
            alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
            return;
        }
        
        // Validate required fields
        if (!this.participantData.name || !this.participantData.phone || 
            !this.participantData.district || !this.participantData.state) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Check consent
        if (!document.getElementById('consentCheck').checked) {
            alert('Please provide consent for data collection');
            return;
        }
        
        // Send registration data to Google Analytics
        this.trackEvent('quiz_registration', {
            participant_name: this.participantData.name,
            participant_phone: this.participantData.phone,
            participant_district: this.participantData.district,
            participant_state: this.participantData.state,
            timestamp: new Date().toISOString()
        });
        
        // Start the quiz
        this.startQuiz();
    }
    
    startQuiz() {
        // Hide registration form and show quiz
        document.getElementById('registrationSection').classList.add('hidden');
        document.getElementById('quizSection').classList.remove('hidden');
        
        // Record start time
        this.startTime = new Date();
        
        // Initialize quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = new Array(this.questions.length).fill(undefined);
        this.questionScored = new Array(this.questions.length).fill(false);
        
        this.displayQuestion();
        this.updateProgress();
        
        // Track quiz start
        this.trackEvent('quiz_started', {
            participant_name: this.participantData.name,
            total_questions: this.questions.length,
            start_time: this.startTime.toISOString()
        });
    }
    
    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Update question text
        document.getElementById('questionText').textContent = question.question;
        
        // Create options
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.innerHTML = `
                <label>
                    <input type="radio" name="question" value="${index}">
                    ${option}
                </label>
            `;
            
            // Add click handler
            li.addEventListener('click', () => this.selectOption(index, li));
            
            optionsList.appendChild(li);
        });
        
        // Restore previous answer if it exists
        this.restorePreviousAnswer();
        
        // Update navigation
        this.updateNavigation();
        
        // Clear previous feedback or restore it if question was already answered
        this.updateFeedbackDisplay();
    }
    
    restorePreviousAnswer() {
        const previousAnswer = this.userAnswers[this.currentQuestionIndex];
        if (previousAnswer !== undefined) {
            const optionItems = document.querySelectorAll('.option-item');
            if (optionItems[previousAnswer]) {
                const element = optionItems[previousAnswer];
                element.classList.add('selected');
                element.querySelector('input[type="radio"]').checked = true;
            }
        }
    }
    
    updateFeedbackDisplay() {
        const feedback = document.getElementById('feedback');
        const previousAnswer = this.userAnswers[this.currentQuestionIndex];
        
        if (previousAnswer !== undefined) {
            // Question was already answered, show feedback
            this.showFeedback(previousAnswer, false); // false = don't count score again
        } else {
            // Question not answered yet, hide feedback
            feedback.classList.add('hidden');
        }
    }
    
    selectOption(optionIndex, element) {
        // Check if this question was already answered
        const wasAlreadyAnswered = this.userAnswers[this.currentQuestionIndex] !== undefined;
        
        // Remove previous selections
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Mark this option as selected
        element.classList.add('selected');
        element.querySelector('input[type="radio"]').checked = true;
        
        // Store the answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Show feedback and update score only if this is the first time answering this question
        this.showFeedback(optionIndex, !wasAlreadyAnswered);
        
        // Enable next button
        document.getElementById('nextBtn').disabled = false;
        
        // Track answer (only if it's a new answer or changed answer)
        if (!wasAlreadyAnswered || this.userAnswers[this.currentQuestionIndex] !== optionIndex) {
            this.trackEvent('question_answered', {
                question_number: this.currentQuestionIndex + 1,
                selected_option: optionIndex,
                correct_option: this.questions[this.currentQuestionIndex].correct,
                is_correct: optionIndex === this.questions[this.currentQuestionIndex].correct,
                participant_name: this.participantData.name,
                was_already_answered: wasAlreadyAnswered
            });
        }
    }
    
    showFeedback(selectedOption, countScore = true) {
        const question = this.questions[this.currentQuestionIndex];
        const feedback = document.getElementById('feedback');
        const isCorrect = selectedOption === question.correct;
        
        if (isCorrect) {
            feedback.textContent = '✅ Correct! ' + question.explanation;
            feedback.className = 'feedback correct';
            
            // Only increment score if we should count it and haven't scored this question before
            if (countScore && !this.questionScored[this.currentQuestionIndex]) {
                this.score++;
                this.questionScored[this.currentQuestionIndex] = true;
            }
        } else {
            feedback.textContent = '❌ Incorrect. ' + question.explanation;
            feedback.className = 'feedback incorrect';
            
            // Mark as scored even if incorrect to prevent future scoring
            if (countScore) {
                this.questionScored[this.currentQuestionIndex] = true;
            }
        }
        
        feedback.classList.remove('hidden');
        
        // Update visual feedback on options
        document.querySelectorAll('.option-item').forEach((item, index) => {
            // Remove previous styling
            item.classList.remove('correct', 'incorrect');
            
            if (index === question.correct) {
                item.classList.add('correct');
            } else if (index === selectedOption && index !== question.correct) {
                item.classList.add('incorrect');
            }
        });
        
        // Update score display
        document.getElementById('currentScore').textContent = this.score;
    }
    
    nextQuestion() {
        // Check if current question is answered
        if (this.userAnswers[this.currentQuestionIndex] === undefined) {
            alert('Please select an answer before proceeding.');
            return;
        }
        
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
            this.updateProgress();
        } else {
            this.finishQuiz();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        
        const currentQuestionElements = document.querySelectorAll('#currentQuestion');
        currentQuestionElements.forEach(el => el.textContent = this.currentQuestionIndex + 1);
        
        document.getElementById('questionInfo').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Next/Submit button
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
        
        // Enable/disable next button based on whether question is answered
        const isAnswered = this.userAnswers[this.currentQuestionIndex] !== undefined;
        nextBtn.disabled = !isAnswered;
        submitBtn.disabled = !isAnswered;
    }
    
    submitQuiz() {
        // Check if all questions are answered
        const unansweredQuestions = [];
        for (let i = 0; i < this.questions.length; i++) {
            if (this.userAnswers[i] === undefined) {
                unansweredQuestions.push(i + 1);
            }
        }
        
        if (unansweredQuestions.length > 0) {
            alert(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`);
            return;
        }
        
        this.finishQuiz();
    }
    
    finishQuiz() {
        const endTime = new Date();
        const timeSpent = Math.round((endTime - this.startTime) / 60000); // minutes
        
        // Recalculate final score to ensure accuracy
        this.recalculateFinalScore();
        
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const passed = percentage >= 50;
        
        // Hide quiz interface and show results
        document.getElementById('quizSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');
        
        // Update results display
        document.getElementById('finalScore').textContent = `${this.score}/${this.questions.length}`;
        document.getElementById('scorePercentage').textContent = `${percentage}%`;
        document.getElementById('correctAnswers').textContent = this.score;
        document.getElementById('incorrectAnswers').textContent = this.questions.length - this.score;
        document.getElementById('accuracyRate').textContent = `${percentage}%`;
        document.getElementById('timeSpent').textContent = `${timeSpent}m`;
        
        // Update result message
        const resultMessage = document.getElementById('resultMessage');
        if (passed) {
            resultMessage.textContent = "🎉 Congratulations! You passed!";
            resultMessage.style.color = 'var(--success-green)';
            document.getElementById('certificateSection').classList.remove('hidden');
        } else {
            resultMessage.textContent = "📚 Keep learning! You can retake the quiz.";
            resultMessage.style.color = 'var(--error-red)';
            document.getElementById('certificateSection').classList.add('hidden');
        }
        
        // Track quiz completion
        this.trackEvent('quiz_completed', {
            participant_name: this.participantData.name,
            participant_phone: this.participantData.phone,
            participant_district: this.participantData.district,
            participant_state: this.participantData.state,
            total_questions: this.questions.length,
            correct_answers: this.score,
            score_percentage: percentage,
            time_spent_minutes: timeSpent,
            passed: passed,
            completion_time: endTime.toISOString(),
            user_answers: this.userAnswers
        });
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
    
    recalculateFinalScore() {
        // Recalculate score from scratch to ensure accuracy
        let correctCount = 0;
        for (let i = 0; i < this.questions.length; i++) {
            if (this.userAnswers[i] === this.questions[i].correct) {
                correctCount++;
            }
        }
        this.score = correctCount;
        
        // Update current score display
        document.getElementById('currentScore').textContent = this.score;
    }
    
    generateCertificate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Border
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 760, 560);
        
        // Inner border
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, 720, 520);
        
        // Government emblem (simulated)
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(400, 120, 40, 0, 2 * Math.PI);
        ctx.fill();
        
        // Certificate title
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 36px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 400, 200);
        
        // Subtitle
        ctx.fillStyle = '#374151';
        ctx.font = '20px Inter, Arial, sans-serif';
        ctx.fillText('DBT Knowledge Challenge', 400, 230);
        
        // This certifies text
        ctx.font = '18px Inter, Arial, sans-serif';
        ctx.fillText('This is to certify that', 400, 280);
        
        // Participant name
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.fillText(this.participantData.name.toUpperCase(), 400, 320);
        
        // Achievement text
        ctx.fillStyle = '#374151';
        ctx.font = '18px Inter, Arial, sans-serif';
        ctx.fillText('has successfully completed the DBT & Aadhaar Seeding', 400, 360);
        ctx.fillText('Knowledge Challenge with a score of', 400, 385);
        
        // Score
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 24px Inter, Arial, sans-serif';
        const percentage = Math.round((this.score / this.questions.length) * 100);
        ctx.fillText(`${this.score}/${this.questions.length} (${percentage}%)`, 400, 420);
        
        // Date and location
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Inter, Arial, sans-serif';
        const now = new Date();
        ctx.fillText(`Date: ${now.toLocaleDateString('en-IN')}`, 300, 480);
        ctx.fillText(`District: ${this.participantData.district}`, 500, 480);
        ctx.fillText(`State: ${this.participantData.state}`, 400, 505);
        
        // Department signature
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 14px Inter, Arial, sans-serif';
        ctx.fillText('Department of Social Justice & Empowerment', 400, 540);
        ctx.fillText('Government of India', 400, 560);
        
        // Download the certificate
        const link = document.createElement('a');
        link.download = `DBT_Certificate_${this.participantData.name.replace(/\s+/g, '_')}_${now.getTime()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        // Track certificate generation
        this.trackEvent('certificate_generated', {
            participant_name: this.participantData.name,
            score: this.score,
            percentage: percentage,
            generation_time: now.toISOString()
        });
    }
    
    restartQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = new Array(this.questions.length).fill(undefined);
        this.questionScored = new Array(this.questions.length).fill(false);
        this.startTime = null;
        
        // Show registration form
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('registrationSection').classList.remove('hidden');
        
        // Clear form
        document.getElementById('registrationForm').reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Track restart
        this.trackEvent('quiz_restarted', {
            participant_name: this.participantData.name
        });
    }
    
    trackEvent(eventName, parameters) {
        // Send to Google Analytics if available
        if (typeof gtag === 'function') {
            gtag('event', eventName, parameters);
        }
        
        // Also log to console for debugging
        console.log('Quiz Event:', eventName, parameters);
    }
}

// Navigation functions for quiz
function nextQuestion() {
    if (window.quizApp) {
        window.quizApp.nextQuestion();
    }
}

function previousQuestion() {
    if (window.quizApp) {
        window.quizApp.previousQuestion();
    }
}

function submitQuiz() {
    if (window.quizApp) {
        window.quizApp.submitQuiz();
    }
}

function generateCertificate() {
    if (window.quizApp) {
        window.quizApp.generateCertificate();
    }
}

function restartQuiz() {
    if (window.quizApp) {
        window.quizApp.restartQuiz();
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the quiz application
    window.quizApp = new DBTQuiz();
    
    // Load font size preference
    if (typeof loadFontSize === 'function') {
        loadFontSize();
    }
});

// Handle page visibility change to track time accurately
document.addEventListener('visibilitychange', function() {
    if (window.quizApp && typeof window.quizApp.trackEvent === 'function') {
        if (document.hidden) {
            window.quizApp.trackEvent('quiz_page_hidden', {
                current_question: window.quizApp.currentQuestionIndex + 1
            });
        } else {
            window.quizApp.trackEvent('quiz_page_visible', {
                current_question: window.quizApp.currentQuestionIndex + 1
            });
        }
    }
});