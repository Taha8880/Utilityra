// Single source of truth for categories and tools (used by the build and by tests).
// Tool entry: [id, category, glyph, nameAr, nameEn, descAr, descEn, extra?]
// extra: { lib: 'pdf' }  -> page loads the bundled pdf-lib.

export const CATEGORIES = [
  ['ai', 'AI', 'أدوات الذكاء الاصطناعي', 'AI Tools', 'مساعدون أذكياء للتلخيص والكتابة والترجمة والبرمجة.', 'Smart helpers for summarising, writing, translating and coding.'],
  ['text', 'Aa', 'النصوص والكتابة', 'Text & Writing', 'عدّ الكلمات وتنظيف النصوص وتحويلها ومقارنتها بدقة.', 'Count, clean, convert and compare text with precision.'],
  ['dev', '{}', 'أدوات المطورين', 'Developer Tools', 'تنسيق JSON وSQL وCSS، والتحقق من الأكواد، والتحويل بين الصيغ.', 'Format JSON, SQL and CSS, validate code and convert between formats.'],
  ['security', '#', 'الأمان والتشفير', 'Security & Hashing', 'كلمات مرور قوية وبصمات تشفير وأرقام عشوائية آمنة.', 'Strong passwords, cryptographic hashes and secure random numbers.'],
  ['seo', 'SEO', 'السيو والويب', 'SEO & Web', 'وسوم Meta وملفات robots وsitemap وروابط UTM لتحسين ظهور موقعك.', 'Meta tags, robots, sitemap and UTM links to improve your site’s visibility.'],
  ['calc', '%', 'الحاسبات والمال', 'Calculators & Finance', 'نسب مئوية وضرائب وقروض وفوائد وإحصاء، بنتائج فورية.', 'Percentages, VAT, loans, interest and statistics, with instant results.'],
  ['study', 'A+', 'الطلاب والدراسة', 'Students & Study', 'المعدل التراكمي والدرجات وخطط المذاكرة وتوثيق المراجع.', 'GPA, grades, study plans and reference formatting.'],
  ['convert', '⇄', 'التحويلات والوقت', 'Converters & Time', 'تحويل الوحدات والتواريخ (هجري وميلادي) والمناطق الزمنية.', 'Convert units, dates (Hijri/Gregorian) and time zones.'],
  ['files', 'PDF', 'ملفات PDF', 'PDF & Files', 'ادمج ملفات PDF وقسّمها وحوّل الصور إليها، كل ذلك داخل متصفحك.', 'Merge and split PDFs and turn images into PDF, all inside your browser.'],
  ['images', 'IMG', 'الصور', 'Images', 'اضغط الصور وقصّها وحوّلها دون رفعها إلى أي خادم.', 'Compress, crop and convert images without uploading them anywhere.'],
  ['design', 'Ui', 'التصميم والألوان', 'Design & Color', 'ألوان وتدرجات وظلال ورموز QR لتصاميم أنيقة.', 'Colours, gradients, shadows and QR codes for polished designs.']
];

export const TOOLS = [
  // ───────────── AI ─────────────
  ['ai-assistant', 'ai', 'AI', 'مساعد Utilityra الذكي', 'Utilityra AI Assistant', 'محادثة ذكية تساعدك في الدراسة والعمل والبرمجة وحل المشكلات.', 'A smart chat for study, work, coding and problem solving.'],
  ['ai-summarizer', 'ai', 'Σ', 'ملخّص النصوص بالذكاء الاصطناعي', 'AI Text Summarizer', 'لخّص المقالات والمحاضرات والتقارير الطويلة في نقاط واضحة.', 'Turn long articles, lectures and reports into clear points.'],
  ['ai-paraphraser', 'ai', '↻', 'إعادة صياغة النصوص', 'AI Paraphraser & Tone Changer', 'أعد كتابة النص بأسلوب رسمي أو ودي أو مختصر مع الحفاظ على المعنى.', 'Rewrite text in a formal, friendly or concise tone, keeping the meaning.'],
  ['ai-translator', 'ai', 'ع↔A', 'مترجم ذكي', 'AI Translator', 'ترجمة طبيعية بين العربية والإنجليزية ولغات أخرى.', 'Natural translation between Arabic, English and more languages.'],
  ['ai-grammar-fixer', 'ai', '✓', 'المصحّح اللغوي', 'AI Grammar & Spelling Fixer', 'صحّح الأخطاء الإملائية والنحوية في العربية والإنجليزية.', 'Fix spelling and grammar mistakes in Arabic and English.'],
  ['ai-email-writer', 'ai', '@', 'كاتب الرسائل الإلكترونية', 'AI Email Writer', 'اكتب رسالة احترافية من فكرة بسيطة في ثوانٍ.', 'Write a professional email from a simple idea in seconds.'],
  ['ai-code-explainer', 'ai', '</>', 'شرح الكود', 'AI Code Explainer', 'افهم أي كود سطرًا بسطر مع أمثلة وتنبيهات.', 'Understand any code line by line with examples and caveats.'],
  ['ai-code-debugger', 'ai', '🐞', 'مصلّح الأخطاء البرمجية', 'AI Code Debugger', 'الصق الكود ورسالة الخطأ لتحصل على السبب والحل.', 'Paste code and the error to get the cause and a fix.'],
  ['ai-regex-generator', 'ai', '.*', 'مولّد Regex بالوصف', 'AI Regex Generator', 'صف النمط بكلماتك واحصل على تعبير نمطي مع الشرح.', 'Describe a pattern in words and get a regex with an explanation.'],
  ['ai-sql-generator', 'ai', 'SQL', 'مولّد استعلامات SQL', 'AI SQL Query Generator', 'حوّل طلبك إلى استعلام SQL جاهز مع شرح مختصر.', 'Turn your request into a ready SQL query with a short explanation.'],
  ['excel-formula-helper', 'ai', 'fx', 'مساعد معادلات Excel', 'AI Excel Formula Helper', 'اطلب المعادلة بالعربية أو الإنجليزية واحصل على الصيغة والشرح.', 'Ask in Arabic or English and get the formula with an explanation.'],
  ['ai-quiz-generator', 'ai', '?', 'مولّد الاختبارات', 'AI Quiz Generator', 'حوّل أي نص دراسي إلى أسئلة اختيار من متعدد مع الإجابات.', 'Turn any study text into multiple-choice questions with answers.'],
  ['ai-study-explainer', 'ai', '💡', 'مبسّط الشرح الدراسي', 'AI Simple Explainer', 'اشرح أي موضوع بمستوى يناسبك مع أمثلة من الحياة.', 'Explain any topic at your level with real-life examples.'],
  ['ai-blog-writer', 'ai', '✎', 'كاتب المقالات', 'AI Blog Post Writer', 'مخطط ومقال كامل حول أي فكرة بأسلوب مناسب لمحركات البحث.', 'An outline and full article on any idea, written for search.'],
  ['ai-seo-titles', 'ai', 'T', 'مولّد عناوين وأوصاف SEO', 'AI SEO Titles & Descriptions', 'عناوين جذابة وأوصاف Meta ضمن الطول المناسب.', 'Catchy titles and meta descriptions at the right length.'],
  ['ai-social-posts', 'ai', '#', 'كاتب منشورات التواصل', 'AI Social Post Writer', 'منشورات وهاشتاجات لمنصات التواصل بنبرة تختارها.', 'Posts and hashtags for social platforms in your chosen tone.'],
  ['ai-resume-writer', 'ai', 'CV', 'كاتب السيرة وخطاب التقديم', 'AI Resume & Cover Letter', 'صياغة نقاط السيرة الذاتية وخطاب التقديم بشكل مقنع.', 'Write persuasive resume bullets and cover letters.'],
  ['ai-product-description', 'ai', '🛍', 'وصف المنتجات', 'AI Product Description', 'وصف تسويقي جذاب لمنتجك للمتاجر الإلكترونية.', 'Compelling product copy for online stores.'],
  ['ai-name-ideas', 'ai', '✦', 'أفكار الأسماء', 'AI Name Ideas', 'اقتراحات لأسماء المشاريع والمنتجات والقنوات.', 'Name ideas for projects, products and channels.'],

  // ───────────── Text ─────────────
  ['word-counter', 'text', 'Aa', 'عدّاد الكلمات والحروف', 'Word & Character Counter', 'احسب الكلمات والحروف والجمل والفقرات ووقت القراءة فورًا.', 'Count words, characters, sentences, paragraphs and reading time instantly.'],
  ['case-converter', 'text', 'aA', 'تحويل حالة الأحرف', 'Case Converter', 'حوّل النص إلى UPPER وlower وTitle وcamelCase وsnake_case وغيرها.', 'Convert text to UPPER, lower, Title, camelCase, snake_case and more.'],
  ['text-cleaner', 'text', '✂', 'منظّف النصوص', 'Text Cleaner', 'احذف المسافات الزائدة والأسطر الفارغة والرموز غير المرغوبة.', 'Remove extra spaces, blank lines and unwanted characters.'],
  ['line-sorter', 'text', '↕', 'ترتيب الأسطر', 'Line Sorter', 'رتّب الأسطر أبجديًا أو رقميًا أو بالطول أو اعكسها أو اخلطها.', 'Sort lines alphabetically, numerically, by length, reverse or shuffle.'],
  ['duplicate-line-remover', 'text', '⧉', 'حذف الأسطر المكررة', 'Duplicate Line Remover', 'أزل الأسطر المتكررة مع الحفاظ على الترتيب.', 'Remove repeated lines while keeping the order.'],
  ['find-replace', 'text', '⇆', 'بحث واستبدال', 'Find & Replace', 'ابحث عن نص أو نمط regex واستبدله في كل المستند.', 'Find text or a regex and replace it across the document.'],
  ['text-compare', 'text', '≠', 'مقارنة نصين', 'Text Compare (Diff)', 'اعرض الفروق بين نسختين من النص سطرًا بسطر.', 'See the differences between two versions of text line by line.'],
  ['word-frequency', 'text', '📊', 'تكرار الكلمات', 'Word Frequency Counter', 'اعرف أكثر الكلمات تكرارًا في أي نص.', 'Find the most frequent words in any text.'],
  ['reading-time', 'text', '⏱', 'وقت القراءة', 'Reading Time Calculator', 'قدّر مدة قراءة أو إلقاء النص بسرعات مختلفة.', 'Estimate how long a text takes to read or speak.'],
  ['lorem-ipsum-generator', 'text', 'Li', 'مولّد نص تجريبي', 'Lorem Ipsum Generator', 'أنشئ نصًا تجريبيًا بالعربية أو اللاتينية لتصاميمك.', 'Generate placeholder text in Arabic or Latin for your designs.'],
  ['slug-generator', 'text', '/-', 'مولّد الروابط (Slug)', 'Slug Generator', 'حوّل العناوين إلى روابط نظيفة صديقة لمحركات البحث.', 'Turn titles into clean, SEO-friendly URL slugs.'],
  ['arabic-diacritics-remover', 'text', 'ـَ', 'حذف التشكيل العربي', 'Arabic Diacritics Remover', 'أزل التشكيل والتطويل أو وحّد الألف والياء والتاء المربوطة.', 'Strip tashkeel and tatweel or normalize alef, yeh and teh marbuta.'],
  ['number-to-words', 'text', '١٢٣', 'تفقيط الأرقام', 'Number to Words', 'حوّل الأرقام إلى كلمات بالعربية والإنجليزية.', 'Convert numbers to words in Arabic and English.'],
  ['markdown-preview', 'text', 'M↓', 'معاينة Markdown', 'Markdown Preview', 'اكتب Markdown وشاهد النتيجة وكود HTML مباشرة.', 'Write Markdown and see the result and HTML live.'],
  ['text-to-speech', 'text', '🔊', 'تحويل النص إلى صوت', 'Text to Speech', 'استمع إلى النص بصوت المتصفح بالعربية والإنجليزية.', 'Listen to your text using your browser voices.'],

  // ───────────── Dev ─────────────
  ['json-formatter', 'dev', '{}', 'منسّق JSON ومدقّقه', 'JSON Formatter & Validator', 'نسّق JSON وقلّصه وتحقق من صحته مع تحديد موضع الخطأ.', 'Format, minify and validate JSON with error positions.'],
  ['json-diff', 'dev', 'Δ', 'مقارنة JSON', 'JSON Diff', 'قارن كائنَي JSON واعرض المفاتيح المضافة والمحذوفة والمتغيرة.', 'Compare two JSON objects and list added, removed and changed keys.'],
  ['json-to-xml', 'dev', '<>', 'JSON إلى XML', 'JSON to XML', 'حوّل بيانات JSON إلى XML منسّق.', 'Convert JSON data to formatted XML.'],
  ['json-to-csv', 'dev', 'J→C', 'JSON إلى CSV', 'JSON to CSV', 'حوّل مصفوفة JSON إلى جدول CSV جاهز لـ Excel.', 'Turn a JSON array into CSV ready for Excel.'],
  ['csv-json-converter', 'dev', 'C→J', 'CSV إلى JSON', 'CSV to JSON', 'حوّل ملفات CSV إلى JSON مع دعم الفواصل والعناوين.', 'Convert CSV to JSON with delimiter and header support.'],
  ['csv-validator', 'dev', 'CSV✓', 'مدقّق CSV', 'CSV Validator', 'افحص اتساق الأعمدة والفراغات في ملف CSV.', 'Check column consistency and blanks in a CSV file.'],
  ['csv-to-markdown', 'dev', 'C→M', 'CSV إلى جدول Markdown', 'CSV to Markdown Table', 'حوّل CSV إلى جدول Markdown جاهز للنشر.', 'Turn CSV into a publish-ready Markdown table.'],
  ['markdown-table-generator', 'dev', '|-|', 'مولّد جداول Markdown', 'Markdown Table Generator', 'ابنِ جدول Markdown بعدد الصفوف والأعمدة الذي تريده.', 'Build a Markdown table with any rows and columns.'],
  ['sql-formatter', 'dev', 'SQL', 'منسّق SQL', 'SQL Formatter', 'رتّب استعلامات SQL لتصبح مقروءة.', 'Make SQL queries readable.'],
  ['xml-formatter', 'dev', 'XML', 'منسّق XML', 'XML Formatter', 'نسّق XML أو قلّصه مع التحقق من صحته.', 'Format or minify XML with validation.'],
  ['html-formatter', 'dev', 'HTML', 'منسّق HTML', 'HTML Formatter', 'رتّب كود HTML بمسافات بادئة صحيحة.', 'Indent HTML code properly.'],
  ['css-formatter', 'dev', 'CSS', 'منسّق CSS', 'CSS Formatter & Minifier', 'نسّق CSS أو قلّصه لتسريع الموقع.', 'Format or minify CSS to speed up your site.'],
  ['regex-tester', 'dev', '.*', 'مختبر Regex', 'Regex Tester', 'جرّب التعبيرات النمطية واعرض المطابقات مظلّلة.', 'Test regular expressions with highlighted matches.'],
  ['jwt-decoder', 'dev', 'JWT', 'فك تشفير JWT', 'JWT Decoder', 'اقرأ ترويسة وحمولة JWT محليًا دون إرسالها لأحد.', 'Read a JWT header and payload locally.'],
  ['base64-encoder-decoder', 'dev', 'B64', 'ترميز Base64', 'Base64 Encoder / Decoder', 'رمّز النصوص أو فكّها بصيغة Base64 مع دعم العربية.', 'Encode or decode Base64 with full Unicode support.'],
  ['url-encoder-decoder', 'dev', '%20', 'ترميز الروابط', 'URL Encoder / Decoder', 'رمّز الروابط أو فكّها بأمان.', 'Encode or decode URLs safely.'],
  ['url-parser', 'dev', '🔗', 'محلّل الروابط', 'URL Parser', 'قسّم الرابط إلى بروتوكول ونطاق ومسار ومعاملات.', 'Break a URL into protocol, host, path and parameters.'],
  ['html-entities', 'dev', '&;', 'رموز HTML', 'HTML Entities Encoder', 'حوّل الرموز الخاصة إلى كيانات HTML والعكس.', 'Convert special characters to HTML entities and back.'],
  ['uuid-generator', 'dev', 'ID', 'مولّد UUID', 'UUID Generator', 'أنشئ معرّفات UUID v4 فريدة بالجملة.', 'Generate unique UUID v4 identifiers in bulk.'],
  ['cron-validator', 'dev', '⏰', 'مدقّق Cron', 'Cron Expression Validator', 'افحص تعبير Cron واعرض مواعيد التنفيذ القادمة.', 'Validate a cron expression and preview next runs.'],
  ['timestamp-converter', 'dev', '⌚', 'محوّل Timestamp', 'Unix Timestamp Converter', 'حوّل بين Unix timestamp والتاريخ المقروء.', 'Convert between Unix timestamps and readable dates.'],

  // ───────────── Security ─────────────
  ['password-generator', 'security', '🔑', 'مولّد كلمات المرور', 'Password Generator', 'كلمات مرور قوية عشوائية تُولَّد داخل متصفحك فقط.', 'Strong random passwords generated only in your browser.'],
  ['password-strength-checker', 'security', '🛡', 'فاحص قوة كلمة المرور', 'Password Strength Checker', 'قيّم قوة كلمة المرور وزمن كسرها التقريبي دون إرسالها.', 'Rate password strength and rough crack time without sending it.'],
  ['sha256-hash', 'security', '#', 'مولّد البصمات (SHA)', 'Hash Generator (SHA)', 'احسب SHA-1 وSHA-256 وSHA-384 وSHA-512 لأي نص أو ملف.', 'Compute SHA-1, SHA-256, SHA-384 and SHA-512 for text or files.'],
  ['random-number-generator', 'security', '🎲', 'مولّد أرقام عشوائية', 'Random Number Generator', 'أرقام عشوائية آمنة ضمن نطاق تحدده، مع إمكانية منع التكرار.', 'Secure random numbers in a range, with optional uniqueness.'],
  ['binary-hex-converter', 'security', '0x', 'محوّل ثنائي وست عشري', 'Text ↔ Binary / Hex', 'حوّل النص إلى ثنائي أو Hex والعكس.', 'Convert text to binary or hex and back.'],
  ['number-base-converter', 'security', '2↔16', 'محوّل أنظمة العد', 'Number Base Converter', 'حوّل بين الثنائي والثماني والعشري والست عشري وأي نظام حتى 36.', 'Convert between binary, octal, decimal, hex and any base up to 36.'],

  // ───────────── SEO ─────────────
  ['meta-tag-generator', 'seo', '<m>', 'مولّد وسوم Meta', 'Meta Tag Generator', 'أنشئ وسوم العنوان والوصف وOpen Graph وTwitter.', 'Create title, description, Open Graph and Twitter tags.'],
  ['robots-txt-generator', 'seo', '🤖', 'مولّد robots.txt', 'robots.txt Generator', 'ابنِ ملف robots.txt صحيحًا لموقعك.', 'Build a correct robots.txt for your site.'],
  ['sitemap-generator', 'seo', '🗺', 'مولّد sitemap.xml', 'Sitemap Generator', 'حوّل قائمة روابط إلى sitemap.xml جاهز.', 'Turn a list of URLs into a ready sitemap.xml.'],
  ['serp-preview', 'seo', 'G', 'معاينة نتيجة جوجل', 'Google SERP Preview', 'شاهد كيف سيظهر عنوانك ووصفك في نتائج البحث.', 'See how your title and description look in search results.'],
  ['utm-builder', 'seo', 'UTM', 'منشئ روابط UTM', 'UTM Link Builder', 'أضف معاملات UTM لتتبع حملاتك في التحليلات.', 'Add UTM parameters to track campaigns in analytics.'],

  // ───────────── Calculators ─────────────
  ['percentage-calculator', 'calc', '%', 'حاسبة النسبة المئوية', 'Percentage Calculator', 'احسب النسب والزيادة والنقصان بسهولة.', 'Calculate percentages, increases and decreases.'],
  ['vat-calculator', 'calc', 'VAT', 'حاسبة ضريبة القيمة المضافة', 'VAT Calculator', 'أضف أو استخرج الضريبة من السعر بأي نسبة.', 'Add or extract VAT at any rate.'],
  ['discount-calculator', 'calc', '−%', 'حاسبة الخصم', 'Discount Calculator', 'احسب السعر بعد الخصم وقيمة التوفير.', 'Compute the price after discount and your savings.'],
  ['hourly-pay-calculator', 'calc', '$/h', 'حاسبة الأجر بالساعة', 'Hourly Pay Calculator', 'حوّل الأجر بين الساعة واليوم والشهر والسنة.', 'Convert pay between hourly, daily, monthly and yearly.'],
  ['loan-calculator', 'calc', '🏦', 'حاسبة القروض', 'Loan Calculator', 'احسب القسط الشهري وإجمالي الفوائد.', 'Calculate the monthly payment and total interest.'],
  ['compound-interest', 'calc', '📈', 'حاسبة الفائدة المركبة', 'Compound Interest Calculator', 'اعرف نمو استثمارك مع الإيداع الدوري.', 'See how your investment grows with regular deposits.'],
  ['bmi-calculator', 'calc', 'BMI', 'حاسبة مؤشر كتلة الجسم', 'BMI Calculator', 'احسب مؤشر كتلة الجسم وتصنيفه.', 'Calculate your body mass index and category.'],
  ['scientific-calculator', 'calc', 'π', 'الآلة الحاسبة العلمية', 'Scientific Calculator', 'حاسبة علمية بدوال مثلثية ولوغاريتمية وأقواس.', 'Scientific calculator with trig, logs and parentheses.'],
  ['statistics-calculator', 'calc', 'σ', 'حاسبة الإحصاء', 'Statistics Calculator', 'المتوسط والوسيط والمنوال والانحراف المعياري لأي قائمة أرقام.', 'Mean, median, mode and standard deviation for any list.'],

  // ───────────── Study ─────────────
  ['grade-calculator', 'study', 'A', 'حاسبة الدرجات', 'Grade Calculator', 'احسب نسبتك وتقديرك من الدرجات.', 'Calculate your percentage and letter grade.'],
  ['weighted-grade-calculator', 'study', 'w', 'حاسبة الدرجات الموزونة', 'Weighted Grade Calculator', 'احسب المعدل بأوزان مختلفة للواجبات والاختبارات، وما تحتاجه في النهائي.', 'Weighted average and the score you need on the final.'],
  ['gpa-calculator', 'study', 'GPA', 'حاسبة المعدل التراكمي', 'GPA Calculator', 'احسب GPA على مقياس 4 أو 5 بعدد ساعات كل مادة.', 'Calculate GPA on a 4 or 5 scale with credit hours.'],
  ['study-plan-generator', 'study', '📅', 'مولّد خطة المذاكرة', 'Study Plan Generator', 'وزّع موادك على الأيام المتبقية حتى الامتحان.', 'Spread your subjects across the days left until the exam.'],
  ['flashcard-maker', 'study', '🗂', 'بطاقات المراجعة', 'Flashcard Maker', 'أنشئ بطاقات سؤال وجواب وراجعها بالقلب والخلط.', 'Make Q&A flashcards and review them with flip and shuffle.'],
  ['citation-formatter', 'study', '❝', 'منسّق المراجع', 'Citation Formatter', 'نسّق مرجعك بصيغة APA أو MLA أو Chicago أو IEEE.', 'Format a reference in APA, MLA, Chicago or IEEE.'],

  // ───────────── Converters & time ─────────────
  ['unit-converter', 'convert', 'm↔ft', 'محوّل الوحدات', 'Unit Converter', 'الطول والوزن والحجم والحرارة والمساحة والسرعة.', 'Length, weight, volume, temperature, area and speed.'],
  ['file-size-converter', 'convert', 'MB', 'محوّل أحجام الملفات', 'File Size Converter', 'حوّل بين البايت والكيلوبايت والميجابايت والجيجابايت.', 'Convert between bytes, KB, MB, GB and TB.'],
  ['timezone-converter', 'convert', '🌍', 'محوّل المناطق الزمنية', 'Time Zone Converter', 'حوّل الوقت بين المدن والمناطق الزمنية.', 'Convert time between cities and time zones.'],
  ['date-difference', 'convert', 'Δd', 'الفرق بين تاريخين', 'Date Difference', 'احسب الأيام والأسابيع والأشهر بين تاريخين.', 'Calculate days, weeks and months between two dates.'],
  ['age-calculator', 'convert', '🎂', 'حاسبة العمر', 'Age Calculator', 'احسب عمرك بالسنوات والأشهر والأيام وموعد عيد ميلادك.', 'Calculate your age in years, months, days and next birthday.'],
  ['hijri-converter', 'convert', '☪', 'محوّل التاريخ الهجري والميلادي', 'Hijri ↔ Gregorian Converter', 'حوّل التاريخ بين الهجري (أم القرى) والميلادي.', 'Convert dates between Hijri (Umm al-Qura) and Gregorian.'],

  // ───────────── PDF & files ─────────────
  ['pdf-merge', 'files', 'PDF', 'دمج ملفات PDF', 'PDF Merger', 'ادمج عدة ملفات PDF في ملف واحد داخل المتصفح.', 'Merge several PDFs into one, inside your browser.', { lib: 'pdf' }],
  ['pdf-split', 'files', '✂PDF', 'تقسيم ملف PDF', 'PDF Splitter', 'استخرج صفحات محددة أو قسّم الملف إلى أجزاء.', 'Extract chosen pages or split a file into parts.', { lib: 'pdf' }],
  ['pdf-page-info', 'files', 'ⓘ', 'معلومات ملف PDF', 'PDF Info', 'اعرض عدد الصفحات ومقاساتها والبيانات الوصفية.', 'Show page count, page sizes and metadata.', { lib: 'pdf' }],
  ['images-to-pdf', 'files', 'IMG→PDF', 'تحويل الصور إلى PDF', 'Images to PDF', 'اجمع صورك في ملف PDF واحد بترتيب تختاره.', 'Combine images into one PDF in your order.', { lib: 'pdf' }],
  ['file-metadata-inspector', 'files', '🔍', 'فاحص بيانات الملف', 'File Metadata Inspector', 'اعرف نوع الملف وحجمه وتاريخ تعديله وبصمته.', 'See a file’s type, size, modified date and hash.'],

  // ───────────── Images ─────────────
  ['image-compressor', 'images', '⇩', 'ضغط الصور', 'Image Compressor', 'قلّل حجم الصور مع التحكم في الجودة، بلا رفع.', 'Shrink images with quality control, no upload.'],
  ['image-resizer', 'images', '⤢', 'تغيير مقاس الصور', 'Image Resizer', 'غيّر أبعاد الصورة بالبكسل أو بالنسبة.', 'Resize images by pixels or percentage.'],
  ['image-converter', 'images', 'JPG↔PNG', 'تحويل صيغ الصور', 'Image Format Converter', 'حوّل بين PNG وJPG وWebP فورًا.', 'Convert between PNG, JPG and WebP instantly.'],
  ['image-cropper', 'images', '⛶', 'قص الصور', 'Image Cropper', 'اقتص الصورة بنسب جاهزة أو بأبعاد مخصصة.', 'Crop images with preset ratios or custom size.'],
  ['image-rotate-flip', 'images', '⟳', 'تدوير الصور وقلبها', 'Rotate & Flip Image', 'دوّر الصورة 90° أو اقلبها أفقيًا ورأسيًا.', 'Rotate 90° or flip horizontally and vertically.'],
  ['image-filter-studio', 'images', '◐', 'مرشحات الصور', 'Image Filter Studio', 'سطوع وتباين وتشبع وأبيض وأسود وتمويه.', 'Brightness, contrast, saturation, grayscale and blur.'],
  ['image-watermark', 'images', '©', 'علامة مائية للصور', 'Image Watermark', 'أضف نصًا كعلامة مائية بموضع وشفافية تختارهما.', 'Add a text watermark with position and opacity.'],
  ['image-to-data-uri', 'images', 'data:', 'صورة إلى Data URI', 'Image to Data URI', 'حوّل الصورة إلى Base64 لتضمينها في الكود.', 'Convert an image to Base64 to embed in code.'],

  // ───────────── Design ─────────────
  ['color-converter', 'design', '🎨', 'محوّل الألوان', 'Color Converter', 'HEX وRGB وHSL مع منتقي ألوان ومعاينة.', 'HEX, RGB and HSL with a picker and preview.'],
  ['gradient-generator', 'design', '▤', 'مولّد التدرجات', 'CSS Gradient Generator', 'صمّم تدرجات لونية واحصل على كود CSS.', 'Design color gradients and copy the CSS.'],
  ['box-shadow-generator', 'design', '▣', 'مولّد الظلال', 'Box Shadow Generator', 'اضبط الظل بصريًا وانسخ كود CSS.', 'Tune a shadow visually and copy the CSS.'],
  ['reverse-text', 'text', '⇋', 'عكس النص', 'Reverse Text', 'اعكس الحروف أو الكلمات أو الأسطر بنقرة.', 'Reverse characters, words or lines in one click.'],
  ['html-preview', 'dev', '▶', 'معاينة HTML', 'HTML Live Preview', 'اكتب HTML وشاهد النتيجة في بيئة معزولة آمنة.', 'Write HTML and see the result in a safe sandbox.'],
  ['api-tester', 'dev', 'API', 'مختبر واجهات API', 'API Tester', 'أرسل طلبات GET/POST وغيرها وشاهد الحالة والزمن والترويسات.', 'Send GET/POST requests and inspect status, timing and headers.'],
  ['contrast-checker', 'design', 'Aa', 'فاحص تباين الألوان', 'Color Contrast Checker', 'تحقق من توافق ألوان النص والخلفية مع معايير WCAG.', 'Check text/background colors against WCAG.'],
  ['favicon-generator', 'design', '★', 'مولّد أيقونة الموقع', 'Favicon Generator', 'حوّل شعارك إلى أيقونات favicon وApple وAndroid.', 'Turn your logo into favicon, Apple and Android icons.'],
  ['pdf-rotate', 'files', '⟳', 'تدوير صفحات PDF', 'PDF Rotator', 'دوّر كل الصفحات أو صفحات محددة وحمّل الملف.', 'Rotate all or selected pages and download.', { lib: 'pdf' }],
  ['pdf-to-text', 'files', 'T', 'استخراج نص من PDF', 'PDF to Text', 'استخرج النص من ملفات PDF النصية داخل متصفحك.', 'Extract text from text-based PDFs in your browser.'],
  ['seo-auditor', 'seo', '✔', 'فاحص السيو للصفحة', 'SEO Page Auditor', 'افحص العنوان والوصف وH1 وcanonical وOpen Graph وغيرها لأي رابط.', 'Audit title, description, H1, canonical, Open Graph and more for any URL.'],
  ['security-header-checker', 'seo', '🛡', 'فاحص ترويسات الأمان', 'Security Headers Checker', 'تحقق من HSTS وCSP وغيرها من ترويسات الأمان لأي موقع.', 'Check HSTS, CSP and other security headers on any site.'],
  ['page-speed-checker', 'seo', '⚡', 'فاحص سرعة الصفحة', 'Page Speed Checker', 'قياس مبدئي لزمن الاستجابة والحجم والضغط ومعوقات العرض.', 'First-pass response time, size, compression and render-blocking check.'],
  ['accessibility-checker', 'seo', '♿', 'فاحص الوصولية', 'Accessibility Checker', 'اكتشف أبرز مشكلات الوصولية في أي صفحة.', 'Find the most common accessibility problems on any page.'],
  ['qr-code-generator', 'design', 'QR', 'مولّد رمز QR', 'QR Code Generator', 'أنشئ رمز QR لأي رابط أو نص وحمّله كصورة.', 'Create a QR code for any link or text and download it.']
];

export const toolObj = (t) => ({
  id: t[0], cat: t[1], glyph: t[2], ar: t[3], en: t[4], dAr: t[5], dEn: t[6], extra: t[7] || {}
});
