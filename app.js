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
  const title = `${car.make} ${car.model}`;
  const subtitle = `${car.year} • ${car.km.toLocaleString()} km • ${car.fuel} • ${car.gearbox}`;
  const price = `€${car.price.toLocaleString()}`;

  return `
  <article class="flex gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(0,0,0,.45)]">
    <!-- left: image -->
    <a href="car.html?id=${car.id}" class="relative block h-40 w-56 shrink-0 bg-white/5">
      ${img ? `<img src="${img}" alt="${title}" class="h-full w-full object-cover" />` : ``}
      <div class="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-1 text-[11px] text-white backdrop-blur">
        ${car.fuel}
      </div>
    </a>

    <!-- middle: details -->
    <div class="flex min-w-0 flex-1 flex-col py-4">
      <a href="car.html?id=${car.id}" class="truncate text-base font-semibold tracking-tight text-white hover:text-white/90">
        ${title}
      </a>

      <div class="mt-1 text-xs text-slate-300">${subtitle}</div>

      <div class="mt-3 flex flex-wrap gap-2">
        <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
          ${car.location}
        </span>
        <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          Garage
        </span>
        <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          Verified
        </span>
      </div>

      <div class="mt-auto pt-3 text-[11px] text-slate-400">
        No sponsored results • Ranked by relevance
      </div>
    </div>

    <!-- right: price + CTA (autoscout-like) -->
    <div class="flex w-44 flex-col justify-between border-l border-white/10 p-4">
      <div class="text-right">
        <div class="text-lg font-semibold text-white">${price}</div>
        <div class="mt-1 text-[11px] text-slate-400">incl. VAT (if applicable)</div>
      </div>

      <div class="flex flex-col gap-2">
        <a href="car.html?id=${car.id}"
           class="inline-flex items-center justify-center rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90">
          View details
        </a>
        <a href="search.html"
           class="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5">
          Save
        </a>
      </div>
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
