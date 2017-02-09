import Readline from 'readline';
import Fs from 'fs';
import Path from 'path';
import Elasticsearch from 'elasticsearch';
import Stream from 'stream';
import LineByLineReader from 'line-by-line';

//let inputStream = Fs.createReadStream(Path.resolve(__dirname, '../data/flickr.data'));
//let outputStream = new Stream;
//let readline = Readline.createInterface(inputStream, outputStream);

//const readline = Readline.createInterface({
//    input: Fs.createReadStream(Path.resolve(__dirname, '../data/flickr.data'))
//});

let readline = new LineByLineReader(Path.resolve(__dirname, '../data/flickr.data'));

const indexName = 'photos';
const dataType = 'photo';

let elasticsearchBulkData = [];
let client = new Elasticsearch.Client({
    host: 'localhost:9200'
});

function getIndexMetaData(indexName, typeName, photoId) {
    return {
        index: {
            _index: indexName,
            _type: typeName,
            _id: photoId
        }
    };
}

function convertTagsIntoStringArray(photoObject) {
    let tags = [];
    for (let tag of photoObject.tags.tag) {
        tags.push(tag.content);
    }

    return tags;
}

function removeUndescoreFromKeyName(photoAsString) {
    return photoAsString.replace(/_content/g, 'content');

}

let counter = 0;
let total = 0;
readline.on('line', async (line) => {
    line = removeUndescoreFromKeyName(line);
    let document = JSON.parse(line);
    let tags;
    let photo = document.photo;
    // console.log(photo);

    if (document.stat === 'fail') {
        return;
    }

    try {
        tags = convertTagsIntoStringArray(photo);
    } catch (error) {
        console.log(photo);
    }

    // Delete array of tag objects
    delete photo.tags;
    // Add string array with tags
    photo.tags = tags;

    // console.log(photo);
    // process.exit();
    elasticsearchBulkData.push(getIndexMetaData(indexName, dataType, photo.id));
    elasticsearchBulkData.push(photo);


    if (counter == 10000) {
        try{
            readline.pause();
            await client.bulk({
                body: elasticsearchBulkData
            });
            elasticsearchBulkData = [];
            console.log('Uploaded so far: ' + total);
            counter = 0;
            readline.resume();
        } catch(error) {
            console.log(error.message);
        }

    } else {
        counter++;
    }

    total++;
});

readline.on('end', async () => {
    if (elasticsearchBulkData.length > 0) {
        await client.bulk({
            body: elasticsearchBulkData
        });
        console.log('Uploaded: ' + total);
    }
});