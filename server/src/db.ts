import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || '/data/typing.db';
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '文章',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    employee_group TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    article_title TEXT NOT NULL DEFAULT '',
    wpm REAL NOT NULL,
    accuracy TEXT NOT NULL,
    duration INTEGER NOT NULL,
    total_keystrokes INTEGER NOT NULL DEFAULT 0,
    wrong_keystrokes INTEGER NOT NULL DEFAULT 0,
    strict_wrong_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_records_name ON records(employee_name);
  CREATE INDEX IF NOT EXISTS idx_records_group ON records(employee_group);
  CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

const SETTING_DEFAULTS: Record<string, string> = {
  allow_strict_mode_toggle: '1'
};
const stmtSettingGet = db.prepare('SELECT value FROM settings WHERE key = ?');
const stmtSettingInsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(SETTING_DEFAULTS)) {
  const row = stmtSettingGet.get(k) as any;
  if (!row) {
    stmtSettingInsert.run(k, v);
    console.log(`Seeded setting ${k}=${v}`);
  }
}

const articleCount = db.prepare('SELECT COUNT(*) as c FROM articles').get() as any;
if (articleCount.c === 0) {
  const insert = db.prepare('INSERT INTO articles (title, author, content, type) VALUES (?, ?, ?, ?)');
  const samples = [
    {
      title: '背影（节选）',
      author: '朱自清',
      type: '散文',
      content: '我说道，"爸爸，你走吧。"他往车外看了看，说，"我买几个橘子去。你就在此地，不要走动。"我看那边月台的栅栏外有几个卖东西的等着顾客。走到那边月台，须穿过铁道，须跳下去又爬上去。父亲是一个胖子，走过去自然要费事些。我本来要去的，他不肯，只好让他去。我看见他戴着黑布小帽，穿着黑布大马褂，深青布棉袍，蹒跚地走到铁道边，慢慢探身下去，尚不大难。可是他穿过铁道，要爬上那边月台，就不容易了。他用两手攀着上面，两脚再向上缩；他肥胖的身子向左微倾，显出努力的样子。这时我看见他的背影，我的泪很快地流下来了。'
    },
    {
      title: '春（节选）',
      author: '朱自清',
      type: '散文',
      content: '盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。坐着，躺着，打两个滚，踢几脚球，赛几趟跑，捉几回迷藏。风轻悄悄的，草软绵绵的。桃树、杏树、梨树，你不让我，我不让你，都开满了花赶趟儿。红的像火，粉的像霞，白的像雪。花里带着甜味儿；闭了眼，树上仿佛已经满是桃儿、杏儿、梨儿。'
    },
    {
      title: '匆匆（节选）',
      author: '朱自清',
      type: '散文',
      content: '燕子去了，有再来的时候；杨柳枯了，有再青的时候；桃花谢了，有再开的时候。但是，聪明的，你告诉我，我们的日子为什么一去不复返呢？——是有人偷了他们罢：那是谁？又藏在何处呢？是他们自己逃走了罢：现在又到了哪里呢？我不知道他们给了我多少日子；但我的手确乎是渐渐空虚了。在默默里算着，八千多日子已经从我手中溜去；像针尖上一滴水滴在大海里，我的日子滴在时间的流里，没有声音，也没有影子。我不禁头涔涔而泪潸潸了。'
    },
    {
      title: '荷塘月色（节选）',
      author: '朱自清',
      type: '散文',
      content: '曲曲折折的荷塘上面，弥望的是田田的叶子。叶子出水很高，像亭亭的舞女的裙。层层的叶子中间，零星地点缀着些白花，有袅娜地开着的，有羞涩地打着朵儿的；正如一粒粒的明珠，又如碧天里的星星，又如刚出浴的美人。微风过处，送来缕缕清香，仿佛远处高楼上渺茫的歌声似的。这时候叶子与花也有一丝的颤动，像闪电般，霎时传过荷塘的那边去了。叶子本是肩并肩密密地挨着，这便宛然有了一道凝碧的波痕。叶子底下是脉脉的流水，遮住了，不能见一些颜色；而叶子却更见风致了。'
    },
    {
      title: '故乡（节选）',
      author: '鲁迅',
      type: '散文',
      content: '时候既然是深冬，渐近故乡时，天气又阴晦了，冷风吹进船舱中，呜呜的响，从篷隙向外一望，苍黄的天底下，远近横着几个萧索的荒村，没有一些活气。我的心禁不住悲凉起来了。阿！这不是我二十年来时时记得的故乡？我所记得的故乡全不如此。我的故乡好得多了。但要我记起他的美丽，说出他的佳处来，却又没有影像，没有言辞了。仿佛也就如此。于是我自己解释说：故乡本也如此，——虽然没有进步，也未必有如我所感的悲凉，这只是我自己心情的改变罢了，因为我这次回乡，本没有什么好心绪。'
    }
  ];
  const tx = db.transaction(() => {
    for (const a of samples) {
      insert.run(a.title, a.author, a.content, a.type);
    }
  });
  tx();
  console.log(`Seeded ${samples.length} sample articles.`);
}

export default db;
