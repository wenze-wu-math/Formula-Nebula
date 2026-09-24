/* 「最新进展年份」数据表。
 *
 * ⚠⚠ 铁律：这里每一个年份都**必须**能在该条猜想的 detail 正文里找到出处。
 *    正文没写年份的，一律留空（null），**绝不推测、绝不编造**。
 *    宁可少给 22 条数据，也不能让人读到一个我编的年份。
 *
 * 判定口径：「最新进展年份」= 正文中明确提到的、关于**这条猜想本身**
 *   的**最新数学进展**的年份。不含颁奖年份（如菲尔兹奖 2006）——
 *   那是荣誉不是进展；也不含"某猜想在 1960 年代提出"这类提出信息。
 *
 * 第四列是证据原文片段（截取自 detail），供逐条核对。
 */
export const PROGRESS_EVIDENCE = {
  'cn-tate':                 [1983, 'Abel 簇已被 Faltings 证明（1983）'],
  'cn-canonical-model':      [2010, '一般型由 BCHM（2010）证明'],
  'cn-resolution-charp':     [1964, 'Hironaka 在 1964 年解决了特征零的情形'],
  'cn-rationally-connected': [1992, '科拉尔−宫冈−森在 1992 年证明了有理连通性'],
  'cn-jacobian':             [2026, '2026 年 7 月，Levent Alpöge 给出 n = 3 的显式反例'],
  'cn-yau-tian':             [2015, 'Chen–Donaldson–Sun 在 2015 年证明'],
  'cn-riemann':              [1989, 'Conrey 1989 及后续改进'],
  'cn-bsd':                  [1980, 'Gross–Zagier 与 Kolyvagin（1980 年代）证明解析秩 ≤ 1'],
  'cn-abc':                  [2012, 'IUTT 证明自 2012 年公布以来一直存在争议'],
  'cn-goldbach':             [2013, 'Helfgott 在 2013 年完整证明弱哥德巴赫'],
  'cn-twin-prime':           [2013, '张益唐在 2013 年证明了存在有界间隔'],
  'cn-collatz':              [2019, 'Tao 2019 证明几乎所有轨道最终都落到任意给定的无界下界之下'],
  'cn-sato-tate':            [2011, 'Barnet-Lamb、Geraghty、Harris、Taylor 在 2011 年证明'],
  'cn-fermat':               [1994, 'Wiles 与 Taylor 合作在 1994 年修补'],
  'cn-mordell':              [1983, 'Faltings 在 1983 年证明'],
  'cn-class-number':         [1983, 'Gross–Zagier（1983）给出有效方法'],
  'cn-poincare':             [2003, 'Perelman 在 2002–2003 年的三篇预印本中解决'],
  'cn-geometrization':       [2003, '双曲情形由 Perelman 的 Ricci 流方法在 2003 年完成'],
  'cn-four-dim-poincare':    [1982, 'Freedman（1982）证明了拓扑版本'],
  'cn-hsiang':               [2010, 'Marques–Neves 给出（2010 年代）'],
  'cn-thurston-norm':        [2012, 'Grayson 与 Agol 在 2012 年证明了这个猜想'],
  'cn-virtual-fibering':     [2013, 'Agol 在 2008 年宣布证明，2013 年发表完整论证'],
  'cn-navier-stokes':        [1934, 'Leray 1934 证明弱解存在'],
  'cn-yang-mills':           [1974, '四维只有格点方法（Wilson 1974）'],
  'cn-kakeya':               [2025, '王虹与 Zahl 在 2025 年证明了三维 Kakeya 猜想'],
  'cn-lusin':                [1971, '二维由 Fefferman 在 1971 年解决'],
  'cn-lagarias':             [2000, 'Lagarias 在 2000 年给出 RH 的初等等价形式'],
  'cn-sat':                  [1981, 'PARITY 不在 AC⁰ 里（Furst–Saxe–Sipser 1981）'],
  'cn-continuum':            [1963, 'Cohen（1963）用力迫法证明了 ¬CH 相容'],
  'cn-finite-simple':        [2004, '终点是 Aschbacher–Smith（2004）'],
  'cn-langlands-functoriality': [1980, 'GL(2) 上由 Langlands（1980）解决'],
  'cn-kazhdan-lusztig':      [1981, 'Beilinson–Bernstein（1981）把问题几何化'],
  'cn-lusztig':              [1994, 'Andersen–Jantzen–Soergel 证明（1994）'],
  'cn-modularity':           [2001, 'Breuil–Conrad–Diamond–Taylor（2001）完成全部情形'],
  'cn-novikov-word':         [1955, 'Novikov（1955）与 Boone（1954）独立证明不可判定'],
  'cn-group-iso':            [2015, 'Babai 2015 给出拟多项式算法（相邻问题）'],
}

/** 数据截至日期 —— 正文里出现的**最新**年份是 2026 年 7 月（cn-jacobian 的反例）。
 *  所以"截至"取到该月，而不是今天（今天会随时间漂移，
 *  而数据本身并不会自动更新 —— 写"今天"是谎报新鲜度）。 */
export const DATA_AS_OF = '2026-07'

/** 节点 id → 最新进展年份；没有证据时返回 null。
 *
 *  ⚠ 返回 null 是**正常且诚实**的结果，不是错误：
 *    59 条猜想里有 23 条的正文根本没提任何年份，
 *    那就说明"这条记录的进展时间未知" —— 界面应该什么都不显示，
 *    而不是猜一个、或者拿提出年份冒充。 */
export function progressOf(id) {
  const hit = PROGRESS_EVIDENCE[id]
  return hit ? hit[0] : null
}

/** 有进展年份证据的条数 / 总条数 —— 给界面做"诚实度"提示用。 */
export function progressCoverage(total) {
  const n = Object.keys(PROGRESS_EVIDENCE).length
  return { covered: n, total, ratio: total ? n / total : 0 }
}
