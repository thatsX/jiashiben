function showModal(html) {
  document.getElementById('modal-text').innerHTML = html;
  document.getElementById('modal').classList.add('show');

  const btn = document.getElementById('modal-btn');
  btn.style.display = 'block';
  btn.textContent = '继续';
  btn.onclick = closeModal;
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function showConfirm(text, onYes, onNo) {
  document.getElementById('modal-text').innerHTML = `
    <p style="font-size:14px;text-align:center;padding:10px 0;line-height:1.7">${text}</p>
    <button id="confirm-yes" style="width:100%;margin-top:4px;background:#ffd54f">继续结算</button>
    <button id="confirm-no" style="width:100%;margin-top:8px;background:#e0e0e0">取消</button>
  `;
  document.getElementById('modal').classList.add('show');

  const btn = document.getElementById('modal-btn');
  btn.style.display = 'none';

  document.getElementById('confirm-yes').onclick = () => {
    closeModal();
    if (onYes) onYes();
  };
  document.getElementById('confirm-no').onclick = () => {
    closeModal();
    if (onNo) onNo();
  };
}