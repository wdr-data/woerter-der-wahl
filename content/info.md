# Wörter der Wahl
### Wahlprogramme einmal anders

Zur NRW-Landtagswahl am 14. Mai haben wir gezählt, welche Wörter wie oft in den Wahlprogrammen vorkommen. Zu sehen sind die Top 30 Begriffe. Sie können eigene Wortfelder erstellen, indem Sie Wörter im Suchfeld eingeben.

Ein Klick auf ein Wort zeigt, wie oft das Wort in den Wahlprogrammen vorkommt und darunter eine Zufallsauswahl von Sätzen, in denen das Wort enthalten ist.
Wörter wie 'der, die, das, und, oder, aber' etc. wurden anhand [dieser Liste](https://github.com/solariz/german_stopwords/blob/master/german_stopwords_plain.txt) aussortiert.
Berücksichtigt sind Parteien, die derzeit in Fraktionsstärke im NRW-Landtag sitzen (SPD, Grüne, CDU, FDP, Piraten) sowie Linke und AFD, die laut NRW-Trend gute Chancen haben, über die Fünf-Prozent-Hürde zu kommen. [mehr Info](http://www1.wdr.de/nachrichten/landespolitik/landtagswahl/wdr-wahlberichterstattung-100.html)

### Info
Von Patricia Ennenbach und Marcus Weiner
Design: Mirko Schweikert
Redaktion: Torsten Fischer, Rainer Kellers, Maike Krefting

[**Impressum**](http://www1.wdr.de/impressum/index.html)

# Vorgehensweise

Berücksichtigt wurden Parteien, die derzeit im NRW-Landtag sitzen (SPD, Grüne, CDU, FDP, Piraten) sowie jene Parteien, die laut NRW-Trend in den neuen Landtag einziehen könnten: Linke und AfD.

Die Reihenfolge der Parteien entspricht der Reihenfolge auf dem Wahlzettel.

Wie in der Wortanalyse üblich haben wir eine [deutsche Stopword-Liste]() benutzt, um Wörter wie 'der, die, das, und, oder, aber' etc. auszusortieren.

Bei Wortanalysen werden Singular und Plural sowie Wortbeugungen (Internet, des Internets) zu Wort-Stämmen zusammengefasst. Wir zählen das Vorkommen des Wortstammes und zeigen die am häufigsten verwendete Version des Wortes an. Zusammengesetzte Worte werden nicht dazu gezählt: Internethandel und Internetkriminalität werden also nicht mit Internet zusammengefasst. Internethandel und Internethandels aber zu Internethandel.

Nicht unterschieden wird, wenn ein Wort für mehrere Begriffe steht (Homonym). So hat zum Beispiel das Wort Rechte eine doppelte Bedeutung: 'Rechte' als juristischer Begriff und 'Rechte' als politische Ausrichtung. Beim Wort 'Recht' werden Sätze aus den Wahlprogrammen in beiden Bedeutungen angezeigt.

Die Größe der Wort-Blasen gibt den Anteil des Wortes wieder, den es an allen Worten aller Parteien bzw. einer einzelnen Partei hat. Bei manchen Parteien gibt es mehrere Wörter, die sehr häufig verwendet werden, bei anderen stechen nur einzelne deutlich heraus (FDP).

Bei den Parteien-Blasen werden die relativen Anteile des gewählten Wortes an allen Worten des Wahlprogrammes (ohne Stopwords) wiedergegeben. So wird gewährleistet, dass Wörter in kurzen und langen Wahlprogrammen gleich gewichtet werden.

Den Code zu 'Wörter der Wahl' stellen wir OpenSource zur Verfügung (MIT License):
[**github.com/wdr-data**](https://github.com/wdr-data/woerter-der-wahl)

# Quellen:
[SPD Wahlprogramm - html](https://www.nrwspd.de/der-nrw-plan/)

[CDU Wahlprogramm - pdf](https://www.cdu-nrw.de/sites/default/files/media/docs/2017-04-01_regierungsprogramm_cdu_fuer_nrw_2017-2022.pdf)

[Grüne Wahlprogramm - pdf](https://gruene-nrw.de/dateien/wahlprogramm2017.pdf)

[FDP Wahlprogramm - pdf](https://www.fdp.nrw/sites/default/files/2017-01/Landtagswahlprogramm.pdf)

[Piraten Wahlprogramm - html](http://smartgerecht.nrw/wahlprogramm/)

[Linke Wahlprogramm - html](http://wahl2017.dielinke-nrw.de/programm/)

[AFD Wahlprogramm - pdf aus dieser Seite](https://afd.nrw/landtagswahl/programm/)

### Credits:
Wörter der Wahl wandelt eine Vorlage der New York Times ab:
http://www.nytimes.com/interactive/2012/09/04/us/politics/democratic-convention-words.html?_r=0

Ein Dank an Mike Bostock: https://d3js.org/

Stopwords: https://github.com/solariz/german_stopwords/blob/master/german_stopwords_plain.txt

Stemming: http://snowball.tartarus.org/algorithms/german/stemmer.html
