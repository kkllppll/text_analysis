from flask import Flask, request, jsonify, render_template, send_file
from sentiment_analysis import analyze_sentiment, detect_toxicity, detect_spam
import csv
import io

app = Flask(__name__)
history = []

@app.route('/analyze', methods=['POST'])
def analyze():
    if request.content_type != 'application/json':
        return jsonify({'error': 'Unsupported Media Type, Content-Type must be application/json'}), 415

    data = request.json
    texts = data.get('texts', [])
    language = data.get('language', 'en')
    if not texts:
        return jsonify({'error': 'Не надано тексти'}), 400

    results = []
    for text in texts:
        sentiment = analyze_sentiment(text, language)
        toxicity = detect_toxicity(text, language)
        spam = detect_spam(text, language)
        history.append({
            'text': text,
            'polarity': sentiment['polarity'],
            'subjectivity': sentiment['subjectivity'],
            'toxicity': toxicity,
            'spam': spam
        })
        results.append({
            'text': text,
            'polarity': sentiment['polarity'],
            'subjectivity': sentiment['subjectivity'],
            'toxicity': toxicity,
            'spam': spam
        })

    return jsonify(results)

@app.route('/history')
def get_history():
    return jsonify(history)

@app.route('/export')
def export_history():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Text', 'Polarity', 'Subjectivity', 'Toxicity', 'Spam'])
    for item in history:
        writer.writerow([item['text'], item['polarity'], item['subjectivity'], item['toxicity'], item['spam']])
    output.seek(0)
    return send_file(io.BytesIO(output.getvalue().encode()), mimetype='text/csv', as_attachment=True, download_name='history.csv')

@app.route('/clear', methods=['POST'])
def clear_history():
    global history
    history = []
    return jsonify({'status': 'success'})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = file.filename.lower()
    if filename.endswith('.txt'):
        content = file.read().decode('utf-8')
        texts = content.splitlines()
    else:
        return jsonify({'error': 'Unsupported file format'}), 400

    results = []
    for text in texts:
        sentiment = analyze_sentiment(text)
        toxicity = detect_toxicity(text)
        spam = detect_spam(text)
        history.append({'text': text, 'polarity': sentiment['polarity'], 'subjectivity': sentiment['subjectivity'], 'toxicity': toxicity, 'spam': spam})
        results.append({'text': text, 'polarity': sentiment['polarity'], 'subjectivity': sentiment['subjectivity'], 'toxicity': toxicity, 'spam': spam})

    return jsonify(results)



if __name__ == '__main__':
    app.run(debug=True)
