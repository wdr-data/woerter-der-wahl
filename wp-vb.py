import re
import pandas as pd
import sys
import json
from pprint import pprint
import snowballstemmer


paragraphs = []

with open('data/gruene.txt') as f:
    container = ''
    for line in f:
        line = line.replace('\n', '')
        if len(line) == 0:
            continue
        if container == '' and len(line) <70:
            paragraphs.append(line)
            continue
        container += line + ' '
        if re.search(r'[\s\.\,\?\!\"\'\“):]$', line):
            paragraphs.append(container[:-1])
            container = ''

def test_stopwords(word):
    stopwords = ('Die', 'Der', 'Mit', 'Diese', 'Deshalb', 'Mit', 'Für',
                 'Eine', 'Unsere', 'Ein', 'Das', 'Sie', 'In', 'Dazu',
                 'Mio', 'Gut', 'Kein', 'Nur', 'FÜR', 'Dafür', 'Denn', 'Darum',
                'Es', 'Im', 'DIE', 'Auch', 'Den', 'Daher', 'Damit', 'Um', 'Dies',
                'Ihnen', 'Als', 'UND', 'Und', 'Wir', 'Durch', 'So', 'Dem', 'Zudem', 'Viel', 'Dabei',
                'Darüber', 'Unser', 'Neben', 'Außerdem', 'Auf', 'Bei', 'Viele', 'Gleichzeitig',
                'Hier', 'Gerade', 'Hierzu', 'Zur', 'Aus', 'Nr', 'Seit', 'Nicht', 'An', 'Doch',
                'Wenn', 'Nach', 'Dadurch', 'Alle', 'Hierfür', 'Vor', 'Ebenso', 'Deswegen', 'Ohne',
                'Wie', 'Zusätzlich','Bis','Uns','Zum','Immer','Außer', 'Einen', 'Einige', 'Bisher',
                'Daran', 'Nachdem', 'Beim', 'Oft', 'Hinzu', 'Darin', 'Des', 'Weiteren', 'Bereits',
                'Dennoch', 'Noch', 'Keine', 'Vom', 'Jetzt', 'Diejenigen', 'Gegen', 'Unter', 'Einzelnen',
                'Jeder', 'Zweiten', 'Leider', 'Kurz', 'Vielerorts', 'Unterschiedliche', 'Eines', 'Bislang',
                'Somit', 'Sowohl', 'Zuvor', 'Während', 'Jedem', 'Gleiches', 'Drei', 'Einer', 'Solche',
                'Dritten', 'Klein', 'Stattdessen', 'Gute', 'Ver', 'Innen', 'Erstes', 'Ihrem', 'Groß',
                'NRW', 'Nordrhein-Westfalen')
    return word in stopwords

counted_words = {}
word_count = 0

for index, paragraph in enumerate(paragraphs):
    current_paragraph = paragraph
    counter = 0
    end = 0
    while len(current_paragraph) > 0 and counter < 1000:
        current_paragraph = current_paragraph[end:]
        pos = re.search(r'[\s\.\,\?\!\"\'\“):]+', current_paragraph)
        if pos is None:
            end = len(current_paragraph)
            word = current_paragraph
        else:
            word = current_paragraph[:pos.start()]
            end = pos.end()
        if not re.match('^[A-Z]', word):
            counter += end
            continue
        if test_stopwords(word):
            counter += end
            continue
        word_count += 1
        if word in counted_words.keys():
            counted_words[word]['count'] += 1
        else:
            counted_words[word] = {'count': 1}
        if 'occurence' not in counted_words[word].keys():
            counted_words[word]['occurence'] = []
        counted_words[word]['occurence'].append({'paragraph_index': index, 'position': counter})
        counter += end

stemmer = snowballstemmer.stemmer('german')

def group_by_stem(words):
    stemmed_words = {}
    for word in words.keys():
        stemmed = stemmer.stemWord(word)
        if stemmed in stemmed_words:
            if words[word]['count'] > stemmed_words[stemmed]['single_count']:
                stemmed_words[stemmed]['word'] = word
                stemmed_words[stemmed]['single_count'] = words[word]['count']
            stemmed_words[stemmed]['count'] += words[word]['count']
            stemmed_words[stemmed]['occurence'] += words[word]['occurence']
        else:
            stemmed_words[stemmed] = {'word': word, 'single_count': words[word]['count'], 'count': words[word]['count'], 'occurence': words[word]['occurence']}
    return stemmed_words

stemmed = group_by_stem(counted_words)

def sort_counted_words(words):
    words_list_dict = [words[key] for key in words.keys()]
    return sorted(words_list_dict, key=lambda x: x['count'], reverse=True)

words_sorted = sort_counted_words(stemmed)

pprint(words_sorted[:30])
