#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import re
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
        if line.endswith('.'):
            paragraphs.append(container[:-1])
            container = ''

def splitting_into_words(text):
    return re.split('[\s\.\,\?\!\"\']+', text)

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
                'Dritten', 'Klein', 'Stattdessen', 'Gute', 'Ver', 'Innen', 'Erstes', 'Ihrem', 'Groß')
    return word in stopwords

counted_words = {}
word_count = 0
stemmer = snowballstemmer.stemmer('german')

for index, paragraph in enumerate(paragraphs):
    current_paragraph = paragraph
    counter = 0
    end = 0
    while len(current_paragraph) > 0 and counter < 1000:
        current_paragraph = current_paragraph[end:]
        pos = re.search(r'[\s\.\,\?\!\:\"\']+', current_paragraph)
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
        stemmed = stemmer.stemWord(word)
        if word in counted_words.keys():
            counted_words[word]['count'] += 1
        else:
            counted_words[word] = {'count': 1, 'stem': stemmed, 'stem_count': 1}
        if stemmed in counted_words[word]['stem']:
            counted_words[word]['stem_count'] += 1
        if 'occurence' not in counted_words[word].keys():
            counted_words[word]['occurence'] = []
        counted_words[word]['occurence'].append({'paragraph_index': index, 'position': counter})
        counter += end

pprint(counted_words)
