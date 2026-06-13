const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'public/uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const style = `<style>
    body { font-family: sans-serif; background: #fafafa; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 30px; border: 1px solid #dbdbdb; border-radius: 8px; width: 300px; text-align: center; }
    input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #dbdbdb; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
</style>`;

// Giriş Ekranı
app.get('/', (req, res) => {
    res.send(`<html><head>${style}</head><body><div class="card">
        <h1>Giriş</h1><form action="/login" method="POST">
        <input type="text" name="user" placeholder="Kullanıcı Adı" required>
        <input type="password" name="pass" placeholder="Şifre" required>
        <button type="submit">Giriş Yap</button></form></div></body></html>`);
});

// Yükleme Paneli
app.post('/login', (req, res) => {
    if(req.body.user === "yayin1" && req.body.pass === "1234") {
        res.send(`<html><head>${style}</head><body><div class="card">
            <h2>Dosya Yükle</h2><form action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="resim">
            <button type="submit">Yükle</button></form></div></body></html>`);
    } else { res.send("Hatalı!"); }
});

app.post('/upload', upload.single('resim'), (req, res) => {
    res.send("<h1>Başarılı!</h1><p>Resim yüklendi. OBS'te görünmesi için linki yenileyebilirsin.</p>");
});

app.listen(10000);
