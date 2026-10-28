// More bilingual tool guides (merged into GUIDES in build.mjs)
export const GUIDES2 = {
 "case-converter": {
  "ar": {
   "intro": "محوّل حالة الأحرف يغيّر نصك بين الأحرف الكبيرة والصغيرة وحالة العنوان وغيرها بضغطة واحدة، وهو مفيد في تنسيق العناوين وأسماء المتغيرات.",
   "steps": [
    "الصق النص.",
    "اختر الحالة المطلوبة.",
    "انسخ النتيجة."
   ],
   "tips": [
    "الأحرف الكبيرة والصغيرة تخص الحروف اللاتينية؛ الحروف العربية لا تتأثر.",
    "راجع العناوين بعد التحويل لأن أدوات الحالة لا تعرف الأسماء الخاصة."
   ],
   "faq": [
    [
     "هل يعمل مع العربية؟",
     "لا يغيّر الحروف العربية لأنها لا تملك حالتين، لكنه يحافظ على النص كما هو."
    ]
   ]
  },
  "en": {
   "intro": "The case converter switches text between upper, lower, title case and more in one click. It is useful for headings and variable names.",
   "steps": [
    "Paste your text.",
    "Choose the case you need.",
    "Copy the result."
   ],
   "tips": [
    "Upper and lower case apply to Latin letters; Arabic letters are unchanged.",
    "Review headings after converting because the tool cannot recognise proper nouns."
   ],
   "faq": [
    [
     "Does it work with Arabic?",
     "It leaves Arabic letters as they are since they have no case, and keeps the text intact."
    ]
   ]
  }
 },
 "text-compare": {
  "ar": {
   "intro": "مقارنة النصوص تُظهر الفروق بين نسختين من نص، فتعرف ما أُضيف وما حُذف دون قراءة السطرين بحثًا عن التغيير.",
   "steps": [
    "ضع النص الأول في الخانة الأولى.",
    "ضع النص الثاني في الخانة الثانية.",
    "اقرأ الفروق المظلّلة."
   ],
   "tips": [
    "استخدمها لمراجعة تعديلات المقالات والعقود قبل الاعتماد.",
    "ابدأ بالنسخة الأقدم في الخانة الأولى لتفهم اتجاه التغيير."
   ],
   "faq": [
    [
     "هل تُحفظ نصوصي؟",
     "المقارنة تتم داخل متصفحك دون حفظ النص على خادم."
    ]
   ]
  },
  "en": {
   "intro": "Text compare highlights differences between two versions of a text so you can see what was added or removed without re-reading both.",
   "steps": [
    "Put the first text in the first box.",
    "Put the second text in the second box.",
    "Read the highlighted differences."
   ],
   "tips": [
    "Use it to review edits to articles or contracts before approving.",
    "Put the older version first so the direction of change is clear."
   ],
   "faq": [
    [
     "Is my text saved?",
     "The comparison runs in your browser and the text is not stored on a server."
    ]
   ]
  }
 },
 "find-replace": {
  "ar": {
   "intro": "البحث والاستبدال يستبدل كلمة أو عبارة في نص طويل دفعة واحدة، مع خيارات لمطابقة حالة الأحرف.",
   "steps": [
    "الصق النص.",
    "اكتب ما تبحث عنه وما تريد وضعه بدلًا منه.",
    "نفّذ الاستبدال وانسخ الناتج."
   ],
   "tips": [
    "جرّب على جزء صغير من النص أولًا للتأكد من النتيجة.",
    "احتفظ بنسخة من الأصل قبل الاستبدال الشامل."
   ],
   "faq": [
    [
     "هل يدعم التعبيرات النمطية؟",
     "إن وُجد خيار التعبيرات النمطية في الأداة فعّله، وإلا فالبحث نصّي عادي."
    ]
   ]
  },
  "en": {
   "intro": "Find & replace swaps a word or phrase across a long text in one go, with options to match letter case.",
   "steps": [
    "Paste your text.",
    "Type what to find and what to put in its place.",
    "Run the replacement and copy the output."
   ],
   "tips": [
    "Test on a small piece of the text first.",
    "Keep a copy of the original before a global replace."
   ],
   "faq": [
    [
     "Does it support regular expressions?",
     "If the tool shows a regex option, turn it on; otherwise it does a plain text search."
    ]
   ]
  }
 },
 "duplicate-line-remover": {
  "ar": {
   "intro": "حذف الأسطر المكررة ينظّف القوائم من التكرار ويُبقي كل سطر مرة واحدة، مثل قوائم البريد أو الكلمات المفتاحية.",
   "steps": [
    "الصق القائمة سطرًا لكل عنصر.",
    "اختر خيارات المطابقة إن وُجدت.",
    "انسخ القائمة الناتجة."
   ],
   "tips": [
    "افحص المسافات الزائدة لأن «كلمة» و«كلمة ‎ ‎» قد تُعدّان مختلفتين.",
    "رتّب القائمة بعد التنظيف إن أردت."
   ],
   "faq": [
    [
     "هل يبقى الترتيب الأصلي؟",
     "يحتفظ غالبًا بأول ظهور لكل سطر، ويمكنك الترتيب لاحقًا بأداة ترتيب الأسطر."
    ]
   ]
  },
  "en": {
   "intro": "The duplicate line remover cleans lists by keeping each line once, such as email lists or keywords.",
   "steps": [
    "Paste the list with one item per line.",
    "Choose matching options if shown.",
    "Copy the cleaned list."
   ],
   "tips": [
    "Watch for trailing spaces: two lines that look identical may differ by whitespace.",
    "Sort the list afterwards if needed."
   ],
   "faq": [
    [
     "Does the original order stay?",
     "It usually keeps the first occurrence of each line; you can sort afterwards with the line sorter."
    ]
   ]
  }
 },
 "line-sorter": {
  "ar": {
   "intro": "ترتيب الأسطر يرتّب قائمة أبجديًا أو عكسيًا أو رقميًا لتنظيم الأسماء والبيانات.",
   "steps": [
    "الصق الأسطر.",
    "اختر نوع الترتيب.",
    "انسخ القائمة المرتبة."
   ],
   "tips": [
    "الترتيب الرقمي مختلف عن الأبجدي: 10 يأتي قبل 2 أبجديًا.",
    "احذف الأسطر الفارغة قبل الترتيب لنتيجة أنظف."
   ],
   "faq": [
    [
     "هل يرتّب النص العربي؟",
     "نعم، وفق ترتيب الحروف في المتصفح."
    ]
   ]
  },
  "en": {
   "intro": "The line sorter orders a list alphabetically, in reverse or numerically to organise names and data.",
   "steps": [
    "Paste the lines.",
    "Choose the sort type.",
    "Copy the sorted list."
   ],
   "tips": [
    "Numeric order differs from alphabetical: 10 comes before 2 alphabetically.",
    "Remove blank lines first for a cleaner result."
   ],
   "faq": [
    [
     "Does it sort Arabic text?",
     "Yes, following the browser’s letter ordering."
    ]
   ]
  }
 },
 "base64-encoder-decoder": {
  "ar": {
   "intro": "ترميز Base64 يحوّل النص أو البيانات إلى صيغة نصية آمنة للنقل وفك ترميزها لاحقًا. يُستخدم في الواجهات البرمجية ورسائل البريد.",
   "steps": [
    "اختر ترميز أو فك ترميز.",
    "الصق المدخل.",
    "انسخ الناتج."
   ],
   "tips": [
    "Base64 ليس تشفيرًا؛ أي شخص يستطيع فكه، فلا تستخدمه لحماية الأسرار.",
    "عند الفك تأكد أن النص صحيح وغير مقطوع."
   ],
   "faq": [
    [
     "هل Base64 آمن للكلمات السرية؟",
     "لا، هو تمثيل للبيانات وليس حماية."
    ]
   ]
  },
  "en": {
   "intro": "Base64 encoding turns text or data into a transport-safe text form and back. It is common in APIs and email.",
   "steps": [
    "Choose encode or decode.",
    "Paste the input.",
    "Copy the output."
   ],
   "tips": [
    "Base64 is not encryption; anyone can decode it, so never use it to protect secrets.",
    "When decoding, make sure the string is complete and not truncated."
   ],
   "faq": [
    [
     "Is Base64 safe for secrets?",
     "No. It is a data representation, not protection."
    ]
   ]
  }
 },
 "url-encoder-decoder": {
  "ar": {
   "intro": "ترميز الروابط يحوّل الرموز الخاصة والعربية في الروابط إلى صيغة يقبلها المتصفح، ويفك الترميز لقراءتها.",
   "steps": [
    "اختر ترميز أو فك ترميز.",
    "الصق الرابط أو النص.",
    "انسخ الناتج."
   ],
   "tips": [
    "رمّز قيم المعاملات فقط، لا الرابط كاملًا.",
    "المسافة تُرمَّز غالبًا إلى %20 أو +."
   ],
   "faq": [
    [
     "لماذا تظهر الأحرف العربية رموزًا في الرابط؟",
     "لأن الروابط تُرسل بصيغة مرمّزة، ويمكن فك الترميز لقراءتها."
    ]
   ]
  },
  "en": {
   "intro": "URL encoding converts special and Arabic characters in links into a form browsers accept, and decodes them for reading.",
   "steps": [
    "Choose encode or decode.",
    "Paste the link or text.",
    "Copy the output."
   ],
   "tips": [
    "Encode parameter values only, not the whole URL.",
    "A space is usually encoded as %20 or +."
   ],
   "faq": [
    [
     "Why do Arabic letters look like symbols in a link?",
     "Links are sent in encoded form; decoding shows them readably."
    ]
   ]
  }
 },
 "uuid-generator": {
  "ar": {
   "intro": "مولّد UUID ينشئ معرّفات فريدة عالميًا تُستخدم كمفاتيح في قواعد البيانات والملفات.",
   "steps": [
    "اختر عدد المعرّفات.",
    "ولّدها.",
    "انسخها إلى مشروعك."
   ],
   "tips": [
    "احتمال تكرار UUID عشوائي ضئيل جدًا عمليًا.",
    "لا تعتمد عليه كسرّ أمني؛ هو معرّف وليس مفتاح حماية."
   ],
   "faq": [
    [
     "هل يتكرر UUID؟",
     "احتمال التكرار ضئيل جدًا لدرجة أنه يُهمل في الاستخدام العادي."
    ]
   ]
  },
  "en": {
   "intro": "The UUID generator creates globally unique identifiers used as keys in databases and files.",
   "steps": [
    "Choose how many identifiers.",
    "Generate them.",
    "Copy them into your project."
   ],
   "tips": [
    "Random UUID collisions are astronomically unlikely in practice.",
    "Do not rely on it as a secret; it is an identifier, not a security key."
   ],
   "faq": [
    [
     "Can a UUID repeat?",
     "The chance is so tiny it is ignored in normal use."
    ]
   ]
  }
 },
 "sha256-hash": {
  "ar": {
   "intro": "أداة SHA-256 تحسب البصمة الرقمية لنص، وهي سلسلة ثابتة الطول تتغير كليًا عند أدنى تعديل في المدخل.",
   "steps": [
    "اكتب أو الصق النص.",
    "احسب البصمة.",
    "قارنها ببصمة معروفة للتحقق."
   ],
   "tips": [
    "البصمة أحادية الاتجاه: لا يمكن استرجاع النص منها.",
    "لا تخزّن كلمات المرور ببصمة بسيطة بلا ملح؛ استخدم خوارزميات مخصصة لذلك."
   ],
   "faq": [
    [
     "هل يمكن فك SHA-256؟",
     "لا، لكنه قد يُخمَّن للنصوص القصيرة الشائعة."
    ]
   ]
  },
  "en": {
   "intro": "The SHA-256 tool computes a text’s digital fingerprint, a fixed-length string that changes completely with any edit to the input.",
   "steps": [
    "Type or paste the text.",
    "Compute the hash.",
    "Compare it with a known hash to verify."
   ],
   "tips": [
    "A hash is one-way: the text cannot be recovered from it.",
    "Do not store passwords with a plain unsalted hash; use dedicated password-hashing algorithms."
   ],
   "faq": [
    [
     "Can SHA-256 be reversed?",
     "No, but short common inputs can be guessed."
    ]
   ]
  }
 },
 "jwt-decoder": {
  "ar": {
   "intro": "فك JWT يقرأ محتوى رمز JSON Web Token (الرأس والبيانات) للتحقق من صلاحياته دون معرفة المفتاح.",
   "steps": [
    "الصق الرمز.",
    "اقرأ الرأس والبيانات.",
    "تحقق من حقل الانتهاء exp."
   ],
   "tips": [
    "فك الرمز لا يتحقق من صحة التوقيع.",
    "لا تلصق رموز جلسات حقيقية على مواقع غير موثوقة."
   ],
   "faq": [
    [
     "هل الفك يعني أن الرمز صحيح؟",
     "لا، الفك يقرأ المحتوى فقط ولا يتحقق من التوقيع."
    ]
   ]
  },
  "en": {
   "intro": "The JWT decoder reads the header and payload of a JSON Web Token so you can inspect its contents without the signing key.",
   "steps": [
    "Paste the token.",
    "Read the header and payload.",
    "Check the exp expiry field."
   ],
   "tips": [
    "Decoding does not verify the signature.",
    "Do not paste live session tokens into untrusted sites."
   ],
   "faq": [
    [
     "Does decoding mean the token is valid?",
     "No. Decoding only reads the content and does not verify the signature."
    ]
   ]
  }
 },
 "regex-tester": {
  "ar": {
   "intro": "مختبر التعبيرات النمطية يجرّب النمط على نصك ويُظهر المطابقات فورًا، لتتعلم وتصحّح أنماطك.",
   "steps": [
    "اكتب النمط.",
    "الصق النص الاختباري.",
    "راجع المطابقات والمجموعات."
   ],
   "tips": [
    "ابدأ بنمط بسيط ثم أضف التعقيد تدريجيًا.",
    "انتبه لاختلاف العلامات (flags) مثل i وg بين لغات البرمجة."
   ],
   "faq": [
    [
     "لماذا لا يطابق نمطي في لغتي؟",
     "قد تختلف المحركات في بعض الميزات، فتحقق من توثيق لغتك."
    ]
   ]
  },
  "en": {
   "intro": "The regex tester runs a pattern on your text and shows matches instantly so you can learn and debug.",
   "steps": [
    "Write the pattern.",
    "Paste a test string.",
    "Review matches and groups."
   ],
   "tips": [
    "Start simple and add complexity gradually.",
    "Flags such as i and g can differ between programming languages."
   ],
   "faq": [
    [
     "Why does my pattern not match in my language?",
     "Engines differ on some features; check your language’s documentation."
    ]
   ]
  }
 },
 "color-converter": {
  "ar": {
   "intro": "محوّل الألوان يحوّل اللون بين HEX وRGB وHSL لاستخدامه في CSS والتصميم.",
   "steps": [
    "أدخل اللون بأي صيغة.",
    "اقرأ الصيغ الأخرى.",
    "انسخ الصيغة المطلوبة."
   ],
   "tips": [
    "HEX من 3 أو 6 خانات تقبله معظم المتصفحات.",
    "HSL أسهل لتفتيح اللون وتغميقه."
   ],
   "faq": [
    [
     "ما الفرق بين HEX وRGB؟",
     "هما تمثيلان لنفس اللون: HEX بالنظام السداسي عشري وRGB بثلاث قيم عشرية."
    ]
   ]
  },
  "en": {
   "intro": "The color converter converts a colour between HEX, RGB and HSL for CSS and design work.",
   "steps": [
    "Enter a colour in any format.",
    "Read the other formats.",
    "Copy the one you need."
   ],
   "tips": [
    "3- or 6-digit HEX works in virtually every browser.",
    "HSL makes lightening and darkening easier."
   ],
   "faq": [
    [
     "What is the difference between HEX and RGB?",
     "They represent the same colour: HEX in hexadecimal and RGB in three decimal values."
    ]
   ]
  }
 },
 "contrast-checker": {
  "ar": {
   "intro": "فاحص التباين يقيس نسبة التباين بين لون النص والخلفية للتأكد من سهولة القراءة وفق معايير إمكانية الوصول WCAG.",
   "steps": [
    "أدخل لون النص.",
    "أدخل لون الخلفية.",
    "اقرأ النسبة والتقييم."
   ],
   "tips": [
    "النص العادي يحتاج نسبة 4.5:1 على الأقل وفق WCAG AA.",
    "النص الكبير يكفيه 3:1."
   ],
   "faq": [
    [
     "لماذا يهم التباين؟",
     "لأن ضعفه يصعّب القراءة على كثيرين، خاصة ضعاف البصر."
    ]
   ]
  },
  "en": {
   "intro": "The contrast checker measures the contrast ratio between text and background to confirm readability under WCAG accessibility guidelines.",
   "steps": [
    "Enter the text colour.",
    "Enter the background colour.",
    "Read the ratio and rating."
   ],
   "tips": [
    "Normal text needs at least 4.5:1 for WCAG AA.",
    "Large text needs 3:1."
   ],
   "faq": [
    [
     "Why does contrast matter?",
     "Low contrast makes reading hard for many people, especially those with low vision."
    ]
   ]
  }
 },
 "gradient-generator": {
  "ar": {
   "intro": "مولّد التدرج اللوني ينشئ كود CSS لتدرج بين لونين أو أكثر مع معاينة مباشرة.",
   "steps": [
    "اختر الألوان.",
    "اضبط الاتجاه.",
    "انسخ كود CSS."
   ],
   "tips": [
    "استخدم لونين متقاربين للحصول على تدرج ناعم.",
    "اختبر التدرج خلف النص لتتأكد من وضوحه."
   ],
   "faq": [
    [
     "كيف أستخدم الكود؟",
     "الصقه في خاصية background داخل CSS لأي عنصر."
    ]
   ]
  },
  "en": {
   "intro": "The gradient generator builds CSS for a gradient between two or more colours with a live preview.",
   "steps": [
    "Pick the colours.",
    "Set the direction.",
    "Copy the CSS code."
   ],
   "tips": [
    "Use two close hues for a soft gradient.",
    "Test the gradient behind text for legibility."
   ],
   "faq": [
    [
     "How do I use the code?",
     "Paste it into the background property of any element."
    ]
   ]
  }
 },
 "image-resizer": {
  "ar": {
   "intro": "تغيير حجم الصورة يعدّل أبعادها بالبكسل مع الحفاظ على النسبة، ليناسب مواقع التواصل والمواقع الإلكترونية.",
   "steps": [
    "اختر الصورة.",
    "حدّد العرض أو الارتفاع.",
    "نزّل الصورة الجديدة."
   ],
   "tips": [
    "حافظ على النسبة لتجنب تشوّه الصورة.",
    "التكبير الزائد يقلل الجودة؛ ابدأ من أكبر نسخة متاحة."
   ],
   "faq": [
    [
     "هل تتأثر جودة الصورة؟",
     "التصغير آمن غالبًا، أما التكبير فقد يجعل الصورة أقل وضوحًا."
    ]
   ]
  },
  "en": {
   "intro": "Image resizer changes an image’s pixel dimensions while keeping its proportions, to fit social media and websites.",
   "steps": [
    "Choose the image.",
    "Set the width or height.",
    "Download the new image."
   ],
   "tips": [
    "Keep the aspect ratio to avoid distortion.",
    "Heavy enlargement lowers quality; start from the largest version you have."
   ],
   "faq": [
    [
     "Does it affect quality?",
     "Shrinking is usually safe; enlarging can make the image softer."
    ]
   ]
  }
 },
 "image-converter": {
  "ar": {
   "intro": "محوّل الصور يحوّل بين صيغ مثل JPG وPNG وWebP لتناسب الاستخدام المطلوب.",
   "steps": [
    "اختر الصورة.",
    "اختر الصيغة المطلوبة.",
    "نزّل الناتج."
   ],
   "tips": [
    "WebP غالبًا أصغر حجمًا للمواقع.",
    "PNG مناسب للصور ذات الشفافية والنص."
   ],
   "faq": [
    [
     "أي صيغة أختار للموقع؟",
     "WebP أو JPG للصور الفوتوغرافية، وPNG للشعارات والشفافية."
    ]
   ]
  },
  "en": {
   "intro": "The image converter converts between formats such as JPG, PNG and WebP to suit your use.",
   "steps": [
    "Choose the image.",
    "Pick the target format.",
    "Download the result."
   ],
   "tips": [
    "WebP is often smaller for websites.",
    "PNG suits images with transparency and text."
   ],
   "faq": [
    [
     "Which format should I choose for a website?",
     "WebP or JPG for photos, PNG for logos and transparency."
    ]
   ]
  }
 },
 "images-to-pdf": {
  "ar": {
   "intro": "تحويل الصور إلى PDF يجمع صورًا متعددة في ملف PDF واحد مرتب، مناسب لإرسال المستندات الممسوحة.",
   "steps": [
    "اختر الصور.",
    "رتّبها.",
    "أنشئ ملف PDF ونزّله."
   ],
   "tips": [
    "رتّب الصور قبل التحويل.",
    "الصور الكبيرة جدًا تجعل الملف ثقيلًا؛ صغّرها قبل ذلك عند الحاجة."
   ],
   "faq": [
    [
     "هل يمكن جمع صور بصيغ مختلفة؟",
     "غالبًا نعم إن كانت الصيغة مدعومة في المتصفح."
    ]
   ]
  },
  "en": {
   "intro": "Images to PDF combines several images into one ordered PDF, handy for sending scanned documents.",
   "steps": [
    "Choose the images.",
    "Put them in order.",
    "Create the PDF and download it."
   ],
   "tips": [
    "Order the images before converting.",
    "Very large images make a heavy file; shrink them first if needed."
   ],
   "faq": [
    [
     "Can I mix image formats?",
     "Usually yes, as long as the browser supports them."
    ]
   ]
  }
 },
 "pdf-split": {
  "ar": {
   "intro": "تقسيم PDF يستخرج صفحات محددة أو يقسّم الملف إلى أجزاء.",
   "steps": [
    "اختر ملف PDF.",
    "حدّد الصفحات أو النطاق.",
    "نزّل الملف الناتج."
   ],
   "tips": [
    "اكتب النطاق بدقة مثل 1-3.",
    "الملفات المحمية بكلمة مرور قد تحتاج فك الحماية أولًا."
   ],
   "faq": [
    [
     "هل يتغير الملف الأصلي؟",
     "لا، يُنشأ ملف جديد ويبقى الأصل كما هو."
    ]
   ]
  },
  "en": {
   "intro": "PDF split extracts specific pages or divides a file into parts.",
   "steps": [
    "Choose a PDF.",
    "Set the pages or range.",
    "Download the result."
   ],
   "tips": [
    "Enter the range precisely, such as 1-3.",
    "Password-protected files may need unlocking first."
   ],
   "faq": [
    [
     "Is my original file changed?",
     "No. A new file is created and the original stays as it is."
    ]
   ]
  }
 },
 "percentage-calculator": {
  "ar": {
   "intro": "حاسبة النسبة المئوية تجيب عن أسئلة مثل: كم يساوي 15% من 200؟ أو كم تمثّل قيمة من أخرى؟",
   "steps": [
    "اختر نوع الحساب.",
    "أدخل الأرقام.",
    "اقرأ الناتج."
   ],
   "tips": [
    "اعرف أي نوع من الأسئلة تطرح: نسبة من رقم أم رقم من نسبة.",
    "راجع الناتج منطقيًا قبل استخدامه."
   ],
   "faq": [
    [
     "كيف أحسب نسبة من رقم؟",
     "اضرب الرقم في النسبة وقسّم على 100."
    ]
   ]
  },
  "en": {
   "intro": "The percentage calculator answers questions like: what is 15% of 200, or what percent is one value of another?",
   "steps": [
    "Choose the calculation type.",
    "Enter the numbers.",
    "Read the result."
   ],
   "tips": [
    "Know whether you are asking percent of a number or a number as a percent.",
    "Sanity-check the result before using it."
   ],
   "faq": [
    [
     "How do I calculate a percentage of a number?",
     "Multiply the number by the percentage and divide by 100."
    ]
   ]
  }
 },
 "vat-calculator": {
  "ar": {
   "intro": "حاسبة ضريبة القيمة المضافة تضيف الضريبة إلى السعر أو تستخرجها من سعر شامل.",
   "steps": [
    "أدخل المبلغ.",
    "اكتب نسبة الضريبة المعمول بها في بلدك.",
    "اقرأ المبلغ قبل الضريبة وبعدها."
   ],
   "tips": [
    "تأكد من نسبة الضريبة الحالية في بلدك من الجهة الرسمية.",
    "فرّق بين سعر شامل الضريبة وسعر غير شامل."
   ],
   "faq": [
    [
     "ما نسبة الضريبة التي أستخدمها؟",
     "النسبة تختلف حسب الدولة والسلعة، فاعتمد نسبة بلدك الرسمية."
    ]
   ]
  },
  "en": {
   "intro": "The VAT calculator adds VAT to a price or extracts it from a VAT-inclusive price.",
   "steps": [
    "Enter the amount.",
    "Enter the VAT rate that applies in your country.",
    "Read the amounts before and after VAT."
   ],
   "tips": [
    "Confirm the current VAT rate from your official tax authority.",
    "Distinguish VAT-inclusive from VAT-exclusive prices."
   ],
   "faq": [
    [
     "Which VAT rate should I use?",
     "Rates vary by country and goods, so use your country’s official rate."
    ]
   ]
  }
 },
 "discount-calculator": {
  "ar": {
   "intro": "حاسبة الخصم تحسب السعر بعد الخصم ومقدار التوفير.",
   "steps": [
    "أدخل السعر الأصلي.",
    "أدخل نسبة الخصم.",
    "اقرأ السعر النهائي والتوفير."
   ],
   "tips": [
    "الخصومات المتتالية لا تُجمع نسبها ببساطة.",
    "قارن السعر النهائي لا نسبة الخصم فقط."
   ],
   "faq": [
    [
     "هل خصمان 10% يساويان 20%؟",
     "لا، الخصم الثاني يُحسب على السعر بعد الخصم الأول، فالنتيجة أقل قليلًا من 20%."
    ]
   ]
  },
  "en": {
   "intro": "The discount calculator works out the price after a discount and how much you save.",
   "steps": [
    "Enter the original price.",
    "Enter the discount percentage.",
    "Read the final price and savings."
   ],
   "tips": [
    "Successive discounts do not simply add up.",
    "Compare final prices, not just discount percentages."
   ],
   "faq": [
    [
     "Are two 10% discounts equal to 20%?",
     "No. The second applies to the already reduced price, so the total is slightly less than 20%."
    ]
   ]
  }
 },
 "gpa-calculator": {
  "ar": {
   "intro": "حاسبة المعدل التراكمي تحسب GPA من درجات موادك وساعاتها المعتمدة.",
   "steps": [
    "أضف كل مادة بدرجتها وساعاتها.",
    "راجع المدخلات.",
    "اقرأ المعدل."
   ],
   "tips": [
    "تأكد من أن مقياس الدرجات مطابق لمقياس جامعتك.",
    "أضف جميع المواد لتحصل على معدل دقيق."
   ],
   "faq": [
    [
     "هل يناسب أي جامعة؟",
     "مقاييس الدرجات تختلف بين الجامعات، فطابق المقياس الذي تعتمده جامعتك."
    ]
   ]
  },
  "en": {
   "intro": "The GPA calculator computes your grade point average from course grades and credit hours.",
   "steps": [
    "Add each course with its grade and credits.",
    "Review the entries.",
    "Read the GPA."
   ],
   "tips": [
    "Make sure the grade scale matches your university’s scale.",
    "Include all courses for an accurate result."
   ],
   "faq": [
    [
     "Does it suit any university?",
     "Grade scales differ between universities, so match your institution’s scale."
    ]
   ]
  }
 },
 "timezone-converter": {
  "ar": {
   "intro": "محوّل المناطق الزمنية يحوّل وقتًا معينًا بين مدينتين لتنسيق الاجتماعات والمكالمات.",
   "steps": [
    "اختر الوقت والمنطقة الأصلية.",
    "اختر المنطقة الهدف.",
    "اقرأ الوقت المقابل."
   ],
   "tips": [
    "انتبه للتوقيت الصيفي فقد يتغير الفرق بين المدن خلال السنة.",
    "اكتب التاريخ الدقيق عند التنسيق عبر أسابيع."
   ],
   "faq": [
    [
     "لماذا يتغير الفرق بين مدينتين؟",
     "بسبب التوقيت الصيفي الذي تطبّقه بعض الدول دون غيرها."
    ]
   ]
  },
  "en": {
   "intro": "The time zone converter converts a time between two cities to schedule meetings and calls.",
   "steps": [
    "Pick the time and source zone.",
    "Pick the target zone.",
    "Read the matching time."
   ],
   "tips": [
    "Mind daylight saving time, which can change the offset during the year.",
    "Enter the exact date when planning across weeks."
   ],
   "faq": [
    [
     "Why does the difference between two cities change?",
     "Because some countries observe daylight saving time and others do not."
    ]
   ]
  }
 },
 "markdown-preview": {
  "ar": {
   "intro": "معاينة Markdown تعرض كيف سيبدو نص Markdown بعد التحويل إلى HTML أثناء الكتابة.",
   "steps": [
    "اكتب أو الصق نص Markdown.",
    "شاهد المعاينة الفورية.",
    "انسخ النص أو الناتج."
   ],
   "tips": [
    "استخدم # للعناوين و- للقوائم و** للخط العريض.",
    "اترك سطرًا فارغًا بين الفقرات."
   ],
   "faq": [
    [
     "ما هو Markdown؟",
     "صيغة نصية بسيطة للتنسيق تتحول إلى HTML."
    ]
   ]
  },
  "en": {
   "intro": "Markdown preview shows how Markdown text will look once converted to HTML as you type.",
   "steps": [
    "Type or paste Markdown.",
    "Watch the live preview.",
    "Copy the text or output."
   ],
   "tips": [
    "Use # for headings, - for lists and ** for bold.",
    "Leave a blank line between paragraphs."
   ],
   "faq": [
    [
     "What is Markdown?",
     "A simple text format for styling that converts to HTML."
    ]
   ]
  }
 },
 "meta-tag-generator": {
  "ar": {
   "intro": "مولّد وسوم Meta ينشئ وسوم العنوان والوصف وOpen Graph اللازمة لمحركات البحث والمشاركة الاجتماعية.",
   "steps": [
    "اكتب العنوان والوصف.",
    "أضف رابط الصورة إن وُجد.",
    "انسخ الكود إلى رأس الصفحة."
   ],
   "tips": [
    "العنوان بين 50 و60 حرفًا غالبًا، والوصف بين 120 و160 تقريبًا.",
    "اجعل لكل صفحة عنوانًا ووصفًا فريدين."
   ],
   "faq": [
    [
     "أين أضع الوسوم؟",
     "داخل وسم head في كل صفحة."
    ]
   ]
  },
  "en": {
   "intro": "The meta tag generator builds the title, description and Open Graph tags needed by search engines and social sharing.",
   "steps": [
    "Enter the title and description.",
    "Add an image URL if you have one.",
    "Copy the code into the page head."
   ],
   "tips": [
    "Titles are usually 50–60 characters and descriptions around 120–160.",
    "Give every page a unique title and description."
   ],
   "faq": [
    [
     "Where do I put the tags?",
     "Inside the head element of each page."
    ]
   ]
  }
 },
 "seo-auditor": {
  "ar": {
   "intro": "فاحص السيو يراجع صفحة ويب ويكشف مشاكل شائعة مثل غياب العنوان أو الوصف أو عنوان H1.",
   "steps": [
    "أدخل رابط الصفحة.",
    "شغّل الفحص.",
    "صحّح المشاكل المذكورة بالترتيب."
   ],
   "tips": [
    "ابدأ بالمشاكل الأعلى أثرًا مثل العنوان والوصف.",
    "أعد الفحص بعد كل تعديل."
   ],
   "faq": [
    [
     "هل يضمن الفحص تصدّر جوجل؟",
     "لا، هو يكشف مشاكل تقنية فقط، والترتيب يعتمد على عوامل كثيرة."
    ]
   ]
  },
  "en": {
   "intro": "The SEO auditor reviews a web page and flags common issues such as a missing title, description or H1.",
   "steps": [
    "Enter the page URL.",
    "Run the audit.",
    "Fix the listed issues in order."
   ],
   "tips": [
    "Start with high-impact items like title and description.",
    "Re-run after each change."
   ],
   "faq": [
    [
     "Does the audit guarantee top rankings?",
     "No. It finds technical issues only; ranking depends on many factors."
    ]
   ]
  }
 }
};
