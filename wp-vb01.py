#! /usr/bin/env python3

import re
import sys
import json
from pprint import pprint
import snowballstemmer

def add_share(entries, wordsum):
    for word in entries.keys():
        entries[word]['share'] = round(entries[word]['count'] / wordsum, 5)

def analyze(paragraphs):

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
                    'Dritten', 'Klein', 'Stattdessen', 'Gute', 'Ver', 'Innen', 'Erstes', 'Ihrem', 'Groß', '', '–', 'dass',
                    'ab','aber','alle','allein','allem','allen','aller','allerdings','allerlei','alles','allmählich','allzu','als','alsbald','also','am','an','and','ander','andere','anderem','anderen','anderer','andererseits','anderes','anderm','andern','andernfalls','anders','anstatt','auch','auf','aus','ausgenommen','ausser','ausserdem','außer','außerdem','außerhalb','bald','bei','beide','beiden','beiderlei','beides','beim','beinahe','bereits','besonders','besser','beträchtlich','bevor','bezüglich','bin','bis','bisher','bislang','bist','bloß','bsp.','bzw','ca','ca.','content','da','dabei','dadurch','dafür','dagegen','daher','dahin','damals','damit','danach','daneben','dann','daran','darauf','daraus','darin','darum','darunter','darüber','darüberhinaus','das','dass','dasselbe','davon','davor','dazu','daß','dein','deine','deinem','deinen','deiner','deines','dem','demnach','demselben','den','denen','denn','dennoch','denselben','der','derart','derartig','derem','deren','derer','derjenige','derjenigen','derselbe','derselben','derzeit','des','deshalb','desselben','dessen','desto','deswegen','dich','die','diejenige','dies','diese','dieselbe','dieselben','diesem','diesen','dieser','dieses','diesseits','dir','direkt','direkte','direkten','direkter','doch','dort','dorther','dorthin','drauf','drin','drunter','drüber','du','dunklen','durch','durchaus','eben','ebenfalls','ebenso','eher','eigenen','eigenes','eigentlich','ein','eine','einem','einen','einer','einerseits','eines','einfach','einführen','einführte','einführten','eingesetzt','einig','einige','einigem','einigen','einiger','einigermaßen','einiges','einmal','eins','einseitig','einseitige','einseitigen','einseitiger','einst','einstmals','einzig','entsprechend','entweder','er','erst','es','etc','etliche','etwa','etwas','euch','euer','eure','eurem','euren','eurer','eures','falls','fast','ferner','folgende','folgenden','folgender','folgendes','folglich','fuer','für','gab','ganze','ganzem','ganzen','ganzer','ganzes','gar','gegen','gemäss','ggf','gleich','gleichwohl','gleichzeitig','glücklicherweise','gänzlich','hab','habe','haben','haette','hast','hat','hatte','hatten','hattest','hattet','heraus','herein','hier','hier	hinter','hiermit','hiesige','hin','hinein','hinten','hinter','hinterher','http','hätt','hätte','hätten','höchstens','ich','igitt','ihm','ihn','ihnen','ihr','ihre','ihrem','ihren','ihrer','ihres','im','immer','immerhin','in','indem','indessen','infolge','innen','innerhalb','ins','insofern','inzwischen','irgend','irgendeine','irgendwas','irgendwen','irgendwer','irgendwie','irgendwo','ist','ja','je','jed','jede','jedem','jeden','jedenfalls','jeder','jederlei','jedes','jedoch','jemand','jene','jenem','jenen','jener','jenes','jenseits','jetzt','jährig','jährige','jährigen','jähriges','kam','kann','kannst','kaum','kein','keine','keinem','keinen','keiner','keinerlei','keines','keineswegs','klar','klare','klaren','klares','klein','kleinen','kleiner','kleines','koennen','koennt','koennte','koennten','komme','kommen','kommt','konkret','konkrete','konkreten','konkreter','konkretes','können','könnt','künftig','leider','machen','man','manche','manchem','manchen','mancher','mancherorts','manches','manchmal','mehr','mehrere','mein','meine','meinem','meinen','meiner','meines','mich','mir','mit','mithin','muessen','muesst','muesste','muss','musst','musste','mussten','muß','mußt','müssen','müsste','müssten','müßt','müßte','nach','nachdem','nachher','nachhinein','nahm','natürlich','neben','nebenan','nehmen','nein','nicht','nichts','nie','niemals','niemand','nirgends','nirgendwo','noch','nun','nur','nächste','nämlich','nötigenfalls','ob','oben','oberhalb','obgleich','obschon','obwohl','oder','oft','per','plötzlich','schließlich','schon','sehr','sehrwohl','seid','sein','seine','seinem','seinen','seiner','seines','seit','seitdem','seither','selber','selbst','sich','sicher','sicherlich','sie','sind','so','sobald','sodass','sodaß','soeben','sofern','sofort','sogar','solange','solch','solche','solchem','solchen','solcher','solches','soll','sollen','sollst','sollt','sollte','sollten','solltest','somit','sondern','sonst','sonstwo','sooft','soviel','soweit','sowie','sowohl','tatsächlich','tatsächlichen','tatsächlicher','tatsächliches','trotzdem','ueber','um','umso','unbedingt','und','unmöglich','unmögliche','unmöglichen','unmöglicher','uns','unser','unser	unsere','unsere','unserem','unseren','unserer','unseres','unter','usw','viel','viele','vielen','vieler','vieles','vielleicht','vielmals','vom','von','vor','voran','vorher','vorüber','völlig','wann','war','waren','warst','warum','was','weder','weil','weiter','weitere','weiterem','weiteren','weiterer','weiteres','weiterhin','weiß','welche','welchem','welchen','welcher','welches','wem','wen','wenig','wenige','weniger','wenigstens','wenn','wenngleich','wer','werde','werden','werdet','weshalb','wessen','wichtig','wie','wieder','wieso','wieviel','wiewohl','will','willst','wir','wird','wirklich','wirst','wo','wodurch','wogegen','woher','wohin','wohingegen','wohl','wohlweislich','womit','woraufhin','woraus','worin','wurde','wurden','während','währenddessen','wär','wäre','wären','würde','würden','z.B.','zB','zahlreich','zeitweise','zu','zudem','zuerst','zufolge','zugleich','zuletzt','zum','zumal','zur','zurück','zusammen','zuviel','zwar','zwischen','ähnlich','übel','über','überall','überallhin','überdies','übermorgen','übrig','übrigens')
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

    add_share(stemmed, word_count)

    def sort_counted_words(words):
        words_list_dict = [words[key] for key in words.keys()]
        return sorted(words_list_dict, key=lambda x: x['count'], reverse=True)

    words_sorted = sort_counted_words(stemmed)
    return words_sorted

def save_text(lines, party):
    text_output = '\n'.join(lines)
    out_file = open('output/'+ str(party) +'01.txt', 'w')
    out_file.write(text_output)
    out_file.close()

def save_json(obj, party):
    output = json.dumps({'data': obj }, ensure_ascii=False)

    out_file = open('output/'+ str(party) +'01.json', 'w')
    out_file.write(output)
    out_file.close()

results_sum = {}
wordcount_sum = 0

def append_result(result, party):
    global wordcount_sum

    for entry in result:
        word = entry['word']
        if word not in results_sum:
            results_sum[word] = {
                'word': word,
                'count': 0,
                'share': 0,
                'segments': {}
            }

        wordcount_sum += entry['count']
        results_sum[word]['count'] += entry['count']
        results_sum[word]['segments'][party] = entry

def get_result_sum():
    add_share(results_sum, wordcount_sum)
    # turn results_sum dict into list
    return sorted(results_sum.values(), key=lambda x: x['count'], reverse=True)

if __name__=="__main__":
    files_from_doc = ['gruene', 'spd', 'fdp', 'piraten', 'linke', 'cdu', 'afd']
    files_from_pdf = ['cdu', 'afd']

    for path in files_from_pdf:
        paragraphs = []
        print(path)
        with open('data/'+path+'.txt') as f:
            container = ''
            for line in f:
                line = line.replace('\n', '')
                if len(line) == 0:
                    continue
                if container == '' and len(line) <70:
                    paragraphs.append(line)
                    continue
                if container.endswith('- '):
                    if re.search(r'^[a-zäüö]', line):
                        container = container[:-1]
                    container = container[:-1]
                container += line + ' '
                if re.search(r'[\s\.\,\?\!\"\'\“):]$', line):
                    paragraphs.append(container[:-1])
                    container = ''
        result = analyze(paragraphs)
        append_result(result, path)
        #save_json(result,path)
        save_text(paragraphs,path)

    for path in files_from_doc:
        paragraphs = []
        print(path)
        with open('data/'+path+'.txt') as f:
            for line in f:
                line = line.replace('\n', '')
                if len(line) == 0:
                    continue
                paragraphs.append(line)

        result = analyze(paragraphs)
        append_result(result, path)
        save_json(result,path)
        save_text(paragraphs,path)

    results = get_result_sum()
    save_json(results, 'all')
    print("✅ Done")
