const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('assets/听力全真模拟1000题.pdf');

pdf(dataBuffer).then(function (data) {
    console.log("Number of pages:", data.numpages);
    console.log("First 2000 characters:\n");
    console.log(data.text.substring(0, 2000));

    // Save full text for inspection
    fs.writeFileSync('scripts/pdf_dump.txt', data.text);
}).catch(err => {
    console.error("Error parsing PDF:", err);
});
