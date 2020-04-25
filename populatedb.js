#! /usr/bin/env node

console.log('此脚本为数据库填充一些测试藏书、作者、藏书种类、藏书类型。将数据库地址作为参数，比如：populatedb mongodb://your_username:your_password@your_dabase_url。');

// 从命令行取得参数
const userArgs = process.argv.slice(2);
const async         = require('async');
const Book          = require('./models/book');
const Author        = require('./models/author');
const Genre         = require('./models/genre');
const BookInstance  = require('./models/bookinstance');

const mongoose      = require('mongoose');
const mongoDB       = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise    = global.Promise;

const db            = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

const authors       = [];
const genres        = [];
const books         = [];
const bookinstances = [];

function authorCreate(first_name, family_name, d_birth, d_death, cb) {
  const author = new Author({
    first_name    : first_name,
    family_name   : family_name,
    date_of_birth : (d_birth !== false) ? d_birth : undefined,
    date_of_death : (d_death !== false) ? d_death : undefined
  });
     
  author.save( err => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('新建作者：' + author);
    authors.push(author);
    cb(null, author);
  });
}

function genreCreate(name, cb) {
  const genre = new Genre({ name: name });
     
  genre.save( err => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('新建藏书种类：' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function bookCreate(title, summary, isbn, author, genre, cb) {
  const book = new Book({
    title   : title,
    summary : summary,
    author  : author,
    isbn    : isbn,
    genre   : (genre !== false) ? genre : undefined
  });

  book.save( err => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('新建藏书：' + book);
    books.push(book);
    cb(null, book);
  });
}


function bookInstanceCreate(book, imprint, due_back, status, cb) {
  const bookInstance = new BookInstance({
    book     : book,
    imprint  : imprint,
    due_back : (due_back !== false) ? due_back : undefined,
    status   : (status !== false) ? status : undefined
  });
  
  bookInstance.save( err => {
    if (err) {
      console.log('[错误]无法创建藏书副本：' + bookInstance);
      cb(err, null);
      return;
    }
    console.log('新建藏书副本：' + bookInstance);
    bookinstances.push(bookInstance);
    cb(null, book);
  });
}


function createGenres(cb) {
  async.parallel([
    callback => genreCreate('小说', callback),
    callback => genreCreate('散文', callback),
    callback => genreCreate('绘本', callback),
    callback => genreCreate('其它', callback)
  ], cb); // 可选回调
}

function createAuthors(cb) {
  async.parallel([
    callback => authorCreate('杰罗姆·K', '杰罗姆', false, false, callback),
    callback => authorCreate('潮', '张', false, false, callback),
    callback => authorCreate('海格', '马特', '1881-9-25', '1936-10-19', callback),
    callback => authorCreate('维之', '叶', '1987-2-17', false, callback),
    callback => authorCreate('莱利', '安迪', false, false, callback),
    callback => authorCreate('Planet', 'Lonely', '1920-01-02', '1992-04-06', callback),
    callback => authorCreate('让·雅克', '桑贝', '1920-01-02', '1992-04-06', callback),
    callback => authorCreate('莉兹', '克里莫', false, false, callback),
    callback => authorCreate('R', '费曼', '1920-01-02', '1992-04-06', callback)
  ], cb); // 可选回调
}

function createBooks(cb) {
  async.parallel([
    callback => bookCreate(
      '三怪客泛舟记',
      '一本著名的幽默小说，据说被《绅士》杂志评为最幽默的50部文学作品（我真的很想知道其它49部是什么……）。大意讲述了三人一狗的泰晤士河之旅，文风轻松而欢快，适合忽然觉得生活很无聊的某些时刻，或许能让你体会到平淡生活中的微妙细节。因为内容很日常，也有的人觉得这本书很啰嗦，确实，书里有不少吐槽风格的文字，其实正是我们的思想写照。',
      '9787101103144',
      authors[0],
      [genres[0],],
      callback
    ),
    callback => bookCreate(
      '懒人闲思录',
      '中文译名不止一种，书是同一本。这本书是由很多话题的随笔组成，主要内容是“懒人”思想家对社会现象的种种看法，讨论的东西既有日常所感也有爱情人生，轻松之余也有很多朴素的人生道理。',
      '9787020131198',
      authors[0],
      [genres[1],],
      callback
    ),
    callback => bookCreate(
      '幽梦影',
      '这也是一部话题广泛的随笔，但每则非常短，仅有几句话而已，有趣的是每篇文字下面都有几个评论。',
      '9787544369480',
      authors[2],
      [genres[4],],
      callback
    ),
    callback => bookCreate(
      '朝花夕拾',
      '本书是一本具有鲜明的个性色彩的散文集。适性任隋、洒脱不羁，想说就说，想骂就骂，心中的种种爱憎悲欢，任其在笔下自然流泻。抒情、叙事和议论融为一体，优美和谐，朴实感人。',
      '9787514370829',
      authors[1],
      [genres[3],],
      callback
    ), 
    callback => bookCreate(
      '我遇见了人类',
      '人类，是个什么物种？《我遇见了人类》用外星人的视角展开了对人类的观察，里面充满了对人类的“残酷”吐槽，但这些令人忍俊不禁的犀利言辞背后，或许也值得我们反思。',
      '9787533946630',
      authors[2],
      [genres[3],genres[1]],
      callback
    ),
    callback => bookCreate(
      '一个医生的非医学词典',
      '书如其名，这真的是一本词典，一本由一个妇产科男医生所编纂的无关医学的词典，配图还挺可爱的，对每个词语的解释也很新颖。比如：汉堡包——和包子、馒头夹肉及馅饼争斗胃肠领地的外国坦克。剃须刀——面部除草机。许多解释让人会心一笑，也有的让人不敢苟同，所以轻松翻过即可，大概半小时就能看完全书，所以如果你买下来……呃，可能会有点心疼。',
      '0008117497',
      authors[3],
      [genres[2],genres[3],],
      callback
    ),
    callback => bookCreate(
      '作死的发明',
      '黑白绘本，画了许多脑洞大开的发明，比如用粉笔DIY补牙，一次性可以叉起所有薯条的叉子……无厘头又新鲜，如果你身边有图书馆，不妨搜索下这本书，作为学习之余的调剂还是很棒的。',
      '0008117497',
      authors[4],
      [genres[2],genres[3],],
      callback
    ),
    callback => bookCreate(
      '万能生存指南',
      '没想到这么“不正经”的画风居然出自大名鼎鼎的孤独星球，好吧，也许你旅行的时候说不准真的会需要它，比如怎么进行太空行走，丧尸围城了怎么办，应对核爆炸的场景，甚至还有致死原因概率图？（这指南的范围也太广了吧）。太多太多场景了，不至于“万能”，但也确实很长见识，也有一些每个人都能学到的问题啦，比如：如何活到100岁？',
      '0008117497',
      authors[5],
      [genres[2],genres[3],],
      callback
    ),
    callback => bookCreate(
      '不简单的生活',
      '作者有好几本风格类似的绘本，黑白色，文字很少，画的往往是小人物，小情节，不过也不限于日常，还有一些时事漫画（对现在来说已经“过时”），有些梗可能不太懂，不过大部分都很简单有趣。个人觉得这系列也适合买回家闲时翻看，因为指不定哪次能发现以前没注意到的细节。',
      '0008117497',
      authors[6],
      [genres[2],],
      callback
    ),
    callback => bookCreate(
      '你今天真好看',
      '温馨治愈的绘本。',
      '0008117497',
      authors[7],
      [genres[2],],
      callback
    ),
    callback => bookCreate(
      '别逗了，费曼先生',
      '伟大的人是写进教科书里面的，以前物理书上严肃的名字令人望而生畏，但看看这本书，却像是一个活生生的人在讲他的人生经历。这本书的笔风未必说有多搞笑，但看看“天才”的日常，还是颇有反差萌的。',
      '0008117497',
      authors[8],
      [genres[1],],
      callback
    ),
  ], cb); // 可选回调
}

function createBookInstances(cb) {
  async.parallel([
    callback => bookInstanceCreate(
      books[0], '中华书局 2014年版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[1], '人民文学出版社 汉日对照 2017年版', false, '已借出', callback
    ),
    callback => bookInstanceCreate(
      books[2], '人民文学出版社 汉法对照 2017年版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[3], '海南出版社 2017年版', false, false, callback
    ),
    callback => bookInstanceCreate(
      books[3], '海南出版社 2017年版', false, '馆藏维护', callback
    ),
    callback => bookInstanceCreate(
      books[4], '海南出版社 2017年版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[4], '中国友谊出版公司 2018版', false, '已借出', callback
    ),
    callback => bookInstanceCreate(
      books[5], '现代出版社 2018版', false, '馆藏维护', callback
    ),
    callback => bookInstanceCreate(
      books[5], '浙江文艺出版社 2017版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[6], '浙江文艺出版社 2018版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[7], '浙江文艺出版社 2019版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[7], '江南出版社 2019版', false, '可供借阅', callback
    ),
    callback => bookInstanceCreate(
      books[8], '豆瓣出版社 2019版', false, '馆藏维护', callback
    ),
    callback => bookInstanceCreate(
      books[9], '豆瓣出版社 2019版', false, '已借出', callback
    )
  ], cb); // 可选回调
}

async.series (
  [
    createGenres,
    createAuthors,
    createBooks,
    createBookInstances
  ],
  // 可选回调
  (err, results) => {
    console.log(
      err ?
      '最终错误：' + err :
      '藏书副本：' + bookinstances
    );
    // 操作完成，断开数据库连接
    db.close();
  }
);