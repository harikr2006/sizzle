"use strict";
const imagemin = require("imagemin");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");
const imageminPngquant = require("imagemin-pngquant");
const express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const app = express();


const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:80'] // Whitelist the domains you want to allow
};


app.use(cors(corsOptions));
app.post("/",function (req, res) {
  console.log(req.body)
  if (req.method == 'POST') {
    var jsonString = '';

    req.on('data', function (data) {
        jsonString += data;
    });

    req.on('end', function () {
        req.body = JSON.parse(jsonString);
        minify(req, res);
        
    });
} 
});

app.listen(3002);

async function minify(req, res) {
  const params = req.body;
  const { base64String, name, extension } = params;
  const base64Image = base64String.split(";base64").pop();
  const filename = `${name}.${extension}`;

  try {
    const result = Buffer.from(base64Image, "base64");
    const newImgBuffer = await imagemin.buffer(result, {
      destination: "serverless/compress_files",
      plugins: [
        imageminJpegRecompress({
          min: 20,
          max: 58,
        }),
        imageminPngquant({
          quality: [0.2, 0.5],
        }),
      ],
    });

    const filesize = newImgBuffer.length;
    const base64CompString = newImgBuffer.toString("base64");
    const imageDataObj = { base64CompString, filename, filesize };
    res.status(200).json({...imageDataObj,});
  } catch (error) {
    res.json({ message: "ok", error: err });
  }
}
