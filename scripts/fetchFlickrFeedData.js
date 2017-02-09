import fetch from 'node-fetch';
import Path from 'path';
import dotenv from 'dotenv';
import QueryString from 'querystring';
import Fs from 'fs';

dotenv.config();

const flickerPhotoFeedUrl = 'https://api.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&lang=en-us';
const flickerBaseApiUrl = "https://api.flickr.com/services/rest/?";
const flickerPhotoFeedDataPath = Path.resolve(__dirname, '../data/flickr.data');
const urlParameters = {
    method: 'flickr.photos.getInfo',
    format: 'json',
    nojsoncallback: 1,
    api_key: process.env.FLICKR_API_KEY
};

let photoCounter = 0;

async function fetchFlickrPhotoFeed() {
    let rawFlickerPhotoFeed = await fetch(flickerPhotoFeedUrl);
    let textFlickerPhotoFeed = await rawFlickerPhotoFeed.text();

    let jsonFlickrPhotoFeed = JSON.parse(textFlickerPhotoFeed.replace(/\\'/g, "'"));
    return jsonFlickrPhotoFeed.items;
}

function extractPhotoIdFromFlickrUrl(flickerPhotoUrl) {
    let splitArray = flickerPhotoUrl.split('/');
    let splitArraySize = splitArray.length;

    return splitArray[splitArraySize - 2];
}

async function fetchPhotoDataFromFlickr(photoFeed) {
    return Promise.all(photoFeed.map((photo) => {
        urlParameters.photo_id = extractPhotoIdFromFlickrUrl(photo.link);
        let photoUrl = flickerBaseApiUrl + QueryString.stringify(urlParameters);

        return fetch(photoUrl).then((response) => {
            return response.json();
        });
    }));
}

function writePhotoDataToFile(photos) {
    for (let photo of photos) {
        Fs.appendFile(flickerPhotoFeedDataPath, JSON.stringify(photo) + '\n', (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    photoCounter += photos.length;
}

function sleep(sleepInMillis) {
    return new Promise(resolve => setTimeout(resolve, sleepInMillis));
}

async function main() {
    console.log('Downloading Flickr data...');
    while(true) {
        try {
            let photoFeed = await fetchFlickrPhotoFeed();
            let photos = await fetchPhotoDataFromFlickr(photoFeed);
            //console.log(photos[0]);

            writePhotoDataToFile(photos);
            console.log('Data so far: ' + photoCounter);
        } catch (error) {
            console.log(error.message);
        }

        await sleep(30000);
    }
}

main();
