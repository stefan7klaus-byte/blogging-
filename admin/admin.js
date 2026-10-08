const client = window.supabase.createClient(
  window.ZENITH_SUPABASE.url,
  window.ZENITH_SUPABASE.publishableKey
);

const loginPanel = document.getElementById('loginPanel');
const editorPanel = document.getElementById('editorPanel');
const loginForm = document.getElementById('loginForm');
const editorForm = document.getElementById('editorForm');
const statusEl = document.getElementById('status');
const articleList = document.getElementById('articleList');
const logoutBtn = document.getElementById('logoutBtn');
const newBtn = document.getElementById('newBtn');
let editingId = null;

function setStatus(message, error=false) {
  statusEl.textContent = message;
  statusEl.className = error ? 'status error' : 'status';
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

async function loadCategories() {
  const {data,error}=await client.from('categories').select('id,name').order('name');
  if(error) return setStatus(error.message,true);
  const select=document.getElementById('category_id');
  select.innerHTML='<option value="">Select category</option>'+(data||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadArticles() {
  const {data,error}=await client.from('articles').select('id,title,slug,published,published_at,updated_at,categories(name)').order('updated_at',{ascending:false});
  if(error) return setStatus(error.message,true);
  articleList.innerHTML=(data||[]).map(a=>`<div class="admin-row"><div><strong>${escapeHtml(a.title)}</strong><small>${a.categories?.name||'Uncategorized'} · ${a.published?'Published':'Draft'}</small></div><button data-edit="${a.id}" class="button secondary">Edit</button></div>`).join('')||'<p>No articles yet.</p>';
  articleList.querySelectorAll('[data-edit]').forEach(btn=>btn.addEventListener('click',()=>editArticle(btn.dataset.edit)));
}

async function editArticle(id) {
  const {data,error}=await client.from('articles').select('*').eq('id',id).single();
  if(error) return setStatus(error.message,true);
  editingId=id;
  for(const key of ['title','slug','excerpt','content','author_name','cover_image','category_id']) document.getElementById(key).value=data[key]||'';
  document.getElementById('published').checked=!!data.published;
  document.getElementById('deleteBtn').hidden=false;
  document.getElementById('formTitle').textContent='Edit article';
  window.scrollTo({top:0,behavior:'smooth'});
}

newBtn.addEventListener('click',()=>{
  editingId=null; editorForm.reset(); document.getElementById('author_name').value='Zenith Hackers Intelligence';
  document.getElementById('deleteBtn').hidden=true; document.getElementById('formTitle').textContent='New article';
  setStatus('');
});

document.getElementById('title').addEventListener('input',e=>{
  if(!editingId) document.getElementById('slug').value=slugify(e.target.value);
});

editorForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const published=document.getElementById('published').checked;
  const payload={
    title:document.getElementById('title').value.trim(),
    slug:document.getElementById('slug').value.trim()||slugify(document.getElementById('title').value),
    excerpt:document.getElementById('excerpt').value.trim(),
    content:document.getElementById('content').value,
    category_id:document.getElementById('category_id').value||null,
    author_name:document.getElementById('author_name').value.trim()||'Zenith Hackers Intelligence',
    cover_image:document.getElementById('cover_image').value.trim()||null,
    published,
    published_at:published?new Date().toISOString():null,
    updated_at:new Date().toISOString()
  };
  const result=editingId?await client.from('articles').update(payload).eq('id',editingId):await client.from('articles').insert(payload);
  if(result.error) return setStatus(result.error.message,true);
  setStatus(published?'Article published.':'Draft saved.');
  if(!editingId) editorForm.reset();
  document.getElementById('author_name').value='Zenith Hackers Intelligence';
  await loadArticles();
});

document.getElementById('deleteBtn').addEventListener('click',async()=>{
  if(!editingId||!confirm('Delete this article permanently?')) return;
  const {error}=await client.from('articles').delete().eq('id',editingId);
  if(error) return setStatus(error.message,true);
  editingId=null; editorForm.reset(); document.getElementById('deleteBtn').hidden=true; await loadArticles(); setStatus('Article deleted.');
});

loginForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const {error}=await client.auth.signInWithPassword({email:document.getElementById('email').value,password:document.getElementById('password').value});
  if(error) return setStatus(error.message,true);
  await init();
});

logoutBtn.addEventListener('click',async()=>{await client.auth.signOut();location.reload();});

function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

async function init(){
  const {data:{session}}=await client.auth.getSession();
  if(!session){loginPanel.hidden=false;editorPanel.hidden=true;return;}
  const {data:admin}=await client.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(!admin){await client.auth.signOut();setStatus('This account is not an authorized publisher.',true);loginPanel.hidden=false;editorPanel.hidden=true;return;}
  loginPanel.hidden=true;editorPanel.hidden=false;await loadCategories();await loadArticles();
}
init();
