// Скрипт для извлечения текста из PDF и сохранения в виде чанков
// Запуск: node extract_pdfs.js

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const PDF_DIR = path.join(__dirname, "pdf");
const OUTPUT_FILE = path.join(__dirname, "knowledge_base.js");

const CHUNK_SIZE = 2000;

const BASE_INFO = `Под банковской гарантией от 3-х минут подразумевается принятие решения о её выдаче.
В случае индивидуального рассмотрения заявки — комиссия от 9000 ₽ в зависимости от суммы.
Законодательство: 44-ФЗ от 05.04.2013, 223-ФЗ от 18.07.2011, Постановление N 615 от 01.07.2016 (капремонт).
СберБизнес — система дистанционного банковского обслуживания для юрлиц и ИП.
Контакты: 0321 (мобильный), 8 800 555 5 777 (городской).`;

function splitIntoChunks(text, chunkSize) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += "\n\n" + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function extractAll() {
  const files = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));
  console.log(`Найдено ${files.length} PDF-файлов\n`);

  const allChunks = [
    { source: "Общая информация", text: BASE_INFO },
  ];

  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const docName = file.replace(".pdf", "");
    console.log(`Обработка: ${file}`);

    try {
      const data = await pdfParse(buffer);
      const chunks = splitIntoChunks(data.text, CHUNK_SIZE);
      chunks.forEach((chunk) => {
        allChunks.push({ source: docName, text: chunk });
      });
      console.log(`  -> ${data.numpages} страниц -> ${chunks.length} чанков`);
    } catch (error) {
      console.error(`  !! Ошибка: ${error.message}`);
    }
  }

  const content = `// База знаний для ИИ-ответов (автогенерация из PDF)
// Обновлено: ${new Date().toISOString()}
// Всего чанков: ${allChunks.length}

const CHUNKS = ${JSON.stringify(allChunks, null, 2)};

// Простой поиск по ключевым словам с ранжированием
function searchChunks(query, topK = 5) {
  const queryWords = query
    .toLowerCase()
    .replace(/[^\\p{L}\\p{N}\\s]/gu, " ")
    .split(/\\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) return CHUNKS.slice(0, topK);

  const scored = CHUNKS.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = (textLower.match(new RegExp(word, "g")) || []).length;
      score += matches;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

function buildContext(query) {
  const relevantChunks = searchChunks(query, 5);
  if (relevantChunks.length === 0) {
    return CHUNKS[0].text;
  }
  return relevantChunks
    .map((c) => \`[\${c.source}]\\n\${c.text}\`)
    .join("\\n\\n---\\n\\n");
}

module.exports = { CHUNKS, searchChunks, buildContext };
`;

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`\nГотово! Всего чанков: ${allChunks.length}`);
  console.log(`Файл: ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(0)} КБ)`);
}

extractAll();
