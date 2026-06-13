const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// OBS'in canlı olarak izleyeceği resim linki
let guncelResimLink = "https://i.imgur.com/yayin_baslangic.jpg"; 

app.get('/', (req, res) => {
    res.send('<h1>Giriş Yap</h1><form action="/login" method="POST"><input type="text" name="user"><input type="password" name="pass"><button>Giriş</button></form>');
});

app.post('/login', (req, res) => {
    if(req.body.user === "yayin1" && req.body.pass === "1234") {
        res.send(`<h1>Resim Linkini Yapıştır</h1>
        <p>Galerinden resmi Imgur'a yükle ve linki buraya yapıştır:</p>
        <form action="/guncelle" method="POST">
        <input type="text" name="yeniLink" placeholder="Resim Linki">
        <button>OBS'te Güncelle</button></form>`);
    } else { res.send("Hatalı!"); }
});

app.post('/guncelle', (req, res) => {
    guncelResimLink = req.body.yeniLink;
    res.send("Resim güncellendi! OBS'te değişti.");
});

// OBS bunu izliyor
app.get('/overlay/yayin1', (req, res) => {
    res.send(`<img src="${guncelResimLink}" style="width:100%; height:100vh; object-fit:contain;">`);
});

app.listen(10000);
