const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const dbFile = path.join(__dirname, 'veriler.json');

let veriler = { kullanicilar: { "admin": "admin123" }, ayarlari: {} };
if (fs.existsSync(dbFile)) {
    try { veriler = JSON.parse(fs.readFileSync(dbFile, 'utf8')); } catch (e) {}
}
function save() { fs.writeFileSync(dbFile, JSON.stringify(veriler, null, 2)); }

const upload = multer({ dest: 'public/uploads/' });

function getAyarlar(user) {
    if (!veriler.ayarlari[user]) {
        veriler.ayarlari[user] = { metin: "Resul Müzik", boyut: 40, font: "Arial, sans-serif", renk: "#ffffff", konum: "top: 20px;" };
    }
    return veriler.ayarlari[user];
}

const layout = (content, user, isSidebar = false) => `
    <html>
    <head>
        <title>Resul Müzik Mix Panel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, sans-serif; margin: 0; background: #fafafa; display: flex; }
            .sidebar { width: 250px; background: #fff; height: 100vh; border-right: 1px solid #dbdbdb; padding: 20px; }
            .menu-btn { display: block; width: 100%; padding: 15px; margin: 10px 0; background: #f0f2f5; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; }
            .content-area { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 40px; }
            .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
            input, select, button { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; }
            button { background: #0095f6; color: white; font-weight: bold; cursor: pointer; border: none; }
        </style>
    </head>
    <body>
        ${isSidebar ? `<div class="sidebar"><h3>≡ RESUL MÜZİK</h3>
            <a class="menu-btn" href="/panel?user=${user}&view=resim">🖼 Resim Yükle</a>
            <a class="menu-btn" href="/panel?user=${user}&view=yazi">✍ Yazı Ayarları</a>
            <a href="/" style="color:red; margin-top:20px; display:block;">Çıkış Yap</a>
        </div>` : ''}
        <div class="content-area"><div class="card">${content}</div></div>
    </body>
    </html>
`;

app.get('/', (req, res) => res.send(layout(`<h3>Giriş Yap</h3><form action="/login" method="POST"><input type="text" name="user" placeholder="Kullanıcı"><input type="password" name="pass" placeholder="Şifre"><button type="submit">Giriş</button></form>`, "Giriş")));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (veriler.kullanicilar[user] === pass) res.redirect(user === 'admin' ? '/admin-paneli' : '/panel?user=' + user);
    else res.send("Hatalı!");
});

app.get('/admin-paneli', (req, res) => {
    let list = Object.keys(veriler.kullanicilar).map(u => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
            ${u} ${u !== 'admin' ? `<a href="/kisi-sil/${u}" style="color:red; text-decoration:none;">Sil</a>` : ''}
        </div>`).join('');
    res.send(layout(`<h1>Yönetim</h1><form action="/kisi-ekle" method="POST"><input type="text" name="yeniUser" placeholder="Kullanıcı" required><input type="text" name="yeniPass" placeholder="Şifre" required><button type="submit">Ekle</button></form><h3>Kullanıcılar:</h3>${list}`, "admin", true));
});

app.post('/kisi-ekle', (req, res) => {
    veriler.kullanicilar[req.body.yeniUser] = req.body.yeniPass;
    save(); res.redirect('/admin-paneli');
});

app.get('/kisi-sil/:user', (req, res) => {
    delete veriler.kullanicilar[req.params.user];
    save(); res.redirect('/admin-paneli');
});

app.get('/panel', (req, res) => {
    const { user, view, msg } = req.query;
    if(!user) return res.redirect('/');
    const d = getAyarlar(user);
    const obsLink = `https://m-zik-paneli.onrender.com/yayin/${user}`;

    let content = `
        <h3>OBS Linkin:</h3><input type="text" value="${obsLink}" readonly onclick="this.select()">
        ${msg ? `<p>✅ ${msg}</p>` : ''}
        <form action="/update-yayin" method="POST">
            <input type="hidden" name="user" value="${user}">
            <input type="text" name="metin" value="${d.metin}">
            <input type="color" name="renk" value="${d.renk}">
            <input type="number" name="boyut" value="${d.boyut}">
            <select name="konum">
                <option value="top: 20px;" ${d.konum.includes("top")?"selected":""}>Üstte</option>
                <option value="bottom: 20px;" ${d.konum.includes("bottom")?"selected":""}>Altta</option>
                <option value="top: 50%; transform: translateY(-50%);" ${d.konum.includes("50%")?"selected":""}>Ortada</option>
            </select>
            <select name="font">
                <option value="Arial, sans-serif" ${d.font.includes("Arial")?"selected":""}>Arial</option>
                <option value="'Courier New', monospace" ${d.font.includes("Courier")?"selected":""}>Kod</option>
                <option value="'Georgia', serif" ${d.font.includes("Georgia")?"selected":""}>Klasik</option>
                <option value="'Impact', sans-serif" ${d.font.includes("Impact")?"selected":""}>Manşet</option>
                <option value="'Brush Script MT', cursive" ${d.font.includes("Brush")?"selected":""}>El Yazısı</option>
                <option value="'Trebuchet MS', sans-serif" ${d.font.includes("Trebuchet")?"selected":""}>Modern</option>
                <option value="'Verdana', sans-serif" ${d.font.includes("Verdana")?"selected":""}>Okunaklı</option>
            </select>
            <button type="submit">Kaydet</button>
        </form>
    `;
    res.send(layout(content, user, true));
});

app.post('/upload', upload.single('resim'), (req, res) => {
    const newPath = path.join('public/uploads/', req.body.user + '_son.jpg');
    fs.renameSync(req.file.path, newPath);
    res.redirect('/panel?user=' + req.body.user + '&view=resim&msg=Resim+yüklendi!');
});

app.post('/update-yayin', (req, res) => {
    veriler.ayarlari[req.body.user] = req.body;
    save(); res.redirect('/panel?user=' + req.body.user + '&view=yazi&msg=Kaydedildi!');
});

app.get('/yayin/:user', (req, res) => {
    res.send(`
        <html>
        <head>
            <style>
                body { margin: 0; background: transparent; overflow: hidden; }
                #img { width: 100%; display: block; }
                #yazi { position: absolute; left: 0; right: 0; text-align: center; font-weight: bold; text-shadow: 2px 2px 4px #000; }
            </style>
        </head>
        <body>
            <img id="img" src="/uploads/${req.params.user}_son.jpg">
            <div id="yazi"></div>
            <script>
                setInterval(async () => {
                    const res = await fetch('/api/ayarlar/${req.params.user}');
                    const d = await res.json();
                    const y = document.getElementById('yazi');
                    y.innerText = d.metin;
                    y.style.color = d.renk;
                    y.style.fontSize = d.boyut + 'px';
                    y.style.fontFamily = d.font;
                    y.style.cssText = 'position: absolute; left: 0; right: 0; text-align: center; font-weight: bold; text-shadow: 2px 2px 4px #000; ' + d.konum;
                    document.getElementById('img').src = '/uploads/${req.params.user}_son.jpg?t=' + new Date().getTime();
                }, 1000);
            </script>
        </body>
        </html>
    `);
});

app.get('/api/ayarlar/:user', (req, res) => {
    res.json(getAyarlar(req.params.user));
});

app.listen(process.env.PORT || 10000);
