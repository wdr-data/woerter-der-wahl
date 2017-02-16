#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json

gruene = open('data/gruene.txt')
gruene = gruene.read()


def splitting_into_words(text):
    return re.split('\s+', text)

gruene_words = splitting_into_words(gruene)

print("words: ", gruene_words[:10])


def test_capital_words(item):
    return re.match('^[A-Z]', item)


def filter_capital_words(words):
    return list(filter(test_capital_words, words))

gruene_capital_words = filter_capital_words(gruene_words)

print("capital: ", gruene_capital_words[:10])


def make_clean_word(word):
    return re.sub("[^a-züäöß]", '', word, flags=re.IGNORECASE)


def clean_words(words):
    return list(map(make_clean_word, words))

gruene_capital_words_clean = clean_words(gruene_capital_words)

print('clean: ', gruene_capital_words_clean[:10])


def delete_stop_words(words): 
    stopwords = ('Die', 'Der', 'Mit', 'Diese', 'Deshalb', 'Mit', 'Für', 
                 'Eine', 'Unsere', 'Ein', 'Das', 'Sie', 'In', 'Dazu', 
                 'Mio', 'Gut', 'Kein', 'Nur', 'FÜR', 'Dafür', 'Denn', 'Darum',
                'Es', 'Im', 'DIE', 'Auch', 'Den', 'Daher', 'Damit', 'Um', 'Dies', 
                'Ihnen', 'Als', 'UND', 'Und', 'Wir')
    return [w for w in words if w not in stopwords]
    
gruene_final = delete_stop_words(gruene_capital_words)

print('final: ', gruene_final[:10])


def counting_words(words):
    counted_words = {}
    for word in words:
        if word in counted_words.keys():
            counted_words[word] += 1
        else:
            counted_words[word] = 1
    return counted_words

counted_gruene = counting_words(gruene_final)

print('counted: ', list(counted_gruene.values())[:10])


def sort_counted_words(words):
    words_list_dict = [{'word':key, 'count':words[key]} for key in words.keys()]
    return sorted(words_list_dict, key=lambda x: x['count'], reverse=True)

sorted_gruene = sort_counted_words(counted_gruene)

print('sorted: ', sorted_gruene[:10])

output = json.dumps({ 'data': sorted_gruene }, ensure_ascii=False)

out_file = open('output/gruene.json', 'w')
out_file.write(output)
out_file.close()