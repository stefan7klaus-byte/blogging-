(() => {
  "use strict";
  if (window.__zenithCommunityLoaded) return;
  window.__zenithCommunityLoaded = true;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const load = src => new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(s => s.src === src);
    if (existing) { if (existing.dataset.loaded === "yes") return resolve(); existing.addEventListener("load", resolve, {once:true}); existing.addEventListener("error", reject, {once:true}); return; }
    const s = document.createElement("script"); s.src = src; s.onload = () => {s.dataset.loaded="yes";resolve();}; s.onerror = reject; document.head.append(s);
  });
  const root = new URL(".", document.currentScript?.src || location.href);
  const configUrl = new URL("supabase-client-config.js", root).href;
  const cssUrl = new URL("community.css", root).href;
  const style = document.createElement("link"); style.rel="stylesheet"; style.href=cssUrl; document.head.append(style);
  async function start() {
    try {
      if (!window.supabase) await load("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      if (!window.ZENITH_SUPABASE) await load(configUrl);
      if (!window.ZENITH_SUPABASE?.url || !window.ZENITH_SUPABASE?.publishableKey) throw new Error("Supabase client configuration is missing.");
    } catch (e) { console.warn("Community features could not initialize:", e); return; }
    const client = window.supabase.createClient(window.ZENITH_SUPABASE.url, window.ZENITH_SUPABASE.publishableKey);
    const path = location.pathname;
    const isHome = /\/index\.html$/.test(path) || path.endsWith("/") || path === "";
    const articleEl = document.querySelector(".article-body") || document.getElementById("article");
    const articleSlug = new URLSearchParams(location.search).get("slug") || (path.includes("/articles/") ? path.split("/").pop().replace(/\.html$/, "") : "");
    const mount = document.createElement("section");
    mount.className = "zh-community section-shell";
    mount.id = "community";
    if (isHome && !path.includes("/articles/")) {
      mount.innerHTML = `<div class="section-heading"><p class="eyebrow">COMMUNITY</p><h2>Community posts & discussion</h2><p>Sign in or create a free account to comment, share a post, and upload an image. Submissions appear publicly after moderation.</p></div><div class="zh-auth glass" id="zhAuth"></div><div class="zh-post-compose glass" id="zhCompose"></div><div class="zh-post-list" id="zhPostList"><p>Loading community posts…</p></div>`;
      const main = document.querySelector("main");
      const footer = document.querySelector("footer");
      if (footer && main) footer.before(mount); else if (main) main.append(mount);
    } else if (articleEl && articleSlug && !path.endsWith("/articles/index.html")) {
      mount.innerHTML = `<div class="glass zh-comments"><div class="section-heading"><p class="eyebrow">ARTICLE DISCUSSION</p><h2>Comments</h2><p>Join the discussion. You must sign in or create a free account to post a comment.</p></div><div class="zh-auth" id="zhAuth"></div><div class="zh-comment-compose" id="zhCommentCompose"></div><div id="zhCommentList"><p>Loading comments…</p></div></div>`;
      articleEl.after(mount);
    } else {
      // Article library and other pages get a community entry point without disrupting existing content.
      mount.innerHTML = `<div class="glass zh-community-entry"><h2>Join the community</h2><p>Create a free account to comment on articles, publish a community post, or upload an image.</p><a class="button primary" href="../index.html#community">Open community</a></div>`;
      const main = document.querySelector("main");
      if (main) main.append(mount);
    }

    let session = null, profileName = "";
    const authEl = mount.querySelector("#zhAuth");
    const composeEl = mount.querySelector("#zhCompose");
    const postListEl = mount.querySelector("#zhPostList");
    const commentComposeEl = mount.querySelector("#zhCommentCompose");
    const commentListEl = mount.querySelector("#zhCommentList");
    const note = (el, msg, bad=false) => { if(el) { let n=el.querySelector(".zh-status"); if(!n){n=document.createElement("p");n.className="zh-status";el.append(n);} n.textContent=msg; n.classList.toggle("is-error",bad); } };
    function renderAuth() {
      if (!authEl) return;
      if (session) {
        profileName = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Community member";
        authEl.innerHTML = `<div class="zh-signed-in"><span>Signed in as <strong>${esc(profileName)}</strong></span><button type="button" class="button secondary" id="zhSignOut">Sign out</button></div><p class="zh-muted">Your comments and posts will be associated with this account.</p>`;
        authEl.querySelector("#zhSignOut").onclick = async () => { const {error}=await client.auth.signOut(); if(error) return note(authEl,error.message,true); session=null; renderAuth(); renderComposer(); refresh(); };
      } else {
        authEl.innerHTML = `<div class="zh-auth-grid"><form id="zhSignIn" class="zh-form"><h3>Sign in</h3><label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>Password<input name="password" type="password" autocomplete="current-password" required minlength="6"></label><button class="button primary">Sign in</button></form><form id="zhSignUp" class="zh-form"><h3>Create free account</h3><label>Display name<input name="displayName" required maxlength="60" autocomplete="nickname"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Password<input name="password" type="password" required minlength="8" autocomplete="new-password"></label><button class="button secondary">Create account</button></form></div><p class="zh-muted">Use an email you can access. If email confirmation is enabled, confirm your address before signing in. Never enter wallet seed phrases or private keys here.</p>`;
        authEl.querySelector("#zhSignIn").onsubmit = async e => {e.preventDefault();const f=new FormData(e.currentTarget);const {data,error}=await client.auth.signInWithPassword({email:String(f.get("email")).trim(),password:String(f.get("password"))});if(error)return note(authEl,error.message,true);session=data.session;renderAuth();renderComposer();refresh();};
        authEl.querySelector("#zhSignUp").onsubmit = async e => {e.preventDefault();const f=new FormData(e.currentTarget),displayName=String(f.get("displayName")).trim();const {data,error}=await client.auth.signUp({email:String(f.get("email")).trim(),password:String(f.get("password")),options:{data:{display_name:displayName}}});if(error)return note(authEl,error.message,true);if(data.session){session=data.session;renderAuth();renderComposer();refresh();}else note(authEl,"Account created. Check your email for a confirmation link, then sign in.");};
      }
    }
    async function uploadImage(file) {
      if (!file) return null;
      if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
      if (file.size > 5*1024*1024) throw new Error("Image must be 5 MB or smaller.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
      const objectPath = session.user.id + "/" + crypto.randomUUID() + "." + ext;
      const {error}=await client.storage.from("community-images").upload(objectPath,file,{upsert:false,contentType:file.type});
      if(error) throw error;
      const {data}=client.storage.from("community-images").getPublicUrl(objectPath);
      return data.publicUrl;
    }
    function renderComposer() {
      if (composeEl) composeEl.innerHTML = session ? `<h3>Create a community post</h3><form id="zhPostForm" class="zh-form"><label>Post title<input name="title" required maxlength="120"></label><label>Message<textarea name="body" required maxlength="5000" rows="5"></textarea></label><label>Upload image (optional, max 5 MB)<input name="image" type="file" accept="image/*"></label><button class="button primary">Submit post</button><p class="zh-muted">Posts are held for review before appearing publicly.</p></form>` : `<h3>Want to publish a post?</h3><p>Sign in or create a free account above to write a community post and upload an image.</p>`;
      if (commentComposeEl) commentComposeEl.innerHTML = session ? `<form id="zhCommentForm" class="zh-form"><label>Your comment<textarea name="body" required maxlength="3000" rows="4" placeholder="Share a respectful, relevant comment…"></textarea></label><button class="button primary">Submit comment</button><p class="zh-muted">Comments are reviewed before public display.</p></form>` : `<p class="zh-muted">Sign in or create a free account above to add a comment.</p>`;
      const postForm=composeEl?.querySelector("#zhPostForm");
      if(postForm) postForm.onsubmit=async e=>{e.preventDefault();const f=new FormData(postForm),title=String(f.get("title")).trim(),body=String(f.get("body")).trim(),file=f.get("image");try{let image_url=null;if(file instanceof File && file.size) image_url=await uploadImage(file);const {error}=await client.from("community_posts").insert({user_id:session.user.id,display_name:profileName,title,body,image_url,status:"pending"});if(error)throw error;postForm.reset();note(composeEl,"Post submitted for review. It will appear after approval.");}catch(err){note(composeEl,err.message||"Unable to submit post.",true);}};
      const commentForm=commentComposeEl?.querySelector("#zhCommentForm");
      if(commentForm) commentForm.onsubmit=async e=>{e.preventDefault();const body=String(new FormData(commentForm).get("body")).trim();if(!body)return;const {error}=await client.from("article_comments").insert({article_slug:articleSlug,user_id:session.user.id,display_name:profileName,body,status:"pending"});if(error)return note(commentComposeEl,error.message,true);commentForm.reset();note(commentComposeEl,"Comment submitted for review. It will appear after approval.");};
    }
    async function refresh() {
      if(postListEl){const {data,error}=await client.from("community_posts").select("id,title,body,image_url,display_name,created_at").eq("status","approved").order("created_at",{ascending:false}).limit(30);if(error){postListEl.innerHTML="<p>Community posts are temporarily unavailable.</p>";}else postListEl.innerHTML=(data||[]).map(p=>`<article class="glass zh-post"><h3>${esc(p.title)}</h3><p class="zh-post-meta">By ${esc(p.display_name||"Community member")} · ${esc(new Date(p.created_at).toLocaleDateString())}</p>${p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="Image attached to community post">`:""}<p class="zh-post-body">${esc(p.body).replace(/\n/g,"<br>")}</p></article>`).join("")||"<p>No approved community posts yet. Be the first to submit one.</p>";}
      if(commentListEl){const {data,error}=await client.from("article_comments").select("id,display_name,body,created_at").eq("article_slug",articleSlug).eq("status","approved").order("created_at",{ascending:true}).limit(100);if(error){commentListEl.innerHTML="<p>Comments are temporarily unavailable.</p>";}else commentListEl.innerHTML=(data||[]).map(c=>`<article class="zh-comment"><strong>${esc(c.display_name||"Community member")}</strong><small>${esc(new Date(c.created_at).toLocaleString())}</small><p>${esc(c.body).replace(/\n/g,"<br>")}</p></article>`).join("")||"<p>No comments yet. Start the discussion.</p>";}
    }
    const {data:{session:existing}}=await client.auth.getSession();session=existing;renderAuth();renderComposer();await refresh();
    client.auth.onAuthStateChange((_event,next)=>{session=next;renderAuth();renderComposer();refresh();});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true}); else start();
})();