import Readline from 'readline';
import Fs from 'fs';
import Path from 'path';
import Elasticsearch from 'elasticsearch';
import Stream from 'stream';
import LineByLineReader from 'line-by-line';
import { removeUndescoreFromKeyName } from './utilFunctions';

//const readline = Readline.createInterface({
//    input: Fs.createReadStream(Path.resolve(__dirname, '../data/flickr.data'))
//});

let readline = new LineByLineReader(Path.resolve(__dirname, '../data/flickr.data'));

const indexName = 'tags';
const dataType = 'tag';

let elasticsearchBulkData = [];
let client = new Elasticsearch.Client({
    host: 'localhost:9200'
});

function getIndexMetaData(indexName, typeName, tagId) {
    return {
        index: {
            _index: indexName,
            _type: typeName,
            _id: tagId
        }
    };
}

function getTagsFromPhoto(photo) {
    return photo.tags.tag;
}

let counter = 0;
let total = 0;
readline.on('line', async (line) => {
    line = removeUndescoreFromKeyName(line);
    let photo = JSON.parse(line).photo;

    // Skip undefined documents
    if (typeof photo == 'undefined')
        return;

    let tags = getTagsFromPhoto(photo);

    // Each photo may have multiple tags. Add all tags to ES
    for(let tag of tags) {
        elasticsearchBulkData.push(getIndexMetaData(indexName, dataType, tag.id));
        elasticsearchBulkData.push(tag);
    }

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