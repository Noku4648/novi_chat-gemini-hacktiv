function tekan(namaInput) {
  console.log("Ditekan:", namaInput);
  const tombol = document.getElementById('id-tombol');
  const tombol2 = document.getElementById('id-tombol2');
  const tombol3 = document.getElementById('id-tombol3');

  if (namaInput === 'image') {
    audioInput.disabled = true;
    documentInput.disabled = true;
    tombol.classList.remove('btn-light');
    tombol.classList.add('btn-success');
  } else if (namaInput === 'audio') {
    imageInput.disabled = true;
    documentInput.disabled = true;
    tombol2.classList.remove('btn-light');
    tombol2.classList.add('btn-success');
  } else if (namaInput === 'document') {
    imageInput.disabled = true;
    audioInput.disabled = true;
    tombol3.classList.remove('btn-light');
    tombol3.classList.add('btn-success');
  }
}

const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const imageInput = document.getElementById('image-input');
const audioInput = document.getElementById('audio-input');
const documentInput = document.getElementById('document-input');

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const image_input = imageInput.files[0];
  const audio_input = audioInput.files[0];
  const document_input = documentInput.files[0];
  const userMessage = input.value.trim();
  const formData = new FormData();
  let keterangan = '';
  let prompt = '';
  let endpoint = '';
  // ini saya modif, kalau dia kirimin gambar, teks, audio sama pdf
  if(image_input||audio_input||document_input){  
    if(image_input){
      prompt = userMessage || 'Gambar apa ini';
      formData.append('image', image_input);
      keterangan =  '[Gambar diterima] ';
      endpoint = 'generate-from-image';
    }else if(audio_input){
      prompt = userMessage || 'Transkip Audio';  
      formData.append('audio', audio_input);
      endpoint = 'generate-from-audio';
      keterangan = '[Audio diterima] ';
    }else if(document_input){
      prompt = userMessage || 'Analisis dokumen';
      formData.append('document', document_input);
      keterangan = '[Document diterima] ';
      endpoint = 'generate-from-document';
    }
      appendMessage('user', keterangan + prompt);
      formData.append('prompt', prompt);
      fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        body: formData
      })
      
      .then(res => res.json())
      .then(data => {
        appendMessage('bot', data.output);
        input.value = ''; 
        imageInput.value = ''; 
        documentInput.value=''; 
        audioInput.value=''; 
        imageInput.disabled = false;
        audioInput.disabled = false;
        documentInput.disabled = false;
      })
      .catch(err => {
        console.error(err);
        appendMessage('bot', 'Gagal analisis gambar.');
      });
  }else{
    if (!userMessage) return;

    appendMessage('user', userMessage);
    input.value = '';

    // Kirim ke backend
    fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
      appendMessage('bot', data.reply);
      input.value = '';
    })
    .catch(error => {
      console.error('Error:', error);
      appendMessage('bot', 'Maaf, terjadi kesalahan.');
    });
  }

  
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
