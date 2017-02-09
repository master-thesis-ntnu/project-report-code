import Readline from 'readline';
import Fs from 'fs';
import Path from 'path';
import gauss from 'gauss';

const readline = Readline.createInterface({
    input: Fs.createReadStream(Path.resolve(__dirname, '../logs/expansion1.log'))
});

let responseArray = [];
let Vector = gauss.Vector;

readline.on('line', (line) => {
    // Fetch response time number
    let response = line.split(' ')[3];
    // Remove characters which is not digits or else parseFloat results in NaN
    response = parseFloat(response.replace(/[^\d.]/g, ''));

    responseArray.push(response);
});

/**
 * Calulate average value from an array
 * @param responseArray
 * @return Number average
 */
function calculateAverage(responseArray) {
    let sum = 0;

    for (let responseTime of responseArray) {
        sum += responseTime;
    }

    return sum / responseArray.length;
}

function calculateMedian(vector) {
    return new Promise((resolve, reject) => {
        vector.median((median) => {
            resolve(median);
        });
    });
}

function calculate95Percentile(vector) {
    return new Promise((resolve) => {
        vector.percentile(0.95, (percentileValue) => {
            resolve(percentileValue);
        });
    });
}

function calculate99Percentile(vector) {
    return new Promise((resolve) => {
        vector.percentile(0.99, (percentileValue) => {
            resolve(percentileValue);
        });
    });
}

readline.on('close', async () => {
    // Vector format needed for statistics calculations
    let vector = new Vector(responseArray);

    // Calculate statistics
    console.log('Calculate average');
    let average = calculateAverage(responseArray);
    console.log('Calculate median');
    let median = await calculateMedian(vector);
    console.log('Calculate 95th percentile');
    let percentile95 = await calculate95Percentile(vector);
    console.log('Calculate 99th percentile');
    let percentile99 = await calculate99Percentile(vector);

    console.log('Number of vaulues: ' + responseArray.length);
    console.log('Average: ' + average);
    console.log('Median: ' + median);
    console.log('95th percentile: ' + percentile95);
    console.log('99th percentile: ' + percentile99);
});

