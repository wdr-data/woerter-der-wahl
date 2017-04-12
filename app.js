import BubbleCloud from './lib/bubble_cloud';

(function() {
    Promise.all([
        fetch('output/gruene.json'),
        fetch('output/gruene.txt')
    ])
        .then(results => {
            return Promise.all([
                results[0].json(),
                Promise.resolve(results[1])
            ]);
        })
        .then(results => {
            const json = results[0];
            const text = results[1];

            const bubbles = json.data.slice(0, 30);

            BubbleCloud()("#bubble_cloud1", bubbles.map((item, key) => { return {
                id: key,
                word: item.word,
                count: item.share
            }; }));
        });
})();
