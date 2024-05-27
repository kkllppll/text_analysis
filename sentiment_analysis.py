from textblob import TextBlob
from googletrans import Translator

def analyze_sentiment(text, language='en'):
    if language != 'en':
        text = translate_text(text, language, 'en')
    blob = TextBlob(text)
    sentiment = blob.sentiment
    return {'polarity': sentiment.polarity, 'subjectivity': sentiment.subjectivity}

def translate_text(text, from_lang, to_lang):
    translator = Translator()
    translated = translator.translate(text, src=from_lang, dest=to_lang)
    return translated.text

def detect_toxicity(text, language='en'):
    if language != 'en':
        text = translate_text(text, language, 'en')
    toxic_keywords = ['badword1', 'badword2']  
    for word in toxic_keywords:
        if word in text.lower():
            return True
    return False

def detect_spam(text, language='en'):
    if language != 'en':
        text = translate_text(text, language, 'en')
    spam_keywords = ['buy now', 'click here', 'subscribe']  
    for phrase in spam_keywords:
        if phrase in text.lower():
            return True
    return False
