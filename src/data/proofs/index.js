 
/*
 * 证明数据注册表。
 *
 * ⚠ 本文件的 import 清单由 `scripts/_sync-proof-index.mjs` 依据目录内容生成，
 *   新增 batch-NN.js 后请运行该脚本，不要手改。
 *
 * 为什么用静态清单而不是 readdir / import.meta.glob：
 *   · 浏览器构建不能 import `node:fs`（Vite 会 externalize 成空壳）；
 *   · Node 下的验证脚本不解析 import.meta.glob。
 *   静态 import 是唯一在两个环境里都可靠的形式。
 */
import { REWRITE_A1_PROOFS } from './rewrite-a1.js'
import { REWRITE_A2_PROOFS } from './rewrite-a2.js'
import { REWRITE_A3_PROOFS } from './rewrite-a3.js'
import { REWRITE_B_PROOFS } from './rewrite-b.js'
import { DEEP_DIVE_PROOFS } from './deep-dive.js'
import { FOUNDATION_LONG_PROOFS } from './foundation-long.js'
import { FOUNDATION_LONG_B_PROOFS } from './foundation-long-b.js'
import { NEW_TOPIC_PROOFS } from './new-topics.js'
import { NEW_CURVE_PROOFS } from './new-curves.js'
import { NEW_SHEAF_PROOFS } from './new-sheaves.js'
import { BATCH_01_PROOFS } from './batch-01.js'
import { BATCH_02_PROOFS } from './batch-02.js'
import { BATCH_03_PROOFS } from './batch-03.js'
import { BATCH_04_PROOFS } from './batch-04.js'
import { BATCH_05_PROOFS } from './batch-05.js'
import { BATCH_06_PROOFS } from './batch-06.js'
import { BATCH_07_PROOFS } from './batch-07.js'
import { BATCH_08_PROOFS } from './batch-08.js'
import { BATCH_12_PROOFS } from './batch-12.js'
import { BATCH_13_PROOFS } from './batch-13.js'
import { BATCH_14_PROOFS } from './batch-14.js'
import { BATCH_15_PROOFS } from './batch-15.js'
import { BATCH_16_PROOFS } from './batch-16.js'
import { BATCH_19_PROOFS } from './batch-19.js'
import { BATCH_20_PROOFS } from './batch-20.js'
import { BATCH_21_PROOFS } from './batch-21.js'
import { BATCH_22_PROOFS } from './batch-22.js'
import { BATCH_24_PROOFS } from './batch-24.js'
import { BATCH_25_PROOFS } from './batch-25.js'
import { BATCH_26_PROOFS } from './batch-26.js'
import { BATCH_27_PROOFS } from './batch-27.js'
import { BATCH_29_PROOFS } from './batch-29.js'
import { BATCH_30_PROOFS } from './batch-30.js'
import { BATCH_32_PROOFS } from './batch-32.js'

/**
 * Merge order of the proof families.
 *
 * 顺序只影响可读性：`scripts/_check-proof-file.mjs` 保证**没有任何节点 id
 * 出现在两个文件里**（verify-proofs.mjs 也把重复键当作错误），所以这里没有
 * "谁覆盖谁"的隐含语义，改动顺序不会改变任何一条证明。
 */
export const PROOF_MERGE_ORDER = [
  'rewrite-a1.js',
  'rewrite-a2.js',
  'rewrite-a3.js',
  'rewrite-b.js',
  'deep-dive.js',
  'foundation-long.js',
  'foundation-long-b.js',
  'new-topics.js',
  'new-curves.js',
  'new-sheaves.js',
  'batch-01.js',
  'batch-02.js',
  'batch-03.js',
  'batch-04.js',
  'batch-05.js',
  'batch-06.js',
  'batch-07.js',
  'batch-08.js',
  'batch-12.js',
  'batch-13.js',
  'batch-14.js',
  'batch-15.js',
  'batch-16.js',
  'batch-19.js',
  'batch-20.js',
  'batch-21.js',
  'batch-22.js',
  'batch-24.js',
  'batch-25.js',
  'batch-26.js',
  'batch-27.js',
  'batch-29.js',
  'batch-30.js',
  'batch-32.js',
]

/** 目录里存在的全部批次文件（供验证脚本双向核对）。 */
export const PROOF_BATCH_FILES = [
  'batch-01.js',
  'batch-02.js',
  'batch-03.js',
  'batch-04.js',
  'batch-05.js',
  'batch-06.js',
  'batch-07.js',
  'batch-08.js',
  'batch-12.js',
  'batch-13.js',
  'batch-14.js',
  'batch-15.js',
  'batch-16.js',
  'batch-19.js',
  'batch-20.js',
  'batch-21.js',
  'batch-22.js',
  'batch-24.js',
  'batch-25.js',
  'batch-26.js',
  'batch-27.js',
  'batch-29.js',
  'batch-30.js',
  'batch-32.js',
]

/** All optional proof records, keyed by an existing graph node id. */
export const PROOFS = Object.freeze(Object.assign(
  {},
  REWRITE_A1_PROOFS,           // Zariski 拓扑 / 素谱 / Spec 函子
  REWRITE_A2_PROOFS,           // 理想—簇对应 / 理想层 / 纤维积
  REWRITE_A3_PROOFS,           // 诺特性 / 切空间
  REWRITE_B_PROOFS,            // 拟凝聚层 / Serre 仿射 / 曲线 RR / Hurwitz / Kähler
  DEEP_DIVE_PROOFS,            // 平坦 / 纤维维数 / Lying Over / Hensel / 射影上同调
  FOUNDATION_LONG_PROOFS,      // 零点定理 / Noether 正规化 / Hilbert 基定理 / 准素分解
  FOUNDATION_LONG_B_PROOFS,    // 局部化 / Nakayama / Krull 维数
  NEW_TOPIC_PROOFS,            // 米田 / Ext-Tor / 完备化 / Krull 交 / 整扩张 / 正则局部环 / 层上同调 / 忠实平坦
  NEW_CURVE_PROOFS,            // 相交数 / 除子 / 亏格 / 曲线 Serre 对偶 / Noether 公式
  NEW_SHEAF_PROOFS,            // Čech 上同调 / 平坦判据 / 分离 / 紧合 / 光滑
  BATCH_01_PROOFS,
  BATCH_02_PROOFS,
  BATCH_03_PROOFS,
  BATCH_04_PROOFS,
  BATCH_05_PROOFS,
  BATCH_06_PROOFS,
  BATCH_07_PROOFS,
  BATCH_08_PROOFS,
  BATCH_12_PROOFS,
  BATCH_13_PROOFS,
  BATCH_14_PROOFS,
  BATCH_15_PROOFS,
  BATCH_16_PROOFS,
  BATCH_19_PROOFS,
  BATCH_20_PROOFS,
  BATCH_21_PROOFS,
  BATCH_22_PROOFS,
  BATCH_24_PROOFS,
  BATCH_25_PROOFS,
  BATCH_26_PROOFS,
  BATCH_27_PROOFS,
  BATCH_29_PROOFS,
  BATCH_30_PROOFS,
  BATCH_32_PROOFS,
))

export function getProof(nodeId) { return PROOFS[nodeId] ?? null }
export function getProofCount() { return Object.keys(PROOFS).length }
export { PROOF_SCHEMA_VERSION, validateProofShape } from './schema.js'
