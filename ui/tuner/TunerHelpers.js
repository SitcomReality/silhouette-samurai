export function createSectionHeader(container, title) {
  const el = document.createElement('div');
  el.className = 'tuner-section-header';
  el.textContent = title;
  container.appendChild(el);
}

export function createSlider(container, label, obj, key, min, max, step, onChange = null) {
  const div = document.createElement('div');
  div.className = 'tuner-control';
  const val = obj[key] !== undefined ? obj[key] : 0;
  div.innerHTML = `
    <label>${label} <span class="tuner-val">${val}</span></label>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${val}">
  `;
  const input = div.querySelector('input');
  const valDisplay = div.querySelector('.tuner-val');
  input.oninput = (e) => {
    const newVal = parseFloat(e.target.value);
    obj[key] = newVal;
    valDisplay.textContent = newVal;
    if (onChange) onChange(newVal);
  };
  container.appendChild(div);
}