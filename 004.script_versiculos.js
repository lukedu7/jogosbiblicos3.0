const levels = [
    '005.questoes_faceis.json',
    '006.questoes_medias.json',
    '007.questoes_dificeis.json'
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

function fetchQuestions() {
    console.log(`Carregando perguntas do nível ${currentLevel}`);
    return fetch(levels[currentLevel])
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            questions = data.sort(() => Math.random() - 0.5).slice(0, 10);
            console.log('Perguntas carregadas:', questions);
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
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `<p>${question.pergunta}</p>`;
        
        const ul = document.createElement('ul');
        ul.classList.add('alternatives');
        
        let allAlternatives = [...question.alternativas];
        
        if (!allAlternatives.some(alt => normalizeString(alt) === normalizeString(question.correta))) {
            allAlternatives.push(question.correta);
        }
        
        allAlternatives = shuffleArray(allAlternatives);
        
        allAlternatives.forEach((a, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<label><input type="radio" name="question" value="${index}"> ${a}</label>`;
            ul.appendChild(li);
        });
        
        questionDiv.appendChild(ul);
        questionContainer.appendChild(questionDiv);
        
        const submitButton = document.createElement('button');
        submitButton.innerText = 'Responder';
        submitButton.onclick = checkAnswer;
        questionContainer.appendChild(submitButton);
        
        updateInfo();
    } else {
        showResults();
    }
}

function checkAnswer() {
    const selected = document.querySelector('input[name="question"]:checked');
    const question = questions[currentQuestionIndex];

    if (selected) {
        const selectedAnswer = normalizeString(selected.parentElement.textContent);
        const correctAnswer = normalizeString(question.correta);

        console.log("Resposta selecionada (normalizada):", selectedAnswer);
        console.log("Resposta correta (normalizada):", correctAnswer);

        if (selectedAnswer === correctAnswer) {
            score++;
            selected.parentElement.parentElement.classList.add('correct');
            console.log("Resposta correta!");
        } else {
            selected.parentElement.parentElement.classList.add('incorrect');
            console.log("Resposta incorreta!");
            console.log(`Selecionado: ${selectedAnswer}, Correto: ${correctAnswer}`);
        }

        const referenceDiv = document.createElement('div');
        referenceDiv.innerText = `Referência: ${question.referencia}`;
        document.getElementById('questionContainer').appendChild(referenceDiv);
        
        currentQuestionIndex++;
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    }
}

function showResults() {
    const percentage = (score / questions.length) * 100;
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = `Você acertou ${percentage.toFixed(2)}% das perguntas.`;

    const nextButton = document.getElementById('nextButton');
    const retryButton = document.getElementById('retryButton');
    const menuButton = document.createElement('button');
    menuButton.innerText = 'Voltar ao Menu';
    menuButton.onclick = () => window.location.href = 'index.html';
    document.getElementById('questionContainer').appendChild(menuButton);

    if (percentage >= 70) {
        if (currentLevel < levels.length - 1) {
            nextButton.style.display = 'block';
            nextButton.onclick = nextLevel;
            resultDiv.innerText += ' Aprovado! Você pode avançar para o próximo nível.';
        } else {
            resultDiv.innerText += ' Aprovado! Você completou todos os níveis.';
        }
    } else {
        retryButton.style.display = 'block';
        retryButton.onclick = retryLevel;
        resultDiv.innerText += ' Falhou! Tente novamente ou volte ao menu.';
    }
}

function nextLevel() {
    console.log(`Avançando para o nível ${currentLevel + 2}`);
    currentLevel++;
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result').innerText = '';
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('retryButton').style.display = 'none';
    fetchQuestions();
}

function retryLevel() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result').innerText = '';
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('retryButton').style.display = 'none';
    fetchQuestions();
}

function restartQuiz() {
    currentLevel = 0;
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result').innerText = '';
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('retryButton').style.display = 'none';
    fetchQuestions();
}

function changeBackgroundColor() {
    const body = document.body;
    switch (currentLevel) {
        case 0:
            body.style.backgroundColor = 'lightgreen';
            break;
        case 1:
            body.style.backgroundColor = 'lightyellow';
            break;
        case 2:
            body.style.backgroundColor = 'lightcoral';
            break;
    }
}

// Inicia o quiz carregando as perguntas do primeiro nível
fetchQuestions();