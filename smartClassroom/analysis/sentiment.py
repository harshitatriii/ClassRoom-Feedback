from textblob import TextBlob


def analyze_sentiment(text):
    if not text or not text.strip():
        return {
            'polarity': 0.0,
            'subjectivity': 0.0,
            'sentiment_label': 'neutral',
            'keywords': [],
            'category_scores': {},
        }

    blob = TextBlob(text)

    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    if polarity > 0.1:
        label = 'positive'
    elif polarity < -0.1:
        label = 'negative'
    else:
        label = 'neutral'

    keywords = list(set(blob.noun_phrases))[:10]

    category_keywords = {
        'teaching': ['teacher', 'teaching', 'explain', 'explanation', 'lecture',
                     'instructor', 'professor', 'faculty', 'clear', 'clarity'],
        'content': ['content', 'material', 'syllabus', 'topic', 'subject',
                    'curriculum', 'notes', 'slides', 'textbook', 'resource'],
        'engagement': ['engage', 'interactive', 'participation', 'boring',
                       'interesting', 'activity', 'discussion', 'group',
                       'hands-on', 'practical'],
    }

    text_lower = text.lower()
    category_scores = {}
    for category, cat_keywords in category_keywords.items():
        matches = sum(1 for kw in cat_keywords if kw in text_lower)
        category_scores[category] = round(matches / len(cat_keywords), 2)

    return {
        'polarity': round(polarity, 4),
        'subjectivity': round(subjectivity, 4),
        'sentiment_label': label,
        'keywords': keywords,
        'category_scores': category_scores,
    }
