import BubbleCloud from './lib/bubble_cloud';

(function() {
    fetch('output/all.json')
        .then(res => res.json())
        .then(json => {
            const bubbles = json.data.slice(0, 30);

            BubbleCloud()("#bubble_cloud1", bubbles.map((item, key) => { return {
                id: key,
                word: item.word,
                count: item.share
            }; }));
        });
})();
