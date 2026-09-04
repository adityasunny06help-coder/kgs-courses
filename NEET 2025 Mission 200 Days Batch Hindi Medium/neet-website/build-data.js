const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const outputDataPath = path.join(__dirname, 'data.json');

const data = {
  subjects: []
};

// Read all subdirectories in baseDir
const files = fs.readdirSync(baseDir);

for (const file of files) {
  const dirPath = path.join(baseDir, file);
  
  if (fs.statSync(dirPath).isDirectory() && file !== 'neet-website' && !file.startsWith('.')) {
    const subjectJsonPath = path.join(dirPath, 'subject_details.json');
    if (fs.existsSync(subjectJsonPath)) {
      try {
        const fileContent = fs.readFileSync(subjectJsonPath, 'utf8');
        const subjectData = JSON.parse(fileContent);
        data.subjects.push(subjectData);
        console.log(`Loaded subject: ${subjectData.subject_name} (${subjectData.videos ? subjectData.videos.length : 0} videos)`);
      } catch (err) {
        console.error(`Error reading or parsing ${subjectJsonPath}: ${err.message}`);
      }
    }
  }
}

// Sort subjects by name or keep original order
data.subjects.sort((a, b) => a.subject_name.localeCompare(b.subject_name));

fs.writeFileSync(outputDataPath, JSON.stringify(data, null, 2));
console.log('Successfully created data.json with ' + data.subjects.length + ' subjects.');

// Also write data.js for running without a web server
const jsOutputDataPath = path.join(__dirname, 'data.js');
const jsContent = `window.batchData = ${JSON.stringify(data, null, 2)};`;
fs.writeFileSync(jsOutputDataPath, jsContent);
console.log('Successfully created data.js');
