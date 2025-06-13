# paper title
ON PATH TO MULTIMODAL HISTORICAL REASONING: HISTBENCH AND HISTAGENT

# Citations
@misc{qiu2025path,
    title={On Path to Multimodal Historical Reasoning: HistBench and HistAgent}
    year={2025},
    eprint={2505.20246},
    archivePrefix={arXiv},
    primaryClass={cs.AI}
}

# links
Code: https://github.com/CharlesQ9/HistAgent
Dataset: https://huggingface.co/datasets/jiahaoq/HistBench

# Organizing Team
[
  {
    "AI Lab, Princeton University": "Jiahao Qiu, Jiacheng Guo, Yifu Lu, Shuyao Zhou, Ling Yang, Shilong Liu, Kaixuan Huang, Mengdi Wang"
  },
  {
    "Department of History, Fudan University": "Fulian Xiao, Siran Wang, Jurdi Cui, Junran Zhou, Xi Gao"
  },
  {
    "University of Michigan": "Yimin Wang, Xinzhe Juan"
  },
  {
    "Shanghai Jiao Tong University": "Yuchen Mao, Tongcheng Zhang, Zhanpeng Zhou"
  },
  {
    "School of Philosophy, Fudan University": "Yijia Chen, Daixin Chen"
  },
  {
    "IIS, Tsinghua University": "Xuan Qi"
  },
  {
    "Department of Philosophy, Columbia University": "Zixin Yao"
  },
  {
    "Department of History, Princeton University": "Charles Argon"
  },
  {
    "The Chinese University of Hong Kong": "Hongru Wang"
  },
  {
    "Tianqiao and Chrissy Chen Institute&Theta Health Inc.": "Xun Jiang"
  }
]

# Dataset Contributors
Yuming Cao, Yue Chen, Yunfei Chen, Zhengyi Chen, Ruowei Dai, Mengqiu Deng, Jiye Fu, Yunting Gu, Zijie Guan,
Zirui Huang, Xiaoyan Ji, Yumeng Jiang, Delong Kong, Haolong Li, Jiaqi Li, Ruipeng Li, Tianze Li, Zhuoran Li,
Haixia Lian, Mengyue Lin, Xudong Liu, Jiayi Lu, Jinghan Lu, Wanyu Luo, Ziyue Luo, Zihao Pu, Zhi Qiao, Ruihuan
Ren, Liang Wan, Ruixiang Wang, Tianhui Wang, Yang Wang, Zeyu Wang, Zihua Wang, Yujia Wu, Zhaoyi Wu, Hao
Xin, Weiao Xing, Ruojun Xiong, Weijie Xu, Yao Shu, Yao Xiao, Xiaorui Yang, Yuchen Yang, Nan Yi, Jiadong Yu,
Yangyuxuan Yu, Huiting Zeng, Danni Zhang, Yunjie Zhang, Zhaoyu Zhang, Zhiheng Zhang, Xiaofeng Zheng, Peirong
Zhou, Linyan Zhong, Xiaoyin Zong, Ying Zhao, Zhenxin Chen, Lin Ding, Xiaoyu Gao, Bingbing Gong, Yichao Li,
Yang Liao, Guang Ma, Tianyuan Ma, Xinrui Sun, Tianyi Wang, Han Xia, Ruobing Xian, Gen Ye, Tengfei Yu, Wentao
Zhang, Yuxi Wang

# intro of the dataset
HistBench is the first benchmark specifically designed to evaluate the capabilities of LLMs in historical reasoning. In
the benchmark,two question types (exact match and multiple choice), six academic dimensions (e.g., source processing,
interdisciplinary synthesis), and a three-tiered difficulty stratification based on task complexity are adopted. The
benchmark contains 414 questions authored by more than 40 contributors, including Ph.D. students and domain
experts. All questions are grounded in real historical sources and methods and follow a standardized protocol that
ensures academic rigor and traceability. Each question is annotated with metadata including answer explanation,data
required,source material, targeted capability, and thematic category and is subjected to a three-stage review: preliminary
screening (format and semantic check), LLM-based pre-evaluation and professional review (history of rigor and validity
of reasoning) to ensure the quality of these questions in terms of both form and content,especially their academic value
and challenges to current LLMs.
In terms of coverage, HistBench spans 29 ancient and modern languages, over 20 historical regions, and at
least 36 subfields. The questions are grounded in multimodal data, including printed texts, manuscripts, images,
inscriptions, audio, and video. The benchmark also spans five major historical epoch, ranging from ancient history to
the contemporary history, supporting diachronic analysis in diverse historiographic contexts. In all, these design criteria
and dataset characteristics enable HistBench to serve as a robust diagnostic tool for evaluating LLMs in the humanities,
with particular emphasis on capabilities of historical research like language mastery, historical materials processing and
the understanding of historical analysis.

# Table 1: Evaluation dimensions for historical reasoning tasks in HistBench（from the paper）
[
  {
    "dimension": "Bibliographic Retrieval",
    "description": "The capability to locate information embedded in scholarly texts, monographs, or journal articles using digital or library-based search strategies."
  },
  {
    "dimension": "Source Identification",
    "description": "The capability to recognize or locate specific historical sources, including manuscripts, digitized archives, or visual primary materials."
  },
  {
    "dimension": "Source Processing",
    "description": "The capability to extract and interpret information from non-textual formats such as handwritten documents, historical images, audio, or video."
  },
  {
    "dimension": "Historical Analysis",
    "description": "The capability to engage in historically grounded reasoning, including causal inference, ideological analysis, and interpretation of events or institutions."
  },
  {
    "dimension": "Interdisciplinary Integration",
    "description": "The capability to draw upon methods and frameworks from adjacent disciplines (e.g., archaeology, linguistics, religious studies) to support historical understanding."
  },
  {
    "dimension": "Cultural Contextualization",
    "description": "The capability to interpret cultural cues, metaphors, sentiment, and identity markers within historically situated discourse."
  }
]

# Quantitative Overview
HistBench contains a total of 414 questions, spanning diverse historical domains, periods, and geographic regions.
The dataset includes two question formats: 306 exact match questions, which require precise, fact-based responses
such as names, dates, or locations; and 108 multiple-choice questions, each consisting of one correct answer and three
plausible distractors grounded in historical reasoning. The predominance of exact match tasks reflects an emphasis on
fine-grained factual precision, while multiple-choice questions are designed to assess interpretive discrimination and the
ability to reason across structured alternatives. This composition supports multi-faceted evaluation of both retrieval and
inference capabilities in historical question answering.
# Question Types
Multiple-choice questions: These questions adopt a several-option format, where some of the options are designated
as correct based on current scholarly consensus. The remaining distractors are carefully designed to be plausible
yet incorrect, often reflecting common misconceptions or subtle historical variations. This type is suited to evaluate
interpretive precision, historical knowledge, and the ability to differentiate between nuanced alternatives.

Exact match questions: These questions adopt a single precise answer, such as a date, name, location, or keyword.
The LLMs needs to provide this precise answer. This type is suited to evaluate factual investigation, temporal reasoning,
or targeted source analysis.

# Difficulty Explained
Level 1 (Basic): Authored by Research Assistants A total of 166 Level 1 questions are mainly formulated by research
assistants with academic backgrounds in history. They are focused on extracting verifiable historical facts from
historical materials or literature, interpreting well-documented primary sources to formulate questions. Tasks at this
level emphasize factual investigation and basic material interpretation.
Level 2 (Intermediate): Authored by Graduate Researchers and Domain Experts The 172 Level 2 questions are mainly
formulated by graduate students (MA and PhD level) and early-career researchers in history. Contributors are selected
based on their specialization in particular subfields and are invited to design questions grounded in their areas of
expertise. These tasks typically require source interpretation, basic causal or temporal research, and engagement with
narrower but academically meaningful materials.
Level 3 (Challenging): Authored by Professors and Senior Scholars The 76 Level 3 questions are mainly contributed
by senior scholars and university faculty with demonstrated experience in interpreting obscure sources, handling
multi-lingual materials, and conducting interdisciplinary research. These tasks are designed to push the limits of LLM
capabilities, drawing on rare texts, underdigitized archives, and cross-modal information integration.

# Language Diversity



# Table 2: Distribution of source modalities in HistBench
[
  {
    "material_type": "Visual materials (illustrations, photos)",
    "number_of_questions": 96
  },
  {
    "material_type": "Maps and schematics",
    "number_of_questions": 18
  },
  {
    "material_type": "Charts, diagrams, or tables",
    "number_of_questions": 10
  },
  {
    "material_type": "Manuscripts and handwritten sources",
    "number_of_questions": 88
  },
  {
    "material_type": "Audio recordings",
    "number_of_questions": 9
  },
  {
    "material_type": "Video content",
    "number_of_questions": 5
  },
  {
    "material_type": "Inscriptions or stone rubbings",
    "number_of_questions": 14
  },
  {
    "material_type": "Text-based questions (narrative excerpts)",
    "number_of_questions": 64
  },
  {
    "material_type": "Mixed text + image sources",
    "number_of_questions": 10
  },
  {
    "material_type": "Ancient or undeciphered scripts",
    "number_of_questions": 22
  }
]

# domains
"domains": [
    {
      "area": "Political, social, and cultural history",
      "includes": "diplomatic history, gender studies, intellectual history, and identity politics"
    },
    {
      "area": "Classics and ancient civilizations",
      "includes": "Greco-Roman studies, philology, epigraphy, and early textual traditions"
    },
    {
      "area": "Art and visual culture",
      "includes": "art history, iconography, visual semiotics, and historical image interpretation"
    },
    {
      "area": "Material culture and archaeology",
      "includes": "material artifact studies, heritage reconstruction, and excavation-based historiography"
    },
    {
      "area": "Environmental and climate history",
      "includes": "the historical study of climate shifts, ecological regimes, and resource management"
    },
    {
      "area": "History of science and medicine",
      "includes": "early scientific institutions, cross-cultural scientific exchange, botany, astronomy, and traditional medicine"
    },
    {
      "area": "Economic and institutional history",
      "includes": "labor systems, taxation, urban planning, bureaucratic organization, and legal codification"
    },
    {
      "area": "Interdisciplinary and comparative studies",
      "includes": "global history, translation history, mythology, and civilizational entanglements"
    }
  ]

# Table 9: Languages represented in HistBench questions
[
  {
    "language": "English",
    "count": 228
  },
  {
    "language": "Chinese",
    "count": 52
  },
  {
    "language": "Russian",
    "count": 22
  },
  {
    "language": "Japanese",
    "count": 13
  },
  {
    "language": "French",
    "count": 10
  },
  {
    "language": "Latin",
    "count": 8
  },
  {
    "language": "German",
    "count": 8
  },
  {
    "language": "Classical Chinese",
    "count": 47
  },
  {
    "language": "Dutch",
    "count": 5
  },
  {
    "language": "Tibetan",
    "count": 2
  },
  {
    "language": "Armenian",
    "count": 2
  },
  {
    "language": "Arabic",
    "count": 2
  },
  {
    "language": "Khitan",
    "count": 2
  },
  {
    "language": "Ancient Greek",
    "count": 2
  },
  {
    "language": "Khmer",
    "count": 1
  },
  {
    "language": "Indonesian",
    "count": 1
  },
  {
    "language": "Old Tibetan",
    "count": 1
  },
  {
    "language": "Sanskrit",
    "count": 1
  },
  {
    "language": "Old Uyghur",
    "count": 1
  },
  {
    "language": "Middle Polish",
    "count": 1
  },
  {
    "language": "Aramaic",
    "count": 1
  },
  {
    "language": "Danish",
    "count": 1
  },
  {
    "language": "Bosnian",
    "count": 1
  },
  {
    "language": "Italian",
    "count": 1
  },
  {
    "language": "Macedonian",
    "count": 1
  },
  {
    "language": "Yukaghir",
    "count": 1
  }
]