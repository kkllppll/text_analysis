async function fetchHistory() {
    const response = await fetch('/history');
    const history = await response.json();
    return history;
}

async function updateCharts(polarityChart, subjectivityChart) {
    const history = await fetchHistory();
    const labels = history.map((item, index) => `Запис ${index + 1}`);
    const polarities = history.map(item => item.polarity);
    const subjectivities = history.map(item => item.subjectivity);

    polarityChart.data.labels = labels;
    polarityChart.data.datasets[0].data = polarities;
    polarityChart.update();

    subjectivityChart.data.labels = labels;
    subjectivityChart.data.datasets[0].data = subjectivities;
    subjectivityChart.update();
}

function displayResults(results) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '';
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <p><span>Текст:</span> ${result.text}</p>
            <p><span>Полярність:</span> ${result.polarity.toFixed(2)}</p>
            <p><span>Суб'єктивність:</span> ${(result.subjectivity * 100).toFixed(2)}%</p>
            <p><span>Токсичність:</span> ${result.toxicity}</p>
            <p><span>Спам:</span> ${result.spam}</p>
        `;
        resultContainer.appendChild(resultItem);
    });
}

document.getElementById('sentiment-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const text = document.querySelector('textarea[name="text"]').value;
    const language = document.querySelector('select[name="language"]').value;
    const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texts: [text], language: language })
    });
    const result = await response.json();
    displayResults(result);

    // update the charts
    updateCharts(polarityChart, subjectivityChart);
});

document.getElementById('clear-history').addEventListener('click', async function() {
    const response = await fetch('/clear', {
        method: 'POST'
    });
    const result = await response.json();
    if (result.status === 'success') {
        updateCharts(polarityChart, subjectivityChart);
        document.getElementById('result').textContent = '';
    }
});

document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.querySelector('input[name="file"]');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    displayResults(result);

    // update the charts
    updateCharts(polarityChart, subjectivityChart);
});

const ctxPolarity = document.getElementById('polarityChart').getContext('2d');
const polarityChart = new Chart(ctxPolarity, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Полярність',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: []
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Аналізи'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Полярність'
                }
            }
        }
    }
});

const ctxSubjectivity = document.getElementById('subjectivityChart').getContext('2d');
const subjectivityChart = new Chart(ctxSubjectivity, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Суб\'єктивність',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                data: []
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Аналізи'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Суб\'єктивність'
                }
            }
        }
    }
});

updateCharts(polarityChart, subjectivityChart);
