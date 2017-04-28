# Wörter der Wahl
### Wahlprogramme einmal anders

Zur NRW-Landtagswahl am 14. Mai haben wir gezählt, welche Wörter wie oft in den Wahlprogrammen vorkommen. Zu sehen sind die Top 30 Begriffe. Sie können eigene Wortfelder erstellen, indem sie Wörter im Suchfeld eingeben.
Ein Klick auf ein Wort zeigt, wie oft das Wort bei den Parteien vorkommt und darunter eine Zufallsauswahl von Sätzen, in denen das Wort vorkommt.
Wörter wie 'Der, die, das, und, oder' etc. wurden anhand [dieser Liste](https://github.com/solariz/german_stopwords/blob/master/german_stopwords_plain.txt) aussortiert.
Vertreten sind Parteien, die derzeit im NRW-Landtag sitzen (SPD, Grüne, CDU, FDP, Piraten) sowie Linke und AFD. [mehr Info](file:///)

### Info
Von Patricia Ennenbach und Marcus Weiner
Design: Mirko Schweikert
Redaktion: Torsten Fischer, Rainer Kellers, Maike Krefting

[**Impressum**](http://www1.wdr.de/impressum/index.html)

Den Code zu 'Wörter der Wahl' stellen wir OpenSource zur Verfügung (MIT License):
[**github.com/wdr-data**](https://github.com/wdr-data/woerter-der-wahl)

# Quellen:
[SPD Wahlprogramm - html](https://www.nrwspd.de/der-nrw-plan/)

[CDU Wahlprogramm - pdf](https://www.cdu-nrw.de/sites/default/files/media/docs/2017-04-01_regierungsprogramm_cdu_fuer_nrw_2017-2022.pdf)

[Grüne Wahlprogramm - pdf](https://gruene-nrw.de/dateien/wahlprogramm2017.pdf)

[FDP Wahlprogramm - pdf](https://www.fdp.nrw/sites/default/files/2017-01/Landtagswahlprogramm.pdf)

[Piraten Wahlprogramm - html](http://smartgerecht.nrw/wahlprogramm/)

[AFD Wahlprogramm - pdf aus dieser Seite](https://afd.nrw/landtagswahl/programm/)

# Vorgehensweise

Vertreten sind Parteien, die derzeit im NRW-Landtag sitzen (SPD, Grüne, CDU, FDP, Piraten) sowie die Parteien, die laut Umfragen bei über 5 Prozent Wählerstimmen liegen liegen: Linke und AFD.

Die Reihenfolge der Parteien entspricht der Reihenfolge auf dem Wahlzettel.

Wie in der Wortanalyse üblich, haben wir eine [deutsche Stopword-Liste]() benutzt, um Wörter wie 'Der, die, das, und, oder' etc. auszusortieren.

Bei Wortanalysen werden Singular und Plural sowie Wortbeugungen (Internet, des Internets) zu Wort-Stämmen zusammengefasst. Wir zählen das Vorkommen des Wortstammes und zeigen die am häufigsten verwendete Version des Wortes an. Zusammengesetzte Worte werden nicht dazu gezählt: Internethandel und Internetkriminalität werden also nicht mit Internet zusammengefasst. Internethandel und Internethandels aber zu Internethandel.

Nicht unterscheiden können wir, wenn ein Wort für mehrere Begriffe steht (Homonym). So hat zum Beispiel das Wort Rechte eine doppelte Bedeutung: Kinderrechte und 'Rechte' als politische Ausrichtung. Beim Wort 'Recht' werden Sätze aus den Wahlprogrammen in beiden Bedeutungen angezeigt.

Die Größe der Wort-Blasen gibt den Anteil des Wortes wieder, den es an allen Worten aller Parteien bzw. einer einzelnen Partei hat. Bei manchen Parteien gibt es mehrere Wörter, die sehr häufig verwendet werden, bei anderen stechen nur einzelne deutlich heraus (FDP).

Bei den Parteien-Blasen werden die relativen Anteile des gewählten Wortes an allen Worten des Wahlprogrammes (ohne Stopwords) wiedergegeben. So wird gewähleistet, dass Wörter in kurzen und langen Wahlprogrammen gleich gewichtet werden.

### Credits:
Wörter der Wahl wandelt eine Vorlage der New York Times ab:
http://www.nytimes.com/interactive/2012/09/04/us/politics/democratic-convention-words.html?_r=0

Ein Dank an Mike Bostock: https://d3js.org/

Stopwords: https://github.com/solariz/german_stopwords/blob/master/german_stopwords_plain.txt

Stemming: http://snowball.tartarus.org/algorithms/german/stemmer.html