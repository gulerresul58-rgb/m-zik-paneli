const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

let yaziAyarlari = {
    metin: "Resul Müzik Yayını",
    boyut: "40px",
    renk: "#ffffff",
    konum: "bottom: 50px; left: 50px;",
    font: "'Arial', sans-serif"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, 'yayin1_son.jpg'); } // Dosya ismini sabitledik
});
const upload = multer({ storage: storage });

const layout = (content) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; margin: 0; display: flex; }
            .sidebar { width: 220px; background: white; border-right: 1px solid #dbdbdb; height: 100vh; padding: 20px; }
            .card { background: white; border: 1px solid #dbdbdb; width: 400px; padding: 30px; border-radius: 3px; }
            input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; margin-top: 10px; cursor: pointer; }
            a { color: #333; text-decoration: none; display: block; margin: 15px 0; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div style="font-weight:bold; margin-bottom:20px;">MENÜ</div>
            <a href="/admin">🖼 Resim Değiştir</a>
            <a href="/yazi-ayarlari">✍ Yazı Ekle/Düzenle</a>
        </div>
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div class="card">
                <div style="font-size:1.5em; font-weight:bold; margin-bottom:20px;">Resul Müzik Mix Panel</div>
                ${content}
            </div>
        </div>
    </body>
    </html>
`;

app.get('/api/yazi', (req, res) => res.json(yaziAyarlari));

app.get('/admin', (req, res) => res.send(layout(`
    <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="resim" required><button type="submit">Resmi Yükle</button>
    </form>
`)));

app.get('/yazi-ayarlari', (req, res) => res.send(layout(`
    <form action="/set-yazi" method="POST">
        <input type="text" name="metin" value="${yaziAyarlari.metin}" placeholder="Yazı">
        <label>Boyut: <span id="val">${yaziAyarlari.boyut.replace('px','')}</span>px</label>
        <input type="range" name="boyut" min="10" max="200" value="${yaziAyarlari.boyut.replace('px','')}" oninput="document.getElementById('val').innerText = this.value">
        <input type="color" name="renk" value="${yaziAyarlari.renk}" style="height:40px;">
        <select name="font">
            <option value="'Arial', sans-serif">Modern</option>
            <option value="'Courier New', monospace">Retro</option>
            <option value="'Impact', sans-serif">Kalın</option>
        </select>
        <select name="konum">
            <option value="top:20px; left:20px;">Sol Üst</option>
            <option value="bottom:50px; left:50px;">Sol Alt</option>
            <option value="bottom:50px; right:50px;">Sağ Alt</option>
        </select>
        <button type="submit">Güncelle</button>
    </form>
`)));

app.post('/set-yazi', (req, res) => {
    yaziAyarlari = { ...req.body, boyut: req.body.boyut + "px" };
    res.redirect('/yazi-ayarlari');
});

app.post('/upload', upload.single('resim'), (req, res) => res.redirect('/admin'));

app.get('/son-resim/:user', (req, res) => {
    res.send(`
        <html>
        <body style="margin:0; background:black; height:100vh; overflow:hidden;">
            <img id="img" src="/uploads/yayin1_son.jpg?t=${Date.now()}" style="width:100%; height:100%; object-fit:contain;">
            <div id="yazi-alani" style="position:absolute; font-weight:bold; text-shadow:2px 2px 10px black; padding:10px;"></div>
            <script>
                setInterval(async () => {
                    document.getElementById('img').src = '/uploads/yayin1_son.jpg?t=' + new Date().getTime();
                    const res = await fetch('/api/yazi');
                    const data = await res.json();
                    const y = document.getElementById('yazi-alani');
                    y.innerText = data.metin; y.style.fontSize = data.boyut; y.style.color = data.renk; 
                    y.style.fontFamily = data.font; y.style.cssText += data.konum;
                }, 1000);
            </script>
        </body>
        </html>
    `);
});

app.listen(process.env.PORT || 10000);
