const searchInput = document.getElementById('siteSearch');
const cards = [...document.querySelectorAll('.article-card')];
searchInput?.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  cards.forEach(card => {
    card.hidden = q && !card.textContent.toLowerCase().includes(q);
  });
});

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
