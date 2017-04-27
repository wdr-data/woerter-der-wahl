export function prepareData(item, key) {
    return {
        id: item.id || key+1,
        word: item.word,
        count: item.count,
        share: item.share,
        party_counts: _.mapValues(item.segments || {}, d => d.share)
    };
}

export function transformForParty(party) {
    return (word, key) => {
        return {
            id: key+1,
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