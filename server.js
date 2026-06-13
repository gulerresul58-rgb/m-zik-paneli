const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, req.body.user + '_son.jpg'); }
});
const upload = multer({ storage: storage });

const renderPage = (content) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; border: 1px solid #dbdbdb; width: 350px; padding: 40px; text-align: center; border-radius: 3px; }
            .logo { font-size: 1.8em; font-weight: bold; color: #333; margin-bottom: 25px; }
            input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; box-sizing: border-box; border-radius: 3px; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; margin-top: 10px; cursor: pointer; border-radius: 3px; }
        </style>
    </head>
    <body><div class="card"><div class="logo">Resul Müzik Mix Panel</div>${content}</div></body>
    </html>
`;

app.get('/', (req, res) => res.send(renderPage('<form action="/login" method="POST"><input type="text" name="user" placeholder="Kullanıcı Adı"><input type="password" name="pass" placeholder="Şifre"><button type="submit">Giriş Yap</button></form>')));

app.post('/login', (req, res) => {
    if (req.body.user === "yayin1" && req.body.pass === "1234") {
        res.send(renderPage('<form action="/upload" method="POST" enctype="multipart/form-data"><input type="hidden" name="user" value="yayin1"><input type="file" name="resim" required><br><button type="submit">Resmi Yükle</button></form>'));
    } else { res.send(renderPage("Hatalı!")); }
});

app.post('/upload', upload.single('resim'), (req, res) => res.send(renderPage("Yüklendi! <a href='/'>Geri</a>")));

// TİTREMEYİ ÖNLEYEN GÜNCEL EKRAN
app.get('/son-resim/:user', (req, res) => {
    res.send(`
        <html>
        <body style="margin:0; background:black; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img id="gosterge" src="/uploads/${req.params.user}_son.jpg?t=${Date.now()}" style="max-width:100%; max-height:100%; object-fit:contain;">
            <script>
                setInterval(() => {
                    var img = document.getElementById('gosterge');
                    img.src = '/uploads/${req.params.user}_son.jpg?t=' + new Date().getTime();
                }, 1000);
            </script>
        </body>
        </html>
    `);
});

app.listen(process.env.PORT || 10000);
