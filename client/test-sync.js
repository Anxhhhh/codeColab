import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]});
    
    console.log("Opening first client...");
    const page1 = await browser.newPage();
    page1.on('console', msg => console.log('Client 1 log:', msg.text()));
    await page1.goto('http://localhost:5173');

    console.log("Opening second client...");
    const page2 = await browser.newPage();
    page2.on('console', msg => console.log('Client 2 log:', msg.text()));
    await page2.goto('http://localhost:5173');


    console.log("Waiting for Monaco to be ready...");
    await new Promise(r => setTimeout(r, 5000));

    // Type in client 1
    console.log("Typing in Client 1...");
    await page1.keyboard.type(" // Hello from Puppeteer\n");

    console.log("Waiting for sync...");
    await new Promise(r => setTimeout(r, 2000));

    // Check client 2 content
    console.log("Checking Client 2...");
    const content = await page2.evaluate(() => {
        // extract monaco text somehow, or just page content
        return document.querySelector('.monaco-editor').innerText;
    });
    console.log("Content in Client 2:");
    console.log(content.substring(0, 100));

    await browser.close();
}

main().catch(console.error);
