const fs = require('fs');
const path = require('path');
// const csv = require('csv-parser');
const readline = require('readline');

const wordFolder = path.join(__dirname, 'wordlist');
const outputPath = path.join(__dirname, 'assets', 'wordlist.json');

const wordSet = new Set();

// function readCSV(filePath) {
//   return new Promise((resolve) => {
//     const words = [];
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (row) => {
//         const word = Object.values(row)[0];
//         if (typeof word === 'string') {
//           words.push(word.toLowerCase());
//         }
//       })
//       .on('end', () => resolve(words));
//   });
// }

function readCSV(filePath) {
  return new Promise((resolve) => {
    const words = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const word = line.trim().toLowerCase();
      if (word) words.push(word);
    });

    rl.on('close', () => resolve(words));
  });
}

(async () => {
  const files = fs.readdirSync(wordFolder).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    const words = await readCSV(path.join(wordFolder, file));
    words.forEach(word => wordSet.add(word));
  }

  const sortedWords = Array.from(wordSet).sort();
  fs.mkdirSync(path.join(__dirname, 'assets'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(sortedWords, null, 2));

})();
