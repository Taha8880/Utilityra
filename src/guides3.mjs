// Third batch of bilingual tool guides (merged into GUIDES in build.mjs)
export const GUIDES3 = {
 "ai-assistant": {
  "ar": {
   "intro": "المساعد الذكي يجيب عن أسئلتك ويشرح ويساعدك في الكتابة والتخطيط، ويتذكر سياق المحادثة الحالية.",
   "steps": [
    "اكتب سؤالك بوضوح.",
    "أضف التفاصيل التي تهمك مثل الغرض أو الجمهور.",
    "اطلب توضيحًا أو تعديلًا في الرد التالي."
   ],
   "tips": [
    "كلما كان السؤال أدق كانت الإجابة أنفع.",
    "راجع المعلومات المهمة من مصدر موثوق قبل الاعتماد عليها."
   ],
   "faq": [
    [
     "هل إجابات المساعد دائمًا صحيحة؟",
     "قد يخطئ الذكاء الاصطناعي، فتحقق من الأرقام والمعلومات الحساسة."
    ]
   ]
  },
  "en": {
   "intro": "The AI assistant answers questions, explains topics and helps with writing and planning, keeping the context of the current conversation.",
   "steps": [
    "Write your question clearly.",
    "Add useful details such as purpose or audience.",
    "Ask for clarification or edits in the next message."
   ],
   "tips": [
    "The more specific the question, the more useful the answer.",
    "Verify important facts from a reliable source."
   ],
   "faq": [
    [
     "Is the assistant always right?",
     "AI can make mistakes, so check numbers and sensitive information."
    ]
   ]
  }
 },
 "ai-blog-writer": {
  "ar": {
   "intro": "كاتب المقالات بالذكاء الاصطناعي يساعدك في إعداد مسودة مقال منظّمة بعناوين وفقرات حول موضوع تحدده.",
   "steps": [
    "اكتب موضوع المقال والجمهور المستهدف.",
    "حدّد النبرة والطول إن توفّر ذلك.",
    "عدّل المسودة وأضف خبرتك ومصادرك."
   ],
   "tips": [
    "اعتبر الناتج مسودة وليس نصًا نهائيًا.",
    "أضف أمثلة وأرقامًا من تجربتك لتميّز المقال."
   ],
   "faq": [
    [
     "هل أنشر الناتج كما هو؟",
     "الأفضل مراجعته وتعديله وإضافة مصادر موثوقة قبل النشر."
    ]
   ]
  },
  "en": {
   "intro": "The AI blog writer helps you draft a structured article with headings and paragraphs on a topic you choose.",
   "steps": [
    "Enter the topic and target audience.",
    "Set the tone and length if offered.",
    "Edit the draft and add your own expertise and sources."
   ],
   "tips": [
    "Treat the output as a draft, not final copy.",
    "Add examples and numbers from your own experience."
   ],
   "faq": [
    [
     "Should I publish the output as is?",
     "Better to review, edit and add reliable sources first."
    ]
   ]
  }
 },
 "ai-code-debugger": {
  "ar": {
   "intro": "مصحّح الأكواد بالذكاء الاصطناعي يقرأ الكود ورسالة الخطأ ويقترح سبب المشكلة وحلًا محتملًا.",
   "steps": [
    "الصق الكود المسبب للمشكلة.",
    "أضف رسالة الخطأ ولغة البرمجة.",
    "جرّب الحل المقترح واختبره."
   ],
   "tips": [
    "كلما قلّ الكود المرسل وركّز على موضع الخطأ كان التشخيص أدق.",
    "اختبر أي اقتراح قبل نشره في مشروع حقيقي."
   ],
   "faq": [
    [
     "هل أرسل كودًا سريًا؟",
     "لا تضع مفاتيح أو كلمات مرور أو بيانات حساسة داخل الكود المرسل."
    ]
   ]
  },
  "en": {
   "intro": "The AI code debugger reads your code and error message and suggests a probable cause and fix.",
   "steps": [
    "Paste the failing code.",
    "Add the error message and language.",
    "Try the suggested fix and test it."
   ],
   "tips": [
    "A smaller snippet focused on the error gives a better diagnosis.",
    "Test any suggestion before shipping it to a real project."
   ],
   "faq": [
    [
     "Can I send secret code?",
     "Do not include keys, passwords or sensitive data in the submitted code."
    ]
   ]
  }
 },
 "ai-code-explainer": {
  "ar": {
   "intro": "شارح الأكواد يفسّر ما يفعله الكود سطرًا بسطر بلغة مبسطة، مفيد للتعلم ومراجعة الأكواد الغريبة.",
   "steps": [
    "الصق الكود.",
    "اختر لغة الشرح إن وُجد خيار.",
    "اقرأ الشرح وقارنه بالكود."
   ],
   "tips": [
    "اطلب شرحًا لجزء محدد إن كان الكود طويلًا.",
    "تحقق من الشرح بتشغيل الكود عند الشك."
   ],
   "faq": [
    [
     "هل يغني عن تعلم البرمجة؟",
     "هو مساعد للفهم، والتعلم الحقيقي يتطلب الممارسة."
    ]
   ]
  },
  "en": {
   "intro": "The code explainer describes what code does in plain language, useful for learning and for reviewing unfamiliar code.",
   "steps": [
    "Paste the code.",
    "Choose the explanation language if offered.",
    "Read the explanation and compare it with the code."
   ],
   "tips": [
    "Ask about a specific part when the code is long.",
    "Run the code to confirm the explanation when in doubt."
   ],
   "faq": [
    [
     "Does it replace learning to code?",
     "It helps understanding, but real learning needs practice."
    ]
   ]
  }
 },
 "ai-decision-helper": {
  "ar": {
   "intro": "مساعد القرار يرتّب خياراتك ويقارن بينها وفق معايير تحددها، ليساعدك في الاختيار عندما تتردد بين أمرين أو أكثر.",
   "steps": [
    "اكتب الخيارات المتاحة.",
    "أضف ما يهمك: السعر أو الوقت أو المخاطرة.",
    "اقرأ المقارنة وقرارك النهائي بنفسك."
   ],
   "tips": [
    "حدّد معاييرك قبل أن تسأل.",
    "هو يساعد على التفكير ولا يحل محل رأيك أو رأي مختص في القرارات الكبيرة."
   ],
   "faq": [
    [
     "هل أعتمد عليه في قرارات مصيرية؟",
     "استخدمه كأداة تفكير، واستشر مختصًا في القرارات المالية والصحية والقانونية."
    ]
   ]
  },
  "en": {
   "intro": "The decision helper compares your options against criteria you set to help when you are torn between two or more choices.",
   "steps": [
    "List the available options.",
    "Add what matters: cost, time or risk.",
    "Read the comparison and make the final call yourself."
   ],
   "tips": [
    "Define your criteria before asking.",
    "It supports your thinking; it does not replace your judgement or an expert for big decisions."
   ],
   "faq": [
    [
     "Can I rely on it for major decisions?",
     "Use it as a thinking aid and consult a professional on financial, health or legal matters."
    ]
   ]
  }
 },
 "ai-email-writer": {
  "ar": {
   "intro": "كاتب الإيميلات يصيغ رسالة رسمية أو ودّية بحسب الغرض والمستلم، فتوفر وقت الصياغة.",
   "steps": [
    "اكتب الغرض من الرسالة والمستلم.",
    "اختر النبرة الرسمية أو الودية.",
    "عدّل المسودة وأضف التفاصيل الدقيقة."
   ],
   "tips": [
    "أضف الأسماء والتواريخ الصحيحة بنفسك.",
    "اقرأ الرسالة قبل الإرسال للتأكد من النبرة."
   ],
   "faq": [
    [
     "هل يرسل الإيميل نيابة عني؟",
     "لا، يكتب المسودة فقط وأنت تنسخها وترسلها."
    ]
   ]
  },
  "en": {
   "intro": "The email writer drafts a formal or friendly message based on purpose and recipient, saving you wording time.",
   "steps": [
    "Enter the purpose and the recipient.",
    "Pick a formal or friendly tone.",
    "Edit the draft and add precise details."
   ],
   "tips": [
    "Fill in the correct names and dates yourself.",
    "Read the message before sending to check the tone."
   ],
   "faq": [
    [
     "Does it send the email for me?",
     "No, it only writes a draft that you copy and send."
    ]
   ]
  }
 },
 "ai-grammar-fixer": {
  "ar": {
   "intro": "مصحّح القواعد يراجع نصك ويصحّح الأخطاء الإملائية والنحوية ويحسّن الصياغة.",
   "steps": [
    "الصق النص.",
    "اطلب التصحيح.",
    "قارن النتيجة بالأصل واقبل ما يناسبك."
   ],
   "tips": [
    "راجع التغييرات خاصة في الأسماء والمصطلحات المتخصصة.",
    "للنصوص الرسمية اجعل مختصًا يراجع النسخة النهائية."
   ],
   "faq": [
    [
     "هل يصحّح العربية والإنجليزية؟",
     "نعم، يدعم الكتابة بالعربية والإنجليزية."
    ]
   ]
  },
  "en": {
   "intro": "The grammar fixer reviews your text, corrects spelling and grammar, and improves phrasing.",
   "steps": [
    "Paste the text.",
    "Request the correction.",
    "Compare with the original and accept what fits."
   ],
   "tips": [
    "Check changes to names and specialised terms.",
    "Have a specialist review the final version of formal texts."
   ],
   "faq": [
    [
     "Does it handle Arabic and English?",
     "Yes, it supports writing in both."
    ]
   ]
  }
 },
 "ai-paraphraser": {
  "ar": {
   "intro": "معيد الصياغة يكتب فكرتك بكلمات مختلفة مع الحفاظ على المعنى، مفيد لتحسين الأسلوب وتجنب التكرار.",
   "steps": [
    "الصق الجملة أو الفقرة.",
    "اختر الأسلوب إن توفّر.",
    "راجع المعنى بعد إعادة الصياغة."
   ],
   "tips": [
    "تأكد أن المعنى لم يتغير.",
    "عند الاقتباس من مصدر اذكره، فإعادة الصياغة لا تلغي حق المؤلف."
   ],
   "faq": [
    [
     "هل أستخدمه لتفادي الانتحال؟",
     "لا، يجب نسب الأفكار لمصادرها حتى مع تغيير الصياغة."
    ]
   ]
  },
  "en": {
   "intro": "The paraphraser rewrites your idea in different words while keeping the meaning, helping improve style and avoid repetition.",
   "steps": [
    "Paste the sentence or paragraph.",
    "Choose a style if offered.",
    "Check the meaning after rewording."
   ],
   "tips": [
    "Make sure the meaning has not changed.",
    "Cite sources when borrowing ideas; rewording does not remove attribution."
   ],
   "faq": [
    [
     "Can I use it to avoid plagiarism?",
     "No. Ideas must be credited to their sources even when reworded."
    ]
   ]
  }
 },
 "ai-product-description": {
  "ar": {
   "intro": "كاتب وصف المنتجات يصيغ وصفًا جذابًا لمنتجك يبرز مزاياه لتناسب متجرك الإلكتروني.",
   "steps": [
    "اكتب اسم المنتج وخصائصه الأساسية.",
    "حدّد الجمهور والنبرة.",
    "عدّل الوصف وأضف تفاصيل حقيقية."
   ],
   "tips": [
    "اذكر معلومات حقيقية فقط عن المنتج.",
    "أضف المقاسات والمواصفات الدقيقة بنفسك."
   ],
   "faq": [
    [
     "هل يخترع مواصفات؟",
     "قد يخطئ، فراجع كل معلومة قبل النشر."
    ]
   ]
  },
  "en": {
   "intro": "The product description writer drafts an appealing description that highlights benefits for your online store.",
   "steps": [
    "Enter the product name and key features.",
    "Set the audience and tone.",
    "Edit the description and add real details."
   ],
   "tips": [
    "Provide only true information about the product.",
    "Add exact sizes and specifications yourself."
   ],
   "faq": [
    [
     "Could it invent specs?",
     "It can make mistakes, so verify every detail before publishing."
    ]
   ]
  }
 },
 "ai-quiz-generator": {
  "ar": {
   "intro": "مولّد الاختبارات ينشئ أسئلة اختيار من متعدد من نص أو موضوع لمراجعة المذاكرة.",
   "steps": [
    "الصق النص أو اكتب الموضوع.",
    "حدّد عدد الأسئلة.",
    "راجع الأسئلة وأجوبتها."
   ],
   "tips": [
    "راجع الإجابات الصحيحة قبل استخدام الاختبار مع الطلاب.",
    "استخدم نصًا واضحًا ليكون التوليد أدق."
   ],
   "faq": [
    [
     "هل الإجابات مضمونة؟",
     "لا، راجعها دائمًا بنفسك."
    ]
   ]
  },
  "en": {
   "intro": "The quiz generator creates multiple-choice questions from a text or topic for study review.",
   "steps": [
    "Paste the text or enter the topic.",
    "Set the number of questions.",
    "Review the questions and answers."
   ],
   "tips": [
    "Check the correct answers before using the quiz with students.",
    "Use clear source text for better generation."
   ],
   "faq": [
    [
     "Are the answers guaranteed?",
     "No. Always check them yourself."
    ]
   ]
  }
 },
 "ai-regex-generator": {
  "ar": {
   "intro": "مولّد التعبيرات النمطية يحوّل وصفك بالكلمات إلى نمط regex جاهز للاختبار.",
   "steps": [
    "صِف ما تريد مطابقته.",
    "انسخ النمط.",
    "اختبره في مختبر التعبيرات النمطية."
   ],
   "tips": [
    "أعطِ أمثلة لما يجب أن يطابق وما لا يطابق.",
    "اختبر النمط دائمًا قبل الاعتماد عليه."
   ],
   "faq": [
    [
     "هل يعمل النمط في كل اللغات؟",
     "قد تختلف المحركات، فتحقق من توافقه مع لغتك."
    ]
   ]
  },
  "en": {
   "intro": "The regex generator turns your plain-language description into a ready-to-test regular expression.",
   "steps": [
    "Describe what you want to match.",
    "Copy the pattern.",
    "Test it in the regex tester."
   ],
   "tips": [
    "Give examples of what should and should not match.",
    "Always test the pattern before relying on it."
   ],
   "faq": [
    [
     "Does the pattern work in every language?",
     "Engines differ, so check compatibility with yours."
    ]
   ]
  }
 },
 "ai-resume-writer": {
  "ar": {
   "intro": "كاتب السيرة الذاتية يساعدك في صياغة ملخص مهني ونقاط الخبرات بأسلوب واضح ومؤثر.",
   "steps": [
    "أدخل خبراتك ومهاراتك ومجال التقديم.",
    "راجع الصياغة المقترحة.",
    "عدّل الناتج ليعكس خبرتك الحقيقية."
   ],
   "tips": [
    "اذكر إنجازات بأرقام عند الإمكان.",
    "لا تضف خبرات غير حقيقية."
   ],
   "faq": [
    [
     "هل يصلح لأي وظيفة؟",
     "يمكنك تخصيصه حسب الوظيفة بتعديل المدخلات."
    ]
   ]
  },
  "en": {
   "intro": "The resume writer helps you phrase a professional summary and experience bullets clearly and persuasively.",
   "steps": [
    "Enter your experience, skills and target field.",
    "Review the suggested wording.",
    "Edit the output to reflect your real background."
   ],
   "tips": [
    "Include achievements with numbers where possible.",
    "Do not add experience you do not have."
   ],
   "faq": [
    [
     "Does it suit any job?",
     "Tailor it by adjusting your inputs for each role."
    ]
   ]
  }
 },
 "ai-seo-titles": {
  "ar": {
   "intro": "مولّد عناوين السيو يقترح عناوين جذابة تتضمن كلمتك المفتاحية وتناسب نتائج البحث.",
   "steps": [
    "اكتب الكلمة المفتاحية والموضوع.",
    "اختر العنوان الأنسب.",
    "قصّره ليناسب طول العنوان المناسب."
   ],
   "tips": [
    "العناوين بين 50 و60 حرفًا غالبًا تظهر كاملة.",
    "لا تحشو الكلمات المفتاحية."
   ],
   "faq": [
    [
     "هل يضمن العنوان ترتيبًا أفضل؟",
     "لا، هو يحسّن النقر، والترتيب يتوقف على جودة الصفحة كلها."
    ]
   ]
  },
  "en": {
   "intro": "The SEO titles generator suggests catchy titles that include your keyword and suit search results.",
   "steps": [
    "Enter the keyword and topic.",
    "Pick the best title.",
    "Trim it to a suitable length."
   ],
   "tips": [
    "Titles of roughly 50–60 characters usually display in full.",
    "Do not stuff keywords."
   ],
   "faq": [
    [
     "Does a good title guarantee better ranking?",
     "No. It improves clicks; ranking depends on the whole page quality."
    ]
   ]
  }
 },
 "ai-social-posts": {
  "ar": {
   "intro": "مولّد منشورات التواصل يكتب منشورًا مناسبًا لكل منصة بنبرة تحددها.",
   "steps": [
    "اكتب فكرة المنشور والمنصة.",
    "اختر النبرة.",
    "عدّل المنشور وأضف الوسوم المناسبة."
   ],
   "tips": [
    "راعِ حدود الأحرف في كل منصة.",
    "أضف لمستك الشخصية ليبدو المنشور حقيقيًا."
   ],
   "faq": [
    [
     "هل ينشر نيابة عني؟",
     "لا، ينسخ لك النص فقط وأنت تنشره."
    ]
   ]
  },
  "en": {
   "intro": "The social posts generator writes a post suited to each platform in a tone you choose.",
   "steps": [
    "Enter the post idea and the platform.",
    "Choose the tone.",
    "Edit the post and add suitable hashtags."
   ],
   "tips": [
    "Respect each platform’s character limit.",
    "Add your personal touch so it feels authentic."
   ],
   "faq": [
    [
     "Does it publish for me?",
     "No, it only gives you text to post yourself."
    ]
   ]
  }
 },
 "ai-sql-generator": {
  "ar": {
   "intro": "مولّد SQL يحوّل وصفك لما تريده من البيانات إلى استعلام SQL.",
   "steps": [
    "صِف الجداول والأعمدة وما تريد استخراجه.",
    "انسخ الاستعلام.",
    "اختبره على نسخة تجريبية قبل الإنتاج."
   ],
   "tips": [
    "اذكر أسماء الجداول والأعمدة بدقة.",
    "لا تنفّذ استعلامات الحذف والتعديل قبل مراجعتها."
   ],
   "faq": [
    [
     "هل أنفّذه مباشرة على قاعدة الإنتاج؟",
     "لا، جرّبه على نسخة تجريبية أولًا."
    ]
   ]
  },
  "en": {
   "intro": "The SQL generator turns your description of the data you want into an SQL query.",
   "steps": [
    "Describe the tables, columns and what to extract.",
    "Copy the query.",
    "Test it on a staging copy before production."
   ],
   "tips": [
    "Name tables and columns exactly.",
    "Never run delete or update queries before reviewing them."
   ],
   "faq": [
    [
     "Should I run it directly on production?",
     "No. Try it on a test copy first."
    ]
   ]
  }
 },
 "ai-study-explainer": {
  "ar": {
   "intro": "شارح الدروس يبسّط مفهومًا دراسيًا بأسلوب مناسب لمستواك مع أمثلة.",
   "steps": [
    "اكتب المفهوم أو الدرس.",
    "حدّد مستواك الدراسي.",
    "اطلب مثالًا إضافيًا إن لزم."
   ],
   "tips": [
    "اطلب الشرح بخطوات صغيرة للمفاهيم الصعبة.",
    "قارن الشرح بكتابك الدراسي."
   ],
   "faq": [
    [
     "هل يغني عن المعلم؟",
     "هو مساعد للمراجعة، والمنهج المعتمد هو مرجعك."
    ]
   ]
  },
  "en": {
   "intro": "The study explainer simplifies a concept at your level with examples.",
   "steps": [
    "Enter the concept or lesson.",
    "Set your study level.",
    "Ask for another example if needed."
   ],
   "tips": [
    "Ask for small steps on hard concepts.",
    "Compare the explanation with your textbook."
   ],
   "faq": [
    [
     "Does it replace a teacher?",
     "It helps revision; your official curriculum remains the reference."
    ]
   ]
  }
 },
 "ai-translator": {
  "ar": {
   "intro": "المترجم الذكي يترجم النصوص بين العربية والإنجليزية وغيرها مع مراعاة السياق.",
   "steps": [
    "الصق النص.",
    "اختر لغة الهدف.",
    "راجع الترجمة خاصة للنصوص المهمة."
   ],
   "tips": [
    "اكتب جملًا كاملة لترجمة أدق.",
    "للمستندات الرسمية استعن بمترجم معتمد."
   ],
   "faq": [
    [
     "هل ترجمته مناسبة للمستندات الرسمية؟",
     "للاستخدام الرسمي يُنصح بمراجعة مترجم معتمد."
    ]
   ]
  },
  "en": {
   "intro": "The AI translator translates text between Arabic, English and other languages with context in mind.",
   "steps": [
    "Paste the text.",
    "Choose the target language.",
    "Review the translation, especially for important texts."
   ],
   "tips": [
    "Write complete sentences for a more accurate translation.",
    "Use a certified translator for official documents."
   ],
   "faq": [
    [
     "Is it suitable for official documents?",
     "For official use, have a certified translator review it."
    ]
   ]
  }
 },
 "accessibility-checker": {
  "ar": {
   "intro": "فاحص إمكانية الوصول يراجع صفحة ويكشف مشاكل مثل غياب نص بديل للصور أو عنوان للصفحة.",
   "steps": [
    "أدخل رابط الصفحة.",
    "شغّل الفحص.",
    "صحّح المشاكل المذكورة."
   ],
   "tips": [
    "الفحص الآلي يكشف جزءًا من المشاكل فقط، فجرّب الصفحة أيضًا بلوحة المفاتيح.",
    "ابدأ بالأخطاء الأكثر تأثيرًا على القراءة والتنقل."
   ],
   "faq": [
    [
     "هل الفحص كافٍ لإمكانية الوصول الكاملة؟",
     "لا، الفحص الآلي لا يكشف كل شيء ويحتاج اختبارًا يدويًا."
    ]
   ]
  },
  "en": {
   "intro": "The accessibility checker reviews a page and flags issues such as missing image alt text or a missing page title.",
   "steps": [
    "Enter the page URL.",
    "Run the check.",
    "Fix the listed issues."
   ],
   "tips": [
    "Automated checks find only part of the issues, so also test with the keyboard.",
    "Start with errors that most affect reading and navigation."
   ],
   "faq": [
    [
     "Is the check enough for full accessibility?",
     "No. Automated checks miss things and need manual testing."
    ]
   ]
  }
 },
 "api-tester": {
  "ar": {
   "intro": "مختبر API يرسل طلب HTTP إلى واجهة برمجية ويعرض الاستجابة ورأسها لتجربة الواجهات.",
   "steps": [
    "أدخل الرابط واختر نوع الطلب.",
    "أضف الرؤوس أو الجسم إن لزم.",
    "أرسل الطلب واقرأ الاستجابة."
   ],
   "tips": [
    "قد تمنع بعض الواجهات الطلبات من المتصفح بسبب CORS.",
    "لا تضع مفاتيح سرية في أدوات لا تثق بها."
   ],
   "faq": [
    [
     "لماذا يفشل الطلب رغم صحة الرابط؟",
     "قد تكون السبب سياسة CORS أو عدم توفر الواجهة."
    ]
   ]
  },
  "en": {
   "intro": "The API tester sends an HTTP request to an API and shows the response and headers so you can try endpoints.",
   "steps": [
    "Enter the URL and choose the method.",
    "Add headers or a body if needed.",
    "Send the request and read the response."
   ],
   "tips": [
    "Some APIs block browser requests because of CORS.",
    "Do not put secret keys into tools you do not trust."
   ],
   "faq": [
    [
     "Why does it fail though the URL is correct?",
     "CORS policy or API unavailability could be the cause."
    ]
   ]
  }
 },
 "arabic-diacritics-remover": {
  "ar": {
   "intro": "أداة إزالة التشكيل تحذف الحركات من النص العربي لتسهيل البحث والمقارنة.",
   "steps": [
    "الصق النص المشكّل.",
    "شغّل الأداة.",
    "انسخ النص بدون تشكيل."
   ],
   "tips": [
    "إزالة التشكيل قد تغيّر قراءة بعض الكلمات في النصوص الدينية والشعرية.",
    "احتفظ بنسخة مشكّلة للنصوص التي يهم فيها النطق."
   ],
   "faq": [
    [
     "هل تحذف الشدة أيضًا؟",
     "تُزيل الحركات القياسية وفق ما تدعمه الأداة، فراجع الناتج."
    ]
   ]
  },
  "en": {
   "intro": "The Arabic diacritics remover strips vowel marks from Arabic text to simplify searching and comparison.",
   "steps": [
    "Paste the vocalised text.",
    "Run the tool.",
    "Copy the unvocalised text."
   ],
   "tips": [
    "Removing marks can change how some words read in religious and poetic texts.",
    "Keep a vocalised copy where pronunciation matters."
   ],
   "faq": [
    [
     "Does it also remove shadda?",
     "It removes standard marks as supported; review the output."
    ]
   ]
  }
 },
 "binary-hex-converter": {
  "ar": {
   "intro": "محوّل الثنائي والست عشري يحوّل بين الأنظمة العددية للأعداد والنصوص.",
   "steps": [
    "اختر نوع التحويل.",
    "أدخل القيمة.",
    "اقرأ الناتج."
   ],
   "tips": [
    "الثنائي يتكوّن من 0 و1 فقط، والست عشري من 0-9 وA-F.",
    "للنصوص يختلف الناتج بحسب الترميز."
   ],
   "faq": [
    [
     "كيف أحوّل 255 إلى ست عشري؟",
     "يساوي FF."
    ]
   ]
  },
  "en": {
   "intro": "The binary/hex converter converts numbers and text between number systems.",
   "steps": [
    "Choose the conversion type.",
    "Enter the value.",
    "Read the output."
   ],
   "tips": [
    "Binary uses only 0 and 1; hex uses 0–9 and A–F.",
    "For text, the output depends on the encoding."
   ],
   "faq": [
    [
     "How do I convert 255 to hex?",
     "It is FF."
    ]
   ]
  }
 },
 "box-shadow-generator": {
  "ar": {
   "intro": "مولّد الظل ينشئ كود CSS لظل العناصر مع معاينة مباشرة.",
   "steps": [
    "اضبط الإزاحة والتمويه والامتداد.",
    "اختر اللون والشفافية.",
    "انسخ الكود."
   ],
   "tips": [
    "ظل خفيف بشفافية منخفضة يبدو أكثر احترافية.",
    "تجنب الظلال الثقيلة جدًا على الجوال."
   ],
   "faq": [
    [
     "أين أضع الكود؟",
     "في خاصية box-shadow للعنصر المطلوب."
    ]
   ]
  },
  "en": {
   "intro": "The box-shadow generator builds CSS for element shadows with a live preview.",
   "steps": [
    "Set offset, blur and spread.",
    "Pick colour and opacity.",
    "Copy the code."
   ],
   "tips": [
    "A subtle, low-opacity shadow tends to look more professional.",
    "Avoid very heavy shadows on mobile."
   ],
   "faq": [
    [
     "Where do I put the code?",
     "In the box-shadow property of the element."
    ]
   ]
  }
 },
 "compound-interest": {
  "ar": {
   "intro": "حاسبة الفائدة المركبة تُظهر كيف ينمو مبلغك مع إضافة الفائدة على الفائدة عبر السنوات.",
   "steps": [
    "أدخل المبلغ الأولي.",
    "حدّد نسبة الفائدة والمدة وعدد مرات التركيب.",
    "اقرأ القيمة النهائية."
   ],
   "tips": [
    "الفائدة المركبة تعتمد بقوة على المدة.",
    "العوائد الفعلية قد تختلف عن الافتراضات."
   ],
   "faq": [
    [
     "ما الفرق بين البسيطة والمركبة؟",
     "البسيطة على أصل المبلغ فقط، والمركبة على الأصل والفوائد السابقة."
    ]
   ]
  },
  "en": {
   "intro": "The compound interest calculator shows how your money grows when interest earns interest over the years.",
   "steps": [
    "Enter the initial amount.",
    "Set the rate, term and compounding frequency.",
    "Read the final value."
   ],
   "tips": [
    "Compounding relies heavily on time.",
    "Real returns can differ from assumptions."
   ],
   "faq": [
    [
     "Simple vs compound interest?",
     "Simple applies to the principal only; compound applies to principal plus prior interest."
    ]
   ]
  }
 },
 "countdown-timer": {
  "ar": {
   "intro": "المؤقت التنازلي يعدّ تنازليًا إلى وقت محدد وينبّهك عند الانتهاء.",
   "steps": [
    "حدّد المدة.",
    "ابدأ العدّ.",
    "اترك الصفحة مفتوحة حتى انتهاء الوقت."
   ],
   "tips": [
    "اترك الصفحة مفتوحة وصوت الجهاز مفعّلًا.",
    "للأوقات الطويلة استخدم منبّه الهاتف أيضًا."
   ],
   "faq": [
    [
     "هل يعمل والصفحة مغلقة؟",
     "لا، يعمل داخل الصفحة المفتوحة."
    ]
   ]
  },
  "en": {
   "intro": "The countdown timer counts down to a set time and alerts you when it ends.",
   "steps": [
    "Set the duration.",
    "Start the countdown.",
    "Keep the page open until it finishes."
   ],
   "tips": [
    "Keep the page open with device sound on.",
    "For long durations also use your phone alarm."
   ],
   "faq": [
    [
     "Does it run when the page is closed?",
     "No, it runs within the open page."
    ]
   ]
  }
 },
 "css-formatter": {
  "ar": {
   "intro": "منسّق CSS يرتّب الكود ويضيف المسافات والأسطر ليسهل قراءته.",
   "steps": [
    "الصق كود CSS.",
    "اضغط تنسيق.",
    "انسخ الكود المنسّق."
   ],
   "tips": [
    "نسّق الكود قبل المراجعة لاكتشاف الأخطاء أسهل.",
    "للإنتاج يمكن تصغيره لاحقًا."
   ],
   "faq": [
    [
     "هل يغيّر عمل الكود؟",
     "لا، يغيّر الشكل فقط."
    ]
   ]
  },
  "en": {
   "intro": "The CSS formatter tidies code with indentation and line breaks for readability.",
   "steps": [
    "Paste your CSS.",
    "Click format.",
    "Copy the formatted code."
   ],
   "tips": [
    "Format before reviewing to spot errors more easily.",
    "Minify later for production."
   ],
   "faq": [
    [
     "Does it change how the code works?",
     "No, only its appearance."
    ]
   ]
  }
 },
 "csv-json-converter": {
  "ar": {
   "intro": "محوّل CSV إلى JSON يحوّل جدول بيانات إلى مصفوفة JSON.",
   "steps": [
    "الصق CSV مع صف العناوين.",
    "شغّل التحويل.",
    "انسخ JSON."
   ],
   "tips": [
    "تأكد أن الصف الأول يحوي أسماء الأعمدة.",
    "اضبط الفاصل إن كان ملفك يستخدم فاصلة منقوطة."
   ],
   "faq": [
    [
     "ماذا لو احتوى الحقل على فاصلة؟",
     "ضعه بين علامتي اقتباس مزدوجتين."
    ]
   ]
  },
  "en": {
   "intro": "The CSV to JSON converter turns a spreadsheet table into a JSON array.",
   "steps": [
    "Paste the CSV with a header row.",
    "Run the conversion.",
    "Copy the JSON."
   ],
   "tips": [
    "Make sure the first row holds column names.",
    "Set the delimiter if your file uses semicolons."
   ],
   "faq": [
    [
     "What if a field contains a comma?",
     "Wrap it in double quotes."
    ]
   ]
  }
 },
 "date-difference": {
  "ar": {
   "intro": "حاسبة الفرق بين تاريخين تعطيك عدد الأيام والأشهر والسنوات بين تاريخين.",
   "steps": [
    "اختر تاريخ البداية.",
    "اختر تاريخ النهاية.",
    "اقرأ الفرق."
   ],
   "tips": [
    "انتبه هل الحساب يشمل يوم النهاية أم لا.",
    "استخدمها لحساب مدد العقود والإجازات."
   ],
   "faq": [
    [
     "هل تراعي السنوات الكبيسة؟",
     "نعم، حسب التقويم الميلادي."
    ]
   ]
  },
  "en": {
   "intro": "The date difference calculator gives the days, months and years between two dates.",
   "steps": [
    "Pick the start date.",
    "Pick the end date.",
    "Read the difference."
   ],
   "tips": [
    "Check whether the end date is inclusive.",
    "Use it for contract and leave periods."
   ],
   "faq": [
    [
     "Does it account for leap years?",
     "Yes, using the Gregorian calendar."
    ]
   ]
  }
 },
 "favicon-generator": {
  "ar": {
   "intro": "مولّد الأيقونة المصغرة ينشئ favicon من صورة أو حرف ليظهر في تبويب المتصفح.",
   "steps": [
    "اختر صورة أو نصًا.",
    "اضبط الألوان.",
    "نزّل الأيقونة وأضفها لموقعك."
   ],
   "tips": [
    "استخدم تصميمًا بسيطًا لأن الحجم صغير جدًا.",
    "اختبرها على خلفيات فاتحة وداكنة."
   ],
   "faq": [
    [
     "ما الحجم المناسب؟",
     "صورة مربعة وواضحة، والمتصفحات تصغّرها تلقائيًا."
    ]
   ]
  },
  "en": {
   "intro": "The favicon generator creates a tab icon from an image or letter for your site.",
   "steps": [
    "Choose an image or text.",
    "Adjust colours.",
    "Download the icon and add it to your site."
   ],
   "tips": [
    "Use a simple design because the size is tiny.",
    "Test on light and dark backgrounds."
   ],
   "faq": [
    [
     "What size works best?",
     "A clear square image; browsers scale it automatically."
    ]
   ]
  }
 },
 "file-size-converter": {
  "ar": {
   "intro": "محوّل أحجام الملفات يحوّل بين البايت والكيلوبايت والميغابايت والجيجابايت.",
   "steps": [
    "أدخل الحجم.",
    "اختر الوحدة.",
    "اقرأ الوحدات الأخرى."
   ],
   "tips": [
    "فرّق بين الأساس العشري (1000) والثنائي (1024).",
    "الأقراص تعلن عادة بالنظام العشري."
   ],
   "faq": [
    [
     "لماذا تظهر سعة القرص أقل من المعلن؟",
     "بسبب اختلاف النظام العشري والثنائي."
    ]
   ]
  },
  "en": {
   "intro": "The file size converter converts between bytes, kilobytes, megabytes and gigabytes.",
   "steps": [
    "Enter the size.",
    "Choose the unit.",
    "Read the other units."
   ],
   "tips": [
    "Distinguish decimal (1000) from binary (1024) bases.",
    "Drives usually advertise capacity in decimal."
   ],
   "faq": [
    [
     "Why does disk capacity show lower than advertised?",
     "Because of decimal vs binary conventions."
    ]
   ]
  }
 },
 "hourly-pay-calculator": {
  "ar": {
   "intro": "حاسبة الأجر بالساعة تحوّل الراتب الشهري إلى أجر ساعة وبالعكس.",
   "steps": [
    "أدخل الراتب أو الأجر.",
    "حدّد ساعات العمل أسبوعيًا.",
    "اقرأ الأجر المقابل."
   ],
   "tips": [
    "استخدم ساعات العمل الفعلية في عقدك.",
    "الناتج قبل الضرائب ما لم تحسبها."
   ],
   "faq": [
    [
     "هل تشمل الضرائب؟",
     "لا، الحساب مبني على المبلغ الذي تدخله."
    ]
   ]
  },
  "en": {
   "intro": "The hourly pay calculator converts a monthly salary to an hourly rate and back.",
   "steps": [
    "Enter the salary or rate.",
    "Set weekly working hours.",
    "Read the equivalent pay."
   ],
   "tips": [
    "Use the actual hours in your contract.",
    "The result is before tax unless you account for it."
   ],
   "faq": [
    [
     "Does it include tax?",
     "No, it works on the amount you enter."
    ]
   ]
  }
 },
 "html-entities": {
  "ar": {
   "intro": "أداة HTML Entities ترمّز الرموز الخاصة مثل < و& إلى صيغة آمنة للعرض في HTML أو تفكها.",
   "steps": [
    "اختر ترميز أو فك.",
    "الصق النص.",
    "انسخ الناتج."
   ],
   "tips": [
    "ترميز الرموز يمنع كسر الصفحة وحقن الأكواد.",
    "رمّز دائمًا النص القادم من المستخدمين."
   ],
   "faq": [
    [
     "لماذا أرمّز < في HTML؟",
     "لأن المتصفح يفسّرها كبداية وسم."
    ]
   ]
  },
  "en": {
   "intro": "The HTML entities tool encodes special characters like < and & into a safe form for HTML, or decodes them.",
   "steps": [
    "Choose encode or decode.",
    "Paste the text.",
    "Copy the output."
   ],
   "tips": [
    "Encoding prevents broken pages and code injection.",
    "Always encode user-provided text."
   ],
   "faq": [
    [
     "Why encode < in HTML?",
     "Because the browser would treat it as the start of a tag."
    ]
   ]
  }
 },
 "html-formatter": {
  "ar": {
   "intro": "منسّق HTML يرتّب الوسوم بمسافات بادئة ليسهل قراءة الكود.",
   "steps": [
    "الصق كود HTML.",
    "اضغط تنسيق.",
    "انسخ الكود المنظّم."
   ],
   "tips": [
    "تأكد من إغلاق الوسوم قبل التنسيق.",
    "لا يصلح الأخطاء البنيوية الكبيرة."
   ],
   "faq": [
    [
     "هل يغيّر مظهر الصفحة؟",
     "لا، يغيّر شكل الكود فقط."
    ]
   ]
  },
  "en": {
   "intro": "The HTML formatter indents tags so code is easier to read.",
   "steps": [
    "Paste your HTML.",
    "Click format.",
    "Copy the tidy code."
   ],
   "tips": [
    "Make sure tags are closed before formatting.",
    "It does not fix major structural errors."
   ],
   "faq": [
    [
     "Does it change the page appearance?",
     "No, only the code layout."
    ]
   ]
  }
 },
 "lorem-ipsum-generator": {
  "ar": {
   "intro": "مولّد النص الوهمي ينشئ فقرات تجريبية لملء التصاميم قبل وصول المحتوى الحقيقي.",
   "steps": [
    "حدّد عدد الفقرات أو الكلمات.",
    "ولّد النص.",
    "انسخه إلى تصميمك."
   ],
   "tips": [
    "استبدل النص الوهمي بمحتوى حقيقي قبل النشر.",
    "لا تترك نصًا وهميًا في صفحة منشورة."
   ],
   "faq": [
    [
     "ما فائدته؟",
     "يعطي شكلًا واقعيًا للنص أثناء التصميم."
    ]
   ]
  },
  "en": {
   "intro": "The lorem ipsum generator makes placeholder paragraphs to fill designs before real content arrives.",
   "steps": [
    "Set the number of paragraphs or words.",
    "Generate the text.",
    "Copy it into your design."
   ],
   "tips": [
    "Replace placeholder text with real content before publishing.",
    "Do not leave placeholder text on a live page."
   ],
   "faq": [
    [
     "What is it for?",
     "It gives realistic-looking text while designing."
    ]
   ]
  }
 },
 "number-to-words": {
  "ar": {
   "intro": "محوّل الأرقام إلى كلمات يكتب الرقم بالحروف، مفيد في الشيكات والفواتير.",
   "steps": [
    "أدخل الرقم.",
    "اختر اللغة.",
    "انسخ النص."
   ],
   "tips": [
    "راجع الناتج في المستندات الرسمية.",
    "انتبه لوحدة العملة عند الكتابة بالحروف."
   ],
   "faq": [
    [
     "هل يدعم الكسور؟",
     "يعتمد على ما تدعمه الأداة، فراجع الناتج."
    ]
   ]
  },
  "en": {
   "intro": "The number to words converter writes a number out in words, useful for cheques and invoices.",
   "steps": [
    "Enter the number.",
    "Choose the language.",
    "Copy the text."
   ],
   "tips": [
    "Review the result in official documents.",
    "Mind the currency unit when writing in words."
   ],
   "faq": [
    [
     "Does it support decimals?",
     "It depends on the tool’s support; check the output."
    ]
   ]
  }
 },
 "password-strength-checker": {
  "ar": {
   "intro": "فاحص قوة كلمة المرور يقيّم مدى صعوبة تخمين كلمة المرور ويقترح تحسينها.",
   "steps": [
    "اكتب كلمة المرور.",
    "اقرأ التقييم.",
    "حسّن الكلمة بزيادة الطول والتنوع."
   ],
   "tips": [
    "الطول مهم أكثر من الرموز المعقدة.",
    "لا تختبر كلمة مرورك الحقيقية على مواقع لا تثق بها؛ جرّب نمطًا مشابهًا."
   ],
   "faq": [
    [
     "هل تُرسل الكلمة لخادم؟",
     "الفحص يتم داخل المتصفح."
    ]
   ]
  },
  "en": {
   "intro": "The password strength checker rates how hard a password is to guess and suggests improvements.",
   "steps": [
    "Type the password.",
    "Read the rating.",
    "Improve it with more length and variety."
   ],
   "tips": [
    "Length matters more than exotic symbols.",
    "Do not test your real password on untrusted sites; try a similar pattern."
   ],
   "faq": [
    [
     "Is the password sent to a server?",
     "The check runs in your browser."
    ]
   ]
  }
 },
 "pdf-rotate": {
  "ar": {
   "intro": "تدوير PDF يدوّر صفحات الملف بزاوية 90 أو 180 أو 270 درجة ويحفظه بالاتجاه الصحيح.",
   "steps": [
    "اختر ملف PDF.",
    "حدّد الصفحات والزاوية.",
    "نزّل الملف المعدّل."
   ],
   "tips": [
    "راجع كل الصفحات بعد التدوير.",
    "احتفظ بنسخة من الأصل."
   ],
   "faq": [
    [
     "هل يمكن تدوير صفحة واحدة فقط؟",
     "نعم، حسب خيارات الأداة."
    ]
   ]
  },
  "en": {
   "intro": "PDF rotate turns the file’s pages by 90, 180 or 270 degrees and saves it in the correct orientation.",
   "steps": [
    "Choose a PDF.",
    "Set the pages and angle.",
    "Download the updated file."
   ],
   "tips": [
    "Review all pages after rotating.",
    "Keep a copy of the original."
   ],
   "faq": [
    [
     "Can I rotate a single page?",
     "Yes, depending on the tool’s options."
    ]
   ]
  }
 },
 "pdf-to-text": {
  "ar": {
   "intro": "استخراج النص من PDF يقرأ النص الموجود داخل الملف لتنسخه وتعدله.",
   "steps": [
    "اختر ملف PDF.",
    "شغّل الاستخراج.",
    "انسخ النص."
   ],
   "tips": [
    "الملفات الممسوحة ضوئيًا كصور قد لا تحتوي نصًا قابلًا للاستخراج.",
    "راجع الناتج لأن التنسيق قد يتغير."
   ],
   "faq": [
    [
     "لماذا لا يظهر نص؟",
     "لأن الملف قد يكون صورًا ممسوحة وليس نصًا."
    ]
   ]
  },
  "en": {
   "intro": "PDF to text extracts the text inside a PDF so you can copy and edit it.",
   "steps": [
    "Choose a PDF.",
    "Run the extraction.",
    "Copy the text."
   ],
   "tips": [
    "Scanned PDFs made of images may contain no extractable text.",
    "Review the output because layout may change."
   ],
   "faq": [
    [
     "Why does no text appear?",
     "The file may be scanned images rather than real text."
    ]
   ]
  }
 },
 "pomodoro-timer": {
  "ar": {
   "intro": "مؤقت بومودورو ينظّم دراستك أو عملك على فترات تركيز قصيرة تتخللها استراحات.",
   "steps": [
    "ابدأ جلسة التركيز.",
    "اعمل حتى انتهاء المؤقت.",
    "خذ استراحة قصيرة ثم كرر."
   ],
   "tips": [
    "أغلق المشتتات خلال الجلسة.",
    "اجعل الاستراحة الطويلة بعد عدة جلسات."
   ],
   "faq": [
    [
     "ما مدة الجلسة التقليدية؟",
     "25 دقيقة تعقبها استراحة قصيرة."
    ]
   ]
  },
  "en": {
   "intro": "The Pomodoro timer organises study or work into short focus sessions with breaks.",
   "steps": [
    "Start a focus session.",
    "Work until the timer ends.",
    "Take a short break and repeat."
   ],
   "tips": [
    "Close distractions during a session.",
    "Take a longer break after several sessions."
   ],
   "faq": [
    [
     "How long is a traditional session?",
     "25 minutes followed by a short break."
    ]
   ]
  }
 },
 "random-number-generator": {
  "ar": {
   "intro": "مولّد الأرقام العشوائية يختار رقمًا أو أكثر ضمن نطاق تحدده.",
   "steps": [
    "حدّد الحد الأدنى والأعلى.",
    "اختر عدد الأرقام.",
    "ولّد النتيجة."
   ],
   "tips": [
    "فعّل منع التكرار إن لزم.",
    "للقرعة العادلة استخدم مولّدًا عشوائيًا بدل الاختيار اليدوي."
   ],
   "faq": [
    [
     "هل الأرقام عشوائية فعلًا؟",
     "تُولَّد بمولّد المتصفح، وهو مناسب للاستخدام العادي."
    ]
   ]
  },
  "en": {
   "intro": "The random number generator picks one or more numbers within a range you set.",
   "steps": [
    "Set the minimum and maximum.",
    "Choose how many numbers.",
    "Generate the result."
   ],
   "tips": [
    "Enable no-repeats if needed.",
    "Use a random generator instead of picking by hand for fair draws."
   ],
   "faq": [
    [
     "Are the numbers truly random?",
     "They come from the browser generator, fine for everyday use."
    ]
   ]
  }
 },
 "reading-time": {
  "ar": {
   "intro": "حاسبة وقت القراءة تقدّر المدة التي يحتاجها القارئ لقراءة نصك.",
   "steps": [
    "الصق النص.",
    "اقرأ المدة المقدّرة.",
    "اختصر النص إن كان أطول من اللازم."
   ],
   "tips": [
    "المتوسط يختلف بين القرّاء وبين النصوص السهلة والمعقدة.",
    "أظهر وقت القراءة في مقالاتك لتشجيع القرّاء."
   ],
   "faq": [
    [
     "كم كلمة يقرأ الشخص في الدقيقة؟",
     "يقرأ معظم الناس نحو 200–250 كلمة في الدقيقة تقريبًا."
    ]
   ]
  },
  "en": {
   "intro": "The reading time calculator estimates how long a reader needs for your text.",
   "steps": [
    "Paste the text.",
    "Read the estimated time.",
    "Shorten the text if it is longer than needed."
   ],
   "tips": [
    "Reading speed varies between readers and between easy and complex texts.",
    "Show reading time in your articles to encourage readers."
   ],
   "faq": [
    [
     "How many words per minute do people read?",
     "Most people read roughly 200–250 words per minute."
    ]
   ]
  }
 },
 "robots-txt-generator": {
  "ar": {
   "intro": "مولّد robots.txt ينشئ ملفًا يخبر محركات البحث أي أقسام موقعك مسموح بزحفها.",
   "steps": [
    "حدّد الأقسام المسموحة والممنوعة.",
    "أضف رابط خريطة الموقع.",
    "ارفع الملف إلى جذر الموقع."
   ],
   "tips": [
    "لا تمنع ملفات CSS وJS اللازمة لعرض الصفحة.",
    "robots.txt لا يمنع الفهرسة وحده؛ استخدم noindex عند الحاجة."
   ],
   "faq": [
    [
     "أين أضع الملف؟",
     "في جذر الموقع على المسار /robots.txt."
    ]
   ]
  },
  "en": {
   "intro": "The robots.txt generator creates a file telling search engines which parts of your site may be crawled.",
   "steps": [
    "Set allowed and disallowed sections.",
    "Add your sitemap URL.",
    "Upload the file to the site root."
   ],
   "tips": [
    "Do not block CSS and JS files needed to render pages.",
    "robots.txt alone does not prevent indexing; use noindex when needed."
   ],
   "faq": [
    [
     "Where do I put the file?",
     "At the site root, at /robots.txt."
    ]
   ]
  }
 },
 "sitemap-generator": {
  "ar": {
   "intro": "مولّد خريطة الموقع ينشئ sitemap.xml بروابط صفحاتك لمساعدة محركات البحث على اكتشافها.",
   "steps": [
    "أدخل روابط صفحاتك.",
    "ولّد الملف.",
    "ارفعه وأرسله في Search Console."
   ],
   "tips": [
    "ضع الروابط الأساسية والقانونية فقط في الخريطة.",
    "حدّث الخريطة عند إضافة صفحات جديدة."
   ],
   "faq": [
    [
     "هل الخريطة تضمن الفهرسة؟",
     "لا، تساعد على الاكتشاف فقط."
    ]
   ]
  },
  "en": {
   "intro": "The sitemap generator creates a sitemap.xml with your page URLs to help search engines discover them.",
   "steps": [
    "Enter your page URLs.",
    "Generate the file.",
    "Upload it and submit it in Search Console."
   ],
   "tips": [
    "List only canonical, indexable pages.",
    "Update the sitemap when you add pages."
   ],
   "faq": [
    [
     "Does a sitemap guarantee indexing?",
     "No, it only aids discovery."
    ]
   ]
  }
 },
 "slug-generator": {
  "ar": {
   "intro": "مولّد الروابط الودية يحوّل العنوان إلى رابط نظيف مناسب للمواقع.",
   "steps": [
    "اكتب العنوان.",
    "انسخ الـ slug الناتج.",
    "استخدمه في رابط الصفحة."
   ],
   "tips": [
    "اجعل الرابط قصيرًا ووصفيًا.",
    "تجنب تغيير الرابط بعد النشر دون إعادة توجيه."
   ],
   "faq": [
    [
     "هل يدعم العربية؟",
     "يمكن استخدام العربية في الروابط أو تحويلها حسب إعداد الأداة."
    ]
   ]
  },
  "en": {
   "intro": "The slug generator turns a title into a clean URL-friendly string.",
   "steps": [
    "Type the title.",
    "Copy the resulting slug.",
    "Use it in the page URL."
   ],
   "tips": [
    "Keep slugs short and descriptive.",
    "Avoid changing the URL after publishing without a redirect."
   ],
   "faq": [
    [
     "Does it support Arabic?",
     "Arabic can be kept or transliterated depending on the tool setting."
    ]
   ]
  }
 },
 "sql-formatter": {
  "ar": {
   "intro": "منسّق SQL يرتّب الاستعلامات بأسطر ومسافات لتصبح مقروءة.",
   "steps": [
    "الصق الاستعلام.",
    "اضغط تنسيق.",
    "انسخ الاستعلام المنظّم."
   ],
   "tips": [
    "نسّق الاستعلامات الطويلة قبل المراجعة.",
    "التنسيق لا يغيّر النتيجة."
   ],
   "faq": [
    [
     "هل يتحقق من صحة الاستعلام؟",
     "لا، هو للتنسيق فقط."
    ]
   ]
  },
  "en": {
   "intro": "The SQL formatter lays out queries with line breaks and indentation so they are readable.",
   "steps": [
    "Paste the query.",
    "Click format.",
    "Copy the formatted query."
   ],
   "tips": [
    "Format long queries before reviewing.",
    "Formatting does not change results."
   ],
   "faq": [
    [
     "Does it validate the query?",
     "No, it only formats."
    ]
   ]
  }
 },
 "timestamp-converter": {
  "ar": {
   "intro": "محوّل الطابع الزمني يحوّل بين Unix timestamp والتاريخ المقروء.",
   "steps": [
    "أدخل الرقم أو التاريخ.",
    "اختر الوحدة ثواني أو مللي ثانية.",
    "اقرأ الناتج."
   ],
   "tips": [
    "الطابع بالمللي ثانية أطول بثلاث خانات من الثواني.",
    "انتبه للمنطقة الزمنية عند عرض التاريخ."
   ],
   "faq": [
    [
     "ما هو Unix timestamp؟",
     "عدد الثواني منذ 1 يناير 1970 UTC."
    ]
   ]
  },
  "en": {
   "intro": "The timestamp converter converts between Unix timestamps and human-readable dates.",
   "steps": [
    "Enter the number or date.",
    "Choose seconds or milliseconds.",
    "Read the output."
   ],
   "tips": [
    "A millisecond timestamp has three more digits than seconds.",
    "Mind the time zone when displaying dates."
   ],
   "faq": [
    [
     "What is a Unix timestamp?",
     "Seconds elapsed since 1 January 1970 UTC."
    ]
   ]
  }
 },
 "typing-speed-test": {
  "ar": {
   "intro": "اختبار سرعة الكتابة يقيس عدد الكلمات في الدقيقة ودقتك.",
   "steps": [
    "ابدأ بكتابة النص المعروض.",
    "أكمل حتى النهاية.",
    "اقرأ سرعتك ودقتك."
   ],
   "tips": [
    "الدقة أهم من السرعة في البداية.",
    "كرر الاختبار بانتظام لتتابع تقدمك."
   ],
   "faq": [
    [
     "ما سرعة الكتابة الجيدة؟",
     "تختلف حسب الغرض، لكن زيادة الدقة تسبق زيادة السرعة."
    ]
   ]
  },
  "en": {
   "intro": "The typing speed test measures your words per minute and accuracy.",
   "steps": [
    "Start typing the displayed text.",
    "Continue to the end.",
    "Read your speed and accuracy."
   ],
   "tips": [
    "Accuracy matters more than speed at first.",
    "Repeat regularly to track progress."
   ],
   "faq": [
    [
     "What is a good typing speed?",
     "It varies by purpose, but build accuracy before speed."
    ]
   ]
  }
 },
 "utm-builder": {
  "ar": {
   "intro": "منشئ روابط UTM يضيف معاملات التتبع لروابطك لتعرف مصدر الزيارات في التحليلات.",
   "steps": [
    "أدخل رابط الصفحة.",
    "املأ المصدر والوسيط والحملة.",
    "انسخ الرابط المتتبَّع."
   ],
   "tips": [
    "استخدم تسمية ثابتة وبأحرف صغيرة لتجنب تفرّق البيانات.",
    "لا تضع UTM على الروابط الداخلية للموقع."
   ],
   "faq": [
    [
     "ما فائدة UTM؟",
     "تُظهر في التحليلات من أي حملة أو مصدر جاءت الزيارة."
    ]
   ]
  },
  "en": {
   "intro": "The UTM builder adds tracking parameters to your links so analytics shows where visits come from.",
   "steps": [
    "Enter the page URL.",
    "Fill in source, medium and campaign.",
    "Copy the tagged link."
   ],
   "tips": [
    "Use consistent lowercase naming to avoid split data.",
    "Do not put UTMs on your internal links."
   ],
   "faq": [
    [
     "What are UTMs for?",
     "They show in analytics which campaign or source a visit came from."
    ]
   ]
  }
 },
 "word-frequency": {
  "ar": {
   "intro": "عدّاد تكرار الكلمات يعرض أكثر الكلمات تكرارًا في نصك.",
   "steps": [
    "الصق النص.",
    "شغّل التحليل.",
    "اقرأ الكلمات الأكثر تكرارًا."
   ],
   "tips": [
    "استخدمه لاكتشاف الإفراط في استخدام كلمة.",
    "تجاهل كلمات الوصل عند تحليل الكلمات المفتاحية."
   ],
   "faq": [
    [
     "هل يفيد في السيو؟",
     "يساعد على رؤية الكلمات المفتاحية الغالبة، دون حشوها."
    ]
   ]
  },
  "en": {
   "intro": "The word frequency counter lists the most repeated words in your text.",
   "steps": [
    "Paste the text.",
    "Run the analysis.",
    "Read the most frequent words."
   ],
   "tips": [
    "Use it to spot overused words.",
    "Ignore stop words when analysing keywords."
   ],
   "faq": [
    [
     "Does it help SEO?",
     "It shows dominant keywords, but do not stuff them."
    ]
   ]
  }
 },
 "xml-formatter": {
  "ar": {
   "intro": "منسّق XML يرتّب الوسوم ويظهر البنية بوضوح ويكشف الأخطاء الشائعة.",
   "steps": [
    "الصق XML.",
    "اضغط تنسيق.",
    "انسخ الناتج."
   ],
   "tips": [
    "تأكد من إغلاق كل وسم.",
    "راجع رسالة الخطأ لتحديد مكان المشكلة."
   ],
   "faq": [
    [
     "لماذا يرفض التنسيق ملفي؟",
     "قد يحتوي على وسم غير مغلق أو رمز غير مسموح."
    ]
   ]
  },
  "en": {
   "intro": "The XML formatter indents tags, reveals the structure clearly and catches common errors.",
   "steps": [
    "Paste the XML.",
    "Click format.",
    "Copy the output."
   ],
   "tips": [
    "Make sure every tag is closed.",
    "Read the error message to locate the problem."
   ],
   "faq": [
    [
     "Why does it reject my file?",
     "It may contain an unclosed tag or an invalid character."
    ]
   ]
  }
 }
};
