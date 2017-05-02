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

    const wordCountGetter = () => window.innerWidth > 425 ? 30 : 20;
    let wordCount = wordCountGetter();
    let cloud = null;
    let data = [];

    fetch('output/top30.json')
        .then(res => res.json())
        .then(json => {
            const bubbles = json.data;
            data = helpers.bubbleData(bubbles, params.party || 'all')
                .map(helpers.prepareData);
            const currentData = data.slice(0, wordCount);
            const elem = document.getElementById('bubbleCloudVis');
            elem.classList.add('party-'+(params.party || 'all'));
            cloud = BubbleCloud(elem);
            cloud.setData(currentData);
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
