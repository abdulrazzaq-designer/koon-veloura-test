export default function initVelouraCartBanners() {
  const block = document.querySelector('[data-veloura-cart-banners]');
  if (!block) return;
  const normalize = (v) => String(v || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬,]/g, '').replace(/[^0-9.]/g, '');
  const min = Number(normalize(block.dataset.minTotal)) || 0;
  const totalEl = document.querySelector('[data-cart-total]');
  const total = Number(normalize(totalEl?.textContent)) || 0;
  if (total < min) { block.remove(); return; }
  const main = document.querySelector('.main-content');
  const submit = document.querySelector('.cart-submit-wrap');
  const pos = block.dataset.position;
  if (pos === 'after_checkout_button' && submit) submit.insertAdjacentElement('afterend', block);
  else if (pos === 'before_products' && main) main.insertAdjacentElement('afterbegin', block);
  else if (main) {
    const offer = main.querySelector('salla-offer');
    if (offer) offer.insertAdjacentElement('beforebegin', block); else main.appendChild(block);
  }
}
