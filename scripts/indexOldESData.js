import Readline from 'readline';
import Fs from 'fs';
import Path from 'path';
import Elasticsearch from 'elasticsearch';

const readline = Readline.createInterface({
    input: Fs.createReadStream(Path.resolve(__dirname, '../userResultsCopy.json'))
});

const indexName = 'user';
const dataType = 'user';

let elasticsearchBulkData = [];
let client = new Elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

function getIndexMetaData(indexName, typeName) {
    return {
        index: {
            _index: indexName,
            _type: typeName
        }
    };
}

readline.on('line', (line) => {
    let document = {
        doc: JSON.parse(line)
    };

    elasticsearchBulkData.push(getIndexMetaData(indexName, dataType));
    elasticsearchBulkData.push(document);
});

readline.on('close', () => {
    client.bulk({
        body: elasticsearchBulkData
    });
});