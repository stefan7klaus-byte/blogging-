const searchInput = document.getElementById('siteSearch');

async function loadSupabaseContent() {
  if (!window.supabase || !window.ZENITH_SUPABASE) return;
  const client = window.supabase.createClient(
    window.ZENITH_SUPABASE.url,
    window.ZENITH_SUPABASE.publishableKey
  );
  const { data: articles, error } = await client
    .from('articles')
    .select('id,title,slug,excerpt,author_name,published_at,categories(name,slug)')
    .eq('published', true)
    .order('published_at', { ascending: false });
  if (error || !articles?.length) return;

  const grid = document.querySelector('.article-grid');
  if (!grid) return;
  grid.innerHTML = articles.map(article => {
    const category = article.categories?.name || 'INTELLIGENCE';
    const excerpt = article.excerpt || 'Read the latest Zenith Hackers Intelligence analysis.';
    const href = article.slug ? `articles/${encodeURIComponent(article.slug)}.html` : '#research';
    return `<article class="article-card glass">
      <span class="tag">${escapeHtml(category)}</span>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(excerpt)}</p>
      <a href="${href}">Read analysis →</a>
    </article>`;
  }).join('');

  attachSearch();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[char]));
}

function attachSearch() {
  const cards = [...document.querySelectorAll('.article-card')];
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    cards.forEach(card => {
      card.hidden = q && !card.textContent.toLowerCase().includes(q);
    });
  });
}
attachSearch();
loadSupabaseContent();

const chatForm=document.getElementById('chatForm');
chatForm?.addEventListener('submit',async(e)=>{
 e.preventDefault();
 const input=document.getElementById('chatInput'), box=document.getElementById('chatMessages');
 const q=input.value.trim(); if(!q)return;
 box.insertAdjacentHTML('beforeend', '<div class="chat-msg user"></div>');
 box.lastElementChild.textContent=q; input.value='';
 const loading=document.createElement('div'); loading.className='chat-msg assistant'; loading.textContent='Thinking…'; box.appendChild(loading);
 try{
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});
  const data=await res.json(); loading.textContent=data.reply||data.error||'No response received.';
 }catch(err){loading.textContent='The AI service is not configured yet. Add OPENAI_API_KEY to the server environment.';}
});
