import BubbleCloud from './bubble_cloud';

import zipObject from 'lodash/zipObject';
import mapValues from 'lodash/mapValues';
import find from 'lodash/find';
import map from 'lodash/map';
import chunk from 'lodash/chunk';
import findIndex from 'lodash/findIndex';
import debounce from 'lodash/debounce';

// Polyfills
import Promise from 'promise';
if (!window.Promise) {
    window.Promise = Promise;
}
if(!window.Promise.all) {
    window.Promise.all = Promise.all;
}
import 'whatwg-fetch';

import * as helpers from './data_helpers';

window.BubbleCloud = BubbleCloud;
window.dataHelpers = helpers;
window._ = {
    zipObject,
    mapValues,
    find,
    map,
    chunk,
    findIndex,
    debounce
};