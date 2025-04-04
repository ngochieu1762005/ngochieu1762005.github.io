let questions = [];
let score = 0;
let timer;
let timeLeft = 3000; // 50 minutes in seconds (50 * 60)

document.addEventListener('DOMContentLoaded', () => {
  fetch('quiz.xml')
    .then(response => response.text())
    .then(data => {
      parseXML(data);
      startQuiz();
    });

  function parseXML(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "application/xml");
    const questionNodes = xmlDoc.getElementsByTagName('question');
    
    for (let i = 0; i < questionNodes.length; i++) {
      const questionNode = questionNodes[i];
      const questionText = questionNode.getElementsByTagName('questiontext')[0].textContent;
      const answersNode = questionNode.getElementsByTagName('answer');
      
      const answers = [];
      for (let j = 0; j < answersNode.length; j++) {
        answers.push({
          text: answersNode[j].textContent,
          correct: answersNode[j].getAttribute('fraction') === '100'
        });
      }

      questions.push({ questionText, answers });
    }
  }

  function startQuiz() {
    // Randomly select 20 questions
    const selectedQuestions = [];
    while (selectedQuestions.length < 20) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      if (!selectedQuestions.includes(randomIndex)) {
        selectedQuestions.push(randomIndex);
      }
    }

    // Render the questions
    const questionsContainer = document.getElementById('questions-container');
    selectedQuestions.forEach(index => {
      const question = questions[index];
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');

      const questionHTML = `
        <div class="question-text">${question.questionText}</div>
        <div class="answers">
          ${question.answers.map((answer, idx) => `
            <label>
              <input type="radio" name="question${index}" value="${idx}">
              ${answer.text}
            </label><br>
          `).join('')}
        </div>
      `;

      questionElement.innerHTML = questionHTML;
      questionsContainer.appendChild(questionElement);
    });

    // Start the timer
    startTimer();

    // Handle form submission
    document.getElementById('quiz-form').addEventListener('submit', (e) => {
      e.preventDefault();
      checkAnswers();
    });
  }

  function startTimer() {
    timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('time-left').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        checkAnswers();
      } else {
        timeLeft--;
      }
    }, 1000);
  }

  function checkAnswers() {
    const formData = new FormData(document.getElementById('quiz-form'));
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const selectedAnswer = formData.get(`question${index}`);
      if (selectedAnswer !== null) {
        const answerIndex = parseInt(selectedAnswer);
        if (question.answers[answerIndex].correct) {
          correctAnswers++;
        }
      }
    });

    displayResults(correctAnswers);
  }

  function displayResults(correctAnswers) {
    document.getElementById('quiz-form').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('score').textContent = `You answered ${correctAnswers} out of 20 questions correctly.`;
    
    // Show correct answers
    const correctAnswersList = questions.map((question, index) => {
      const selectedAnswer = document.querySelector(`input[name="question${index}"]:checked`);
      const answerIndex = selectedAnswer ? parseInt(selectedAnswer.value) : -1;
      const correctAnswer = question.answers.find(answer => answer.correct);
      return `
        <div>
          <strong>${question.questionText}</strong><br>
          Your answer: ${answerIndex !== -1 ? question.answers[answerIndex].text : 'None'}<br>
          Correct answer: ${correctAnswer.text}
        </div>
      `;
    }).join('');
    
    document.getElementById('correct-answers').innerHTML = correctAnswersList;
  }
});
