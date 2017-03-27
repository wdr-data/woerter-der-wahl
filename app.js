import BubbleCloud from './lib/bubble_cloud';

(function() {
    const exampleData = [];
    for(let i = 0; i < 40; i++) {
        exampleData.push({
            word: "test",
            count: Math.floor(Math.exp(Math.random()*10)*40)
        });
    }

    const chart = BubbleCloud();
    chart("#bubble_cloud", exampleData);
})();