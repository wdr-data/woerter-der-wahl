import mapValues from 'lodash/mapValues';
import assign from 'lodash/assign';

export function prepareData(item, key) {
    return {
        id: item.id+1 || key+1,
        word: item.word,
        count: item.count,
        share: item.share,
        party_counts: mapValues(item.segments || {}, d => d.share)
    };
}

export function transformForParty(party) {
    return (word, key) => {
        return {
            id: word.id || key,
            word: word.word,
            count: (party in word.segments) ? word.segments[party].count : 0,
            share: (party in word.segments) ? word.segments[party].share : 0,
            occurence: (party in word.segments) ? word.segments[party].occurence : []
        };
    };
}

export function bubbleData(data, party) {
    return (party === 'all') ?
        data :
        data.map(transformForParty(party)).sort((a,b) => b.count-a.count);
}

window._customCache = { index: {}, words: {} };
export function getIndexEntry(type, term, len) {
    const letter = term.toLowerCase().replace(/[^a-z]/g, '-').substr(0,len);
    if(!(letter in window._customCache[type])) {
        return fetch(`output/${type}/${letter}.json`)
            .then(res => res.ok ? res : Promise.reject("not found"))
            .then(file => file.json())
            .then(json => {
                window._customCache[type][letter] = json;
                return json;
            });
    } else {
        return Promise.resolve(window._customCache[type][letter]);
    }
}

export function customWordData(words) {
    return Promise.all(words.map(word =>
        getIndexEntry('words', word, 4)
            .then(entries => assign(entries[word], { id: entries[word].idx }))
    ));
}