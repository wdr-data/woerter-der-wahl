import BubbleCloud from './lib/bubble_cloud';

(function() {
    const exampleData = [];
    for(let i = 0; i < 40; i++) {
        exampleData.push({
            id: i,
            word: "test",
            count: Math.floor(Math.exp(Math.random()*10)*40)
        });
    }

    BubbleCloud()("#bubble_cloud", exampleData);
})();