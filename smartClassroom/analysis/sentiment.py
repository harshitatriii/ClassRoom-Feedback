import re
from textblob import TextBlob


# ---------------------------------------------------------------------------
# Aspect keyword dictionaries for Aspect-Based Sentiment Analysis (ABSA)
# ---------------------------------------------------------------------------
ASPECT_KEYWORDS = {
    'teaching_quality': {
        'keywords': [
            'teacher', 'teaching', 'explain', 'explanation', 'lecture', 'instructor',
            'professor', 'faculty', 'clarity', 'clear', 'understood', 'understandable',
            'method', 'approach', 'pedagogy', 'mentor', 'guidance', 'knowledgeable',
            'prepared', 'unprepared', 'communication', 'delivery', 'pace', 'pacing',
        ],
        'label': 'Teaching Quality',
    },
    'content_quality': {
        'keywords': [
            'content', 'material', 'syllabus', 'topic', 'subject', 'curriculum',
            'notes', 'slides', 'textbook', 'resource', 'relevant', 'outdated',
            'updated', 'depth', 'comprehensive', 'shallow', 'thorough', 'useful',
            'practical', 'theoretical', 'examples', 'case study',
        ],
        'label': 'Content Quality',
    },
    'engagement': {
        'keywords': [
            'engage', 'engaging', 'interactive', 'participation', 'boring', 'bored',
            'interesting', 'activity', 'discussion', 'group', 'hands-on', 'fun',
            'monotonous', 'dull', 'exciting', 'lively', 'motivating', 'inspiring',
            'involvement', 'collaborative',
        ],
        'label': 'Engagement',
    },
    'assessment': {
        'keywords': [
            'exam', 'test', 'quiz', 'assignment', 'grading', 'marks', 'grade',
            'evaluation', 'fair', 'unfair', 'tough', 'easy', 'difficult', 'hard',
            'assessment', 'scoring', 'rubric', 'feedback', 'result', 'performance',
            'lenient', 'strict', 'partial', 'marking',
        ],
        'label': 'Assessment & Fairness',
    },
}

# ---------------------------------------------------------------------------
# Emotion lexicon for emotion detection
# ---------------------------------------------------------------------------
EMOTION_LEXICON = {
    'appreciation': [
        'thank', 'thanks', 'grateful', 'appreciate', 'excellent', 'wonderful',
        'amazing', 'fantastic', 'great', 'awesome', 'outstanding', 'brilliant',
        'superb', 'love', 'loved', 'best', 'perfect', 'remarkable', 'incredible',
        'impressive', 'helpful', 'supportive', 'dedicated', 'commendable',
    ],
    'frustration': [
        'frustrat', 'annoyed', 'annoying', 'irritat', 'fed up', 'waste',
        'useless', 'pointless', 'terrible', 'worst', 'horrible', 'pathetic',
        'disappointed', 'disappoint', 'unacceptable', 'ridiculous', 'absurd',
        'unfair', 'careless', 'incompetent', 'hopeless', 'miserable',
    ],
    'confusion': [
        'confus', 'unclear', 'lost', 'don\'t understand', 'not clear',
        'ambiguous', 'vague', 'complicated', 'complex', 'hard to follow',
        'didn\'t get', 'no idea', 'mixed up', 'bewildered', 'puzzled',
        'overwhelm', 'disorganized', 'chaotic', 'inconsistent',
    ],
    'boredom': [
        'boring', 'bored', 'dull', 'monoton', 'repetitive', 'tedious',
        'uninteresting', 'dry', 'lifeless', 'sleep', 'sleepy', 'drowsy',
        'yawn', 'drag', 'slow', 'uninspiring', 'stale', 'flat',
    ],
    'enthusiasm': [
        'enjoy', 'enjoyed', 'exciting', 'excited', 'fascina', 'inspir',
        'motivat', 'passionate', 'eager', 'curious', 'interest', 'engaged',
        'energetic', 'dynamic', 'stimulat', 'captivat', 'thrilling',
        'look forward', 'keen', 'recommend',
    ],
    'satisfaction': [
        'satisfied', 'satisf', 'happy', 'pleased', 'content', 'comfortable',
        'adequate', 'decent', 'good', 'fine', 'okay', 'well', 'smooth',
        'efficient', 'effective', 'productive', 'beneficial', 'valuable',
        'worthwhile', 'meet expectations',
    ],
}


def analyze_sentiment(text):
    """Original overall sentiment analysis using TextBlob."""
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


def analyze_aspects(text):
    """
    Aspect-Based Sentiment Analysis (ABSA).
    Splits text into sentences, classifies each into aspects,
    and computes per-aspect sentiment.
    """
    if not text or not text.strip():
        return {}

    text_lower = text.lower()
    # Split into sentences
    blob = TextBlob(text)
    sentences = [str(s) for s in blob.sentences]
    if not sentences:
        sentences = [text]

    aspect_results = {}

    for aspect_key, aspect_info in ASPECT_KEYWORDS.items():
        matching_sentences = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(kw in sentence_lower for kw in aspect_info['keywords']):
                matching_sentences.append(sentence)

        if not matching_sentences:
            # Also check if full text mentions this aspect at all
            if not any(kw in text_lower for kw in aspect_info['keywords']):
                continue
            # Use overall text if aspect keywords found but no sentence match
            matching_sentences = [text]

        # Compute sentiment on the relevant sentences
        combined_text = ' '.join(matching_sentences)
        aspect_blob = TextBlob(combined_text)
        polarity = aspect_blob.sentiment.polarity

        if polarity > 0.1:
            label = 'positive'
        elif polarity < -0.1:
            label = 'negative'
        else:
            label = 'neutral'

        # Extract short phrases for display (first 2 matching sentences, truncated)
        sample_phrases = [s.strip()[:80] for s in matching_sentences[:2]]

        aspect_results[aspect_key] = {
            'label': aspect_info['label'],
            'polarity': round(polarity, 4),
            'sentiment': label,
            'phrase_count': len(matching_sentences),
            'sample_phrases': sample_phrases,
        }

    return aspect_results


def detect_emotions(text):
    """
    Emotion detection using keyword lexicon matching.
    Returns normalized scores for each emotion (0.0 to 1.0).
    """
    if not text or not text.strip():
        return {}

    text_lower = text.lower()
    emotion_scores = {}
    max_score = 0

    for emotion, keywords in EMOTION_LEXICON.items():
        # Count keyword matches (partial matching for stems like 'frustrat' -> 'frustrated')
        matches = sum(1 for kw in keywords if kw in text_lower)
        score = matches
        emotion_scores[emotion] = score
        if score > max_score:
            max_score = score

    if max_score == 0:
        # No emotions detected — return neutral distribution
        return {emotion: 0.0 for emotion in EMOTION_LEXICON}

    # Normalize scores to 0.0-1.0 range
    for emotion in emotion_scores:
        emotion_scores[emotion] = round(emotion_scores[emotion] / max_score, 4)

    return emotion_scores


def get_dominant_emotion(emotions):
    """Return the dominant emotion from emotion scores dict."""
    if not emotions:
        return 'neutral'
    dominant = max(emotions, key=emotions.get)
    if emotions[dominant] == 0:
        return 'neutral'
    return dominant


def full_analysis(text):
    """
    Run all analysis pipelines: overall sentiment, ABSA, and emotion detection.
    Returns a combined result dict.
    """
    base = analyze_sentiment(text)
    base['aspect_sentiments'] = analyze_aspects(text)
    base['emotions'] = detect_emotions(text)
    base['dominant_emotion'] = get_dominant_emotion(base['emotions'])
    return base
