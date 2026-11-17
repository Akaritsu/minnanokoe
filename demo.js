// デモ用：GAS_URL が空のとき、サーバーの代わりにブラウザ内で動く（保存されません）
window.DEMO_API = (function () {
  const day = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const st = {
    cats: ['弁当','モーニング','ランチ','スナック','ソフトドリンク','コーヒー／ティー','物販フード','ヤクルト','アルコールドリンク','バーフード','CL','オプション'],
    exCats: ['アルコールドリンク','バーフード','CL','オプション'], hidden: ['レジ袋'],
    menu: [
      { item: 'チキン南蛮定食', qty: 42, source: 'smaregi' },
      { item: '日替わりパスタ（きのこクリーム）', qty: 28, source: 'smaregi' },
      { item: '彩り野菜のサラダボウル', qty: 17, source: 'smaregi' },
      { item: 'カフェラテ', qty: 35, source: 'smaregi' },
      { item: '本日のスープ', qty: 12, source: 'smaregi' },
    ],
    posts: [
      { id: 'p1', type: 'req', text: '週1でカレーが食べたい', author: '匿名', status: 'adopted', reply: '毎週水曜にカレーの日を始めました', sold: 64, dish: '水曜カレー', ts: now - 9e8, by: 'x' },
      { id: 'p2', type: 'req', text: '寒い日に具だくさんのスープが食べたい', author: '経理部', status: 'considered', reply: '12月の試作に入れます', sold: 0, dish: '', ts: now - 4e8, by: 'y' },
      { id: 'p3', type: 'req', text: '午後の甘いものがほしい', author: '匿名', status: 'open', reply: '', sold: 0, dish: '', ts: now - 1e8, by: 'z' },
    ],
    likes: [{ post: 'p1', by: 'a' }, { post: 'p1', by: 'b' }, { post: 'p1', by: 'c' }, { post: 'p2', by: 'a' }, { post: 'p3', by: 'b' }],
    ratings: [
      { item: 'チキン南蛮定食', by: 'a', r: 'good' }, { item: 'チキン南蛮定食', by: 'b', r: 'good' },
      { item: 'チキン南蛮定食', by: 'c', r: 'ok' }, { item: '日替わりパスタ（きのこクリーム）', by: 'a', r: 'meh' },
    ],
  };
  const pub = (p, uid) => {
    const l = st.likes.filter(x => x.post === p.id);
    return Object.assign({}, p, { likes: l.length, liked: l.some(x => x.by === uid), mine: p.by === uid, by: undefined });
  };
  const sum = list => {
    const s = { good: 0, ok: 0, meh: 0 }; list.forEach(r => s[r.r]++);
    const n = s.good + s.ok + s.meh; return Object.assign(s, { n, sat: n ? Math.round(s.good / n * 100) : null });
  };
  const A = {
    state(b, uid) {
      const my = {}; st.ratings.filter(r => r.by === uid).forEach(r => { my[r.item] = r.r; });
      return { day, menu: st.menu, myRatings: my, posts: st.posts.filter(p => p.type === 'req' || p.by === uid).map(p => pub(p, uid)) };
    },
    post(b, uid) { const id = 'p' + Date.now(); st.posts.push({ id, type: b.type, text: b.text, author: b.author || '匿名', status: 'open', reply: '', sold: 0, dish: '', ts: Date.now(), by: uid }); return { id }; },
    like(b, uid) { const i = st.likes.findIndex(l => l.post === b.post && l.by === uid); if (i >= 0) st.likes.splice(i, 1); else st.likes.push({ post: b.post, by: uid }); return {}; },
    rate(b, uid) { const h = st.ratings.find(r => r.item === b.item && r.by === uid); if (h) h.r = b.r; else st.ratings.push({ item: b.item, by: uid, r: b.r }); return {}; },
    mgrState() {
      const s = sum(st.ratings);
      const byItem = st.menu.map(m => Object.assign({}, m, sum(st.ratings.filter(r => r.item === m.item))));
      const reqs = st.posts.filter(p => p.type === 'req');
      return {
        day, menu: byItem, lastSync: 'デモ表示', smaregi: false, hidden: st.hidden,
        categories: st.cats.map(n => ({ name: n, shown: st.exCats.indexOf(n) < 0 })), posts: st.posts.map(p => pub(p, null)),
        report: { ym: day.slice(0, 7), voices: st.posts.length, answered: st.posts.filter(p => p.status !== 'open').length,
          adopted: reqs.filter(p => p.status === 'adopted').length, sold: reqs.reduce((a, p) => a + (p.sold || 0), 0),
          ratings: st.ratings.length, sat: s.sat, best: byItem.filter(x => x.n).sort((a, b) => b.sat - a.sat),
          made: reqs.filter(p => p.status === 'adopted').map(p => p.dish || p.text), texts: st.posts.map(p => p.text) },
      };
    },
    mgrReply(b) { const p = st.posts.find(x => x.id === b.id); p.status = b.status; p.reply = b.reply; if (b.status === 'adopted') p.dish = b.dish || p.text; return true; },
    mgrSold(b) { st.posts.find(x => x.id === b.id).sold = +b.sold || 0; return true; },
    mgrDel(b) { st.posts = st.posts.filter(x => x.id !== b.id); return true; },
    mgrMenuAdd(b) { if (!st.menu.some(m => m.item === b.item)) st.menu.push({ item: b.item, qty: 0, source: 'manual' }); return true; },
    mgrMenuHide(b) { st.menu = st.menu.filter(m => m.item !== b.item); st.hidden.push(b.item); return true; },
    mgrSetCategories(b) { st.exCats = b.hide; return 'デモ：保存しました'; },
    mgrUnhide(b) { st.hidden = st.hidden.filter(x => x !== b.item); return 'ok'; },
    mgrSync() { return 'デモではスマレジに接続しません'; },
  };
  return async function (body) {
    await new Promise(r => setTimeout(r, 150));
    if (body.action.indexOf('mgr') === 0 && String(body.pin) !== '1234') throw new Error('pin');
    return JSON.parse(JSON.stringify(A[body.action](body, 'dev_' + body.devId)));
  };
})();
