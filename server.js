import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// 정적 파일 제공
app.use(express.static(__dirname));

// 루트 경로에서 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🗺️ 2D GIS 애플리케이션이 http://localhost:${PORT} 에서 실행 중입니다.`);
});
