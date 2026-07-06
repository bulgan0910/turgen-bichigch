export interface Sentence {
  id: string;
  text: string;
  author?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'mn' | 'en';
}

export const SENTENCES: Sentence[] = [
  {
    id: '1',
    text: 'Эрүүл биед саруул ухаан оршино гэж манай ард түмэн эрт дээр үеэс сургаж ирсэн билээ.',
    difficulty: 'easy',
    language: 'mn'
  },
  {
    id: '2',
    text: 'Монгол Улсын нийслэл Улаанбаатар хот бол дэлхийн хамгийн хүйтэн, бас хамгийн залуу хүн амтай хотуудын нэг юм.',
    difficulty: 'medium',
    language: 'mn'
  },
  {
    id: '3',
    text: 'Тэнгэрт гялалзах одод дунд бидний мэдэхгүй маш олон нууцлаг ертөнц оршин байдаг нь дамжиггүй.',
    difficulty: 'easy',
    language: 'mn'
  },
  {
    id: '4',
    text: 'Мэдээллийн технологийн салбар эрчимтэй хөгжиж буй өнөө үед бид цаг үетэйгээ хөл нийлүүлэн алхах шаардлагатай.',
    difficulty: 'medium',
    language: 'mn'
  },
  {
    id: '5',
    text: 'Хурдан морины уралдаан бол Монгол түмний эртний түүх соёл, бахархал, уламжлалын салшгүй нэг хэсэг билээ.',
    difficulty: 'medium',
    language: 'mn'
  },
  {
    id: '6',
    text: 'Хүн хичнээн их мэдлэгтэй байлаа ч бусдыг хүндэтгэх сэтгэлгүй бол түүний эрдэм боловсрол бүрэн утгаа алддаг.',
    difficulty: 'hard',
    language: 'mn'
  },
  {
    id: '7',
    text: 'Урт шар замаар ургамал цэцгийн дундуур алхаж явахдаа байгалийн сайхныг бишрэн бахдах сэтгэл өөрийн эрхгүй төрдөг.',
    difficulty: 'hard',
    language: 'mn'
  },
  {
    id: '8',
    text: 'Ирээдүйг өөрчлөх хамгийн хүчтэй зэвсэг бол ердөө л өнөөдөр хийж буй бидний суралцах тэмүүлэл юм.',
    difficulty: 'easy',
    language: 'mn'
  },
  {
    id: '9',
    text: 'Ажиглаад байхад амьдралын хамгийн сайхан зүйлс маш энгийн мөчүүдээс бүрдсэн байдаг нь үнэхээр гайхалтай.',
    difficulty: 'easy',
    language: 'mn'
  },
  {
    id: '10',
    text: 'Шинжлэх ухаан ба технологийн ололтууд нь хүн төрөлхтний өдөр тутмын амьдралыг танигдахын аргагүй хурдан өөрчилж байна.',
    difficulty: 'hard',
    language: 'mn'
  },
  // English Sentences
  {
    id: 'en_1',
    text: 'The quick brown fox jumps over the lazy dog.',
    difficulty: 'easy',
    language: 'en'
  },
  {
    id: 'en_2',
    text: 'Practice makes perfect when it comes to typing fast and accurately.',
    difficulty: 'easy',
    language: 'en'
  },
  {
    id: 'en_3',
    text: 'A journey of a thousand miles begins with a single step.',
    difficulty: 'easy',
    language: 'en'
  },
  {
    id: 'en_4',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    difficulty: 'easy',
    language: 'en'
  },
  {
    id: 'en_5',
    text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    difficulty: 'medium',
    language: 'en'
  },
  {
    id: 'en_6',
    text: 'Technology is best when it brings people together and improves our lives in meaningful ways.',
    difficulty: 'medium',
    language: 'en'
  },
  {
    id: 'en_7',
    text: 'The only limit to our realization of tomorrow will be our doubts of today.',
    difficulty: 'medium',
    language: 'en'
  },
  {
    id: 'en_8',
    text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.',
    difficulty: 'medium',
    language: 'en'
  },
  {
    id: 'en_9',
    text: 'Incomprehensible and extraordinarily complex algorithms are constantly operating behind modern web user interfaces.',
    difficulty: 'hard',
    language: 'en'
  },
  {
    id: 'en_10',
    text: 'The juxtaposition of traditional customs with hyper-technological advancements creates a fascinating sociological landscape.',
    difficulty: 'hard',
    language: 'en'
  },
  {
    id: 'en_11',
    text: 'An exquisite combination of determination, patience, and meticulous attention to detail is required to master any complex craftsmanship.',
    difficulty: 'hard',
    language: 'en'
  }
];

export interface ScoreEntry {
  id?: string;
  name: string;
  wpm: number;
  errorCount: number;
  createdAt: any;
  avatar: string;
  language?: 'mn' | 'en';
}

