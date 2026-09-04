const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const templateDir = path.join(baseDir, '_template');

if (!fs.existsSync(templateDir)) {
    console.error("Template directory not found!");
    process.exit(1);
}

const batches = fs.readdirSync(baseDir).filter(file => {
    const fullPath = path.join(baseDir, file);
    return fs.statSync(fullPath).isDirectory() && 
           !file.startsWith('_') && 
           !file.startsWith('.') &&
           file !== 'node_modules';
});

console.log(`Found ${batches.length} potential batch folders.`);

let processedCount = 0;

for (const batchName of batches) {
    const batchPath = path.join(baseDir, batchName);
    
    // Find subjects in this batch
    const data = { subjects: [] };
    const batchContents = fs.readdirSync(batchPath);
    
    for (const item of batchContents) {
        const itemPath = path.join(batchPath, item);
        if (fs.statSync(itemPath).isDirectory() && item !== 'viewer' && item !== 'neet-website') {
            const subjectJsonPath = path.join(itemPath, 'subject_details.json');
            if (fs.existsSync(subjectJsonPath)) {
                try {
                    const content = fs.readFileSync(subjectJsonPath, 'utf8');
                    const subjectData = JSON.parse(content);
                    data.subjects.push(subjectData);
                } catch (e) {
                    console.error(`Error reading ${subjectJsonPath}: ${e.message}`);
                }
            }
        }
    }
    
    // If no subjects found with json, skip
    if (data.subjects.length === 0) continue;
    
    processedCount++;
    console.log(`Processing [${processedCount}]: ${batchName} (${data.subjects.length} subjects)`);
    
    // Create viewer directory
    const viewerDir = path.join(batchPath, 'viewer');
    if (!fs.existsSync(viewerDir)) {
        fs.mkdirSync(viewerDir);
    }
    
    // Strip private m3u8 URLs before writing data.js
    data.subjects.sort((a, b) => (a.subject_name || '').localeCompare(b.subject_name || ''));
    const publicData = JSON.parse(JSON.stringify(data)); // deep clone
    for (const subject of publicData.subjects) {
        if (subject.videos) {
            for (const video of subject.videos) {
                // Remove private akamaized HLS stream URL
                if (video.video_url && video.video_url.includes('akamaized.net')) {
                    delete video.video_url;
                }
            }
        }
    }
    const jsContent = `window.batchData = ${JSON.stringify(publicData, null, 2)};`;
    fs.writeFileSync(path.join(viewerDir, 'data.js'), jsContent);
    
    // Copy style.css and script.js
    fs.copyFileSync(path.join(templateDir, 'style.css'), path.join(viewerDir, 'style.css'));
    fs.copyFileSync(path.join(templateDir, 'script.js'), path.join(viewerDir, 'script.js'));
    
    // Read and customize index.html
    let htmlContent = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8');
    
    // Create a shorter name for the sidebar if it's too long
    let shortName = batchName;
    if (shortName.length > 40) {
        shortName = shortName.substring(0, 37) + '...';
    }
    
    htmlContent = htmlContent.replace(/\{\{BATCH_NAME\}\}/g, batchName);
    htmlContent = htmlContent.replace(/\{\{BATCH_NAME_SHORT\}\}/g, shortName);
    
    fs.writeFileSync(path.join(viewerDir, 'index.html'), htmlContent);
}

console.log(`\nSuccessfully generated viewers for ${processedCount} batches.`);
