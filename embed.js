import BubbleCloud from './lib/bubble_cloud';
import qs from 'qs';
import * as helpers from './lib/data_helpers';
import debounce from 'lodash/debounce';

// Polyfills
import Promise from 'promise';
if (!window.Promise) {
    window.Promise = Promise;
}
import 'whatwg-fetch';

(function() {
    const params = qs.parse(window.location.search.substr(1));

    const party = params.party || 'all';
    const customWords = (params.customwords || '').split('+');

    const wordCountGetter = () => customWords.length === 0 ? (window.innerWidth > 425 ? 30 : 20) : customWords.length;

    const prepareLink = function(word, party, customwords) {
        const query = qs.stringify({
            word: word,
            party: party,
            customwords: customwords.join('+')
        });
        return `index.html?${query}`;
    };

    let wordCount = wordCountGetter();
    let cloud = null;
    let data = [];

    (customWords.length === 0 ?
        fetch('output/top30.json')
            .then(res => res.json())
            .then(json => json.data) :
        helpers.customWordData(customWords)
    )
        .then(words => {
            data = helpers.bubbleData(words, party)
                .map(helpers.prepareData);

            const elem = document.getElementById('bubbleCloudVis');
            elem.classList.add(`party-${party}`);

            cloud = BubbleCloud(elem);
            cloud.setData(data.slice(0, wordCount));

            elem.addEventListener('word-click', ev => {
                window.open(prepareLink(ev.detail.name, params.party, customWords), '_blank');
            });
        });

    document.querySelector('.app-link').addEventListener('click', ev => {
        ev.preventDefault();
        window.open(prepareLink(null, params.party, customWords), '_blank');
    });

    window.addEventListener('resize', debounce(() => {
        if(!cloud) {
            return;
        }
        const former = wordCount;
        wordCount = wordCountGetter();
        if(former !== wordCount) {
            cloud.setData(data.slice(0, wordCount));
        }
    }, 500))
})();
