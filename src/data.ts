/* ------------------------------------------------------------------ */
/* PhiQuiz - Mock data cho Môn Triết học Mác - Lênin                    */
/* ------------------------------------------------------------------ */

export type Chapter = {
  id: string;
  index: number;
  name: string;
  description: string;
  status: "completed" | "studying" | "locked";
  doneCount: number;
  totalCount: number;
  score: number;
  color: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  totalQuestions: number;
  progress: number;
  rating: number;
  ratingLabel: string;
  action: string;
  accent: string;
  stripe: string;
  chapters: Chapter[];
};

export type QuizQuestion = {
  id: string;
  chapterId: string;
  field: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
  explanation: string;
  hints: string[];
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  bullets: string[];
};

export type LeaderEntry = {
  rank: number;
  name: string;
  initials: string;
  level: number;
  streak: number;
  points: number;
  title?: string;
  color: string;
};

export type ActivityItem = {
  id: string;
  score: number;
  title: string;
  subject: string;
  time: string;
  color: string;
};

export type MyRank = {
  rank: number;
  points: number;
  nextTarget: number;
};

export type Profile = {
  name: string;
  role: string;
  level: number;
  totalPoints: number;
  streak: number;
  accuracy: number;
  hours: string;
  chapters: { name: string; score: number; maxScore: number }[];
  examHistory: { id: string; date: string; title: string; score: string; result: boolean; subject: string }[];
  badges: { id: string; label: string; icon: string; earned: boolean; color: string }[];
};

export type LibraryHp = {
  id: string;
  name: string;
  code: string;
  icon: string;
  chapters: number;
  questions: number;
  progress: number;
  stripe: string;
};

export type FeaturedCourse = {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  emoji: string;
};

/* ------------------------------------------------------------------ */
/* Danh mục môn học                                                     */
/* ------------------------------------------------------------------ */

export const subjects: Subject[] = [
  {
    id: "triet-hoc",
    name: "Triết học Mác - Lênin",
    code: "GENE1001",
    icon: "menu_book",
    description:
      "Nghiên cứu những quy luật chung nhất của tự nhiên, xã hội và tư duy, cung cấp thế giới quan và phương pháp luận khoa học.",
    totalQuestions: 120,
    progress: 65,
    rating: 4.8,
    ratingLabel: "4.8",
    action: "Tiếp tục học",
    accent: "bg-cyan text-ink",
    stripe: "bg-cyan",
    chapters: [
      {
        id: "c1",
        index: 1,
        name: "Triết học và vai trò của nó",
        description: "Khái lược về triết học, các vấn đề cơ bản của triết học, nguồn gốc và các hình thức phát triển.",
        status: "completed",
        doneCount: 60,
        totalCount: 60,
        score: 9.0,
        color: "bg-cyan",
      },
      {
        id: "c2",
        index: 2,
        name: "Chủ nghĩa duy vật biện chứng",
        description: "Vật chất, ý thức, hai nguyên lý, ba quy luật và sáu cặp phạm trù của phép biện chứng duy vật.",
        status: "studying",
        doneCount: 25,
        totalCount: 75,
        score: 7.5,
        color: "bg-yellow",
      },
      {
        id: "c3",
        index: 3,
        name: "Chủ nghĩa duy vật lịch sử",
        description: "Học thuyết hình thái kinh tế - xã hội, giai cấp và dân tộc, nhà nước và cách mạng xã hội.",
        status: "locked",
        doneCount: 0,
        totalCount: 60,
        score: 0,
        color: "bg-orange",
      },
    ],
  },
  {
    id: "tu-tuong-hcm",
    name: "Tư tưởng Hồ Chí Minh",
    code: "GENE1005",
    icon: "flag",
    description: "Hệ thống quan điểm về cách mạng Việt Nam, nguồn gốc, quá trình hình thành và nội dung cốt lõi.",
    totalQuestions: 90,
    progress: 42,
    rating: 4.6,
    ratingLabel: "4.6",
    action: "Ôn tập ngay",
    accent: "bg-yellow-deep text-ink",
    stripe: "bg-yellow-deep",
    chapters: [
      {
        id: "h1",
        index: 1,
        name: "Khái niệm, đối tượng và ý nghĩa",
        description: "Khái niệm tư tưởng Hồ Chí Minh, đối tượng, phương pháp nghiên cứu và ý nghĩa học tập.",
        status: "studying",
        doneCount: 18,
        totalCount: 30,
        score: 8.2,
        color: "bg-yellow-deep",
      },
      {
        id: "h2",
        index: 2,
        name: "Cơ sở hình thành tư tưởng",
        description: "Cơ sở thực tiễn, lý luận và phẩm chất cá nhân cho sự hình thành tư tưởng Hồ Chí Minh.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-yellow-deep",
      },
      {
        id: "h3",
        index: 3,
        name: "Tư tưởng về dân tộc và cách mạng",
        description: "Tư tưởng giải phóng dân tộc, độc lập dân tộc gắn liền với chủ nghĩa xã hội.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-yellow-deep",
      },
    ],
  },
  {
    id: "lich-su-dang",
    name: "Lịch sử Đảng Cộng sản Việt Nam",
    code: "GENE1004",
    icon: "history_edu",
    description: "Quá trình lãnh đạo cách mạng của Đảng Cộng sản Việt Nam từ năm 1930 đến nay.",
    totalQuestions: 110,
    progress: 90,
    rating: 4.7,
    ratingLabel: "4.7",
    action: "Ôn tập ngay",
    accent: "bg-orange text-ink",
    stripe: "bg-orange",
    chapters: [
      {
        id: "d1",
        index: 1,
        name: "Đảng ra đời và Cương lĩnh đầu tiên",
        description: "Hoàn cảnh lịch sử và sự ra đời của Đảng Cộng sản Việt Nam năm 1930.",
        status: "completed",
        doneCount: 40,
        totalCount: 40,
        score: 8.8,
        color: "bg-orange",
      },
      {
        id: "d2",
        index: 2,
        name: "Cả nước kháng chiến chống Mỹ",
        description: "Đường lối kháng chiến chống Mỹ cứu nước giai đoạn 1954 - 1975.",
        status: "studying",
        doneCount: 30,
        totalCount: 40,
        score: 7.9,
        color: "bg-orange",
      },
      {
        id: "d3",
        index: 3,
        name: "Công cuộc đổi mới đất nước",
        description: "Đường lối đổi mới từ Đại hội VI đến nay trên mọi lĩnh vực.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-orange",
      },
    ],
  },
  {
    id: "phap-luat",
    name: "Pháp luật đại cương",
    code: "GENE1006",
    icon: "gavel",
    description: "Những vấn đề cơ bản về nhà nước, pháp luật, các ngành luật trong hệ thống pháp luật Việt Nam.",
    totalQuestions: 100,
    progress: 15,
    rating: 4.5,
    ratingLabel: "4.5",
    action: "Bắt đầu học",
    accent: "bg-green text-ink",
    stripe: "bg-green",
    chapters: [
      {
        id: "p1",
        index: 1,
        name: "Nguồn gốc, bản chất nhà nước",
        description: "Nguồn gốc, bản chất, đặc trưng và chức năng của nhà nước.",
        status: "studying",
        doneCount: 10,
        totalCount: 35,
        score: 6.8,
        color: "bg-green",
      },
      {
        id: "p2",
        index: 2,
        name: "Quy phạm pháp luật",
        description: "Khái niệm, cấu trúc và phân loại quy phạm pháp luật.",
        status: "locked",
        doneCount: 0,
        totalCount: 35,
        score: 0,
        color: "bg-green",
      },
      {
        id: "p3",
        index: 3,
        name: "Các ngành luật cơ bản",
        description: "Luật Hiến pháp, luật Hành chính, luật Dân sự, luật Hình sự.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-green",
      },
    ],
  },
  {
    id: "kinh-te-chinh-tri",
    name: "Kinh tế chính trị Mác - Lênin",
    code: "GENE1002",
    icon: "account_balance",
    description:
      "Nghiên cứu các quy luật kinh tế của phương thức sản xuất tư bản chủ nghĩa và quan hệ sản xuất trong sự vận động với lực lượng sản xuất.",
    totalQuestions: 140,
    progress: 20,
    rating: 4.4,
    ratingLabel: "4.4",
    action: "Bắt đầu học",
    accent: "bg-cyan text-ink",
    stripe: "bg-cyan",
    chapters: [
      {
        id: "k1",
        index: 1,
        name: "Sản xuất hàng hóa và quy luật giá trị",
        description: "Hàng hóa, hai thuộc tính của hàng hóa, lượng giá trị hàng hóa và quy luật giá trị.",
        status: "studying",
        doneCount: 15,
        totalCount: 50,
        score: 7.2,
        color: "bg-cyan",
      },
      {
        id: "k2",
        index: 2,
        name: "Giá trị thặng dư trong nền kinh tế thị trường",
        description: "Quá trình sản xuất giá trị thặng dư, tiền công, tích lũy và tuần hoàn của tư bản.",
        status: "locked",
        doneCount: 0,
        totalCount: 50,
        score: 0,
        color: "bg-cyan",
      },
      {
        id: "k3",
        index: 3,
        name: "Chủ nghĩa tư bản độc quyền",
        description: "Các đặc điểm kinh tế của chủ nghĩa tư bản độc quyền và vai trò của nhà nước trong nền kinh tế.",
        status: "locked",
        doneCount: 0,
        totalCount: 40,
        score: 0,
        color: "bg-cyan",
      },
    ],
  },
  {
    id: "cnxh-khoa-hoc",
    name: "Chủ nghĩa xã hội khoa học",
    code: "GENE1003",
    icon: "groups",
    description:
      "Nghiên cứu khoa học về sứ mệnh lịch sử của giai cấp công nhân, mục tiêu, con đường, lực lượng và điều kiện đi lên chủ nghĩa xã hội.",
    totalQuestions: 100,
    progress: 5,
    rating: 4.3,
    ratingLabel: "4.3",
    action: "Bắt đầu học",
    accent: "bg-green text-ink",
    stripe: "bg-green",
    chapters: [
      {
        id: "x1",
        index: 1,
        name: "Nhập môn CNXH khoa học",
        description: "Vị trí, đối tượng, phương pháp nghiên cứu và ý nghĩa của chủ nghĩa xã hội khoa học.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-green",
      },
      {
        id: "x2",
        index: 2,
        name: "Sứ mệnh lịch sử của giai cấp công nhân",
        description: "Điều kiện khách quan, nội dung và vai trò của giai cấp công nhân trong thực hiện sứ mệnh lịch sử.",
        status: "locked",
        doneCount: 0,
        totalCount: 40,
        score: 0,
        color: "bg-green",
      },
      {
        id: "x3",
        index: 3,
        name: "Thời kỳ quá độ lên CNXH ở Việt Nam",
        description: "CNXH hiện thực, những đặc trưng và thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam.",
        status: "locked",
        doneCount: 0,
        totalCount: 30,
        score: 0,
        color: "bg-green",
      },
    ],
  },
];

export const activeSubject = subjects.find(subject => subject.id === "triet-hoc") ?? subjects[0]!;

/* ------------------------------------------------------------------ */
/* Bộ câu hỏi trắc nghiệm Triết học Mác - Lênin                         */
/* ------------------------------------------------------------------ */

export const quizPool: QuizQuestion[] = [
  {
    id: "q01",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Triết học là gì?",
    answers: [
      "Triết học là tri thức về thế giới tự nhiên",
      "Triết học là tri thức về tự nhiên và xã hội",
      "Triết học là khoa học của mọi khoa học",
      "Triết học là hệ thống tri thức lý luận chung nhất về thế giới và về vị trí của con người trong thế giới",
    ],
    correctAnswers: [3],
    explanation:
      "Triết học là hệ thống tri thức lý luận chung nhất của con người về thế giới (tự nhiên, xã hội, tư duy) và về vị trí, vai trò của con người trong thế giới đó.",
    hints: [
      "Chú ý cụm từ khóa \u201chệ thống tri thức lý luận chung nhất\u201d.",
      "Triết học không phải là khoa học cụ thể, cũng không phải \u201ckhoa học của mọi khoa học\u201d.",
    ],
  },
  {
    id: "q02",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Triết học ra đời vào khoảng thời gian nào trong lịch sử nhân loại?",
    answers: [
      "Thiên niên kỷ II trước Công nguyên",
      "Thế kỷ VIII - VI trước Công nguyên",
      "Thế kỷ II sau Công nguyên",
      "Thế kỷ XV sau Công nguyên",
    ],
    correctAnswers: [1],
    explanation:
      "Triết học hình thành vào khoảng thế kỷ VIII đến thế kỷ VI trước Công nguyên tại các trung tâm văn minh lớn của nhân loại.",
    hints: [
      "Gắn với ba trung tâm văn minh cổ đại: Ấn Độ, Trung Quốc và Hy Lạp.",
      "Khoảng cách đây hơn 2500 năm.",
    ],
  },
  {
    id: "q03",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Đối tượng nghiên cứu của Triết học Mác - Lênin là gì?",
    answers: [
      "Những quy luật chung nhất của sự vận động, phát triển của tự nhiên, xã hội và tư duy",
      "Các quy luật riêng của từng lĩnh vực tự nhiên, xã hội cụ thể",
      "Kết cấu và vận hành của nền kinh tế thị trường",
      "Các hiện tượng tâm lý cá nhân và xã hội",
    ],
    correctAnswers: [0],
    explanation:
      "Triết học Mác - Lênin nghiên cứu những quy luật chung nhất của tự nhiên, xã hội, tư duy và vị trí, vai trò của con người trong thế giới, trên lập trường duy vật biện chứng.",
    hints: ["So sánh với đối tượng của các khoa học cụ thể.", "Tính từ khóa: \u201cquy luật chung nhất\u201d."],
  },
  {
    id: "q04",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Theo Triết học Mác - Lênin, vấn đề cơ bản lớn của triết học là gì?",
    answers: [
      "Quan hệ giữa vật chất và vận động",
      "Quan hệ giữa tư duy và tồn tại",
      "Quan hệ giữa lý luận và thực tiễn",
      "Quan hệ giữa tự nhiên và xã hội",
    ],
    correctAnswers: [1],
    explanation:
      "Vấn đề cơ bản của triết học là mối quan hệ giữa tư duy và tồn tại, tức giữa ý thức và vật chất - nền tảng phân chia chủ nghĩa duy vật và chủ nghĩa duy tâm.",
    hints: ["Cụm từ quen thuộc: \u201ctư duy và tồn tại\u201d.", "Xoay quanh hai trường phái lớn: duy vật - duy tâm."],
  },
  {
    id: "q05",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Hai mặt của vấn đề cơ bản của triết học là gì?",
    answers: [
      "Vật chất có trước hay ý thức có trước; con người có thể nhận thức được thế giới hay không",
      "Tự nhiên có trước hay xã hội có trước",
      "Cái riêng và cái chung, cái chung sinh ra cái riêng",
      "Lợi ích cá nhân và lợi ích cộng đồng",
    ],
    correctAnswers: [0],
    explanation:
      "Mặt thứ nhất trả lời câu hỏi giữa vật chất và ý thức cái nào có trước; mặt thứ hai trả lời con người có khả năng nhận thức thế giới hay không.",
    hints: ["Một mặt về \u201ccái gì có trước\u201d.", "Một mặt về \u201ckhả năng nhận thức\u201d."],
  },
  {
    id: "q06",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Các hình thức cơ bản của chủ nghĩa duy vật theo trình tự lịch sử là gì?",
    answers: [
      "Duy vật tầm thường - duy vật siêu hình - duy vật biện chứng",
      "Duy vật chất phác - duy vật tầm thường - duy vật biện chứng",
      "Duy vật chất phác - duy vật siêu hình - duy vật biện chứng",
      "Duy vật biện chứng - duy vật siêu hình - duy vật chất phác",
    ],
    correctAnswers: [2],
    explanation:
      "Ba hình thức cơ bản lần lượt là chủ nghĩa duy vật chất phác (cổ đại), chủ nghĩa duy vật siêu hình (thế kỷ XVII-XVIII) và chủ nghĩa duy vật biện chứng (của Mác).",
    hints: ["Hình thức sớm nhất mang tính trực quan, ngây thơ.", "Hình thức cao nhất là của C. Mác."],
  },
  {
    id: "q07",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Ba phát minh lớn của khoa học tự nhiên tạo cơ sở cho sự ra đời của chủ nghĩa duy vật biện chứng là gì?",
    answers: [
      "Định luật bảo toàn và chuyển hóa năng lượng, học thuyết tế bào, học thuyết tiến hóa của Đacuyn",
      "Kính thiên văn, kính hiển vi và máy hơi nước",
      "Thuyết tương đối, thuyết lượng tử và nguyên tố phóng xạ",
      "Điện từ trường, bảng tuần hoàn và tia X",
    ],
    correctAnswers: [0],
    explanation:
      "Định luật bảo toàn năng lượng, học thuyết tế bào và học thuyết tiến hóa đã chứng minh tính biện chứng của thế giới vật chất, là cơ sở khoa học tự nhiên cho triết học Mác.",
    hints: ["Cả ba đều ra đời nửa đầu thế kỷ XIX.", "Hai trong số đó liên quan Đacuyn và tế bào."],
  },
  {
    id: "q08",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Khẳng định nào sau đây là đúng?",
    answers: [
      "Triết học là \u201ckhoa học của mọi khoa học\u201d nên đứng trên mọi khoa học",
      "Triết học Mác ra đời giữa thế kỷ XIX là một tất yếu lịch sử",
      "Triết học Mác ra đời hoàn toàn ngẫu nhiên",
      "Triết học Mác ra đời để thay thế mọi khoa học cụ thể",
    ],
    correctAnswers: [1],
    explanation:
      "Sự ra đời của Triết học Mác là kết quả tất yếu của các điều kiện kinh tế - xã hội, tiền đề lý luận và khoa học tự nhiên cuối những năm 40 thế kỷ XIX.",
    hints: ["Loại bỏ các phương án tuyệt đối hóa vai trò triết học.", "\u201cTất yếu lịch sử\u201d phản ánh đúng bản chất."],
  },
  {
    id: "q09",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Theo quan điểm triết học Mác - Lênin, thế giới thống nhất ở tính gì?",
    answers: ["Tính vật chất", "Tính ý niệm", "Tính thần thánh", "Tính vận động thuần túy"],
    correctAnswers: [0],
    explanation:
      "Thế giới vật chất là duy nhất, thống nhất ở tính vật chất; mọi sự vật, hiện tượng đều là những dạng tồn tại khác nhau của vật chất đang vận động.",
    hints: ["Đây là luận điểm căn bản của chủ nghĩa duy vật.", "Quan hệ với khái niệm \u201cvật chất\u201d."],
  },
  {
    id: "q10",
    chapterId: "c1",
    field: "Triết học và vai trò của nó",
    question: "Điền từ còn thiếu: Vấn đề cơ bản của triết học là mối quan hệ giữa ....... và .......",
    answers: [
      "tư duy - tồn tại",
      "tự nhiên - xã hội",
      "cá nhân - cộng đồng",
      "chân thật - giả dối",
    ],
    correctAnswers: [0],
    explanation: "Vấn đề cơ bản của triết học là quan hệ giữa tư duy và tồn tại (ý thức và vật chất).",
    hints: ["Ôn lại phạm trù nền tảng của triết học."],
  },
  {
    id: "q11",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Theo V.I. Lênin, vật chất là gì?",
    answers: [
      "Phạm trù triết học chỉ thực tại khách quan, được đem lại cho con người trong cảm giác",
      "Tổng thể các vật thể cụ thể đang tồn tại trong vũ trụ",
      "Cái do ý thức và tinh thần sản sinh ra",
      "Năng lượng và khối lượng của các sự vật",
    ],
    correctAnswers: [0],
    explanation:
      "Theo Lênin, vật chất là phạm trù triết học chỉ thực tại khách quan, được đem lại cho con người trong cảm giác, tồn tại không lệ thuộc vào cảm giác.",
    hints: ["Từ khóa: \u201cthực tại khách quan\u201d.", "So sánh với định nghĩa của chủ nghĩa duy tâm."],
  },
  {
    id: "q12",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Hình thức vận động nào sau đây là hình thức vận động thấp nhất?",
    answers: ["Vận động cơ học", "Vận động vật lý", "Vận động hóa học", "Vận động sinh học"],
    correctAnswers: [0],
    explanation:
      "Vận động cơ học là hình thức vận động đơn giản, thấp nhất; cao lần lượt là vật lý, hóa học, sinh học và xã hội.",
    hints: ["Xếp các hình thức theo độ phức tạp tăng dần."],
  },
  {
    id: "q13",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Nguồn gốc tự nhiên của ý thức là gì?",
    answers: [
      "Bộ não người và thế giới khách quan tác động vào bộ não",
      "Chỉ có bộ não người",
      "Ý niệm tuyệt đối của tinh thần thế giới",
      "Cảm giác và tri giác của con người",
    ],
    correctAnswers: [0],
    explanation:
      "Nguồn gốc tự nhiên của ý thức gồm hai yếu tố: bộ não người (cơ quan vật chất) và thế giới khách quan tác động vào bộ não trong hoạt động thực tiễn.",
    hints: ["Cần đủ cả điều kiện \u201cvật chất\u201d và \u201cmôi trường tác động\u201d.", "Loại phương án chỉ nói riêng bộ não."],
  },
  {
    id: "q14",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Nguyên lý về mối liên hệ phổ biến khẳng định điều gì?",
    answers: [
      "Các sự vật, hiện tượng tồn tại rời rạc, biệt lập với nhau",
      "Các sự vật, hiện tượng liên hệ ràng buộc, quy định lẫn nhau một cách phổ biến",
      "Chỉ những sự vật giống nhau mới có liên hệ với nhau",
      "Liên hệ chỉ tồn tại trong suy nghĩ của con người",
    ],
    correctAnswers: [1],
    explanation:
      "Theo nguyên lý về mối liên hệ phổ biến, mọi sự vật, hiện tượng đều nằm trong mối liên hệ, ràng buộc, quy định, tác động lẫn nhau trên phạm vi toàn diện.",
    hints: ["Quan sát \u201cmọi thứ đều có liên hệ\u201d, tính phổ biến.", "Đối lập với quan điểm siêu hình 'cô lập'."],
  },
  {
    id: "q15",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Theo nguyên lý về sự phát triển, phát triển là gì?",
    answers: [
      "Sự vận động đi lên từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn",
      "Sự vận động tròn đều lặp lại trạng thái cũ",
      "Sự biến đổi về mặt số lượng đơn thuần",
      "Sự dời chuyển vị trí trong không gian",
    ],
    correctAnswers: [0],
    explanation:
      "Phát triển là quá trình vận động đi lên, là sự thay đổi về chất theo hướng ngày càng hoàn thiện, tuân theo các quy luật biện chứng.",
    hints: ["Khác với 'vận động' nói chung ở hướng đi lên.", "Gắn với sự thay đổi về chất."],
  },
  {
    id: "q16",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Theo quy luật mâu thuẫn, nguồn gốc của sự vận động và phát triển của sự vật là gì?",
    answers: [
      "Sự đấu tranh giữa các mặt đối lập bên trong sự vật",
      "Tác động từ bên ngoài sự vật",
      "Ý muốn của tôn giáo, thần thánh",
      "Sự phủ nhận hoàn toàn cái cũ",
    ],
    correctAnswers: [0],
    explanation:
      "Theo quy luật mâu thuẫn, sự đấu tranh giữa các mặt đối lập bên trong sự vật, hiện tượng chính là nguồn gốc bên trong của sự vận động và phát triển.",
    hints: ["Chú ý: nguồn gốc \u201cbên trong\u201d chứ không phải bên ngoài."],
  },
  {
    id: "q17",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Quy luật lượng - chất chỉ rõ mối quan hệ nào giữa lượng và chất?",
    answers: [
      "Sự thay đổi về số lượng dẫn đến sự thay đổi về chất và ngược lại (kèm bước nhảy)",
      "Chất không bao giờ thay đổi",
      "Chỉ có lượng thay đổi, chất không đổi",
      "Mối quan hệ giữa lượng và chất là ngẫu nhiên",
    ],
    correctAnswers: [0],
    explanation:
      "Quy luật lượng - chất chỉ ra: sự thay đổi dần dần về số lượng đến giới hạn (độ) dẫn đến bước nhảy về chất và ngược lại, chất mới lại tạo ra yêu cầu mới về lượng.",
    hints: ["Nội dung quen thuộc: \u201clượng đổi - chất đổi\u201d."],
  },
  {
    id: "q18",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Phủ định biện chứng có đặc trưng nào sau đây?",
    answers: [
      "Là sự tự thân phủ định, là tiền đề, điều kiện cho sự phát triển (có kế thừa)",
      "Phủ định sạch trơn cái cũ, xóa bỏ tất cả",
      "Phủ định lại một cách tùy tiện của con người",
      "Làm sự vật quay về điểm xuất phát cũ theo vòng tròn",
    ],
    correctAnswers: [0],
    explanation:
      "Phủ định biện chứng là sự tự thân phủ định, là tiền đề, điều kiện cho sự phát triển, trong đó cái mới kế thừa những yếu tố tích cực của cái cũ.",
    hints: ["Từ khóa: \u201ctự thân phủ định\u201d, \u201ckế thừa\u201d."],
  },
  {
    id: "q19",
    chapterId: "c2",
    field: "Chủ nghĩa duy vật biện chứng",
    question: "Thực tiễn có những hình thức cơ bản nào?",
    answers: [
      "Sản xuất vật chất, chính trị - xã hội, thực nghiệm khoa học",
      "Tư duy, tưởng tượng, trực giác",
      "Lao động trí óc và lao động chân tay",
      "Hoạt động giao lưu, tôn giáo, nghệ thuật",
    ],
    correctAnswers: [0],
    explanation:
      "Ba hình thức cơ bản của thực tiễn là sản xuất vật chất, chính trị - xã hội và thực nghiệm khoa học - đều là nguồn gốc và động lực của nhận thức.",
    hints: ["Gợi nhớ 3 trụ cột: \u201cvật chất - chính trị - khoa học\u201d."],
  },
  {
    id: "q20",
    chapterId: "c3",
    field: "Chủ nghĩa duy vật lịch sử",
    question: "Vai trò của sản xuất vật chất đối với sự tồn tại và phát triển của xã hội?",
    answers: [
      "Là cơ sở trực tiếp quyết định sự tồn tại, phát triển của xã hội",
      "Chỉ là một hoạt động phụ, không quan trọng",
      "Không có ảnh hưởng gì đến xã hội",
      "Chỉ quyết định lĩnh vực kinh tế, không ảnh hưởng văn hóa",
    ],
    correctAnswers: [0],
    explanation:
      "Sản xuất vật chất quyết định sự tồn tại, phát triển của xã hội, quyết định các quan hệ xã hội và đời sống tinh thần của con người; là cơ sở của mọi hoạt động.",
    hints: ["Đây là quyết định thứ \u201ccơ bản nhất\u201d của xã hội."],
  },
  {
    id: "q21",
    chapterId: "c3",
    field: "Chủ nghĩa duy vật lịch sử",
    question: "Phương thức sản xuất là gì?",
    answers: [
      "Sự thống nhất giữa lực lượng sản xuất và quan hệ sản xuất",
      "Tổng thể các ngành nghề trong nền kinh tế",
      "Cách thức phân phối sản phẩm lao động",
      "Hệ thống các công cụ lao động trong xã hội",
    ],
    correctAnswers: [0],
    explanation:
      "Phương thức sản xuất là sự thống nhất biện chứng giữa lực lượng sản xuất và quan hệ sản xuất trong một quá trình sản xuất vật chất nhất định.",
    hints: ["Hai yếu tố cấu thành: \u201clực lượng\u201d + \u201cquan hệ\u201d."],
  },
  {
    id: "q22",
    chapterId: "c3",
    field: "Chủ nghĩa duy vật lịch sử",
    question: "Hình thái kinh tế - xã hội là gì?",
    answers: [
      "Những xã hội cụ thể được hiểu là hệ thống yếu tố cấu thành, gắn với quan hệ sản xuất đặc trưng ở một giai đoạn lịch sử nhất định",
      "Một tổ chức chính trị - xã hội cụ thể nào đó",
      "Sự liên kết tự nguyện của các cá nhân trong xã hội",
      "Cộng đồng dân cư sinh sống trên một lãnh thổ",
    ],
    correctAnswers: [0],
    explanation:
      "Hình thái kinh tế - xã hội là những xã hội cụ thể trong lịch sử, là hệ thống các yếu tố cấu thành gắn với quan hệ sản xuất đặc trưng ở một giai đoạn phát triển nhất định.",
    hints: ["Gắn chặt với \u201cquan hệ sản xuất đặc trưng\u201d."],
  },
  {
    id: "q23",
    chapterId: "c3",
    field: "Chủ nghĩa duy vật lịch sử",
    question: "Vai trò của quần chúng nhân dân trong lịch sử là gì?",
    answers: [
      "Là chủ thể sáng tạo chân chính làm nên lịch sử",
      "Chỉ là khán giả đứng ngoài quan sát lịch sử",
      "Chỉ có các cá nhân kiệt xuất mới làm nên lịch sử",
      "Quần chúng chỉ thụ động theo sau các vĩ nhân",
    ],
    correctAnswers: [0],
    explanation:
      "Quần chúng nhân dân là chủ thể sáng tạo chân chính làm nên lịch sử thông qua hoạt động sản xuất, đấu tranh chính trị - xã hội và sáng tạo văn hóa.",
    hints: ["Xem xét trong mối quan hệ với vai trò của cá nhân kiệt xuất."],
  },
  {
    id: "q24",
    chapterId: "c3",
    field: "Chủ nghĩa duy vật lịch sử",
    question: "Giai cấp theo định nghĩa của V.I. Lênin là gì?",
    answers: [
      "Những tập đoàn người có địa vị khác nhau trong một hệ thống sản xuất nhất định của lịch sử",
      "Những người có cùng sở thích và thói quen sinh hoạt",
      "Các cộng đồng có chung tín ngưỡng, tôn giáo",
      "Những người cùng nghề nghiệp trong xã hội",
    ],
    correctAnswers: [0],
    explanation:
      "Theo Lênin, giai cấp là những tập đoàn người có địa vị khác nhau trong một hệ thống sản xuất nhất định, khác nhau về quan hệ sở hữu, tổ chức quản lý và phương thức phân phối.",
    hints: ["Mấu chốt: \u201cđịa vị trong hệ thống sản xuất\u201d."],
  },
];

export const quizChapterName = (chapterId: string): string => {
  const chapter = activeSubject.chapters.find(item => item.id === chapterId);
  return chapter?.name ?? "Triết học Mác - Lênin";
};

/* ------------------------------------------------------------------ */
/* Flashcard Triết học Mác - Lênin                                      */
/* ------------------------------------------------------------------ */

export const flashcards: Flashcard[] = [
  {
    id: "f01",
    front: "Thế giới quan duy vật biện chứng là gì?",
    back: "Thế giới quan duy vật biện chứng là hệ thống quan điểm duy vật biện chứng về thế giới và về vị trí, vai trò của con người trong thế giới đó.",
    bullets: [
      "Thừa nhận tính thứ nhất của vật chất, tính thứ hai của ý thức.",
      "Thế giới tồn tại khách quan, vận động và phát triển theo quy luật biện chứng.",
      "Con người có khả năng nhận thức và cải tạo thế giới.",
    ],
  },
  {
    id: "f02",
    front: "Phạm trù 'vật chất' trong Triết học Mác - Lênin là gì?",
    back: "Vật chất là phạm trù triết học chỉ thực tại khách quan, được đem lại cho con người trong cảm giác, tồn tại không lệ thuộc vào cảm giác.",
    bullets: [
      "Vật chất là thực tại khách quan.",
      "Thực tại khách quan được đem lại cho con người trong cảm giác.",
      "Tồn tại không lệ thuộc vào cảm giác, ý thức.",
    ],
  },
  {
    id: "f03",
    front: "Vận động là gì? Các hình thức vận động cơ bản?",
    back: "Vận động là phương thức tồn tại của vật chất, là mọi sự biến đổi nói chung. Có 5 hình thức vận động cơ bản.",
    bullets: [
      "Cơ học, vật lý, hóa học, sinh học, xã hội.",
      "Vận động là thuộc tính tất yếu, khách quan của vật chất.",
      "Các hình thức vận động liên hệ, chuyển hóa lẫn nhau.",
    ],
  },
  {
    id: "f04",
    front: "Ý thức có nguồn gốc tự nhiên và nguồn gốc xã hội như thế nào?",
    back: "Nguồn gốc tự nhiên gồm bộ não người và thế giới khách quan; nguồn gốc xã hội là lao động và ngôn ngữ.",
    bullets: [
      "Bộ não người là cơ quan vật chất của ý thức.",
      "Lao động và ngôn ngữ là nguồn gốc xã hội của ý thức.",
      "Biến đổi thế giới vật chất thành tư tưởng thông qua hoạt động thực tiễn.",
    ],
  },
  {
    id: "f05",
    front: "Bản chất của ý thức là gì?",
    back: "Ý thức là hình ảnh chủ quan của thế giới khách quan; là quá trình phản ánh tích cực, tự giác, sáng tạo thế giới vật chất.",
    bullets: [
      "Ý thức là hình ảnh chủ quan của thế giới khách quan.",
      "Phản ánh là thuộc tính chung của vật chất, ý thức là hình thức phản ánh cao nhất.",
      "Ý thức mang bản chất xã hội, gắn với lao động và ngôn ngữ.",
    ],
  },
  {
    id: "f06",
    front: "Nguyên lý về mối liên hệ phổ biến là gì?",
    back: "Mọi sự vật, hiện tượng đều nằm trong mối liên hệ, ràng buộc, quy định, tác động lẫn nhau một cách phổ biến.",
    bullets: [
      "Tính khách quan, tính phổ biến, tính đa dạng của liên hệ.",
      "Yêu cầu rút ra: quan điểm toàn diện.",
    ],
  },
  {
    id: "f07",
    front: "Nguyên lý về sự phát triển là gì?",
    back: "Mọi sự vật, hiện tượng luôn vận động, biến đổi đi lên từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn.",
    bullets: [
      "Phát triển là sự thay đổi về chất theo hướng đi lên.",
      "Nguồn gốc: mâu thuẫn; cách thức: tích lũy về lượng; khuynh hướng: phủ định của phủ định.",
      "Yêu cầu: quan điểm phát triển và nguyên tắc lịch sử - cụ thể.",
    ],
  },
  {
    id: "f08",
    front: "Quy luật mâu thuẫn (thống nhất và đấu tranh của các mặt đối lập) là gì?",
    back: "Quy luật chỉ rõ nguồn gốc bên trong của sự vận động, phát triển: sự đấu tranh giữa các mặt đối lập tạo nên động lực.",
    bullets: [
      "Mâu thuẫn là hiện tượng khách quan, phổ biến.",
      "Mặt đối lập, sự thống nhất và đấu tranh của các mặt đối lập.",
      "Chuyển hóa của các mặt đối lập là bước nhảy.",
    ],
  },
  {
    id: "f09",
    front: "Quy luật lượng - chất là gì?",
    back: "Sự tích lũy về lượng đến một giới hạn nhất định (độ) sẽ làm chuyển hóa về chất; chất mới lại tạo ra yêu cầu mới cho lượng.",
    bullets: [
      "Độ, điểm nút, bước nhảy là các phạm trù cơ bản của quy luật.",
      "Ý nghĩa: tích lũy về lượng để thay đổi chất và ngược lại.",
    ],
  },
  {
    id: "f10",
    front: "Quy luật phủ định của phủ định là gì?",
    back: "Quy luật chỉ ra khuynh hướng chung của sự phát triển: phát triển theo đường xoáy ốc, qua phủ định biện chứng nhiều lần.",
    bullets: [
      "Phủ định biện chứng: tự thân phủ định, có kế thừa.",
      "Phát triển không theo đường thẳng mà theo đường xoáy ốc.",
      "Cái mới ra đời từ cái cũ, tiến bộ hơn.",
    ],
  },
  {
    id: "f11",
    front: "Thực tiễn là gì? Các hình thức cơ bản của thực tiễn?",
    back: "Thực tiễn là toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải tạo thế giới.",
    bullets: [
      "Ba hình thức: sản xuất vật chất, chính trị - xã hội, thực nghiệm khoa học.",
      "Thực tiễn là cơ sở, động lực, mục đích và tiêu chuẩn của nhận thức.",
    ],
  },
  {
    id: "f12",
    front: "Lực lượng sản xuất là gì?",
    back: "Lực lượng sản xuất là toàn bộ các nhân tố vật chất, kỹ thuật của quá trình sản xuất, trong đó người lao động giữ vai trò quyết định.",
    bullets: [
      "Gồm người lao động và tư liệu sản xuất (công cụ lao động là yếu tố động nhất).",
      "Người lao động có trình độ, kinh nghiệm là yếu tố quyết định.",
    ],
  },
  {
    id: "f13",
    front: "Quan hệ sản xuất là gì? Gồm các mặt nào?",
    back: "Quan hệ sản xuất là quan hệ giữa người với người trong quá trình sản xuất vật chất, là quan hệ kinh tế cơ bản của xã hội.",
    bullets: [
      "Quan hệ sở hữu về tư liệu sản xuất (mặt quyết định, đặc trưng).",
      "Quan hệ tổ chức quản lý sản xuất.",
      "Quan hệ phân phối sản phẩm lao động.",
    ],
  },
  {
    id: "f14",
    front: "Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất?",
    back: "Quan hệ sản xuất được hình thành phù hợp với trình độ của lực lượng sản xuất; khi lực lượng sản xuất phát triển, quan hệ sản xuất cũ không còn phù hợp sẽ được thay thế.",
    bullets: [
      "Lực lượng sản xuất quyết định quan hệ sản xuất.",
      "Quan hệ sản xuất phản tác động trở lại lực lượng sản xuất.",
    ],
  },
  {
    id: "f15",
    front: "Hình thái kinh tế - xã hội là gì?",
    back: "Hình thái kinh tế - xã hội là những xã hội cụ thể được hiểu là hệ thống các yếu tố cấu thành, gắn với một quan hệ sản xuất đặc trưng ở một giai đoạn phát triển nhất định.",
    bullets: [
      "Cấu trúc: lực lượng sản xuất - quan hệ sản xuất (cơ sở hạ tầng) - kiến trúc thượng tầng.",
      "Sự phát triển của các hình thái là một quá trình lịch sử - tự nhiên.",
    ],
  },
  {
    id: "f16",
    front: "Bản chất của nhà nước theo chủ nghĩa Mác - Lênin?",
    back: "Nhà nước là bộ máy đặc biệt do giai cấp thống trị lập ra để bảo vệ lợi ích của mình, nơi củng cố quyền lực kinh tế, chính trị của giai cấp thống trị.",
    bullets: [
      "Nhà nước ra đời khi xã hội có sự phân chia giai cấp.",
      "Ngoài tính giai cấp, nhà nước còn có tính xã hội (xã hội hóa một phần chức năng).",
      "Chức năng: cưỡng chế và tổ chức xây dựng.",
    ],
  },
  {
    id: "f17",
    front: "Cách mạng xã hội là gì?",
    back: "Cách mạng xã hội là sự chuyển biến căn bản, toàn diện về mọi lĩnh vực, đánh dấu sự thay thế hình thái kinh tế - xã hội này bằng hình thái kinh tế - xã hội khác.",
    bullets: [
      "Nguyên nhân sâu xa: mâu thuẫn giữa lực lượng sản xuất và quan hệ sản xuất.",
      "Nguyên nhân trực tiếp: mâu thuẫn giai cấp đối kháng gay gắt.",
    ],
  },
  {
    id: "f18",
    front: "Vai trò của quần chúng nhân dân và cá nhân trong lịch sử?",
    back: "Quần chúng nhân dân là chủ thể sáng tạo chân chính làm nên lịch sử; cá nhân kiệt xuất có vai trò thúc đẩy nhưng không thay thế được quần chúng.",
    bullets: [
      "Quần chúng sáng tạo ra của cải vật chất, chiến đấu bảo vệ và phát triển văn hóa.",
      "Cá nhân kiệt xuất chỉ phát huy vai trò khi đại diện cho lợi ích của quần chúng.",
    ],
  },
  {
    id: "f19",
    front: "Tồn tại xã hội và ý thức xã hội là gì?",
    back: "Tồn tại xã hội quyết định ý thức xã hội; ý thức xã hội tác động trở lại tồn tại xã hội, có tính độc lập tương đối.",
    bullets: [
      "Tồn tại xã hội: sinh hoạt vật chất và điều kiện sinh hoạt vật chất của xã hội.",
      "Ý thức xã hội: toàn bộ đời sống tinh thần của xã hội.",
      "Tính độc lập tương đối: vượt trước hoặc lạc hậu so với tồn tại xã hội.",
    ],
  },
  {
    id: "f20",
    front: "Phương pháp luận của chủ nghĩa duy vật biện chứng đem lại điều gì?",
    back: "Phương pháp luận biện chứng duy vật yêu cầu xem xét sự vật trong mối liên hệ phổ biến, trong sự vận động, phát triển và trong hoàn cảnh lịch sử - cụ thể.",
    bullets: [
      "Quan điểm toàn diện, quan điểm phát triển, quan điểm lịch sử - cụ thể.",
      "Kết hợp giữa lý luận và thực tiễn.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Bảng xếp hạng                                                        */
/* ------------------------------------------------------------------ */

export const podium: LeaderEntry[] = [
  {
    rank: 2,
    name: "Trần Thị B",
    initials: "TB",
    level: 42,
    streak: 18,
    points: 18000,
    title: "Bậc thầy Lịch sử",
    color: "bg-yellow-deep text-ink",
  },
  {
    rank: 1,
    name: "Lê Văn Hùng",
    initials: "LH",
    level: 55,
    streak: 25,
    points: 25000,
    title: "Nhà Vô Địch Bất Bại",
    color: "bg-yellow text-ink",
  },
  {
    rank: 3,
    name: "Phạm Quang Đ",
    initials: "PĐ",
    level: 38,
    streak: 15,
    points: 15000,
    title: "Tân Binh Tiềm Năng",
    color: "bg-cyan text-ink",
  },
];

export const leaderboard: LeaderEntry[] = [
  { rank: 4, name: "Hoàng Văn K", initials: "HK", level: 35, streak: 14, points: 12450, title: "Nhanh như chớp", color: "bg-orange text-ink" },
  { rank: 5, name: "Nguyễn Thu T", initials: "NT", level: 32, streak: 7, points: 11200, color: "bg-cyan text-ink" },
  { rank: 6, name: "Mai L", initials: "ML", level: 30, streak: 5, points: 10800, color: "bg-yellow-deep text-ink" },
  { rank: 7, name: "Tuấn A", initials: "TA", level: 28, streak: 12, points: 9500, color: "bg-green text-ink" },
  { rank: 8, name: "Đỗ Ngọc H", initials: "ĐH", level: 26, streak: 9, points: 8900, color: "bg-cyan text-ink" },
  { rank: 9, name: "Vũ Quỳnh A", initials: "VA", level: 24, streak: 4, points: 7300, color: "bg-yellow text-ink" },
  { rank: 10, name: "Bùi Minh C", initials: "BC", level: 22, streak: 6, points: 6100, color: "bg-orange text-ink" },
];

export const myRank: MyRank = {
  rank: 42,
  points: 4850,
  nextTarget: 2500,
};

/* ------------------------------------------------------------------ */
/* Hồ sơ cá nhân                                                        */
/* ------------------------------------------------------------------ */

export const profile: Profile = {
  name: "Nguyễn Nhật Minh",
  role: "Học sinh Vàng",
  level: 42,
  totalPoints: 24500,
  streak: 14,
  accuracy: 85,
  hours: "45h",
  chapters: [
    { name: "Khái luận về Triết học", score: 92, maxScore: 100 },
    { name: "Duy vật, duy tâm", score: 88, maxScore: 100 },
    { name: "Vật chất và ý thức", score: 76, maxScore: 100 },
    { name: "Phép biện chứng duy vật", score: 68, maxScore: 100 },
    { name: "Nhận thức luận", score: 81, maxScore: 100 },
    { name: "Hình thái kinh tế - xã hội", score: 59, maxScore: 100 },
  ],
  examHistory: [
    { id: "h1", date: "02 giờ trước", title: "Quiz: Vật chất và ý thức", score: "9.5/10", result: true, subject: "Triết học Mác - Lênin • Chương 2" },
    { id: "h2", date: "Hôm qua", title: "Kiểm tra giữa kỳ: Đề số 2", score: "8.0/10", result: true, subject: "Triết học Mác - Lênin • Tổng hợp" },
    { id: "h3", date: "3 ngày trước", title: "Đề thi thử cuối kỳ", score: "7.0/10", result: true, subject: "Triết học Mác - Lênin • Toàn bộ chương" },
    { id: "h4", date: "6 ngày trước", title: "Luyện tập: Phép biện chứng", score: "5.5/10", result: false, subject: "Triết học Mác - Lênin • Chương 2" },
  ],
  badges: [
    { id: "b1", label: "Chuyên cần", icon: "calendar_month", earned: true, color: "bg-cyan text-ink" },
    { id: "b2", label: "Vua tốc độ", icon: "bolt", earned: true, color: "bg-yellow text-ink" },
    { id: "b3", label: "Full combo 7 ngày", icon: "local_fire_department", earned: true, color: "bg-orange text-ink" },
    { id: "b4", label: "Thiên tài Triết học", icon: "psychology", earned: true, color: "bg-green text-ink" },
    { id: "b5", label: "Bách phát bách trúng", icon: "ads_click", earned: false, color: "bg-surface3 text-faint" },
    { id: "b6", label: "Cầu thủ xuất sắc", icon: "sports_score", earned: false, color: "bg-surface3 text-faint" },
  ],
};

/* ------------------------------------------------------------------ */
/* Hoạt động gần đây + Thư viện                                         */
/* ------------------------------------------------------------------ */

export const recentActivity: ActivityItem[] = [
  { id: "a1", score: 9.5, title: "Quiz: Vật chất và ý thức", subject: "Triết học Mác - Lênin", time: "2 giờ trước", color: "bg-cyan text-ink" },
  { id: "a2", score: 8.0, title: "Bài tập tuần 3", subject: "Tư tưởng Hồ Chí Minh", time: "Hôm qua", color: "bg-yellow-deep text-ink" },
  { id: "a3", score: 10, title: "Đề thi thử giữa kỳ", subject: "Lịch sử Đảng", time: "3 ngày trước", color: "bg-orange text-ink" },
];

export const libraryHps: LibraryHp[] = [
  { id: "l1", name: "Lịch sử văn minh thế giới", code: "HIS1001", icon: "public", chapters: 12, questions: 450, progress: 65, stripe: "bg-yellow-deep" },
  { id: "l2", name: "Triết học Mác - Lênin", code: "GENE1001", icon: "psychology", chapters: 8, questions: 320, progress: 30, stripe: "bg-cyan" },
  { id: "l3", name: "Toán cao cấp A1", code: "MAT1011", icon: "functions", chapters: 5, questions: 200, progress: 85, stripe: "bg-orange" },
];

export const featuredCourses: FeaturedCourse[] = [
  {
    id: "f1",
    tag: "Thịnh hành",
    tagColor: "bg-yellow-deep",
    title: "Đại số tuyến tính",
    description: "Học phần cốt lõi cho sinh viên khối ngành kỹ thuật và kinh tế.",
    emoji: "📐",
  },
  {
    id: "f2",
    tag: "Mới cập nhật",
    tagColor: "bg-orange",
    title: "Vật lý đại cương 1",
    description: "Ngân hàng câu hỏi mới nhất bám sát đề cương chi tiết năm nay.",
    emoji: "⚛️",
  },
];

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};