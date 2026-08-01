import { TOEFLWord, ReadingPassageData } from '../types';

export const TOEFL_VOCABULARY: TOEFLWord[] = [
  // --- Unit 1: Academic Basics & Research ---
  {
    id: 'w1',
    word: 'hypothesize',
    phonetic: '/haɪˈpɑː.θə.saɪz/',
    pos: 'v.',
    definition: '假設；提出假說',
    englishDefinition: 'To formulate an explanation or assumption based on limited evidence as a starting point for further investigation.',
    rootEtymology: 'hypo- (在...之下) + thesis (論點/放置)',
    rootTag: 'hypo-',
    wordFamily: {
      noun: 'hypothesis',
      verb: 'hypothesize',
      adj: 'hypothetical',
      adv: 'hypothetically'
    },
    collocations: ['formulate a hypothesis', 'hypothetical scenario', 'test the hypothesis'],
    mnemonic: '「還不確定(hypo)的論點(thesis)」，需要經過實驗驗證的【假設】。',
    exampleSentence: 'Scientists hypothesize that liquid water once flowed across the surface of ancient Mars.',
    translation: '科學家假設古老的火星表面曾經有液態水流過。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'medium',
    synonyms: ['speculate', 'conjecture', 'postulate'],
    antonyms: ['prove', 'demonstrate'],
    toeflTopic: 'Scientific Method'
  },
  {
    id: 'w2',
    word: 'empirical',
    phonetic: '/ɪmˈpɪr.ɪ.kəl/',
    pos: 'adj.',
    definition: '以經驗/實驗為依據的；實證的',
    englishDefinition: 'Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.',
    rootEtymology: 'em- (進入) + pir (試驗/經驗) + -ical',
    rootTag: 'empir-',
    wordFamily: {
      noun: 'empiricism / empiricist',
      verb: '-',
      adj: 'empirical',
      adv: 'empirically'
    },
    collocations: ['empirical evidence', 'empirical study', 'gather empirical data'],
    mnemonic: '「硬(em)生生用經驗(pir)來證明」，也就是【實證的】而非憑空捏造。',
    exampleSentence: 'The researcher gathered empirical data to support her theory on language acquisition.',
    translation: '研究人員收集了實證數據來支持她的語言習得理論。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'hard',
    synonyms: ['observational', 'experimental', 'factual'],
    antonyms: ['theoretical', 'speculative'],
    toeflTopic: 'Research Methodology'
  },
  {
    id: 'w3',
    word: 'corroborate',
    phonetic: '/kəˈrɑː.bə.reɪt/',
    pos: 'v.',
    definition: '證實；加強(論點)',
    englishDefinition: 'To confirm or give support to a statement, theory, or finding.',
    rootEtymology: 'cor- (共同) + robor (強壯/如鐵) + -ate',
    wordFamily: {
      noun: 'corroboration',
      verb: 'corroborate',
      adj: 'corroborative',
      adv: '-'
    },
    collocations: ['corroborate findings', 'corroborating evidence'],
    mnemonic: '「大家共同(cor)讓論點變強壯(robor)」，就是【證實】這項說法。',
    exampleSentence: 'Recent geological discoveries corroborate earlier estimates about the age of the fossil.',
    translation: '最新的地質發現證實了先前關於該化石年代的估計。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'hard',
    synonyms: ['substantiate', 'validate', 'verify'],
    antonyms: ['contradict', 'refute'],
    toeflTopic: 'Academic Writing & Discussion'
  },
  {
    id: 'w4',
    word: 'scrutinize',
    phonetic: '/ˈskruː.t̬ən.aɪz/',
    pos: 'v.',
    definition: '細查；審視',
    englishDefinition: 'To examine or inspect closely and thoroughly.',
    rootEtymology: 'scruta (碎屑/細微之物) + -ize',
    rootTag: 'spect-',
    wordFamily: {
      noun: 'scrutiny',
      verb: 'scrutinize',
      adj: 'scrutinizing',
      adv: '-'
    },
    collocations: ['close scrutiny', 'scrutinize details'],
    mnemonic: '「死看(scruti)每一個角落」，代表連微小瑣碎處都【細查審視】。',
    exampleSentence: 'Peer reviewers must scrutinize every step of the methodology before publishing.',
    translation: '同行評審在發表前必須仔細審視研究方法的每一個步驟。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'medium',
    synonyms: ['inspect', 'examine', 'audit'],
    antonyms: ['glance', 'ignore'],
    toeflTopic: 'Critical Analysis'
  },
  {
    id: 'w5',
    word: 'delineate',
    phonetic: '/dɪˈlɪn.i.eɪt/',
    pos: 'v.',
    definition: '描繪；勾勒；明確劃分',
    englishDefinition: 'To describe or portray precisely, or to mark the outline of.',
    rootEtymology: 'de- (向下/加強) + line (線條) + -ate',
    wordFamily: {
      noun: 'delineation',
      verb: 'delineate',
      adj: 'delineated',
      adv: '-'
    },
    collocations: ['clearly delineate', 'delineate boundaries'],
    mnemonic: '「用線條(line)畫出輪廓」，也就是【精準描繪】或【界定】。',
    exampleSentence: 'The paper clearly delineates the difference between physical and cognitive fatigue.',
    translation: '該論文清楚地劃分了身體疲勞與認知疲勞之間的差異。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'hard',
    synonyms: ['depict', 'outline', 'define'],
    antonyms: ['confuse', 'distort'],
    toeflTopic: 'Academic Argumentation'
  },
  {
    id: 'w101',
    word: 'substantiate',
    phonetic: '/səbˈstæn.ʃi.eɪt/',
    pos: 'v.',
    definition: '證實；給予實體證明',
    englishDefinition: 'To provide evidence to support or prove the truth of.',
    rootEtymology: 'sub- (在...之下) + stant (站立) + -iate',
    rootTag: 'sub-',
    wordFamily: {
      noun: 'substance / substantiation',
      verb: 'substantiate',
      adj: 'substantial',
      adv: 'substantially'
    },
    collocations: ['substantiate a claim', 'substantiate allegations'],
    mnemonic: '「站得住腳(stant)的底座(sub)」，能夠【證實】立論真偽。',
    exampleSentence: 'The research team failed to substantiate their initial claim with observable data.',
    translation: '研究團隊未能用可觀察的數據證實他們最初的說法。',
    category: 'academic',
    categoryName: '學術研究基礎',
    difficulty: 'hard',
    synonyms: ['validate', 'corroborate', 'verify'],
    antonyms: ['disprove', 'refute'],
    toeflTopic: 'Scientific Method'
  },

  // --- Unit 2: Natural Science & Biology ---
  {
    id: 'w6',
    word: 'photosynthesis',
    phonetic: '/ˌfoʊ.toʊˈsɪn.θə.sɪs/',
    pos: 'n.',
    definition: '光合作用',
    englishDefinition: 'The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.',
    rootEtymology: 'photo- (光) + syn- (共同) + thesis (組合)',
    rootTag: 'syn-',
    wordFamily: {
      noun: 'photosynthesis',
      verb: 'photosynthesize',
      adj: 'photosynthetic',
      adv: 'photosynthetically'
    },
    collocations: ['photosynthetic rate', 'process of photosynthesis'],
    mnemonic: '「利用光(photo)來合成(synthesis)養分」=【光合作用】。',
    exampleSentence: 'Photosynthesis is the foundational process driving energy flow in tropical forest ecosystems.',
    translation: '光合作用是推動熱帶森林生態系統能量流動的基石過程。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'easy',
    synonyms: ['carbon fixation'],
    toeflTopic: 'Botany & Ecology'
  },
  {
    id: 'w7',
    word: 'symbiotic',
    phonetic: '/ˌsɪm.baɪˈɑː.t̬ɪk/',
    pos: 'adj.',
    definition: '共生的；互利共榮的',
    englishDefinition: 'Involving interaction between two different organisms living in close physical association.',
    rootEtymology: 'sym- (共同) + bio (生命) + -tic',
    rootTag: 'bio-',
    wordFamily: {
      noun: 'symbiosis',
      verb: '-',
      adj: 'symbiotic',
      adv: 'symbiotically'
    },
    collocations: ['symbiotic relationship', 'symbiotic organism'],
    mnemonic: '「生命(bio)生活在一起(sym)」=【共生的】。',
    exampleSentence: 'Corals rely on a symbiotic relationship with microscopic algae for their vivid colors and nutrients.',
    translation: '珊瑚依賴與微小藻類的共生關係來獲得鮮豔的色彩與營養。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'medium',
    synonyms: ['cooperative', 'interdependent', 'mutualistic'],
    antonyms: ['parasitic', 'solitary'],
    toeflTopic: 'Marine Biology'
  },
  {
    id: 'w8',
    word: 'indigenous',
    phonetic: '/ɪnˈdɪdʒ.ə.nəs/',
    pos: 'adj.',
    definition: '土生土長的；原產的；本土的',
    englishDefinition: 'Originating or occurring naturally in a particular place; native.',
    rootEtymology: 'indi- (內部/當地) + gen (產生) + -ous',
    wordFamily: {
      noun: 'indigeneity',
      verb: '-',
      adj: 'indigenous',
      adv: 'indigenously'
    },
    collocations: ['indigenous species', 'indigenous culture'],
    mnemonic: '「在當地(indi)產生(gen)的」，即【本土原產的】。',
    exampleSentence: 'The koala is indigenous to Australia and feeds almost exclusively on eucalyptus leaves.',
    translation: '考拉是澳洲特有的原生物種，幾乎只吃尤加利樹葉。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'medium',
    synonyms: ['native', 'endemic', 'aboriginal'],
    antonyms: ['exotic', 'introduced', 'foreign'],
    toeflTopic: 'Zoology & Biogeography'
  },
  {
    id: 'w9',
    word: 'dormant',
    phonetic: '/ˈdɔːr.mənt/',
    pos: 'adj.',
    definition: '休眠的；潛伏的',
    englishDefinition: 'Having normal physical functions suspended or slowed down for a period of time; in a state of rest.',
    rootEtymology: 'dorm (睡覺) + -ant',
    wordFamily: {
      noun: 'dormancy',
      verb: '-',
      adj: 'dormant',
      adv: '-'
    },
    collocations: ['remain dormant', 'dormant volcano', 'dormant period'],
    mnemonic: 'Dorm(宿舍睡覺) ->【休眠休止的】。火山或種子暫時不活躍狀態。',
    exampleSentence: 'Certain seed species can remain dormant in dry desert soil for decades until rain falls.',
    translation: '某些植物種子可以在乾旱的沙漠土壤中保持休眠狀態數十年，直到降雨。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'medium',
    synonyms: ['inactive', 'quiescent', 'latent'],
    antonyms: ['active', 'vibrant'],
    toeflTopic: 'Plant Adaptation'
  },
  {
    id: 'w10',
    word: 'biodiversity',
    phonetic: '/ˌbaɪ.oʊ.daɪˈvɝː.sə.t̬i/',
    pos: 'n.',
    definition: '生物多樣性',
    englishDefinition: 'The variety of plant and animal life in the world or in a particular habitat.',
    rootEtymology: 'bio (生命) + diversity (多樣化)',
    rootTag: 'bio-',
    wordFamily: {
      noun: 'biodiversity',
      verb: '-',
      adj: 'biodiverse',
      adv: '-'
    },
    collocations: ['preserve biodiversity', 'loss of biodiversity'],
    mnemonic: '「生命(bio) + 多樣性(diversity)」，托福聽力與閱讀的核心關鍵字。',
    exampleSentence: 'Deforestation severely threatens biodiversity in rainforest habitats across South America.',
    translation: '森林砍伐嚴重威脅著南美洲雨林棲息地的生物多樣性。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'easy',
    synonyms: ['ecological richness'],
    toeflTopic: 'Environmental Biology'
  },
  {
    id: 'w102',
    word: 'metamorphosis',
    phonetic: '/ˌmet.əˈmɔːr.fə.sɪs/',
    pos: 'n.',
    definition: '變態；形變；徹底蛻變',
    englishDefinition: 'A complete change of form, structure, or substance, especially in biology.',
    rootEtymology: 'meta- (改變) + morph (形狀) + -osis',
    wordFamily: {
      noun: 'metamorphosis',
      verb: 'metamorphose',
      adj: 'metamorphic',
      adv: '-'
    },
    collocations: ['undergo metamorphosis', 'metamorphic rock'],
    mnemonic: '「改變(meta)形態(morph)的過程」= 昆蟲【變態/蛻變】。',
    exampleSentence: 'Caterpillars undergo a remarkable metamorphosis inside a chrysalis to become butterflies.',
    translation: '毛毛蟲在蛹內經歷著顯著的變態發育，最終羽化為蝴蝶。',
    category: 'biology',
    categoryName: '自然科學與生物',
    difficulty: 'hard',
    synonyms: ['transformation', 'mutation', 'transmutation'],
    toeflTopic: 'Entomology & Evolution'
  },

  // --- Unit 3: Earth & Environmental Science ---
  {
    id: 'w11',
    word: 'precipitation',
    phonetic: '/prɪˌsɪp.əˈteɪ.ʃən/',
    pos: 'n.',
    definition: '降水(雨、雪、雹)；沉澱物',
    englishDefinition: 'Rain, snow, sleet, or hail that falls to the ground.',
    rootEtymology: 'pre- (向前/向下) + cipit (頭/落下) + -ation',
    wordFamily: {
      noun: 'precipitation',
      verb: 'precipitate',
      adj: 'precipitous',
      adv: 'precipitously'
    },
    collocations: ['annual precipitation', 'heavy precipitation'],
    mnemonic: '「頭(cipit)朝下往地表落(pre)」= 雨雪【降水】。',
    exampleSentence: 'The arid region receives less than ten inches of annual precipitation.',
    translation: '該乾旱地區的年降水量少於十英吋。',
    category: 'environment',
    categoryName: '地球與環境科學',
    difficulty: 'medium',
    synonyms: ['rainfall', 'downpour'],
    toeflTopic: 'Climatology'
  },
  {
    id: 'w12',
    word: 'glacier',
    phonetic: '/ˈɡleɪ.ʃɚ/',
    pos: 'n.',
    definition: '冰河；冰川',
    englishDefinition: 'A slowly moving mass or river of ice formed by the accumulation and compaction of snow on mountains or near the poles.',
    rootEtymology: 'glacies (冰)',
    wordFamily: {
      noun: 'glacier / glaciation',
      verb: '-',
      adj: 'glacial',
      adv: 'glacially'
    },
    collocations: ['glacial retreat', 'glacial movement', 'glacial epoch'],
    mnemonic: '諧音「隔雷雪」-> 龐大如山的巨型冰川【冰河】。',
    exampleSentence: 'Glacier retreat provides direct observational evidence of global warming over the past century.',
    translation: '冰河消退為過去一個世紀的全球暖化提供了直接的觀察證據。',
    category: 'environment',
    categoryName: '地球與環境科學',
    difficulty: 'easy',
    synonyms: ['ice sheet', 'iceberg'],
    toeflTopic: 'Geology & Glaciology'
  },
  {
    id: 'w13',
    word: 'sediment',
    phonetic: '/ˈsed.ə.mənt/',
    pos: 'n.',
    definition: '沉積物；泥沙',
    englishDefinition: 'Matter that settles to the bottom of a liquid; mineral or organic matter deposited by water, air, or ice.',
    rootEtymology: 'sed (坐下/沉澱) + -ment',
    wordFamily: {
      noun: 'sediment / sedimentation',
      verb: 'sediment',
      adj: 'sedimentary',
      adv: '-'
    },
    collocations: ['sedimentary rock', 'accumulate sediment'],
    mnemonic: '「沉坐(sed)到水底的東西」= 沉積物。沉積岩即 sedimentary rock。',
    exampleSentence: 'Rivers transport millions of tons of sediment down to coastal deltas each year.',
    translation: '河流每年將數百萬噸沉積物搬運至沿海三角洲。',
    category: 'environment',
    categoryName: '地球與環境科學',
    difficulty: 'medium',
    synonyms: ['silt', 'deposit', 'dregs'],
    toeflTopic: 'Sedimentology'
  },
  {
    id: 'w14',
    word: 'geothermal',
    phonetic: '/ˌdʒiː.oʊˈθɝː.məl/',
    pos: 'adj.',
    definition: '地熱的',
    englishDefinition: 'Relating to or produced by the internal heat of the earth.',
    rootEtymology: 'geo- (地球) + therm (熱量) + -al',
    rootTag: 'geo-',
    wordFamily: {
      noun: 'geothermal energy',
      verb: '-',
      adj: 'geothermal',
      adv: '-'
    },
    collocations: ['geothermal energy', 'geothermal plant', 'geothermal activity'],
    mnemonic: '「地球(geo)內部的熱能(therm)」= 地熱的。',
    exampleSentence: 'Iceland harnesses geothermal energy to generate renewable electricity and warm buildings.',
    translation: '冰島利用地熱能來產生可再生電力並為建築物供暖。',
    category: 'environment',
    categoryName: '地球與環境科學',
    difficulty: 'medium',
    synonyms: ['earth-heat'],
    toeflTopic: 'Energy & Geology'
  },

  // --- Unit 4: History, Art & Humanities ---
  {
    id: 'w15',
    word: 'artifact',
    phonetic: '/ˈɑːr.t̬ə.fækt/',
    pos: 'n.',
    definition: '手工藝品；人工製品；史前古物',
    englishDefinition: 'An object made by a human being, typically an item of cultural or historical interest.',
    rootEtymology: 'arti (藝術/技巧) + fact (製作)',
    wordFamily: {
      noun: 'artifact',
      verb: '-',
      adj: 'artifactual',
      adv: '-'
    },
    collocations: ['ancient artifact', 'excavate artifacts'],
    mnemonic: '「用技巧(arti)製作(fact)出來的物品」= 【史前文物/古物】。',
    exampleSentence: 'Archaeologists excavated a ceramic artifact dating back to the Bronze Age.',
    translation: '考古學家挖掘出一件可以追溯到青銅時代的陶瓷文物。',
    category: 'humanities',
    categoryName: '歷史藝術與人文',
    difficulty: 'easy',
    synonyms: ['relic', 'handicraft', 'antiquity'],
    toeflTopic: 'Archaeology'
  },
  {
    id: 'w16',
    word: 'precedent',
    phonetic: '/ˈpres.ə.dent/',
    pos: 'n.',
    definition: '先例；前例',
    englishDefinition: 'An earlier event or action that is regarded as an example or guide to be considered in subsequent similar circumstances.',
    rootEtymology: 'pre- (先前) + cede (走) + -ent',
    wordFamily: {
      noun: 'precedent',
      verb: 'precede',
      adj: 'preceding / unprecedented',
      adv: '-'
    },
    collocations: ['set a precedent', 'unprecedented growth'],
    mnemonic: '「走(cede)在最前面的事件(pre)」= 【先例】。',
    exampleSentence: 'The ruling set a landmark precedent for intellectual property rights on digital art.',
    translation: '該裁決為數位藝術的智慧財產權樹立了具里程碑意義的先例。',
    category: 'humanities',
    categoryName: '歷史藝術與人文',
    difficulty: 'medium',
    synonyms: ['antecedent', 'paradigm', 'model'],
    toeflTopic: 'Legal History & Social Studies'
  },
  {
    id: 'w17',
    word: 'aesthetic',
    phonetic: '/esˈθet̬.ɪk/',
    pos: 'adj.',
    definition: '美學的；審美的；美感',
    englishDefinition: 'Concerned with beauty or the appreciation of beauty.',
    rootEtymology: 'aesthet (感知/感官感受) + -ic',
    wordFamily: {
      noun: 'aesthetic / aesthetics',
      verb: '-',
      adj: 'aesthetic',
      adv: 'aesthetically'
    },
    collocations: ['visual aesthetic', 'aesthetic appeal', 'aesthetically pleasing'],
    mnemonic: '「能觸動美感心靈(aesthet)的」= 【審美的/美學的】。',
    exampleSentence: 'Gothic architecture combined innovative engineering with a striking visual aesthetic.',
    translation: '哥德式建築將創新的工程技術與令人震撼的視覺美學結合在一起。',
    category: 'humanities',
    categoryName: '歷史藝術與人文',
    difficulty: 'medium',
    synonyms: ['artistic', 'tasteful'],
    antonyms: ['unsightly', 'unappealing'],
    toeflTopic: 'Art History'
  },

  // --- Unit 5: Social Science & Psychology ---
  {
    id: 'w18',
    word: 'cognitive',
    phonetic: '/ˈkɑːɡ.nə.t̬ɪv/',
    pos: 'adj.',
    definition: '認知的；感知的',
    englishDefinition: 'Relating to the mental processes of perception, memory, judgment, and reasoning.',
    rootEtymology: 'cogn- (知道/認識) + -itive',
    wordFamily: {
      noun: 'cognition',
      verb: '-',
      adj: 'cognitive',
      adv: 'cognitively'
    },
    collocations: ['cognitive development', 'cognitive performance', 'cognitive psychology'],
    mnemonic: 'cogn-「知道/認識」(如 recognize)。cognitive function 即【認知功能】。',
    exampleSentence: 'Puzzles and spatial games can enhance cognitive performance in aging adults.',
    translation: '益智拼圖和空間遊戲可以提升高齡者的認知表現。',
    category: 'psychology',
    categoryName: '社會科學與心理學',
    difficulty: 'easy',
    synonyms: ['intellectual', 'perceptual', 'mental'],
    toeflTopic: 'Cognitive Psychology'
  },
  {
    id: 'w19',
    word: 'demographic',
    phonetic: '/ˌdem.əˈɡræf.ɪk/',
    pos: 'adj.',
    definition: '人口統計學的；人口特徵數據',
    englishDefinition: 'Relating to the structure of populations, such as age, race, gender, and income.',
    rootEtymology: 'demo (人民) + graph (記錄/畫圖) + -ic',
    wordFamily: {
      noun: 'demographics / demography',
      verb: '-',
      adj: 'demographic',
      adv: 'demographically'
    },
    collocations: ['demographic shift', 'target demographic'],
    mnemonic: '「紀錄(graph)人民(demo)結構」= 【人口統計學的】。',
    exampleSentence: 'Demographic shifts in suburban areas have heavily influenced municipal funding allocation.',
    translation: '郊區的人口結構轉變深刻影響了市政資金的分配。',
    category: 'psychology',
    categoryName: '社會科學與心理學',
    difficulty: 'medium',
    synonyms: ['population statistics'],
    toeflTopic: 'Sociology & Demographics'
  },
  {
    id: 'w20',
    word: 'incentive',
    phonetic: '/ɪnˈsen.t̬ɪv/',
    pos: 'n.',
    definition: '誘因；動機；獎勵',
    englishDefinition: 'A thing that motivates or encourages someone to do something.',
    rootEtymology: 'in- (進入) + cant/cent (唱歌/吟唱) + -ive',
    wordFamily: {
      noun: 'incentive',
      verb: 'incentivize',
      adj: 'incentivized',
      adv: '-'
    },
    collocations: ['financial incentive', 'provide incentive'],
    mnemonic: '「在耳朵旁高歌引誘你去做」= 【誘因/動機】。',
    exampleSentence: 'Tax credits provide a strong financial incentive for companies to adopt clean energy solar panels.',
    translation: '稅務減免為公司採用清潔能源太陽能板提供了強大的財務誘因。',
    category: 'psychology',
    categoryName: '社會科學與心理學',
    difficulty: 'easy',
    synonyms: ['motivation', 'stimulus', 'encourage'],
    antonyms: ['deterrent', 'disincentive'],
    toeflTopic: 'Economics & Behavioral Psychology'
  },

  // --- Unit 6: Astronomy & Physics ---
  {
    id: 'w21',
    word: 'celestial',
    phonetic: '/səˈles.tʃəl/',
    pos: 'adj.',
    definition: '天體的；天空的',
    englishDefinition: 'Positioned in or relating to the sky, or outer space as observed in astronomy.',
    rootEtymology: 'caelum (天空/天堂) + -ial',
    wordFamily: {
      noun: 'celestial body',
      verb: '-',
      adj: 'celestial',
      adv: 'celestially'
    },
    collocations: ['celestial body', 'celestial mechanics', 'celestial navigation'],
    mnemonic: 'Celestial body 代表【天體】(如恆星、行星、彗星)。',
    exampleSentence: 'Ancient astronomers mapped the positions of celestial objects without modern telescopes.',
    translation: '古代天文學家在沒有現代望遠鏡的情況下繪製了天體的位置圖。',
    category: 'astronomy',
    categoryName: '天體與物理學',
    difficulty: 'medium',
    synonyms: ['heavenly', 'astronomical', 'cosmic'],
    antonyms: ['terrestrial', 'earthly'],
    toeflTopic: 'Astronomy'
  },
  {
    id: 'w22',
    word: 'magnitude',
    phonetic: '/ˈmæɡ.nə.tuːd/',
    pos: 'n.',
    definition: '巨大；規模；星等(天體亮度)',
    englishDefinition: 'The great size or extent of something; or the degree of brightness of a star.',
    rootEtymology: 'magn- (大) + -itude (名詞字尾)',
    wordFamily: {
      noun: 'magnitude',
      verb: 'magnify',
      adj: 'magnificent',
      adv: 'magnificently'
    },
    collocations: ['order of magnitude', 'stellar magnitude'],
    mnemonic: 'magn = 大 (Magnify 放大)。An earthquake of high magnitude = 強震。',
    exampleSentence: 'The astronomer detected a supernova whose magnitude far surpassed neighboring stars.',
    translation: '天文學家檢測到一顆超新星，其星等亮度遠遠超過了鄰近的恆星。',
    category: 'astronomy',
    categoryName: '天體與物理學',
    difficulty: 'medium',
    synonyms: ['scale', 'extent', 'intensity'],
    antonyms: ['smallness', 'insignificance'],
    toeflTopic: 'Astrophysics'
  },

  // --- Unit 7: Campus Life & TOEFL Discussion ---
  {
    id: 'w23',
    word: 'prerequisite',
    phonetic: '/ˌpriːˈrek.wə.zɪt/',
    pos: 'n.',
    definition: '先修課程；前提條件',
    englishDefinition: 'A thing that is required as a prior condition for something else to happen or exist.',
    rootEtymology: 'pre- (在...之前) + requisite (必要的)',
    wordFamily: {
      noun: 'prerequisite / requirement',
      verb: 'require',
      adj: 'requisite',
      adv: '-'
    },
    collocations: ['strict prerequisite', 'prerequisite course'],
    mnemonic: '「在選修這門進階課之前(pre)必須具備(requisite)的課程」= 【先修課】。',
    exampleSentence: 'Introductory Microeconomics is a strict prerequisite for registering for advanced finance courses.',
    translation: '個體經濟學導論是選修高階財務課程的嚴格先修課。',
    category: 'campus',
    categoryName: '校園生活與聽力口說',
    difficulty: 'easy',
    synonyms: ['requirement', 'precondition', 'qualification'],
    toeflTopic: 'Academic Conversation & Course Registration'
  },
  {
    id: 'w24',
    word: 'dissertation',
    phonetic: '/ˌdɪs.ɚˈteɪ.ʃən/',
    pos: 'n.',
    definition: '博士/碩士畢業論文',
    englishDefinition: 'A long essay on a particular subject, especially one written for a university degree.',
    rootEtymology: 'dis- (分開) + sert (連接/討論) + -ation',
    wordFamily: {
      noun: 'dissertation',
      verb: 'dissert',
      adj: '-',
      adv: '-'
    },
    collocations: ['doctoral dissertation', 'defend a dissertation'],
    mnemonic: '「把複雜題目拆開詳細論述」= 【畢業論文】。',
    exampleSentence: 'The doctoral candidate successfully defended her dissertation on renewable battery storage.',
    translation: '該博士候選人成功答辯了她關於可再生電池儲能的博士論文。',
    category: 'campus',
    categoryName: '校園生活與聽力口說',
    difficulty: 'medium',
    synonyms: ['thesis', 'treatise', 'monograph'],
    toeflTopic: 'University Graduate Studies'
  },
  {
    id: 'w25',
    word: 'plagiarism',
    phonetic: '/ˈpleɪ.dʒɚ.ɪ.zəm/',
    pos: 'n.',
    definition: '抄襲；剽竊',
    englishDefinition: 'The practice of taking someone else\'s work or ideas and passing them off as one\'s own.',
    rootEtymology: 'plagiarius (綁架者) + -ism',
    wordFamily: {
      noun: 'plagiarism / plagiarist',
      verb: 'plagiarize',
      adj: 'plagiarized',
      adv: '-'
    },
    collocations: ['academic plagiarism', 'accused of plagiarism'],
    mnemonic: '像「綁架別人的心血文字」= 【抄襲剽竊】。',
    exampleSentence: 'Universities enforce strict zero-tolerance academic integrity policies against plagiarism.',
    translation: '大學針對學術抄襲制定了嚴格的零容忍誠信政策。',
    category: 'campus',
    categoryName: '校園生活與聽力口說',
    difficulty: 'easy',
    synonyms: ['copying', 'infringement', 'piracy'],
    antonyms: ['originality', 'authenticity'],
    toeflTopic: 'Campus Ethics & Policy'
  }
];

// TOEFL Academic Reading Passages sample dataset
export const TOEFL_READING_PASSAGES: ReadingPassageData[] = [
  {
    id: 'p1',
    title: 'The Adaptation of Plant Life in Arid Ecosystems',
    topic: 'Botany & Environmental Ecology',
    category: 'biology',
    content: `In extremely dry environments, plant species must evolve specialized survival mechanisms. While many plants require consistent moisture, desert vegetation often remains dormant in the soil for extended periods until rain arrives. To survive intense drought, some indigenous succulents utilize crassulacean acid metabolism to optimize water usage during photosynthesis. Furthermore, researchers hypothesize that deep taproot systems enable desert flora to tap into subterranean water tables far beneath sediment layers. Gathering empirical data on these botanical adaptations helps climate scientists predict how agricultural crops might respond to warming global weather patterns.`,
    targetWords: ['dormant', 'indigenous', 'photosynthesis', 'hypothesize', 'sediment', 'empirical'],
    questions: [
      {
        question: 'According to the passage, why do some desert plants remain dormant?',
        options: [
          'To avoid herbivores during peak feeding seasons',
          'To conserve vitality until water becomes available in the soil',
          'Because they lack taproot systems altogether',
          'To prevent over-photosynthesis during moonlight hours'
        ],
        answerIndex: 1,
        explanation: 'The passage states desert vegetation remains dormant until rain arrives to survive drought.'
      },
      {
        question: 'The word "indigenous" in the passage is closest in meaning to:',
        options: ['Exotic', 'Artificially imported', 'Native to a region', 'Newly mutated'],
        answerIndex: 2,
        explanation: 'Indigenous means native or originating naturally in a particular location.'
      }
    ]
  },
  {
    id: 'p2',
    title: 'Astronomical Observations and Celestial Bodies',
    topic: 'Astrophysics & Deep Space',
    category: 'astronomy',
    content: `For centuries, human understanding of celestial bodies was limited by atmospheric distortion. Before space-based observatories, early astronomers could only scrutinize nearby planets through optical telescopes. However, modern space telescopes can capture light from distant galaxies without atmospheric interference, enabling scientists to measure stellar magnitude with extreme precision. These breakthroughs corroborate theories regarding the cosmic expansion rate following the Big Bang.`,
    targetWords: ['celestial', 'scrutinize', 'magnitude', 'corroborate'],
    questions: [
      {
        question: 'What is highlighted as a primary benefit of modern space telescopes in the text?',
        options: [
          'They eliminate atmospheric interference to accurately observe celestial objects',
          'They cost significantly less than ground-based stations',
          'They change the physical magnitude of distant stars',
          'They allow instant travel to galaxies'
        ],
        answerIndex: 0,
        explanation: 'Space telescopes operate outside the atmosphere, capturing clearer light from distant celestial objects.'
      }
    ]
  }
];

export const UNLOCKABLE_BADGES = [
  {
    id: 'b1',
    title: '單字初學者',
    description: '完成第一次 5 個托福單字特訓',
    icon: '🌱',
    requiredWords: 5,
    unlocked: false
  },
  {
    id: 'b2',
    title: '記憶曲線達人',
    description: '使用 SRS 間隔重複復習超過 15 個單字',
    icon: '🧠',
    requiredWords: 15,
    unlocked: false
  },
  {
    id: 'b3',
    title: '連續打卡王',
    description: '維持連續學習 3 天以上',
    icon: '🔥',
    requiredStreak: 3,
    unlocked: false
  },
  {
    id: 'b4',
    title: '托福百詞破',
    description: '將超過 20 個托福詞彙提升至 Mastered 階段',
    icon: '🏆',
    requiredWords: 20,
    unlocked: false
  }
];
