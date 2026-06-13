const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Resimler burada duracak

// Giriş ekranı (Basit bir form)
app.get('/', (req, res) => {
    res.send(`
        <h1>M-Zik Panel Giriş</h1>
        <form action="/login" method="POST">
            <input type="text" name="username" placeholder="Kullanıcı Adı" required><br>
            <input type="password" name="password" placeholder="Şifre" required><br>
            <button type="submit">Giriş Yap</button>
        </form>
    `);
});

// Giriş kontrolü (Buraya yayıncı isimlerini ekleyeceğiz)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Buraya örnek olarak bir kullanıcı ekliyoruz, sonra çoğaltacağız
    if (username === "yayin1" && password === "1234") {
        res.send("<h1>Hoş geldin! Resim yükleme ekranı buraya gelecek.</h1>");
    } else {
        res.send("Hatalı giriş! <a href='/'>Geri dön</a>");
    }
});

app.listen(10000, () => console.log('Sistem çalışıyor...'));
