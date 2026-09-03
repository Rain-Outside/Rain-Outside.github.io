// =========================================================
  // PASTE YOUR FREE TMDB API KEY HERE (themoviedb.org → Settings → API)
  // =========================================================
  const TMDB_API_KEY = "7ca1e2b3fc14651eea196eeb1b1e2049";
  const TMDB_BASE = "https://api.themoviedb.org/3";
  const IMG_POSTER = "https://image.tmdb.org/t/p/w342";
  const IMG_BACKDROP = "https://image.tmdb.org/t/p/w780";
  const IMG_BACKDROP_LG = "https://image.tmdb.org/t/p/original";
  const IMG_LOGO = "https://image.tmdb.org/t/p/w92";
  const USE_TMDB = TMDB_API_KEY.trim().length > 0;
  const REGION = "US"; // change to your country code, e.g. "GB", "IN", "DE"
  const WATCHING_STORAGE_KEY = 'wisent-watching-v1';
  let watchingItems = readWatchingItems();
  let activeWatchKey = null;
  let activeWatchStartedAt = null;
  let watchTick = null;

  function watchKey(d){ return `${d.type}:${d.id}`; }
  function readWatchingItems(){
    try{
      const saved = JSON.parse(localStorage.getItem(WATCHING_STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    }catch(e){ return []; }
  }
  function writeWatchingItems(){ localStorage.setItem(WATCHING_STORAGE_KEY, JSON.stringify(watchingItems)); }
  function rememberWatching(d){
    const key = watchKey(d);
    const existing = watchingItems.find(item => item.key === key);
    const record = { ...d, key, lastWatchedAt: Date.now(), progressSeconds: existing ? existing.progressSeconds : 0 };
    watchingItems = [record, ...watchingItems.filter(item => item.key !== key)].slice(0, 30);
    writeWatchingItems();
    renderWatchingRow();
  }
  function removeWatching(key){
    watchingItems = watchingItems.filter(item => item.key !== key);
    writeWatchingItems();
    renderWatchingRow();
  }
  function renderWatchingRow(){
    const row = document.getElementById('row-watching');
    if(!row) return;
    row.innerHTML = watchingItems.length ? watchingItems.map(d => pcardHTML(d, {watching:true})).join('') : '<div class="row-loading">Nothing here yet.</div>';
  }
  function updateWatchProgress(){
    if(!activeWatchKey) return;
    const item = watchingItems.find(entry => entry.key === activeWatchKey);
    if(!item) return;
    const elapsed = activeWatchStartedAt ? Math.floor((Date.now() - activeWatchStartedAt) / 1000) : 0;
    if(elapsed < 1) return;
    item.progressSeconds = (item.progressSeconds || 0) + elapsed;
    item.lastWatchedAt = Date.now();
    activeWatchStartedAt = Date.now();
    writeWatchingItems();
  }

  // ---------- NexStream embed player ----------
  // NexStream documents this iframe format:
  //   /embed/movie/{tmdbId}?apikey={YOUR_KEY}
  //   /embed/tv/{tmdbId}/{season}/{episode}?apikey={YOUR_KEY}
  //
  // The DEMO key below is for testing only. Replace it with the key
  // supplied to you by the embed service before deploying your site.
  const NEXSTREAM_BASE = "https://api.codespecters.com";
  const NEXSTREAM_API_KEY = "nx_48d3126d0f26d9055d08a1c034f5e81d";
  const NEXSTREAM_ENABLED = NEXSTREAM_API_KEY.trim().length > 0;

  function getEmbedUrl(d){
    if(!NEXSTREAM_ENABLED || !d || !d.id) return "";

    const id = encodeURIComponent(String(d.id));

    if(d.type === "tv"){
      // The current cards do not carry a season/episode yet.
      // Use S1E1 as the test episode; later this can be replaced
      // by a real episode selector.
      return `${NEXSTREAM_BASE}/embed/tv/${id}/1/1?apikey=${encodeURIComponent(NEXSTREAM_API_KEY)}`;
    }

    return `${NEXSTREAM_BASE}/embed/movie/${id}?apikey=${encodeURIComponent(NEXSTREAM_API_KEY)}`;
  }

  // ---------- sample fallback data ----------
  const TINTS = ["#3b0764","#4c1d95","#5b21b6","#6d28d9","#7c3aed","#581c87"];
  let DATA = [
    {id:2001,t:"Ion Storm",type:"tv",genre:"Sci-Fi",sub:"Series · 2025",badge:"NEW",rating:"8.1"},
    {id:2002,t:"Halcyon",type:"tv",genre:"Drama",sub:"Series · 2024",badge:"",rating:"7.6"},
    {id:2003,t:"Static Hearts",type:"movie",genre:"Romance",sub:"Film · 2026",badge:"TOP 10",rating:"7.2"},
    {id:2004,t:"Afterglow",type:"tv",genre:"Thriller",sub:"Series · 2025",badge:"",rating:"7.9"},
    {id:2005,t:"Drift",type:"movie",genre:"Documentary",sub:"Film · 2024",badge:"",rating:"8.3"},
    {id:2006,t:"Nightframe",type:"tv",genre:"Mystery",sub:"Series · 2026",badge:"NEW",rating:"7.4"},
    {id:2007,t:"Signal Loss",type:"tv",genre:"Sci-Fi",sub:"Series · 2025",badge:"",rating:"8.0"},
    {id:2008,t:"The Quiet Hour",type:"movie",genre:"Drama",sub:"Film · 2026",badge:"",rating:"7.8"},
    {id:2009,t:"Fault Lines",type:"tv",genre:"Crime",sub:"Series · 2024",badge:"",rating:"7.5"},
    {id:2010,t:"Paper Moons",type:"movie",genre:"Fantasy",sub:"Film · 2025",badge:"",rating:"7.1"}
  ];
  DATA.forEach((d,i) => d.tint = TINTS[i % TINTS.length]);
  let GENRES = [...new Set(DATA.map(d => d.genre))];

  // ---------- newly released titles used to auto-rotate the hero banner ----------
  const HERO_ROTATION_FALLBACK = [
    {id:3001,t:"Crimson Static",type:"movie",genre:"Action",sub:"Film · 2026",badge:"NEW",rating:"7.7",overview:"A getaway driver gets pulled into a heist that was never supposed to involve him."},
    {id:3002,t:"Glass Horizon",type:"tv",genre:"Sci-Fi",sub:"Series · 2026",badge:"NEW",rating:"8.2",overview:"A colony ship crew wakes up decades early with no idea why."},
    {id:3003,t:"Velvet Static",type:"movie",genre:"Thriller",sub:"Film · 2026",badge:"NEW",rating:"7.3",overview:"A journalist chases a story that keeps rewriting itself."},
    {id:3004,t:"Lowlight",type:"tv",genre:"Drama",sub:"Series · 2026",badge:"NEW",rating:"7.9",overview:"Three siblings inherit a failing family business, and each other's secrets."},
    {id:3005,t:"Nocturne Circuit",type:"movie",genre:"Fantasy",sub:"Film · 2026",badge:"NEW",rating:"7.5",overview:"A city where the streets rearrange themselves after midnight."},
    {id:3006,t:"Echo Frame",type:"tv",genre:"Mystery",sub:"Series · 2026",badge:"NEW",rating:"8.0",overview:"A detective who can only see the last five minutes of a crime scene."}
  ];
  HERO_ROTATION_FALLBACK.forEach((d,i) => d.tint = TINTS[(i+3) % TINTS.length]);

  function typeLabel(type){ return type === 'tv' ? 'TV Show' : 'Movie'; }
  function placeholderBg(d){ return `linear-gradient(160deg, ${d.tint}, #0f0a1c)`; }

  // ---------- generic card markup ----------
  function pcardHTML(d, opts){
    opts = opts || {};
    const bg = d.poster ? `background-image:url('${d.poster}')` : `background:${placeholderBg(d)}`;
    const rank = opts.rank ? `<div class="rank">#${String(opts.rank).padStart(2,'0')}</div>` : '';
    const watching = opts.watching ? `<button class="watching-remove" type="button" data-watch-key="${watchKey(d)}" aria-label="Remove ${d.t} from Watching">×</button><div class="watching-progress"><span style="width:${Math.min(100, (d.progressSeconds || 0) > 0 ? 12 : 0)}%"></span></div>` : '';
    return `
      <div class="pcard ${opts.rank ? 'top10' : ''} ${opts.watching ? 'watching-card' : ''}" data-id="${d.id}" data-type="${d.type}">
        ${rank}
        <div class="poster" style="${bg}">
          ${d.badge ? `<div class="badge">${d.badge}</div>` : ''}
        </div>
        ${watching}
        <div class="pinfo">
          <div class="t">${d.t}</div>
          <div class="s"><span class="r">★ ${d.rating || '—'}</span> · ${d.sub}</div>
        </div>
      </div>`;
  }

  // ---------- row arrow scrolling ----------
  document.querySelectorAll('.row-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = document.getElementById(btn.dataset.target);
      const dx = row.clientWidth * 0.8 * (btn.classList.contains('left') ? -1 : 1);
      row.scrollBy({left: dx, behavior:'smooth'});
    });
  });

  // ---------- nav scroll shadow ----------
  const navEl = document.getElementById('mainNav');
  window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 40), {passive:true});

  // ---------- hero ----------
  function paintHero(d){
    const heroSection = document.getElementById('heroSection');
    document.getElementById('heroSkeleton').style.display = 'none';
    if(d.backdropLg || d.backdrop){
      heroSection.style.backgroundImage = `url('${d.backdropLg || d.backdrop}')`;
    } else {
      heroSection.style.background = placeholderBg(d);
    }
    document.getElementById('heroBadges').innerHTML = `
      <span class="rating">★ ${d.rating || '—'}</span>
      <span>${(d.year || '')}</span>
      <span class="pill">${d.genre}</span>
      <span class="pill">${typeLabel(d.type)}</span>`;
    document.getElementById('heroTitle').textContent = d.t;
    document.getElementById('heroOverview').textContent = d.overview || 'No synopsis available yet for this title.';
    document.getElementById('heroPlay').onclick = () => openPlayer(d);
    document.getElementById('heroInfo').onclick = () => openPlayer(d);
  }

  // ---------- hero auto-rotation (every 3s, horizontal slide) ----------
  let heroPool = [];
  let heroIndex = 0;
  let heroPaused = false;
  let heroTimer = null;

  function renderHeroDots(){
    const dotsEl = document.getElementById('heroDots');
    dotsEl.innerHTML = heroPool.map((_, i) => `<div class="dot ${i === heroIndex ? 'active' : ''}" data-i="${i}"></div>`).join('');
    dotsEl.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => goToHero(parseInt(dot.dataset.i, 10)));
    });
  }
  function goToHero(i){
    if(!heroPool.length) return;
    heroIndex = (i + heroPool.length) % heroPool.length;
    const content = document.getElementById('heroContent');
    content.classList.add('slide-out');
    setTimeout(() => {
      paintHero(heroPool[heroIndex]);
      renderHeroDots();
      content.classList.remove('slide-out');
      content.classList.add('slide-in');
      requestAnimationFrame(() => requestAnimationFrame(() => content.classList.remove('slide-in')));
    }, 450);
  }
  function startHeroRotation(pool){
    if(!pool || !pool.length) return;
    heroPool = pool;
    heroIndex = 0;
    paintHero(heroPool[0]);
    renderHeroDots();
    const heroSection = document.getElementById('heroSection');
    heroSection.addEventListener('mouseenter', () => heroPaused = true);
    heroSection.addEventListener('mouseleave', () => heroPaused = false);
    if(heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      if(heroPaused) return;
      goToHero(heroIndex + 1);
    }, 3000);
  }

  // ---------- click any card → provider modal ----------
  function findInAny(id, type){
    const pools = [DATA, watchingItems, heroPool, ...Object.values(ROW_CACHE)];
    for(const pool of pools){
      const hit = pool.find(x => String(x.id) === String(id) && (!type || x.type === type));
      if(hit) return hit;
    }
    return null;
  }
  document.addEventListener('click', (e) => {
    const removeButton = e.target.closest('.watching-remove');
    if(removeButton){ e.stopPropagation(); removeWatching(removeButton.dataset.watchKey); return; }
    const el = e.target.closest('.pcard');
    if(!el) return;
    const d = findInAny(el.dataset.id, el.dataset.type);
    if(d) openPlayer(d);
  });

  // ---------- search overlay ----------
  const overlay = document.getElementById('searchOverlay');
  const bigInput = document.getElementById('bigSearchInput');
  const navInput = document.getElementById('navSearchInput');
  const resultsEl = document.getElementById('searchResults');
  const emptyEl = document.getElementById('searchEmpty');
  const chipsEl = document.getElementById('genreChips');
  let activeGenre = null;

  function renderChips(){
    chipsEl.innerHTML = GENRES.map(g => `<div class="chip" data-genre="${g}">${g}</div>`).join('');
    chipsEl.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeGenre = activeGenre === chip.dataset.genre ? null : chip.dataset.genre;
        chipsEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.genre === activeGenre));
        runSearch();
      });
    });
  }

  let searchTimer = null;
  function runSearch(){
    const q = bigInput.value.trim();
    if(USE_TMDB && q.length > 0){
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => tmdbSearch(q), 300);
      return;
    }
    const ql = q.toLowerCase();
    const filtered = DATA.filter(d => {
      const matchesName = ql === '' || d.t.toLowerCase().includes(ql);
      const matchesGenre = !activeGenre || d.genre === activeGenre;
      return matchesName && matchesGenre;
    });
    paintResults(filtered);
  }
  function paintResults(items){
    if(items.length === 0){ resultsEl.innerHTML = ''; emptyEl.style.display = 'block'; }
    else { emptyEl.style.display = 'none'; resultsEl.innerHTML = items.map(d => pcardHTML(d)).join(''); }
  }
  async function tmdbSearch(query){
    try{
      const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
      const json = await res.json();
      let items = (json.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv').map(r => mapTmdbItem(r, r.media_type));
      if(activeGenre) items = items.filter(d => d.genre === activeGenre);
      ROW_CACHE.search = items;
      paintResults(items);
    }catch(e){ paintResults([]); }
  }
  function openSearch(prefill){
    overlay.classList.add('open'); bigInput.value = prefill || ''; runSearch();
    setTimeout(()=> bigInput.focus(), 50);
  }
  function closeSearch(){ overlay.classList.remove('open'); }
  navInput.addEventListener('focus', () => openSearch(navInput.value));
  navInput.addEventListener('input', () => { bigInput.value = navInput.value; if(!overlay.classList.contains('open')) overlay.classList.add('open'); runSearch(); });
  bigInput.addEventListener('input', runSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape'){ closeSearch(); closePlayer(); } });
  window.addEventListener('pagehide', updateWatchProgress);

  // ---------- provider modal ----------
  const playerModal = document.getElementById('playerModal');
  const ppMedia = document.getElementById('ppMedia');
  const ppTitle = document.getElementById('ppTitle');
  const ppMeta = document.getElementById('ppMeta');
  const ppLoading = document.getElementById('ppLoading');
  const ppProviders = document.getElementById('ppProviders');
  const ppAttribution = document.getElementById('ppAttribution');

  function providerBtn(p, tmdbLink){
    const logo = p.logo_path ? `<img src="${IMG_LOGO}${p.logo_path}" alt="${p.provider_name}">` : '';
    return `<a class="provider-btn" href="${tmdbLink}" target="_blank" rel="noopener">${logo}${p.provider_name}</a>`;
  }
  async function loadProviders(d){
    ppLoading.style.display = 'block'; ppLoading.textContent = 'Looking up where to watch…';
    ppProviders.innerHTML = ''; ppAttribution.style.display = 'none';
    if(!USE_TMDB){ ppLoading.textContent = 'Add your TMDB API key to look up real streaming providers for this title.'; return; }
    try{
      const type = d.type === 'tv' ? 'tv' : 'movie';
      const res = await fetch(`${TMDB_BASE}/${type}/${d.id}/watch/providers?api_key=${TMDB_API_KEY}`);
      const json = await res.json();
      const region = json.results && json.results[REGION];
      if(!region){ ppLoading.textContent = `Not currently available on a tracked streaming service in ${REGION}.`; return; }
      const link = region.link;
      let html = '';
      if(region.flatrate && region.flatrate.length) html += `<div class="provider-kind">Stream</div><div class="pp-providers">${region.flatrate.map(p=>providerBtn(p,link)).join('')}</div>`;
      if(region.rent && region.rent.length) html += `<div class="provider-kind">Rent</div><div class="pp-providers">${region.rent.map(p=>providerBtn(p,link)).join('')}</div>`;
      if(region.buy && region.buy.length) html += `<div class="provider-kind">Buy</div><div class="pp-providers">${region.buy.map(p=>providerBtn(p,link)).join('')}</div>`;
      if(!html){ ppLoading.textContent = `No streaming, rental, or purchase options found in ${REGION}.`; return; }
      ppLoading.style.display = 'none'; ppProviders.innerHTML = html; ppAttribution.style.display = 'block';
    }catch(e){ ppLoading.textContent = 'Could not load streaming providers right now.'; }
  }
  function openPlayer(d){
    rememberWatching(d);
    activeWatchKey = watchKey(d);
    activeWatchStartedAt = Date.now();
    clearInterval(watchTick);
    watchTick = setInterval(updateWatchProgress, 10000);
    const embedUrl = getEmbedUrl(d);

    // Open the external player in the SAME TAB / current window.
    // This replaces the site page with the full player instead of
    // showing the player inside the small details modal.
    if(embedUrl){
      window.location.href = embedUrl;
      return;
    }

    // Fallback to the original modal when no embed URL is configured.
    ppTitle.textContent = d.t;
    ppMeta.textContent = `${d.genre} · ${d.sub}`;
    playerModal.classList.add('open');
    ppMedia.classList.remove('has-embed');
    ppMedia.innerHTML = '';
    ppMedia.style.backgroundImage = d.backdrop ? `url('${d.backdrop}')` : (d.poster ? `url('${d.poster}')` : 'none');
    ppMedia.style.backgroundColor = '#1a1230';
    loadProviders(d);
  }
  function closePlayer(){
    clearInterval(watchTick);
    watchTick = null;
    activeWatchKey = null;
    activeWatchStartedAt = null;
    playerModal.classList.remove('open');
    ppMedia.innerHTML = '';
    ppMedia.classList.remove('has-embed');
  }
  document.getElementById('ppClose').addEventListener('click', closePlayer);
  playerModal.addEventListener('click', (e) => { if(e.target === playerModal) closePlayer(); });

  // ---------- TMDB integration ----------
  const MOVIE_GENRES = {}; const TV_GENRES = {};
  const ROW_CACHE = { trending:[], newweek:[], toprated_movie:[], toprated_tv:[], genre:[], watching:[] };

  function mapTmdbItem(r, forcedType){
    const type = forcedType || (r.title ? 'movie' : 'tv');
    const genreMap = type === 'tv' ? TV_GENRES : MOVIE_GENRES;
    const gid = (r.genre_ids && r.genre_ids[0]);
    const genre = genreMap[gid] || 'General';
    const date = r.release_date || r.first_air_date || '';
    const year = date ? date.slice(0,4) : '—';
    const isNew = date && (new Date() - new Date(date)) < (1000*60*60*24*60);
    return {
      id:r.id, t:r.title || r.name, type, genre,
      sub: `${typeLabel(type)} · ${year}`, year,
      badge: isNew ? 'NEW' : '',
      rating: r.vote_average ? r.vote_average.toFixed(1) : null,
      overview: r.overview,
      poster: r.poster_path ? IMG_POSTER + r.poster_path : null,
      backdrop: r.backdrop_path ? IMG_BACKDROP + r.backdrop_path : null,
      backdropLg: r.backdrop_path ? IMG_BACKDROP_LG + r.backdrop_path : null
    };
  }

  async function loadGenres(){
    const [mg, tg] = await Promise.all([
      fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}`).then(r=>r.json()),
      fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_API_KEY}`).then(r=>r.json())
    ]);
    (mg.genres||[]).forEach(g => MOVIE_GENRES[g.id] = g.name);
    (tg.genres||[]).forEach(g => TV_GENRES[g.id] = g.name);
    GENRES = [...new Set([...Object.values(MOVIE_GENRES), ...Object.values(TV_GENRES)])].slice(0,16);

    const sel = document.getElementById('genreSelect');
    sel.innerHTML = Object.entries(MOVIE_GENRES).map(([id,name]) => `<option value="${id}" ${name==='Comedy'?'selected':''}>${name}</option>`).join('');
    sel.addEventListener('change', () => loadGenreRow(sel.value, MOVIE_GENRES[sel.value]));
  }

  async function fetchList(url){
    try{ const res = await fetch(url + `&api_key=${TMDB_API_KEY}`); const json = await res.json(); return json.results || []; }
    catch(e){ return []; }
  }

  function renderRow(elId, items){
    const el = document.getElementById(elId);
    el.innerHTML = items.length ? items.map(d => pcardHTML(d)).join('') : `<div class="row-loading">Nothing found.</div>`;
  }
  function renderRowWithFilter(elId, cacheKeyPrefix, filter){
    let items;
    if(filter === 'all') items = [...(ROW_CACHE[cacheKeyPrefix+'_movie']||[]), ...(ROW_CACHE[cacheKeyPrefix+'_tv']||[])];
    else items = ROW_CACHE[cacheKeyPrefix+'_'+filter] || [];
    renderRow(elId, items.slice(0,16));
  }

  async function loadGenreRow(genreId, genreName){
    document.getElementById('genreRowTitle').textContent = genreName || 'Genre';
    document.getElementById('row-genre').innerHTML = `<div class="row-loading">Loading…</div>`;
    const results = await fetchList(`${TMDB_BASE}/discover/movie?sort_by=popularity.desc&with_genres=${genreId}`);
    const items = results.map(r => mapTmdbItem(r, 'movie'));
    ROW_CACHE.genre = items;
    renderRow('row-genre', items.slice(0,16));
  }

  async function loadFromTmdb(){
    await loadGenres();
    renderWatchingRow();

    // Hero rotation + Top 10 from trending/day
    const trendDay = await fetchList(`${TMDB_BASE}/trending/all/day?`);
    if(trendDay.length === 0){
      // TMDB returned nothing — likely an invalid/missing API key. Bail out to sample data.
      throw new Error('TMDB returned no results (check TMDB_API_KEY)');
    }
    const heroItems = trendDay.filter(r => r.backdrop_path).map(r => mapTmdbItem(r, r.media_type));
    startHeroRotation(heroItems.slice(0,6));
    const top10 = heroItems.slice(0,10);
    document.getElementById('row-top10').innerHTML = top10.map((d,i) => pcardHTML(d, {rank:i+1})).join('');
    ROW_CACHE.top10 = top10;

    // Trending Today (movies + tv split)
    const trendWeek = await fetchList(`${TMDB_BASE}/trending/all/week?`);
    const trendMapped = trendWeek.map(r => mapTmdbItem(r, r.media_type));
    ROW_CACHE.trending_movie = trendMapped.filter(d => d.type === 'movie');
    ROW_CACHE.trending_tv = trendMapped.filter(d => d.type === 'tv');
    renderRowWithFilter('row-trending', 'trending', 'all');

    // New This Week
    const [nowMovies, onAirTv] = await Promise.all([
      fetchList(`${TMDB_BASE}/movie/now_playing?`),
      fetchList(`${TMDB_BASE}/tv/on_the_air?`)
    ]);
    ROW_CACHE.newweek_movie = nowMovies.map(r => mapTmdbItem(r,'movie'));
    ROW_CACHE.newweek_tv = onAirTv.map(r => mapTmdbItem(r,'tv'));
    renderRowWithFilter('row-newweek', 'newweek', 'all');

    // Top Rated
    const [topMovies, topTv] = await Promise.all([
      fetchList(`${TMDB_BASE}/movie/top_rated?`),
      fetchList(`${TMDB_BASE}/tv/top_rated?`)
    ]);
    ROW_CACHE.toprated_movie = topMovies.map(r => mapTmdbItem(r,'movie'));
    ROW_CACHE.toprated_tv = topTv.map(r => mapTmdbItem(r,'tv'));
    renderRowWithFilter('row-toprated', 'toprated', 'movie');

    // Genre row default (Comedy)
    const comedyId = Object.keys(MOVIE_GENRES).find(id => MOVIE_GENRES[id] === 'Comedy');
    if(comedyId) loadGenreRow(comedyId, 'Comedy');

    DATA = [...trendMapped, ...ROW_CACHE.newweek_movie, ...ROW_CACHE.newweek_tv, ...ROW_CACHE.toprated_movie, ...ROW_CACHE.toprated_tv];
    renderChips();
  }

  function loadFallback(){
    document.getElementById('dataBanner').classList.add('show');
    renderWatchingRow();
    startHeroRotation(HERO_ROTATION_FALLBACK);
    document.getElementById('row-top10').innerHTML = DATA.slice(0,8).map((d,i) => pcardHTML(d,{rank:i+1})).join('');
    document.getElementById('row-trending').innerHTML = DATA.map(d => pcardHTML(d)).join('');
    document.getElementById('row-newweek').innerHTML = DATA.slice().reverse().map(d => pcardHTML(d)).join('');
    document.getElementById('row-toprated').innerHTML = DATA.filter(d=>d.type==='movie').map(d => pcardHTML(d)).join('');
    document.getElementById('genreRowTitle').textContent = 'Sci-Fi';
    document.getElementById('row-genre').innerHTML = DATA.filter(d=>d.genre==='Sci-Fi').map(d => pcardHTML(d)).join('');
    document.getElementById('genreSelect').innerHTML = GENRES.map(g => `<option>${g}</option>`).join('');
    renderChips();
    // disable row toggles / genre select interactivity gracefully in fallback mode
    document.querySelectorAll('.row-toggle button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll(`.row-toggle[data-row="${b.parentElement.dataset.row}"] button`).forEach(x=>x.classList.toggle('active', x===b));
    }));
  }

  // row toggle buttons (Movies/Series per row)
  document.querySelectorAll('.row-toggle').forEach(group => {
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        const rowKey = group.dataset.row;
        const elId = 'row-' + rowKey;
        renderRowWithFilter(elId, rowKey, btn.dataset.type);
      });
    });
  });

  // top nav Home/Movies/TV Series — scroll to browse
  document.querySelectorAll('.nav-links .tablink').forEach(a => a.addEventListener('click', () => {
    document.querySelectorAll('.nav-links .tablink').forEach(x => x.classList.toggle('active', x===a));
    document.getElementById('browse').scrollIntoView({behavior:'smooth'});
  }));

  if(USE_TMDB){ loadFromTmdb().catch((e) => { console.error('TMDB load failed:', e); loadFallback(); }); }
  else { loadFallback(); }
