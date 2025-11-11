function previewImagens(fileList) {
  try {
    const preview = document.getElementById('previewChecklistImagens');
    if (!preview) return console.warn('Container de preview não encontrado: #previewChecklistImagens');

    preview.innerHTML = '';

    const files = fileList instanceof FileList ? fileList : (fileList.files || []);
    if (!files.length) {
      preview.textContent = 'Nenhuma imagem selecionada.';
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) {
        console.warn('Arquivo não é imagem, ignorando:', f.name);
        continue;
      }

      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      img.alt = f.name;
      img.className = 'preview-thumb';
      img.style.maxWidth = '480px';
      img.style.maxHeight = '480px';
      img.style.objectFit = 'cover';
      img.style.marginRight = '8px';
      img.style.marginBottom = '8px';
      
      preview.appendChild(img);
    }
  } catch (err) {
    console.error('Erro em previewImagens:', err);
  }
}