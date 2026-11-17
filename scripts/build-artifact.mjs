// Сборка для публикации на claude.ai: маршруты в памяти и страница без собственного <head>
// (оболочку документа добавляет площадка). Результат: dist-artifact/page.html + assets/.
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';

execSync('npx vite build --outDir dist-artifact --emptyOutDir', { stdio: 'inherit', env: { ...process.env, VITE_ROUTER: 'memory' } });
const assets = readdirSync('dist-artifact/assets');
const css = assets.find((f) => f.endsWith('.css'));
const js = assets.find((f) => f.endsWith('.js'));
writeFileSync(
  'dist-artifact/page.html',
  `<title>한국어 학교</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Caveat:wght@500;700&family=Golos+Text:wght@400;500;600;700&family=Gowun+Dodum&family=Nanum+Pen+Script&display=swap">
<link rel="stylesheet" href="assets/${css}">
<div id="root"></div>
<script type="module" src="assets/${js}"></script>
`,
);
console.log('page.html →', css, js);
