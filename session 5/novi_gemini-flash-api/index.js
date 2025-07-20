// ini untuk library
// untuk library membuat server
const express = require('express');
// mengizinkan front end untuk akses api dari domain lain
const cors = require('cors');
// library baca file
const dotenv = require('dotenv');
// library upload
const multer = require('multer');
// library bawaan node js untuk manipulasi file
const fs = require('fs');
// library untuk membaca letak file
const path = require('path');
// libary untuk ai nya
const { GoogleGenerativeAI} = require('@google/generative-ai');

// untuk membaca file env ke dalam proses
dotenv.config();
// untuk membuat routing nya
const app = express();
// memakai cors
app.use(cors());
// untuk membaca json di body request
app.use(express.json());
// mengambil frontend
app.use(express.static('public'));

// membaca api key dari env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// memakai model gemini 1.5 flash
const model = genAI.getGenerativeModel({model : 'models/gemini-1.5-flash'});
// untuk mengelola file upload pada folder uplaod
const upload = multer({dest:'uploads/'});
// port untuk menjalankan server
// const PORT = 3000;
const port = process.env.PORT||3000;

// menyalakan server
// app.listen(PORT, ()=>{
// 	console.log(`Gemini API Server running pada http://localhost:${PORT}`);
// });

app.listen(port, ()=>{
	console.log(`Gemini API Server running pada http://localhost:${port}`);
});
// ini untuk chat
app.post('/api/chat',async(req,res)=>{
	// ngambil imputan user
	const userMessage = req.body.message;
	// kalau g ada inputannya
	if(!userMessage){
		return res.status(400).json({reply:"Message is required."});
	}
	try{
		// manggil model
		const result = await model.generateContent(userMessage);
		// manggil respon chat ai
		const response = await result.response;
		// hasil chat ai
		const text = response.text();
		// dikembalikan hasilnya lewat json
		res.json({reply:text});
	}catch(error){
		// melihat error lewat console/prompt
		console.error(error);
		res.status(500).json({reply:"Ada yg salah"});	
	}
});


// fungsi untuk membaca image dan ubah ke text
function imageToGenerativePart(imagePath){
	// mengembalikan data image
	return {
		// mengembalikan data dari upload bukan url
		inlineData:{
			// baca data dari path, ubah ke base64
			data: Buffer.from(fs.readFileSync(imagePath)).toString('base64'),
			// gambar yang diterima, 
			// tp karena multer ubah ke base 64 dan g ada eksistensi, 
			// jadi semuanya bisa diterima walau keterangannya jpeg
			mimeType:'image/jpeg',
		},
	};
}


// untuk menerima permintaan dari user
app.post('/generate-text',async(req,res)=>{

	// mengambil permintaan dari prompt dalam bentuk json
	const {prompt} = req.body;
	
	try{
		// kirim permintaan ke model gemini
		const result = await model.generateContent(prompt);
		// tunggu hasil permintaan dari gemini
		const response = await result.response;
		// hasil dari gemini dalam format json
		res.json({output:response.text()});

	}catch(error){
		// kalau error atau g ditemukan permintaannya
		res.status(500).json({error:error.message});
	}
});

app.post('/generate-from-image',upload.single('image'),async(req,res)=>{

	// mengambil permintaan dari prompt dalam bentuk json
	const prompt = req.body.prompt||'Describe the image';
	// membaca image dari path
	const image = imageToGenerativePart(req.file.path);

	try{
		// kirim permintaan ke model gemini
		const result = await model.generateContent([prompt,image]);
		// tunggu hasil permintaan dari gemini
		const response = await result.response;
		// hasil dari gemini dalam format json
		res.json({output:response.text()});

	}catch(error){
		// kalau error atau g ditemukan permintaannya
		res.status(500).json({error:error.message});
	}finally{
		// untuk menghapus foto setelah dipakai
		fs.unlinkSync(req.file.path);
	}

});


// menerima inputan dokumen
app.post('/generate-from-document',upload.single('document'),async(req,res)=>{

	// membaca lokasi
	const filepath = req.file.path;
	// membaca file
	const buffer = fs.readFileSync(filepath);
	// ubah file ke enkripsi base64
	const base64Data = buffer.toString('base64');
	// membaca ekstensi
	const mimeType = req.file.mimetype;
	const prompt = req.body.prompt||'Analisis dokumen';
	try{
		// membaca data dari file inputan
		const documentPart={
			inlineData: {data:base64Data,mimeType}
		};
		// kirim permintaan ke model gemini
		const result = await model.generateContent([prompt,documentPart]);
		// tunggu hasil permintaan dari gemini
		const response = await result.response;
		// hasil dari gemini dalam format json
		res.json({output:response.text()});

	}catch(error){
		// kalau error atau g ditemukan permintaannya
		res.status(500).json({error:error.message});
	}finally{
		// untuk menghapus dokumen setelah dipakai
		fs.unlinkSync(req.file.path);
	}

});


// menerima inputan audio
app.post('/generate-from-audio',upload.single('audio'),async(req,res)=>{


	const audiobuffer = fs.readFileSync(req.file.path);
	// ubah file ke enkripsi base64
	const base64Audio= audiobuffer.toString('base64');
	const prompt = req.body.prompt||'Transkip audio';
	// membaca ekstensi
	const audioPart={
		inlineData:{
			data:base64Audio,
			mimeType: req.file.mimetype
		}
	}

	try{
		
		// kirim permintaan ke model gemini
		const result = await model.generateContent([prompt, audioPart]);
		// tunggu hasil permintaan dari gemini
		const response = await result.response;
		// hasil dari gemini dalam format json
		res.json({output:response.text()});

	}catch(error){
		// kalau error atau g ditemukan permintaannya
		res.status(500).json({error:error.message});
	}finally{
		// untuk menghapus audio setelah dipakai
		fs.unlinkSync(req.file.path);
	}

});
