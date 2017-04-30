import BubbleCloud from './lib/bubble_cloud';
import _ from 'lodash';
import qs from 'qs';
import * as helpers from './lib/data_helpers';

(function() {
    const params = qs.parse(window.location.search.substr(1));

    fetch('output/top30.json')
        .then(res => res.json())
        .then(json => {
            const bubbles = json.data;
            const data = helpers.bubbleData(bubbles, params.party || 'all').map(helpers.prepareData).slice(0, 30);
            const elem = document.getElementById('bubbleCloudVis');
            elem.classList.add('party-'+(params.party || 'all'));
            BubbleCloud()(elem, data);
        });
})();
