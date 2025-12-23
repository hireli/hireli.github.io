document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('signature-pad');
  const ctx = canvas.getContext('2d');
  const clearBtn = document.getElementById('clear-btn');
  const generateBtn = document.getElementById('generate-btn');
  const unitInput = document.getElementById('unit-input');

  // 设置画笔样式
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';

  let isDrawing = false;

  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  // 绑定事件（支持鼠标和触摸）
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // 触摸屏支持
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
  });

  // 清除签名
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // 生成PDF
  generateBtn.addEventListener('click', () => {
    const unit = unitInput.value.trim();
    if (!unit) {
      alert('请输入单位名称！');
      return;
    }
    if (!ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)) {
      alert('请先完成签名！');
      return;
    }

    // 填充模板
    document.getElementById('filled-unit').textContent = unit;
    document.getElementById('signature-img').src = canvas.toDataURL('image/png');

    // 显示模板用于生成（临时）
    const template = document.getElementById('pdf-template').cloneNode(true);
    template.style.display = 'block';
    document.body.appendChild(template);

    // 生成PDF
    const element = template.querySelector('.notice');
    const opt = {
      margin: 10,
      filename: '外协入场安全告知书.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().finally(() => {
      document.body.removeChild(template);
    });
  });
});