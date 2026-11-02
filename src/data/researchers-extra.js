/**
 * src/data/researchers-extra.js — 由 zbMATH Open API 自动抽取的数学家档案。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/fetch-zbmath.mjs && node kb-src/build-researchers.mjs
 *
 * 来源：https://api.zbmath.org/v1/author/_search（公开 API，实测可用；
 *       HTML 页面 zbmath.org/authors 返回 403，不走那条路）
 *
 * 每条都有 `zbmath.code` 与 `zbmath.url`，可逐条复核。
 * 注意：zbMATH 不提供合作者网络与逐篇文献，所以本文件不含这两项；
 *       summary/detail 由 MSC 分布与获奖记录**机械派生**，未编造内容。
 *       手写的 24 条叙述性档案在 researchers.js，两者互补。
 *
 * 生成时间：2026-11-02T00:40:06.761Z
 * 人数：45
 */

export const RESEARCHER_EXTRA_NODES = [
 {
  "id": "rz-zariski-oscar",
  "latex": "\\text{Zariski, Oscar}",
  "name": "Zariski, Oscar",
  "en": "Zariski, Oscar",
  "importance": 0.76,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（30 篇）；获奖：Wolf Prize 1981",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 30 篇（61.2%）\n\n外部标识：\n  · mgp: 18926\n  · wikidata: Q381307\n  · mactutor: Zariski",
  "representativeWorks": [],
  "zbmath": {
   "code": "zariski.oscar",
   "url": "https://zbmath.org/authors/zariski.oscar",
   "awards": [
    {
     "title": "Wolf Prize",
     "year": 1981
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 30
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "18926"
    },
    {
     "type": "wikidata",
     "id": "Q381307"
    },
    {
     "type": "mactutor",
     "id": "Zariski"
    },
    {
     "type": "mathnetru",
     "id": "24434"
    },
    {
     "type": "gnd",
     "id": "119042940"
    },
    {
     "type": "idref",
     "id": "031839541"
    }
   ]
  }
 },
 {
  "id": "rz-grothendieck-alexander",
  "latex": "\\text{Grothendieck, Alexander}",
  "name": "Grothendieck, Alexander",
  "en": "Grothendieck, Alexander",
  "importance": 0.94,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、一般性与综合、范畴论与同调代数",
  "summary": "主要方向：代数几何（82 篇）、一般性与综合（21 篇）；获奖：Fields Medal 1966、Crafoord Prize 1988",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 82 篇（51.9%）\n  · 00 一般性与综合 — 21 篇（13.3%）\n  · 18 范畴论与同调代数 — 16 篇（10.1%）\n\n外部标识：\n  · mgp: 31245\n  · wikidata: Q77141\n  · mactutor: Grothendieck",
  "representativeWorks": [],
  "zbmath": {
   "code": "grothendieck.alexander",
   "url": "https://zbmath.org/authors/grothendieck.alexander",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1966
    },
    {
     "title": "Crafoord Prize",
     "year": 1988
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 82
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 21
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 16
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "31245"
    },
    {
     "type": "wikidata",
     "id": "Q77141"
    },
    {
     "type": "mactutor",
     "id": "Grothendieck"
    },
    {
     "type": "mathnetru",
     "id": "24382"
    },
    {
     "type": "gnd",
     "id": "118952773"
    },
    {
     "type": "idref",
     "id": "032375549"
    },
    {
     "type": "google_scholar",
     "id": "KFPyTxQAAAAJ"
    }
   ]
  }
 },
 {
  "id": "rz-serre-jean-pierre",
  "latex": "\\text{Serre, Jean-Pierre}",
  "name": "Serre, Jean-Pierre",
  "en": "Serre, Jean-Pierre",
  "importance": 0.9,
  "field": "arith",
  "institution": "",
  "focus": "数论、代数几何、群论与推广",
  "summary": "主要方向：数论（107 篇）、代数几何（100 篇）；获奖：Fields Medal 1954、Wolf Prize 2000、Abel Prize 2003",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 107 篇（25.4%）\n  · 14 代数几何 — 100 篇（23.7%）\n  · 20 群论与推广 — 69 篇（16.4%）\n  · 01 历史与传记 — 36 篇（8.5%）\n  · 12 域论与多项式 — 23 篇（5.5%）\n\n外部标识：\n  · mgp: 34222\n  · wikidata: Q212063\n  · mactutor: Serre",
  "representativeWorks": [],
  "zbmath": {
   "code": "serre.jean-pierre",
   "url": "https://zbmath.org/authors/serre.jean-pierre",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1954
    },
    {
     "title": "Wolf Prize",
     "year": 2000
    },
    {
     "title": "Abel Prize",
     "year": 2003
    }
   ],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 107
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 100
    },
    {
     "field": "20",
     "name": "群论与推广",
     "count": 69
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 36
    },
    {
     "field": "12",
     "name": "域论与多项式",
     "count": 23
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "34222"
    },
    {
     "type": "wikidata",
     "id": "Q212063"
    },
    {
     "type": "mathnetru",
     "id": "24168"
    },
    {
     "type": "gnd",
     "id": "142283126"
    },
    {
     "type": "mactutor",
     "id": "Serre"
    },
    {
     "type": "idref",
     "id": "027133222"
    },
    {
     "type": "dblp",
     "id": "73/9527"
    },
    {
     "type": "carmin_tv",
     "id": "jean-pierre-serre"
    }
   ]
  }
 },
 {
  "id": "rz-weil-andre",
  "latex": "\\text{Weil, André}",
  "name": "Weil, André",
  "en": "Weil, André",
  "importance": 0.69,
  "field": "arith",
  "institution": "",
  "focus": "数论、历史与传记、代数几何",
  "summary": "主要方向：数论（58 篇）、历史与传记（43 篇）；获奖：Wolf Prize 1979、Kyoto Prize in Basic Sciences 1994",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 58 篇（29.4%）\n  · 01 历史与传记 — 43 篇（21.8%）\n  · 14 代数几何 — 37 篇（18.8%）\n  · 32 多复变与解析空间 — 10 篇（5.1%）\n  · 20 群论与推广 — 8 篇（4.1%）\n\n外部标识：\n  · wikidata: Q323232\n  · mgp: 6385\n  · mactutor: Weil",
  "representativeWorks": [],
  "zbmath": {
   "code": "weil.andre",
   "url": "https://zbmath.org/authors/weil.andre",
   "awards": [
    {
     "title": "Wolf Prize",
     "year": 1979
    },
    {
     "title": "Kyoto Prize in Basic Sciences",
     "year": 1994
    }
   ],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 58
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 43
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 37
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 10
    },
    {
     "field": "20",
     "name": "群论与推广",
     "count": 8
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q323232"
    },
    {
     "type": "mgp",
     "id": "6385"
    },
    {
     "type": "mathnetru",
     "id": "25641"
    },
    {
     "type": "mactutor",
     "id": "Weil"
    },
    {
     "type": "gnd",
     "id": "118980963"
    },
    {
     "type": "idref",
     "id": "031616348"
    }
   ]
  }
 },
 {
  "id": "rz-mumford-david-b",
  "latex": "\\text{Mumford, David Bryant}",
  "name": "Mumford, David Bryant",
  "en": "Mumford, David Bryant",
  "importance": 0.89,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、历史与传记、计算机科学",
  "summary": "主要方向：代数几何（74 篇）、历史与传记（25 篇）；获奖：Fields Medal 1974、Shaw Prize 2006、Wolf Prize 2008",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 74 篇（30.0%）\n  · 01 历史与传记 — 25 篇（10.1%）\n  · 68 计算机科学 — 17 篇（6.9%）\n  · 00 一般性与综合 — 17 篇（6.9%）\n  · 58 整体分析、流形上的分析 — 12 篇（4.9%）\n  · 35 偏微分方程 — 8 篇（3.2%）\n\n外部标识：\n  · mgp: 18755\n  · wikidata: Q334021\n  · mactutor: Mumford\n  · homepage: http://www.dam.brown.edu/people/mumford/",
  "representativeWorks": [],
  "zbmath": {
   "code": "mumford.david-b",
   "url": "https://zbmath.org/authors/mumford.david-b",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1974
    },
    {
     "title": "Shaw Prize",
     "year": 2006
    },
    {
     "title": "Wolf Prize",
     "year": 2008
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 74
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 25
    },
    {
     "field": "68",
     "name": "计算机科学",
     "count": 17
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 17
    },
    {
     "field": "58",
     "name": "整体分析、流形上的分析",
     "count": 12
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "18755"
    },
    {
     "type": "wikidata",
     "id": "Q334021"
    },
    {
     "type": "mactutor",
     "id": "Mumford"
    },
    {
     "type": "mathnetru",
     "id": "24454"
    },
    {
     "type": "gnd",
     "id": "115549021"
    },
    {
     "type": "homepage",
     "id": "http://www.dam.brown.edu/people/mumford/"
    },
    {
     "type": "idref",
     "id": "031670865"
    },
    {
     "type": "theses_fr",
     "id": "031670865"
    },
    {
     "type": "carmin_tv",
     "id": "david-mumford"
    }
   ]
  }
 },
 {
  "id": "rz-hironaka-heisuke",
  "latex": "\\text{Hironaka, Heisuke}",
  "name": "Hironaka, Heisuke",
  "en": "Hironaka, Heisuke",
  "importance": 0.79,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间",
  "summary": "主要方向：代数几何（32 篇）、多复变与解析空间（16 篇）；获奖：Fields Medal 1970",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 32 篇（50.8%）\n  · 32 多复变与解析空间 — 16 篇（25.4%）\n\n外部标识：\n  · wikidata: Q183373\n  · mactutor: Hironaka\n  · mgp: 18752",
  "representativeWorks": [],
  "zbmath": {
   "code": "hironaka.heisuke",
   "url": "https://zbmath.org/authors/hironaka.heisuke",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1970
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 32
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 16
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q183373"
    },
    {
     "type": "mactutor",
     "id": "Hironaka"
    },
    {
     "type": "mgp",
     "id": "18752"
    },
    {
     "type": "mathnetru",
     "id": "124085"
    },
    {
     "type": "gnd",
     "id": "1074027868"
    },
    {
     "type": "dblp",
     "id": "57/6929"
    },
    {
     "type": "idref",
     "id": "031682820"
    }
   ]
  }
 },
 {
  "id": "rz-hartshorne-robin",
  "latex": "\\text{Hartshorne, Robin}",
  "name": "Hartshorne, Robin",
  "en": "Hartshorne, Robin",
  "importance": 0.9,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、交换环与代数",
  "summary": "主要方向：代数几何（80 篇）、交换环与代数（15 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 80 篇（63.0%）\n  · 13 交换环与代数 — 15 篇（11.8%）\n\n外部标识：\n  · homepage: https://math.berkeley.edu/people/faculty/robin-c-hartshorne\n  · wikidata: Q1356332\n  · mgp: 29466",
  "representativeWorks": [],
  "zbmath": {
   "code": "hartshorne.robin",
   "url": "https://zbmath.org/authors/hartshorne.robin",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 80
    },
    {
     "field": "13",
     "name": "交换环与代数",
     "count": 15
    }
   ],
   "externalIds": [
    {
     "type": "homepage",
     "id": "https://math.berkeley.edu/people/faculty/robin-c-hartshorne"
    },
    {
     "type": "wikidata",
     "id": "Q1356332"
    },
    {
     "type": "gnd",
     "id": "133225089"
    },
    {
     "type": "dblp",
     "id": "126/6974"
    },
    {
     "type": "mgp",
     "id": "29466"
    },
    {
     "type": "idref",
     "id": "031682510"
    }
   ]
  }
 },
 {
  "id": "rz-deligne-pierre",
  "latex": "\\text{Deligne, Pierre}",
  "name": "Deligne, Pierre",
  "en": "Deligne, Pierre",
  "importance": 0.92,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论、群论与推广",
  "summary": "主要方向：代数几何（104 篇）、数论（33 篇）；获奖：Fields Medal 1978、Crafoord Prize 1988、Wolf Prize 2008、Abel Prize 2013",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 104 篇（38.7%）\n  · 11 数论 — 33 篇（12.3%）\n  · 20 群论与推广 — 20 篇（7.4%）\n  · 32 多复变与解析空间 — 13 篇（4.8%）\n  · 22 拓扑群与李群 — 13 篇（4.8%）\n  · 18 范畴论与同调代数 — 13 篇（4.8%）\n\n外部标识：\n  · mgp: 61289\n  · mactutor: Deligne\n  · wikidata: Q334045\n  · homepage: https://www.ias.edu/scholars/deligne",
  "representativeWorks": [],
  "zbmath": {
   "code": "deligne.pierre",
   "url": "https://zbmath.org/authors/deligne.pierre",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1978
    },
    {
     "title": "Crafoord Prize",
     "year": 1988
    },
    {
     "title": "Wolf Prize",
     "year": 2008
    },
    {
     "title": "Abel Prize",
     "year": 2013
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 104
    },
    {
     "field": "11",
     "name": "数论",
     "count": 33
    },
    {
     "field": "20",
     "name": "群论与推广",
     "count": 20
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 13
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 13
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "61289"
    },
    {
     "type": "mactutor",
     "id": "Deligne"
    },
    {
     "type": "wikidata",
     "id": "Q334045"
    },
    {
     "type": "mathnetru",
     "id": "22625"
    },
    {
     "type": "gnd",
     "id": "10785533X"
    },
    {
     "type": "homepage",
     "id": "https://www.ias.edu/scholars/deligne"
    },
    {
     "type": "idref",
     "id": "031681182"
    },
    {
     "type": "carmin_tv",
     "id": "pierre-deligne"
    }
   ]
  }
 },
 {
  "id": "rz-faltings-gerd",
  "latex": "\\text{Faltings, Gerd}",
  "name": "Faltings, Gerd",
  "en": "Faltings, Gerd",
  "importance": 0.94,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论",
  "summary": "主要方向：代数几何（83 篇）、数论（36 篇）；获奖：Fields Medal 1986、Shaw Prize 2015、Abel Prize 2026",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 83 篇（51.9%）\n  · 11 数论 — 36 篇（22.5%）\n\n外部标识：\n  · mgp: 18851\n  · mactutor: Faltings\n  · wikidata: Q77137\n  · homepage: https://www.mpim-bonn.mpg.de/de/node/102",
  "representativeWorks": [],
  "zbmath": {
   "code": "faltings.gerd",
   "url": "https://zbmath.org/authors/faltings.gerd",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1986
    },
    {
     "title": "Shaw Prize",
     "year": 2015
    },
    {
     "title": "Abel Prize",
     "year": 2026
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 83
    },
    {
     "field": "11",
     "name": "数论",
     "count": 36
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "18851"
    },
    {
     "type": "mactutor",
     "id": "Faltings"
    },
    {
     "type": "gnd",
     "id": "118686003"
    },
    {
     "type": "carmin_tv",
     "id": "gerd-faltings"
    },
    {
     "type": "mathnetru",
     "id": "37247"
    },
    {
     "type": "wikidata",
     "id": "Q77137"
    },
    {
     "type": "idref",
     "id": "032282990"
    },
    {
     "type": "homepage",
     "id": "https://www.mpim-bonn.mpg.de/de/node/102"
    }
   ]
  }
 },
 {
  "id": "rz-kodaira-kunihiko",
  "latex": "\\text{Kodaira, Kunihiko}",
  "name": "Kodaira, Kunihiko",
  "en": "Kodaira, Kunihiko",
  "importance": 0.66,
  "field": "ag",
  "institution": "",
  "focus": "多复变与解析空间、代数几何、历史与传记",
  "summary": "主要方向：多复变与解析空间（11 篇）、代数几何（9 篇）；获奖：Fields Medal 1954、Wolf Prize 1984",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 32 多复变与解析空间 — 11 篇（20.0%）\n  · 14 代数几何 — 9 篇（16.4%）\n  · 01 历史与传记 — 6 篇（10.9%）\n  · 30 单复变 — 4 篇（7.3%）\n  · 00 一般性与综合 — 4 篇（7.3%）\n  · 58 整体分析、流形上的分析 — 3 篇（5.5%）\n\n外部标识：\n  · mgp: 20660\n  · wikidata: Q333918\n  · mactutor: Kodaira",
  "representativeWorks": [],
  "zbmath": {
   "code": "kodaira.kunihiko",
   "url": "https://zbmath.org/authors/kodaira.kunihiko",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1954
    },
    {
     "title": "Wolf Prize",
     "year": 1984
    }
   ],
   "mscTop": [
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 11
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 9
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 6
    },
    {
     "field": "30",
     "name": "单复变",
     "count": 4
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 4
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "20660"
    },
    {
     "type": "wikidata",
     "id": "Q333918"
    },
    {
     "type": "mactutor",
     "id": "Kodaira"
    },
    {
     "type": "mathnetru",
     "id": "123810"
    },
    {
     "type": "gnd",
     "id": "118777645"
    },
    {
     "type": "idref",
     "id": "03056820X"
    }
   ]
  }
 },
 {
  "id": "rz-atiyah-michael-francis",
  "latex": "\\text{Atiyah, Michael Francis}",
  "name": "Atiyah, Michael Francis",
  "en": "Atiyah, Michael Francis",
  "importance": 0.7,
  "field": "topo",
  "institution": "",
  "focus": "整体分析、流形上的分析、历史与传记、微分几何",
  "summary": "主要方向：整体分析、流形上的分析（69 篇）、历史与传记（63 篇）；获奖：Fields Medal 1966、Abel Prize 2004",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 58 整体分析、流形上的分析 — 69 篇（13.4%）\n  · 01 历史与传记 — 63 篇（12.2%）\n  · 53 微分几何 — 63 篇（12.2%）\n  · 81 量子理论 — 59 篇（11.5%）\n  · 57 流形与胞腔复形 — 42 篇（8.2%）\n  · 00 一般性与综合 — 30 篇（5.8%）\n\n外部标识：\n  · mgp: 30949\n  · wikidata: Q208356\n  · mactutor: Atiyah\n  · homepage: http://www.maths.ed.ac.uk/school-of-mathematics/people?person=75",
  "representativeWorks": [],
  "zbmath": {
   "code": "atiyah.michael-francis",
   "url": "https://zbmath.org/authors/atiyah.michael-francis",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1966
    },
    {
     "title": "Abel Prize",
     "year": 2004
    }
   ],
   "mscTop": [
    {
     "field": "58",
     "name": "整体分析、流形上的分析",
     "count": 69
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 63
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 63
    },
    {
     "field": "81",
     "name": "量子理论",
     "count": 59
    },
    {
     "field": "57",
     "name": "流形与胞腔复形",
     "count": 42
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "30949"
    },
    {
     "type": "wikidata",
     "id": "Q208356"
    },
    {
     "type": "celebratio",
     "id": "Atiyah_MF"
    },
    {
     "type": "mactutor",
     "id": "Atiyah"
    },
    {
     "type": "dblp",
     "id": "92/9504"
    },
    {
     "type": "mathnetru",
     "id": "22225"
    },
    {
     "type": "gnd",
     "id": "118848453"
    },
    {
     "type": "homepage",
     "id": "http://www.maths.ed.ac.uk/school-of-mathematics/people?person=75"
    },
    {
     "type": "carmin_tv",
     "id": "michael-atiyah"
    },
    {
     "type": "idref",
     "id": "067638252"
    }
   ]
  }
 },
 {
  "id": "rz-griffiths-phillip-a",
  "latex": "\\text{Griffiths, Phillip Augustus}",
  "name": "Griffiths, Phillip Augustus",
  "en": "Griffiths, Phillip Augustus",
  "importance": 0.85,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间、微分几何",
  "summary": "主要方向：代数几何（108 篇）、多复变与解析空间（61 篇）；获奖：Wolf Prize 2008、Chern Medal 2014",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 108 篇（35.4%）\n  · 32 多复变与解析空间 — 61 篇（20.0%）\n  · 53 微分几何 — 29 篇（9.5%）\n  · 58 整体分析、流形上的分析 — 24 篇（7.9%）\n  · 01 历史与传记 — 17 篇（5.6%）\n\n外部标识：\n  · mgp: 26954\n  · wikidata: Q1385013\n  · mactutor: Griffiths",
  "representativeWorks": [],
  "zbmath": {
   "code": "griffiths.phillip-a",
   "url": "https://zbmath.org/authors/griffiths.phillip-a",
   "awards": [
    {
     "title": "Wolf Prize",
     "year": 2008
    },
    {
     "title": "Chern Medal",
     "year": 2014
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 108
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 61
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 29
    },
    {
     "field": "58",
     "name": "整体分析、流形上的分析",
     "count": 24
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 17
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "26954"
    },
    {
     "type": "wikidata",
     "id": "Q1385013"
    },
    {
     "type": "mactutor",
     "id": "Griffiths"
    },
    {
     "type": "dblp",
     "id": "158/2200"
    },
    {
     "type": "mathnetru",
     "id": "22624"
    },
    {
     "type": "gnd",
     "id": "131881434"
    },
    {
     "type": "idref",
     "id": "031633595"
    }
   ]
  }
 },
 {
  "id": "rz-mori-shigefumi",
  "latex": "\\text{Mori, Shigefumi}",
  "name": "Mori, Shigefumi",
  "en": "Mori, Shigefumi",
  "importance": 0.93,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（63 篇）；获奖：Fields Medal 1990",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 63 篇（74.1%）\n\n外部标识：\n  · wikidata: Q206215\n  · mgp: 100894\n  · mactutor: Mori",
  "representativeWorks": [],
  "zbmath": {
   "code": "mori.shigefumi",
   "url": "https://zbmath.org/authors/mori.shigefumi",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1990
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 63
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q206215"
    },
    {
     "type": "mgp",
     "id": "100894"
    },
    {
     "type": "mactutor",
     "id": "Mori"
    },
    {
     "type": "mathnetru",
     "id": "43343"
    },
    {
     "type": "gnd",
     "id": "142401137"
    },
    {
     "type": "idref",
     "id": "050498851"
    }
   ]
  }
 },
 {
  "id": "rz-kawamata-yujiro",
  "latex": "\\text{Kawamata, Yujiro}",
  "name": "Kawamata, Yujiro",
  "en": "Kawamata, Yujiro",
  "importance": 0.9,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间",
  "summary": "主要方向：代数几何（111 篇）、多复变与解析空间（26 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 111 篇（62.4%）\n  · 32 多复变与解析空间 — 26 篇（14.6%）\n\n外部标识：\n  · mgp: 189058\n  · wikidata: Q11477914",
  "representativeWorks": [],
  "zbmath": {
   "code": "kawamata.yujiro",
   "url": "https://zbmath.org/authors/kawamata.yujiro",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 111
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 26
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "189058"
    },
    {
     "type": "wikidata",
     "id": "Q11477914"
    },
    {
     "type": "idref",
     "id": "095218939"
    },
    {
     "type": "gnd",
     "id": "173132758"
    },
    {
     "type": "mathnetru",
     "id": "112878"
    }
   ]
  }
 },
 {
  "id": "rz-kollar-janos",
  "latex": "\\text{Kollár, János}",
  "name": "Kollár, János",
  "en": "Kollár, János",
  "importance": 0.89,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间、微分几何",
  "summary": "主要方向：代数几何（212 篇）、多复变与解析空间（34 篇）；获奖：Shaw Prize 2017",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 212 篇（57.5%）\n  · 32 多复变与解析空间 — 34 篇（9.2%）\n  · 53 微分几何 — 13 篇（3.5%）\n  · 00 一般性与综合 — 12 篇（3.3%）\n  · 11 数论 — 12 篇（3.3%）\n  · 57 流形与胞腔复形 — 10 篇（2.7%）\n\n外部标识：\n  · mgp: 20125\n  · wikidata: Q1115371\n  · homepage: https://web.math.princeton.edu/~kollar/",
  "representativeWorks": [],
  "zbmath": {
   "code": "kollar.janos",
   "url": "https://zbmath.org/authors/kollar.janos",
   "awards": [
    {
     "title": "Shaw Prize",
     "year": 2017
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 212
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 34
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 13
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 12
    },
    {
     "field": "11",
     "name": "数论",
     "count": 12
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "20125"
    },
    {
     "type": "wikidata",
     "id": "Q1115371"
    },
    {
     "type": "idref",
     "id": "050498843"
    },
    {
     "type": "homepage",
     "id": "https://web.math.princeton.edu/~kollar/"
    },
    {
     "type": "google_scholar",
     "id": "xKUVD4MAAAAJ"
    },
    {
     "type": "dblp",
     "id": "36/728"
    },
    {
     "type": "mathnetru",
     "id": "47731"
    },
    {
     "type": "gnd",
     "id": "113796277"
    }
   ]
  }
 },
 {
  "id": "rz-scholze-peter",
  "latex": "\\text{Scholze, Peter}",
  "name": "Scholze, Peter",
  "en": "Scholze, Peter",
  "importance": 0.84,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论、一般性与综合",
  "summary": "主要方向：代数几何（53 篇）、数论（29 篇）；获奖：Clay Research Award 2014、New Horizons in Mathematics Prize 2016、EMS Prize 2016、Fields Medal 2018",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 53 篇（40.5%）\n  · 11 数论 — 29 篇（22.1%）\n  · 00 一般性与综合 — 7 篇（5.3%）\n  · 22 拓扑群与李群 — 6 篇（4.6%）\n  · 13 交换环与代数 — 6 篇（4.6%）\n\n外部标识：\n  · wikidata: Q98034\n  · mgp: 160930\n  · homepage: https://people.mpim-bonn.mpg.de/scholze/",
  "representativeWorks": [],
  "zbmath": {
   "code": "scholze.peter",
   "url": "https://zbmath.org/authors/scholze.peter",
   "awards": [
    {
     "title": "Clay Research Award",
     "year": 2014
    },
    {
     "title": "New Horizons in Mathematics Prize",
     "year": 2016
    },
    {
     "title": "EMS Prize",
     "year": 2016
    },
    {
     "title": "Fields Medal",
     "year": 2018
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 53
    },
    {
     "field": "11",
     "name": "数论",
     "count": 29
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 7
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 6
    },
    {
     "field": "13",
     "name": "交换环与代数",
     "count": 6
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q98034"
    },
    {
     "type": "mgp",
     "id": "160930"
    },
    {
     "type": "mathnetru",
     "id": "37690"
    },
    {
     "type": "carmin_tv",
     "id": "peter-scholze"
    },
    {
     "type": "gnd",
     "id": "1143603133"
    },
    {
     "type": "mathoverflow",
     "id": "6074"
    },
    {
     "type": "idref",
     "id": "147448824"
    },
    {
     "type": "theses_fr",
     "id": "147448824"
    },
    {
     "type": "homepage",
     "id": "https://people.mpim-bonn.mpg.de/scholze/"
    }
   ]
  }
 },
 {
  "id": "rz-lurie-jacob",
  "latex": "\\text{Lurie, Jacob}",
  "name": "Lurie, Jacob",
  "en": "Lurie, Jacob",
  "importance": 0.61,
  "field": "topo",
  "institution": "",
  "focus": "代数拓扑、代数几何、范畴论与同调代数",
  "summary": "主要方向：代数拓扑（12 篇）、代数几何（9 篇）；获奖：Breakthrough Prize in Mathematics 2014",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 55 代数拓扑 — 12 篇（25.5%）\n  · 14 代数几何 — 9 篇（19.1%）\n  · 18 范畴论与同调代数 — 8 篇（17.0%）\n  · 03 数理逻辑与基础 — 3 篇（6.4%）\n  · 11 数论 — 3 篇（6.4%）\n\n外部标识：\n  · mgp: 84215\n  · wikidata: Q6333335\n  · homepage: https://www.math.ias.edu/~lurie/",
  "representativeWorks": [],
  "zbmath": {
   "code": "lurie.jacob",
   "url": "https://zbmath.org/authors/lurie.jacob",
   "awards": [
    {
     "title": "Breakthrough Prize in Mathematics",
     "year": 2014
    }
   ],
   "mscTop": [
    {
     "field": "55",
     "name": "代数拓扑",
     "count": 12
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 9
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 8
    },
    {
     "field": "03",
     "name": "数理逻辑与基础",
     "count": 3
    },
    {
     "field": "11",
     "name": "数论",
     "count": 3
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "84215"
    },
    {
     "type": "gnd",
     "id": "139905529"
    },
    {
     "type": "wikidata",
     "id": "Q6333335"
    },
    {
     "type": "dblp",
     "id": "31/5041"
    },
    {
     "type": "theses_fr",
     "id": "13639597X"
    },
    {
     "type": "homepage",
     "id": "https://www.math.ias.edu/~lurie/"
    },
    {
     "type": "idref",
     "id": "13639597X"
    }
   ]
  }
 },
 {
  "id": "rz-bhatt-bhargav",
  "latex": "\\text{Bhatt, Bhargav}",
  "name": "Bhatt, Bhargav",
  "en": "Bhatt, Bhargav",
  "importance": 0.78,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、交换环与代数",
  "summary": "主要方向：代数几何（48 篇）、交换环与代数（28 篇）；获奖：New Horizons in Mathematics Prize 2021、Clay Research Award 2021",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 48 篇（49.0%）\n  · 13 交换环与代数 — 28 篇（28.6%）\n\n外部标识：\n  · mgp: 151781\n  · homepage: http://www-personal.umich.edu/~bhattb/\n  · wikidata: Q99238382",
  "representativeWorks": [],
  "zbmath": {
   "code": "bhatt.bhargav",
   "url": "https://zbmath.org/authors/bhatt.bhargav",
   "awards": [
    {
     "title": "New Horizons in Mathematics Prize",
     "year": 2021
    },
    {
     "title": "Clay Research Award",
     "year": 2021
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 48
    },
    {
     "field": "13",
     "name": "交换环与代数",
     "count": 28
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "151781"
    },
    {
     "type": "homepage",
     "id": "http://www-personal.umich.edu/~bhattb/"
    },
    {
     "type": "dblp",
     "id": "200/6079"
    },
    {
     "type": "gnd",
     "id": "1193438020"
    },
    {
     "type": "wikidata",
     "id": "Q99238382"
    },
    {
     "type": "carmin_tv",
     "id": "bhargav-bhatt"
    },
    {
     "type": "idref",
     "id": "242918409"
    }
   ]
  }
 },
 {
  "id": "rz-gaitsgory-dennis",
  "latex": "\\text{Gaitsgory, Dennis}",
  "name": "Gaitsgory, Dennis",
  "en": "Gaitsgory, Dennis",
  "importance": 0.79,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、拓扑群与李群、非结合环与代数",
  "summary": "主要方向：代数几何（61 篇）、拓扑群与李群（25 篇）；获奖：EMS Prize 2000、Breakthrough Prize in Mathematics 2025",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 61 篇（35.1%）\n  · 22 拓扑群与李群 — 25 篇（14.4%）\n  · 17 非结合环与代数 — 22 篇（12.6%）\n  · 11 数论 — 16 篇（9.2%）\n  · 18 范畴论与同调代数 — 13 篇（7.5%）\n\n外部标识：\n  · mgp: 53163\n  · wikidata: Q950863\n  · homepage: http://www.math.harvard.edu/~gaitsgde/",
  "representativeWorks": [],
  "zbmath": {
   "code": "gaitsgory.dennis",
   "url": "https://zbmath.org/authors/gaitsgory.dennis",
   "awards": [
    {
     "title": "EMS Prize",
     "year": 2000
    },
    {
     "title": "Breakthrough Prize in Mathematics",
     "year": 2025
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 61
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 25
    },
    {
     "field": "17",
     "name": "非结合环与代数",
     "count": 22
    },
    {
     "field": "11",
     "name": "数论",
     "count": 16
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 13
    }
   ],
   "externalIds": [
    {
     "type": "idref",
     "id": "203615263"
    },
    {
     "type": "mgp",
     "id": "53163"
    },
    {
     "type": "wikidata",
     "id": "Q950863"
    },
    {
     "type": "mathnetru",
     "id": "60377"
    },
    {
     "type": "homepage",
     "id": "http://www.math.harvard.edu/~gaitsgde/"
    },
    {
     "type": "theses_fr",
     "id": "203615263"
    },
    {
     "type": "gnd",
     "id": "1182044891"
    },
    {
     "type": "carmin_tv",
     "id": "dennis-gaitsgory"
    }
   ]
  }
 },
 {
  "id": "rz-fargues-laurent",
  "latex": "\\text{Fargues, Laurent}",
  "name": "Fargues, Laurent",
  "en": "Fargues, Laurent",
  "importance": 0.72,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论",
  "summary": "主要方向：代数几何（30 篇）、数论（20 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 30 篇（46.2%）\n  · 11 数论 — 20 篇（30.8%）\n\n外部标识：\n  · mgp: 92895\n  · wikidata: Q55471696",
  "representativeWorks": [],
  "zbmath": {
   "code": "fargues.laurent",
   "url": "https://zbmath.org/authors/fargues.laurent",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 30
    },
    {
     "field": "11",
     "name": "数论",
     "count": 20
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "92895"
    },
    {
     "type": "wikidata",
     "id": "Q55471696"
    },
    {
     "type": "gnd",
     "id": "1176714082"
    },
    {
     "type": "idref",
     "id": "069020876"
    },
    {
     "type": "theses_fr",
     "id": "069020876"
    },
    {
     "type": "carmin_tv",
     "id": "laurent-fargues"
    }
   ]
  }
 },
 {
  "id": "rz-kedlaya-kiran-sridhara",
  "latex": "\\text{Kedlaya, Kiran Sridhara}",
  "name": "Kedlaya, Kiran Sridhara",
  "en": "Kedlaya, Kiran Sridhara",
  "importance": 0.85,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论、域论与多项式",
  "summary": "主要方向：代数几何（87 篇）、数论（83 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 87 篇（32.6%）\n  · 11 数论 — 83 篇（31.1%）\n  · 12 域论与多项式 — 29 篇（10.9%）\n\n外部标识：\n  · mgp: 47174\n  · wikidata: Q1742415\n  · homepage: https://kskedlaya.org/",
  "representativeWorks": [],
  "zbmath": {
   "code": "kedlaya.kiran-sridhara",
   "url": "https://zbmath.org/authors/kedlaya.kiran-sridhara",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 87
    },
    {
     "field": "11",
     "name": "数论",
     "count": 83
    },
    {
     "field": "12",
     "name": "域论与多项式",
     "count": 29
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "47174"
    },
    {
     "type": "idref",
     "id": "075873451"
    },
    {
     "type": "gnd",
     "id": "141747633"
    },
    {
     "type": "orcid",
     "id": "0000-0001-8700-8758"
    },
    {
     "type": "dblp",
     "id": "96/6462"
    },
    {
     "type": "wikidata",
     "id": "Q1742415"
    },
    {
     "type": "homepage",
     "id": "https://kskedlaya.org/"
    },
    {
     "type": "carmin_tv",
     "id": "kiran-kedlaya"
    }
   ]
  }
 },
 {
  "id": "rz-cesnavicius-kestutis",
  "latex": "\\text{Česnavičius, Kęstutis}",
  "name": "Česnavičius, Kęstutis",
  "en": "Česnavičius, Kęstutis",
  "importance": 0.68,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论",
  "summary": "主要方向：代数几何（20 篇）、数论（15 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 20 篇（41.7%）\n  · 11 数论 — 15 篇（31.3%）\n\n外部标识：\n  · mgp: 184247\n  · wikidata: Q102422570",
  "representativeWorks": [],
  "zbmath": {
   "code": "cesnavicius.kestutis",
   "url": "https://zbmath.org/authors/cesnavicius.kestutis",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 20
    },
    {
     "field": "11",
     "name": "数论",
     "count": 15
    }
   ],
   "externalIds": [
    {
     "type": "carmin_tv",
     "id": "kestutis-cesnavicius"
    },
    {
     "type": "mgp",
     "id": "184247"
    },
    {
     "type": "wikidata",
     "id": "Q102422570"
    },
    {
     "type": "idref",
     "id": "249733730"
    },
    {
     "type": "theses_fr",
     "id": "249733730"
    }
   ]
  }
 },
 {
  "id": "rz-raskin-sam",
  "latex": "\\text{Raskin, Sam}",
  "name": "Raskin, Sam",
  "en": "Raskin, Sam",
  "importance": 0.65,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、拓扑群与李群",
  "summary": "主要方向：代数几何（11 篇）、拓扑群与李群（8 篇）；获奖：New Horizons in Mathematics Prize 2025",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 11 篇（34.4%）\n  · 22 拓扑群与李群 — 8 篇（25.0%）\n\n外部标识：\n  · mgp: 183268\n  · homepage: https://gauss.math.yale.edu/~sr2532/\n  · wikidata: Q102421187",
  "representativeWorks": [],
  "zbmath": {
   "code": "raskin.sam",
   "url": "https://zbmath.org/authors/raskin.sam",
   "awards": [
    {
     "title": "New Horizons in Mathematics Prize",
     "year": 2025
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 11
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 8
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "183268"
    },
    {
     "type": "homepage",
     "id": "https://gauss.math.yale.edu/~sr2532/"
    },
    {
     "type": "carmin_tv",
     "id": "sam-raskin"
    },
    {
     "type": "wikidata",
     "id": "Q102421187"
    },
    {
     "type": "idref",
     "id": "249307278"
    }
   ]
  }
 },
 {
  "id": "rz-hacon-christopher-derek",
  "latex": "\\text{Hacon, Christopher Derek}",
  "name": "Hacon, Christopher Derek",
  "en": "Hacon, Christopher Derek",
  "importance": 0.92,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（98 篇）；获奖：Clay Research Award 2007、Breakthrough Prize in Mathematics 2018",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 98 篇（72.1%）\n\n外部标识：\n  · wikidata: Q1086709\n  · mgp: 36635\n  · homepage: https://www.math.utah.edu/~hacon/",
  "representativeWorks": [],
  "zbmath": {
   "code": "hacon.christopher-derek",
   "url": "https://zbmath.org/authors/hacon.christopher-derek",
   "awards": [
    {
     "title": "Clay Research Award",
     "year": 2007
    },
    {
     "title": "Breakthrough Prize in Mathematics",
     "year": 2018
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 98
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q1086709"
    },
    {
     "type": "mgp",
     "id": "36635"
    },
    {
     "type": "gnd",
     "id": "141481870"
    },
    {
     "type": "homepage",
     "id": "https://www.math.utah.edu/~hacon/"
    },
    {
     "type": "idref",
     "id": "145219364"
    },
    {
     "type": "google_scholar",
     "id": "HUZNgQMAAAAJ"
    }
   ]
  }
 },
 {
  "id": "rz-mckernan-james",
  "latex": "\\text{McKernan, James}",
  "name": "McKernan, James",
  "en": "McKernan, James",
  "importance": 0.78,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（34 篇）；获奖：Clay Research Award 2007、Breakthrough Prize in Mathematics 2018",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 34 篇（72.3%）\n\n外部标识：\n  · wikidata: Q1680799\n  · mgp: 42404\n  · homepage: http://www.math.ucsd.edu/~jmckerna/",
  "representativeWorks": [],
  "zbmath": {
   "code": "mckernan.james",
   "url": "https://zbmath.org/authors/mckernan.james",
   "awards": [
    {
     "title": "Clay Research Award",
     "year": 2007
    },
    {
     "title": "Breakthrough Prize in Mathematics",
     "year": 2018
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 34
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q1680799"
    },
    {
     "type": "mathnetru",
     "id": "49644"
    },
    {
     "type": "idref",
     "id": "16237674X"
    },
    {
     "type": "mgp",
     "id": "42404"
    },
    {
     "type": "homepage",
     "id": "http://www.math.ucsd.edu/~jmckerna/"
    },
    {
     "type": "gnd",
     "id": "172944236"
    }
   ]
  }
 },
 {
  "id": "rz-birkar-caucher",
  "latex": "\\text{Birkar, Caucher}",
  "name": "Birkar, Caucher",
  "en": "Birkar, Caucher",
  "importance": 0.89,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（50 篇）；获奖：Fields Medal 2018",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 50 篇（79.4%）\n\n外部标识：\n  · wikidata: Q4121788\n  · mgp: 98185\n  · homepage: https://www.dpmms.cam.ac.uk/~cb496/",
  "representativeWorks": [],
  "zbmath": {
   "code": "birkar.caucher",
   "url": "https://zbmath.org/authors/birkar.caucher",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 2018
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 50
    }
   ],
   "externalIds": [
    {
     "type": "idref",
     "id": "182405583"
    },
    {
     "type": "wikidata",
     "id": "Q4121788"
    },
    {
     "type": "mgp",
     "id": "98185"
    },
    {
     "type": "homepage",
     "id": "https://www.dpmms.cam.ac.uk/~cb496/"
    },
    {
     "type": "gnd",
     "id": "1103570633"
    },
    {
     "type": "theses_fr",
     "id": "182405583"
    }
   ]
  }
 },
 {
  "id": "rz-xu-chenyang-2",
  "latex": "\\text{Xu, Chenyang}",
  "name": "Xu, Chenyang",
  "en": "Xu, Chenyang",
  "importance": 0.55,
  "field": "logic",
  "institution": "",
  "focus": "计算机科学、信息与通讯、偏微分方程",
  "summary": "主要方向：计算机科学（3 篇）、信息与通讯（3 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 68 计算机科学 — 3 篇（30.0%）\n  · 94 信息与通讯 — 3 篇（30.0%）\n  · 35 偏微分方程 — 2 篇（20.0%）",
  "representativeWorks": [],
  "zbmath": {
   "code": "xu.chenyang.2",
   "url": "https://zbmath.org/authors/xu.chenyang.2",
   "awards": [],
   "mscTop": [
    {
     "field": "68",
     "name": "计算机科学",
     "count": 3
    },
    {
     "field": "94",
     "name": "信息与通讯",
     "count": 3
    },
    {
     "field": "35",
     "name": "偏微分方程",
     "count": 2
    }
   ],
   "externalIds": [
    {
     "type": "google_scholar",
     "id": "Xcw6ZXIAAAAJ"
    }
   ]
  }
 },
 {
  "id": "rz-abramovich-dan",
  "latex": "\\text{Abramovich, Dan}",
  "name": "Abramovich, Dan",
  "en": "Abramovich, Dan",
  "importance": 0.92,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（92 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 92 篇（74.2%）\n\n外部标识：\n  · homepage: https://www.math.brown.edu/dabramov/\n  · mgp: 6808\n  · wikidata: Q15433396",
  "representativeWorks": [],
  "zbmath": {
   "code": "abramovich.dan",
   "url": "https://zbmath.org/authors/abramovich.dan",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 92
    }
   ],
   "externalIds": [
    {
     "type": "carmin_tv",
     "id": "dan-abramovich"
    },
    {
     "type": "homepage",
     "id": "https://www.math.brown.edu/dabramov/"
    },
    {
     "type": "mgp",
     "id": "6808"
    },
    {
     "type": "arxiv",
     "id": "abramovich_d_1"
    },
    {
     "type": "wikidata",
     "id": "Q15433396"
    },
    {
     "type": "gnd",
     "id": "136162762"
    },
    {
     "type": "orcid",
     "id": "0000-0003-0719-0989"
    },
    {
     "type": "idref",
     "id": "035433922"
    }
   ]
  }
 },
 {
  "id": "rz-olsson-martin-c",
  "latex": "\\text{Olsson, Martin C.}",
  "name": "Olsson, Martin C.",
  "en": "Olsson, Martin C.",
  "importance": 0.83,
  "field": "ag",
  "institution": "",
  "focus": "代数几何",
  "summary": "主要方向：代数几何（50 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 50 篇（72.5%）\n\n外部标识：\n  · homepage: https://math.berkeley.edu/~molsson/",
  "representativeWorks": [],
  "zbmath": {
   "code": "olsson.martin-c",
   "url": "https://zbmath.org/authors/olsson.martin-c",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 50
    }
   ],
   "externalIds": [
    {
     "type": "homepage",
     "id": "https://math.berkeley.edu/~molsson/"
    },
    {
     "type": "carmin_tv",
     "id": "martin-olsson"
    }
   ]
  }
 },
 {
  "id": "rz-conrad-brian",
  "latex": "\\text{Conrad, Brian}",
  "name": "Conrad, Brian",
  "en": "Conrad, Brian",
  "importance": 0.73,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论",
  "summary": "主要方向：代数几何（35 篇）、数论（22 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 35 篇（46.1%）\n  · 11 数论 — 22 篇（28.9%）\n\n外部标识：\n  · mgp: 18916\n  · wikidata: Q912029",
  "representativeWorks": [],
  "zbmath": {
   "code": "conrad.brian",
   "url": "https://zbmath.org/authors/conrad.brian",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 35
    },
    {
     "field": "11",
     "name": "数论",
     "count": 22
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "18916"
    },
    {
     "type": "wikidata",
     "id": "Q912029"
    },
    {
     "type": "gnd",
     "id": "122429206"
    },
    {
     "type": "idref",
     "id": "071561196"
    },
    {
     "type": "theses_fr",
     "id": "071561196"
    }
   ]
  }
 },
 {
  "id": "rz-vakil-ravi",
  "latex": "\\text{Vakil, Ravi}",
  "name": "Vakil, Ravi",
  "en": "Vakil, Ravi",
  "importance": 0.83,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、一般性与综合、组合数学",
  "summary": "主要方向：代数几何（63 篇）、一般性与综合（15 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 63 篇（54.8%）\n  · 00 一般性与综合 — 15 篇（13.0%）\n  · 05 组合数学 — 8 篇（7.0%）\n  · 97 数学教育 — 3 篇（2.6%）\n  · 53 微分几何 — 3 篇（2.6%）\n\n外部标识：\n  · wikidata: Q2133711\n  · mgp: 18790\n  · homepage: http://math.stanford.edu/~vakil/",
  "representativeWorks": [],
  "zbmath": {
   "code": "vakil.ravi",
   "url": "https://zbmath.org/authors/vakil.ravi",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 63
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 15
    },
    {
     "field": "05",
     "name": "组合数学",
     "count": 8
    },
    {
     "field": "97",
     "name": "数学教育",
     "count": 3
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 3
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q2133711"
    },
    {
     "type": "dblp",
     "id": "68/2309"
    },
    {
     "type": "mgp",
     "id": "18790"
    },
    {
     "type": "homepage",
     "id": "http://math.stanford.edu/~vakil/"
    },
    {
     "type": "orcid",
     "id": "0000-0001-8506-270X"
    },
    {
     "type": "gnd",
     "id": "1279138920"
    },
    {
     "type": "idref",
     "id": "075873338"
    }
   ]
  }
 },
 {
  "id": "rz-poonen-bjorn",
  "latex": "\\text{Poonen, Bjorn}",
  "name": "Poonen, Bjorn",
  "en": "Poonen, Bjorn",
  "importance": 0.85,
  "field": "arith",
  "institution": "",
  "focus": "数论、代数几何、数理逻辑与基础",
  "summary": "主要方向：数论（111 篇）、代数几何（86 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 111 篇（39.1%）\n  · 14 代数几何 — 86 篇（30.3%）\n  · 03 数理逻辑与基础 — 12 篇（4.2%）\n  · 00 一般性与综合 — 10 篇（3.5%）\n\n外部标识：\n  · wikidata: Q879454\n  · homepage: https://math.mit.edu/~poonen/\n  · mgp: 32425",
  "representativeWorks": [],
  "zbmath": {
   "code": "poonen.bjorn",
   "url": "https://zbmath.org/authors/poonen.bjorn",
   "awards": [],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 111
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 86
    },
    {
     "field": "03",
     "name": "数理逻辑与基础",
     "count": 12
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 10
    }
   ],
   "externalIds": [
    {
     "type": "carmin_tv",
     "id": "bjorn-poonen"
    },
    {
     "type": "wikidata",
     "id": "Q879454"
    },
    {
     "type": "homepage",
     "id": "https://math.mit.edu/~poonen/"
    },
    {
     "type": "mgp",
     "id": "32425"
    },
    {
     "type": "gnd",
     "id": "115203264X"
    },
    {
     "type": "idref",
     "id": "075873532"
    },
    {
     "type": "theses_fr",
     "id": "075873532"
    }
   ]
  }
 },
 {
  "id": "rz-kisin-mark",
  "latex": "\\text{Kisin, Mark}",
  "name": "Kisin, Mark",
  "en": "Kisin, Mark",
  "importance": 0.71,
  "field": "arith",
  "institution": "",
  "focus": "数论、代数几何",
  "summary": "主要方向：数论（35 篇）、代数几何（32 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 35 篇（39.8%）\n  · 14 代数几何 — 32 篇（36.4%）\n\n外部标识：\n  · mgp: 131465\n  · homepage: https://people.math.harvard.edu/~kisin/\n  · wikidata: Q6768401",
  "representativeWorks": [],
  "zbmath": {
   "code": "kisin.mark",
   "url": "https://zbmath.org/authors/kisin.mark",
   "awards": [],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 35
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 32
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "131465"
    },
    {
     "type": "carmin_tv",
     "id": "mark-kisin"
    },
    {
     "type": "idref",
     "id": "079446590"
    },
    {
     "type": "homepage",
     "id": "https://people.math.harvard.edu/~kisin/"
    },
    {
     "type": "mathnetru",
     "id": "115147"
    },
    {
     "type": "wikidata",
     "id": "Q6768401"
    },
    {
     "type": "google_scholar",
     "id": "lf4x4RgAAAAJ"
    },
    {
     "type": "gnd",
     "id": "1081942924"
    }
   ]
  }
 },
 {
  "id": "rz-emerton-matthew",
  "latex": "\\text{Emerton, Matthew}",
  "name": "Emerton, Matthew",
  "en": "Emerton, Matthew",
  "importance": 0.55,
  "field": "arith",
  "institution": "",
  "focus": "数论、拓扑群与李群",
  "summary": "主要方向：数论（39 篇）、拓扑群与李群（18 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 39 篇（53.4%）\n  · 22 拓扑群与李群 — 18 篇（24.7%）\n\n外部标识：\n  · homepage: http://www.math.uchicago.edu/~emerton/\n  · wikidata: Q24248201\n  · mgp: 22519",
  "representativeWorks": [],
  "zbmath": {
   "code": "emerton.matthew",
   "url": "https://zbmath.org/authors/emerton.matthew",
   "awards": [],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 39
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 18
    }
   ],
   "externalIds": [
    {
     "type": "mathoverflow",
     "id": "2874"
    },
    {
     "type": "gnd",
     "id": "1104848163"
    },
    {
     "type": "homepage",
     "id": "http://www.math.uchicago.edu/~emerton/"
    },
    {
     "type": "wikidata",
     "id": "Q24248201"
    },
    {
     "type": "mgp",
     "id": "22519"
    },
    {
     "type": "carmin_tv",
     "id": "matthew-emerton"
    },
    {
     "type": "idref",
     "id": "079446477"
    },
    {
     "type": "theses_fr",
     "id": "079446477"
    }
   ]
  }
 },
 {
  "id": "rz-beilinson-alexander-a",
  "latex": "\\text{Beilinson, Alexander A.}",
  "name": "Beilinson, Alexander A.",
  "en": "Beilinson, Alexander A.",
  "importance": 0.76,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、范畴论与同调代数、非结合环与代数",
  "summary": "主要方向：代数几何（48 篇）、范畴论与同调代数（14 篇）；获奖：Wolf Prize 2018、Shaw Prize 2020",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 48 篇（40.0%）\n  · 18 范畴论与同调代数 — 14 篇（11.7%）\n  · 17 非结合环与代数 — 10 篇（8.3%）\n  · 11 数论 — 9 篇（7.5%）\n  · 19 K 理论 — 7 篇（5.8%）\n  · 32 多复变与解析空间 — 6 篇（5.0%）\n\n外部标识：\n  · mgp: 44354\n  · wikidata: Q369792\n  · homepage: https://mathematics.uchicago.edu/people/profile/alexander-beilinson/",
  "representativeWorks": [],
  "zbmath": {
   "code": "beilinson.alexander-a",
   "url": "https://zbmath.org/authors/beilinson.alexander-a",
   "awards": [
    {
     "title": "Wolf Prize",
     "year": 2018
    },
    {
     "title": "Shaw Prize",
     "year": 2020
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 48
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 14
    },
    {
     "field": "17",
     "name": "非结合环与代数",
     "count": 10
    },
    {
     "field": "11",
     "name": "数论",
     "count": 9
    },
    {
     "field": "19",
     "name": "K 理论",
     "count": 7
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "44354"
    },
    {
     "type": "wikidata",
     "id": "Q369792"
    },
    {
     "type": "carmin_tv",
     "id": "alexander-beilinson"
    },
    {
     "type": "gnd",
     "id": "173704115"
    },
    {
     "type": "mathnetru",
     "id": "20602"
    },
    {
     "type": "idref",
     "id": "087890860"
    },
    {
     "type": "homepage",
     "id": "https://mathematics.uchicago.edu/people/profile/alexander-beilinson/"
    }
   ]
  }
 },
 {
  "id": "rz-drinfeld-vladimir",
  "latex": "\\text{Drinfeld, Vladimir Gershonovich}",
  "name": "Drinfeld, Vladimir Gershonovich",
  "en": "Drinfeld, Vladimir Gershonovich",
  "importance": 0.81,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、拓扑群与李群、非结合环与代数",
  "summary": "主要方向：代数几何（52 篇）、拓扑群与李群（25 篇）；获奖：Fields Medal 1990、Wolf Prize 2018、Shaw Prize 2023",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 52 篇（22.2%）\n  · 22 拓扑群与李群 — 25 篇（10.7%）\n  · 17 非结合环与代数 — 24 篇（10.3%）\n  · 11 数论 — 21 篇（9.0%）\n  · 81 量子理论 — 17 篇（7.3%）\n  · 16 结合环与代数 — 15 篇（6.4%）\n\n外部标识：\n  · mactutor: Drinfeld\n  · mgp: 20646\n  · wikidata: Q369561",
  "representativeWorks": [],
  "zbmath": {
   "code": "drinfeld.vladimir",
   "url": "https://zbmath.org/authors/drinfeld.vladimir",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 1990
    },
    {
     "title": "Wolf Prize",
     "year": 2018
    },
    {
     "title": "Shaw Prize",
     "year": 2023
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 52
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 25
    },
    {
     "field": "17",
     "name": "非结合环与代数",
     "count": 24
    },
    {
     "field": "11",
     "name": "数论",
     "count": 21
    },
    {
     "field": "81",
     "name": "量子理论",
     "count": 17
    }
   ],
   "externalIds": [
    {
     "type": "mactutor",
     "id": "Drinfeld"
    },
    {
     "type": "mgp",
     "id": "20646"
    },
    {
     "type": "wikidata",
     "id": "Q369561"
    },
    {
     "type": "mathnetru",
     "id": "19866"
    },
    {
     "type": "gnd",
     "id": "132279223"
    },
    {
     "type": "idref",
     "id": "112127789"
    }
   ]
  }
 },
 {
  "id": "rz-kontsevich-maxim",
  "latex": "\\text{Kontsevich, Maxim}",
  "name": "Kontsevich, Maxim",
  "en": "Kontsevich, Maxim",
  "importance": 0.78,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、量子理论、整体分析、流形上的分析",
  "summary": "主要方向：代数几何（44 篇）、量子理论（25 篇）；获奖：EMS Prize 1992、Fields Medal 1998、Crafoord Prize 2008、Shaw Prize 2012、Breakthrough Prize in Mathematics 2014",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 44 篇（18.8%）\n  · 81 量子理论 — 25 篇（10.7%）\n  · 58 整体分析、流形上的分析 — 19 篇（8.1%）\n  · 16 结合环与代数 — 17 篇（7.3%）\n  · 53 微分几何 — 15 篇（6.4%）\n  · 32 多复变与解析空间 — 14 篇（6.0%）\n\n外部标识：\n  · mgp: 26861\n  · wikidata: Q369588\n  · mactutor: Kontsevich\n  · homepage: https://www.ihes.fr/~maxim/",
  "representativeWorks": [],
  "zbmath": {
   "code": "kontsevich.maxim",
   "url": "https://zbmath.org/authors/kontsevich.maxim",
   "awards": [
    {
     "title": "EMS Prize",
     "year": 1992
    },
    {
     "title": "Fields Medal",
     "year": 1998
    },
    {
     "title": "Crafoord Prize",
     "year": 2008
    },
    {
     "title": "Shaw Prize",
     "year": 2012
    },
    {
     "title": "Breakthrough Prize in Mathematics",
     "year": 2014
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 44
    },
    {
     "field": "81",
     "name": "量子理论",
     "count": 25
    },
    {
     "field": "58",
     "name": "整体分析、流形上的分析",
     "count": 19
    },
    {
     "field": "16",
     "name": "结合环与代数",
     "count": 17
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 15
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "26861"
    },
    {
     "type": "wikidata",
     "id": "Q369588"
    },
    {
     "type": "mactutor",
     "id": "Kontsevich"
    },
    {
     "type": "mathnetru",
     "id": "19941"
    },
    {
     "type": "gnd",
     "id": "1026762456"
    },
    {
     "type": "idref",
     "id": "071596496"
    },
    {
     "type": "google_scholar",
     "id": "wEC_2HIAAAAJ"
    },
    {
     "type": "homepage",
     "id": "https://www.ihes.fr/~maxim/"
    },
    {
     "type": "theses_fr",
     "id": "071596496"
    },
    {
     "type": "carmin_tv",
     "id": "maxim-kontsevich"
    }
   ]
  }
 },
 {
  "id": "rz-simpson-carlos-t",
  "latex": "\\text{Simpson, Carlos Tschudi}",
  "name": "Simpson, Carlos Tschudi",
  "en": "Simpson, Carlos Tschudi",
  "importance": 0.78,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间、范畴论与同调代数",
  "summary": "主要方向：代数几何（54 篇）、多复变与解析空间（22 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 54 篇（38.3%）\n  · 32 多复变与解析空间 — 22 篇（15.6%）\n  · 18 范畴论与同调代数 — 10 篇（7.1%）\n  · 53 微分几何 — 5 篇（3.5%）\n  · 03 数理逻辑与基础 — 5 篇（3.5%）\n  · 68 计算机科学 — 5 篇（3.5%）\n\n外部标识：\n  · mgp: 44606\n  · wikidata: Q15433442",
  "representativeWorks": [],
  "zbmath": {
   "code": "simpson.carlos-t",
   "url": "https://zbmath.org/authors/simpson.carlos-t",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 54
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 22
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 10
    },
    {
     "field": "53",
     "name": "微分几何",
     "count": 5
    },
    {
     "field": "03",
     "name": "数理逻辑与基础",
     "count": 5
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "44606"
    },
    {
     "type": "carmin_tv",
     "id": "carlos-simpson"
    },
    {
     "type": "wikidata",
     "id": "Q15433442"
    },
    {
     "type": "mathnetru",
     "id": "51710"
    },
    {
     "type": "dblp",
     "id": "62/4397"
    },
    {
     "type": "gnd",
     "id": "1017429251"
    },
    {
     "type": "idref",
     "id": "108786218"
    },
    {
     "type": "theses_fr",
     "id": "108786218"
    }
   ]
  }
 },
 {
  "id": "rz-lafforgue-laurent",
  "latex": "\\text{Lafforgue, Laurent}",
  "name": "Lafforgue, Laurent",
  "en": "Lafforgue, Laurent",
  "importance": 0.72,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论、拓扑群与李群",
  "summary": "主要方向：代数几何（19 篇）、数论（14 篇）；获奖：Clay Research Award 2000、Fields Medal 2002",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 19 篇（31.1%）\n  · 11 数论 — 14 篇（23.0%）\n  · 22 拓扑群与李群 — 5 篇（8.2%）\n  · 03 数理逻辑与基础 — 4 篇（6.6%）\n  · 18 范畴论与同调代数 — 4 篇（6.6%）\n\n外部标识：\n  · wikidata: Q315396\n  · mactutor: Lafforgue\n  · mgp: 22738\n  · homepage: https://www.laurentlafforgue.org/",
  "representativeWorks": [],
  "zbmath": {
   "code": "lafforgue.laurent",
   "url": "https://zbmath.org/authors/lafforgue.laurent",
   "awards": [
    {
     "title": "Clay Research Award",
     "year": 2000
    },
    {
     "title": "Fields Medal",
     "year": 2002
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 19
    },
    {
     "field": "11",
     "name": "数论",
     "count": 14
    },
    {
     "field": "22",
     "name": "拓扑群与李群",
     "count": 5
    },
    {
     "field": "03",
     "name": "数理逻辑与基础",
     "count": 4
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 4
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q315396"
    },
    {
     "type": "idref",
     "id": "07869518X"
    },
    {
     "type": "mactutor",
     "id": "Lafforgue"
    },
    {
     "type": "mgp",
     "id": "22738"
    },
    {
     "type": "mathnetru",
     "id": "37114"
    },
    {
     "type": "gnd",
     "id": "1133383017"
    },
    {
     "type": "homepage",
     "id": "https://www.laurentlafforgue.org/"
    },
    {
     "type": "carmin_tv",
     "id": "laurent-lafforgue"
    },
    {
     "type": "theses_fr",
     "id": "07869518X"
    }
   ]
  }
 },
 {
  "id": "rz-illusie-luc",
  "latex": "\\text{Illusie, Luc}",
  "name": "Illusie, Luc",
  "en": "Illusie, Luc",
  "importance": 0.87,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、历史与传记、范畴论与同调代数",
  "summary": "主要方向：代数几何（79 篇）、历史与传记（16 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 79 篇（45.1%）\n  · 01 历史与传记 — 16 篇（9.1%）\n  · 18 范畴论与同调代数 — 15 篇（8.6%）\n  · 00 一般性与综合 — 14 篇（8.0%）\n  · 13 交换环与代数 — 14 篇（8.0%）\n\n外部标识：\n  · wikidata: Q370871\n  · mgp: 13123\n  · homepage: https://www.imo.universite-paris-saclay.fr/~luc.illusie/",
  "representativeWorks": [],
  "zbmath": {
   "code": "illusie.luc",
   "url": "https://zbmath.org/authors/illusie.luc",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 79
    },
    {
     "field": "01",
     "name": "历史与传记",
     "count": 16
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 15
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 14
    },
    {
     "field": "13",
     "name": "交换环与代数",
     "count": 14
    }
   ],
   "externalIds": [
    {
     "type": "carmin_tv",
     "id": "luc-illusie"
    },
    {
     "type": "theses_fr",
     "id": "030485274"
    },
    {
     "type": "wikidata",
     "id": "Q370871"
    },
    {
     "type": "gnd",
     "id": "1059533332"
    },
    {
     "type": "orcid",
     "id": "0000-0002-6634-6325"
    },
    {
     "type": "idref",
     "id": "030485274"
    },
    {
     "type": "mgp",
     "id": "13123"
    },
    {
     "type": "mathnetru",
     "id": "51688"
    },
    {
     "type": "homepage",
     "id": "https://www.imo.universite-paris-saclay.fr/~luc.illusie/"
    }
   ]
  }
 },
 {
  "id": "rz-berthelot-pierre",
  "latex": "\\text{Berthelot, Pierre}",
  "name": "Berthelot, Pierre",
  "en": "Berthelot, Pierre",
  "importance": 0.78,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、多复变与解析空间、一般性与综合",
  "summary": "主要方向：代数几何（46 篇）、多复变与解析空间（6 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 46 篇（56.8%）\n  · 32 多复变与解析空间 — 6 篇（7.4%）\n  · 00 一般性与综合 — 6 篇（7.4%）\n  · 18 范畴论与同调代数 — 5 篇（6.2%）\n\n外部标识：\n  · mgp: 74069\n  · wikidata: Q931228",
  "representativeWorks": [],
  "zbmath": {
   "code": "berthelot.pierre",
   "url": "https://zbmath.org/authors/berthelot.pierre",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 46
    },
    {
     "field": "32",
     "name": "多复变与解析空间",
     "count": 6
    },
    {
     "field": "00",
     "name": "一般性与综合",
     "count": 6
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 5
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "74069"
    },
    {
     "type": "wikidata",
     "id": "Q931228"
    },
    {
     "type": "gnd",
     "id": "1035745364"
    },
    {
     "type": "idref",
     "id": "031671292"
    },
    {
     "type": "theses_fr",
     "id": "031671292"
    },
    {
     "type": "carmin_tv",
     "id": "pierre-berthelot"
    }
   ]
  }
 },
 {
  "id": "rz-ogus-arthur",
  "latex": "\\text{Ogus, Arthur}",
  "name": "Ogus, Arthur",
  "en": "Ogus, Arthur",
  "importance": 0.77,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、交换环与代数",
  "summary": "主要方向：代数几何（36 篇）、交换环与代数（5 篇）",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 36 篇（69.2%）\n  · 13 交换环与代数 — 5 篇（9.6%）",
  "representativeWorks": [],
  "zbmath": {
   "code": "ogus.arthur",
   "url": "https://zbmath.org/authors/ogus.arthur",
   "awards": [],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 36
    },
    {
     "field": "13",
     "name": "交换环与代数",
     "count": 5
    }
   ],
   "externalIds": [
    {
     "type": "carmin_tv",
     "id": "arthur-ogus"
    }
   ]
  }
 },
 {
  "id": "rz-voevodsky-vladimir-aleksandrovich",
  "latex": "\\text{Voevodskiĭ, Vladimir Aleksandrovich}",
  "name": "Voevodskiĭ, Vladimir Aleksandrovich",
  "en": "Voevodskiĭ, Vladimir Aleksandrovich",
  "importance": 0.75,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、范畴论与同调代数、代数拓扑",
  "summary": "主要方向：代数几何（33 篇）、范畴论与同调代数（26 篇）；获奖：Fields Medal 2002",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 33 篇（23.6%）\n  · 18 范畴论与同调代数 — 26 篇（18.6%）\n  · 55 代数拓扑 — 20 篇（14.3%）\n  · 03 数理逻辑与基础 — 19 篇（13.6%）\n\n外部标识：\n  · mgp: 28125\n  · mactutor: Voevodsky\n  · wikidata: Q369662\n  · homepage: https://www.math.ias.edu/vladimir/home",
  "representativeWorks": [],
  "zbmath": {
   "code": "voevodsky.vladimir-aleksandrovich",
   "url": "https://zbmath.org/authors/voevodsky.vladimir-aleksandrovich",
   "awards": [
    {
     "title": "Fields Medal",
     "year": 2002
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 33
    },
    {
     "field": "18",
     "name": "范畴论与同调代数",
     "count": 26
    },
    {
     "field": "55",
     "name": "代数拓扑",
     "count": 20
    },
    {
     "field": "03",
     "name": "数理逻辑与基础",
     "count": 19
    }
   ],
   "externalIds": [
    {
     "type": "mgp",
     "id": "28125"
    },
    {
     "type": "mactutor",
     "id": "Voevodsky"
    },
    {
     "type": "wikidata",
     "id": "Q369662"
    },
    {
     "type": "mathnetru",
     "id": "20935"
    },
    {
     "type": "researchgate",
     "id": "Vladimir_Voevodsky"
    },
    {
     "type": "homepage",
     "id": "https://www.math.ias.edu/vladimir/home"
    },
    {
     "type": "gnd",
     "id": "143160605"
    },
    {
     "type": "orcid",
     "id": "0000-0001-7823-4454"
    },
    {
     "type": "dblp",
     "id": "19/9534"
    },
    {
     "type": "idref",
     "id": "099890747"
    },
    {
     "type": "carmin_tv",
     "id": "vladimir-voevodski"
    }
   ]
  }
 },
 {
  "id": "rz-ngo-bao-chau",
  "latex": "\\text{Ngô Bao Châu}",
  "name": "Ngô Bao Châu",
  "en": "Ngô Bao Châu",
  "importance": 0.75,
  "field": "arith",
  "institution": "",
  "focus": "数论、代数几何",
  "summary": "主要方向：数论（27 篇）、代数几何（26 篇）；获奖：Clay Research Award 2004、Fields Medal 2010",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 11 数论 — 27 篇（30.3%）\n  · 14 代数几何 — 26 篇（29.2%）\n\n外部标识：\n  · wikidata: Q216350\n  · mgp: 86472\n  · homepage: https://math.uchicago.edu/~ngo/",
  "representativeWorks": [],
  "zbmath": {
   "code": "ngo.bao-chau",
   "url": "https://zbmath.org/authors/ngo.bao-chau",
   "awards": [
    {
     "title": "Clay Research Award",
     "year": 2004
    },
    {
     "title": "Fields Medal",
     "year": 2010
    }
   ],
   "mscTop": [
    {
     "field": "11",
     "name": "数论",
     "count": 27
    },
    {
     "field": "14",
     "name": "代数几何",
     "count": 26
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q216350"
    },
    {
     "type": "idref",
     "id": "147507650"
    },
    {
     "type": "mgp",
     "id": "86472"
    },
    {
     "type": "homepage",
     "id": "https://math.uchicago.edu/~ngo/"
    },
    {
     "type": "carmin_tv",
     "id": "bao-chau-ngo"
    },
    {
     "type": "gnd",
     "id": "141736771"
    },
    {
     "type": "google_scholar",
     "id": "J5i9pecAAAAJ"
    },
    {
     "type": "theses_fr",
     "id": "147507650"
    }
   ]
  }
 },
 {
  "id": "rz-de-jong-aise-johan",
  "latex": "\\text{de Jong, Aise Johan}",
  "name": "de Jong, Aise Johan",
  "en": "de Jong, Aise Johan",
  "importance": 0.81,
  "field": "ag",
  "institution": "",
  "focus": "代数几何、数论",
  "summary": "主要方向：代数几何（51 篇）、数论（8 篇）；获奖：EMS Prize 1996",
  "detail": "MSC 分类分布（zbMATH 统计）：\n  · 14 代数几何 — 51 篇（61.4%）\n  · 11 数论 — 8 篇（9.6%）\n\n外部标识：\n  · wikidata: Q371475\n  · mgp: 7647\n  · homepage: http://www.math.columbia.edu/~dejong/",
  "representativeWorks": [],
  "zbmath": {
   "code": "de-jong.aise-johan",
   "url": "https://zbmath.org/authors/de-jong.aise-johan",
   "awards": [
    {
     "title": "EMS Prize",
     "year": 1996
    }
   ],
   "mscTop": [
    {
     "field": "14",
     "name": "代数几何",
     "count": 51
    },
    {
     "field": "11",
     "name": "数论",
     "count": 8
    }
   ],
   "externalIds": [
    {
     "type": "wikidata",
     "id": "Q371475"
    },
    {
     "type": "mgp",
     "id": "7647"
    },
    {
     "type": "homepage",
     "id": "http://www.math.columbia.edu/~dejong/"
    },
    {
     "type": "gnd",
     "id": "172542898"
    },
    {
     "type": "idref",
     "id": "139210377"
    }
   ]
  }
 }
]
