async function loadCars() {
  const res = await fetch('cars.json', { cache: 'no-store' });
  return await res.json();
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function uniq(arr) {
  return [...new Set(arr)].sort();
}

function renderCard(car) {
  const img = car.images?.[0] || "";
  return `
    <article class="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(0,0,0,.45)]">
      <div class="h-44 bg-white/5">
        ${img ? `<img src="${img}" alt="" class="h-full w-full object-cover" />` : ``}
      </div>
      <div class="p-4">
        <h3 class="text-base font-semibold tracking-tight">${car.make} ${car.model}</h3>
        <div class="mt-2 text-xs text-slate-300">${car.year} • ${car.km.toLocaleString()} km • ${car.fuel} • ${car.gearbox}</div>
        <div class="mt-3 text-lg font-semibold">€${car.price.toLocaleString()}</div>
        <div class="mt-1 text-xs text-slate-400">${car.location}</div>
        <a class="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90"
           href="car.html?id=${car.id}">
          View
        </a>
      </div>
    </article>
  `;
}


function applyFilters(cars) {
  const make = document.getElementById('make')?.value || '';
  const fuel = document.getElementById('fuel')?.value || '';
  const gearbox = document.getElementById('gearbox')?.value || '';
  const minPrice = Number(document.getElementById('minPrice')?.value || 0);
  const maxPrice = Number(document.getElementById('maxPrice')?.value || 1e12);
  const maxKm = Number(document.getElementById('maxKm')?.value || 1e12);
  const minYear = Number(document.getElementById('minYear')?.value || 0);

  return cars.filter(c =>
    (!make || c.make === make) &&
    (!fuel || c.fuel === fuel) &&
    (!gearbox || c.gearbox === gearbox) &&
    (c.price >= minPrice && c.price <= maxPrice) &&
    (c.km <= maxKm) &&
    (c.year >= minYear)
  );
}

async function initSearch() {
  const cars = await loadCars();

  // populate make dropdown
  const makeSel = document.getElementById('make');
  if (makeSel) {
    const makes = uniq(cars.map(c => c.make));
    makes.forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      makeSel.appendChild(o);
    });
  }

  const results = document.getElementById('results');
  const btn = document.getElementById('apply');

  function render() {
    const filtered = applyFilters(cars);
    results.innerHTML = filtered.map(renderCard).join('');
  }

  btn?.addEventListener('click', render);
  render();
}

async function initCarPage() {
  const id = Number(qs('id'));
  if (!id) return;

  const cars = await loadCars();
  const car = cars.find(c => c.id === id);
  const el = document.getElementById('car');
  if (!el) return;

  if (!car) {
    el.innerHTML = `<p>Car not found.</p>`;
    return;
  }

  const imgs = (car.images || []).map(src => `<img class="detail-img" src="${src}" alt="">`).join('');
  el.innerHTML = `
    <h1>${car.make} ${car.model}</h1>
    <div class="detail-grid">
      <div>${imgs}</div>
      <div class="panel">
        <div class="price big">€${car.price.toLocaleString()}</div>
        <div class="meta">${car.year} • ${car.km.toLocaleString()} km</div>
        <div class="meta">${car.fuel} • ${car.gearbox} • ${car.location}</div>
        <p>${car.description || ''}</p>
        <hr/>
        <h3>${car.garage?.name || 'Garage'}</h3>
        <a class="btn" href="tel:${(car.garage?.phone||'').replace(/\s/g,'')}">Call</a>
        <a class="btn" href="mailto:${car.garage?.email || ''}?subject=Interest%20in%20${encodeURIComponent(car.make+' '+car.model)}">Email</a>
      </div>
    </div>
  `;
}

// decide which page we’re on
if (location.pathname.endsWith('search.html')) initSearch();
if (location.pathname.endsWith('car.html')) initCarPage();
