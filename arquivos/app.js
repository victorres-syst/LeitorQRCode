const video = document.getElementById('camera');
const startScanBtn = document.getElementById('start-scan');
const qrResult = document.getElementById('qr-result');
const productInfo = document.getElementById('product-info');

let scanning = false;
let stream;

// Função para abrir a câmera
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" } // câmera traseira
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Erro ao acessar a câmera: " + err);
  }
}

// Função para iniciar o scanner
function startScanner() {
  if (scanning) return;
  scanning = true;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  function scan() {
    if (!scanning) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      scanning = false;
      qrResult.textContent = code.data;
      fetchProductInfo(code.data); // Chama API com o valor lido
    } else {
      requestAnimationFrame(scan);
    }
  }

  scan();
}

// Função que chama a API de livros (OpenLibrary)
async function fetchProductInfo(isbn) {
  productInfo.innerHTML = "<p>🔄 Buscando informações...</p>";

  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const data = await res.json();

    if (Object.keys(data).length === 0) {
      productInfo.innerHTML = "<p>❌ Nenhuma informação encontrada.</p>";
      return;
    }

    const book = data[`ISBN:${isbn}`];
    productInfo.innerHTML = `
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.authors ? book.authors[0].name : "Não disponível"}</p>
      <p><strong>Publicado em:</strong> ${book.publish_date || "Não informado"}</p>
      ${book.cover ? `<img src="${book.cover.medium}" alt="Capa do livro">` : ""}
    `;
  } catch (err) {
    productInfo.innerHTML = "<p>⚠️ Erro ao buscar informações.</p>";
  }
}

// Inicia câmera ao abrir
startCamera();

// Clique do botão
startScanBtn.addEventListener("click", startScanner);
