#! /usr/bin/env python3

import re
import sys
import json
from pprint import pprint
import snowballstemmer

def add_share(entries, wordsum):
    for word in entries.keys():
        entries[word]['share'] = round(entries[word]['count'] / wordsum, 5)

stopwords = []
with open('stopwords.txt') as f:
    stopwords = [x.replace('\n','') for x in f]

def analyze(paragraphs):

    def test_stopwords(word):
        return word.lower() in stopwords

    counted_words = {}
    word_count = 0

    for index, paragraph in enumerate(paragraphs):
        current_paragraph = paragraph
        counter = 0
        end = 0
        while len(current_paragraph) > 0 and counter < 1000:
            current_paragraph = current_paragraph[end:]
            pos = re.search(r'[\s\.\,\?\!\"\'\“):]*(\s|$)', current_paragraph)
            if pos is None:
                end = len(current_paragraph)
                word = current_paragraph
            else:
                word = current_paragraph[:pos.start()]
                end = pos.end()
            if not re.match('^[A-Za-z]', word):
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
            stemmed = stemmer.stemWord(word).lower()
            if stemmed in stemmed_words:
                if words[word]['count'] > stemmed_words[stemmed]['single_count']:
                    stemmed_words[stemmed]['word'] = word
                    stemmed_words[stemmed]['single_count'] = words[word]['count']
                stemmed_words[stemmed]['count'] += words[word]['count']
                stemmed_words[stemmed]['occurence'] += words[word]['occurence']
            else:
                stemmed_words[stemmed] = {'word': word, 'stem': stemmed, 'single_count': words[word]['count'], 'count': words[word]['count'], 'occurence': words[word]['occurence']}
        return stemmed_words

    stemmed = group_by_stem(counted_words)

    add_share(stemmed, word_count)

    def sort_counted_words(words):
        words_list_dict = [words[key] for key in words.keys()]
        return sorted(words_list_dict, key=lambda x: x['count'], reverse=True)

    words_sorted = sort_counted_words(stemmed)
    return words_sorted

def save_text(lines, party):
    text_output = '\n'.join(lines)
    out_file = open('output/'+ str(party) +'.txt', 'w')
    out_file.write(text_output)
    out_file.close()

def save_json(obj, party):
    output = json.dumps({'data': obj }, ensure_ascii=False)

    out_file = open('output/'+ str(party) +'.json', 'w')
    out_file.write(output)
    out_file.close()

results_sum = {}
topresult_words = []
wordcount_sum = 0

def append_result(result, party):
    global wordcount_sum

    for key, entry in enumerate(result):
        stem = entry['stem']
        if stem not in results_sum:
            results_sum[stem] = {
                'word': entry['word'],
                'stem': stem,
                'count': 0,
                'single_count': 0,
                'segments': {}
            }

        wordcount_sum += entry['count']
        results_sum[stem]['count'] += entry['count']
        results_sum[stem]['segments'][party] = entry
        if entry['count'] > results_sum[stem]['single_count']:
            results_sum[stem]['word'] = entry['word']
            results_sum[stem]['single_count'] = entry['count']

        if key < 30 and stem not in topresult_words:
            topresult_words.append(stem)

def get_result_sum():
    add_share(results_sum, wordcount_sum)
    # turn results_sum dict into list
    return sorted(results_sum.values(), key=lambda x: x['count'], reverse=True)

def get_result_top():
    words = [results_sum[stem] for stem in topresult_words]
    return sorted(words, key=lambda x: x['count'], reverse=True)

def save_result(paragraphs, path):
    result = analyze(paragraphs)
    append_result(result, path)
    save_json(result,path)
    save_text(paragraphs,path)


def load_and_clean(file, path, minlen, ignore_empty_lines=False, afd_headings=False):
    paragraphs = []
    container = ''
    for line in file:
        line = line.replace('\n', '')
        if len(line) == 0:
            if not container.endswith('- ') and len(container) > 0 and not ignore_empty_lines:
                paragraphs.append(container[:-1])
                container = ''
            continue
        if container == '' and len(line) < minlen:
            paragraphs.append(line)
            continue
        if container.endswith('- '):
            if re.search(r'^[a-zäüö]', line):
                container = container[:-1]
            container = container[:-1]
        if re.search(r'^\d{1,2}\.\d{2}', line) and len(container) > 0 and afd_headings:
            paragraphs.append(container[:-1])
            container = ''
        container += line + ' '
        if re.search(r'[\.\?\!\"\'\“):]$', line):
            paragraphs.append(container[:-1])
            container = ''

    return paragraphs


if __name__=="__main__":
    files_from_doc = ['gruene', 'spd', 'fdp', 'piraten', 'linke']

    print('cdu')
    with open('data/cdu.txt') as f:
        f = [item.replace('', '').strip() for item in f]
        paragraphs = load_and_clean(f, 'cdu', 40, True)
        save_result(paragraphs, 'cdu')

    print('afd')
    with open('data/afd.txt') as f:
        paragraphs = load_and_clean(f, 'afd', 0, True, True)
        save_result(paragraphs, 'afd')

    for path in files_from_doc:
        paragraphs = []
        print(path)
        with open('data/'+path+'.txt') as f:
            for line in f:
                line = line.replace('\n', '')
                if len(line) == 0:
                    continue
                paragraphs.append(line)

        save_result(paragraphs, path)

    results = get_result_sum()
    save_json(results, 'all')

    topresults = get_result_top()
    save_json(topresults, 'top30')

    print("✅ Done")
