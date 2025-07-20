#install node js dulu(minimal 18+)
#cek node js dengan sintaks berikut
node -v

#install cors
npm install cors

#buat api key 
https://aistudio.google.com/u/5/prompts/new_chat?pli=
#klik create api key -> pilih projek cloud, kalua belum ada bisa milih creaye api key in existing project
#copy api-key nya

#install dulu sdk buat google generative ai nya 
npm install @google/generative-ai

#buat folder gemini-flash-api
mkdir novi_gemini-flash-api

#masuk ke folder gemini-flash-api
cd novi_gemini-flash-api

#membuat package json otomatis
npm init -y

#jalankan berikut
#express untuk set up api nya
#dotenv untuk memasukkan api key gemininya dari .env
#@google/generative-ai untuk konek ke gimininya
#multer untuk upload filenya
npm install express dotenv @google/generative-ai multer

#buat env 
#GEMINI_API_KEY=

#buat index.js
#sisanya ada pada kode

#run codenya 
node index.js