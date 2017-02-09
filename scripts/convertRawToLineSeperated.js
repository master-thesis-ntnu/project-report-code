import Fs from 'fs';
import Path from 'path';

const readStream = Fs.createReadStream(Path.resolve(__dirname, '../userResults.json'), {
    encoding: 'utf8',
    fd: null
});

const writeStream = Fs.createWriteStream(Path.resolve(__dirname, '../userResultsCopy.json'), {
    encoding: 'utf8'
});

/**
 * The user data is not line separated. As a result it is difficult to parse.
 * This function put each json object on a separate line.
 */
function main() {
    let stream = '';
    let bracketCounter = 0;

    readStream.on('readable', () => {
        let character;

        while(null !== (character = readStream.read(1))) {
            stream += character;

            if (character === '{') {
                bracketCounter++;
            }

            if (character === '}') {
                bracketCounter--;
            }

            if (bracketCounter == 0) {
                stream += '\n';
                stream = stream.replace(/\\"/g, '');
                writeStream.write(stream);
                stream = '';
            }
        }
    });
}
main();
