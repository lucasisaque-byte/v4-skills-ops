const puppeteer = require('puppeteer');
const path = require('path');

const OUTPUT_DIR = '/Users/lucasisaquerochasantos/v4-skills-ops/clients/via-journey/output/export';
const fs = require('fs');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const slides = [
  { file: 'capa-dr-andre-v2.html',    name: 'slide-01-capa',       id: null },
  { file: 'carrossel-slides-2-7.html', name: 'slide-02-a-origem',   id: 's2' },
  { file: 'carrossel-slides-2-7.html', name: 'slide-03-o-que-eu-vi', id: 's3' },
  { file: 'carrossel-slides-2-7.html', name: 'slide-04-por-que-criei', id: 's4' },
  { file: 'carrossel-slides-2-7.html', name: 'slide-05-acesso',     id: 's5' },
  { file: 'carrossel-slides-2-7.html', name: 'slide-06-para-quem',  id: 's6' },
  { file: 'carrossel-slides-2-7.html', name: 'slide-07-cta',        id: 's7' },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const slide of slides) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    
    const url = `http://localhost:8765/${slide.file}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500)); // aguarda fontes

    let element;
    if (slide.id) {
      element = await page.$(`#${slide.id}`);
    } else {
      element = await page.$('.slide');
    }

    const outPath = path.join(OUTPUT_DIR, `${slide.name}.png`);
    await element.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ Exportado: ${slide.name}.png`);
    
    await page.close();
  }

  await browser.close();
  console.log('\n🎉 Todos os slides exportados em:', OUTPUT_DIR);
})();
