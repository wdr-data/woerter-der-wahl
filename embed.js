import BubbleCloud from './lib/bubble_cloud';
import _ from 'lodash';

(function() {
    fetch('output/all.json')
        .then(res => res.json())
        .then(json => {
            const bubbles = json.data.slice(0, 30);

            BubbleCloud()("#bubbleCloudVis", bubbles.map((item, key) => { return {
                id: key,
                word: item.word,
                count: item.count,
                share: item.share,
                party_counts: _.mapValues(item.segments, d => d.share)
            }; }));
        });
})();
