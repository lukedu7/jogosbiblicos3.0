const levels = [
    '010.curiosidades_faceis.json',
    '011.curiosidades_medias.json',
    '012.curiosidades_dificeis.json'
];

let currentLevel = 0;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function normalizeString(str) {
    return str.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateInfo() {
    document.getElementById('levelInfo').textContent = `Nível ${currentLevel + 1}`;
    document.getElementById('progressInfo').textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
}

function changeBackgroundColor() {
    const colors = ['#FFA07A', '#98FB98', '#87CEFA'];
    document.body.style.backgroundColor = colors[currentLevel];
}

function fetchQuestions() {
    return fetch(levels[currentLevel])
        .then(response => response.json())
        .then(data => {
            questions = shuffleArray(data).slice(0, 10);
            loadQuestion();
            changeBackgroundColor();
            updateInfo();
        })
        .catch(error => {
            console.error('Erro ao carregar perguntas:', error);
        });
}

function loadQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = '';

    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        const alternatives = shuffleArray([...new Set([...question.alternativas, question.correta])]);
        
        questionContainer.innerHTML = `
            <h2>${question.pergunta}</h2>
            <ul class="alternatives">
                ${alternatives.map((alt, index) => `
                    <li>
                        <label>
                            <input type="radio" name="question" value="${index}">
                            ${alt}
                        </label>
                    </li>
                `).join('')}
            </ul>
            <button onclick="checkAnswer()">Responder</button>
        `;
        
        updateInfo();
    } else {
        showResults();
    }
}

function checkAnswer() {
    const selected = document.querySelector('input[name="question"]:checked');
    if (!selected) {
        alert('Por favor, selecione uma alternativa.');
        return;
    }

    const question = questions[currentQuestionIndex];
    const selectedAnswer = normalizeString(selected.parentElement.textContent);
    const correctAnswer = normalizeString(question.correta);

    if (selectedAnswer === correctAnswer) {
        score++;
        selected.closest('li').classList.add('correct');
    } else {
        selected.closest('li').classList.add('incorrect');
        document.querySelectorAll('.alternatives li').forEach(li => {
            if (normalizeString(li.textContent) === correctAnswer) {
                li.classList.add('correct');
            }
        });
    }

    const referenceDiv = document.createElement('div');
    referenceDiv.innerText = `Referência: ${question.referencia}`;
    questionContainer.appendChild(referenceDiv);

    document.querySelectorAll('.alternatives input').forEach(input => {
        input.disabled = true;
    });
    
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 2000);
}

function showResults() {
    const percentage = (score / questions.length) * 100;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2>Resultado Final</h2>
        <p>Você acertou ${score} de ${questions.length} questões (${percentage.toFixed(2)}%)</p>
    `;

    if (percentage >= 70) {
        if (currentLevel < levels.length - 1) {
            resultDiv.innerHTML += `
                <p>Parabéns! Você pode avançar para o próximo nível.</p>
                <button onclick="nextLevel()">Próximo Nível</button>
            `;
        } else {
            resultDiv.innerHTML += `<p>Parabéns! Você completou todos os níveis.</p>`;
        }
    } else {
        resultDiv.innerHTML += `
            <p>Tente novamente para melhorar sua pontuação.</p>
            <button onclick="retryLevel()">Tentar Novamente</button>
        `;
    }

    resultDiv.innerHTML += `<button onclick="goToMenu()">Voltar ao Menu</button>`;
}

function nextLevel() {
    currentLevel++;
    resetQuiz();
}

function retryLevel() {
    resetQuiz();
}

function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result').innerHTML = '';
    fetchQuestions();
}

function goToMenu() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', fetchQuestions);