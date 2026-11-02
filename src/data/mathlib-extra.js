/**
 * src/data/mathlib-extra.js — 由 Lean mathlib4 抽取的**形式化**定理。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/probe-mathlib-tree.mjs   # 拿真实文件清单（省 GitHub 配额）
 *     node kb-src/fetch-mathlib.mjs --limit 120
 *     node kb-src/build-mathlib-nodes.mjs
 *
 * 来源：https://github.com/leanprover-community/mathlib4
 *
 * ═══ 这是知识库的第三个维度 ═══
 *   Stacks  → 定理性（人写、同行审阅）
 *   nLab    → 概念性（wiki 散文）
 *   mathlib → **形式化**（Lean 4 内核验证）
 *
 * 带 `formal: true` 的节点，其正确性由 Lean 内核保证（可 --trust=0 重编译），
 * 不依赖人类共识。但注意：
 *   · `latex` 字段是 **Lean 类型签名**，不是 LaTeX 排版
 *   · `summary` 是 Lean docstring 原文，不是本知识库撰写的中文
 *
 * 生成时间：2026-11-02T11:43:06.101Z
 * 节点数：487　关联数：556
 */

export const MATHLIB_NODES = [
 {
  "id": "ml-projectivespectrum-proj-islocalization-atprime",
  "latex": "@IsLocalization (Away 𝒜 f) _ ((toSpec 𝒜 f).base x).asIdeal.primeCompl (AtPrime 𝒜 x.1.asHomogeneousIdeal.toIdeal) _ (mapId 𝒜 (Submonoid.p …",
  "name": "isLocalization_atPrime",
  "en": "ProjectiveSpectrum.Proj.isLocalization_atPrime",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If x is a point in the basic open set D(f) where f is a homogeneous element of positive degree, then the homogeneously localized ring A⁰ₓ has the universal property of the localiza",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ProjectiveSpectrum.Proj.isLocalization_atPrime\n类型签名：(f) (x : pbo f) {m} (f_deg : f ∈ 𝒜 m) (hm : 0 < m) : @IsLocalization (Away 𝒜 f) _ ((toSpec 𝒜 f).base x).asIdeal.primeCompl (AtPrime 𝒜 x.1.asHomogeneousIdeal.toIdeal) _ (mapId 𝒜 (Submonoid.powers_le.mpr x.2)).toAlgebra\n\nIf x is a point in the basic open set D(f) where f is a homogeneous element of positive degree, then the homogeneously localized ring A⁰ₓ has the universal property of the localization of A⁰_f at φ(x) where φ : Proj|D(f) ⟶ Spec A⁰_f is the morphism of locally ringed space constructed as above.\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Scheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Scheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Scheme.lean",
  "formal": true,
  "lean": {
   "full": "ProjectiveSpectrum.Proj.isLocalization_atPrime",
   "kind": "lemma",
   "signature": "(f) (x : pbo f) {m} (f_deg : f ∈ 𝒜 m) (hm : 0 < m) : @IsLocalization (Away 𝒜 f) _ ((toSpec 𝒜 f).base x).asIdeal.primeCompl (AtPrime 𝒜 x.1.asHomogeneousIdeal.toIdeal) _ (mapId 𝒜 (Submonoid.powers_le.mpr x.2)).toAlgebra",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Scheme.lean"
  }
 },
 {
  "id": "ml-ext-of-isdominant",
  "latex": "{f g : X ⟶ Y} (ι : W ⟶ X) (hU : ι ≫ f = ι ≫ g) : f = g",
  "name": "ext_of_isDominant",
  "en": "ext_of_isDominant",
  "importance": 0.85,
  "family": "scheme",
  "summary": "Suppose f g : X ⟶ Y where X is a reduced scheme and Y is a separated scheme. Then f = g if ι ≫ f = ι ≫ g for some dominant ι. Also see ext_of_isDominant_of_isSeparated for the gene",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ext_of_isDominant\n类型签名：[IsReduced X] {f g : X ⟶ Y} [Y.IsSeparated] (ι : W ⟶ X) [IsDominant ι] (hU : ι ≫ f = ι ≫ g) : f = g\n\nSuppose f g : X ⟶ Y where X is a reduced scheme and Y is a separated scheme. Then f = g if ι ≫ f = ι ≫ g for some dominant ι. Also see ext_of_isDominant_of_isSeparated for the general version over arbitrary bases.\n\n文件：AlgebraicGeometry/Morphisms/Separated\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Separated",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Separated.lean",
  "formal": true,
  "lean": {
   "full": "ext_of_isDominant",
   "kind": "lemma",
   "signature": "[IsReduced X] {f g : X ⟶ Y} [Y.IsSeparated] (ι : W ⟶ X) [IsDominant ι] (hU : ι ≫ f = ι ≫ g) : f = g",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Separated.lean"
  }
 },
 {
  "id": "ml-topologically-respectsiso",
  "latex": ".RespectsIso",
  "name": "topologically_respectsIso",
  "en": "topologically_respectsIso",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If a property of maps of topological spaces is satisfied by homeomorphisms and is stable under composition, the induced property on schemes respects isomorphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：topologically_respectsIso\n类型签名：(hP₁ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α ≃ₜ β), P f) (hP₂ : ∀ {α β γ : Type u} [TopologicalSpace α] [TopologicalSpace β] [TopologicalSpace γ] (f : α → β) (g : β → γ) (_ : P f) (_ : P g), P (g ∘ f)) : (topologically P).RespectsIso\n\nIf a property of maps of topological spaces is satisfied by homeomorphisms and is stable under composition, the induced property on schemes respects isomorphisms.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "topologically_respectsIso",
   "kind": "lemma",
   "signature": "(hP₁ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α ≃ₜ β), P f) (hP₂ : ∀ {α β γ : Type u} [TopologicalSpace α] [TopologicalSpace β] [TopologicalSpace γ] (f : α → β) (g : β → γ) (_ : P f) (_ : P g), P (g ∘ f)) : (topologically P).RespectsIso",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-hasaffineproperty-affineand-iff",
  "latex": "HasAffineProperty P (affineAnd Q) ↔ ∀ {X Y : Scheme.{u}} (f : X ⟶ Y), P f ↔ (IsAffineHom f ∧ ∀ U : Y.Opens, IsAffineOpen U → Q (f.app U).hom …",
  "name": "HasAffineProperty.affineAnd_iff",
  "en": "HasAffineProperty.affineAnd_iff",
  "importance": 0.86,
  "family": "scheme",
  "summary": "A convenience constructor for HasAffineProperty P (affineAnd Q). The IsAffineHom is bundled, since this goes well with defining morphism properties via extends IsAffineHom.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasAffineProperty.affineAnd_iff\n类型签名：(P : MorphismProperty Scheme.{u}) (hQi : RingHom.RespectsIso Q) (hQl : RingHom.LocalizationAwayPreserves Q) (hQs : RingHom.OfLocalizationSpan Q) : HasAffineProperty P (affineAnd Q) ↔ ∀ {X Y : Scheme.{u}} (f : X ⟶ Y), P f ↔ (IsAffineHom f ∧ ∀ U : Y.Opens, IsAffineOpen U → Q (f.app U).hom)\n\nA convenience constructor for HasAffineProperty P (affineAnd Q). The IsAffineHom is bundled, since this goes well with defining morphism properties via extends IsAffineHom.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "HasAffineProperty.affineAnd_iff",
   "kind": "lemma",
   "signature": "(P : MorphismProperty Scheme.{u}) (hQi : RingHom.RespectsIso Q) (hQl : RingHom.LocalizationAwayPreserves Q) (hQs : RingHom.OfLocalizationSpan Q) : HasAffineProperty P (affineAnd Q) ↔ ∀ {X Y : Scheme.{u}} (f : X ⟶ Y), P f ↔ (IsAffineHom f ∧ ∀ U : Y.Opens, IsAffineOpen U → Q (f.app U).hom)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-topologically-iso-le",
  "latex": "MorphismProperty.isomorphisms Scheme ≤ (topologically P)",
  "name": "topologically_iso_le",
  "en": "topologically_iso_le",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If a property of maps of topological spaces is satisfied by all homeomorphisms, every isomorphism of schemes satisfies the induced property.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：topologically_iso_le\n类型签名：(hP : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α ≃ₜ β), P f) : MorphismProperty.isomorphisms Scheme ≤ (topologically P)\n\nIf a property of maps of topological spaces is satisfied by all homeomorphisms, every isomorphism of schemes satisfies the induced property.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "topologically_iso_le",
   "kind": "lemma",
   "signature": "(hP : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α ≃ₜ β), P f) : MorphismProperty.isomorphisms Scheme ≤ (topologically P)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-sourceaffinelocally-respectsiso",
  "latex": ".toProperty.RespectsIso",
  "name": "sourceAffineLocally_respectsIso",
  "en": "AlgebraicGeometry.sourceAffineLocally_respectsIso",
  "importance": 0.81,
  "family": "scheme",
  "summary": "For P a property of ring homomorphisms, affineLocally P holds for f : X ⟶ Y if for each affine open U = Spec A ⊆ Y and V = Spec B ⊆ f ⁻¹' U, the ring hom A ⟶ B satisfies P. Also se",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.sourceAffineLocally_respectsIso\n类型签名：(h₁ : RingHom.RespectsIso P) : (sourceAffineLocally P).toProperty.RespectsIso\n\nFor P a property of ring homomorphisms, affineLocally P holds for f : X ⟶ Y if for each affine open U = Spec A ⊆ Y and V = Spec B ⊆ f ⁻¹' U, the ring hom A ⟶ B satisfies P. Also see affineLocally_iff_affineOpens_le.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.sourceAffineLocally_respectsIso",
   "kind": "theorem",
   "signature": "(h₁ : RingHom.RespectsIso P) : (sourceAffineLocally P).toProperty.RespectsIso",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-stalkmap",
  "latex": "Q (f.stalkMap x).hom",
  "name": "stalkMap",
  "en": "HasRingHomProperty.stalkMap",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let Q be a property of ring maps that is stable under localization. Then if the associated property of scheme morphisms holds for f, Q holds on all stalks.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.stalkMap\n类型签名：(hQ : ∀ {R S : Type u} [CommRing R] [CommRing S] (f : R →+* S) (_ : Q f) (J : Ideal S) (_ : J.IsPrime), Q (Localization.localRingHom _ J f rfl)) (hf : P f) (x : X) : Q (f.stalkMap x).hom\n\nLet Q be a property of ring maps that is stable under localization. Then if the associated property of scheme morphisms holds for f, Q holds on all stalks.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.stalkMap",
   "kind": "lemma",
   "signature": "(hQ : ∀ {R S : Type u} [CommRing R] [CommRing S] (f : R →+* S) (_ : Q f) (J : Ideal S) (_ : J.IsPrime), Q (Localization.localRingHom _ J f rfl)) (hf : P f) (x : X) : Q (f.stalkMap x).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-affineopens-le-apple-of-apple",
  "latex": "∃ (U' : Y.affineOpens) (V' : X.affineOpens) (_ : U'.1 ≤ U₁) (_ : V'.1 ≤ V₁) (_ : x ∈ V'.1) (e : V'.1 ≤ f ⁻¹ᵁ U'.1), P (f.appLE U' V' e).hom",
  "name": "exists_affineOpens_le_appLE_of_appLE",
  "en": "AlgebraicGeometry.exists_affineOpens_le_appLE_of_appLE",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If P holds for f over affine opens U₂ of Y and V₂ of X and U₁ (resp. V₁) are open neighborhoods of x (resp. f.base x), then P also holds for f over some affine open U' of Y (resp. ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_affineOpens_le_appLE_of_appLE\n类型签名：(hPa : StableUnderCompositionWithLocalizationAwayTarget P) (hPl : LocalizationAwayPreserves P) (x : X) (U₁ : Y.Opens) (U₂ : Y.affineOpens) (V₁ : X.Opens) (V₂ : X.affineOpens) (hx₁ : x ∈ V₁) (hx₂ : x ∈ V₂.1) (e₂ : V₂.1 ≤ f ⁻¹ᵁ U₂.1) (h₂ : P (f.appLE U₂ V₂ e₂).hom) (hfx₁ : f x ∈ U₁.1) : ∃ (U' : Y.affineOpens) (V' : X.affineOpens) (_ : U'.1 ≤ U₁) (_ : V'.1 ≤ V₁) (_ : x ∈ V'.1) (e : V'.1 ≤ f ⁻¹ᵁ U'.1), P (f.appLE U' V' e).hom\n\nIf P holds for f over affine opens U₂ of Y and V₂ of X and U₁ (resp. V₁) are open neighborhoods of x (resp. f.base x), then P also holds for f over some affine open U' of Y (resp. V' of X) that is contained in U₁ (resp. V₁).\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_affineOpens_le_appLE_of_appLE",
   "kind": "lemma",
   "signature": "(hPa : StableUnderCompositionWithLocalizationAwayTarget P) (hPl : LocalizationAwayPreserves P) (x : X) (U₁ : Y.Opens) (U₂ : Y.affineOpens) (V₁ : X.Opens) (V₂ : X.affineOpens) (hx₁ : x ∈ V₁) (hx₂ : x ∈ V₂.1) (e₂ : V₂.1 ≤ f ⁻¹ᵁ U₂.1) (h₂ : P (f.appLE U₂ V₂ e₂).hom) (hfx₁ : f x ∈ U₁.1) : ∃ (U' : Y.affineOpens) (V' : X.affineOpens) (_ : U'.1 ≤ U₁) (_ : V'.1 ≤ V₁) (_ : x ∈ V'.1) (e : V'.1 ≤ f ⁻¹ᵁ U'.1), P (f.appLE U' V' e).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-smooth-iff-forall-exists-isstandards-5b276a66",
  "latex": "Smooth f ↔ ∀ (x : X), ∃ (U : Y.Opens) (_ : IsAffineOpen U) (V : X.Opens) (_ : IsAffineOpen V) (_ : x ∈ V) (e : V ≤ f ⁻¹ᵁ U), (f.appLE U V e) …",
  "name": "Smooth.iff_forall_exists_isStandardSmooth",
  "en": "AlgebraicGeometry.Smooth.iff_forall_exists_isStandardSmooth",
  "importance": 0.86,
  "family": "scheme",
  "summary": "A morphism of schemes is smooth if and only if for each x : X there exists an affine open neighborhood V of x and an affine open neighborhood U of f.base x with V ≤ f ⁻¹ᵁ U such th",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Smooth.iff_forall_exists_isStandardSmooth\n类型签名：(f : X ⟶ Y) : Smooth f ↔ ∀ (x : X), ∃ (U : Y.Opens) (_ : IsAffineOpen U) (V : X.Opens) (_ : IsAffineOpen V) (_ : x ∈ V) (e : V ≤ f ⁻¹ᵁ U), (f.appLE U V e).hom.IsStandardSmooth\n\nA morphism of schemes is smooth if and only if for each x : X there exists an affine open neighborhood V of x and an affine open neighborhood U of f.base x with V ≤ f ⁻¹ᵁ U such that the induced map Γ(Y, U) ⟶ Γ(X, V) is standard smooth.\n\n文件：AlgebraicGeometry/Morphisms/Smooth\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Smooth",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Smooth.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Smooth.iff_forall_exists_isStandardSmooth",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) : Smooth f ↔ ∀ (x : X), ∃ (U : Y.Opens) (_ : IsAffineOpen U) (V : X.Opens) (_ : IsAffineOpen V) (_ : x ∈ V) (e : V ≤ f ⁻¹ᵁ U), (f.appLE U V e).hom.IsStandardSmooth",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Smooth.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-quasicompactcover-of-isopenmap",
  "latex": "QuasiCompactCover 𝒰.toPreZeroHypercover where isCompactOpenCovered_of_isAffineOpen {U} hU",
  "name": "of_isOpenMap",
  "en": "AlgebraicGeometry.QuasiCompactCover.of_isOpenMap",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If the component maps of 𝒰 are open, 𝒰 is quasi-compact. This in particular applies if K is the fppf topology (i.e., flat and of finite presentation) and hence in particular for ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.QuasiCompactCover.of_isOpenMap\n类型签名：{𝒰 : S.Cover K} [Scheme.JointlySurjective K] (h : ∀ i, IsOpenMap (𝒰.f i)) : QuasiCompactCover 𝒰.toPreZeroHypercover where isCompactOpenCovered_of_isAffineOpen {U} hU\n\nIf the component maps of 𝒰 are open, 𝒰 is quasi-compact. This in particular applies if K is the fppf topology (i.e., flat and of finite presentation) and hence in particular for étale and Zariski covers.\n\n文件：AlgebraicGeometry/Cover/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.QuasiCompactCover.of_isOpenMap",
   "kind": "lemma",
   "signature": "{𝒰 : S.Cover K} [Scheme.JointlySurjective K] (h : ∀ i, IsOpenMap (𝒰.f i)) : QuasiCompactCover 𝒰.toPreZeroHypercover where isCompactOpenCovered_of_isAffineOpen {U} hU",
   "file": "Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-islocallyclosed-range",
  "latex": "IsLocallyClosed (Set.range f)",
  "name": "Scheme.Hom.isLocallyClosed_range",
  "en": "AlgebraicGeometry.Scheme.Hom.isLocallyClosed_range",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A morphism of schemes f : X ⟶ Y is an immersion if 1. the underlying map of topological spaces is an embedding 2. the range of the map is locally closed 3. the induced morphisms of",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.isLocallyClosed_range\n类型签名：(f : X ⟶ Y) [IsImmersion f] : IsLocallyClosed (Set.range f)\n\nA morphism of schemes f : X ⟶ Y is an immersion if 1. the underlying map of topological spaces is an embedding 2. the range of the map is locally closed 3. the induced morphisms of stalks are all surjective.\n\n文件：AlgebraicGeometry/Morphisms/Immersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Immersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.isLocallyClosed_range",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) [IsImmersion f] : IsLocallyClosed (Set.range f)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean"
  }
 },
 {
  "id": "ml-restrict-obj",
  "latex": "Γ(M.restrict f, U) = Γ(M, f ''ᵁ U)",
  "name": "restrict_obj",
  "en": "restrict_obj",
  "importance": 0.79,
  "family": "scheme",
  "summary": "Avoid using this. Use the isomorphism AlgebraicGeometry.Scheme.Modules.restrictAppIso instead.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：restrict_obj\n类型签名：(M : Y.Modules) (f : X ⟶ Y) [IsOpenImmersion f] (U) : Γ(M.restrict f, U) = Γ(M, f ''ᵁ U)\n\nAvoid using this. Use the isomorphism AlgebraicGeometry.Scheme.Modules.restrictAppIso instead.\n\n文件：AlgebraicGeometry/Modules/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Modules/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Modules/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "restrict_obj",
   "kind": "lemma",
   "signature": "(M : Y.Modules) (f : X ⟶ Y) [IsOpenImmersion f] (U) : Γ(M.restrict f, U) = Γ(M, f ''ᵁ U)",
   "file": "Mathlib/AlgebraicGeometry/Modules/Sheaf.lean"
  }
 },
 {
  "id": "ml-restrict-map",
  "latex": ".presheaf.map i.op = M.presheaf.map (f.opensFunctor.map i).op",
  "name": "restrict_map",
  "en": "restrict_map",
  "importance": 0.82,
  "family": "scheme",
  "summary": "Avoid using this. Use the isomorphism AlgebraicGeometry.Scheme.Modules.restrictAppIso instead.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：restrict_map\n类型签名：(M : Y.Modules) (f : X ⟶ Y) [IsOpenImmersion f] {U V} (i : U ⟶ V) : (M.restrict f).presheaf.map i.op = M.presheaf.map (f.opensFunctor.map i).op\n\nAvoid using this. Use the isomorphism AlgebraicGeometry.Scheme.Modules.restrictAppIso instead.\n\n文件：AlgebraicGeometry/Modules/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Modules/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Modules/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "restrict_map",
   "kind": "lemma",
   "signature": "(M : Y.Modules) (f : X ⟶ Y) [IsOpenImmersion f] {U V} (i : U ⟶ V) : (M.restrict f).presheaf.map i.op = M.presheaf.map (f.opensFunctor.map i).op",
   "file": "Mathlib/AlgebraicGeometry/Modules/Sheaf.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-ispreimmersion-eq-inf",
  "latex": "@IsPreimmersion = (@SurjectiveOnStalks ⊓ topologically IsEmbedding : MorphismProperty _)",
  "name": "isPreimmersion_eq_inf",
  "en": "AlgebraicGeometry.isPreimmersion_eq_inf",
  "importance": 0.83,
  "family": "scheme",
  "summary": "A morphism of schemes f : X ⟶ Y is a preimmersion if the underlying map of topological spaces is an embedding and the induced morphisms of stalks are all surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isPreimmersion_eq_inf\n类型签名：: @IsPreimmersion = (@SurjectiveOnStalks ⊓ topologically IsEmbedding : MorphismProperty _)\n\nA morphism of schemes f : X ⟶ Y is a preimmersion if the underlying map of topological spaces is an embedding and the induced morphisms of stalks are all surjective.\n\n文件：AlgebraicGeometry/Morphisms/Preimmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Preimmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Preimmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isPreimmersion_eq_inf",
   "kind": "lemma",
   "signature": ": @IsPreimmersion = (@SurjectiveOnStalks ⊓ topologically IsEmbedding : MorphismProperty _)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Preimmersion.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-of-stalkmap",
  "latex": "(hQ : OfLocalizationPrime Q) (H : ∀ x, Q (f.stalkMap x).hom) : P f",
  "name": "of_stalkMap",
  "en": "HasRingHomProperty.of_stalkMap",
  "importance": 0.78,
  "family": "scheme",
  "summary": "If Q is a property of ring maps that can be checked on prime ideals, the associated property of scheme morphisms can be checked on stalks.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.of_stalkMap\n类型签名：(hQ : OfLocalizationPrime Q) (H : ∀ x, Q (f.stalkMap x).hom) : P f\n\nIf Q is a property of ring maps that can be checked on prime ideals, the associated property of scheme morphisms can be checked on stalks.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.of_stalkMap",
   "kind": "lemma",
   "signature": "(hQ : OfLocalizationPrime Q) (H : ∀ x, Q (f.stalkMap x).hom) : P f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-hasaffineproperty-of-iszariskilocalattarget",
  "latex": "HasAffineProperty P (AffineTargetMorphismProperty.of P) where isLocal_affineProperty",
  "name": "of_isZariskiLocalAtTarget",
  "en": "HasAffineProperty.of_isZariskiLocalAtTarget",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Every property local at the target can be associated with an affine target property. This is not an instance as the associated property can often take on simpler forms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasAffineProperty.of_isZariskiLocalAtTarget\n类型签名：(P : MorphismProperty Scheme.{u}) [IsZariskiLocalAtTarget P] : HasAffineProperty P (AffineTargetMorphismProperty.of P) where isLocal_affineProperty\n\nEvery property local at the target can be associated with an affine target property. This is not an instance as the associated property can often take on simpler forms.\n\n文件：AlgebraicGeometry/Morphisms/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Basic.lean",
  "formal": true,
  "lean": {
   "full": "HasAffineProperty.of_isZariskiLocalAtTarget",
   "kind": "lemma",
   "signature": "(P : MorphismProperty Scheme.{u}) [IsZariskiLocalAtTarget P] : HasAffineProperty P (AffineTargetMorphismProperty.of P) where isLocal_affineProperty",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Basic.lean"
  }
 },
 {
  "id": "ml-ext-of-isdominant-of-isseparated",
  "latex": "{f g : X ⟶ Y} {W} (ι : W ⟶ X) (hU : ι ≫ f = ι ≫ g) : f = g",
  "name": "ext_of_isDominant_of_isSeparated'",
  "en": "ext_of_isDominant_of_isSeparated'",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Suppose X is a reduced S-scheme and Y is a separated S-scheme. For any S-morphisms f g : X ⟶ Y, f = g if ι ≫ f = ι ≫ g for some dominant ι.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ext_of_isDominant_of_isSeparated'\n类型签名：[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X ⟶ Y} [f.IsOver S] [g.IsOver S] {W} (ι : W ⟶ X) [IsDominant ι] (hU : ι ≫ f = ι ≫ g) : f = g\n\nSuppose X is a reduced S-scheme and Y is a separated S-scheme. For any S-morphisms f g : X ⟶ Y, f = g if ι ≫ f = ι ≫ g for some dominant ι.\n\n文件：AlgebraicGeometry/Morphisms/Separated\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Separated",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Separated.lean",
  "formal": true,
  "lean": {
   "full": "ext_of_isDominant_of_isSeparated'",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X ⟶ Y} [f.IsOver S] [g.IsOver S] {W} (ι : W ⟶ X) [IsDominant ι] (hU : ι ≫ f = ι ≫ g) : f = g",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Separated.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isopenimmersion-of-flat-of-mono",
  "latex": "IsOpenImmersion f",
  "name": "IsOpenImmersion.of_flat_of_mono",
  "en": "AlgebraicGeometry.IsOpenImmersion.of_flat_of_mono",
  "importance": 0.85,
  "family": "scheme",
  "summary": "Flat monomorphisms that are locally of finite presentation are open immersions. In particular, every smooth monomorphism is an open immersion. The converse holds by inferInstance.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsOpenImmersion.of_flat_of_mono\n类型签名：{X Y : Scheme.{u}} (f : X ⟶ Y) [Flat f] [LocallyOfFinitePresentation f] [Mono f] : IsOpenImmersion f\n\nFlat monomorphisms that are locally of finite presentation are open immersions. In particular, every smooth monomorphism is an open immersion. The converse holds by inferInstance.\n\n文件：AlgebraicGeometry/Morphisms/FlatMono\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/FlatMono",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/FlatMono.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsOpenImmersion.of_flat_of_mono",
   "kind": "theorem",
   "signature": "{X Y : Scheme.{u}} (f : X ⟶ Y) [Flat f] [LocallyOfFinitePresentation f] [Mono f] : IsOpenImmersion f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/FlatMono.lean"
  }
 },
 {
  "id": "ml-topologically-iszariskilocalattarget",
  "latex": "IsZariskiLocalAtTarget (topologically P)",
  "name": "topologically_isZariskiLocalAtTarget",
  "en": "topologically_isZariskiLocalAtTarget",
  "importance": 0.86,
  "family": "scheme",
  "summary": "To check that a topologically defined morphism property is local at the target, we may check the corresponding properties on topological spaces.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：topologically_isZariskiLocalAtTarget\n类型签名：[(topologically P).RespectsIso] (hP₂ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α → β) (s : Set β) (_ : Continuous f) (_ : IsOpen s), P f → P (s.restrictPreimage f)) (hP₃ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α → β) {ι : Type u} (U : ι → Opens β) (_ : IsOpenCover U) (_ : Continuous f), (∀ i, P ((U i).carrier.restrictPreimage f)) → P f) : IsZariskiLocalAtTarget (topologically P)\n\nTo check that a topologically defined morphism property is local at the target, we may check the corresponding properties on topological spaces.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "topologically_isZariskiLocalAtTarget",
   "kind": "lemma",
   "signature": "[(topologically P).RespectsIso] (hP₂ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α → β) (s : Set β) (_ : Continuous f) (_ : IsOpen s), P f → P (s.restrictPreimage f)) (hP₃ : ∀ {α β : Type u} [TopologicalSpace α] [TopologicalSpace β] (f : α → β) {ι : Type u} (U : ι → Opens β) (_ : IsOpenCover U) (_ : Continuous f), (∀ i, P ((U i).carrier.restrictPreimage f)) → P f) : IsZariskiLocalAtTarget (topologically P)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-isopenmap",
  "latex": "IsOpenMap f",
  "name": "Scheme.Hom.isOpenMap",
  "en": "AlgebraicGeometry.Scheme.Hom.isOpenMap",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A morphism of schemes f : X ⟶ Y is universally open if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is (topologically) an open map.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.isOpenMap\n类型签名：{X Y : Scheme} (f : X ⟶ Y) [UniversallyOpen f] : IsOpenMap f\n\nA morphism of schemes f : X ⟶ Y is universally open if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is (topologically) an open map.\n\n文件：AlgebraicGeometry/Morphisms/UniversallyOpen\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UniversallyOpen",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UniversallyOpen.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.isOpenMap",
   "kind": "lemma",
   "signature": "{X Y : Scheme} (f : X ⟶ Y) [UniversallyOpen f] : IsOpenMap f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UniversallyOpen.lean"
  }
 },
 {
  "id": "ml-topologically-isstableundercomposition",
  "latex": ".IsStableUnderComposition where comp_mem {X Y Z} f g hf hg",
  "name": "topologically_isStableUnderComposition",
  "en": "topologically_isStableUnderComposition",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If a property of maps of topological spaces is stable under composition, the induced morphism property of schemes is stable under composition.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：topologically_isStableUnderComposition\n类型签名：(hP : ∀ {α β γ : Type u} [TopologicalSpace α] [TopologicalSpace β] [TopologicalSpace γ] (f : α → β) (g : β → γ) (_ : P f) (_ : P g), P (g ∘ f)) : (topologically P).IsStableUnderComposition where comp_mem {X Y Z} f g hf hg\n\nIf a property of maps of topological spaces is stable under composition, the induced morphism property of schemes is stable under composition.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "topologically_isStableUnderComposition",
   "kind": "lemma",
   "signature": "(hP : ∀ {α β γ : Type u} [TopologicalSpace α] [TopologicalSpace β] [TopologicalSpace γ] (f : α → β) (g : β → γ) (_ : P f) (_ : P g), P (g ∘ f)) : (topologically P).IsStableUnderComposition where comp_mem {X Y Z} f g hf hg",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-injective",
  "latex": "Function.Injective f",
  "name": "Scheme.Hom.injective",
  "en": "AlgebraicGeometry.Scheme.Hom.injective",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A morphism of schemes f : X ⟶ Y is universally injective if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is injective (on points).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.injective\n类型签名：(f : X ⟶ Y) [UniversallyInjective f] : Function.Injective f\n\nA morphism of schemes f : X ⟶ Y is universally injective if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is injective (on points).\n\n文件：AlgebraicGeometry/Morphisms/UniversallyInjective\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UniversallyInjective",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UniversallyInjective.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.injective",
   "kind": "theorem",
   "signature": "(f : X ⟶ Y) [UniversallyInjective f] : Function.Injective f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UniversallyInjective.lean"
  }
 },
 {
  "id": "ml-hasaffineproperty-affineand-containsidentities",
  "latex": "P.ContainsIdentities where id_mem X",
  "name": "HasAffineProperty.affineAnd_containsIdentities",
  "en": "HasAffineProperty.affineAnd_containsIdentities",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If Q contains identities and respects isomorphisms (i.e. is satisfied by isomorphisms), and P is affine locally defined by affineAnd Q, then P contains identities.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasAffineProperty.affineAnd_containsIdentities\n类型签名：{P : MorphismProperty Scheme.{u}} (hA : HasAffineProperty P (affineAnd Q)) (hQi : RingHom.RespectsIso Q) (hQ : RingHom.ContainsIdentities Q) : P.ContainsIdentities where id_mem X\n\nIf Q contains identities and respects isomorphisms (i.e. is satisfied by isomorphisms), and P is affine locally defined by affineAnd Q, then P contains identities.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "HasAffineProperty.affineAnd_containsIdentities",
   "kind": "lemma",
   "signature": "{P : MorphismProperty Scheme.{u}} (hA : HasAffineProperty P (affineAnd Q)) (hQi : RingHom.RespectsIso Q) (hQ : RingHom.ContainsIdentities Q) : P.ContainsIdentities where id_mem X",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-isclosedmap",
  "latex": "IsClosedMap f",
  "name": "Scheme.Hom.isClosedMap",
  "en": "AlgebraicGeometry.Scheme.Hom.isClosedMap",
  "importance": 0.79,
  "family": "scheme",
  "summary": "A morphism of schemes f : X ⟶ Y is universally closed if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is (topologically) a closed map.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.isClosedMap\n类型签名：{X Y : Scheme} (f : X ⟶ Y) [UniversallyClosed f] : IsClosedMap f\n\nA morphism of schemes f : X ⟶ Y is universally closed if the base change X ×[Y] Y' ⟶ Y' along any morphism Y' ⟶ Y is (topologically) a closed map.\n\n文件：AlgebraicGeometry/Morphisms/UniversallyClosed\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UniversallyClosed",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UniversallyClosed.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.isClosedMap",
   "kind": "lemma",
   "signature": "{X Y : Scheme} (f : X ⟶ Y) [UniversallyClosed f] : IsClosedMap f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UniversallyClosed.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-inf",
  "latex": "IsAffineOpen (U ⊓ V)",
  "name": "IsAffineOpen.inf",
  "en": "AlgebraicGeometry.IsAffineOpen.inf",
  "importance": 0.85,
  "family": "scheme",
  "summary": "If X ⟶ Spec ℤ has affine diagonal (in particular when X is separated), then intersections of affine opens of X are also affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.inf\n类型签名：[IsAffineHom (pullback.diagonal (terminal.from X))] {U V : X.Opens} (hU : IsAffineOpen U) (hV : IsAffineOpen V) : IsAffineOpen (U ⊓ V)\n\nIf X ⟶ Spec ℤ has affine diagonal (in particular when X is separated), then intersections of affine opens of X are also affine.\n\n文件：AlgebraicGeometry/Morphisms/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Affine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.inf",
   "kind": "lemma",
   "signature": "[IsAffineHom (pullback.diagonal (terminal.from X))] {U V : X.Opens} (hU : IsAffineOpen U) (hV : IsAffineOpen V) : IsAffineOpen (U ⊓ V)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Affine.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-stalkmap-of-respectsiso",
  "latex": "Q' (f.stalkMap x).hom",
  "name": "stalkMap_of_respectsIso",
  "en": "HasRingHomProperty.stalkMap_of_respectsIso",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let Q be a property of ring maps that implies Q' on stalks. Then if the associated property of scheme morphisms holds for f, Q' holds on all stalks.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.stalkMap_of_respectsIso\n类型签名：{Q' : ∀ {R S : Type u} [CommRing R] [CommRing S], (R →+* S) → Prop} (hQ' : RingHom.RespectsIso Q') (hQ : ∀ {R S : Type u} [CommRing R] [CommRing S] (f : R →+* S) (_ : Q f) (J : Ideal S) (_ : J.IsPrime), Q' (Localization.localRingHom _ J f rfl)) (hf : P f) (x : X) : Q' (f.stalkMap x).hom\n\nLet Q be a property of ring maps that implies Q' on stalks. Then if the associated property of scheme morphisms holds for f, Q' holds on all stalks.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.stalkMap_of_respectsIso",
   "kind": "lemma",
   "signature": "{Q' : ∀ {R S : Type u} [CommRing R] [CommRing S], (R →+* S) → Prop} (hQ' : RingHom.RespectsIso Q') (hQ : ∀ {R S : Type u} [CommRing R] [CommRing S] (f : R →+* S) (_ : Q f) (J : Ideal S) (_ : J.IsPrime), Q' (Localization.localRingHom _ J f rfl)) (hf : P f) (x : X) : Q' (f.stalkMap x).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-eq-inf",
  "latex": "@IsClosedImmersion = (topologically IsClosedEmbedding) ⊓ @SurjectiveOnStalks",
  "name": "eq_inf",
  "en": "AlgebraicGeometry.IsClosedImmersion.eq_inf",
  "importance": 0.81,
  "family": "scheme",
  "summary": "A morphism of schemes X ⟶ Y is a closed immersion if the underlying topological map is a closed embedding and the induced stalk maps are surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.eq_inf\n类型签名：: @IsClosedImmersion = (topologically IsClosedEmbedding) ⊓ @SurjectiveOnStalks\n\nA morphism of schemes X ⟶ Y is a closed immersion if the underlying topological map is a closed embedding and the induced stalk maps are surjective.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.eq_inf",
   "kind": "lemma",
   "signature": ": @IsClosedImmersion = (topologically IsClosedEmbedding) ⊓ @SurjectiveOnStalks",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isiso-pushoutsection-iff",
  "latex": "IsIso (pushoutSection H hUST hUSX hUY) ↔ IsPushout (iX.appLE US UX hUSX) (f.appLE US UT hUST) (g.appLE UX UY (",
  "name": "isIso_pushoutSection_iff",
  "en": "AlgebraicGeometry.isIso_pushoutSection_iff",
  "importance": 0.85,
  "family": "scheme",
  "summary": "The canonical map Γ(X, Uₓ) ⊗[Γ(S, Uₛ)] Γ(T, Uₜ) ⟶ Γ(X ×ₛ T, pr₁ ⁻¹ Uₓ ∩ pr₂ ⁻¹ Uₜ). This is an isomorphism under various circumstances.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isIso_pushoutSection_iff\n类型签名：: IsIso (pushoutSection H hUST hUSX hUY) ↔ IsPushout (iX.appLE US UX hUSX) (f.appLE US UT hUST) (g.appLE UX UY (\n\nThe canonical map Γ(X, Uₓ) ⊗[Γ(S, Uₛ)] Γ(T, Uₜ) ⟶ Γ(X ×ₛ T, pr₁ ⁻¹ Uₓ ∩ pr₂ ⁻¹ Uₜ). This is an isomorphism under various circumstances.\n\n文件：AlgebraicGeometry/Morphisms/Flat\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Flat",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Flat.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isIso_pushoutSection_iff",
   "kind": "lemma",
   "signature": ": IsIso (pushoutSection H hUST hUSX hUY) ↔ IsPushout (iX.appLE US UX hUSX) (f.appLE US UT hUST) (g.appLE UX UY (",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Flat.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-naturality",
  "latex": "Y.presheaf.map i ≫ f.app U = f.app U' ≫ X.presheaf.map ((Opens.map f.base).map i.unop).op",
  "name": "naturality",
  "en": "AlgebraicGeometry.Scheme.Hom.naturality",
  "importance": 0.84,
  "family": "scheme",
  "summary": "Given a morphism of schemes f : X ⟶ Y, this is the induced map Γ(Y, ⊤) ⟶ Γ(X, ⊤). This is treated as a suffix in lemma names.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.naturality\n类型签名：(i : op U' ⟶ op U) : Y.presheaf.map i ≫ f.app U = f.app U' ≫ X.presheaf.map ((Opens.map f.base).map i.unop).op\n\nGiven a morphism of schemes f : X ⟶ Y, this is the induced map Γ(Y, ⊤) ⟶ Γ(X, ⊤). This is treated as a suffix in lemma names.\n\n文件：AlgebraicGeometry/Scheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Scheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Scheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.naturality",
   "kind": "lemma",
   "signature": "(i : op U' ⟶ op U) : Y.presheaf.map i ≫ f.app U = f.app U' ≫ X.presheaf.map ((Opens.map f.base).map i.unop).op",
   "file": "Mathlib/AlgebraicGeometry/Scheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-iscompactopencovered",
  "latex": "IsCompactOpenCovered (𝒰.f ·) (U : Set S)",
  "name": "IsAffineOpen.isCompactOpenCovered",
  "en": "AlgebraicGeometry.IsAffineOpen.isCompactOpenCovered",
  "importance": 0.85,
  "family": "scheme",
  "summary": "A cover of a scheme is quasi-compact if every affine open of the base can be covered by a finite union of images of quasi-compact opens of the components.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.isCompactOpenCovered\n类型签名：[QuasiCompactCover 𝒰] {U : S.Opens} (hU : IsAffineOpen U) : IsCompactOpenCovered (𝒰.f ·) (U : Set S)\n\nA cover of a scheme is quasi-compact if every affine open of the base can be covered by a finite union of images of quasi-compact opens of the components.\n\n文件：AlgebraicGeometry/Cover/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.isCompactOpenCovered",
   "kind": "lemma",
   "signature": "[QuasiCompactCover 𝒰] {U : S.Opens} (hU : IsAffineOpen U) : IsCompactOpenCovered (𝒰.f ·) (U : Set S)",
   "file": "Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-basicopen-le-apple-of-apple-o-8fa658d3",
  "latex": "∃ (r : Γ(Y, U₁)) (s : Γ(X, V₁)) (_ : x ∈ X.basicOpen s) (e : X.basicOpen s ≤ f ⁻¹ᵁ Y.basicOpen r), P (f.appLE (Y.basicOpen r) (X.basicOpen s …",
  "name": "exists_basicOpen_le_appLE_of_appLE_of_isAffine",
  "en": "AlgebraicGeometry.exists_basicOpen_le_appLE_of_appLE_of_isAffine",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If P holds for f over affine opens U₂ of Y and V₂ of X and U₁ (resp. V₁) are open affine neighborhoods of x (resp. f.base x), then P also holds for f over some basic open of U₁ (re",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_basicOpen_le_appLE_of_appLE_of_isAffine\n类型签名：(hPa : StableUnderCompositionWithLocalizationAwayTarget P) (hPl : LocalizationAwayPreserves P) (x : X) (U₁ : Y.affineOpens) (U₂ : Y.affineOpens) (V₁ : X.affineOpens) (V₂ : X.affineOpens) (hx₁ : x ∈ V₁.1) (hx₂ : x ∈ V₂.1) (e₂ : V₂.1 ≤ f ⁻¹ᵁ U₂.1) (h₂ : P (f.appLE U₂ V₂ e₂).hom) (hfx₁ : f x ∈ U₁.1) : ∃ (r : Γ(Y, U₁)) (s : Γ(X, V₁)) (_ : x ∈ X.basicOpen s) (e : X.basicOpen s ≤ f ⁻¹ᵁ Y.basicOpen r), P (f.appLE (Y.basicOpen r) (X.basicOpen s) e).hom\n\nIf P holds for f over affine opens U₂ of Y and V₂ of X and U₁ (resp. V₁) are open affine neighborhoods of x (resp. f.base x), then P also holds for f over some basic open of U₁ (resp. V₁).\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_basicOpen_le_appLE_of_appLE_of_isAffine",
   "kind": "lemma",
   "signature": "(hPa : StableUnderCompositionWithLocalizationAwayTarget P) (hPl : LocalizationAwayPreserves P) (x : X) (U₁ : Y.affineOpens) (U₂ : Y.affineOpens) (V₁ : X.affineOpens) (V₂ : X.affineOpens) (hx₁ : x ∈ V₁.1) (hx₂ : x ∈ V₂.1) (e₂ : V₂.1 ≤ f ⁻¹ᵁ U₂.1) (h₂ : P (f.appLE U₂ V₂ e₂).hom) (hfx₁ : f x ∈ U₁.1) : ∃ (r : Γ(Y, U₁)) (s : Γ(X, V₁)) (_ : x ∈ X.basicOpen s) (e : X.basicOpen s ≤ f ⁻¹ᵁ Y.basicOpen r), P (f.appLE (Y.basicOpen r) (X.basicOpen s) e).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-respects-isopenimmersion",
  "latex": "P.Respects @IsOpenImmersion where postcomp {X Y Z} i hi f hf",
  "name": "respects_isOpenImmersion",
  "en": "HasRingHomProperty.respects_isOpenImmersion",
  "importance": 0.85,
  "family": "scheme",
  "summary": "Any property of scheme morphisms induced by a property of ring homomorphisms is stable under composition with open immersions.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.respects_isOpenImmersion\n类型签名：(hQ : RingHom.StableUnderCompositionWithLocalizationAwaySource Q) : P.Respects @IsOpenImmersion where postcomp {X Y Z} i hi f hf\n\nAny property of scheme morphisms induced by a property of ring homomorphisms is stable under composition with open immersions.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.respects_isOpenImmersion",
   "kind": "lemma",
   "signature": "(hQ : RingHom.StableUnderCompositionWithLocalizationAwaySource Q) : P.Respects @IsOpenImmersion where postcomp {X Y Z} i hi f hf",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-spec-of-surjective",
  "latex": "IsClosedImmersion (Spec.map f) where isClosedEmbedding",
  "name": "spec_of_surjective",
  "en": "AlgebraicGeometry.IsClosedImmersion.spec_of_surjective",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Given two commutative rings R S : CommRingCat and a surjective morphism f : R ⟶ S, the induced scheme morphism specObj S ⟶ specObj R is a closed immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.spec_of_surjective\n类型签名：{R S : CommRingCat} (f : R ⟶ S) (h : Function.Surjective f) : IsClosedImmersion (Spec.map f) where isClosedEmbedding\n\nGiven two commutative rings R S : CommRingCat and a surjective morphism f : R ⟶ S, the induced scheme morphism specObj S ⟶ specObj R is a closed immersion.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.spec_of_surjective",
   "kind": "theorem",
   "signature": "{R S : CommRingCat} (f : R ⟶ S) (h : Function.Surjective f) : IsClosedImmersion (Spec.map f) where isClosedEmbedding",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-islocalization-basicopen-of-qcqs",
  "latex": "IsLocalization.Away f (Γ(X, X.basicOpen f))",
  "name": "isLocalization_basicOpen_of_qcqs",
  "en": "AlgebraicGeometry.isLocalization_basicOpen_of_qcqs",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If U is qcqs, then Γ(X, D(f)) ≃ Γ(X, U)_f for every f : Γ(X, U). This is known as the **Qcqs lemma** in [R. Vakil, *The rising sea*][RisingSea].",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isLocalization_basicOpen_of_qcqs\n类型签名：{X : Scheme} {U : X.Opens} (hU : IsCompact U.1) (hU' : IsQuasiSeparated U.1) (f : Γ(X, U)) : IsLocalization.Away f (Γ(X, X.basicOpen f))\n\nIf U is qcqs, then Γ(X, D(f)) ≃ Γ(X, U)_f for every f : Γ(X, U). This is known as the **Qcqs lemma** in [R. Vakil, *The rising sea*][RisingSea].\n\n文件：AlgebraicGeometry/Morphisms/QuasiSeparated\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiSeparated",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiSeparated.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isLocalization_basicOpen_of_qcqs",
   "kind": "theorem",
   "signature": "{X : Scheme} {U : X.Opens} (hU : IsCompact U.1) (hU' : IsQuasiSeparated U.1) (f : Γ(X, U)) : IsLocalization.Away f (Γ(X, X.basicOpen f))",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiSeparated.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isproper-eq",
  "latex": "@IsProper = (@IsSeparated ⊓ @UniversallyClosed : MorphismProperty Scheme) ⊓ @LocallyOfFiniteType",
  "name": "isProper_eq",
  "en": "AlgebraicGeometry.isProper_eq",
  "importance": 0.8,
  "family": "scheme",
  "summary": "A morphism is proper if it is separated, universally closed and locally of finite type.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isProper_eq\n类型签名：: @IsProper = (@IsSeparated ⊓ @UniversallyClosed : MorphismProperty Scheme) ⊓ @LocallyOfFiniteType\n\nA morphism is proper if it is separated, universally closed and locally of finite type.\n\n文件：AlgebraicGeometry/Morphisms/Proper\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Proper",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Proper.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isProper_eq",
   "kind": "lemma",
   "signature": ": @IsProper = (@IsSeparated ⊓ @UniversallyClosed : MorphismProperty Scheme) ⊓ @LocallyOfFiniteType",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Proper.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isdominant-of-of-apptop-injective",
  "latex": "IsDominant f",
  "name": "isDominant_of_of_appTop_injective",
  "en": "AlgebraicGeometry.isDominant_of_of_appTop_injective",
  "importance": 0.8,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is a morphism of schemes with quasi-compact source and affine target, f induces an injection on global sections, then f is dominant.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isDominant_of_of_appTop_injective\n类型签名：[CompactSpace X] (hfinj : Function.Injective (f.appTop)) : IsDominant f\n\nIf f : X ⟶ Y is a morphism of schemes with quasi-compact source and affine target, f induces an injection on global sections, then f is dominant.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isDominant_of_of_appTop_injective",
   "kind": "lemma",
   "signature": "[CompactSpace X] (hfinj : Function.Injective (f.appTop)) : IsDominant f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-topologically-iszariskilocalatsource",
  "latex": "IsZariskiLocalAtSource (topologically P)",
  "name": "topologically_isZariskiLocalAtSource'",
  "en": "topologically_isZariskiLocalAtSource'",
  "importance": 0.83,
  "family": "scheme",
  "summary": "A variant of topologically_isZariskiLocalAtSource that takes one iff statement instead of two implications.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：topologically_isZariskiLocalAtSource'\n类型签名：[(topologically P).RespectsIso] (hP : ∀ {X Y : Type u} [TopologicalSpace X] [TopologicalSpace Y] (f : X → Y) {ι : Type u} (U : ι → Opens X) (_ : IsOpenCover U) (_ : Continuous f), P f ↔ (∀ i, P (f ∘ ((↑) : U i → X)))) : IsZariskiLocalAtSource (topologically P)\n\nA variant of topologically_isZariskiLocalAtSource that takes one iff statement instead of two implications.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "topologically_isZariskiLocalAtSource'",
   "kind": "lemma",
   "signature": "[(topologically P).RespectsIso] (hP : ∀ {X Y : Type u} [TopologicalSpace X] [TopologicalSpace Y] (f : X → Y) {ι : Type u} (U : ι → Opens X) (_ : IsOpenCover U) (_ : Continuous f), P f ↔ (∀ i, P (f ∘ ((↑) : U i → X)))) : IsZariskiLocalAtSource (topologically P)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-of-comp-isclosedim-eef334bd",
  "latex": "IsClosedImmersion f where isClosedEmbedding",
  "name": "of_comp_isClosedImmersion",
  "en": "AlgebraicGeometry.IsClosedImmersion.of_comp_isClosedImmersion",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If f ≫ g and g are closed immersions, then f is a closed immersion. Also see IsClosedImmersion.of_comp for the general version where g is only required to be separated.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.of_comp_isClosedImmersion\n类型签名：{X Y Z : Scheme} (f : X ⟶ Y) (g : Y ⟶ Z) [IsClosedImmersion g] [IsClosedImmersion (f ≫ g)] : IsClosedImmersion f where isClosedEmbedding\n\nIf f ≫ g and g are closed immersions, then f is a closed immersion. Also see IsClosedImmersion.of_comp for the general version where g is only required to be separated.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.of_comp_isClosedImmersion",
   "kind": "theorem",
   "signature": "{X Y Z : Scheme} (f : X ⟶ Y) (g : Y ⟶ Z) [IsClosedImmersion g] [IsClosedImmersion (f ≫ g)] : IsClosedImmersion f where isClosedEmbedding",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-dominant-eq-topologically",
  "latex": "@IsDominant = topologically DenseRange",
  "name": "dominant_eq_topologically",
  "en": "dominant_eq_topologically",
  "importance": 0.69,
  "family": "scheme",
  "summary": "A morphism of schemes is dominant if the underlying map has dense range.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：dominant_eq_topologically\n类型签名：: @IsDominant = topologically DenseRange\n\nA morphism of schemes is dominant if the underlying map has dense range.\n\n文件：AlgebraicGeometry/Morphisms/UnderlyingMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UnderlyingMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UnderlyingMap.lean",
  "formal": true,
  "lean": {
   "full": "dominant_eq_topologically",
   "kind": "lemma",
   "signature": ": @IsDominant = topologically DenseRange",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UnderlyingMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-essentiallysmall-costructuredarrow-spec",
  "latex": "EssentiallySmall.{u} (P.CostructuredArrow ⊤ Scheme.Spec X)",
  "name": "essentiallySmall_costructuredArrow_Spec",
  "en": "AlgebraicGeometry.essentiallySmall_costructuredArrow_Spec",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The category of affine schemes locally of finite type over a fixed base scheme is essentially small. TODO: extend this to (relatively) quasi-compact schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.essentiallySmall_costructuredArrow_Spec\n类型签名：(P : MorphismProperty Scheme.{u}) (hP : P ≤ @LocallyOfFiniteType) [P.RespectsIso] : EssentiallySmall.{u} (P.CostructuredArrow ⊤ Scheme.Spec X)\n\nThe category of affine schemes locally of finite type over a fixed base scheme is essentially small. TODO: extend this to (relatively) quasi-compact schemes.\n\n文件：AlgebraicGeometry/Morphisms/FiniteType\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/FiniteType",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/FiniteType.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.essentiallySmall_costructuredArrow_Spec",
   "kind": "lemma",
   "signature": "(P : MorphismProperty Scheme.{u}) (hP : P ≤ @LocallyOfFiniteType) [P.RespectsIso] : EssentiallySmall.{u} (P.CostructuredArrow ⊤ Scheme.Spec X)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/FiniteType.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-isconstructible-image",
  "latex": "IsConstructible (f '' s)",
  "name": "Scheme.Hom.isConstructible_image",
  "en": "AlgebraicGeometry.Scheme.Hom.isConstructible_image",
  "importance": 0.85,
  "family": "scheme",
  "summary": "**Chevalley's Theorem**: The image of a constructible set under a morphism of finite presentation into a qcqs scheme is constructible.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.isConstructible_image\n类型签名：(f : X ⟶ Y) [LocallyOfFinitePresentation f] [QuasiCompact f] [CompactSpace Y] [QuasiSeparatedSpace Y] {s : Set X} (hs : IsConstructible s) : IsConstructible (f '' s)\n\n**Chevalley's Theorem**: The image of a constructible set under a morphism of finite presentation into a qcqs scheme is constructible.\n\n文件：AlgebraicGeometry/Morphisms/FinitePresentation\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/FinitePresentation",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/FinitePresentation.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.isConstructible_image",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) [LocallyOfFinitePresentation f] [QuasiCompact f] [CompactSpace Y] [QuasiSeparatedSpace Y] {s : Set X} (hs : IsConstructible s) : IsConstructible (f '' s)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/FinitePresentation.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-iszariskilocalatsource-iff-exists-resle",
  "latex": "X, ∃ (U : Y.Opens) (V : X.Opens) (_ : x ∈ V.1) (e : V ≤ f ⁻¹ᵁ U), P (f.resLE U V e)",
  "name": "iff_exists_resLE",
  "en": "AlgebraicGeometry.IsZariskiLocalAtSource.iff_exists_resLE",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If P is local at the source, local at the target and is stable under post-composition with open immersions, then P can be checked locally around points.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsZariskiLocalAtSource.iff_exists_resLE\n类型签名：[IsZariskiLocalAtTarget P] [P.RespectsRight @IsOpenImmersion] : P f ↔ ∀ x : X, ∃ (U : Y.Opens) (V : X.Opens) (_ : x ∈ V.1) (e : V ≤ f ⁻¹ᵁ U), P (f.resLE U V e)\n\nIf P is local at the source, local at the target and is stable under post-composition with open immersions, then P can be checked locally around points.\n\n文件：AlgebraicGeometry/Morphisms/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsZariskiLocalAtSource.iff_exists_resLE",
   "kind": "lemma",
   "signature": "[IsZariskiLocalAtTarget P] [P.RespectsRight @IsOpenImmersion] : P f ↔ ∀ x : X, ∃ (U : Y.Opens) (V : X.Opens) (_ : x ∈ V.1) (e : V ≤ f ⁻¹ᵁ U), P (f.resLE U V e)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-surjectiveonstalks-isembedding-pullback",
  "latex": "IsEmbedding fun x ↦ (pullback.fst f g x, pullback.snd f g x)",
  "name": "isEmbedding_pullback",
  "en": "AlgebraicGeometry.SurjectiveOnStalks.isEmbedding_pullback",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If Y ⟶ S is surjective on stalks, then for every X ⟶ S, X ×ₛ Y is a subset of X × Y (Cartesian product as topological spaces) with the induced topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.SurjectiveOnStalks.isEmbedding_pullback\n类型签名：{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) [SurjectiveOnStalks g] : IsEmbedding fun x ↦ (pullback.fst f g x, pullback.snd f g x)\n\nIf Y ⟶ S is surjective on stalks, then for every X ⟶ S, X ×ₛ Y is a subset of X × Y (Cartesian product as topological spaces) with the induced topology.\n\n文件：AlgebraicGeometry/Morphisms/SurjectiveOnStalks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/SurjectiveOnStalks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/SurjectiveOnStalks.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.SurjectiveOnStalks.isEmbedding_pullback",
   "kind": "lemma",
   "signature": "{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) [SurjectiveOnStalks g] : IsEmbedding fun x ↦ (pullback.fst f g x, pullback.snd f g x)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/SurjectiveOnStalks.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-etale-forget-mk",
  "latex": ".obj (.mk f) = Over.mk f",
  "name": "Etale.forget_mk",
  "en": "AlgebraicGeometry.Scheme.Etale.forget_mk",
  "importance": 0.78,
  "family": "scheme",
  "summary": "Constructor for objects in the étale site of a scheme X: it takes an étale morphism f : Y ⟶ X as an input.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Etale.forget_mk\n类型签名：{Y : Scheme.{u}} (f : Y ⟶ X) [Etale f] : (Etale.forget X).obj (.mk f) = Over.mk f\n\nConstructor for objects in the étale site of a scheme X: it takes an étale morphism f : Y ⟶ X as an input.\n\n文件：AlgebraicGeometry/Morphisms/Etale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Etale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Etale.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Etale.forget_mk",
   "kind": "lemma",
   "signature": "{Y : Scheme.{u}} (f : Y ⟶ X) [Etale f] : (Etale.forget X).obj (.mk f) = Over.mk f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Etale.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-liftcoborder",
  "latex": "f.liftCoborder ≫ f.coborderRange.ι = f",
  "name": "Scheme.Hom.liftCoborder_",
  "en": "AlgebraicGeometry.Scheme.Hom.liftCoborder_",
  "importance": 0.77,
  "family": "scheme",
  "summary": "Any (locally-closed) immersion can be factored into a closed immersion followed by a (dominant) open immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.liftCoborder_\n类型签名：ι (f : X ⟶ Y) [IsImmersion f] : f.liftCoborder ≫ f.coborderRange.ι = f\n\nAny (locally-closed) immersion can be factored into a closed immersion followed by a (dominant) open immersion.\n\n文件：AlgebraicGeometry/Morphisms/Immersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Immersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.liftCoborder_",
   "kind": "lemma",
   "signature": "ι (f : X ⟶ Y) [IsImmersion f] : f.liftCoborder ≫ f.coborderRange.ι = f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-finite-apptop-of-universallyclosed",
  "latex": "f.appTop.hom.Finite",
  "name": "finite_appTop_of_universallyClosed",
  "en": "AlgebraicGeometry.finite_appTop_of_universallyClosed",
  "importance": 0.84,
  "family": "scheme",
  "summary": "If X is an integral scheme that is universally closed and of finite type over Spec K, then Γ(X, ⊤) is a finite field extension over K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.finite_appTop_of_universallyClosed\n类型签名：(f : X ⟶ Spec ↧K) [IsIntegral X] [UniversallyClosed f] [LocallyOfFiniteType f] : f.appTop.hom.Finite\n\nIf X is an integral scheme that is universally closed and of finite type over Spec K, then Γ(X, ⊤) is a finite field extension over K.\n\n文件：AlgebraicGeometry/Morphisms/Proper\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Proper",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Proper.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.finite_appTop_of_universallyClosed",
   "kind": "theorem",
   "signature": "(f : X ⟶ Spec ↧K) [IsIntegral X] [UniversallyClosed f] [LocallyOfFiniteType f] : f.appTop.hom.Finite",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Proper.lean"
  }
 },
 {
  "id": "ml-stalkwise-respectsiso",
  "latex": ".RespectsIso where precomp {X Y Z} e (he : IsIso e) f hf",
  "name": "stalkwise_respectsIso",
  "en": "stalkwise_respectsIso",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If P respects isos, then stalkwise P respects isos.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：stalkwise_respectsIso\n类型签名：(hP : RingHom.RespectsIso P) : (stalkwise P).RespectsIso where precomp {X Y Z} e (he : IsIso e) f hf\n\nIf P respects isos, then stalkwise P respects isos.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "stalkwise_respectsIso",
   "kind": "lemma",
   "signature": "(hP : RingHom.RespectsIso P) : (stalkwise P).RespectsIso where precomp {X Y Z} e (he : IsIso e) f hf",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-iff-exists-apple-locally",
  "latex": "P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom",
  "name": "iff_exists_appLE_locally",
  "en": "HasRingHomProperty.iff_exists_appLE_locally",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If P is induced by Locally Q, it suffices to check Q on affine open sets locally around points of the source.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.iff_exists_appLE_locally\n类型签名：(hQ : RingHom.StableUnderCompositionWithLocalizationAwaySource Q) (hQi : RespectsIso Q) [HasRingHomProperty P (Locally Q)] : P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom\n\nIf P is induced by Locally Q, it suffices to check Q on affine open sets locally around points of the source.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.iff_exists_appLE_locally",
   "kind": "lemma",
   "signature": "(hQ : RingHom.StableUnderCompositionWithLocalizationAwaySource Q) (hQi : RespectsIso Q) [HasRingHomProperty P (Locally Q)] : P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isimmersion-isimmersion-iff-exists",
  "latex": "IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsClosedImmersion g₁ ∧ IsOpenImmersion g₂ ∧ g₁ ≫ g₂ = f",
  "name": "isImmersion_iff_exists",
  "en": "AlgebraicGeometry.IsImmersion.isImmersion_iff_exists",
  "importance": 0.85,
  "family": "scheme",
  "summary": "A morphism is a (locally-closed) immersion if and only if it can be factored into a closed immersion followed by an open immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsImmersion.isImmersion_iff_exists\n类型签名：: IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsClosedImmersion g₁ ∧ IsOpenImmersion g₂ ∧ g₁ ≫ g₂ = f\n\nA morphism is a (locally-closed) immersion if and only if it can be factored into a closed immersion followed by an open immersion.\n\n文件：AlgebraicGeometry/Morphisms/Immersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Immersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsImmersion.isImmersion_iff_exists",
   "kind": "lemma",
   "signature": ": IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsClosedImmersion g₁ ∧ IsOpenImmersion g₂ ∧ g₁ ≫ g₂ = f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-preimage",
  "latex": "IsAffineOpen (f ⁻¹ᵁ U)",
  "name": "IsAffineOpen.preimage",
  "en": "AlgebraicGeometry.IsAffineOpen.preimage",
  "importance": 0.81,
  "family": "scheme",
  "summary": "A morphism of schemes X ⟶ Y is affine if the preimage of any affine open subset of Y is affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.preimage\n类型签名：{X Y : Scheme} {U : Y.Opens} (hU : IsAffineOpen U) (f : X ⟶ Y) [IsAffineHom f] : IsAffineOpen (f ⁻¹ᵁ U)\n\nA morphism of schemes X ⟶ Y is affine if the preimage of any affine open subset of Y is affine.\n\n文件：AlgebraicGeometry/Morphisms/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Affine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.preimage",
   "kind": "lemma",
   "signature": "{X Y : Scheme} {U : Y.Opens} (hU : IsAffineOpen U) (f : X ⟶ Y) [IsAffineHom f] : IsAffineOpen (f ⁻¹ᵁ U)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Affine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opencover-ext-elem",
  "latex": "{X : Scheme.{u}} {U : X.Opens} (f g : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U f = (𝒰.f i).app U g) : f = g",
  "name": "OpenCover.ext_elem",
  "en": "AlgebraicGeometry.Scheme.OpenCover.ext_elem",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If two global sections agree after restriction to each member of an open cover, then they agree globally.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.OpenCover.ext_elem\n类型签名：{X : Scheme.{u}} {U : X.Opens} (f g : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U f = (𝒰.f i).app U g) : f = g\n\nIf two global sections agree after restriction to each member of an open cover, then they agree globally.\n\n文件：AlgebraicGeometry/Cover/Open\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/Open",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/Open.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.OpenCover.ext_elem",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {U : X.Opens} (f g : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U f = (𝒰.f i).app U g) : f = g",
   "file": "Mathlib/AlgebraicGeometry/Cover/Open.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-zero-of-zero-cover",
  "latex": "{X : Scheme.{u}} {U : X.Opens} (s : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U s = 0) : s = 0",
  "name": "zero_of_zero_cover",
  "en": "AlgebraicGeometry.Scheme.zero_of_zero_cover",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If the restriction of a global section to each member of an open cover is zero, then it is globally zero.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.zero_of_zero_cover\n类型签名：{X : Scheme.{u}} {U : X.Opens} (s : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U s = 0) : s = 0\n\nIf the restriction of a global section to each member of an open cover is zero, then it is globally zero.\n\n文件：AlgebraicGeometry/Cover/Open\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/Open",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/Open.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.zero_of_zero_cover",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {U : X.Opens} (s : Γ(X, U)) (𝒰 : X.OpenCover) (h : ∀ i : 𝒰.I₀, (𝒰.f i).app U s = 0) : s = 0",
   "file": "Mathlib/AlgebraicGeometry/Cover/Open.lean"
  }
 },
 {
  "id": "ml-surjective-eq-topologically",
  "latex": "@Surjective = topologically Function.Surjective",
  "name": "surjective_eq_topologically",
  "en": "surjective_eq_topologically",
  "importance": 0.69,
  "family": "scheme",
  "summary": "A morphism of schemes is surjective if the underlying map is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：surjective_eq_topologically\n类型签名：: @Surjective = topologically Function.Surjective\n\nA morphism of schemes is surjective if the underlying map is.\n\n文件：AlgebraicGeometry/Morphisms/UnderlyingMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UnderlyingMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UnderlyingMap.lean",
  "formal": true,
  "lean": {
   "full": "surjective_eq_topologically",
   "kind": "lemma",
   "signature": ": @Surjective = topologically Function.Surjective",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UnderlyingMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isfinite-iff-locallyoffinitetype-of--4940f322",
  "latex": "IsFinite f ↔ LocallyOfFiniteType f",
  "name": "isFinite_iff_locallyOfFiniteType_of_jacobsonSpace",
  "en": "AlgebraicGeometry.isFinite_iff_locallyOfFiniteType_of_jacobsonSpace",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If X is a Jacobson scheme and k is a field, Spec(k) ⟶ X is finite iff it is (locally) of finite type. (The statement is more general to allow the empty scheme as well)",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isFinite_iff_locallyOfFiniteType_of_jacobsonSpace\n类型签名：{X Y : Scheme.{u}} {f : X ⟶ Y} [Subsingleton X] [IsReduced X] [JacobsonSpace Y] : IsFinite f ↔ LocallyOfFiniteType f\n\nIf X is a Jacobson scheme and k is a field, Spec(k) ⟶ X is finite iff it is (locally) of finite type. (The statement is more general to allow the empty scheme as well)\n\n文件：AlgebraicGeometry/Morphisms/Finite\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Finite",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Finite.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isFinite_iff_locallyOfFiniteType_of_jacobsonSpace",
   "kind": "lemma",
   "signature": "{X Y : Scheme.{u}} {f : X ⟶ Y} [Subsingleton X] [IsReduced X] [JacobsonSpace Y] : IsFinite f ↔ LocallyOfFiniteType f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Finite.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isstableunderbasechange-of-pullback--4d95981f",
  "latex": "(H : ∀ {R : CommRingCat.{u}} {S X : Scheme.{u}} (f : Spec R ⟶ S) (g : X ⟶ S), P' f → P (pullback.fst f g) → P g) {X Y Z T : Scheme.{u}} (p : …",
  "name": "IsStableUnderBaseChange.of_pullback_fst_of_isAffine",
  "en": "AlgebraicGeometry.IsStableUnderBaseChange.of_pullback_fst_of_isAffine",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If X admits a morphism p : T ⟶ X from an affine scheme satisfying P', to show a property descends along a morphism f : X ⟶ Z satisfying P', X may assumed to be affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsStableUnderBaseChange.of_pullback_fst_of_isAffine\n类型签名：[P'.RespectsIso] [P'.IsStableUnderComposition] [P.IsStableUnderBaseChange] (H : ∀ {R : CommRingCat.{u}} {S X : Scheme.{u}} (f : Spec R ⟶ S) (g : X ⟶ S), P' f → P (pullback.fst f g) → P g) {X Y Z T : Scheme.{u}} [IsAffine T] (p : T ⟶ X) (hp : P' p) (f : X ⟶ Z) (g : Y ⟶ Z) (h : P' f) (hf : P (pullback.fst f g)) : P g\n\nIf X admits a morphism p : T ⟶ X from an affine scheme satisfying P', to show a property descends along a morphism f : X ⟶ Z satisfying P', X may assumed to be affine.\n\n文件：AlgebraicGeometry/Morphisms/Descent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Descent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Descent.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsStableUnderBaseChange.of_pullback_fst_of_isAffine",
   "kind": "lemma",
   "signature": "[P'.RespectsIso] [P'.IsStableUnderComposition] [P.IsStableUnderBaseChange] (H : ∀ {R : CommRingCat.{u}} {S X : Scheme.{u}} (f : Spec R ⟶ S) (g : X ⟶ S), P' f → P (pullback.fst f g) → P g) {X Y Z T : Scheme.{u}} [IsAffine T] (p : T ⟶ X) (hp : P' p) (f : X ⟶ Z) (g : Y ⟶ Z) (h : P' f) (hf : P (pullback.fst f g)) : P g",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Descent.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-islocaliso-eq-iinf",
  "latex": "@IsLocalIso = ⨅ (P : MorphismProperty Scheme.{u}) (_ : P.ContainsIdentities) (_ : IsZariskiLocalAtSource P), P",
  "name": "eq_iInf",
  "en": "AlgebraicGeometry.IsLocalIso.eq_iInf",
  "importance": 0.81,
  "family": "scheme",
  "summary": "IsLocalIso is the weakest source-Zariski-local property containing identities.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsLocalIso.eq_iInf\n类型签名：: @IsLocalIso = ⨅ (P : MorphismProperty Scheme.{u}) (_ : P.ContainsIdentities) (_ : IsZariskiLocalAtSource P), P\n\nIsLocalIso is the weakest source-Zariski-local property containing identities.\n\n文件：AlgebraicGeometry/Morphisms/LocalIso\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/LocalIso",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsLocalIso.eq_iInf",
   "kind": "lemma",
   "signature": ": @IsLocalIso = ⨅ (P : MorphismProperty Scheme.{u}) (_ : P.ContainsIdentities) (_ : IsZariskiLocalAtSource P), P",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-iszariskilocalatsource-resle",
  "latex": "P (f.resLE U V e)",
  "name": "resLE",
  "en": "AlgebraicGeometry.IsZariskiLocalAtSource.resLE",
  "importance": 0.81,
  "family": "scheme",
  "summary": "If P is local at the source and the target, then restriction on both source and target preserves P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsZariskiLocalAtSource.resLE\n类型签名：[IsZariskiLocalAtTarget P] {U : Y.Opens} {V : X.Opens} (e : V ≤ f ⁻¹ᵁ U) (hf : P f) : P (f.resLE U V e)\n\nIf P is local at the source and the target, then restriction on both source and target preserves P.\n\n文件：AlgebraicGeometry/Morphisms/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsZariskiLocalAtSource.resLE",
   "kind": "lemma",
   "signature": "[IsZariskiLocalAtTarget P] {U : Y.Opens} {V : X.Opens} (e : V ≤ f ⁻¹ᵁ U) (hf : P f) : P (f.resLE U V e)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffinehom-of-isinducing",
  "latex": "IsAffineHom f",
  "name": "isAffineHom_of_isInducing",
  "en": "AlgebraicGeometry.isAffineHom_of_isInducing",
  "importance": 0.76,
  "family": "scheme",
  "summary": "If the underlying map of a morphism is inducing and has closed range, then it is affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isAffineHom_of_isInducing\n类型签名：(hf₁ : Topology.IsInducing f) (hf₂ : IsClosed (Set.range f)) : IsAffineHom f\n\nIf the underlying map of a morphism is inducing and has closed range, then it is affine.\n\n文件：AlgebraicGeometry/Morphisms/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Affine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isAffineHom_of_isInducing",
   "kind": "lemma",
   "signature": "(hf₁ : Topology.IsInducing f) (hf₂ : IsClosed (Set.range f)) : IsAffineHom f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Affine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-stalkmap-injective-of-isopenmap-of-i-55ccdf80",
  "latex": "Function.Injective (f.stalkMap x)",
  "name": "stalkMap_injective_of_isOpenMap_of_injective",
  "en": "AlgebraicGeometry.stalkMap_injective_of_isOpenMap_of_injective",
  "importance": 0.85,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is open, injective, X is quasi-compact and Y is affine, then f is stalkwise injective if it is injective on global sections.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.stalkMap_injective_of_isOpenMap_of_injective\n类型签名：[CompactSpace X] (hfopen : IsOpenMap f) (hfinj₁ : Function.Injective f) (hfinj₂ : Function.Injective f.appTop) (x : X) : Function.Injective (f.stalkMap x)\n\nIf f : X ⟶ Y is open, injective, X is quasi-compact and Y is affine, then f is stalkwise injective if it is injective on global sections.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.stalkMap_injective_of_isOpenMap_of_injective",
   "kind": "lemma",
   "signature": "[CompactSpace X] (hfopen : IsOpenMap f) (hfinj₁ : Function.Injective f) (hfinj₂ : Function.Injective f.appTop) (x : X) : Function.Injective (f.stalkMap x)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-quasicompactcover-of-hom",
  "latex": "QuasiCompactCover 𝒰",
  "name": "of_hom",
  "en": "AlgebraicGeometry.QuasiCompactCover.of_hom",
  "importance": 0.78,
  "family": "scheme",
  "summary": "If 𝒱 is a refinement of 𝒰 such that 𝒱 is quasicompact, also 𝒰 is quasicompact.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.QuasiCompactCover.of_hom\n类型签名：{𝒱 : PreZeroHypercover.{w'} S} (f : 𝒱.Hom 𝒰) [QuasiCompactCover 𝒱] : QuasiCompactCover 𝒰\n\nIf 𝒱 is a refinement of 𝒰 such that 𝒱 is quasicompact, also 𝒰 is quasicompact.\n\n文件：AlgebraicGeometry/Cover/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.QuasiCompactCover.of_hom",
   "kind": "lemma",
   "signature": "{𝒱 : PreZeroHypercover.{w'} S} (f : 𝒱.Hom 𝒰) [QuasiCompactCover 𝒱] : QuasiCompactCover 𝒰",
   "file": "Mathlib/AlgebraicGeometry/Cover/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-etale-of-comp",
  "latex": "{Z : Scheme.{u}} (g : Y ⟶ Z) : Etale f",
  "name": "of_comp",
  "en": "AlgebraicGeometry.Etale.of_comp",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If f ≫ g is étale and g unramified, then f is étale.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Etale.of_comp\n类型签名：{Z : Scheme.{u}} (g : Y ⟶ Z) [Etale (f ≫ g)] [LocallyOfFiniteType g] [FormallyUnramified g] : Etale f\n\nIf f ≫ g is étale and g unramified, then f is étale.\n\n文件：AlgebraicGeometry/Morphisms/Etale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Etale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Etale.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Etale.of_comp",
   "kind": "lemma",
   "signature": "{Z : Scheme.{u}} (g : Y ⟶ Z) [Etale (f ≫ g)] [LocallyOfFiniteType g] [FormallyUnramified g] : Etale f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Etale.lean"
  }
 },
 {
  "id": "ml-hasaffineproperty-affineand-isstableunderbasechange",
  "latex": "P.IsStableUnderBaseChange",
  "name": "HasAffineProperty.affineAnd_isStableUnderBaseChange",
  "en": "HasAffineProperty.affineAnd_isStableUnderBaseChange",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If P is a morphism property affine locally defined by affineAnd Q, P is stable under base change if Q is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasAffineProperty.affineAnd_isStableUnderBaseChange\n类型签名：{P : MorphismProperty Scheme.{u}} (_ : HasAffineProperty P (affineAnd Q)) (hQi : RingHom.RespectsIso Q) (hQb : RingHom.IsStableUnderBaseChange Q) : P.IsStableUnderBaseChange\n\nIf P is a morphism property affine locally defined by affineAnd Q, P is stable under base change if Q is.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "HasAffineProperty.affineAnd_isStableUnderBaseChange",
   "kind": "lemma",
   "signature": "{P : MorphismProperty Scheme.{u}} (_ : HasAffineProperty P (affineAnd Q)) (hQi : RingHom.RespectsIso Q) (hQb : RingHom.IsStableUnderBaseChange Q) : P.IsStableUnderBaseChange",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-isiso-of-isclosedimmersion-of-surjective",
  "latex": "{X Y : Scheme.{u}} (f : X ⟶ Y) : IsIso f",
  "name": "isIso_of_isClosedImmersion_of_surjective",
  "en": "isIso_of_isClosedImmersion_of_surjective",
  "importance": 0.77,
  "family": "scheme",
  "summary": "A surjective closed immersion is an isomorphism when the target is reduced.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isIso_of_isClosedImmersion_of_surjective\n类型签名：{X Y : Scheme.{u}} (f : X ⟶ Y) [IsClosedImmersion f] [Surjective f] [IsReduced Y] : IsIso f\n\nA surjective closed immersion is an isomorphism when the target is reduced.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "isIso_of_isClosedImmersion_of_surjective",
   "kind": "lemma",
   "signature": "{X Y : Scheme.{u}} (f : X ⟶ Y) [IsClosedImmersion f] [Surjective f] [IsReduced Y] : IsIso f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isfield-of-universallyclosed",
  "latex": "IsField Γ(X, ⊤)",
  "name": "isField_of_universallyClosed",
  "en": "AlgebraicGeometry.isField_of_universallyClosed",
  "importance": 0.76,
  "family": "scheme",
  "summary": "If X is an integral scheme that is universally closed over Spec K, then Γ(X, ⊤) is a field.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isField_of_universallyClosed\n类型签名：(f : X ⟶ Spec ↧K) [IsIntegral X] [UniversallyClosed f] : IsField Γ(X, ⊤)\n\nIf X is an integral scheme that is universally closed over Spec K, then Γ(X, ⊤) is a field.\n\n文件：AlgebraicGeometry/Morphisms/Proper\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Proper",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Proper.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isField_of_universallyClosed",
   "kind": "theorem",
   "signature": "(f : X ⟶ Spec ↧K) [IsIntegral X] [UniversallyClosed f] : IsField Γ(X, ⊤)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Proper.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-affineand-islocal",
  "latex": ".IsLocal where respectsIso",
  "name": "affineAnd_isLocal",
  "en": "AlgebraicGeometry.affineAnd_isLocal",
  "importance": 0.79,
  "family": "scheme",
  "summary": "affineAnd P is local if P is local on the (algebraic) source.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.affineAnd_isLocal\n类型签名：(hPi : RingHom.RespectsIso Q) (hQl : RingHom.LocalizationAwayPreserves Q) (hQs : RingHom.OfLocalizationSpan Q) : (affineAnd Q).IsLocal where respectsIso\n\naffineAnd P is local if P is local on the (algebraic) source.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.affineAnd_isLocal",
   "kind": "lemma",
   "signature": "(hPi : RingHom.RespectsIso Q) (hQl : RingHom.LocalizationAwayPreserves Q) (hQs : RingHom.OfLocalizationSpan Q) : (affineAnd Q).IsLocal where respectsIso",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-hasaffineproperty-affineand-isstableundercomposition",
  "latex": "P.IsStableUnderComposition where comp_mem {X Y Z} f g hf hg",
  "name": "HasAffineProperty.affineAnd_isStableUnderComposition",
  "en": "HasAffineProperty.affineAnd_isStableUnderComposition",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If P is a morphism property affine locally defined by affineAnd Q, P is stable under composition if Q is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasAffineProperty.affineAnd_isStableUnderComposition\n类型签名：{P : MorphismProperty Scheme.{u}} (hA : HasAffineProperty P (affineAnd Q)) (hQ : RingHom.StableUnderComposition Q) : P.IsStableUnderComposition where comp_mem {X Y Z} f g hf hg\n\nIf P is a morphism property affine locally defined by affineAnd Q, P is stable under composition if Q is.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "HasAffineProperty.affineAnd_isStableUnderComposition",
   "kind": "lemma",
   "signature": "{P : MorphismProperty Scheme.{u}} (hA : HasAffineProperty P (affineAnd Q)) (hQ : RingHom.StableUnderComposition Q) : P.IsStableUnderComposition where comp_mem {X Y Z} f g hf hg",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-quasicompact-iff-isspectralmap",
  "latex": "QuasiCompact f ↔ IsSpectralMap f",
  "name": "quasiCompact_iff_isSpectralMap",
  "en": "AlgebraicGeometry.quasiCompact_iff_isSpectralMap",
  "importance": 0.69,
  "family": "scheme",
  "summary": "The preimage of a compact open set under a quasi-compact morphism between schemes is compact.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.quasiCompact_iff_isSpectralMap\n类型签名：: QuasiCompact f ↔ IsSpectralMap f\n\nThe preimage of a compact open set under a quasi-compact morphism between schemes is compact.\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.quasiCompact_iff_isSpectralMap",
   "kind": "theorem",
   "signature": ": QuasiCompact f ↔ IsSpectralMap f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isimmersion-ispullback-toimage-liftc-c1af745b",
  "latex": "IsPullback f.toImage f.liftCoborder f.imageι f.coborderRange.ι",
  "name": "isPullback_toImage_liftCoborder",
  "en": "AlgebraicGeometry.IsImmersion.isPullback_toImage_liftCoborder",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is a quasi-compact immersion, then X is the pullback of the closed immersion im f ⟶ Y and an open immersion U ⟶ Y.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsImmersion.isPullback_toImage_liftCoborder\n类型签名：[IsImmersion f] [QuasiCompact f] : IsPullback f.toImage f.liftCoborder f.imageι f.coborderRange.ι\n\nIf f : X ⟶ Y is a quasi-compact immersion, then X is the pullback of the closed immersion im f ⟶ Y and an open immersion U ⟶ Y.\n\n文件：AlgebraicGeometry/Morphisms/Immersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Immersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsImmersion.isPullback_toImage_liftCoborder",
   "kind": "lemma",
   "signature": "[IsImmersion f] [QuasiCompact f] : IsPullback f.toImage f.liftCoborder f.imageι f.coborderRange.ι",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isimmersion-isimmersion-iff-exists-o-99225e5b",
  "latex": "IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsOpenImmersion g₁ ∧ IsClosedImmersion g₂ ∧ g₁ ≫ g₂ = f",
  "name": "isImmersion_iff_exists_of_quasiCompact",
  "en": "AlgebraicGeometry.IsImmersion.isImmersion_iff_exists_of_quasiCompact",
  "importance": 0.86,
  "family": "scheme",
  "summary": "A quasi-compact morphism is a (locally-closed) immersion if and only if it can be factored into an open immersion followed by a closed immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsImmersion.isImmersion_iff_exists_of_quasiCompact\n类型签名：[QuasiCompact f] : IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsOpenImmersion g₁ ∧ IsClosedImmersion g₂ ∧ g₁ ≫ g₂ = f\n\nA quasi-compact morphism is a (locally-closed) immersion if and only if it can be factored into an open immersion followed by a closed immersion.\n\n文件：AlgebraicGeometry/Morphisms/Immersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Immersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsImmersion.isImmersion_iff_exists_of_quasiCompact",
   "kind": "lemma",
   "signature": "[QuasiCompact f] : IsImmersion f ↔ ∃ (Z : Scheme) (g₁ : X ⟶ Z) (g₂ : Z ⟶ Y), IsOpenImmersion g₁ ∧ IsClosedImmersion g₂ ∧ g₁ ≫ g₂ = f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Immersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--83e9a379",
  "latex": "X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, ⊤)",
  "name": "Scheme.zeroLocus_eq_univ_iff_subset_nilradical",
  "en": "AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical",
  "importance": 0.84,
  "family": "scheme",
  "summary": "The zero locus of a set of sections over a compact open of a scheme is X if and only if s is contained in the nilradical of Γ(X, U).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical\n类型签名：{X : Scheme.{u}} [CompactSpace X] (s : Set Γ(X, ⊤)) : X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, ⊤)\n\nThe zero locus of a set of sections over a compact open of a scheme is X if and only if s is contained in the nilradical of Γ(X, U).\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} [CompactSpace X] (s : Set Γ(X, ⊤)) : X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, ⊤)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-hasringhomproperty-iff-exists-apple",
  "latex": "P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom",
  "name": "iff_exists_appLE",
  "en": "HasRingHomProperty.iff_exists_appLE",
  "importance": 0.78,
  "family": "scheme",
  "summary": "P can be checked locally around points of the source.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasRingHomProperty.iff_exists_appLE\n类型签名：(hQ : StableUnderCompositionWithLocalizationAwaySource Q) : P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom\n\nP can be checked locally around points of the source.\n\n文件：AlgebraicGeometry/Morphisms/RingHomProperties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/RingHomProperties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean",
  "formal": true,
  "lean": {
   "full": "HasRingHomProperty.iff_exists_appLE",
   "kind": "lemma",
   "signature": "(hQ : StableUnderCompositionWithLocalizationAwaySource Q) : P f ↔ ∀ (x : X), ∃ (U : Y.affineOpens) (V : X.affineOpens) (_ : x ∈ V.1) (e : V.1 ≤ f ⁻¹ᵁ U.1), Q (f.appLE U V e).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/RingHomProperties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-forget-obj",
  "latex": "Scheme.forget.obj X = X",
  "name": "forget_obj",
  "en": "AlgebraicGeometry.Scheme.forget_obj",
  "importance": 0.65,
  "family": "scheme",
  "summary": "forgetful functor to Scheme is the same as coercion",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.forget_obj\n类型签名：(X) : Scheme.forget.obj X = X\n\nforgetful functor to Scheme is the same as coercion\n\n文件：AlgebraicGeometry/Scheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Scheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Scheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.forget_obj",
   "kind": "lemma",
   "signature": "(X) : Scheme.forget.obj X = X",
   "file": "Mathlib/AlgebraicGeometry/Scheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-flat-epi-of-flat-of-surjective",
  "latex": "(f : X ⟶ Y) : Epi f",
  "name": "epi_of_flat_of_surjective",
  "en": "AlgebraicGeometry.Flat.epi_of_flat_of_surjective",
  "importance": 0.7,
  "family": "scheme",
  "summary": "A flat surjective morphism of schemes is an epimorphism in the category of schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Flat.epi_of_flat_of_surjective\n类型签名：(f : X ⟶ Y) [Flat f] [Surjective f] : Epi f\n\nA flat surjective morphism of schemes is an epimorphism in the category of schemes.\n\n文件：AlgebraicGeometry/Morphisms/Flat\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Flat",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Flat.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Flat.epi_of_flat_of_surjective",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) [Flat f] [Surjective f] : Epi f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Flat.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-affineand-respectsiso",
  "latex": ".toProperty.RespectsIso",
  "name": "affineAnd_respectsIso",
  "en": "AlgebraicGeometry.affineAnd_respectsIso",
  "importance": 0.72,
  "family": "scheme",
  "summary": "If P respects isos, also affineAnd P respects isomorphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.affineAnd_respectsIso\n类型签名：(hP : RingHom.RespectsIso Q) : (affineAnd Q).toProperty.RespectsIso\n\nIf P respects isos, also affineAnd P respects isomorphisms.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.affineAnd_respectsIso",
   "kind": "lemma",
   "signature": "(hP : RingHom.RespectsIso Q) : (affineAnd Q).toProperty.RespectsIso",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq-bot",
  "latex": "IsNilpotent f ↔ X.basicOpen f = ⊥",
  "name": "Scheme.isNilpotent_iff_basicOpen_eq_bot",
  "en": "AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot",
  "importance": 0.79,
  "family": "scheme",
  "summary": "A global section of a quasi-compact scheme is nilpotent if and only if its associated basic open is empty.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot\n类型签名：{X : Scheme.{u}} [CompactSpace X] (f : Γ(X, ⊤)) : IsNilpotent f ↔ X.basicOpen f = ⊥\n\nA global section of a quasi-compact scheme is nilpotent if and only if its associated basic open is empty.\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} [CompactSpace X] (f : Γ(X, ⊤)) : IsNilpotent f ↔ X.basicOpen f = ⊥",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isschemetheoreticallydominant-iff-is-023f6567",
  "latex": "IsSchemeTheoreticallyDominant f ↔ IsDominant f",
  "name": "isSchemeTheoreticallyDominant_iff_isDominant",
  "en": "AlgebraicGeometry.isSchemeTheoreticallyDominant_iff_isDominant",
  "importance": 0.81,
  "family": "scheme",
  "summary": "If the target is reduced and the map is quasi-compact, then scheme-theoretically dominant is equivalent to dominant.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isSchemeTheoreticallyDominant_iff_isDominant\n类型签名：(f : X ⟶ Y) [QuasiCompact f] [IsReduced Y] : IsSchemeTheoreticallyDominant f ↔ IsDominant f\n\nIf the target is reduced and the map is quasi-compact, then scheme-theoretically dominant is equivalent to dominant.\n\n文件：AlgebraicGeometry/Morphisms/SchemeTheoreticallyDominant\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/SchemeTheoreticallyDominant",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/SchemeTheoreticallyDominant.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isSchemeTheoreticallyDominant_iff_isDominant",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) [QuasiCompact f] [IsReduced Y] : IsSchemeTheoreticallyDominant f ↔ IsDominant f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/SchemeTheoreticallyDominant.lean"
  }
 },
 {
  "id": "ml-projectivespectrum-proj-toopen-tospec-val-c-app",
  "latex": ".inv ≫ (Spec A⁰_ f).presheaf.map (homOfLE le_top).op ≫ (toSpec 𝒜 f).c.app U = awayToΓ 𝒜 f ≫ (Proj| pbo f).presheaf.map (homOfLE le_top).op",
  "name": "toOpen_toSpec_val_c_app",
  "en": "ProjectiveSpectrum.Proj.toOpen_toSpec_val_c_app",
  "importance": 0.8,
  "family": "scheme",
  "summary": "respectTransparency.types true changes the auto-generated lemmas' signature",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ProjectiveSpectrum.Proj.toOpen_toSpec_val_c_app\n类型签名：(f) (U) : (Scheme.ΓSpecIso _).inv ≫ (Spec A⁰_ f).presheaf.map (homOfLE le_top).op ≫ (toSpec 𝒜 f).c.app U = awayToΓ 𝒜 f ≫ (Proj| pbo f).presheaf.map (homOfLE le_top).op\n\nrespectTransparency.types true changes the auto-generated lemmas' signature\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Scheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Scheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Scheme.lean",
  "formal": true,
  "lean": {
   "full": "ProjectiveSpectrum.Proj.toOpen_toSpec_val_c_app",
   "kind": "lemma",
   "signature": "(f) (U) : (Scheme.ΓSpecIso _).inv ≫ (Spec A⁰_ f).presheaf.map (homOfLE le_top).op ≫ (toSpec 𝒜 f).c.app U = awayToΓ 𝒜 f ≫ (Proj| pbo f).presheaf.map (homOfLE le_top).op",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Scheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-mem-basicopen",
  "latex": "x ∈ X.basicOpen f ↔ ∃ (m : x ∈ U), IsUnit (X.presheaf.germ U x m f)",
  "name": "mem_basicOpen''",
  "en": "AlgebraicGeometry.Scheme.mem_basicOpen''",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A variant of mem_basicOpen without the x ∈ U assumption.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.mem_basicOpen''\n类型签名：{U : X.Opens} (f : Γ(X, U)) (x : X) : x ∈ X.basicOpen f ↔ ∃ (m : x ∈ U), IsUnit (X.presheaf.germ U x m f)\n\nA variant of mem_basicOpen without the x ∈ U assumption.\n\n文件：AlgebraicGeometry/Scheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Scheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Scheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.mem_basicOpen''",
   "kind": "theorem",
   "signature": "{U : X.Opens} (f : Γ(X, U)) (x : X) : x ∈ X.basicOpen f ↔ ∃ (m : x ∈ U), IsUnit (X.presheaf.germ U x m f)",
   "file": "Mathlib/AlgebraicGeometry/Scheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-isiso-of-injective-351fc71b",
  "latex": "(hf : Function.Injective f.appTop) : IsIso f",
  "name": "isIso_of_injective_of_isAffine",
  "en": "AlgebraicGeometry.IsClosedImmersion.isIso_of_injective_of_isAffine",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If f is a closed immersion with affine target such that the induced map on global sections is injective, f is an isomorphism.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.isIso_of_injective_of_isAffine\n类型签名：[IsClosedImmersion f] (hf : Function.Injective f.appTop) : IsIso f\n\nIf f is a closed immersion with affine target such that the induced map on global sections is injective, f is an isomorphism.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.isIso_of_injective_of_isAffine",
   "kind": "theorem",
   "signature": "[IsClosedImmersion f] (hf : Function.Injective f.appTop) : IsIso f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-iszariskilocalattarget-descendsalong",
  "latex": "P.DescendsAlong P'",
  "name": "IsZariskiLocalAtTarget.descendsAlong",
  "en": "AlgebraicGeometry.IsZariskiLocalAtTarget.descendsAlong",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If P is local at the target, to show P descends along P' we may assume the base to be affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsZariskiLocalAtTarget.descendsAlong\n类型签名：[IsZariskiLocalAtTarget P] [P'.IsStableUnderBaseChange] (H : ∀ {R : CommRingCat.{u}} {X Y : Scheme.{u}} (f : X ⟶ Spec R) (g : Y ⟶ Spec R), P' f → P (pullback.fst f g) → P g) : P.DescendsAlong P'\n\nIf P is local at the target, to show P descends along P' we may assume the base to be affine.\n\n文件：AlgebraicGeometry/Morphisms/Descent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Descent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Descent.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsZariskiLocalAtTarget.descendsAlong",
   "kind": "lemma",
   "signature": "[IsZariskiLocalAtTarget P] [P'.IsStableUnderBaseChange] (H : ∀ {R : CommRingCat.{u}} {X Y : Scheme.{u}} (f : X ⟶ Spec R) (g : Y ⟶ Spec R), P' f → P (pullback.fst f g) → P g) : P.DescendsAlong P'",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Descent.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-cover-exists-eq",
  "latex": "∃ i y, 𝒰.f i y = x",
  "name": "Cover.exists_eq",
  "en": "AlgebraicGeometry.Scheme.Cover.exists_eq",
  "importance": 0.72,
  "family": "scheme",
  "summary": "A cover of X in the coverage K is a 0-hypercover for K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Cover.exists_eq\n类型签名：[JointlySurjective K] (𝒰 : X.Cover K) (x : X) : ∃ i y, 𝒰.f i y = x\n\nA cover of X in the coverage K is a 0-hypercover for K.\n\n文件：AlgebraicGeometry/Cover/MorphismProperty\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/MorphismProperty",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/MorphismProperty.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Cover.exists_eq",
   "kind": "lemma",
   "signature": "[JointlySurjective K] (𝒰 : X.Cover K) (x : X) : ∃ i y, 𝒰.f i y = x",
   "file": "Mathlib/AlgebraicGeometry/Cover/MorphismProperty.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-of-isaffineopen-basicopen",
  "latex": "IsAffineOpen U",
  "name": "isAffineOpen_of_isAffineOpen_basicOpen",
  "en": "AlgebraicGeometry.isAffineOpen_of_isAffineOpen_basicOpen",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If s is a spanning set of Γ(X, U), such that each X.basicOpen i is affine, then U is also affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isAffineOpen_of_isAffineOpen_basicOpen\n类型签名：(U) (s : Set Γ(X, U)) (hs : Ideal.span s = ⊤) (hs₂ : ∀ i ∈ s, IsAffineOpen (X.basicOpen i)) : IsAffineOpen U\n\nIf s is a spanning set of Γ(X, U), such that each X.basicOpen i is affine, then U is also affine.\n\n文件：AlgebraicGeometry/Morphisms/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Affine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isAffineOpen_of_isAffineOpen_basicOpen",
   "kind": "lemma",
   "signature": "(U) (s : Set Γ(X, U)) (hs : Ideal.span s = ⊤) (hs₂ : ∀ i ∈ s, IsAffineOpen (X.basicOpen i)) : IsAffineOpen U",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Affine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isintegral-apptop-of-universallyclosed",
  "latex": "f.appTop.hom.IsIntegral",
  "name": "isIntegral_appTop_of_universallyClosed",
  "en": "AlgebraicGeometry.isIntegral_appTop_of_universallyClosed",
  "importance": 0.76,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is universally closed and Y is affine, then the map on global sections is integral.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isIntegral_appTop_of_universallyClosed\n类型签名：(f : X ⟶ Y) [UniversallyClosed f] [IsAffine Y] : f.appTop.hom.IsIntegral\n\nIf f : X ⟶ Y is universally closed and Y is affine, then the map on global sections is integral.\n\n文件：AlgebraicGeometry/Morphisms/Proper\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Proper",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Proper.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isIntegral_appTop_of_universallyClosed",
   "kind": "theorem",
   "signature": "(f : X ⟶ Y) [UniversallyClosed f] [IsAffine Y] : f.appTop.hom.IsIntegral",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Proper.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-isaffine-surjectiv-0fd23ff2",
  "latex": "IsAffine X ∧ Function.Surjective f.appTop",
  "name": "isAffine_surjective_of_isAffine",
  "en": "AlgebraicGeometry.IsClosedImmersion.isAffine_surjective_of_isAffine",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If f is a closed immersion with affine target, the source is affine and the induced map on global sections is surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.isAffine_surjective_of_isAffine\n类型签名：[IsClosedImmersion f] : IsAffine X ∧ Function.Surjective f.appTop\n\nIf f is a closed immersion with affine target, the source is affine and the induced map on global sections is surjective.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.isAffine_surjective_of_isAffine",
   "kind": "theorem",
   "signature": "[IsClosedImmersion f] : IsAffine X ∧ Function.Surjective f.appTop",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isopenmap-of-generalizingmap",
  "latex": "IsOpenMap f",
  "name": "isOpenMap_of_generalizingMap",
  "en": "AlgebraicGeometry.isOpenMap_of_generalizingMap",
  "importance": 0.73,
  "family": "scheme",
  "summary": "A generalizing morphism, locally of finite presentation is open.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isOpenMap_of_generalizingMap\n类型签名：[LocallyOfFinitePresentation f] (hf : GeneralizingMap f) : IsOpenMap f\n\nA generalizing morphism, locally of finite presentation is open.\n\n文件：AlgebraicGeometry/Morphisms/UniversallyOpen\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UniversallyOpen",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UniversallyOpen.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isOpenMap_of_generalizingMap",
   "kind": "lemma",
   "signature": "[LocallyOfFinitePresentation f] (hf : GeneralizingMap f) : IsOpenMap f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UniversallyOpen.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-exists-hom-isaffine-of-iszari-c4f0b6a6",
  "latex": "∃ (Y : Scheme.{u}) (p : Y ⟶ X), Surjective p ∧ P p ∧ IsAffine Y",
  "name": "Scheme.exists_hom_isAffine_of_isZariskiLocalAtSource",
  "en": "AlgebraicGeometry.Scheme.exists_hom_isAffine_of_isZariskiLocalAtSource",
  "importance": 0.85,
  "family": "scheme",
  "summary": "If P is local at the source, every quasi-compact scheme is dominated by an affine scheme via p : Y ⟶ X such that p satisfies P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.exists_hom_isAffine_of_isZariskiLocalAtSource\n类型签名：(X : Scheme.{u}) [CompactSpace X] [IsZariskiLocalAtSource P] [P.ContainsIdentities] : ∃ (Y : Scheme.{u}) (p : Y ⟶ X), Surjective p ∧ P p ∧ IsAffine Y\n\nIf P is local at the source, every quasi-compact scheme is dominated by an affine scheme via p : Y ⟶ X such that p satisfies P.\n\n文件：AlgebraicGeometry/Morphisms/Descent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Descent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Descent.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.exists_hom_isAffine_of_isZariskiLocalAtSource",
   "kind": "lemma",
   "signature": "(X : Scheme.{u}) [CompactSpace X] [IsZariskiLocalAtSource P] [P.ContainsIdentities] : ∃ (Y : Scheme.{u}) (p : Y ⟶ X), Surjective p ∧ P p ∧ IsAffine Y",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Descent.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isnilpotent-of-isnilpotent-cover",
  "latex": "IsNilpotent s",
  "name": "isNilpotent_of_isNilpotent_cover",
  "en": "AlgebraicGeometry.Scheme.isNilpotent_of_isNilpotent_cover",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If a global section is nilpotent on each member of a finite open cover, then f is nilpotent.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isNilpotent_of_isNilpotent_cover\n类型签名：{X : Scheme.{u}} {U : X.Opens} (s : Γ(X, U)) (𝒰 : X.OpenCover) [Finite 𝒰.I₀] (h : ∀ i : 𝒰.I₀, IsNilpotent ((𝒰.f i).app U s)) : IsNilpotent s\n\nIf a global section is nilpotent on each member of a finite open cover, then f is nilpotent.\n\n文件：AlgebraicGeometry/Cover/Open\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/Open",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/Open.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isNilpotent_of_isNilpotent_cover",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {U : X.Opens} (s : Γ(X, U)) (𝒰 : X.OpenCover) [Finite 𝒰.I₀] (h : ∀ i : 𝒰.I₀, IsNilpotent ((𝒰.f i).app U s)) : IsNilpotent s",
   "file": "Mathlib/AlgebraicGeometry/Cover/Open.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-smooth-of-smooth-fibertospecresiduefield",
  "latex": "Smooth f",
  "name": "Smooth.of_smooth_fiberToSpecResidueField",
  "en": "AlgebraicGeometry.Smooth.of_smooth_fiberToSpecResidueField",
  "importance": 0.8,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is locally of finite presentation, flat and has smooth fibers, then f is smooth.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Smooth.of_smooth_fiberToSpecResidueField\n类型签名：[LocallyOfFinitePresentation f] [Flat f] (h : ∀ y, Smooth (f.fiberToSpecResidueField y)) : Smooth f\n\nIf f : X ⟶ Y is locally of finite presentation, flat and has smooth fibers, then f is smooth.\n\n文件：AlgebraicGeometry/Morphisms/SmoothFiber\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/SmoothFiber",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/SmoothFiber.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Smooth.of_smooth_fiberToSpecResidueField",
   "kind": "lemma",
   "signature": "[LocallyOfFinitePresentation f] [Flat f] (h : ∀ y, Smooth (f.fiberToSpecResidueField y)) : Smooth f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/SmoothFiber.lean"
  }
 },
 {
  "id": "ml-stalkwiseiszariskilocalattarget-of-respectsiso",
  "latex": "IsZariskiLocalAtTarget (stalkwise P)",
  "name": "stalkwiseIsZariskiLocalAtTarget_of_respectsIso",
  "en": "stalkwiseIsZariskiLocalAtTarget_of_respectsIso",
  "importance": 0.72,
  "family": "scheme",
  "summary": "If P respects isos, then stalkwise P is local at the target.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：stalkwiseIsZariskiLocalAtTarget_of_respectsIso\n类型签名：(hP : RingHom.RespectsIso P) : IsZariskiLocalAtTarget (stalkwise P)\n\nIf P respects isos, then stalkwise P is local at the target.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "stalkwiseIsZariskiLocalAtTarget_of_respectsIso",
   "kind": "lemma",
   "signature": "(hP : RingHom.RespectsIso P) : IsZariskiLocalAtTarget (stalkwise P)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-targetaffinelocally-affineand-iff",
  "latex": "Y.Opens, IsAffineOpen U → Q (f.app U).hom",
  "name": "targetAffineLocally_affineAnd_iff'",
  "en": "AlgebraicGeometry.targetAffineLocally_affineAnd_iff'",
  "importance": 0.8,
  "family": "scheme",
  "summary": "Variant of targetAffineLocally_affineAnd_iff where IsAffineHom is bundled.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.targetAffineLocally_affineAnd_iff'\n类型签名：(hQi : RingHom.RespectsIso Q) {X Y : Scheme.{u}} (f : X ⟶ Y) : targetAffineLocally (affineAnd Q) f ↔ IsAffineHom f ∧ ∀ U : Y.Opens, IsAffineOpen U → Q (f.app U).hom\n\nVariant of targetAffineLocally_affineAnd_iff where IsAffineHom is bundled.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.targetAffineLocally_affineAnd_iff'",
   "kind": "lemma",
   "signature": "(hQi : RingHom.RespectsIso Q) {X Y : Scheme.{u}} (f : X ⟶ Y) : targetAffineLocally (affineAnd Q) f ↔ IsAffineHom f ∧ ∀ U : Y.Opens, IsAffineOpen U → Q (f.app U).hom",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-stalkwise-iszariskilocalatsource-of-respectsiso",
  "latex": "IsZariskiLocalAtSource (stalkwise P)",
  "name": "stalkwise_isZariskiLocalAtSource_of_respectsIso",
  "en": "stalkwise_isZariskiLocalAtSource_of_respectsIso",
  "importance": 0.72,
  "family": "scheme",
  "summary": "If P respects isos, then stalkwise P is local at the source.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：stalkwise_isZariskiLocalAtSource_of_respectsIso\n类型签名：(hP : RingHom.RespectsIso P) : IsZariskiLocalAtSource (stalkwise P)\n\nIf P respects isos, then stalkwise P is local at the source.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "stalkwise_isZariskiLocalAtSource_of_respectsIso",
   "kind": "lemma",
   "signature": "(hP : RingHom.RespectsIso P) : IsZariskiLocalAtSource (stalkwise P)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isclosedimmersion-of-surjective-of-i-90f45d2c",
  "latex": "IsClosedImmersion f",
  "name": "of_surjective_of_isAffine",
  "en": "AlgebraicGeometry.IsClosedImmersion.of_surjective_of_isAffine",
  "importance": 0.82,
  "family": "scheme",
  "summary": "Any morphism between affine schemes that is surjective on global sections is a closed immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsClosedImmersion.of_surjective_of_isAffine\n类型签名：{X Y : Scheme} [IsAffine X] [IsAffine Y] (f : X ⟶ Y) (h : Function.Surjective (f.appTop)) : IsClosedImmersion f\n\nAny morphism between affine schemes that is surjective on global sections is a closed immersion.\n\n文件：AlgebraicGeometry/Morphisms/ClosedImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/ClosedImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsClosedImmersion.of_surjective_of_isAffine",
   "kind": "lemma",
   "signature": "{X Y : Scheme} [IsAffine X] [IsAffine Y] (f : X ⟶ Y) (h : Function.Surjective (f.appTop)) : IsClosedImmersion f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/ClosedImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opencover-isopencover-opensrange",
  "latex": "IsOpenCover fun i ↦ (𝒰.f i).opensRange",
  "name": "OpenCover.isOpenCover_opensRange",
  "en": "AlgebraicGeometry.Scheme.OpenCover.isOpenCover_opensRange",
  "importance": 0.77,
  "family": "scheme",
  "summary": "The ranges of the maps in a scheme-theoretic open cover are a topological open cover.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.OpenCover.isOpenCover_opensRange\n类型签名：{X : Scheme.{u}} (𝒰 : OpenCover.{v} X) : IsOpenCover fun i ↦ (𝒰.f i).opensRange\n\nThe ranges of the maps in a scheme-theoretic open cover are a topological open cover.\n\n文件：AlgebraicGeometry/Cover/Open\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Cover/Open",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Cover/Open.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.OpenCover.isOpenCover_opensRange",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} (𝒰 : OpenCover.{v} X) : IsOpenCover fun i ↦ (𝒰.f i).opensRange",
   "file": "Mathlib/AlgebraicGeometry/Cover/Open.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-islocaliso-le-of-iszariskilocalatsource",
  "latex": "@IsLocalIso ≤ P",
  "name": "le_of_isZariskiLocalAtSource",
  "en": "AlgebraicGeometry.IsLocalIso.le_of_isZariskiLocalAtSource",
  "importance": 0.8,
  "family": "scheme",
  "summary": "IsLocalIso is weaker than every source-Zariski-local property containing identities.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsLocalIso.le_of_isZariskiLocalAtSource\n类型签名：(P : MorphismProperty Scheme.{u}) [P.ContainsIdentities] [IsZariskiLocalAtSource P] : @IsLocalIso ≤ P\n\nIsLocalIso is weaker than every source-Zariski-local property containing identities.\n\n文件：AlgebraicGeometry/Morphisms/LocalIso\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/LocalIso",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsLocalIso.le_of_isZariskiLocalAtSource",
   "kind": "lemma",
   "signature": "(P : MorphismProperty Scheme.{u}) [P.ContainsIdentities] [IsZariskiLocalAtSource P] : @IsLocalIso ≤ P",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-compactspace-of-universallyclosed",
  "latex": "CompactSpace X",
  "name": "compactSpace_of_universallyClosed",
  "en": "AlgebraicGeometry.compactSpace_of_universallyClosed",
  "importance": 0.74,
  "family": "scheme",
  "summary": "If X is universally closed over a field, then X is quasi-compact.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.compactSpace_of_universallyClosed\n类型签名：{K} [Field K] (f : X ⟶ Spec (.of K)) [UniversallyClosed f] : CompactSpace X\n\nIf X is universally closed over a field, then X is quasi-compact.\n\n文件：AlgebraicGeometry/Morphisms/UniversallyClosed\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/UniversallyClosed",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/UniversallyClosed.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.compactSpace_of_universallyClosed",
   "kind": "lemma",
   "signature": "{K} [Field K] (f : X ⟶ Spec (.of K)) [UniversallyClosed f] : CompactSpace X",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/UniversallyClosed.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-flat-isquotientmap-of-surjective",
  "latex": "Topology.IsQuotientMap f",
  "name": "isQuotientMap_of_surjective",
  "en": "AlgebraicGeometry.Flat.isQuotientMap_of_surjective",
  "importance": 0.77,
  "family": "scheme",
  "summary": "A surjective, quasi-compact, flat morphism is a quotient map.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Flat.isQuotientMap_of_surjective\n类型签名：{X Y : Scheme.{u}} (f : X ⟶ Y) [Flat f] [QuasiCompact f] [Surjective f] : Topology.IsQuotientMap f\n\nA surjective, quasi-compact, flat morphism is a quotient map.\n\n文件：AlgebraicGeometry/Morphisms/Flat\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Flat",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Flat.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Flat.isQuotientMap_of_surjective",
   "kind": "lemma",
   "signature": "{X Y : Scheme.{u}} (f : X ⟶ Y) [Flat f] [QuasiCompact f] [Surjective f] : Topology.IsQuotientMap f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Flat.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--59e2398d",
  "latex": "X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, U)",
  "name": "Scheme.zeroLocus_eq_univ_iff_subset_nilradical_of_isCompact",
  "en": "AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical_of_isCompact",
  "importance": 0.85,
  "family": "scheme",
  "summary": "The zero locus of a set of sections over a compact open of a scheme is X if and only if s is contained in the nilradical of Γ(X, U).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical_of_isCompact\n类型签名：{X : Scheme.{u}} {U : X.Opens} (hU : IsCompact (U : Set X)) (s : Set Γ(X, U)) : X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, U)\n\nThe zero locus of a set of sections over a compact open of a scheme is X if and only if s is contained in the nilradical of Γ(X, U).\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.zeroLocus_eq_univ_iff_subset_nilradical_of_isCompact",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {U : X.Opens} (hU : IsCompact (U : Set X)) (s : Set Γ(X, U)) : X.zeroLocus s = Set.univ ↔ s ⊆ nilradical Γ(X, U)",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-smoothofrelativedimension-smooth",
  "latex": "Smooth f",
  "name": "SmoothOfRelativeDimension.smooth",
  "en": "AlgebraicGeometry.SmoothOfRelativeDimension.smooth",
  "importance": 0.68,
  "family": "scheme",
  "summary": "If f is smooth of any relative dimension, it is smooth.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.SmoothOfRelativeDimension.smooth\n类型签名：[SmoothOfRelativeDimension n f] : Smooth f\n\nIf f is smooth of any relative dimension, it is smooth.\n\n文件：AlgebraicGeometry/Morphisms/Smooth\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Smooth",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Smooth.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.SmoothOfRelativeDimension.smooth",
   "kind": "lemma",
   "signature": "[SmoothOfRelativeDimension n f] : Smooth f",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Smooth.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isopenimmersion-specmap-iff-of-surje-04525d8e",
  "latex": "IsOpenImmersion (Spec.map f) ↔ ∃ e, IsIdempotentElem e ∧ RingHom.ker f.hom = Ideal.span {e}",
  "name": "isOpenImmersion_SpecMap_iff_of_surjective",
  "en": "AlgebraicGeometry.isOpenImmersion_SpecMap_iff_of_surjective",
  "importance": 0.81,
  "family": "scheme",
  "summary": "Spec (R ⧸ I) ⟶ Spec R is an open immersion iff I is generated by an idempotent.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isOpenImmersion_SpecMap_iff_of_surjective\n类型签名：{R S : CommRingCat} (f : R ⟶ S) (hf : Function.Surjective f.hom) : IsOpenImmersion (Spec.map f) ↔ ∃ e, IsIdempotentElem e ∧ RingHom.ker f.hom = Ideal.span {e}\n\nSpec (R ⧸ I) ⟶ Spec R is an open immersion iff I is generated by an idempotent.\n\n文件：AlgebraicGeometry/Morphisms/OpenImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/OpenImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/OpenImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isOpenImmersion_SpecMap_iff_of_surjective",
   "kind": "lemma",
   "signature": "{R S : CommRingCat} (f : R ⟶ S) (hf : Function.Surjective f.hom) : IsOpenImmersion (Spec.map f) ↔ ∃ e, IsIdempotentElem e ∧ RingHom.ker f.hom = Ideal.span {e}",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/OpenImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-islocaliso-eq-sourcelocalclosure-iso-828062e5",
  "latex": "@IsLocalIso = sourceLocalClosure IsOpenImmersion IsOpenImmersion",
  "name": "eq_sourceLocalClosure_isOpenImmersion",
  "en": "AlgebraicGeometry.IsLocalIso.eq_sourceLocalClosure_isOpenImmersion",
  "importance": 0.75,
  "family": "scheme",
  "summary": "A local isomorphism of schemes is a morphism that is (Zariski-)source-locally an open immersion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsLocalIso.eq_sourceLocalClosure_isOpenImmersion\n类型签名：: @IsLocalIso = sourceLocalClosure IsOpenImmersion IsOpenImmersion\n\nA local isomorphism of schemes is a morphism that is (Zariski-)source-locally an open immersion.\n\n文件：AlgebraicGeometry/Morphisms/LocalIso\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/LocalIso",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsLocalIso.eq_sourceLocalClosure_isOpenImmersion",
   "kind": "lemma",
   "signature": ": @IsLocalIso = sourceLocalClosure IsOpenImmersion IsOpenImmersion",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/LocalIso.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq--cec20ad7",
  "latex": "IsNilpotent f ↔ X.basicOpen f = ⊥",
  "name": "Scheme.isNilpotent_iff_basicOpen_eq_bot_of_isCompact",
  "en": "AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot_of_isCompact",
  "importance": 0.83,
  "family": "scheme",
  "summary": "A section over a compact open of a scheme is nilpotent if and only if its associated basic open is empty.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot_of_isCompact\n类型签名：{X : Scheme.{u}} {U : X.Opens} (hU : IsCompact (U : Set X)) (f : Γ(X, U)) : IsNilpotent f ↔ X.basicOpen f = ⊥\n\nA section over a compact open of a scheme is nilpotent if and only if its associated basic open is empty.\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isNilpotent_iff_basicOpen_eq_bot_of_isCompact",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {U : X.Opens} (hU : IsCompact (U : Set X)) (f : Γ(X, U)) : IsNilpotent f ↔ X.basicOpen f = ⊥",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-affineand-isstableunderbasechange",
  "latex": ".IsStableUnderBaseChange",
  "name": "affineAnd_isStableUnderBaseChange",
  "en": "AlgebraicGeometry.affineAnd_isStableUnderBaseChange",
  "importance": 0.78,
  "family": "scheme",
  "summary": "If P is stable under base change, so is affineAnd P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.affineAnd_isStableUnderBaseChange\n类型签名：(hQi : RingHom.RespectsIso Q) (hQb : RingHom.IsStableUnderBaseChange Q) : (affineAnd Q).IsStableUnderBaseChange\n\nIf P is stable under base change, so is affineAnd P.\n\n文件：AlgebraicGeometry/Morphisms/AffineAnd\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/AffineAnd",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.affineAnd_isStableUnderBaseChange",
   "kind": "lemma",
   "signature": "(hQi : RingHom.RespectsIso Q) (hQb : RingHom.IsStableUnderBaseChange Q) : (affineAnd Q).IsStableUnderBaseChange",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/AffineAnd.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-pow-mul-eq-zero-of-res-basico-b6c4c302",
  "latex": "ℕ, f ^ n * x = 0",
  "name": "exists_pow_mul_eq_zero_of_res_basicOpen_eq_zero_of_isCompact",
  "en": "AlgebraicGeometry.exists_pow_mul_eq_zero_of_res_basicOpen_eq_zero_of_isCompact",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If x : Γ(X, U) is zero on D(f) for some f : Γ(X, U), and U is quasi-compact, then f ^ n * x = 0 for some n.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_pow_mul_eq_zero_of_res_basicOpen_eq_zero_of_isCompact\n类型签名：(X : Scheme.{u}) {U : X.Opens} (hU : IsCompact U.1) (x f : Γ(X, U)) (H : x |_ (X.basicOpen f) = 0) : ∃ n : ℕ, f ^ n * x = 0\n\nIf x : Γ(X, U) is zero on D(f) for some f : Γ(X, U), and U is quasi-compact, then f ^ n * x = 0 for some n.\n\n文件：AlgebraicGeometry/Morphisms/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_pow_mul_eq_zero_of_res_basicOpen_eq_zero_of_isCompact",
   "kind": "theorem",
   "signature": "(X : Scheme.{u}) {U : X.Opens} (hU : IsCompact U.1) (x f : Γ(X, U)) (H : x |_ (X.basicOpen f) = 0) : ∃ n : ℕ, f ^ n * x = 0",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-finrank-eq-one-of-isiso",
  "latex": "finrank f = 1",
  "name": "Scheme.Hom.finrank_eq_one_of_isIso",
  "en": "AlgebraicGeometry.Scheme.Hom.finrank_eq_one_of_isIso",
  "importance": 0.65,
  "family": "scheme",
  "summary": "The rank of an isomorphism is 1.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.finrank_eq_one_of_isIso\n类型签名：(f : X ⟶ Y) [IsIso f] : finrank f = 1\n\nThe rank of an isomorphism is 1.\n\n文件：AlgebraicGeometry/Morphisms/FlatRank\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/FlatRank",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/FlatRank.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.finrank_eq_one_of_isIso",
   "kind": "lemma",
   "signature": "(f : X ⟶ Y) [IsIso f] : finrank f = 1",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/FlatRank.lean"
  }
 },
 {
  "id": "ml-affinetargetmorphismproperty-isstableunderbasechange-o-d450810a",
  "latex": "P.IsStableUnderBaseChange",
  "name": "isStableUnderBaseChange_of_isStableUnderBaseChangeOnAffine_of_isZariskiLocalAtTarget",
  "en": "AffineTargetMorphismProperty.isStableUnderBaseChange_of_isStableUnderBaseChangeOnAffine_of_isZariskiLocalAtTarget",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If P is local at the target, to show that P is stable under base change, it suffices to check this for base change along a morphism of affine schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AffineTargetMorphismProperty.isStableUnderBaseChange_of_isStableUnderBaseChangeOnAffine_of_isZariskiLocalAtTarget\n类型签名：(P : MorphismProperty Scheme) [IsZariskiLocalAtTarget P] (hP₂ : (of P).IsStableUnderBaseChange) : P.IsStableUnderBaseChange\n\nIf P is local at the target, to show that P is stable under base change, it suffices to check this for base change along a morphism of affine schemes.\n\n文件：AlgebraicGeometry/Morphisms/Constructors\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Morphisms/Constructors",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean",
  "formal": true,
  "lean": {
   "full": "AffineTargetMorphismProperty.isStableUnderBaseChange_of_isStableUnderBaseChangeOnAffine_of_isZariskiLocalAtTarget",
   "kind": "lemma",
   "signature": "(P : MorphismProperty Scheme) [IsZariskiLocalAtTarget P] (hP₂ : (of P).IsStableUnderBaseChange) : P.IsStableUnderBaseChange",
   "file": "Mathlib/AlgebraicGeometry/Morphisms/Constructors.lean"
  }
 },
 {
  "id": "ml-isunit",
  "latex": "IsUnit W.Δ",
  "name": "isUnit_",
  "en": "isUnit_",
  "importance": 0.7,
  "family": "scheme",
  "summary": "WeierstrassCurve.IsElliptic is a typeclass which asserts that a Weierstrass curve is an elliptic curve: that its discriminant is a unit. Note that this definition is only mathemati",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isUnit_\n类型签名：Δ : IsUnit W.Δ\n\nWeierstrassCurve.IsElliptic is a typeclass which asserts that a Weierstrass curve is an elliptic curve: that its discriminant is a unit. Note that this definition is only mathematically accurate for certain rings whose Picard group has trivial 12-torsion, such as a field or a PID.\n\n文件：AlgebraicGeometry/EllipticCurve/Weierstrass\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Weierstrass",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean",
  "formal": true,
  "lean": {
   "full": "isUnit_",
   "kind": "lemma",
   "signature": "Δ : IsUnit W.Δ",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean"
  }
 },
 {
  "id": "ml-comap-id-eq-map",
  "latex": "U V fun _ hpV => leOfHom iVU hpV) = ((structureSheaf R).1.map iVU.op).hom",
  "name": "comap_id_eq_map",
  "en": "comap_id_eq_map",
  "importance": 0.86,
  "family": "scheme",
  "summary": "For an inclusion i : V ⟶ U between open sets of the prime spectrum of R, the comap of the identity from OO_X(U) to OO_X(V) equals as the restriction map of the structure sheaf. Thi",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：comap_id_eq_map\n类型签名：(U V : Opens (PrimeSpectrum.Top R)) (iVU : V ⟶ U) : (comap (RingHom.id R) U V fun _ hpV => leOfHom iVU hpV) = ((structureSheaf R).1.map iVU.op).hom\n\nFor an inclusion i : V ⟶ U between open sets of the prime spectrum of R, the comap of the identity from OO_X(U) to OO_X(V) equals as the restriction map of the structure sheaf. This is a generalization of the fact that, for fixed U, the comap of the identity from OO_X(U) to OO_X(U) is the identity.\n\n文件：AlgebraicGeometry/StructureSheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/StructureSheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/StructureSheaf.lean",
  "formal": true,
  "lean": {
   "full": "comap_id_eq_map",
   "kind": "theorem",
   "signature": "(U V : Opens (PrimeSpectrum.Top R)) (iVU : V ⟶ U) : (comap (RingHom.id R) U V fun _ hpV => leOfHom iVU hpV) = ((structureSheaf R).1.map iVU.op).hom",
   "file": "Mathlib/AlgebraicGeometry/StructureSheaf.lean"
  }
 },
 {
  "id": "ml-exists-preimage-pullback",
  "latex": "↑(pullback f g), pullback.fst f g z = x ∧ pullback.snd f g z = y",
  "name": "exists_preimage_pullback",
  "en": "exists_preimage_pullback",
  "importance": 0.85,
  "family": "scheme",
  "summary": "If f : X ⟶ S and g : Y ⟶ S are morphisms of schemes and x : X and y : Y are points such that f x = g y, then there exists z : X ×[S] Y lying above x and y. In other words, the map ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：exists_preimage_pullback\n类型签名：(x : X) (y : Y) (h : f x = g y) : ∃ z : ↑(pullback f g), pullback.fst f g z = x ∧ pullback.snd f g z = y\n\nIf f : X ⟶ S and g : Y ⟶ S are morphisms of schemes and x : X and y : Y are points such that f x = g y, then there exists z : X ×[S] Y lying above x and y. In other words, the map from the underlying topological space of X ×[S] Y to the fiber product of the underlying topological spaces of X and Y over S is surjective.\n\n文件：AlgebraicGeometry/PullbackCarrier\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/PullbackCarrier",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/PullbackCarrier.lean",
  "formal": true,
  "lean": {
   "full": "exists_preimage_pullback",
   "kind": "lemma",
   "signature": "(x : X) (y : Y) (h : f x = g y) : ∃ z : ↑(pullback f g), pullback.fst f g z = x ∧ pullback.snd f g z = y",
   "file": "Mathlib/AlgebraicGeometry/PullbackCarrier.lean"
  }
 },
 {
  "id": "ml-pullbackspeciso-inv-snd",
  "latex": ".inv ≫ pullback.snd _ _ = Spec.map (ofHom (R",
  "name": "pullbackSpecIso_inv_snd",
  "en": "pullbackSpecIso_inv_snd",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The composition of the inverse of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the second projection is ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：pullbackSpecIso_inv_snd\n类型签名：: (pullbackSpecIso R S T).inv ≫ pullback.snd _ _ = Spec.map (ofHom (R\n\nThe composition of the inverse of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the second projection is the morphism Spec (S ⊗[R] T) ⟶ Spec T obtained by applying Spec.map to the ring morphism t ↦ 1 ⊗ₜ[R] t.\n\n文件：AlgebraicGeometry/Pullbacks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Pullbacks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Pullbacks.lean",
  "formal": true,
  "lean": {
   "full": "pullbackSpecIso_inv_snd",
   "kind": "lemma",
   "signature": ": (pullbackSpecIso R S T).inv ≫ pullback.snd _ _ = Spec.map (ofHom (R",
   "file": "Mathlib/AlgebraicGeometry/Pullbacks.lean"
  }
 },
 {
  "id": "ml-pullbackspeciso-inv-fst",
  "latex": ".inv ≫ pullback.fst _ _ = Spec.map (ofHom includeLeftRingHom)",
  "name": "pullbackSpecIso_inv_fst",
  "en": "pullbackSpecIso_inv_fst",
  "importance": 0.82,
  "family": "scheme",
  "summary": "The composition of the inverse of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the first projection is t",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：pullbackSpecIso_inv_fst\n类型签名：: (pullbackSpecIso R S T).inv ≫ pullback.fst _ _ = Spec.map (ofHom includeLeftRingHom)\n\nThe composition of the inverse of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the first projection is the morphism Spec (S ⊗[R] T) ⟶ Spec S obtained by applying Spec.map to the ring morphism s ↦ s ⊗ₜ[R] 1.\n\n文件：AlgebraicGeometry/Pullbacks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Pullbacks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Pullbacks.lean",
  "formal": true,
  "lean": {
   "full": "pullbackSpecIso_inv_fst",
   "kind": "lemma",
   "signature": ": (pullbackSpecIso R S T).inv ≫ pullback.fst _ _ = Spec.map (ofHom includeLeftRingHom)",
   "file": "Mathlib/AlgebraicGeometry/Pullbacks.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-reduce-to-affine-global",
  "latex": "(_ : X.Opens), Prop) {X : Scheme} (U : X.Opens) (h₁ : ∀ (X : Scheme) (U : X.Opens), (∀ x : U, ∃ (V : _) (_ : x.1 ∈ V) (_ : V ⟶ U), P V) → P  …",
  "name": "reduce_to_affine_global",
  "en": "AlgebraicGeometry.reduce_to_affine_global",
  "importance": 0.86,
  "family": "scheme",
  "summary": "To show that a statement P holds for all open subsets of all schemes, it suffices to show that 1. In any scheme X, if P holds for an open cover of U, then P holds for U. 2. For an ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.reduce_to_affine_global\n类型签名：(P : ∀ {X : Scheme} (_ : X.Opens), Prop) {X : Scheme} (U : X.Opens) (h₁ : ∀ (X : Scheme) (U : X.Opens), (∀ x : U, ∃ (V : _) (_ : x.1 ∈ V) (_ : V ⟶ U), P V) → P U) (h₂ : ∀ (X Y) (f : X ⟶ Y) [IsOpenImmersion f], ∃ (U : X.Opens) (V : Y.Opens), U = ⊤ ∧ V = f.opensRange ∧ (P U → P V)) (h₃ : ∀ R : CommRingCat, P (X\n\nTo show that a statement P holds for all open subsets of all schemes, it suffices to show that 1. In any scheme X, if P holds for an open cover of U, then P holds for U. 2. For an open immersion f : X ⟶ Y, if P holds for the entire space of X, then P holds for the image of f. 3. P holds for the entire space of an affine scheme.\n\n文件：AlgebraicGeometry/Properties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Properties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Properties.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.reduce_to_affine_global",
   "kind": "theorem",
   "signature": "(P : ∀ {X : Scheme} (_ : X.Opens), Prop) {X : Scheme} (U : X.Opens) (h₁ : ∀ (X : Scheme) (U : X.Opens), (∀ x : U, ∃ (V : _) (_ : x.1 ∈ V) (_ : V ⟶ U), P V) → P U) (h₂ : ∀ (X Y) (f : X ⟶ Y) [IsOpenImmersion f], ∃ (U : X.Opens) (V : Y.Opens), U = ⊤ ∧ V = f.opensRange ∧ (P U → P V)) (h₃ : ∀ R : CommRingCat, P (X",
   "file": "Mathlib/AlgebraicGeometry/Properties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-ofarrows",
  "latex": "Sieve.ofArrows _ c.ι.app ∈ Scheme.zariskiTopology c.pt",
  "name": "ofArrows_",
  "en": "AlgebraicGeometry.ofArrows_",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let F be a locally directed diagram of open immersions, i.e., a diagram of schemes for which whenever xᵢ ∈ Fᵢ and xⱼ ∈ Fⱼ map to the same xₖ ∈ Fₖ, there exists some xₗ ∈ Fₗ that ma",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.ofArrows_\n类型签名：ι_mem_zariskiTopology_of_isColimit {J : Type*} [Category J] (F : J ⥤ Scheme.{u}) [∀ {i j : J} (f : i ⟶ j), IsOpenImmersion (F.map f)] [(F.comp Scheme.forget).IsLocallyDirected] [Quiver.IsThin J] [Small.{u} J] (c : Cocone F) (hc : IsColimit c) : Sieve.ofArrows _ c.ι.app ∈ Scheme.zariskiTopology c.pt\n\nLet F be a locally directed diagram of open immersions, i.e., a diagram of schemes for which whenever xᵢ ∈ Fᵢ and xⱼ ∈ Fⱼ map to the same xₖ ∈ Fₖ, there exists some xₗ ∈ Fₗ that maps to xᵢ and xⱼ (e.g, the diagram indexing a coproduct). Then the colimit inclusions are a Zariski covering.\n\n文件：AlgebraicGeometry/Sites/BigZariski\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/BigZariski",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/BigZariski.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.ofArrows_",
   "kind": "lemma",
   "signature": "ι_mem_zariskiTopology_of_isColimit {J : Type*} [Category J] (F : J ⥤ Scheme.{u}) [∀ {i j : J} (f : i ⟶ j), IsOpenImmersion (F.map f)] [(F.comp Scheme.forget).IsLocallyDirected] [Quiver.IsThin J] [Small.{u} J] (c : Cocone F) (hc : IsColimit c) : Sieve.ofArrows _ c.ι.app ∈ Scheme.zariskiTopology c.pt",
   "file": "Mathlib/AlgebraicGeometry/Sites/BigZariski.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-spread-out-of-isgerminjective",
  "latex": "∃ (U : X.Opens) (hxU : x ∈ U) (f : U.toScheme ⟶ Y), φ = U.fromSpecStalkOfMem x hxU ≫ f ∧ f ≫ sY = U.ι ≫ sX",
  "name": "spread_out_of_isGermInjective'",
  "en": "AlgebraicGeometry.spread_out_of_isGermInjective'",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Given S-schemes X Y, a point x : X, and an S-morphism φ : Spec 𝒪_{X, x} ⟶ Y, we may spread it out to an S-morphism f : U ⟶ Y provided that Y is locally of finite type over S and X",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.spread_out_of_isGermInjective'\n类型签名：[LocallyOfFiniteType sY] {x : X} [X.IsGermInjectiveAt x] (φ : Spec (X.presheaf.stalk x) ⟶ Y) (h : φ ≫ sY = X.fromSpecStalk x ≫ sX) : ∃ (U : X.Opens) (hxU : x ∈ U) (f : U.toScheme ⟶ Y), φ = U.fromSpecStalkOfMem x hxU ≫ f ∧ f ≫ sY = U.ι ≫ sX\n\nGiven S-schemes X Y, a point x : X, and an S-morphism φ : Spec 𝒪_{X, x} ⟶ Y, we may spread it out to an S-morphism f : U ⟶ Y provided that Y is locally of finite type over S and X is \"germ-injective\" at x (e.g. when it's integral or locally Noetherian). TODO: The condition on X is unnecessary when Y is locally of finite presentation.\n\n文件：AlgebraicGeometry/SpreadingOut\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/SpreadingOut",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/SpreadingOut.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.spread_out_of_isGermInjective'",
   "kind": "lemma",
   "signature": "[LocallyOfFiniteType sY] {x : X} [X.IsGermInjectiveAt x] (φ : Spec (X.presheaf.stalk x) ⟶ Y) (h : φ ≫ sY = X.fromSpecStalk x ≫ sX) : ∃ (U : X.Opens) (hxU : x ∈ U) (f : U.toScheme ⟶ Y), φ = U.fromSpecStalkOfMem x hxU ≫ f ∧ f ≫ sY = U.ι ≫ sX",
   "file": "Mathlib/AlgebraicGeometry/SpreadingOut.lean"
  }
 },
 {
  "id": "ml-pullbackspeciso-hom-snd",
  "latex": ".hom ≫ Spec.map (ofHom (toRingHom includeRight)) = pullback.snd _ _",
  "name": "pullbackSpecIso_hom_snd",
  "en": "pullbackSpecIso_hom_snd",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The composition of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the morphism Spec (S ⊗[R] T) ⟶ Spec T ob",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：pullbackSpecIso_hom_snd\n类型签名：: (pullbackSpecIso R S T).hom ≫ Spec.map (ofHom (toRingHom includeRight)) = pullback.snd _ _\n\nThe composition of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the morphism Spec (S ⊗[R] T) ⟶ Spec T obtained by applying Spec.map to the ring morphism t ↦ 1 ⊗ₜ[R] t is the second projection.\n\n文件：AlgebraicGeometry/Pullbacks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Pullbacks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Pullbacks.lean",
  "formal": true,
  "lean": {
   "full": "pullbackSpecIso_hom_snd",
   "kind": "lemma",
   "signature": ": (pullbackSpecIso R S T).hom ≫ Spec.map (ofHom (toRingHom includeRight)) = pullback.snd _ _",
   "file": "Mathlib/AlgebraicGeometry/Pullbacks.lean"
  }
 },
 {
  "id": "ml-pullbackspeciso-hom-fst",
  "latex": ".hom ≫ Spec.map (ofHom includeLeftRingHom) = pullback.fst _ _",
  "name": "pullbackSpecIso_hom_fst",
  "en": "pullbackSpecIso_hom_fst",
  "importance": 0.82,
  "family": "scheme",
  "summary": "The composition of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the morphism Spec (S ⊗[R] T) ⟶ Spec S ob",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：pullbackSpecIso_hom_fst\n类型签名：: (pullbackSpecIso R S T).hom ≫ Spec.map (ofHom includeLeftRingHom) = pullback.fst _ _\n\nThe composition of the isomorphism pullbackSpecIso R S T (from the pullback of Spec S ⟶ Spec R and Spec T ⟶ Spec R to Spec (S ⊗[R] T)) with the morphism Spec (S ⊗[R] T) ⟶ Spec S obtained by applying Spec.map to the ring morphism s ↦ s ⊗ₜ[R] 1 is the first projection.\n\n文件：AlgebraicGeometry/Pullbacks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Pullbacks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Pullbacks.lean",
  "formal": true,
  "lean": {
   "full": "pullbackSpecIso_hom_fst",
   "kind": "lemma",
   "signature": ": (pullbackSpecIso R S T).hom ≫ Spec.map (ofHom includeLeftRingHom) = pullback.fst _ _",
   "file": "Mathlib/AlgebraicGeometry/Pullbacks.lean"
  }
 },
 {
  "id": "ml-comap-id",
  "latex": "U V fun p hpV =>",
  "name": "comap_id",
  "en": "comap_id",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The comap of the identity is the identity. In this variant of the lemma, two open subsets U and V are given as arguments, together with a proof that U = V. This is useful when U an",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：comap_id\n类型签名：{U V : Opens (PrimeSpectrum.Top R)} (hUV : U = V) : (comap (RingHom.id R) U V fun p hpV =>\n\nThe comap of the identity is the identity. In this variant of the lemma, two open subsets U and V are given as arguments, together with a proof that U = V. This is useful when U and V are not definitionally equal.\n\n文件：AlgebraicGeometry/StructureSheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/StructureSheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/StructureSheaf.lean",
  "formal": true,
  "lean": {
   "full": "comap_id",
   "kind": "theorem",
   "signature": "{U V : Opens (PrimeSpectrum.Top R)} (hUV : U = V) : (comap (RingHom.id R) U V fun p hpV =>",
   "file": "Mathlib/AlgebraicGeometry/StructureSheaf.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-pullback-lift-comp",
  "latex": "pullback.lift (pullback.snd _ _) (pullback.fst _ _ ≫ p2 𝒰 f g) (",
  "name": "lift_comp_",
  "en": "AlgebraicGeometry.Scheme.Pullback.lift_comp_",
  "importance": 0.82,
  "family": "scheme",
  "summary": "We show that the map W ×[X] Uᵢ ⟶ Uᵢ ×[Z] Y ⟶ W is the first projection, where the first map is given by the lift of W ×[X] Uᵢ ⟶ Uᵢ and W ×[X] Uᵢ ⟶ W ⟶ Y. It suffices to show that t",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Pullback.lift_comp_\n类型签名：ι (i : 𝒰.I₀) : pullback.lift (pullback.snd _ _) (pullback.fst _ _ ≫ p2 𝒰 f g) (\n\nWe show that the map W ×[X] Uᵢ ⟶ Uᵢ ×[Z] Y ⟶ W is the first projection, where the first map is given by the lift of W ×[X] Uᵢ ⟶ Uᵢ and W ×[X] Uᵢ ⟶ W ⟶ Y. It suffices to show that the two map agrees when restricted onto Uⱼ ×[Z] Y. In this case, both maps factor through V j i via pullback_fst_ι_to_V\n\n文件：AlgebraicGeometry/Pullbacks\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Pullbacks",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Pullbacks.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Pullback.lift_comp_",
   "kind": "theorem",
   "signature": "ι (i : 𝒰.I₀) : pullback.lift (pullback.snd _ _) (pullback.fst _ _ ≫ p2 𝒰 f g) (",
   "file": "Mathlib/AlgebraicGeometry/Pullbacks.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-den-duplication-eq",
  "latex": "4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = (2 * y + W'.a₁ * x + W'.a₃) ^ 2",
  "name": "den_duplication_eq",
  "en": "WeierstrassCurve.den_duplication_eq",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The polynomial on the left is the denominator of the rational expression for the x-coordinate of twice the point (x, y). This is the same as W'.Ψ₂Sq evaluated at x. The statement c",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.den_duplication_eq\n类型签名：{x y : R} (h : W'.Equation x y) : 4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = (2 * y + W'.a₁ * x + W'.a₃) ^ 2\n\nThe polynomial on the left is the denominator of the rational expression for the x-coordinate of twice the point (x, y). This is the same as W'.Ψ₂Sq evaluated at x. The statement corresponds to W'.C_Ψ₂Sq after evaluation (but note that C_Ψ₂Sq is not available in this file).\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Formula\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Formula",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.den_duplication_eq",
   "kind": "lemma",
   "signature": "{x y : R} (h : W'.Equation x y) : 4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = (2 * y + W'.a₁ * x + W'.a₃) ^ 2",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-eq-of-specmap-comp-eq-of-isaffineopen",
  "latex": "{R S : CommRingCat} {X : Scheme} (φ : R ⟶ S) (hφ : Function.Injective φ) {f g : Spec R ⟶ X} (U : X.Opens) (hU : IsAffineOpen U) (hUf : f ⁻¹ᵁ …",
  "name": "eq_of_SpecMap_comp_eq_of_isAffineOpen",
  "en": "AlgebraicGeometry.eq_of_SpecMap_comp_eq_of_isAffineOpen",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If φ is a monomorphism in CommRingCat, it is not in general true that Spec φ is epi. (ℤ ⊆ ℤ[1/2] but Spec ℤ[1/2] ⟶ Spec ℤ is not epi, since epi open immersions are isomorphisms) Bu",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.eq_of_SpecMap_comp_eq_of_isAffineOpen\n类型签名：{R S : CommRingCat} {X : Scheme} (φ : R ⟶ S) (hφ : Function.Injective φ) {f g : Spec R ⟶ X} (U : X.Opens) (hU : IsAffineOpen U) (hUf : f ⁻¹ᵁ U = ⊤) (hUg : g ⁻¹ᵁ U = ⊤) (H : Spec.map φ ≫ f = Spec.map φ ≫ g) : f = g\n\nIf φ is a monomorphism in CommRingCat, it is not in general true that Spec φ is epi. (ℤ ⊆ ℤ[1/2] but Spec ℤ[1/2] ⟶ Spec ℤ is not epi, since epi open immersions are isomorphisms) But if the range of f g : Spec R ⟶ X are contained in an common affine open U, one can still cancel Spec.map φ ≫ f = Spec.map φ ≫ g to get f = g.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.eq_of_SpecMap_comp_eq_of_isAffineOpen",
   "kind": "lemma",
   "signature": "{R S : CommRingCat} {X : Scheme} (φ : R ⟶ S) (hφ : Function.Injective φ) {f g : Spec R ⟶ X} (U : X.Opens) (hU : IsAffineOpen U) (hUf : f ⁻¹ᵁ U = ⊤) (hUg : g ⁻¹ᵁ U = ⊤) (H : Spec.map φ ≫ f = Spec.map φ ≫ g) : f = g",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-hasgoodreduction-or-hasmultiplicativereduction-or-hasa-7b2988d5",
  "latex": "W.HasGoodReduction R ∨ W.HasMultiplicativeReduction R ∨ W.HasAdditiveReduction R",
  "name": "hasGoodReduction_or_hasMultiplicativeReduction_or_hasAdditiveReduction",
  "en": "hasGoodReduction_or_hasMultiplicativeReduction_or_hasAdditiveReduction",
  "importance": 0.84,
  "family": "scheme",
  "summary": "A minimal Weierstrass equation has split multiplicative reduction if and only if the polynomial c₄ T ^ 2 + a₁ c₄ T - (54 b₆ - 3 b₂ b₄ + a₂ c₄) splits in the residue field. To see h",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：hasGoodReduction_or_hasMultiplicativeReduction_or_hasAdditiveReduction\n类型签名：[IsMinimal R W] : W.HasGoodReduction R ∨ W.HasMultiplicativeReduction R ∨ W.HasAdditiveReduction R\n\nA minimal Weierstrass equation has split multiplicative reduction if and only if the polynomial c₄ T ^ 2 + a₁ c₄ T - (54 b₆ - 3 b₂ b₄ + a₂ c₄) splits in the residue field. To see how this expression arises, note that the node (x₀, y₀) has second order Taylor expansion (Y - y₀)^2 + a_1(X - x₀)(Y - y₀) - (3x₀ + a_2)(X - x₀)^2 where x₀ = (18 b₆ - b₂ b₄) / c₄.\n\n文件：AlgebraicGeometry/EllipticCurve/Reduction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Reduction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean",
  "formal": true,
  "lean": {
   "full": "hasGoodReduction_or_hasMultiplicativeReduction_or_hasAdditiveReduction",
   "kind": "theorem",
   "signature": "[IsMinimal R W] : W.HasGoodReduction R ∨ W.HasMultiplicativeReduction R ∨ W.HasAdditiveReduction R",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean"
  }
 },
 {
  "id": "ml-scheme-exists",
  "latex": "∃ (i : I) (g : D.obj i ⟶ X), c.π.app i ≫ g = a ∧ g ≫ f = t.app i",
  "name": "Scheme.exists_",
  "en": "Scheme.exists_",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Given a cofiltered diagram of qcqs schemes Dᵢ over S with affine transition maps. If X is locally of finite presentation over S, then any S-morphism lim Dᵢ ⟶ X factors through some",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Scheme.exists_\n类型签名：π_app_comp_eq_of_locallyOfFinitePresentation [IsCofiltered I] [LocallyOfFinitePresentation f] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, CompactSpace (D.obj i)] [∀ i, QuasiSeparatedSpace (D.obj i)] (a : c.pt ⟶ X) (ha : c.π ≫ t = (Functor.const _).map (a ≫ f)) : ∃ (i : I) (g : D.obj i ⟶ X), c.π.app i ≫ g = a ∧ g ≫ f = t.app i\n\nGiven a cofiltered diagram of qcqs schemes Dᵢ over S with affine transition maps. If X is locally of finite presentation over S, then any S-morphism lim Dᵢ ⟶ X factors through some lim Dᵢ ⟶ Dⱼ ⟶ X for some j.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "Scheme.exists_",
   "kind": "lemma",
   "signature": "π_app_comp_eq_of_locallyOfFinitePresentation [IsCofiltered I] [LocallyOfFinitePresentation f] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, CompactSpace (D.obj i)] [∀ i, QuasiSeparatedSpace (D.obj i)] (a : c.pt ⟶ X) (ha : c.π ≫ t = (Functor.const _).map (a ≫ f)) : ∃ (i : I) (g : D.obj i ⟶ X), c.π.app i ≫ g = a ∧ g ≫ f = t.app i",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-spread-out-unique-of-isgerminjective",
  "latex": "∃ (U : X.Opens), x ∈ U ∧ U.ι ≫ f = U.ι ≫ g",
  "name": "spread_out_unique_of_isGermInjective",
  "en": "AlgebraicGeometry.spread_out_unique_of_isGermInjective",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let x : X and f g : X ⟶ Y be two morphisms such that f x = g x. If f and g agree on the stalk of x, then they agree on an open neighborhood of x, provided X is \"germ-injective\" at ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.spread_out_unique_of_isGermInjective\n类型签名：{x : X} [X.IsGermInjectiveAt x] (f g : X ⟶ Y) (e : f x = g x) (H : f.stalkMap x = Y.presheaf.stalkSpecializes (Inseparable.of_eq e.symm).specializes ≫ g.stalkMap x) : ∃ (U : X.Opens), x ∈ U ∧ U.ι ≫ f = U.ι ≫ g\n\nLet x : X and f g : X ⟶ Y be two morphisms such that f x = g x. If f and g agree on the stalk of x, then they agree on an open neighborhood of x, provided X is \"germ-injective\" at x (e.g. when it's integral or locally Noetherian). TODO: The condition on X is unnecessary when Y is locally of finite type.\n\n文件：AlgebraicGeometry/SpreadingOut\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/SpreadingOut",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/SpreadingOut.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.spread_out_unique_of_isGermInjective",
   "kind": "lemma",
   "signature": "{x : X} [X.IsGermInjectiveAt x] (f g : X ⟶ Y) (e : f x = g x) (H : f.stalkMap x = Y.presheaf.stalkSpecializes (Inseparable.of_eq e.symm).specializes ≫ g.stalkMap x) : ∃ (U : X.Opens), x ∈ U ∧ U.ι ≫ f = U.ι ≫ g",
   "file": "Mathlib/AlgebraicGeometry/SpreadingOut.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-ext-of-apply-eq",
  "latex": "{f g : X ⟶ Y} (i : Y ⟶ Spec ↧K) (S : Set X) (hS : IsLocallyClosed S) (hS' : Dense S) (H : ∀ x ∈ S, IsClosed {x} → f x = g x) (H' : f ≫ i = g …",
  "name": "ext_of_apply_eq",
  "en": "AlgebraicGeometry.ext_of_apply_eq",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let X and Y be locally of finite type K-schemes with K algebraically closed and Y separated over K. Suppose X is reduced, then two K-morphisms f g : X ⟶ Y are equal if they are equ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.ext_of_apply_eq\n类型签名：{f g : X ⟶ Y} (i : Y ⟶ Spec ↧K) [IsSeparated i] [LocallyOfFiniteType i] [IsReduced X] [LocallyOfFiniteType (f ≫ i)] (S : Set X) (hS : IsLocallyClosed S) (hS' : Dense S) (H : ∀ x ∈ S, IsClosed {x} → f x = g x) (H' : f ≫ i = g ≫ i) : f = g\n\nLet X and Y be locally of finite type K-schemes with K algebraically closed and Y separated over K. Suppose X is reduced, then two K-morphisms f g : X ⟶ Y are equal if they are equal on the closed points of a dense locally closed subset of X.\n\n文件：AlgebraicGeometry/AlgClosed/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AlgClosed/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AlgClosed/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.ext_of_apply_eq",
   "kind": "lemma",
   "signature": "{f g : X ⟶ Y} (i : Y ⟶ Spec ↧K) [IsSeparated i] [LocallyOfFiniteType i] [IsReduced X] [LocallyOfFiniteType (f ≫ i)] (S : Set X) (hS : IsLocallyClosed S) (hS' : Dense S) (H : ∀ x ∈ S, IsClosed {x} → f x = g x) (H' : f ≫ i = g ≫ i) : f = g",
   "file": "Mathlib/AlgebraicGeometry/AlgClosed/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-lift-of-germinjective",
  "latex": "∃ (V : X.Opens) (hxV : x ∈ V) (φ' : A ⟶ Γ(X, V)) (i : V ≤ U), IsAffineOpen V ∧ φ = φ' ≫ X.presheaf.germ V x hxV ∧ φRX ≫ X.presheaf.map i.hom …",
  "name": "exists_lift_of_germInjective",
  "en": "AlgebraicGeometry.exists_lift_of_germInjective",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Suppose X is a scheme, x : X such that the germ map at x is (locally) injective, and U is a neighborhood of x. Given a commutative diagram of CommRingCat R ⟶ Γ(X, U) ↓ ↓ A ⟶ 𝒪_{X,",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_lift_of_germInjective\n类型签名：{x : X} [X.IsGermInjectiveAt x] {U : X.Opens} (hxU : x ∈ U) (φ : A ⟶ X.presheaf.stalk x) (φRA : R ⟶ A) (φRX : R ⟶ Γ(X, U)) (hφRA : RingHom.FiniteType φRA.hom) (e : φRA ≫ φ = φRX ≫ X.presheaf.germ U x hxU) : ∃ (V : X.Opens) (hxV : x ∈ V) (φ' : A ⟶ Γ(X, V)) (i : V ≤ U), IsAffineOpen V ∧ φ = φ' ≫ X.presheaf.germ V x hxV ∧ φRX ≫ X.presheaf.map i.hom.op = φRA ≫ φ'\n\nSuppose X is a scheme, x : X such that the germ map at x is (locally) injective, and U is a neighborhood of x. Given a commutative diagram of CommRingCat R ⟶ Γ(X, U) ↓ ↓ A ⟶ 𝒪_{X, x} such that R is of finite type over A, we may lift A ⟶ 𝒪_{X, x} to some A ⟶ Γ(X, V).\n\n文件：AlgebraicGeometry/SpreadingOut\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/SpreadingOut",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/SpreadingOut.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_lift_of_germInjective",
   "kind": "lemma",
   "signature": "{x : X} [X.IsGermInjectiveAt x] {U : X.Opens} (hxU : x ∈ U) (φ : A ⟶ X.presheaf.stalk x) (φRA : R ⟶ A) (φRX : R ⟶ Γ(X, U)) (hφRA : RingHom.FiniteType φRA.hom) (e : φRA ≫ φ = φRX ≫ X.presheaf.germ U x hxU) : ∃ (V : X.Opens) (hxV : x ∈ V) (φ' : A ⟶ Γ(X, V)) (i : V ≤ U), IsAffineOpen V ∧ φ = φ' ≫ X.presheaf.germ V x hxV ∧ φRX ≫ X.presheaf.map i.hom.op = φRA ≫ φ'",
   "file": "Mathlib/AlgebraicGeometry/SpreadingOut.lean"
  }
 },
 {
  "id": "ml-triplet-exists-preimage",
  "latex": "↑(pullback f g), pullback.fst f g t = T.x ∧ pullback.snd f g t = T.y",
  "name": "Triplet.exists_preimage",
  "en": "Triplet.exists_preimage",
  "importance": 0.84,
  "family": "scheme",
  "summary": "Given a triple (x, y, s) with f x = s = f y there exists t : X ×[S] Y above x and ỳ. For the unpacked version without Triplet, see AlgebraicGeometry.Scheme.Pullback.exists_preimage",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Triplet.exists_preimage\n类型签名：(T : Triplet f g) : ∃ t : ↑(pullback f g), pullback.fst f g t = T.x ∧ pullback.snd f g t = T.y\n\nGiven a triple (x, y, s) with f x = s = f y there exists t : X ×[S] Y above x and ỳ. For the unpacked version without Triplet, see AlgebraicGeometry.Scheme.Pullback.exists_preimage.\n\n文件：AlgebraicGeometry/PullbackCarrier\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/PullbackCarrier",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/PullbackCarrier.lean",
  "formal": true,
  "lean": {
   "full": "Triplet.exists_preimage",
   "kind": "lemma",
   "signature": "(T : Triplet f g) : ∃ t : ↑(pullback f g), pullback.fst f g t = T.x ∧ pullback.snd f g t = T.y",
   "file": "Mathlib/AlgebraicGeometry/PullbackCarrier.lean"
  }
 },
 {
  "id": "ml-hom-residuedegree-eq-finrank",
  "latex": "{X : Scheme.{u}} {k : Type u} (f : X ⟶ Spec (.of k)) (x : X) : letI",
  "name": "Hom.residueDegree_eq_finrank",
  "en": "Hom.residueDegree_eq_finrank",
  "importance": 0.81,
  "family": "scheme",
  "summary": "The residue degree of a morphism f : X ⟶ Spec k to the spectrum of a field at a point x equals the degree of κ(x) as a k-algebra, via the canonical k-algebra structure on κ(x) indu",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Hom.residueDegree_eq_finrank\n类型签名：{X : Scheme.{u}} {k : Type u} [Field k] (f : X ⟶ Spec (.of k)) (x : X) : letI\n\nThe residue degree of a morphism f : X ⟶ Spec k to the spectrum of a field at a point x equals the degree of κ(x) as a k-algebra, via the canonical k-algebra structure on κ(x) induced by f.\n\n文件：AlgebraicGeometry/ResidueField\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ResidueField",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ResidueField.lean",
  "formal": true,
  "lean": {
   "full": "Hom.residueDegree_eq_finrank",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {k : Type u} [Field k] (f : X ⟶ Spec (.of k)) (x : X) : letI",
   "file": "Mathlib/AlgebraicGeometry/ResidueField.lean"
  }
 },
 {
  "id": "ml-exists-variablechange-of-j-eq",
  "latex": "VariableChange F, C • E = E'",
  "name": "exists_variableChange_of_j_eq",
  "en": "exists_variableChange_of_j_eq",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If there are two elliptic curves with the same j-invariants defined over a separably closed field, then there exists a change of variables over that field which change one curve in",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：exists_variableChange_of_j_eq\n类型签名：(heq : E.j = E'.j) : ∃ C : VariableChange F, C • E = E'\n\nIf there are two elliptic curves with the same j-invariants defined over a separably closed field, then there exists a change of variables over that field which change one curve into another.\n\n文件：AlgebraicGeometry/EllipticCurve/IsomOfJ\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/IsomOfJ",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/IsomOfJ.lean",
  "formal": true,
  "lean": {
   "full": "exists_variableChange_of_j_eq",
   "kind": "theorem",
   "signature": "(heq : E.j = E'.j) : ∃ C : VariableChange F, C • E = E'",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/IsomOfJ.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isnoetherianring-of-away",
  "latex": "IsNoetherianRing R",
  "name": "isNoetherianRing_of_away",
  "en": "AlgebraicGeometry.isNoetherianRing_of_away",
  "importance": 0.71,
  "family": "scheme",
  "summary": "Let R be a ring, and f i a finite collection of elements of R generating the unit ideal. If the localization of R at each f i is Noetherian, so is R. We follow the proof given in [",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isNoetherianRing_of_away\n类型签名：: IsNoetherianRing R\n\nLet R be a ring, and f i a finite collection of elements of R generating the unit ideal. If the localization of R at each f i is Noetherian, so is R. We follow the proof given in [Har77], Proposition II.3.2\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isNoetherianRing_of_away",
   "kind": "theorem",
   "signature": ": IsNoetherianRing R",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-localrepresentability-isrepre-cd27b340",
  "latex": "F.1.IsRepresentable",
  "name": "isRepresentable",
  "en": "AlgebraicGeometry.Scheme.LocalRepresentability.isRepresentable",
  "importance": 0.72,
  "family": "scheme",
  "summary": "Suppose * F is a Type u-valued sheaf on Sch with respect to the Zariski topology * X : ι → Sch is a family of schemes * f : Π i, yoneda.obj (X i) ⟶ F is a family of relatively repr",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.LocalRepresentability.isRepresentable\n类型签名：: F.1.IsRepresentable\n\nSuppose * F is a Type u-valued sheaf on Sch with respect to the Zariski topology * X : ι → Sch is a family of schemes * f : Π i, yoneda.obj (X i) ⟶ F is a family of relatively representable open immersions * f is jointly surjective Then F is representable.\n\n文件：AlgebraicGeometry/Sites/Representability\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Representability",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Representability.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.LocalRepresentability.isRepresentable",
   "kind": "theorem",
   "signature": ": F.1.IsRepresentable",
   "file": "Mathlib/AlgebraicGeometry/Sites/Representability.lean"
  }
 },
 {
  "id": "ml-coe",
  "latex": "W.Δ' = W.Δ",
  "name": "coe_",
  "en": "coe_",
  "importance": 0.67,
  "family": "scheme",
  "summary": "The discriminant Δ' of an elliptic curve is equal to the discriminant Δ of it as a Weierstrass curve.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：coe_\n类型签名：Δ' : W.Δ' = W.Δ\n\nThe discriminant Δ' of an elliptic curve is equal to the discriminant Δ of it as a Weierstrass curve.\n\n文件：AlgebraicGeometry/EllipticCurve/Weierstrass\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Weierstrass",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean",
  "formal": true,
  "lean": {
   "full": "coe_",
   "kind": "lemma",
   "signature": "Δ' : W.Δ' = W.Δ",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-normalization-hom-ext",
  "latex": "(f₁ f₂ : f.normalization ⟶ T) (g : T ⟶ Y) (H₁ : f.toNormalization ≫ f₁ = f.toNormalization ≫ f₂) (hf₁ : f₁ ≫ g = f.fromNormalization) (hf₂ : …",
  "name": "normalization.hom_ext",
  "en": "AlgebraicGeometry.Scheme.Hom.normalization.hom_ext",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The uniqueness part of the universal property for relative normalization. Suppose f : X ⟶ Y is qcqs and factors into X ⟶ T ⟶ Y with T ⟶ Y affine, then there is at most one map f.no",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.normalization.hom_ext\n类型签名：(f₁ f₂ : f.normalization ⟶ T) (g : T ⟶ Y) [IsAffineHom g] (H₁ : f.toNormalization ≫ f₁ = f.toNormalization ≫ f₂) (hf₁ : f₁ ≫ g = f.fromNormalization) (hf₂ : f₂ ≫ g = f.fromNormalization) : f₁ = f₂\n\nThe uniqueness part of the universal property for relative normalization. Suppose f : X ⟶ Y is qcqs and factors into X ⟶ T ⟶ Y with T ⟶ Y affine, then there is at most one map f.normalization ⟶ T that commutes with them.\n\n文件：AlgebraicGeometry/Normalization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Normalization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Normalization.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.normalization.hom_ext",
   "kind": "lemma",
   "signature": "(f₁ f₂ : f.normalization ⟶ T) (g : T ⟶ Y) [IsAffineHom g] (H₁ : f.toNormalization ≫ f₁ = f.toNormalization ≫ f₂) (hf₁ : f₁ ≫ g = f.fromNormalization) (hf₂ : f₂ ≫ g = f.fromNormalization) : f₁ = f₂",
   "file": "Mathlib/AlgebraicGeometry/Normalization.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-map-eq-top",
  "latex": "∃ (j : I) (fji : j ⟶ i), D.map fji ⁻¹ᵁ U = ⊤",
  "name": "exists_map_eq_top",
  "en": "AlgebraicGeometry.exists_map_eq_top",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Let { Dᵢ } be a cofiltered diagram of compact schemes with affine transition maps. If U ⊆ Dⱼ contains the image of limᵢ Dᵢ ⟶ Dⱼ, then it contains the image of some Dₖ ⟶ Dⱼ.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_map_eq_top\n类型签名：[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, CompactSpace (D.obj i)] {i : I} (U : (D.obj i).Opens) (hU : c.π.app i ⁻¹ᵁ U = ⊤) : ∃ (j : I) (fji : j ⟶ i), D.map fji ⁻¹ᵁ U = ⊤\n\nLet { Dᵢ } be a cofiltered diagram of compact schemes with affine transition maps. If U ⊆ Dⱼ contains the image of limᵢ Dᵢ ⟶ Dⱼ, then it contains the image of some Dₖ ⟶ Dⱼ.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_map_eq_top",
   "kind": "lemma",
   "signature": "[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, CompactSpace (D.obj i)] {i : I} (U : (D.obj i).Opens) (hU : c.π.app i ⁻¹ᵁ U = ⊤) : ∃ (j : I) (fji : j ⟶ i), D.map fji ⁻¹ᵁ U = ⊤",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-tospec",
  "latex": "X.toSpecΓ ⁻¹' PrimeSpectrum.zeroLocus s = X.zeroLocus s",
  "name": "toSpec",
  "en": "AlgebraicGeometry.Scheme.toSpec",
  "importance": 0.84,
  "family": "scheme",
  "summary": "On a scheme X, the preimage of the zero locus of the prime spectrum of Γ(X, ⊤) under X.toSpecΓ : X ⟶ Spec Γ(X, ⊤) agrees with the associated zero locus on X.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.toSpec\n类型签名：Γ_preimage_zeroLocus (s : Set Γ(X, ⊤)) : X.toSpecΓ ⁻¹' PrimeSpectrum.zeroLocus s = X.zeroLocus s\n\nOn a scheme X, the preimage of the zero locus of the prime spectrum of Γ(X, ⊤) under X.toSpecΓ : X ⟶ Spec Γ(X, ⊤) agrees with the associated zero locus on X.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.toSpec",
   "kind": "lemma",
   "signature": "Γ_preimage_zeroLocus (s : Set Γ(X, ⊤)) : X.toSpecΓ ⁻¹' PrimeSpectrum.zeroLocus s = X.zeroLocus s",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-den-duplication-ne-zero-or-num-duplic-63f2f3d3",
  "latex": "4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆ ≠ 0 ∨ x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈ ≠ 0",
  "name": "den_duplication_ne_zero_or_num_duplication_ne_zero",
  "en": "WeierstrassCurve.den_duplication_ne_zero_or_num_duplication_ne_zero",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If (x, y) is a nonsingular point on W in affine coordinates, then the x-coordinate of its double is well-defined as a point on the projective line: in the corresponding rational ex",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.den_duplication_ne_zero_or_num_duplication_ne_zero\n类型签名：{x y : F} (h : W.Nonsingular x y) : 4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆ ≠ 0 ∨ x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈ ≠ 0\n\nIf (x, y) is a nonsingular point on W in affine coordinates, then the x-coordinate of its double is well-defined as a point on the projective line: in the corresponding rational expression, at least one of the numerator and denominator does not vanish.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Formula\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Formula",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.den_duplication_ne_zero_or_num_duplication_ne_zero",
   "kind": "lemma",
   "signature": "{x y : F} (h : W.Nonsingular x y) : 4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆ ≠ 0 ∨ x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈ ≠ 0",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-map-basechange",
  "latex": "map f (baseChange F K P) = baseChange F L P",
  "name": "map_baseChange",
  "en": "WeierstrassCurve.Point.map_baseChange",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The group homomorphism on nonsingular points induced by the base change from F to K, where W is defined over a subring of a ring S, and F and K are field extensions of S.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.map_baseChange\n类型签名：[Algebra F K] [IsScalarTower R F K] [Algebra F L] [IsScalarTower R F L] (f : K →ₐ[F] L) (P : (W'⁄F).Point) : map f (baseChange F K P) = baseChange F L P\n\nThe group homomorphism on nonsingular points induced by the base change from F to K, where W is defined over a subring of a ring S, and F and K are field extensions of S.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.map_baseChange",
   "kind": "lemma",
   "signature": "[Algebra F K] [IsScalarTower R F K] [Algebra F L] [IsScalarTower R F L] (f : K →ₐ[F] L) (P : (W'⁄F).Point) : map f (baseChange F K P) = baseChange F L P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-variablechange-integral-of-u-integral",
  "latex": "VariableChange R, CR.baseChange K = CK",
  "name": "variableChange_integral_of_u_integral",
  "en": "variableChange_integral_of_u_integral",
  "importance": 0.76,
  "family": "scheme",
  "summary": "A variable change over the fraction field between integral Weierstrass equations descends to the base ring if its u coefficient descends to a unit of the base ring.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：variableChange_integral_of_u_integral\n类型签名：: ∃ CR : VariableChange R, CR.baseChange K = CK\n\nA variable change over the fraction field between integral Weierstrass equations descends to the base ring if its u coefficient descends to a unit of the base ring.\n\n文件：AlgebraicGeometry/EllipticCurve/Reduction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Reduction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean",
  "formal": true,
  "lean": {
   "full": "variableChange_integral_of_u_integral",
   "kind": "theorem",
   "signature": ": ∃ CR : VariableChange R, CR.baseChange K = CK",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean"
  }
 },
 {
  "id": "ml-proj-away",
  "latex": "awayι ℬ (f s) (f.2 hs) hi ≫ map f hf = Spec.map (CommRingCat.ofHom (Away.map f s)) ≫ awayι 𝒜 s hs hi",
  "name": "away",
  "en": "Proj.away",
  "importance": 0.81,
  "family": "scheme",
  "summary": "The following square commutes: Proj ℬ ⟶ Proj 𝒜₁ ^ ^ | | Spec A₂[f(s)⁻¹]₀ ⟶ Spec A₁[s⁻¹]₀",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Proj.away\n类型签名：ι_comp_map {i : ℕ} (hi : 0 < i) (s : A) (hs : s ∈ 𝒜 i) : awayι ℬ (f s) (f.2 hs) hi ≫ map f hf = Spec.map (CommRingCat.ofHom (Away.map f s)) ≫ awayι 𝒜 s hs hi\n\nThe following square commutes: Proj ℬ ⟶ Proj 𝒜₁ ^ ^ | | Spec A₂[f(s)⁻¹]₀ ⟶ Spec A₁[s⁻¹]₀\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Functor\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Functor",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Functor.lean",
  "formal": true,
  "lean": {
   "full": "Proj.away",
   "kind": "theorem",
   "signature": "ι_comp_map {i : ℕ} (hi : 0 < i) (s : A) (hs : s ∈ 𝒜 i) : awayι ℬ (f s) (f.2 hs) hi ≫ map f hf = Spec.map (CommRingCat.ofHom (Away.map f s)) ≫ awayι 𝒜 s hs hi",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Functor.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-variablechange-def",
  "latex": "C • W = { a₁",
  "name": "variableChange_def",
  "en": "WeierstrassCurve.variableChange_def",
  "importance": 0.7,
  "family": "scheme",
  "summary": "The Weierstrass curve over R induced by an admissible linear change of variables (X, Y) ↦ (u²X + r, u³Y + u²sX + t) for some u in Rˣ and some r, s, t in R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.variableChange_def\n类型签名：: C • W = { a₁\n\nThe Weierstrass curve over R induced by an admissible linear change of variables (X, Y) ↦ (u²X + r, u³Y + u²sX + t) for some u in Rˣ and some r, s, t in R.\n\n文件：AlgebraicGeometry/EllipticCurve/VariableChange\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/VariableChange",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.variableChange_def",
   "kind": "lemma",
   "signature": ": C • W = { a₁",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-coe-image",
  "latex": "f ''ᵁ U = f '' U",
  "name": "coe_image",
  "en": "AlgebraicGeometry.Scheme.Hom.coe_image",
  "importance": 0.73,
  "family": "scheme",
  "summary": "f ''ᵁ U is notation for the image (as an open set) of U under an open immersion f. The preferred name in lemmas is image and it should be treated as an infix.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.coe_image\n类型签名：{U : X.Opens} : f ''ᵁ U = f '' U\n\nf ''ᵁ U is notation for the image (as an open set) of U under an open immersion f. The preferred name in lemmas is image and it should be treated as an infix.\n\n文件：AlgebraicGeometry/OpenImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/OpenImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/OpenImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.coe_image",
   "kind": "lemma",
   "signature": "{U : X.Opens} : f ''ᵁ U = f '' U",
   "file": "Mathlib/AlgebraicGeometry/OpenImmersion.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-isroot-twotorsionpolynomial-iff",
  "latex": "W.Nonsingular x y, some x y h + some x y h = 0",
  "name": "isRoot_twoTorsionPolynomial_iff",
  "en": "WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_iff",
  "importance": 0.86,
  "family": "scheme",
  "summary": "x is a root of the 2-torsion polynomial of a Weierstrass curve of characteristic different from 2 with nonzero discriminant if and only if it is the X-coordinate of a nonzero affin",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_iff\n类型签名：(h2 : NeZero (2 : F)) (hΔ : W.Δ ≠ 0) (x : F) : W.twoTorsionPolynomial.toPoly.IsRoot x ↔ ∃ y, ∃ h : W.Nonsingular x y, some x y h + some x y h = 0\n\nx is a root of the 2-torsion polynomial of a Weierstrass curve of characteristic different from 2 with nonzero discriminant if and only if it is the X-coordinate of a nonzero affine 2-torsion point.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_iff",
   "kind": "theorem",
   "signature": "(h2 : NeZero (2 : F)) (hΔ : W.Δ ≠ 0) (x : F) : W.twoTorsionPolynomial.toPoly.IsRoot x ↔ ∃ y, ∃ h : W.Nonsingular x y, some x y h + some x y h = 0",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-essimage-hopfspec",
  "latex": ".essImage G ↔ IsAffine G.X.left",
  "name": "essImage_hopfSpec",
  "en": "essImage_hopfSpec",
  "importance": 0.76,
  "family": "scheme",
  "summary": "The essential image of R-Hopf algebras under Spec is precisely affine group schemes over Spec R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：essImage_hopfSpec\n类型签名：{G : Grp <| Over <| Spec R} : (hopfSpec R).essImage G ↔ IsAffine G.X.left\n\nThe essential image of R-Hopf algebras under Spec is precisely affine group schemes over Spec R.\n\n文件：AlgebraicGeometry/Group/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Group/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Group/Affine.lean",
  "formal": true,
  "lean": {
   "full": "essImage_hopfSpec",
   "kind": "lemma",
   "signature": "{G : Grp <| Over <| Spec R} : (hopfSpec R).essImage G ↔ IsAffine G.X.left",
   "file": "Mathlib/AlgebraicGeometry/Group/Affine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-ispullback-tospec",
  "latex": "IsPullback f X.toSpecΓ Y.toSpecΓ (Spec.map f.appTop)",
  "name": "isPullback_toSpec",
  "en": "AlgebraicGeometry.Scheme.isPullback_toSpec",
  "importance": 0.86,
  "family": "scheme",
  "summary": "If f : X ⟶ Y is an affine morphism between quasi-affine schemes, then it is the pullback of Spec Γ(X, ⊤) ⟶ Spec Γ(Y, ⊤) along the open immersion Y ⟶ Spec Γ(Y, ⊤).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isPullback_toSpec\n类型签名：Γ_toSpecΓ (f : X ⟶ Y) [IsAffineHom f] [Y.IsQuasiAffine] : IsPullback f X.toSpecΓ Y.toSpecΓ (Spec.map f.appTop)\n\nIf f : X ⟶ Y is an affine morphism between quasi-affine schemes, then it is the pullback of Spec Γ(X, ⊤) ⟶ Spec Γ(Y, ⊤) along the open immersion Y ⟶ Spec Γ(Y, ⊤).\n\n文件：AlgebraicGeometry/QuasiAffine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/QuasiAffine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/QuasiAffine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isPullback_toSpec",
   "kind": "lemma",
   "signature": "Γ_toSpecΓ (f : X ⟶ Y) [IsAffineHom f] [Y.IsQuasiAffine] : IsPullback f X.toSpecΓ Y.toSpecΓ (Spec.map f.appTop)",
   "file": "Mathlib/AlgebraicGeometry/QuasiAffine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-grothendiecktopology-eq-inf",
  "latex": "grothendieckTopology P = (jointlySurjectivePretopology ⊓ P.pretopology).toGrothendieck",
  "name": "grothendieckTopology_eq_inf",
  "en": "AlgebraicGeometry.Scheme.grothendieckTopology_eq_inf",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The Grothendieck topology defined by P-covers agrees with the Grothendieck topology induced by the intersection of the pretopology of surjective families with the pretopology defin",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.grothendieckTopology_eq_inf\n类型签名：: grothendieckTopology P = (jointlySurjectivePretopology ⊓ P.pretopology).toGrothendieck\n\nThe Grothendieck topology defined by P-covers agrees with the Grothendieck topology induced by the intersection of the pretopology of surjective families with the pretopology defined by P.\n\n文件：AlgebraicGeometry/Sites/Pretopology\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Pretopology",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Pretopology.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.grothendieckTopology_eq_inf",
   "kind": "lemma",
   "signature": ": grothendieckTopology P = (jointlySurjectivePretopology ⊓ P.pretopology).toGrothendieck",
   "file": "Mathlib/AlgebraicGeometry/Sites/Pretopology.lean"
  }
 },
 {
  "id": "ml-hom-residuefieldisooffield-inv-residuefieldmap",
  "latex": ").inv ≫ f.residueFieldMap x = (Scheme.ΓSpecIso (.of k)).inv ≫ f.appTop ≫ X.Γevaluation x",
  "name": "Hom.residueFieldIsoOfField_inv_residueFieldMap",
  "en": "Hom.residueFieldIsoOfField_inv_residueFieldMap",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The k-algebra structure on κ(x) induced by a morphism f : X ⟶ Spec k factors through f.residueFieldMap x, after identifying κ(f x) with k via Spec.residueFieldIsoOfField.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Hom.residueFieldIsoOfField_inv_residueFieldMap\n类型签名：{X : Scheme.{u}} {k : Type u} [Field k] (f : X ⟶ Spec (.of k)) (x : X) : (Spec.residueFieldIsoOfField (f x)).inv ≫ f.residueFieldMap x = (Scheme.ΓSpecIso (.of k)).inv ≫ f.appTop ≫ X.Γevaluation x\n\nThe k-algebra structure on κ(x) induced by a morphism f : X ⟶ Spec k factors through f.residueFieldMap x, after identifying κ(f x) with k via Spec.residueFieldIsoOfField.\n\n文件：AlgebraicGeometry/ResidueField\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ResidueField",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ResidueField.lean",
  "formal": true,
  "lean": {
   "full": "Hom.residueFieldIsoOfField_inv_residueFieldMap",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} {k : Type u} [Field k] (f : X ⟶ Spec (.of k)) (x : X) : (Spec.residueFieldIsoOfField (f x)).inv ≫ f.residueFieldMap x = (Scheme.ΓSpecIso (.of k)).inv ≫ f.appTop ≫ X.Γevaluation x",
   "file": "Mathlib/AlgebraicGeometry/ResidueField.lean"
  }
 },
 {
  "id": "ml-essimage-bialgspec",
  "latex": ".essImage G ↔ IsAffine G.X.left",
  "name": "essImage_bialgSpec",
  "en": "essImage_bialgSpec",
  "importance": 0.76,
  "family": "scheme",
  "summary": "The essential image of R-bialgebras under Spec is precisely affine monoid schemes over Spec R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：essImage_bialgSpec\n类型签名：{G : Mon <| Over <| Spec R} : (bialgSpec R).essImage G ↔ IsAffine G.X.left\n\nThe essential image of R-bialgebras under Spec is precisely affine monoid schemes over Spec R.\n\n文件：AlgebraicGeometry/Group/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Group/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Group/Affine.lean",
  "formal": true,
  "lean": {
   "full": "essImage_bialgSpec",
   "kind": "lemma",
   "signature": "{G : Mon <| Over <| Spec R} : (bialgSpec R).essImage G ↔ IsAffine G.X.left",
   "file": "Mathlib/AlgebraicGeometry/Group/Affine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-mem-of-isclosed-of-nonempty",
  "latex": "∃ (s : c.pt), ∀ i, c.π.app i s ∈ Z i",
  "name": "exists_mem_of_isClosed_of_nonempty",
  "en": "AlgebraicGeometry.exists_mem_of_isClosed_of_nonempty",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Suppose we have a cofiltered diagram of schemes whose transition maps are affine. The limit of a family of compatible nonempty quasicompact closed sets in the diagram is also nonem",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_mem_of_isClosed_of_nonempty\n类型签名：[IsCofilteredOrEmpty I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] (Z : ∀ (i : I), Set (D.obj i)) (hZc : ∀ (i : I), IsClosed (Z i)) (hZne : ∀ i, (Z i).Nonempty) (hZcpt : ∀ i, IsCompact (Z i)) (hmapsTo : ∀ {i i' : I} (f : i ⟶ i'), Set.MapsTo (D.map f) (Z i) (Z i')) : ∃ (s : c.pt), ∀ i, c.π.app i s ∈ Z i\n\nSuppose we have a cofiltered diagram of schemes whose transition maps are affine. The limit of a family of compatible nonempty quasicompact closed sets in the diagram is also nonempty.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_mem_of_isClosed_of_nonempty",
   "kind": "lemma",
   "signature": "[IsCofilteredOrEmpty I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] (Z : ∀ (i : I), Set (D.obj i)) (hZc : ∀ (i : I), IsClosed (Z i)) (hZne : ∀ i, (Z i).Nonempty) (hZcpt : ∀ i, IsCompact (Z i)) (hmapsTo : ∀ {i i' : I} (f : i ⟶ i'), Set.MapsTo (D.map f) (Z i) (Z i')) : ∃ (s : c.pt), ∀ i, c.π.app i s ∈ Z i",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-islocallynoetherian-iff-of-isup-eq-top",
  "latex": "IsLocallyNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)",
  "name": "isLocallyNoetherian_iff_of_iSup_eq_top",
  "en": "isLocallyNoetherian_iff_of_iSup_eq_top",
  "importance": 0.86,
  "family": "scheme",
  "summary": "A scheme is locally Noetherian if and only if it is covered by affine opens whose sections are Noetherian rings. See [Har77], Proposition II.3.2.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isLocallyNoetherian_iff_of_iSup_eq_top\n类型签名：{ι} {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) : IsLocallyNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)\n\nA scheme is locally Noetherian if and only if it is covered by affine opens whose sections are Noetherian rings. See [Har77], Proposition II.3.2.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "isLocallyNoetherian_iff_of_iSup_eq_top",
   "kind": "theorem",
   "signature": "{ι} {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) : IsLocallyNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-scheme-exists-isopencover-and-isaffine",
  "latex": "∃ (i : I) (s : Finset J) (V : s → (D.obj i).Opens), IsOpenCover V ∧ ∀ j, IsAffineOpen (V j) ∧ U j = c.π.app i ⁻¹ᵁ (V j)",
  "name": "Scheme.exists_isOpenCover_and_isAffine",
  "en": "Scheme.exists_isOpenCover_and_isAffine",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Suppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. Then any affine open cover of lim Xᵢ comes from a finite level.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Scheme.exists_isOpenCover_and_isAffine\n类型签名：[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] {J : Type*} (U : J → c.pt.Opens) (hU : IsOpenCover U) (hU' : ∀ i, IsAffineOpen (U i)) : ∃ (i : I) (s : Finset J) (V : s → (D.obj i).Opens), IsOpenCover V ∧ ∀ j, IsAffineOpen (V j) ∧ U j = c.π.app i ⁻¹ᵁ (V j)\n\nSuppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. Then any affine open cover of lim Xᵢ comes from a finite level.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "Scheme.exists_isOpenCover_and_isAffine",
   "kind": "lemma",
   "signature": "[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] {J : Type*} (U : J → c.pt.Opens) (hU : IsOpenCover U) (hU' : ∀ i, IsAffineOpen (U i)) : ∃ (i : I) (s : Finset J) (V : s → (D.obj i).Opens), IsOpenCover V ∧ ∀ j, IsAffineOpen (V j) ∧ U j = c.π.app i ⁻¹ᵁ (V j)",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isup-basicopen-of-span-eq-top",
  "latex": "{X : Scheme} (U) (s : Set Γ(X, U)) (hs : Ideal.span s = ⊤) : (⨆ i ∈ s, X.basicOpen i) = U",
  "name": "iSup_basicOpen_of_span_eq_top",
  "en": "AlgebraicGeometry.iSup_basicOpen_of_span_eq_top",
  "importance": 0.83,
  "family": "scheme",
  "summary": "Given a spanning set of Γ(X, U), the corresponding basic open sets cover U. See IsAffineOpen.basicOpen_union_eq_self_iff for the inverse direction for affine open sets.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.iSup_basicOpen_of_span_eq_top\n类型签名：{X : Scheme} (U) (s : Set Γ(X, U)) (hs : Ideal.span s = ⊤) : (⨆ i ∈ s, X.basicOpen i) = U\n\nGiven a spanning set of Γ(X, U), the corresponding basic open sets cover U. See IsAffineOpen.basicOpen_union_eq_self_iff for the inverse direction for affine open sets.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.iSup_basicOpen_of_span_eq_top",
   "kind": "lemma",
   "signature": "{X : Scheme} (U) (s : Set Γ(X, U)) (hs : Ideal.span s = ⊤) : (⨆ i ∈ s, X.basicOpen i) = U",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-essimage-algspec",
  "latex": ".essImage G ↔ IsAffine G.left",
  "name": "essImage_algSpec",
  "en": "essImage_algSpec",
  "importance": 0.74,
  "family": "scheme",
  "summary": "The essential image of R-algebras under Spec is precisely affine schemes over Spec R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：essImage_algSpec\n类型签名：{G : Over <| Spec R} : (algSpec R).essImage G ↔ IsAffine G.left\n\nThe essential image of R-algebras under Spec is precisely affine schemes over Spec R.\n\n文件：AlgebraicGeometry/Group/Affine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Group/Affine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Group/Affine.lean",
  "formal": true,
  "lean": {
   "full": "essImage_algSpec",
   "kind": "lemma",
   "signature": "{G : Over <| Spec R} : (algSpec R).essImage G ↔ IsAffine G.left",
   "file": "Mathlib/AlgebraicGeometry/Group/Affine.lean"
  }
 },
 {
  "id": "ml-j-eq-zero-iff",
  "latex": "W.j = 0 ↔ W.c₄ ^ 3 = 0",
  "name": "j_eq_zero_iff'",
  "en": "j_eq_zero_iff'",
  "importance": 0.66,
  "family": "scheme",
  "summary": "A variant of WeierstrassCurve.j_eq_zero_iff without assuming a reduced ring.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：j_eq_zero_iff'\n类型签名：: W.j = 0 ↔ W.c₄ ^ 3 = 0\n\nA variant of WeierstrassCurve.j_eq_zero_iff without assuming a reduced ring.\n\n文件：AlgebraicGeometry/EllipticCurve/Weierstrass\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Weierstrass",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean",
  "formal": true,
  "lean": {
   "full": "j_eq_zero_iff'",
   "kind": "lemma",
   "signature": ": W.j = 0 ↔ W.c₄ ^ 3 = 0",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean"
  }
 },
 {
  "id": "ml-scheme-exists-isaffine-of-islimit",
  "latex": "∃ i, IsAffine (D.obj i)",
  "name": "Scheme.exists_isAffine_of_isLimit",
  "en": "Scheme.exists_isAffine_of_isLimit",
  "importance": 0.84,
  "family": "scheme",
  "summary": "Suppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. If lim Xᵢ is affine, then some Xᵢ is affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Scheme.exists_isAffine_of_isLimit\n类型签名：[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] [IsAffine c.pt] : ∃ i, IsAffine (D.obj i)\n\nSuppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. If lim Xᵢ is affine, then some Xᵢ is affine.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "Scheme.exists_isAffine_of_isLimit",
   "kind": "lemma",
   "signature": "[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] [IsAffine c.pt] : ∃ i, IsAffine (D.obj i)",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-localringhom-comp-stalkiso",
  "latex": "CommRingCat.ofHom (stalkIso R (PrimeSpectrum.comap f.hom p)).symm.toRingHom ≫ (CommRingCat.ofHom (Localization.localRingHom (PrimeSpectrum.c …",
  "name": "localRingHom_comp_stalkIso",
  "en": "AlgebraicGeometry.localRingHom_comp_stalkIso",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Under the isomorphisms stalkIso, the map stalkMap (Spec.sheafedSpaceMap f) p corresponds to the induced local ring homomorphism Localization.localRingHom.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.localRingHom_comp_stalkIso\n类型签名：{R S : CommRingCat.{u}} (f : R ⟶ S) (p : PrimeSpectrum S) : CommRingCat.ofHom (stalkIso R (PrimeSpectrum.comap f.hom p)).symm.toRingHom ≫ (CommRingCat.ofHom (Localization.localRingHom (PrimeSpectrum.comap f.hom p).asIdeal p.asIdeal f.hom rfl)) ≫ CommRingCat.ofHom (stalkIso S p).toRingHom = (Spec.sheafedSpaceMap f).hom.stalkMap p\n\nUnder the isomorphisms stalkIso, the map stalkMap (Spec.sheafedSpaceMap f) p corresponds to the induced local ring homomorphism Localization.localRingHom.\n\n文件：AlgebraicGeometry/Spec\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Spec",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Spec.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.localRingHom_comp_stalkIso",
   "kind": "theorem",
   "signature": "{R S : CommRingCat.{u}} (f : R ⟶ S) (p : PrimeSpectrum S) : CommRingCat.ofHom (stalkIso R (PrimeSpectrum.comap f.hom p)).symm.toRingHom ≫ (CommRingCat.ofHom (Localization.localRingHom (PrimeSpectrum.comap f.hom p).asIdeal p.asIdeal f.hom rfl)) ≫ CommRingCat.ofHom (stalkIso S p).toRingHom = (Spec.sheafedSpaceMap f).hom.stalkMap p",
   "file": "Mathlib/AlgebraicGeometry/Spec.lean"
  }
 },
 {
  "id": "ml-scheme-exists-isquasiaffine-of-islimit",
  "latex": "∃ i, IsQuasiAffine (D.obj i)",
  "name": "Scheme.exists_isQuasiAffine_of_isLimit",
  "en": "Scheme.exists_isQuasiAffine_of_isLimit",
  "importance": 0.85,
  "family": "scheme",
  "summary": "Suppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. If lim Xᵢ is quasi-affine, then some Xᵢ is quasi-affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Scheme.exists_isQuasiAffine_of_isLimit\n类型签名：[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] [IsQuasiAffine c.pt] : ∃ i, IsQuasiAffine (D.obj i)\n\nSuppose { Xᵢ } is an inverse system of qcqs schemes with affine transition maps. If lim Xᵢ is quasi-affine, then some Xᵢ is quasi-affine.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "Scheme.exists_isQuasiAffine_of_isLimit",
   "kind": "lemma",
   "signature": "[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] [IsQuasiAffine c.pt] : ∃ i, IsQuasiAffine (D.obj i)",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isgerminjective-of-opencover",
  "latex": "X.IsGermInjective",
  "name": "Scheme.IsGermInjective.of_openCover",
  "en": "AlgebraicGeometry.Scheme.IsGermInjective.of_openCover",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The class of schemes such that for each x : X, Γ(X, U) ⟶ X_x is injective for some affine U containing x. This is typically satisfied when X is integral or locally Noetherian.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.IsGermInjective.of_openCover\n类型签名：{X : Scheme.{u}} (𝒰 : X.OpenCover) [∀ i, (𝒰.X i).IsGermInjective] : X.IsGermInjective\n\nThe class of schemes such that for each x : X, Γ(X, U) ⟶ X_x is injective for some affine U containing x. This is typically satisfied when X is integral or locally Noetherian.\n\n文件：AlgebraicGeometry/SpreadingOut\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/SpreadingOut",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/SpreadingOut.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.IsGermInjective.of_openCover",
   "kind": "lemma",
   "signature": "{X : Scheme.{u}} (𝒰 : X.OpenCover) [∀ i, (𝒰.X i).IsGermInjective] : X.IsGermInjective",
   "file": "Mathlib/AlgebraicGeometry/SpreadingOut.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-islocalizing-of-iso",
  "latex": "IsLocalizing N",
  "name": "isLocalizing_of_iso",
  "en": "AlgebraicGeometry.isLocalizing_of_iso",
  "importance": 0.83,
  "family": "scheme",
  "summary": "A sheaf M of R-modules is localizing if for all f in R, the restriction map from M(⊤) to M(D(f)) is localization with respect to f.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isLocalizing_of_iso\n类型签名：{M N : TopCat.Sheaf (ModuleCat R) (Spec R)} (φ : M ≅ N) (hM : IsLocalizing M) : IsLocalizing N\n\nA sheaf M of R-modules is localizing if for all f in R, the restriction map from M(⊤) to M(D(f)) is localization with respect to f.\n\n文件：AlgebraicGeometry/Modules/Tilde\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Modules/Tilde",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Modules/Tilde.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isLocalizing_of_iso",
   "kind": "theorem",
   "signature": "{M N : TopCat.Sheaf (ModuleCat R) (Spec R)} (φ : M ≅ N) (hM : IsLocalizing M) : IsLocalizing N",
   "file": "Mathlib/AlgebraicGeometry/Modules/Tilde.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-den-duplication-eq-zero-iff",
  "latex": "4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = 0 ↔ y = W'.negY x y",
  "name": "den_duplication_eq_zero_iff",
  "en": "WeierstrassCurve.den_duplication_eq_zero_iff",
  "importance": 0.86,
  "family": "scheme",
  "summary": "The denominator in the rational expression for the x-coordinate of twice the point (x, y) vanishes if and only if the point is equal to its negative.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.den_duplication_eq_zero_iff\n类型签名：[IsReduced R] {x y : R} (h : W'.Equation x y) : 4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = 0 ↔ y = W'.negY x y\n\nThe denominator in the rational expression for the x-coordinate of twice the point (x, y) vanishes if and only if the point is equal to its negative.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Formula\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Formula",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.den_duplication_eq_zero_iff",
   "kind": "lemma",
   "signature": "[IsReduced R] {x y : R} (h : W'.Equation x y) : 4 * x ^ 3 + W'.b₂ * x ^ 2 + 2 * W'.b₄ * x + W'.b₆ = 0 ↔ y = W'.negY x y",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-isup-basicopen-eq-self-iff",
  "latex": "s, X.basicOpen (f : Γ(X, U)) = U ↔ Ideal.span s = ⊤",
  "name": "iSup_basicOpen_eq_self_iff",
  "en": "AlgebraicGeometry.IsAffineOpen.iSup_basicOpen_eq_self_iff",
  "importance": 0.81,
  "family": "scheme",
  "summary": "In an affine open set U, a family of basic open covers U iff the sections span Γ(X, U). See iSup_basicOpen_of_span_eq_top for the inverse direction without the affine-ness assumpti",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.iSup_basicOpen_eq_self_iff\n类型签名：{s : Set Γ(X, U)} : ⨆ f : s, X.basicOpen (f : Γ(X, U)) = U ↔ Ideal.span s = ⊤\n\nIn an affine open set U, a family of basic open covers U iff the sections span Γ(X, U). See iSup_basicOpen_of_span_eq_top for the inverse direction without the affine-ness assumption.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.iSup_basicOpen_eq_self_iff",
   "kind": "theorem",
   "signature": "{s : Set Γ(X, U)} : ⨆ f : s, X.basicOpen (f : Γ(X, U)) = U ↔ Ideal.span s = ⊤",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-islocallynoetherian-iff-opencover",
  "latex": "IsLocallyNoetherian X ↔ ∀ (i : 𝒰.I₀), IsLocallyNoetherian (𝒰.X i)",
  "name": "isLocallyNoetherian_iff_openCover",
  "en": "isLocallyNoetherian_iff_openCover",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If 𝒰 is an open cover of a scheme X, then X is locally Noetherian if and only if 𝒰.X i are all locally Noetherian.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isLocallyNoetherian_iff_openCover\n类型签名：(𝒰 : Scheme.OpenCover X) : IsLocallyNoetherian X ↔ ∀ (i : 𝒰.I₀), IsLocallyNoetherian (𝒰.X i)\n\nIf 𝒰 is an open cover of a scheme X, then X is locally Noetherian if and only if 𝒰.X i are all locally Noetherian.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "isLocallyNoetherian_iff_openCover",
   "kind": "theorem",
   "signature": "(𝒰 : Scheme.OpenCover X) : IsLocallyNoetherian X ↔ ∀ (i : 𝒰.I₀), IsLocallyNoetherian (𝒰.X i)",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-pretopology-eq-inf",
  "latex": "pretopology P = jointlySurjectivePretopology ⊓ P.pretopology",
  "name": "pretopology_eq_inf",
  "en": "AlgebraicGeometry.Scheme.pretopology_eq_inf",
  "importance": 0.78,
  "family": "scheme",
  "summary": "The pretopology defined by P-covers agrees with the intersection of the pretopology of surjective families with the pretopology defined by P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.pretopology_eq_inf\n类型签名：: pretopology P = jointlySurjectivePretopology ⊓ P.pretopology\n\nThe pretopology defined by P-covers agrees with the intersection of the pretopology of surjective families with the pretopology defined by P.\n\n文件：AlgebraicGeometry/Sites/Pretopology\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Pretopology",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Pretopology.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.pretopology_eq_inf",
   "kind": "lemma",
   "signature": ": pretopology P = jointlySurjectivePretopology ⊓ P.pretopology",
   "file": "Mathlib/AlgebraicGeometry/Sites/Pretopology.lean"
  }
 },
 {
  "id": "ml-carrierequiv-eq-iff",
  "latex": "T₁.1 = T₂.1, Spec.map (Triplet.tensorCongr e).inv T₁.2 = T₂.2",
  "name": "carrierEquiv_eq_iff",
  "en": "carrierEquiv_eq_iff",
  "importance": 0.8,
  "family": "scheme",
  "summary": "A helper lemma to work with AlgebraicGeometry.Scheme.Pullback.carrierEquiv.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：carrierEquiv_eq_iff\n类型签名：{T₁ T₂ : Σ T : Triplet f g, Spec T.tensor} : T₁ = T₂ ↔ ∃ e : T₁.1 = T₂.1, Spec.map (Triplet.tensorCongr e).inv T₁.2 = T₂.2\n\nA helper lemma to work with AlgebraicGeometry.Scheme.Pullback.carrierEquiv.\n\n文件：AlgebraicGeometry/PullbackCarrier\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/PullbackCarrier",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/PullbackCarrier.lean",
  "formal": true,
  "lean": {
   "full": "carrierEquiv_eq_iff",
   "kind": "lemma",
   "signature": "{T₁ T₂ : Σ T : Triplet f g, Spec T.tensor} : T₁ = T₂ ↔ ∃ e : T₁.1 = T₂.1, Spec.map (Triplet.tensorCongr e).inv T₁.2 = T₂.2",
   "file": "Mathlib/AlgebraicGeometry/PullbackCarrier.lean"
  }
 },
 {
  "id": "ml-isnoetherian-spec",
  "latex": "IsNoetherian (Spec R) ↔ IsNoetherianRing R",
  "name": "isNoetherian_Spec",
  "en": "isNoetherian_Spec",
  "importance": 0.72,
  "family": "scheme",
  "summary": "R is a Noetherian ring if and only if Spec R is a Noetherian scheme.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isNoetherian_Spec\n类型签名：{R : CommRingCat} : IsNoetherian (Spec R) ↔ IsNoetherianRing R\n\nR is a Noetherian ring if and only if Spec R is a Noetherian scheme.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "isNoetherian_Spec",
   "kind": "theorem",
   "signature": "{R : CommRingCat} : IsNoetherian (Spec R) ↔ IsNoetherianRing R",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-nonempty-of-islimit",
  "latex": "Nonempty c.pt",
  "name": "Scheme.nonempty_of_isLimit",
  "en": "AlgebraicGeometry.Scheme.nonempty_of_isLimit",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Suppose we have a cofiltered diagram of nonempty quasi-compact schemes, whose transition maps are affine. Then the limit is also nonempty.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.nonempty_of_isLimit\n类型签名：[IsCofilteredOrEmpty I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, Nonempty (D.obj i)] [∀ i, CompactSpace (D.obj i)] : Nonempty c.pt\n\nSuppose we have a cofiltered diagram of nonempty quasi-compact schemes, whose transition maps are affine. Then the limit is also nonempty.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.nonempty_of_isLimit",
   "kind": "lemma",
   "signature": "[IsCofilteredOrEmpty I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ i, Nonempty (D.obj i)] [∀ i, CompactSpace (D.obj i)] : Nonempty c.pt",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-j-eq-zero-iff-of-char-two",
  "latex": "W.j = 0 ↔ W.a₁ ^ 12 = 0",
  "name": "j_eq_zero_iff_of_char_two'",
  "en": "j_eq_zero_iff_of_char_two'",
  "importance": 0.68,
  "family": "scheme",
  "summary": "A variant of WeierstrassCurve.j_eq_zero_iff_of_char_two without assuming a reduced ring.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：j_eq_zero_iff_of_char_two'\n类型签名：: W.j = 0 ↔ W.a₁ ^ 12 = 0\n\nA variant of WeierstrassCurve.j_eq_zero_iff_of_char_two without assuming a reduced ring.\n\n文件：AlgebraicGeometry/EllipticCurve/Weierstrass\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Weierstrass",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean",
  "formal": true,
  "lean": {
   "full": "j_eq_zero_iff_of_char_two'",
   "kind": "lemma",
   "signature": ": W.j = 0 ↔ W.a₁ ^ 12 = 0",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-isover-iff",
  "latex": "f.IsOver S ↔ f ≫ Y ↘ S = X ↘ S",
  "name": "Hom.isOver_iff",
  "en": "AlgebraicGeometry.Scheme.Hom.isOver_iff",
  "importance": 0.77,
  "family": "scheme",
  "summary": "Given X.Over S and Y.Over S and f : X ⟶ Y, f.IsOver S is the typeclass asserting f commutes with the structure morphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.isOver_iff\n类型签名：[X.Over S] [Y.Over S] {f : X ⟶ Y} : f.IsOver S ↔ f ≫ Y ↘ S = X ↘ S\n\nGiven X.Over S and Y.Over S and f : X ⟶ Y, f.IsOver S is the typeclass asserting f commutes with the structure morphisms.\n\n文件：AlgebraicGeometry/Over\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Over",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Over.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.isOver_iff",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] {f : X ⟶ Y} : f.IsOver S ↔ f ≫ Y ↘ S = X ↘ S",
   "file": "Mathlib/AlgebraicGeometry/Over.lean"
  }
 },
 {
  "id": "ml-ideal-ker-le-ker",
  "latex": "f.ker.ideal U ≤ RingHom.ker ((ΓSpecIso Γ(Y, ↑U)).inv ≫ (pullback.snd f U.1.ι ≫ U.1.toSpecΓ).appTop).hom",
  "name": "ideal_ker_le_ker_",
  "en": "ideal_ker_le_ker_",
  "importance": 0.79,
  "family": "scheme",
  "summary": "The embedding from the scheme-theoretic image to the codomain.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ideal_ker_le_ker_\n类型签名：ΓSpecIso_inv_comp : f.ker.ideal U ≤ RingHom.ker ((ΓSpecIso Γ(Y, ↑U)).inv ≫ (pullback.snd f U.1.ι ≫ U.1.toSpecΓ).appTop).hom\n\nThe embedding from the scheme-theoretic image to the codomain.\n\n文件：AlgebraicGeometry/IdealSheaf/Subscheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/IdealSheaf/Subscheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/IdealSheaf/Subscheme.lean",
  "formal": true,
  "lean": {
   "full": "ideal_ker_le_ker_",
   "kind": "lemma",
   "signature": "ΓSpecIso_inv_comp : f.ker.ideal U ≤ RingHom.ker ((ΓSpecIso Γ(Y, ↑U)).inv ≫ (pullback.snd f U.1.ι ≫ U.1.toSpecΓ).appTop).hom",
   "file": "Mathlib/AlgebraicGeometry/IdealSheaf/Subscheme.lean"
  }
 },
 {
  "id": "ml-isnoetherian-iff-of-finite-isup-eq-top",
  "latex": "IsNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)",
  "name": "isNoetherian_iff_of_finite_iSup_eq_top",
  "en": "isNoetherian_iff_of_finite_iSup_eq_top",
  "importance": 0.84,
  "family": "scheme",
  "summary": "A scheme is Noetherian if and only if it is covered by finitely many affine opens whose sections are Noetherian rings.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isNoetherian_iff_of_finite_iSup_eq_top\n类型签名：{ι} [Finite ι] {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) : IsNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)\n\nA scheme is Noetherian if and only if it is covered by finitely many affine opens whose sections are Noetherian rings.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "isNoetherian_iff_of_finite_iSup_eq_top",
   "kind": "theorem",
   "signature": "{ι} [Finite ι] {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) : IsNoetherian X ↔ ∀ i, IsNoetherianRing Γ(X, S i)",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isospec-image-zerolocus",
  "latex": "X.isoSpec.hom '' X.zeroLocus s = PrimeSpectrum.zeroLocus s",
  "name": "isoSpec_image_zeroLocus",
  "en": "AlgebraicGeometry.Scheme.isoSpec_image_zeroLocus",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If X is affine, the image of the zero locus of global sections of X under X.isoSpec is the zero locus in terms of the prime spectrum of Γ(X, ⊤).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isoSpec_image_zeroLocus\n类型签名：[IsAffine X] (s : Set Γ(X, ⊤)) : X.isoSpec.hom '' X.zeroLocus s = PrimeSpectrum.zeroLocus s\n\nIf X is affine, the image of the zero locus of global sections of X under X.isoSpec is the zero locus in terms of the prime spectrum of Γ(X, ⊤).\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isoSpec_image_zeroLocus",
   "kind": "lemma",
   "signature": "[IsAffine X] (s : Set Γ(X, ⊤)) : X.isoSpec.hom '' X.zeroLocus s = PrimeSpectrum.zeroLocus s",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-nonempty-iscolimit-cofanmk-of",
  "latex": "Nonempty (IsColimit <| Cofan.mk S f)",
  "name": "nonempty_isColimit_cofanMk_of",
  "en": "nonempty_isColimit_cofanMk_of",
  "importance": 0.82,
  "family": "scheme",
  "summary": "S is the disjoint union of Xᵢ if the Xᵢ are covering, pairwise disjoint open subschemes of S.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：nonempty_isColimit_cofanMk_of\n类型签名：[Small.{u} σ] {X : σ → Scheme.{u}} {S : Scheme.{u}} (f : ∀ i, X i ⟶ S) [∀ i, IsOpenImmersion (f i)] (hcov : ⨆ i, (f i).opensRange = ⊤) (hdisj : Pairwise (Disjoint on (f · |>.opensRange))) : Nonempty (IsColimit <| Cofan.mk S f)\n\nS is the disjoint union of Xᵢ if the Xᵢ are covering, pairwise disjoint open subschemes of S.\n\n文件：AlgebraicGeometry/Limits\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Limits",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Limits.lean",
  "formal": true,
  "lean": {
   "full": "nonempty_isColimit_cofanMk_of",
   "kind": "lemma",
   "signature": "[Small.{u} σ] {X : σ → Scheme.{u}} {S : Scheme.{u}} (f : ∀ i, X i ⟶ S) [∀ i, IsOpenImmersion (f i)] (hcov : ⨆ i, (f i).opensRange = ⊤) (hdisj : Pairwise (Disjoint on (f · |>.opensRange))) : Nonempty (IsColimit <| Cofan.mk S f)",
   "file": "Mathlib/AlgebraicGeometry/Limits.lean"
  }
 },
 {
  "id": "ml-j-eq-zero-iff-of-char-three",
  "latex": "W.j = 0 ↔ W.b₂ ^ 6 = 0",
  "name": "j_eq_zero_iff_of_char_three'",
  "en": "j_eq_zero_iff_of_char_three'",
  "importance": 0.68,
  "family": "scheme",
  "summary": "A variant of WeierstrassCurve.j_eq_zero_iff_of_char_three without assuming a reduced ring.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：j_eq_zero_iff_of_char_three'\n类型签名：: W.j = 0 ↔ W.b₂ ^ 6 = 0\n\nA variant of WeierstrassCurve.j_eq_zero_iff_of_char_three without assuming a reduced ring.\n\n文件：AlgebraicGeometry/EllipticCurve/Weierstrass\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Weierstrass",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean",
  "formal": true,
  "lean": {
   "full": "j_eq_zero_iff_of_char_three'",
   "kind": "lemma",
   "signature": ": W.j = 0 ↔ W.b₂ ^ 6 = 0",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Weierstrass.lean"
  }
 },
 {
  "id": "ml-islocallynoetherian-of-affine-cover",
  "latex": "IsLocallyNoetherian X",
  "name": "isLocallyNoetherian_of_affine_cover",
  "en": "isLocallyNoetherian_of_affine_cover",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If a scheme X has a cover by affine opens whose sections are Noetherian rings, then X is locally Noetherian.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isLocallyNoetherian_of_affine_cover\n类型签名：{ι} {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) (hS' : ∀ i, IsNoetherianRing Γ(X, S i)) : IsLocallyNoetherian X\n\nIf a scheme X has a cover by affine opens whose sections are Noetherian rings, then X is locally Noetherian.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "isLocallyNoetherian_of_affine_cover",
   "kind": "theorem",
   "signature": "{ι} {S : ι → X.affineOpens} (hS : (⨆ i, S i : X.Opens) = ⊤) (hS' : ∀ i, IsNoetherianRing Γ(X, S i)) : IsLocallyNoetherian X",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isiso-fromtilde",
  "latex": "IsIso M.fromTildeΓ ↔ IsLocalizing (modulesSpecToSheaf.obj M)",
  "name": "isIso_fromTilde",
  "en": "AlgebraicGeometry.isIso_fromTilde",
  "importance": 0.82,
  "family": "scheme",
  "summary": "An 𝓞_Spec R module M is isomorphic to Γ(M)^~ if and only if it is localizing as a sheaf of R modules",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isIso_fromTilde\n类型签名：Γ_iff_isLocalizing (M : (Spec R).Modules) : IsIso M.fromTildeΓ ↔ IsLocalizing (modulesSpecToSheaf.obj M)\n\nAn 𝓞_Spec R module M is isomorphic to Γ(M)^~ if and only if it is localizing as a sheaf of R modules\n\n文件：AlgebraicGeometry/Modules/Tilde\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Modules/Tilde",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Modules/Tilde.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isIso_fromTilde",
   "kind": "theorem",
   "signature": "Γ_iff_isLocalizing (M : (Spec R).Modules) : IsIso M.fromTildeΓ ↔ IsLocalizing (modulesSpecToSheaf.obj M)",
   "file": "Mathlib/AlgebraicGeometry/Modules/Tilde.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-bot-mem-propqctopology",
  "latex": "⊥ ∈ propQCTopology P X",
  "name": "bot_mem_propQCTopology",
  "en": "AlgebraicGeometry.Scheme.bot_mem_propQCTopology",
  "importance": 0.76,
  "family": "scheme",
  "summary": "The P-qc-topology on the category of schemes wrt. to a morphism property P is the topology generated by quasi-compact covers satisfying P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.bot_mem_propQCTopology\n类型签名：(X : Scheme.{u}) [IsEmpty X] : ⊥ ∈ propQCTopology P X\n\nThe P-qc-topology on the category of schemes wrt. to a morphism property P is the topology generated by quasi-compact covers satisfying P.\n\n文件：AlgebraicGeometry/Sites/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.bot_mem_propQCTopology",
   "kind": "lemma",
   "signature": "(X : Scheme.{u}) [IsEmpty X] : ⊥ ∈ propQCTopology P X",
   "file": "Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-smallgrothendiecktopology-eq--f765b943",
  "latex": "S.smallGrothendieckTopology P = (S.smallPretopology P Q).toGrothendieck",
  "name": "smallGrothendieckTopology_eq_toGrothendieck_smallPretopology",
  "en": "AlgebraicGeometry.Scheme.smallGrothendieckTopology_eq_toGrothendieck_smallPretopology",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The pretopology defined on the subcategory of S-schemes satisfying Q where coverings are given by P-coverings in S-schemes satisfying Q. The most common case is P = Q. In this case",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.smallGrothendieckTopology_eq_toGrothendieck_smallPretopology\n类型签名：(hPQ : P ≤ Q) : S.smallGrothendieckTopology P = (S.smallPretopology P Q).toGrothendieck\n\nThe pretopology defined on the subcategory of S-schemes satisfying Q where coverings are given by P-coverings in S-schemes satisfying Q. The most common case is P = Q. In this case, this is simply surjective families in S-schemes with P.\n\n文件：AlgebraicGeometry/Sites/Small\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Small",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Small.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.smallGrothendieckTopology_eq_toGrothendieck_smallPretopology",
   "kind": "lemma",
   "signature": "(hPQ : P ≤ Q) : S.smallGrothendieckTopology P = (S.smallPretopology P Q).toGrothendieck",
   "file": "Mathlib/AlgebraicGeometry/Sites/Small.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-exists-isunit-germ-eq",
  "latex": "Nonempty U, X.germToFunctionField U f' = f ∧ IsUnit f'",
  "name": "exists_isUnit_germ_eq",
  "en": "AlgebraicGeometry.exists_isUnit_germ_eq",
  "importance": 0.83,
  "family": "scheme",
  "summary": "For f an element of the function field of X, there exists some open set U ⊆ X such that f is a unit in Γ(X, U).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.exists_isUnit_germ_eq\n类型签名：[IsIntegral X] (f : X.functionField) (hf : f ≠ 0) : ∃ U ∈ X.affineOpens, ∃ f' : Γ(X, U), ∃ _ : Nonempty U, X.germToFunctionField U f' = f ∧ IsUnit f'\n\nFor f an element of the function field of X, there exists some open set U ⊆ X such that f is a unit in Γ(X, U).\n\n文件：AlgebraicGeometry/FunctionField\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/FunctionField",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/FunctionField.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.exists_isUnit_germ_eq",
   "kind": "lemma",
   "signature": "[IsIntegral X] (f : X.functionField) (hf : f ≠ 0) : ∃ U ∈ X.affineOpens, ∃ f' : Γ(X, U), ∃ _ : Nonempty U, X.germToFunctionField U f' = f ∧ IsUnit f'",
   "file": "Mathlib/AlgebraicGeometry/FunctionField.lean"
  }
 },
 {
  "id": "ml-spectoequivoffield-eq-iff",
  "latex": "f₁.1 = f₂.1, f₁.2 = (X.residueFieldCongr e).hom ≫ f₂.2",
  "name": "SpecToEquivOfField_eq_iff",
  "en": "SpecToEquivOfField_eq_iff",
  "importance": 0.8,
  "family": "scheme",
  "summary": "A helper lemma to work with AlgebraicGeometry.Scheme.SpecToEquivOfField.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：SpecToEquivOfField_eq_iff\n类型签名：{K : Type*} [Field K] {X : Scheme} {f₁ f₂ : Σ x : X.carrier, X.residueField x ⟶ ↧K} : f₁ = f₂ ↔ ∃ e : f₁.1 = f₂.1, f₁.2 = (X.residueFieldCongr e).hom ≫ f₂.2\n\nA helper lemma to work with AlgebraicGeometry.Scheme.SpecToEquivOfField.\n\n文件：AlgebraicGeometry/ResidueField\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ResidueField",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ResidueField.lean",
  "formal": true,
  "lean": {
   "full": "SpecToEquivOfField_eq_iff",
   "kind": "lemma",
   "signature": "{K : Type*} [Field K] {X : Scheme} {f₁ f₂ : Σ x : X.carrier, X.residueField x ⟶ ↧K} : f₁ = f₂ ↔ ∃ e : f₁.1 = f₂.1, f₁.2 = (X.residueFieldCongr e).hom ≫ f₂.2",
   "file": "Mathlib/AlgebraicGeometry/ResidueField.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-fromspecstalk-eq",
  "latex": "hU.fromSpecStalk hxU = hV.fromSpecStalk hxV",
  "name": "IsAffineOpen.fromSpecStalk_eq",
  "en": "AlgebraicGeometry.IsAffineOpen.fromSpecStalk_eq",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The morphism from Spec(O_x) to X given by IsAffineOpen.fromSpec does not depend on the affine open neighborhood of x we choose.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.fromSpecStalk_eq\n类型签名：(x : X) (hxU : x ∈ U) (hxV : x ∈ V) : hU.fromSpecStalk hxU = hV.fromSpecStalk hxV\n\nThe morphism from Spec(O_x) to X given by IsAffineOpen.fromSpec does not depend on the affine open neighborhood of x we choose.\n\n文件：AlgebraicGeometry/Stalk\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Stalk",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Stalk.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.fromSpecStalk_eq",
   "kind": "theorem",
   "signature": "(x : X) (hxU : x ∈ U) (hxV : x ∈ V) : hU.fromSpecStalk hxU = hV.fromSpecStalk hxV",
   "file": "Mathlib/AlgebraicGeometry/Stalk.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-overgrothendiecktopology-eq-t-2c88ede1",
  "latex": "S.overGrothendieckTopology P = (S.overPretopology P).toGrothendieck",
  "name": "overGrothendieckTopology_eq_toGrothendieck_overPretopology",
  "en": "AlgebraicGeometry.Scheme.overGrothendieckTopology_eq_toGrothendieck_overPretopology",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The topology on Over S induced from the topology on Scheme defined by P. This agrees with the topology induced by S.overPretopology P, see AlgebraicGeometry.Scheme.overGrothendieck",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.overGrothendieckTopology_eq_toGrothendieck_overPretopology\n类型签名：: S.overGrothendieckTopology P = (S.overPretopology P).toGrothendieck\n\nThe topology on Over S induced from the topology on Scheme defined by P. This agrees with the topology induced by S.overPretopology P, see AlgebraicGeometry.Scheme.overGrothendieckTopology_eq_toGrothendieck_overPretopology.\n\n文件：AlgebraicGeometry/Sites/Small\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Small",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Small.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.overGrothendieckTopology_eq_toGrothendieck_overPretopology",
   "kind": "lemma",
   "signature": ": S.overGrothendieckTopology P = (S.overPretopology P).toGrothendieck",
   "file": "Mathlib/AlgebraicGeometry/Sites/Small.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-injective-germ-basicopen",
  "latex": "Function.Injective (X.presheaf.germ (X.basicOpen f) x hf)",
  "name": "injective_germ_basicOpen",
  "en": "AlgebraicGeometry.injective_germ_basicOpen",
  "importance": 0.83,
  "family": "scheme",
  "summary": "The germ map at x is injective if there exists some affine U ∋ x such that the map Γ(X, U) ⟶ X_x is injective",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.injective_germ_basicOpen\n类型签名：(U : X.Opens) (hU : IsAffineOpen U) (x : X) (hx : x ∈ U) (f : Γ(X, U)) (hf : x ∈ X.basicOpen f) (H : Function.Injective (X.presheaf.germ U x hx)) : Function.Injective (X.presheaf.germ (X.basicOpen f) x hf)\n\nThe germ map at x is injective if there exists some affine U ∋ x such that the map Γ(X, U) ⟶ X_x is injective\n\n文件：AlgebraicGeometry/SpreadingOut\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/SpreadingOut",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/SpreadingOut.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.injective_germ_basicOpen",
   "kind": "lemma",
   "signature": "(U : X.Opens) (hU : IsAffineOpen U) (x : X) (hx : x ∈ U) (f : Γ(X, U)) (hf : x ∈ X.basicOpen f) (H : Function.Injective (X.presheaf.germ U x hx)) : Function.Injective (X.presheaf.germ (X.basicOpen f) x hf)",
   "file": "Mathlib/AlgebraicGeometry/SpreadingOut.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-jacobian-fin3-def",
  "latex": "(P : Fin 3 → R) : ! = P",
  "name": "fin3_def",
  "en": "WeierstrassCurve.Jacobian.fin3_def",
  "importance": 0.7,
  "family": "scheme",
  "summary": "The conversion from a Weierstrass curve in Jacobian coordinates to affine coordinates.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Jacobian.fin3_def\n类型签名：(P : Fin 3 → R) : ![P x, P y, P z] = P\n\nThe conversion from a Weierstrass curve in Jacobian coordinates to affine coordinates.\n\n文件：AlgebraicGeometry/EllipticCurve/Jacobian/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Jacobian/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Jacobian.fin3_def",
   "kind": "lemma",
   "signature": "(P : Fin 3 → R) : ![P x, P y, P z] = P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean"
  }
 },
 {
  "id": "ml-pullbackcomparison-forget-surjective",
  "latex": "Function.Surjective (pullbackComparison forget f g)",
  "name": "pullbackComparison_forget_surjective",
  "en": "pullbackComparison_forget_surjective",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The comparison map for pullbacks under the forgetful functor Scheme ⥤ Type u is surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：pullbackComparison_forget_surjective\n类型签名：{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) : Function.Surjective (pullbackComparison forget f g)\n\nThe comparison map for pullbacks under the forgetful functor Scheme ⥤ Type u is surjective.\n\n文件：AlgebraicGeometry/PullbackCarrier\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/PullbackCarrier",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/PullbackCarrier.lean",
  "formal": true,
  "lean": {
   "full": "pullbackComparison_forget_surjective",
   "kind": "lemma",
   "signature": "{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) : Function.Surjective (pullbackComparison forget f g)",
   "file": "Mathlib/AlgebraicGeometry/PullbackCarrier.lean"
  }
 },
 {
  "id": "ml-hasgoodreduction-iff-iselliptic-reduction",
  "latex": "HasGoodReduction R W ↔ (W.reduction R).IsElliptic",
  "name": "hasGoodReduction_iff_isElliptic_reduction",
  "en": "hasGoodReduction_iff_isElliptic_reduction",
  "importance": 0.81,
  "family": "scheme",
  "summary": "A minimal Weierstrass equation has good reduction if and only if the valuation of its discriminant is 1.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：hasGoodReduction_iff_isElliptic_reduction\n类型签名：{W : WeierstrassCurve K} [hW : IsMinimal R W] : HasGoodReduction R W ↔ (W.reduction R).IsElliptic\n\nA minimal Weierstrass equation has good reduction if and only if the valuation of its discriminant is 1.\n\n文件：AlgebraicGeometry/EllipticCurve/Reduction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Reduction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean",
  "formal": true,
  "lean": {
   "full": "hasGoodReduction_iff_isElliptic_reduction",
   "kind": "lemma",
   "signature": "{W : WeierstrassCurve K} [hW : IsMinimal R W] : HasGoodReduction R W ↔ (W.reduction R).IsElliptic",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Reduction.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opens",
  "latex": "U.ι ''ᵁ U.toScheme.basicOpen r = X.basicOpen (X.presheaf.map (eqToHom U.ι_image_top.symm).op r)",
  "name": "Scheme.Opens.",
  "en": "AlgebraicGeometry.Scheme.Opens.",
  "importance": 0.8,
  "family": "scheme",
  "summary": "A variant where r is first mapped into Γ(X, U) before taking the basic open.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Opens.\n类型签名：ι_image_basicOpen' (r : Γ(U, ⊤)) : U.ι ''ᵁ U.toScheme.basicOpen r = X.basicOpen (X.presheaf.map (eqToHom U.ι_image_top.symm).op r)\n\nA variant where r is first mapped into Γ(X, U) before taking the basic open.\n\n文件：AlgebraicGeometry/Restrict\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Restrict",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Restrict.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Opens.",
   "kind": "lemma",
   "signature": "ι_image_basicOpen' (r : Γ(U, ⊤)) : U.ι ''ᵁ U.toScheme.basicOpen r = X.basicOpen (X.presheaf.map (eqToHom U.ι_image_top.symm).op r)",
   "file": "Mathlib/AlgebraicGeometry/Restrict.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-projective-fin3-def",
  "latex": "(P : Fin 3 → R) : ! = P",
  "name": "fin3_def",
  "en": "WeierstrassCurve.Projective.fin3_def",
  "importance": 0.7,
  "family": "scheme",
  "summary": "The conversion from a Weierstrass curve in projective coordinates to affine coordinates.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Projective.fin3_def\n类型签名：(P : Fin 3 → R) : ![P x, P y, P z] = P\n\nThe conversion from a Weierstrass curve in projective coordinates to affine coordinates.\n\n文件：AlgebraicGeometry/EllipticCurve/Projective/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Projective/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Projective.fin3_def",
   "kind": "lemma",
   "signature": "(P : Fin 3 → R) : ![P x, P y, P z] = P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean"
  }
 },
 {
  "id": "ml-disjoint-opensrange-sigma",
  "latex": "Disjoint (Sigma.ι g i).opensRange (Sigma.ι g j).opensRange",
  "name": "disjoint_opensRange_sigma",
  "en": "disjoint_opensRange_sigma",
  "importance": 0.77,
  "family": "scheme",
  "summary": "The images of each component in the coproduct is disjoint.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：disjoint_opensRange_sigma\n类型签名：ι [Small.{u} σ] (i j : σ) (h : i ≠ j) : Disjoint (Sigma.ι g i).opensRange (Sigma.ι g j).opensRange\n\nThe images of each component in the coproduct is disjoint.\n\n文件：AlgebraicGeometry/Limits\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Limits",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Limits.lean",
  "formal": true,
  "lean": {
   "full": "disjoint_opensRange_sigma",
   "kind": "lemma",
   "signature": "ι [Small.{u} σ] (i j : σ) (h : i ≠ j) : Disjoint (Sigma.ι g i).opensRange (Sigma.ι g j).opensRange",
   "file": "Mathlib/AlgebraicGeometry/Limits.lean"
  }
 },
 {
  "id": "ml-isquasicoherent-iff-isiso-fromtilde",
  "latex": "M.IsQuasicoherent ↔ IsIso M.fromTildeΓ",
  "name": "isQuasicoherent_iff_isIso_fromTilde",
  "en": "isQuasicoherent_iff_isIso_fromTilde",
  "importance": 0.74,
  "family": "scheme",
  "summary": "An 𝒪_{Spec R} module M is quasicoherent if and only if it is isomorphic to Γ(M)^~.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isQuasicoherent_iff_isIso_fromTilde\n类型签名：Γ (M : (Spec R).Modules) : M.IsQuasicoherent ↔ IsIso M.fromTildeΓ\n\nAn 𝒪_{Spec R} module M is quasicoherent if and only if it is isomorphic to Γ(M)^~.\n\n文件：AlgebraicGeometry/Modules/Tilde\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Modules/Tilde",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Modules/Tilde.lean",
  "formal": true,
  "lean": {
   "full": "isQuasicoherent_iff_isIso_fromTilde",
   "kind": "theorem",
   "signature": "Γ (M : (Spec R).Modules) : M.IsQuasicoherent ↔ IsIso M.fromTildeΓ",
   "file": "Mathlib/AlgebraicGeometry/Modules/Tilde.lean"
  }
 },
 {
  "id": "ml-projectivespectrum-gc-set",
  "latex": "@GaloisConnection (Set A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun s => zeroLocus 𝒜 s) fun t => vanishingIdeal t",
  "name": "gc_set",
  "en": "ProjectiveSpectrum.gc_set",
  "importance": 0.78,
  "family": "scheme",
  "summary": "zeroLocus and vanishingIdeal form a Galois connection.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ProjectiveSpectrum.gc_set\n类型签名：: @GaloisConnection (Set A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun s => zeroLocus 𝒜 s) fun t => vanishingIdeal t\n\nzeroLocus and vanishingIdeal form a Galois connection.\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Topology\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Topology",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Topology.lean",
  "formal": true,
  "lean": {
   "full": "ProjectiveSpectrum.gc_set",
   "kind": "theorem",
   "signature": ": @GaloisConnection (Set A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun s => zeroLocus 𝒜 s) fun t => vanishingIdeal t",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Topology.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-addx-of-x-ne",
  "latex": "W.addX x₁ x₂ (W.slope x₁ x₂ y₁ y₂) = ((y₁ - y₂) ^ 2 + W.a₁ * (y₁ - y₂) * (x₁ - x₂) - (W.a₂ + x₁ + x₂) * (x₁ - x₂) ^2) / (x₁ - x₂) ^ 2",
  "name": "addX_of_X_ne",
  "en": "WeierstrassCurve.addX_of_X_ne",
  "importance": 0.79,
  "family": "scheme",
  "summary": "The explicit formula for the x-coordinate of P + Q when P ≠ ±Q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.addX_of_X_ne\n类型签名：{x₁ y₁ x₂ y₂ : F} (hn : x₁ ≠ x₂) : W.addX x₁ x₂ (W.slope x₁ x₂ y₁ y₂) = ((y₁ - y₂) ^ 2 + W.a₁ * (y₁ - y₂) * (x₁ - x₂) - (W.a₂ + x₁ + x₂) * (x₁ - x₂) ^2) / (x₁ - x₂) ^ 2\n\nThe explicit formula for the x-coordinate of P + Q when P ≠ ±Q.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Formula\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Formula",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.addX_of_X_ne",
   "kind": "lemma",
   "signature": "{x₁ y₁ x₂ y₂ : F} (hn : x₁ ≠ x₂) : W.addX x₁ x₂ (W.slope x₁ x₂ y₁ y₂) = ((y₁ - y₂) ^ 2 + W.a₁ * (y₁ - y₂) * (x₁ - x₂) - (W.a₂ + x₁ + x₂) * (x₁ - x₂) ^2) / (x₁ - x₂) ^ 2",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean"
  }
 },
 {
  "id": "ml-nonempty-iscolimit-binarycofanmk-of-iscompl",
  "latex": "Nonempty (IsColimit <| BinaryCofan.mk f g)",
  "name": "nonempty_isColimit_binaryCofanMk_of_isCompl",
  "en": "nonempty_isColimit_binaryCofanMk_of_isCompl",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If X and Y are open disjoint and covering open subschemes of S, S is the disjoint union of X and Y.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：nonempty_isColimit_binaryCofanMk_of_isCompl\n类型签名：{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) [IsOpenImmersion f] [IsOpenImmersion g] (hf : IsCompl f.opensRange g.opensRange) : Nonempty (IsColimit <| BinaryCofan.mk f g)\n\nIf X and Y are open disjoint and covering open subschemes of S, S is the disjoint union of X and Y.\n\n文件：AlgebraicGeometry/Limits\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Limits",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Limits.lean",
  "formal": true,
  "lean": {
   "full": "nonempty_isColimit_binaryCofanMk_of_isCompl",
   "kind": "lemma",
   "signature": "{X Y S : Scheme.{u}} (f : X ⟶ S) (g : Y ⟶ S) [IsOpenImmersion f] [IsOpenImmersion g] (hf : IsCompl f.opensRange g.opensRange) : Nonempty (IsColimit <| BinaryCofan.mk f g)",
   "file": "Mathlib/AlgebraicGeometry/Limits.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-jacobian-smul-equiv",
  "latex": "u • P ≈ P",
  "name": "smul_equiv",
  "en": "WeierstrassCurve.Jacobian.smul_equiv",
  "importance": 0.71,
  "family": "scheme",
  "summary": "The equivalence class of a Jacobian point representative on a Weierstrass curve.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Jacobian.smul_equiv\n类型签名：(P : Fin 3 → R) {u : R} (hu : IsUnit u) : u • P ≈ P\n\nThe equivalence class of a Jacobian point representative on a Weierstrass curve.\n\n文件：AlgebraicGeometry/EllipticCurve/Jacobian/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Jacobian/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Jacobian.smul_equiv",
   "kind": "lemma",
   "signature": "(P : Fin 3 → R) {u : R} (hu : IsUnit u) : u • P ≈ P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean"
  }
 },
 {
  "id": "ml-projectivespectrum-gc-ideal",
  "latex": "@GaloisConnection (Ideal A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun I => zeroLocus 𝒜 I) fun t => (vanishingIdeal t).toIdeal",
  "name": "gc_ideal",
  "en": "ProjectiveSpectrum.gc_ideal",
  "importance": 0.78,
  "family": "scheme",
  "summary": "zeroLocus and vanishingIdeal form a Galois connection.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ProjectiveSpectrum.gc_ideal\n类型签名：: @GaloisConnection (Ideal A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun I => zeroLocus 𝒜 I) fun t => (vanishingIdeal t).toIdeal\n\nzeroLocus and vanishingIdeal form a Galois connection.\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Topology\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Topology",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Topology.lean",
  "formal": true,
  "lean": {
   "full": "ProjectiveSpectrum.gc_ideal",
   "kind": "theorem",
   "signature": ": @GaloisConnection (Ideal A) (Set (ProjectiveSpectrum 𝒜))ᵒᵈ _ _ (fun I => zeroLocus 𝒜 I) fun t => (vanishingIdeal t).toIdeal",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Topology.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-projective-smul-equiv",
  "latex": "u • P ≈ P",
  "name": "smul_equiv",
  "en": "WeierstrassCurve.Projective.smul_equiv",
  "importance": 0.71,
  "family": "scheme",
  "summary": "The equivalence class of a projective point representative on a Weierstrass curve.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Projective.smul_equiv\n类型签名：(P : Fin 3 → R) {u : R} (hu : IsUnit u) : u • P ≈ P\n\nThe equivalence class of a projective point representative on a Weierstrass curve.\n\n文件：AlgebraicGeometry/EllipticCurve/Projective/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Projective/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Projective.smul_equiv",
   "kind": "lemma",
   "signature": "(P : Fin 3 → R) {u : R} (hu : IsUnit u) : u • P ≈ P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-7e762294",
  "latex": "f.equiv g ↔ (f.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain.2) inf_le_left).hom = (g.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain. …",
  "name": "equiv_iff_of_isSeparated",
  "en": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated",
  "importance": 0.86,
  "family": "scheme",
  "summary": "Two partial maps from reduced schemes to separated schemes are equivalent if and only if they are equal on the intersection of the domains.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated\n类型签名：[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} [f.IsOver S] [g.IsOver S] : f.equiv g ↔ (f.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain.2) inf_le_left).hom = (g.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain.2) inf_le_right).hom\n\nTwo partial maps from reduced schemes to separated schemes are equivalent if and only if they are equal on the intersection of the domains.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} [f.IsOver S] [g.IsOver S] : f.equiv g ↔ (f.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain.2) inf_le_left).hom = (g.restrict _ (f.2.inter_of_isOpen_left g.2 f.domain.2) inf_le_right).hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-variablechange-mul-def",
  "latex": "C * C' = { u",
  "name": "mul_def",
  "en": "WeierstrassCurve.VariableChange.mul_def",
  "importance": 0.65,
  "family": "scheme",
  "summary": "The composition of two linear changes of variables given by matrix multiplication.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.VariableChange.mul_def\n类型签名：: C * C' = { u\n\nThe composition of two linear changes of variables given by matrix multiplication.\n\n文件：AlgebraicGeometry/EllipticCurve/VariableChange\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/VariableChange",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.VariableChange.mul_def",
   "kind": "lemma",
   "signature": ": C * C' = { u",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean"
  }
 },
 {
  "id": "ml-spectoequivoflocalring-eq-iff",
  "latex": "f₁.1 = f₂.1, f₁.2.1 = (X.presheaf.stalkCongr (",
  "name": "SpecToEquivOfLocalRing_eq_iff",
  "en": "SpecToEquivOfLocalRing_eq_iff",
  "importance": 0.79,
  "family": "scheme",
  "summary": "useful lemma for applications of SpecToEquivOfLocalRing",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：SpecToEquivOfLocalRing_eq_iff\n类型签名：{f₁ f₂ : Σ x, { f : X.presheaf.stalk x ⟶ R // IsLocalHom f.hom }} : f₁ = f₂ ↔ ∃ h₁ : f₁.1 = f₂.1, f₁.2.1 = (X.presheaf.stalkCongr (\n\nuseful lemma for applications of SpecToEquivOfLocalRing\n\n文件：AlgebraicGeometry/Stalk\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Stalk",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Stalk.lean",
  "formal": true,
  "lean": {
   "full": "SpecToEquivOfLocalRing_eq_iff",
   "kind": "lemma",
   "signature": "{f₁ f₂ : Σ x, { f : X.presheaf.stalk x ⟶ R // IsLocalHom f.hom }} : f₁ = f₂ ↔ ∃ h₁ : f₁.1 = f₂.1, f₁.2.1 = (X.presheaf.stalkCongr (",
   "file": "Mathlib/AlgebraicGeometry/Stalk.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-right-triangle",
  "latex": "identityToΓSpec.app (Spec.toLocallyRingedSpace.obj <| op R) ≫ Spec.toLocallyRingedSpace.map (SpecΓIdentity.inv.app R).op = 𝟙 _",
  "name": "right_triangle",
  "en": "AlgebraicGeometry.right_triangle",
  "importance": 0.79,
  "family": "scheme",
  "summary": "SpecΓIdentity is iso so these are mutually two-sided inverses.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.right_triangle\n类型签名：(R : CommRingCat) : identityToΓSpec.app (Spec.toLocallyRingedSpace.obj <| op R) ≫ Spec.toLocallyRingedSpace.map (SpecΓIdentity.inv.app R).op = 𝟙 _\n\nSpecΓIdentity is iso so these are mutually two-sided inverses.\n\n文件：AlgebraicGeometry/GammaSpecAdjunction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/GammaSpecAdjunction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.right_triangle",
   "kind": "theorem",
   "signature": "(R : CommRingCat) : identityToΓSpec.app (Spec.toLocallyRingedSpace.obj <| op R) ≫ Spec.toLocallyRingedSpace.map (SpecΓIdentity.inv.app R).op = 𝟙 _",
   "file": "Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-addx-self-of-y-ne",
  "latex": "W.addX x x (W.slope x x y y) = (x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈) / (4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆)",
  "name": "addX_self_of_Y_ne",
  "en": "WeierstrassCurve.addX_self_of_Y_ne",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The explicit duplication formula for the x-coordinate when 2*P ≠ 0.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.addX_self_of_Y_ne\n类型签名：{x y : F} (h : W.Equation x y) (hn : y ≠ W.negY x y) : W.addX x x (W.slope x x y y) = (x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈) / (4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆)\n\nThe explicit duplication formula for the x-coordinate when 2*P ≠ 0.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Formula\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Formula",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.addX_self_of_Y_ne",
   "kind": "lemma",
   "signature": "{x y : F} (h : W.Equation x y) (hn : y ≠ W.negY x y) : W.addX x x (W.slope x x y y) = (x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈) / (4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆)",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Formula.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isiso-of-comp-eq-sigmaspec",
  "latex": "{V : Scheme} (f : (∐ fun i ↦ Spec (R i)) ⟶ V) (g : V ⟶ Spec (.of <| Π i, R i)) (hU' : f ≫ g = sigmaSpec R) : IsIso g",
  "name": "isIso_of_comp_eq_sigmaSpec",
  "en": "AlgebraicGeometry.isIso_of_comp_eq_sigmaSpec",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If V is a locally closed subscheme of Spec (Π Rᵢ) containing ∐ Spec Rᵢ, then V = Spec (Π Rᵢ).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isIso_of_comp_eq_sigmaSpec\n类型签名：{V : Scheme} (f : (∐ fun i ↦ Spec (R i)) ⟶ V) (g : V ⟶ Spec (.of <| Π i, R i)) [IsImmersion g] [CompactSpace V] (hU' : f ≫ g = sigmaSpec R) : IsIso g\n\nIf V is a locally closed subscheme of Spec (Π Rᵢ) containing ∐ Spec Rᵢ, then V = Spec (Π Rᵢ).\n\n文件：AlgebraicGeometry/PointsPi\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/PointsPi",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/PointsPi.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isIso_of_comp_eq_sigmaSpec",
   "kind": "lemma",
   "signature": "{V : Scheme} (f : (∐ fun i ↦ Spec (R i)) ⟶ V) (g : V ⟶ Spec (.of <| Π i, R i)) [IsImmersion g] [CompactSpace V] (hU' : f ≫ g = sigmaSpec R) : IsIso g",
   "file": "Mathlib/AlgebraicGeometry/PointsPi.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyconnected-eq-geometrically",
  "latex": "@GeometricallyConnected = geometrically (ConnectedSpace ·)",
  "name": "GeometricallyConnected.eq_geometrically",
  "en": "AlgebraicGeometry.GeometricallyConnected.eq_geometrically",
  "importance": 0.76,
  "family": "scheme",
  "summary": "We say that a morphism f : X ⟶ Y is geometrically connected if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is connected.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyConnected.eq_geometrically\n类型签名：: @GeometricallyConnected = geometrically (ConnectedSpace ·)\n\nWe say that a morphism f : X ⟶ Y is geometrically connected if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is connected.\n\n文件：AlgebraicGeometry/Geometrically/Connected\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Connected",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Connected.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyConnected.eq_geometrically",
   "kind": "lemma",
   "signature": ": @GeometricallyConnected = geometrically (ConnectedSpace ·)",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Connected.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyreduced-eq-geometrically",
  "latex": "@GeometricallyReduced = geometrically IsReduced",
  "name": "GeometricallyReduced.eq_geometrically",
  "en": "AlgebraicGeometry.GeometricallyReduced.eq_geometrically",
  "importance": 0.74,
  "family": "scheme",
  "summary": "We say that morphism f : X ⟶ Y is geometrically reduced if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is reduced.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyReduced.eq_geometrically\n类型签名：: @GeometricallyReduced = geometrically IsReduced\n\nWe say that morphism f : X ⟶ Y is geometrically reduced if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is reduced.\n\n文件：AlgebraicGeometry/Geometrically/Reduced\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Reduced",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Reduced.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyReduced.eq_geometrically",
   "kind": "lemma",
   "signature": ": @GeometricallyReduced = geometrically IsReduced",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Reduced.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyintegral-eq-geometrically",
  "latex": "@GeometricallyIntegral = geometrically IsIntegral",
  "name": "GeometricallyIntegral.eq_geometrically",
  "en": "AlgebraicGeometry.GeometricallyIntegral.eq_geometrically",
  "importance": 0.75,
  "family": "scheme",
  "summary": "We say that morphism f : X ⟶ Y is geometrically integral if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is integral.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyIntegral.eq_geometrically\n类型签名：: @GeometricallyIntegral = geometrically IsIntegral\n\nWe say that morphism f : X ⟶ Y is geometrically integral if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is integral.\n\n文件：AlgebraicGeometry/Geometrically/Integral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Integral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Integral.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyIntegral.eq_geometrically",
   "kind": "lemma",
   "signature": ": @GeometricallyIntegral = geometrically IsIntegral",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Integral.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-propqcprecoverage-le-precoverage",
  "latex": "propQCPrecoverage P ≤ precoverage P",
  "name": "propQCPrecoverage_le_precoverage",
  "en": "AlgebraicGeometry.Scheme.propQCPrecoverage_le_precoverage",
  "importance": 0.72,
  "family": "scheme",
  "summary": "The qc-precoverage of a scheme wrt. to a morphism property P is the precoverage given by quasi-compact covers satisfying P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.propQCPrecoverage_le_precoverage\n类型签名：: propQCPrecoverage P ≤ precoverage P\n\nThe qc-precoverage of a scheme wrt. to a morphism property P is the precoverage given by quasi-compact covers satisfying P.\n\n文件：AlgebraicGeometry/Sites/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.propQCPrecoverage_le_precoverage",
   "kind": "lemma",
   "signature": ": propQCPrecoverage P ≤ precoverage P",
   "file": "Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyirreducible-eq-geometri-b60f4f78",
  "latex": "@GeometricallyIrreducible = geometrically (IrreducibleSpace ·)",
  "name": "GeometricallyIrreducible.eq_geometrically",
  "en": "AlgebraicGeometry.GeometricallyIrreducible.eq_geometrically",
  "importance": 0.77,
  "family": "scheme",
  "summary": "We say that morphism f : X ⟶ Y is geometrically irreducible if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is irreducible.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyIrreducible.eq_geometrically\n类型签名：: @GeometricallyIrreducible = geometrically (IrreducibleSpace ·)\n\nWe say that morphism f : X ⟶ Y is geometrically irreducible if for all Spec K ⟶ Y with K a field, X ×[Y] Spec K is irreducible.\n\n文件：AlgebraicGeometry/Geometrically/Irreducible\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Irreducible",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Irreducible.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyIrreducible.eq_geometrically",
   "kind": "lemma",
   "signature": ": @GeometricallyIrreducible = geometrically (IrreducibleSpace ·)",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Irreducible.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-variablechange-inv-def",
  "latex": "C⁻¹ = { u",
  "name": "inv_def",
  "en": "WeierstrassCurve.VariableChange.inv_def",
  "importance": 0.64,
  "family": "scheme",
  "summary": "The inverse of a linear change of variables given by matrix inversion.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.VariableChange.inv_def\n类型签名：: C⁻¹ = { u\n\nThe inverse of a linear change of variables given by matrix inversion.\n\n文件：AlgebraicGeometry/EllipticCurve/VariableChange\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/VariableChange",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.VariableChange.inv_def",
   "kind": "lemma",
   "signature": ": C⁻¹ = { u",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-variablechange-one-def",
  "latex": "= ⟨1, 0, 0, 0⟩",
  "name": "one_def",
  "en": "WeierstrassCurve.VariableChange.one_def",
  "importance": 0.68,
  "family": "scheme",
  "summary": "The identity linear change of variables given by the identity matrix.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.VariableChange.one_def\n类型签名：: (1 : VariableChange R) = ⟨1, 0, 0, 0⟩\n\nThe identity linear change of variables given by the identity matrix.\n\n文件：AlgebraicGeometry/EllipticCurve/VariableChange\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/VariableChange",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.VariableChange.one_def",
   "kind": "lemma",
   "signature": ": (1 : VariableChange R) = ⟨1, 0, 0, 0⟩",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/VariableChange.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-jacobian-point-mk-point",
  "latex": ".point = P",
  "name": "mk_point",
  "en": "WeierstrassCurve.Jacobian.Point.mk_point",
  "importance": 0.73,
  "family": "scheme",
  "summary": "The nonsingular condition underlying a nonsingular Jacobian point on W.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Jacobian.Point.mk_point\n类型签名：{P : PointClass R} (h : W'.NonsingularLift P) : (mk h).point = P\n\nThe nonsingular condition underlying a nonsingular Jacobian point on W.\n\n文件：AlgebraicGeometry/EllipticCurve/Jacobian/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Jacobian/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Jacobian.Point.mk_point",
   "kind": "lemma",
   "signature": "{P : PointClass R} (h : W'.NonsingularLift P) : (mk h).point = P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Point.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-spec-fromspecstalk-eq",
  "latex": ".fromSpecStalk x = Spec.map (StructureSheaf.toStalk R _)",
  "name": "Spec.fromSpecStalk_eq'",
  "en": "AlgebraicGeometry.Spec.fromSpecStalk_eq'",
  "importance": 0.73,
  "family": "scheme",
  "summary": "A variant of Spec.fromSpecStalk_eq that breaks abstraction boundaries.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Spec.fromSpecStalk_eq'\n类型签名：: (Spec R).fromSpecStalk x = Spec.map (StructureSheaf.toStalk R _)\n\nA variant of Spec.fromSpecStalk_eq that breaks abstraction boundaries.\n\n文件：AlgebraicGeometry/Stalk\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Stalk",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Stalk.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Spec.fromSpecStalk_eq'",
   "kind": "lemma",
   "signature": ": (Spec R).fromSpecStalk x = Spec.map (StructureSheaf.toStalk R _)",
   "file": "Mathlib/AlgebraicGeometry/Stalk.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-projective-point-mk-point",
  "latex": ".point = P",
  "name": "mk_point",
  "en": "WeierstrassCurve.Projective.Point.mk_point",
  "importance": 0.73,
  "family": "scheme",
  "summary": "The nonsingular condition underlying a nonsingular projective point on W.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Projective.Point.mk_point\n类型签名：{P : PointClass R} (h : W'.NonsingularLift P) : (mk h).point = P\n\nThe nonsingular condition underlying a nonsingular projective point on W.\n\n文件：AlgebraicGeometry/EllipticCurve/Projective/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Projective/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Projective.Point.mk_point",
   "kind": "lemma",
   "signature": "{P : PointClass R} (h : W'.NonsingularLift P) : (mk h).point = P",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Point.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-proj-isup-basicopen-eq-top",
  "latex": "⨆ i, Proj.basicOpen 𝒜 (f i) = ⊤",
  "name": "iSup_basicOpen_eq_top'",
  "en": "AlgebraicGeometry.Proj.iSup_basicOpen_eq_top'",
  "importance": 0.81,
  "family": "scheme",
  "summary": "If { xᵢ } are homogeneous and span A as an A₀ algebra, then D₊(xᵢ) covers Proj A.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Proj.iSup_basicOpen_eq_top'\n类型签名：{ι : Type*} (f : ι → A) (hfn : ∀ i, ∃ n, f i ∈ 𝒜 n) (hf : Algebra.adjoin (𝒜 0) (Set.range f) = ⊤) : ⨆ i, Proj.basicOpen 𝒜 (f i) = ⊤\n\nIf { xᵢ } are homogeneous and span A as an A₀ algebra, then D₊(xᵢ) covers Proj A.\n\n文件：AlgebraicGeometry/ProjectiveSpectrum/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ProjectiveSpectrum/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Proj.iSup_basicOpen_eq_top'",
   "kind": "lemma",
   "signature": "{ι : Type*} (f : ι → A) (hfn : ∀ i, ∃ n, f i ∈ 𝒜 n) (hf : Algebra.adjoin (𝒜 0) (Set.range f) = ⊤) : ⨆ i, Proj.basicOpen 𝒜 (f i) = ⊤",
   "file": "Mathlib/AlgebraicGeometry/ProjectiveSpectrum/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isfield-stalk-of-closure-mem-irreduc-3c1413f9",
  "latex": "IsField (X.presheaf.stalk x)",
  "name": "isField_stalk_of_closure_mem_irreducibleComponents",
  "en": "AlgebraicGeometry.isField_stalk_of_closure_mem_irreducibleComponents",
  "importance": 0.84,
  "family": "scheme",
  "summary": "If X is reduced and has finitely many irreducible components, then the stalks at the generic points of the irreducible components are fields.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isField_stalk_of_closure_mem_irreducibleComponents\n类型签名：(x : X) (hx : closure {x} ∈ irreducibleComponents X) [IsReduced X] : IsField (X.presheaf.stalk x)\n\nIf X is reduced and has finitely many irreducible components, then the stalks at the generic points of the irreducible components are fields.\n\n文件：AlgebraicGeometry/Properties\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Properties",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Properties.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isField_stalk_of_closure_mem_irreducibleComponents",
   "kind": "lemma",
   "signature": "(x : X) (hx : closure {x} ∈ irreducibleComponents X) [IsReduced X] : IsField (X.presheaf.stalk x)",
   "file": "Mathlib/AlgebraicGeometry/Properties.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-spec-map-surjective",
  "latex": "Function.Surjective (Spec.map : (R ⟶ S) → _)",
  "name": "Spec.map_surjective",
  "en": "AlgebraicGeometry.Spec.map_surjective",
  "importance": 0.72,
  "family": "scheme",
  "summary": "Useful for replacing f by Spec.map φ everywhere in proofs.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Spec.map_surjective\n类型签名：{R S : CommRingCat} : Function.Surjective (Spec.map : (R ⟶ S) → _)\n\nUseful for replacing f by Spec.map φ everywhere in proofs.\n\n文件：AlgebraicGeometry/GammaSpecAdjunction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/GammaSpecAdjunction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Spec.map_surjective",
   "kind": "lemma",
   "signature": "{R S : CommRingCat} : Function.Surjective (Spec.map : (R ⟶ S) → _)",
   "file": "Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isregularepi-of-flat-of-surjective-o-53c428b9",
  "latex": "IsRegularEpi π",
  "name": "isRegularEpi_of_flat_of_surjective_of_isAffine",
  "en": "AlgebraicGeometry.isRegularEpi_of_flat_of_surjective_of_isAffine",
  "importance": 0.83,
  "family": "scheme",
  "summary": "If π : X ⟶ Y is a flat and surjective morphism between affine schemes, then π is a regular epimorphism in the category of schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isRegularEpi_of_flat_of_surjective_of_isAffine\n类型签名：{X Y : Scheme.{u}} [IsAffine X] [IsAffine Y] (π : X ⟶ Y) [Surjective π] [Flat π] : IsRegularEpi π\n\nIf π : X ⟶ Y is a flat and surjective morphism between affine schemes, then π is a regular epimorphism in the category of schemes.\n\n文件：AlgebraicGeometry/EffectiveEpi\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EffectiveEpi",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EffectiveEpi.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isRegularEpi_of_flat_of_surjective_of_isAffine",
   "kind": "lemma",
   "signature": "{X Y : Scheme.{u}} [IsAffine X] [IsAffine Y] (π : X ⟶ Y) [Surjective π] [Flat π] : IsRegularEpi π",
   "file": "Mathlib/AlgebraicGeometry/EffectiveEpi.lean"
  }
 },
 {
  "id": "ml-scheme-opencover-exists-of-iscofiltered-of-finite",
  "latex": "∃ (i : I) (R : 𝒰.I₀ → CommRingCat.{u}) (f : ∀ (a : 𝒰.I₀), Spec (R a) ⟶ (D.obj i)) (_ : Presieve.ofArrows _ f ∈ zariskiPrecoverage _) (g :  …",
  "name": "Scheme.OpenCover.exists_of_isCofiltered_of_finite",
  "en": "Scheme.OpenCover.exists_of_isCofiltered_of_finite",
  "importance": 0.81,
  "family": "scheme",
  "summary": "Variant of Scheme.exists_isOpenCover_and_isAffine_of_finite in terms of Scheme.OpenCover.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Scheme.OpenCover.exists_of_isCofiltered_of_finite\n类型签名：[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] (𝒰 : OpenCover.{w} c.pt) [∀ i, IsAffine (𝒰.X i)] [Finite 𝒰.I₀] : ∃ (i : I) (R : 𝒰.I₀ → CommRingCat.{u}) (f : ∀ (a : 𝒰.I₀), Spec (R a) ⟶ (D.obj i)) (_ : Presieve.ofArrows _ f ∈ zariskiPrecoverage _) (g : ∀ (j : 𝒰.I₀), 𝒰.X j ⟶ Spec (R j)), ∀ (j : 𝒰.I₀), IsPullback (g j) (𝒰.f j) (f j) (c.π.app i)\n\nVariant of Scheme.exists_isOpenCover_and_isAffine_of_finite in terms of Scheme.OpenCover.\n\n文件：AlgebraicGeometry/AffineTransitionLimit\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineTransitionLimit",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean",
  "formal": true,
  "lean": {
   "full": "Scheme.OpenCover.exists_of_isCofiltered_of_finite",
   "kind": "lemma",
   "signature": "[IsCofiltered I] [∀ {i j} (f : i ⟶ j), IsAffineHom (D.map f)] [∀ (i : I), CompactSpace (D.obj i)] [∀ (i : I), QuasiSeparatedSpace (D.obj i)] (𝒰 : OpenCover.{w} c.pt) [∀ i, IsAffine (𝒰.X i)] [Finite 𝒰.I₀] : ∃ (i : I) (R : 𝒰.I₀ → CommRingCat.{u}) (f : ∀ (a : 𝒰.I₀), Spec (R a) ⟶ (D.obj i)) (_ : Presieve.ofArrows _ f ∈ zariskiPrecoverage _) (g : ∀ (j : 𝒰.I₀), 𝒰.X j ⟶ Spec (R j)), ∀ (j : 𝒰.I₀), IsPullback (g j) (𝒰.f j) (f j) (c.π.app i)",
   "file": "Mathlib/AlgebraicGeometry/AffineTransitionLimit.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-app-invapp",
  "latex": "f.app U ≫ (f.appIso (f ⁻¹ᵁ U)).inv = Y.presheaf.map (eqToHom (Opens.ext <|",
  "name": "app_invApp'",
  "en": "AlgebraicGeometry.Scheme.Hom.app_invApp'",
  "importance": 0.79,
  "family": "scheme",
  "summary": "A variant of app_invApp that gives an eqToHom instead of homOfLE.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.app_invApp'\n类型签名：(U) (hU : U ≤ f.opensRange) : f.app U ≫ (f.appIso (f ⁻¹ᵁ U)).inv = Y.presheaf.map (eqToHom (Opens.ext <|\n\nA variant of app_invApp that gives an eqToHom instead of homOfLE.\n\n文件：AlgebraicGeometry/OpenImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/OpenImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/OpenImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.app_invApp'",
   "kind": "theorem",
   "signature": "(U) (hU : U ≤ f.opensRange) : f.app U ≫ (f.appIso (f ⁻¹ᵁ U)).inv = Y.presheaf.map (eqToHom (Opens.ext <|",
   "file": "Mathlib/AlgebraicGeometry/OpenImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-map-ideal",
  "latex": ".map (X.presheaf.map h).hom = I.ideal U",
  "name": "map_ideal'",
  "en": "AlgebraicGeometry.Scheme.map_ideal'",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A form of map_ideal that is easier to rewrite with.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.map_ideal'\n类型签名：{U V : X.affineOpens} (h : Opposite.op V.1 ⟶ .op U.1) : (I.ideal V).map (X.presheaf.map h).hom = I.ideal U\n\nA form of map_ideal that is easier to rewrite with.\n\n文件：AlgebraicGeometry/IdealSheaf/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/IdealSheaf/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/IdealSheaf/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.map_ideal'",
   "kind": "lemma",
   "signature": "{U V : X.affineOpens} (h : Opposite.op V.1 ⟶ .op U.1) : (I.ideal V).map (X.presheaf.map h).hom = I.ideal U",
   "file": "Mathlib/AlgebraicGeometry/IdealSheaf/Basic.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-xrep-add-of-x-ne",
  "latex": ".xRep = !",
  "name": "xRep_add_of_X_ne",
  "en": "WeierstrassCurve.Point.xRep_add_of_X_ne",
  "importance": 0.79,
  "family": "scheme",
  "summary": "We give an explicit expression for xRep of P + Q when P ≠ ±Q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.xRep_add_of_X_ne\n类型签名：{xP yP xQ yQ : F} (hP : W.Nonsingular xP yP) (hQ : W.Nonsingular xQ yQ) (hn : xP ≠ xQ) : (some xP yP hP + some xQ yQ hQ).xRep = ![((yP - yQ) ^ 2 + W.a₁ * (yP - yQ) * (xP - xQ) - (W.a₂ + xP + xQ) * (xP - xQ) ^2) / (xP - xQ) ^ 2, 1]\n\nWe give an explicit expression for xRep of P + Q when P ≠ ±Q.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.xRep_add_of_X_ne",
   "kind": "lemma",
   "signature": "{xP yP xQ yQ : F} (hP : W.Nonsingular xP yP) (hQ : W.Nonsingular xQ yQ) (hn : xP ≠ xQ) : (some xP yP hP + some xQ yQ hQ).xRep = ![((yP - yQ) ^ 2 + W.a₁ * (yP - yQ) * (xP - xQ) - (W.a₂ + xP + xQ) * (xP - xQ) ^2) / (xP - xQ) ^ 2, 1]",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-xrep-sub-of-x-ne",
  "latex": ".xRep = !",
  "name": "xRep_sub_of_X_ne",
  "en": "WeierstrassCurve.Point.xRep_sub_of_X_ne",
  "importance": 0.79,
  "family": "scheme",
  "summary": "We give an explicit expression for xRep of P - Q when P ≠ ±Q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.xRep_sub_of_X_ne\n类型签名：{xP yP xQ yQ : F} (hP : W.Nonsingular xP yP) (hQ : W.Nonsingular xQ yQ) (hn : xP ≠ xQ) : (some xP yP hP - some xQ yQ hQ).xRep = ![((yP + yQ + W.a₁ * xQ + W.a₃) ^ 2 + W.a₁ * (yP + yQ + W.a₁ * xQ + W.a₃) * (xP - xQ) - (W.a₂ + xP + xQ) * (xP - xQ) ^2) / (xP - xQ) ^ 2, 1]\n\nWe give an explicit expression for xRep of P - Q when P ≠ ±Q.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.xRep_sub_of_X_ne",
   "kind": "lemma",
   "signature": "{xP yP xQ yQ : F} (hP : W.Nonsingular xP yP) (hQ : W.Nonsingular xQ yQ) (hn : xP ≠ xQ) : (some xP yP hP - some xQ yQ hQ).xRep = ![((yP + yQ + W.a₁ * xQ + W.a₃) ^ 2 + W.a₁ * (yP + yQ + W.a₁ * xQ + W.a₃) * (xP - xQ) - (W.a₂ + xP + xQ) * (xP - xQ) ^2) / (xP - xQ) ^ 2, 1]",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-5ddfb69e",
  "latex": "{f g : X.PartialMap Y} {W : X.Opens} (hW : Dense (X",
  "name": "equiv_iff_of_isSeparated_of_le",
  "en": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated_of_le",
  "importance": 0.85,
  "family": "scheme",
  "summary": "Two partial maps from reduced schemes to separated schemes are equivalent if and only if they are equal on **any** open dense subset.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated_of_le\n类型签名：[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} [f.IsOver S] [g.IsOver S] {W : X.Opens} (hW : Dense (X\n\nTwo partial maps from reduced schemes to separated schemes are equivalent if and only if they are equal on **any** open dense subset.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_isSeparated_of_le",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} [f.IsOver S] [g.IsOver S] {W : X.Opens} (hW : Dense (X",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-isroot-twotorsionpolynomial-of--b887b49e",
  "latex": "W.twoTorsionPolynomial.toPoly.IsRoot x",
  "name": "isRoot_twoTorsionPolynomial_of_add_self",
  "en": "WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_of_add_self",
  "importance": 0.84,
  "family": "scheme",
  "summary": "A nonzero affine 2-torsion point some x y h of W (that is, P + P = 0) has X-coordinate a root of W.twoTorsionPolynomial.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_of_add_self\n类型签名：{x y : F} (h : W.Nonsingular x y) (hP : some x y h + some x y h = 0) : W.twoTorsionPolynomial.toPoly.IsRoot x\n\nA nonzero affine 2-torsion point some x y h of W (that is, P + P = 0) has X-coordinate a root of W.twoTorsionPolynomial.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.isRoot_twoTorsionPolynomial_of_add_self",
   "kind": "theorem",
   "signature": "{x y : F} (h : W.Nonsingular x y) (hP : some x y h + some x y h = 0) : W.twoTorsionPolynomial.toPoly.IsRoot x",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-xrep-add-self-of-y-eq",
  "latex": ".xRep = !",
  "name": "xRep_add_self_of_Y_eq",
  "en": "WeierstrassCurve.Point.xRep_add_self_of_Y_eq",
  "importance": 0.78,
  "family": "scheme",
  "summary": "We give an explicit expression for xRep of P + P when P ≠ 0 and 2*P = 0.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.xRep_add_self_of_Y_eq\n类型签名：{x y : F} (h : W.Nonsingular x y) (hn : y = W.negY x y) : (some x y h + some x y h).xRep = ![1, 0]\n\nWe give an explicit expression for xRep of P + P when P ≠ 0 and 2*P = 0.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.xRep_add_self_of_Y_eq",
   "kind": "lemma",
   "signature": "{x y : F} (h : W.Nonsingular x y) (hn : y = W.negY x y) : (some x y h + some x y h).xRep = ![1, 0]",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-proetaletopology-eq-propqctop-979c5203",
  "latex": "proetaleTopology = propQCTopology @WeaklyEtale",
  "name": "proetaleTopology_eq_propQCTopology",
  "en": "AlgebraicGeometry.Scheme.proetaleTopology_eq_propQCTopology",
  "importance": 0.73,
  "family": "scheme",
  "summary": "Big pro-étale site: the pro-étale topology on the category of schemes is generated by the pro-étale precoverage.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.proetaleTopology_eq_propQCTopology\n类型签名：: proetaleTopology = propQCTopology @WeaklyEtale\n\nBig pro-étale site: the pro-étale topology on the category of schemes is generated by the pro-étale precoverage.\n\n文件：AlgebraicGeometry/Sites/Proetale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Proetale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Proetale.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.proetaleTopology_eq_propQCTopology",
   "kind": "lemma",
   "signature": ": proetaleTopology = propQCTopology @WeaklyEtale",
   "file": "Mathlib/AlgebraicGeometry/Sites/Proetale.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-equiv-topartialmap-6bf9b239",
  "latex": "f.equiv g.toPartialMap ↔ f.hom = f.domain.ι ≫ g",
  "name": "equiv_toPartialMap_iff_of_isSeparated",
  "en": "AlgebraicGeometry.Scheme.PartialMap.equiv_toPartialMap_iff_of_isSeparated",
  "importance": 0.86,
  "family": "scheme",
  "summary": "A partial map from a reduced scheme to a separated scheme is equivalent to a morphism if and only if it is equal to the restriction of the morphism.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.equiv_toPartialMap_iff_of_isSeparated\n类型签名：[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f : X.PartialMap Y} {g : X ⟶ Y} [f.IsOver S] [g.IsOver S] : f.equiv g.toPartialMap ↔ f.hom = f.domain.ι ≫ g\n\nA partial map from a reduced scheme to a separated scheme is equivalent to a morphism if and only if it is equal to the restriction of the morphism.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.equiv_toPartialMap_iff_of_isSeparated",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f : X.PartialMap Y} {g : X ⟶ Y} [f.IsOver S] [g.IsOver S] : f.equiv g.toPartialMap ↔ f.hom = f.domain.ι ≫ g",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isartinianscheme-spec",
  "latex": "IsArtinianScheme (Spec R) ↔ IsArtinianRing R",
  "name": "Scheme.isArtinianScheme_Spec",
  "en": "AlgebraicGeometry.Scheme.isArtinianScheme_Spec",
  "importance": 0.73,
  "family": "scheme",
  "summary": "A commutative ring R is Artinian if and only if Spec R is an Artinian scheme",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isArtinianScheme_Spec\n类型签名：{R : CommRingCat} : IsArtinianScheme (Spec R) ↔ IsArtinianRing R\n\nA commutative ring R is Artinian if and only if Spec R is an Artinian scheme\n\n文件：AlgebraicGeometry/Artinian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Artinian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Artinian.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isArtinianScheme_Spec",
   "kind": "theorem",
   "signature": "{R : CommRingCat} : IsArtinianScheme (Spec R) ↔ IsArtinianRing R",
   "file": "Mathlib/AlgebraicGeometry/Artinian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-locallyringedspace-tostalk-stalkmap-to",
  "latex": "toStalk _ _ ≫ X.toΓSpecSheafedSpace.hom.stalkMap x = X.presheaf.Γgerm x",
  "name": "toStalk_stalkMap_to",
  "en": "AlgebraicGeometry.LocallyRingedSpace.toStalk_stalkMap_to",
  "importance": 0.79,
  "family": "scheme",
  "summary": "The map on stalks induced by the unit commutes with maps from Γ(X) to stalks (in Spec Γ(X) and in X).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.LocallyRingedSpace.toStalk_stalkMap_to\n类型签名：ΓSpec (x : X) : toStalk _ _ ≫ X.toΓSpecSheafedSpace.hom.stalkMap x = X.presheaf.Γgerm x\n\nThe map on stalks induced by the unit commutes with maps from Γ(X) to stalks (in Spec Γ(X) and in X).\n\n文件：AlgebraicGeometry/GammaSpecAdjunction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/GammaSpecAdjunction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.LocallyRingedSpace.toStalk_stalkMap_to",
   "kind": "theorem",
   "signature": "ΓSpec (x : X) : toStalk _ _ ≫ X.toΓSpecSheafedSpace.hom.stalkMap x = X.presheaf.Γgerm x",
   "file": "Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean"
  }
 },
 {
  "id": "ml-finite-irreduciblecomponents-of-isnoetherian",
  "latex": ": (irreducibleComponents X).Finite",
  "name": "finite_irreducibleComponents_of_isNoetherian",
  "en": "finite_irreducibleComponents_of_isNoetherian",
  "importance": 0.7,
  "family": "scheme",
  "summary": "A Noetherian scheme has a finite number of irreducible components.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：finite_irreducibleComponents_of_isNoetherian\n类型签名：[IsNoetherian X] : (irreducibleComponents X).Finite\n\nA Noetherian scheme has a finite number of irreducible components.\n\n文件：AlgebraicGeometry/Noetherian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Noetherian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Noetherian.lean",
  "formal": true,
  "lean": {
   "full": "finite_irreducibleComponents_of_isNoetherian",
   "kind": "theorem",
   "signature": "[IsNoetherian X] : (irreducibleComponents X).Finite",
   "file": "Mathlib/AlgebraicGeometry/Noetherian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-idealsheafdata-map-gc",
  "latex": "GaloisConnection (comap · f) (map · f)",
  "name": "map_gc",
  "en": "AlgebraicGeometry.Scheme.IdealSheafData.map_gc",
  "importance": 0.68,
  "family": "scheme",
  "summary": "Pushforward and pullback of ideal sheaves forms a Galois connection.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.IdealSheafData.map_gc\n类型签名：: GaloisConnection (comap · f) (map · f)\n\nPushforward and pullback of ideal sheaves forms a Galois connection.\n\n文件：AlgebraicGeometry/IdealSheaf/Functorial\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/IdealSheaf/Functorial",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/IdealSheaf/Functorial.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.IdealSheafData.map_gc",
   "kind": "lemma",
   "signature": ": GaloisConnection (comap · f) (map · f)",
   "file": "Mathlib/AlgebraicGeometry/IdealSheaf/Functorial.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-point-xrep-add-self-of-y-ne",
  "latex": ".xRep = !",
  "name": "xRep_add_self_of_Y_ne",
  "en": "WeierstrassCurve.Point.xRep_add_self_of_Y_ne",
  "importance": 0.79,
  "family": "scheme",
  "summary": "We give an explicit expression for xRep of P + P when 2*P ≠ 0.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Point.xRep_add_self_of_Y_ne\n类型签名：{x y : F} (h : W.Nonsingular x y) (hn : y ≠ W.negY x y) : (some x y h + some x y h).xRep = ![(x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈) / (4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆), 1]\n\nWe give an explicit expression for xRep of P + P when 2*P ≠ 0.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/Point\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/Point",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Point.xRep_add_self_of_Y_ne",
   "kind": "lemma",
   "signature": "{x y : F} (h : W.Nonsingular x y) (hn : y ≠ W.negY x y) : (some x y h + some x y h).xRep = ![(x ^ 4 - W.b₄ * x ^ 2 - 2 * W.b₆ * x - W.b₈) / (4 * x ^ 3 + W.b₂ * x ^ 2 + 2 * W.b₄ * x + W.b₆), 1]",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/Point.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-fpqctopology-eq-propqctopology",
  "latex": "fpqcTopology = Scheme.propQCTopology @Flat",
  "name": "fpqcTopology_eq_propQCTopology",
  "en": "AlgebraicGeometry.Scheme.fpqcTopology_eq_propQCTopology",
  "importance": 0.71,
  "family": "scheme",
  "summary": "The fpqc topology on the category of schemes is topology generated by the fpqc precoverage.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.fpqcTopology_eq_propQCTopology\n类型签名：: fpqcTopology = Scheme.propQCTopology @Flat\n\nThe fpqc topology on the category of schemes is topology generated by the fpqc precoverage.\n\n文件：AlgebraicGeometry/Sites/Fpqc\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Fpqc",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Fpqc.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.fpqcTopology_eq_propQCTopology",
   "kind": "lemma",
   "signature": ": fpqcTopology = Scheme.propQCTopology @Flat",
   "file": "Mathlib/AlgebraicGeometry/Sites/Fpqc.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-isdominant-toratio-45be8304",
  "latex": "f.toRationalMap.IsDominant ↔ IsDominant f.hom",
  "name": "PartialMap.isDominant_toRationalMap_iff",
  "en": "AlgebraicGeometry.Scheme.PartialMap.isDominant_toRationalMap_iff",
  "importance": 0.77,
  "family": "scheme",
  "summary": "A rational map is dominant if some (equivalently, any) representative partial map has dominant underlying morphism.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.isDominant_toRationalMap_iff\n类型签名：(f : X.PartialMap Y) : f.toRationalMap.IsDominant ↔ IsDominant f.hom\n\nA rational map is dominant if some (equivalently, any) representative partial map has dominant underlying morphism.\n\n文件：AlgebraicGeometry/Birational/Dominant\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Dominant",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Dominant.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.isDominant_toRationalMap_iff",
   "kind": "lemma",
   "signature": "(f : X.PartialMap Y) : f.toRationalMap.IsDominant ↔ IsDominant f.hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/Dominant.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isquasiaffine-of-isimmersion",
  "latex": "X.IsQuasiAffine",
  "name": "IsQuasiAffine.of_isImmersion",
  "en": "AlgebraicGeometry.Scheme.IsQuasiAffine.of_isImmersion",
  "importance": 0.74,
  "family": "scheme",
  "summary": "Any quasicompact locally closed subscheme of a quasi-affine scheme is quasi-affine.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.IsQuasiAffine.of_isImmersion\n类型签名：[Y.IsQuasiAffine] [IsImmersion f] [CompactSpace X] : X.IsQuasiAffine\n\nAny quasicompact locally closed subscheme of a quasi-affine scheme is quasi-affine.\n\n文件：AlgebraicGeometry/QuasiAffine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/QuasiAffine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/QuasiAffine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.IsQuasiAffine.of_isImmersion",
   "kind": "lemma",
   "signature": "[Y.IsQuasiAffine] [IsImmersion f] [CompactSpace X] : X.IsQuasiAffine",
   "file": "Mathlib/AlgebraicGeometry/QuasiAffine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-ext-iff",
  "latex": "f.domain = g.domain, f.hom = (X.isoOfEq e).hom ≫ g.hom",
  "name": "ext_iff",
  "en": "AlgebraicGeometry.Scheme.PartialMap.ext_iff",
  "importance": 0.76,
  "family": "scheme",
  "summary": "A partial map is an S-map if the underlying morphism is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.ext_iff\n类型签名：(f g : X.PartialMap Y) : f = g ↔ ∃ e : f.domain = g.domain, f.hom = (X.isoOfEq e).hom ≫ g.hom\n\nA partial map is an S-map if the underlying morphism is.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.ext_iff",
   "kind": "lemma",
   "signature": "(f g : X.PartialMap Y) : f = g ↔ ∃ e : f.domain = g.domain, f.hom = (X.isoOfEq e).hom ≫ g.hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialiso-ext-iff",
  "latex": "f = g ↔ ∃ (e : f.source = g.source) (e' : g.target = f.target), f.iso = X.isoOfEq e ≪≫ g.iso ≪≫ Y.isoOfEq e'",
  "name": "ext_iff",
  "en": "AlgebraicGeometry.Scheme.PartialIso.ext_iff",
  "importance": 0.79,
  "family": "scheme",
  "summary": "A partial iso is an S-map if the underlying morphism is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialIso.ext_iff\n类型签名：(f g : X.PartialIso Y) : f = g ↔ ∃ (e : f.source = g.source) (e' : g.target = f.target), f.iso = X.isoOfEq e ≪≫ g.iso ≪≫ Y.isoOfEq e'\n\nA partial iso is an S-map if the underlying morphism is.\n\n文件：AlgebraicGeometry/Birational/Birational\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Birational",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Birational.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialIso.ext_iff",
   "kind": "lemma",
   "signature": "(f g : X.PartialIso Y) : f = g ↔ ∃ (e : f.source = g.source) (e' : g.target = f.target), f.iso = X.isoOfEq e ≪≫ g.iso ≪≫ Y.isoOfEq e'",
   "file": "Mathlib/AlgebraicGeometry/Birational/Birational.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-jacobian-polynomial-relation",
  "latex": "6 * eval P W'.polynomial = 2 * P x * eval P W'.polynomialX + 3 * P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ",
  "name": "polynomial_relation",
  "en": "WeierstrassCurve.Jacobian.polynomial_relation",
  "importance": 0.79,
  "family": "scheme",
  "summary": "Euler's homogeneous function theorem in Jacobian coordinates.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Jacobian.polynomial_relation\n类型签名：(P : Fin 3 → R) : 6 * eval P W'.polynomial = 2 * P x * eval P W'.polynomialX + 3 * P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ\n\nEuler's homogeneous function theorem in Jacobian coordinates.\n\n文件：AlgebraicGeometry/EllipticCurve/Jacobian/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Jacobian/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Jacobian.polynomial_relation",
   "kind": "theorem",
   "signature": "(P : Fin 3 → R) : 6 * eval P W'.polynomial = 2 * P x * eval P W'.polynomialX + 3 * P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Jacobian/Basic.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-affine-point-sym2x-add-sub-eq-addsubm-e425a41f",
  "latex": "F, t ≠ 0 ∧ t • sym2x (P + Q) (P - Q) = (addSubMap W · |>.eval <| sym2x P Q)",
  "name": "sym2x_add_sub_eq_addSubMap_sym2x",
  "en": "WeierstrassCurve.Affine.Point.sym2x_add_sub_eq_addSubMap_sym2x",
  "importance": 0.81,
  "family": "scheme",
  "summary": "sym2x (P + Q) (P - Q) is equal, up to scaling by a nonzero constant, to addSubMap W applied to sym2x P Q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Affine.Point.sym2x_add_sub_eq_addSubMap_sym2x\n类型签名：(P Q : W.Point) : ∃ t : F, t ≠ 0 ∧ t • sym2x (P + Q) (P - Q) = (addSubMap W · |>.eval <| sym2x P Q)\n\nsym2x (P + Q) (P - Q) is equal, up to scaling by a nonzero constant, to addSubMap W applied to sym2x P Q.\n\n文件：AlgebraicGeometry/EllipticCurve/Affine/AddSubMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Affine/AddSubMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Affine/AddSubMap.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Affine.Point.sym2x_add_sub_eq_addSubMap_sym2x",
   "kind": "lemma",
   "signature": "(P Q : W.Point) : ∃ t : F, t ≠ 0 ∧ t • sym2x (P + Q) (P - Q) = (addSubMap W · |>.eval <| sym2x P Q)",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Affine/AddSubMap.lean"
  }
 },
 {
  "id": "ml-weierstrasscurve-projective-polynomial-relation",
  "latex": "3 * eval P W'.polynomial = P x * eval P W'.polynomialX + P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ",
  "name": "polynomial_relation",
  "en": "WeierstrassCurve.Projective.polynomial_relation",
  "importance": 0.79,
  "family": "scheme",
  "summary": "Euler's homogeneous function theorem in projective coordinates.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：WeierstrassCurve.Projective.polynomial_relation\n类型签名：(P : Fin 3 → R) : 3 * eval P W'.polynomial = P x * eval P W'.polynomialX + P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ\n\nEuler's homogeneous function theorem in projective coordinates.\n\n文件：AlgebraicGeometry/EllipticCurve/Projective/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/EllipticCurve/Projective/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean",
  "formal": true,
  "lean": {
   "full": "WeierstrassCurve.Projective.polynomial_relation",
   "kind": "theorem",
   "signature": "(P : Fin 3 → R) : 3 * eval P W'.polynomial = P x * eval P W'.polynomialX + P y * eval P W'.polynomialY + P z * eval P W'.polynomialZ",
   "file": "Mathlib/AlgebraicGeometry/EllipticCurve/Projective/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-hom-appiso-hom",
  "latex": ".hom = f.appLE (f ''ᵁ U) U (preimage_image_eq f U).ge",
  "name": "appIso_hom'",
  "en": "AlgebraicGeometry.Scheme.Hom.appIso_hom'",
  "importance": 0.71,
  "family": "scheme",
  "summary": "A variant of appIso_hom that uses Hom.appLE.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Hom.appIso_hom'\n类型签名：(U) : (f.appIso U).hom = f.appLE (f ''ᵁ U) U (preimage_image_eq f U).ge\n\nA variant of appIso_hom that uses Hom.appLE.\n\n文件：AlgebraicGeometry/OpenImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/OpenImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/OpenImmersion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Hom.appIso_hom'",
   "kind": "theorem",
   "signature": "(U) : (f.appIso U).hom = f.appLE (f ''ᵁ U) U (preimage_image_eq f U).ge",
   "file": "Mathlib/AlgebraicGeometry/OpenImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-root-algebraicgeometry-ext-to-spec",
  "latex": "{X : Scheme} {R : Type*} {f g : X ⟶ Spec ↧R} (h : (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map f.op = (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map g.o …",
  "name": "_root_.AlgebraicGeometry.ext_to_Spec",
  "en": "AlgebraicGeometry._root_.AlgebraicGeometry.ext_to_Spec",
  "importance": 0.81,
  "family": "scheme",
  "summary": "Given f, g : X ⟶ Spec(R), if the two induced maps R ⟶ Γ(X) are equal, then f = g.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry._root_.AlgebraicGeometry.ext_to_Spec\n类型签名：{X : Scheme} {R : Type*} [CommRing R] {f g : X ⟶ Spec ↧R} (h : (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map f.op = (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map g.op) : f = g\n\nGiven f, g : X ⟶ Spec(R), if the two induced maps R ⟶ Γ(X) are equal, then f = g.\n\n文件：AlgebraicGeometry/GammaSpecAdjunction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/GammaSpecAdjunction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry._root_.AlgebraicGeometry.ext_to_Spec",
   "kind": "lemma",
   "signature": "{X : Scheme} {R : Type*} [CommRing R] {f g : X ⟶ Spec ↧R} (h : (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map f.op = (Scheme.ΓSpecIso ↧R).inv ≫ Scheme.Γ.map g.op) : f = g",
   "file": "Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-islocallyartinianscheme-spec",
  "latex": "IsLocallyArtinian (Spec R) ↔ IsArtinianRing R where mp _",
  "name": "Scheme.isLocallyArtinianScheme_Spec",
  "en": "AlgebraicGeometry.Scheme.isLocallyArtinianScheme_Spec",
  "importance": 0.75,
  "family": "scheme",
  "summary": "A commutative ring R is Artinian if and only if Spec R is an Artinian scheme.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.isLocallyArtinianScheme_Spec\n类型签名：{R : CommRingCat} : IsLocallyArtinian (Spec R) ↔ IsArtinianRing R where mp _\n\nA commutative ring R is Artinian if and only if Spec R is an Artinian scheme.\n\n文件：AlgebraicGeometry/Artinian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Artinian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Artinian.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.isLocallyArtinianScheme_Spec",
   "kind": "theorem",
   "signature": "{R : CommRingCat} : IsLocallyArtinian (Spec R) ↔ IsArtinianRing R where mp _",
   "file": "Mathlib/AlgebraicGeometry/Artinian.lean"
  }
 },
 {
  "id": "ml-isopenimmersion-app-eq-appiso-inv-app-of-comp-eq",
  "latex": "f.app V = (g.appIso V).inv ≫ fg.app (g ''ᵁ V) ≫ Y.presheaf.map (eqToHom <| IsOpenImmersion.app_eq_invApp_app_of_comp_eq_aux f g fg H V).op",
  "name": "app_eq_appIso_inv_app_of_comp_eq",
  "en": "IsOpenImmersion.app_eq_appIso_inv_app_of_comp_eq",
  "importance": 0.79,
  "family": "scheme",
  "summary": "The fg argument is to avoid nasty stuff about dependent types.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsOpenImmersion.app_eq_appIso_inv_app_of_comp_eq\n类型签名：{X Y U : Scheme.{u}} (f : Y ⟶ U) (g : U ⟶ X) (fg : Y ⟶ X) (H : fg = f ≫ g) [h : IsOpenImmersion g] (V : U.Opens) : f.app V = (g.appIso V).inv ≫ fg.app (g ''ᵁ V) ≫ Y.presheaf.map (eqToHom <| IsOpenImmersion.app_eq_invApp_app_of_comp_eq_aux f g fg H V).op\n\nThe fg argument is to avoid nasty stuff about dependent types.\n\n文件：AlgebraicGeometry/OpenImmersion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/OpenImmersion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/OpenImmersion.lean",
  "formal": true,
  "lean": {
   "full": "IsOpenImmersion.app_eq_appIso_inv_app_of_comp_eq",
   "kind": "theorem",
   "signature": "{X Y U : Scheme.{u}} (f : Y ⟶ U) (g : U ⟶ X) (fg : Y ⟶ X) (H : fg = f ≫ g) [h : IsOpenImmersion g] (V : U.Opens) : f.app V = (g.appIso V).inv ≫ fg.app (g ''ᵁ V) ≫ Y.presheaf.map (eqToHom <| IsOpenImmersion.app_eq_invApp_app_of_comp_eq_aux f g fg H V).op",
   "file": "Mathlib/AlgebraicGeometry/OpenImmersion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-birationalover-isrationalover",
  "latex": "IsRationalOver sX",
  "name": "BirationalOver.isRationalOver",
  "en": "AlgebraicGeometry.Scheme.BirationalOver.isRationalOver",
  "importance": 0.81,
  "family": "scheme",
  "summary": "If a scheme X is S-birational to an S-rational scheme Y, then X is S-rational.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.BirationalOver.isRationalOver\n类型签名：{S X Y : Scheme.{u}} (sX : X ⟶ S) (sY : Y ⟶ S) [IsRationalOver sY] (h : BirationalOver sX sY) : IsRationalOver sX\n\nIf a scheme X is S-birational to an S-rational scheme Y, then X is S-rational.\n\n文件：AlgebraicGeometry/Birational/Birational\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Birational",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Birational.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.BirationalOver.isRationalOver",
   "kind": "lemma",
   "signature": "{S X Y : Scheme.{u}} (sX : X ⟶ S) (sY : Y ⟶ S) [IsRationalOver sY] (h : BirationalOver sX sY) : IsRationalOver sX",
   "file": "Mathlib/AlgebraicGeometry/Birational/Birational.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-zariskitopology-eq",
  "latex": "zariskiTopology.{u} = zariskiPretopology.toGrothendieck",
  "name": "zariskiTopology_eq",
  "en": "AlgebraicGeometry.Scheme.zariskiTopology_eq",
  "importance": 0.7,
  "family": "scheme",
  "summary": "The Zariski topology on the category of schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.zariskiTopology_eq\n类型签名：: zariskiTopology.{u} = zariskiPretopology.toGrothendieck\n\nThe Zariski topology on the category of schemes.\n\n文件：AlgebraicGeometry/Sites/BigZariski\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/BigZariski",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/BigZariski.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.zariskiTopology_eq",
   "kind": "lemma",
   "signature": ": zariskiTopology.{u} = zariskiPretopology.toGrothendieck",
   "file": "Mathlib/AlgebraicGeometry/Sites/BigZariski.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-eq-zerolocus-of-isclosed-of-i-11543488",
  "latex": "Ideal Γ(X, ⊤), s = X.zeroLocus (U",
  "name": "eq_zeroLocus_of_isClosed_of_isAffine",
  "en": "AlgebraicGeometry.Scheme.eq_zeroLocus_of_isClosed_of_isAffine",
  "importance": 0.77,
  "family": "scheme",
  "summary": "If X is an affine scheme, every closed set of X is the zero locus of a set of global sections.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.eq_zeroLocus_of_isClosed_of_isAffine\n类型签名：[IsAffine X] (s : Set X) : IsClosed s ↔ ∃ I : Ideal Γ(X, ⊤), s = X.zeroLocus (U\n\nIf X is an affine scheme, every closed set of X is the zero locus of a set of global sections.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.eq_zeroLocus_of_isClosed_of_isAffine",
   "kind": "lemma",
   "signature": "[IsAffine X] (s : Set X) : IsClosed s ↔ ∃ I : Ideal Γ(X, ⊤), s = X.zeroLocus (U",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-precoverage-le-qcprecoverage--ed8a442c",
  "latex": "precoverage P ≤ qcPrecoverage",
  "name": "precoverage_le_qcPrecoverage_of_isOpenMap",
  "en": "AlgebraicGeometry.Scheme.precoverage_le_qcPrecoverage_of_isOpenMap",
  "importance": 0.82,
  "family": "scheme",
  "summary": "If P implies being an open map, the by P induced precoverage is coarser than the quasi-compact precoverage.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.precoverage_le_qcPrecoverage_of_isOpenMap\n类型签名：{P : MorphismProperty Scheme.{u}} (hP : P ≤ fun _ _ f ↦ IsOpenMap f.base) : precoverage P ≤ qcPrecoverage\n\nIf P implies being an open map, the by P induced precoverage is coarser than the quasi-compact precoverage.\n\n文件：AlgebraicGeometry/Sites/QuasiCompact\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/QuasiCompact",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.precoverage_le_qcPrecoverage_of_isOpenMap",
   "kind": "lemma",
   "signature": "{P : MorphismProperty Scheme.{u}} (hP : P ≤ fun _ _ f ↦ IsOpenMap f.base) : precoverage P ≤ qcPrecoverage",
   "file": "Mathlib/AlgebraicGeometry/Sites/QuasiCompact.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-domai-8717ce8a",
  "latex": "f.equiv g ↔ f = g",
  "name": "equiv_iff_of_domain_eq_of_isSeparated",
  "en": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_domain_eq_of_isSeparated",
  "importance": 0.84,
  "family": "scheme",
  "summary": "Two partial maps from reduced schemes to separated schemes with the same domain are equivalent if and only if they are equal.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_domain_eq_of_isSeparated\n类型签名：[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} (hfg : f.domain = g.domain) [f.IsOver S] [g.IsOver S] : f.equiv g ↔ f = g\n\nTwo partial maps from reduced schemes to separated schemes with the same domain are equivalent if and only if they are equal.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.equiv_iff_of_domain_eq_of_isSeparated",
   "kind": "lemma",
   "signature": "[X.Over S] [Y.Over S] [IsReduced X] [IsSeparated (Y ↘ S)] {f g : X.PartialMap Y} (hfg : f.domain = g.domain) [f.IsOver S] [g.IsOver S] : f.equiv g ↔ f = g",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-gluedata-glue-condition",
  "latex": "D.t i j ≫ D.f j i ≫ D.ι j = D.f i j ≫ D.ι i",
  "name": "glue_condition",
  "en": "AlgebraicGeometry.Scheme.GlueData.glue_condition",
  "importance": 0.7,
  "family": "scheme",
  "summary": "Promoted to higher priority to short circuit simplifier.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.GlueData.glue_condition\n类型签名：(i j : D.J) : D.t i j ≫ D.f j i ≫ D.ι j = D.f i j ≫ D.ι i\n\nPromoted to higher priority to short circuit simplifier.\n\n文件：AlgebraicGeometry/Gluing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Gluing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Gluing.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.GlueData.glue_condition",
   "kind": "theorem",
   "signature": "(i j : D.J) : D.t i j ≫ D.f j i ≫ D.ι j = D.f i j ≫ D.ι i",
   "file": "Mathlib/AlgebraicGeometry/Gluing.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isiso-specmap-stalkmap-localization",
  "latex": "IsIso ((Spec.toPresheafedSpace.map (CommRingCat.ofHom (algebraMap R (Localization M))).op).stalkMap x)",
  "name": "isIso_specMap_stalkMap_localization",
  "en": "AlgebraicGeometry.isIso_specMap_stalkMap_localization",
  "importance": 0.8,
  "family": "scheme",
  "summary": "The stalk map of Spec M⁻¹R ⟶ Spec R is an iso for each p : Spec M⁻¹R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isIso_specMap_stalkMap_localization\n类型签名：(R : CommRingCat.{u}) (M : Submonoid R) (x : PrimeSpectrum (Localization M)) : IsIso ((Spec.toPresheafedSpace.map (CommRingCat.ofHom (algebraMap R (Localization M))).op).stalkMap x)\n\nThe stalk map of Spec M⁻¹R ⟶ Spec R is an iso for each p : Spec M⁻¹R.\n\n文件：AlgebraicGeometry/Spec\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Spec",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Spec.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isIso_specMap_stalkMap_localization",
   "kind": "theorem",
   "signature": "(R : CommRingCat.{u}) (M : Submonoid R) (x : PrimeSpectrum (Localization M)) : IsIso ((Spec.toPresheafedSpace.map (CommRingCat.ofHom (algebraMap R (Localization M))).op).stalkMap x)",
   "file": "Mathlib/AlgebraicGeometry/Spec.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opens-birationalover-of-dense",
  "latex": "BirationalOver (U.ι ≫ sX) sX",
  "name": "Opens.birationalOver_of_dense",
  "en": "AlgebraicGeometry.Scheme.Opens.birationalOver_of_dense",
  "importance": 0.71,
  "family": "scheme",
  "summary": "A dense open set U : Opens X of a scheme X over S is S-birational to X.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Opens.birationalOver_of_dense\n类型签名：(hU : Dense (U : Set X)) : BirationalOver (U.ι ≫ sX) sX\n\nA dense open set U : Opens X of a scheme X over S is S-birational to X.\n\n文件：AlgebraicGeometry/Birational/Birational\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Birational",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Birational.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Opens.birationalOver_of_dense",
   "kind": "lemma",
   "signature": "(hU : Dense (U : Set X)) : BirationalOver (U.ι ≫ sX) sX",
   "file": "Mathlib/AlgebraicGeometry/Birational/Birational.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-torationalmap-surj-f73270f4",
  "latex": "Function.Surjective (@toRationalMap X Y)",
  "name": "PartialMap.toRationalMap_surjective",
  "en": "AlgebraicGeometry.Scheme.PartialMap.toRationalMap_surjective",
  "importance": 0.7,
  "family": "scheme",
  "summary": "A rational map is an S-map if some partial map in the equivalence class is an S-map.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.toRationalMap_surjective\n类型签名：: Function.Surjective (@toRationalMap X Y)\n\nA rational map is an S-map if some partial map in the equivalence class is an S-map.\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.toRationalMap_surjective",
   "kind": "lemma",
   "signature": ": Function.Surjective (@toRationalMap X Y)",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opens-isrationalover-of-dense",
  "latex": "IsRationalOver (U.ι ≫ sX)",
  "name": "Opens.isRationalOver_of_dense",
  "en": "AlgebraicGeometry.Scheme.Opens.isRationalOver_of_dense",
  "importance": 0.74,
  "family": "scheme",
  "summary": "A dense open set U : Opens X of a S-rational scheme X is S-rational.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Opens.isRationalOver_of_dense\n类型签名：(hU : Dense (U : Set X)) [IsRationalOver sX] : IsRationalOver (U.ι ≫ sX)\n\nA dense open set U : Opens X of a S-rational scheme X is S-rational.\n\n文件：AlgebraicGeometry/Birational/Birational\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Birational",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Birational.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Opens.isRationalOver_of_dense",
   "kind": "lemma",
   "signature": "(hU : Dense (U : Set X)) [IsRationalOver sX] : IsRationalOver (U.ι ≫ sX)",
   "file": "Mathlib/AlgebraicGeometry/Birational/Birational.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-locallyringedspace-isunit-res-to",
  "latex": "IsUnit (X.toToΓSpecMapBasicOpen r r)",
  "name": "isUnit_res_to",
  "en": "AlgebraicGeometry.LocallyRingedSpace.isUnit_res_to",
  "importance": 0.7,
  "family": "scheme",
  "summary": "r is a unit as a section on the basic open defined by r.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.LocallyRingedSpace.isUnit_res_to\n类型签名：ΓSpecMapBasicOpen : IsUnit (X.toToΓSpecMapBasicOpen r r)\n\nr is a unit as a section on the basic open defined by r.\n\n文件：AlgebraicGeometry/GammaSpecAdjunction\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/GammaSpecAdjunction",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.LocallyRingedSpace.isUnit_res_to",
   "kind": "theorem",
   "signature": "ΓSpecMapBasicOpen : IsUnit (X.toToΓSpecMapBasicOpen r r)",
   "file": "Mathlib/AlgebraicGeometry/GammaSpecAdjunction.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equiv",
  "latex": ".equiv (f₂.comp g₂)",
  "name": "comp_equiv_of_equiv",
  "en": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv",
  "importance": 0.8,
  "family": "scheme",
  "summary": "Composition respects equivalence of partial maps in both arguments.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv\n类型签名：(f₁ f₂ : X.PartialMap Y) [IsDominant f₁.hom] [IsDominant f₂.hom] (hf : f₁.equiv f₂) (g₁ g₂ : Y.PartialMap Z) (hg : g₁.equiv g₂) : (f₁.comp g₁).equiv (f₂.comp g₂)\n\nComposition respects equivalence of partial maps in both arguments.\n\n文件：AlgebraicGeometry/Birational/Composition\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Composition",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Composition.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv",
   "kind": "lemma",
   "signature": "(f₁ f₂ : X.PartialMap Y) [IsDominant f₁.hom] [IsDominant f₂.hom] (hf : f₁.equiv f₂) (g₁ g₂ : Y.PartialMap Z) (hg : g₁.equiv g₂) : (f₁.comp g₁).equiv (f₂.comp g₂)",
   "file": "Mathlib/AlgebraicGeometry/Birational/Composition.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-isquasiaffine-of-forall-exist-b3bfa86b",
  "latex": "IsQuasiAffine X",
  "name": "IsQuasiAffine.of_forall_exists_mem_basicOpen",
  "en": "AlgebraicGeometry.Scheme.IsQuasiAffine.of_forall_exists_mem_basicOpen",
  "importance": 0.82,
  "family": "scheme",
  "summary": "A quasi-compact scheme is quasi-affine if it can be covered by affine basic opens of global sections.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.IsQuasiAffine.of_forall_exists_mem_basicOpen\n类型签名：(X : Scheme.{u}) [CompactSpace X] (H : ∀ x : X, ∃ r : Γ(X, ⊤), IsAffineOpen (X.basicOpen r) ∧ x ∈ X.basicOpen r) : IsQuasiAffine X\n\nA quasi-compact scheme is quasi-affine if it can be covered by affine basic opens of global sections.\n\n文件：AlgebraicGeometry/QuasiAffine\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/QuasiAffine",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/QuasiAffine.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.IsQuasiAffine.of_forall_exists_mem_basicOpen",
   "kind": "lemma",
   "signature": "(X : Scheme.{u}) [CompactSpace X] (H : ∀ x : X, ∃ r : Γ(X, ⊤), IsAffineOpen (X.basicOpen r) ∧ x ∈ X.basicOpen r) : IsQuasiAffine X",
   "file": "Mathlib/AlgebraicGeometry/QuasiAffine.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-288f7554",
  "latex": "IsDominant f.hom ↔ IsDominant g.hom",
  "name": "isDominant_hom_iff_of_equiv",
  "en": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_of_equiv",
  "importance": 0.76,
  "family": "scheme",
  "summary": "Dominance of the underlying morphism is invariant under equivalence of partial maps.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_of_equiv\n类型签名：(f g : X.PartialMap Y) (h : f.equiv g) : IsDominant f.hom ↔ IsDominant g.hom\n\nDominance of the underlying morphism is invariant under equivalence of partial maps.\n\n文件：AlgebraicGeometry/Birational/Dominant\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Dominant",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Dominant.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_of_equiv",
   "kind": "lemma",
   "signature": "(f g : X.PartialMap Y) (h : f.equiv g) : IsDominant f.hom ↔ IsDominant g.hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/Dominant.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-opens-birational-of-dense",
  "latex": "Birational U X",
  "name": "Opens.birational_of_dense",
  "en": "AlgebraicGeometry.Scheme.Opens.birational_of_dense",
  "importance": 0.67,
  "family": "scheme",
  "summary": "A dense open set U : Opens X is birational to X.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.Opens.birational_of_dense\n类型签名：(hU : Dense (U : Set X)) : Birational U X\n\nA dense open set U : Opens X is birational to X.\n\n文件：AlgebraicGeometry/Birational/Birational\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Birational",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Birational.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.Opens.birational_of_dense",
   "kind": "lemma",
   "signature": "(hU : Dense (U : Set X)) : Birational U X",
   "file": "Mathlib/AlgebraicGeometry/Birational/Birational.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-pullbackrestrictisorestrict-hom-morp-b295d1ec",
  "latex": ".hom ≫ f ∣_ U = pullback.snd _ _",
  "name": "pullbackRestrictIsoRestrict_hom_morphismRestrict",
  "en": "AlgebraicGeometry.pullbackRestrictIsoRestrict_hom_morphismRestrict",
  "importance": 0.81,
  "family": "scheme",
  "summary": "the notation for restricting a morphism of scheme to an open subset of the target scheme",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.pullbackRestrictIsoRestrict_hom_morphismRestrict\n类型签名：{X Y : Scheme.{u}} (f : X ⟶ Y) (U : Y.Opens) : (pullbackRestrictIsoRestrict f U).hom ≫ f ∣_ U = pullback.snd _ _\n\nthe notation for restricting a morphism of scheme to an open subset of the target scheme\n\n文件：AlgebraicGeometry/Restrict\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Restrict",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Restrict.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.pullbackRestrictIsoRestrict_hom_morphismRestrict",
   "kind": "theorem",
   "signature": "{X Y : Scheme.{u}} (f : X ⟶ Y) (U : Y.Opens) : (pullbackRestrictIsoRestrict f U).hom ≫ f ∣_ U = pullback.snd _ _",
   "file": "Mathlib/AlgebraicGeometry/Restrict.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-zariskitopology-le-etaletopology",
  "latex": "zariskiTopology ≤ etaleTopology",
  "name": "zariskiTopology_le_etaleTopology",
  "en": "AlgebraicGeometry.Scheme.zariskiTopology_le_etaleTopology",
  "importance": 0.67,
  "family": "scheme",
  "summary": "Big étale site: the étale topology on the category of schemes.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.zariskiTopology_le_etaleTopology\n类型签名：: zariskiTopology ≤ etaleTopology\n\nBig étale site: the étale topology on the category of schemes.\n\n文件：AlgebraicGeometry/Sites/Etale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Sites/Etale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Sites/Etale.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.zariskiTopology_le_etaleTopology",
   "kind": "lemma",
   "signature": ": zariskiTopology ≤ etaleTopology",
   "file": "Mathlib/AlgebraicGeometry/Sites/Etale.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-universallyclosed-eq-valuativecriterion",
  "latex": "@UniversallyClosed = ValuativeCriterion.Existence ⊓ @QuasiCompact",
  "name": "UniversallyClosed.eq_valuativeCriterion",
  "en": "AlgebraicGeometry.UniversallyClosed.eq_valuativeCriterion",
  "importance": 0.72,
  "family": "scheme",
  "summary": "The **valuative criterion** for universally closed morphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.UniversallyClosed.eq_valuativeCriterion\n类型签名：: @UniversallyClosed = ValuativeCriterion.Existence ⊓ @QuasiCompact\n\nThe **valuative criterion** for universally closed morphisms.\n\n文件：AlgebraicGeometry/ValuativeCriterion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ValuativeCriterion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ValuativeCriterion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.UniversallyClosed.eq_valuativeCriterion",
   "kind": "lemma",
   "signature": ": @UniversallyClosed = ValuativeCriterion.Existence ⊓ @QuasiCompact",
   "file": "Mathlib/AlgebraicGeometry/ValuativeCriterion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-universallyclosed-of-valuativecriterion",
  "latex": "UniversallyClosed f",
  "name": "UniversallyClosed.of_valuativeCriterion",
  "en": "AlgebraicGeometry.UniversallyClosed.of_valuativeCriterion",
  "importance": 0.74,
  "family": "scheme",
  "summary": "The **valuative criterion** for universally closed morphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.UniversallyClosed.of_valuativeCriterion\n类型签名：[QuasiCompact f] (hf : ValuativeCriterion.Existence f) : UniversallyClosed f\n\nThe **valuative criterion** for universally closed morphisms.\n\n文件：AlgebraicGeometry/ValuativeCriterion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ValuativeCriterion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ValuativeCriterion.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.UniversallyClosed.of_valuativeCriterion",
   "kind": "lemma",
   "signature": "[QuasiCompact f] (hf : ValuativeCriterion.Existence f) : UniversallyClosed f",
   "file": "Mathlib/AlgebraicGeometry/ValuativeCriterion.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isaffineopen-primeidealof-ismaximal--6e2be180",
  "latex": ".asIdeal.IsMaximal",
  "name": "primeIdealOf_isMaximal_of_isClosed",
  "en": "AlgebraicGeometry.IsAffineOpen.primeIdealOf_isMaximal_of_isClosed",
  "importance": 0.75,
  "family": "scheme",
  "summary": "If a point x : U is a closed point, then its corresponding prime ideal is maximal.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsAffineOpen.primeIdealOf_isMaximal_of_isClosed\n类型签名：(x : U) (hx : IsClosed {(x : X)}) : (hU.primeIdealOf x).asIdeal.IsMaximal\n\nIf a point x : U is a closed point, then its corresponding prime ideal is maximal.\n\n文件：AlgebraicGeometry/AffineScheme\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/AffineScheme",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/AffineScheme.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsAffineOpen.primeIdealOf_isMaximal_of_isClosed",
   "kind": "theorem",
   "signature": "(x : U) (hx : IsClosed {(x : X)}) : (hU.primeIdealOf x).asIdeal.IsMaximal",
   "file": "Mathlib/AlgebraicGeometry/AffineScheme.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-f0ae2dd1",
  "latex": ".equiv (f₂.comp g)",
  "name": "comp_equiv_of_equiv_left",
  "en": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_left",
  "importance": 0.79,
  "family": "scheme",
  "summary": "Composition respects equivalence of partial maps on the left.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_left\n类型签名：{f₁ f₂ : X.PartialMap Y} [IsDominant f₁.hom] [IsDominant f₂.hom] (h : f₁.equiv f₂) (g : Y.PartialMap Z) : (f₁.comp g).equiv (f₂.comp g)\n\nComposition respects equivalence of partial maps on the left.\n\n文件：AlgebraicGeometry/Birational/Composition\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Composition",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Composition.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_left",
   "kind": "lemma",
   "signature": "{f₁ f₂ : X.PartialMap Y} [IsDominant f₁.hom] [IsDominant f₂.hom] (h : f₁.equiv f₂) (g : Y.PartialMap Z) : (f₁.comp g).equiv (f₂.comp g)",
   "file": "Mathlib/AlgebraicGeometry/Birational/Composition.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-idealsheafdata-root-algebraic-cd01a329",
  "latex": "IsPullback iX Zf f iY",
  "name": "_root_.AlgebraicGeometry.isPullback_of_isClosedImmersion",
  "en": "AlgebraicGeometry.Scheme.IdealSheafData._root_.AlgebraicGeometry.isPullback_of_isClosedImmersion",
  "importance": 0.86,
  "family": "scheme",
  "summary": "To show that the pullback of the closed immersion iX along f is the closed immersion iY, it suffices to check that the preimage of ker iY under f is ker iX.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.IdealSheafData._root_.AlgebraicGeometry.isPullback_of_isClosedImmersion\n类型签名：{ZX ZY X Y : Scheme} (iX : ZX ⟶ X) (iY : ZY ⟶ Y) (Zf : ZX ⟶ ZY) (f : X ⟶ Y) [IsClosedImmersion iX] [IsClosedImmersion iY] (h : iX ≫ f = Zf ≫ iY) (h' : iY.ker.comap f = iX.ker) : IsPullback iX Zf f iY\n\nTo show that the pullback of the closed immersion iX along f is the closed immersion iY, it suffices to check that the preimage of ker iY under f is ker iX.\n\n文件：AlgebraicGeometry/IdealSheaf/Functorial\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/IdealSheaf/Functorial",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/IdealSheaf/Functorial.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.IdealSheafData._root_.AlgebraicGeometry.isPullback_of_isClosedImmersion",
   "kind": "lemma",
   "signature": "{ZX ZY X Y : Scheme} (iX : ZX ⟶ X) (iY : ZY ⟶ Y) (Zf : ZX ⟶ ZY) (f : X ⟶ Y) [IsClosedImmersion iX] [IsClosedImmersion iY] (h : iX ≫ f = Zf ≫ iY) (h' : iY.ker.comap f = iX.ker) : IsPullback iX Zf f iY",
   "file": "Mathlib/AlgebraicGeometry/IdealSheaf/Functorial.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-31cd20f2",
  "latex": ".equiv (f.comp g₂)",
  "name": "comp_equiv_of_equiv_right",
  "en": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_right",
  "importance": 0.79,
  "family": "scheme",
  "summary": "Composition respects equivalence of partial maps on the right.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_right\n类型签名：(f : X.PartialMap Y) [IsDominant f.hom] {g₁ g₂ : Y.PartialMap Z} (h : g₁.equiv g₂) : (f.comp g₁).equiv (f.comp g₂)\n\nComposition respects equivalence of partial maps on the right.\n\n文件：AlgebraicGeometry/Birational/Composition\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Composition",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Composition.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.comp_equiv_of_equiv_right",
   "kind": "lemma",
   "signature": "(f : X.PartialMap Y) [IsDominant f.hom] {g₁ g₂ : Y.PartialMap Z} (h : g₁.equiv g₂) : (f.comp g₁).equiv (f.comp g₂)",
   "file": "Mathlib/AlgebraicGeometry/Birational/Composition.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometrically-iff-forall-fibertospec-40e5ab9e",
  "latex": "geometrically P f ↔ ∀ (y : Y), geometrically P (f.fiberToSpecResidueField y)",
  "name": "geometrically_iff_forall_fiberToSpecResidueField",
  "en": "AlgebraicGeometry.geometrically_iff_forall_fiberToSpecResidueField",
  "importance": 0.75,
  "family": "scheme",
  "summary": "P holds geometrically for f if and only if all fibers are geometrically P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.geometrically_iff_forall_fiberToSpecResidueField\n类型签名：: geometrically P f ↔ ∀ (y : Y), geometrically P (f.fiberToSpecResidueField y)\n\nP holds geometrically for f if and only if all fibers are geometrically P.\n\n文件：AlgebraicGeometry/Geometrically/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.geometrically_iff_forall_fiberToSpecResidueField",
   "kind": "lemma",
   "signature": ": geometrically P f ↔ ∀ (y : Y), geometrically P (f.fiberToSpecResidueField y)",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-self-of-isintegral-of-geometrically",
  "latex": "(hf : geometrically P f) : P X",
  "name": "self_of_isIntegral_of_geometrically",
  "en": "AlgebraicGeometry.self_of_isIntegral_of_geometrically",
  "importance": 0.7,
  "family": "scheme",
  "summary": "This holds in particular if Y = Spec K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.self_of_isIntegral_of_geometrically\n类型签名：[IsIntegral Y] [Subsingleton Y] (hf : geometrically P f) : P X\n\nThis holds in particular if Y = Spec K.\n\n文件：AlgebraicGeometry/Geometrically/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Basic.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.self_of_isIntegral_of_geometrically",
   "kind": "lemma",
   "signature": "[IsIntegral Y] [Subsingleton Y] (hf : geometrically P f) : P X",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Basic.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-evaluation-eq-zero-iff-notmem-e7e97d2c",
  "latex": "X.evaluation U x hx f = 0 ↔ x ∉ X.basicOpen f",
  "name": "evaluation_eq_zero_iff_notMem_basicOpen",
  "en": "AlgebraicGeometry.Scheme.evaluation_eq_zero_iff_notMem_basicOpen",
  "importance": 0.75,
  "family": "scheme",
  "summary": "The global evaluation map from Γ(X, ⊤) to the residue field at x.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.evaluation_eq_zero_iff_notMem_basicOpen\n类型签名：(x : X) (hx : x ∈ U) (f : Γ(X, U)) : X.evaluation U x hx f = 0 ↔ x ∉ X.basicOpen f\n\nThe global evaluation map from Γ(X, ⊤) to the residue field at x.\n\n文件：AlgebraicGeometry/ResidueField\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/ResidueField",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/ResidueField.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.evaluation_eq_zero_iff_notMem_basicOpen",
   "kind": "lemma",
   "signature": "(x : X) (hx : x ∈ U) (f : Γ(X, U)) : X.evaluation U x hx f = 0 ↔ x ∉ X.basicOpen f",
   "file": "Mathlib/AlgebraicGeometry/ResidueField.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-iscommmonobj-of-isproper-of-geometri-eaff051a",
  "latex": "IsCommMonObj G",
  "name": "isCommMonObj_of_isProper_of_geometricallyIntegral",
  "en": "AlgebraicGeometry.isCommMonObj_of_isProper_of_geometricallyIntegral",
  "importance": 0.79,
  "family": "scheme",
  "summary": "A proper geometrically integral group scheme over a field is commutative.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.isCommMonObj_of_isProper_of_geometricallyIntegral\n类型签名：(G : Over (Spec (.of K))) [IsProper G.hom] [GeometricallyIntegral G.hom] [GrpObj G] : IsCommMonObj G\n\nA proper geometrically integral group scheme over a field is commutative.\n\n文件：AlgebraicGeometry/Group/Abelian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Group/Abelian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Group/Abelian.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.isCommMonObj_of_isProper_of_geometricallyIntegral",
   "kind": "theorem",
   "signature": "(G : Over (Spec (.of K))) [IsProper G.hom] [GeometricallyIntegral G.hom] [GrpObj G] : IsCommMonObj G",
   "file": "Mathlib/AlgebraicGeometry/Group/Abelian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-isartinianscheme-iff-isnoetherian-an-3c72bb48",
  "latex": "IsArtinianScheme X ↔ IsNoetherian X ∧ DiscreteTopology X",
  "name": "IsArtinianScheme.iff_isNoetherian_and_discreteTopology",
  "en": "AlgebraicGeometry.IsArtinianScheme.iff_isNoetherian_and_discreteTopology",
  "importance": 0.73,
  "family": "scheme",
  "summary": "A scheme is Artinian if and only if it is Noetherian and has the discrete topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.IsArtinianScheme.iff_isNoetherian_and_discreteTopology\n类型签名：: IsArtinianScheme X ↔ IsNoetherian X ∧ DiscreteTopology X\n\nA scheme is Artinian if and only if it is Noetherian and has the discrete topology.\n\n文件：AlgebraicGeometry/Artinian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Artinian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Artinian.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.IsArtinianScheme.iff_isNoetherian_and_discreteTopology",
   "kind": "theorem",
   "signature": ": IsArtinianScheme X ↔ IsNoetherian X ∧ DiscreteTopology X",
   "file": "Mathlib/AlgebraicGeometry/Artinian.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyintegral-isintegral-of--ae14fac2",
  "latex": "IsIntegral X",
  "name": "GeometricallyIntegral.isIntegral_of_subsingleton",
  "en": "AlgebraicGeometry.GeometricallyIntegral.isIntegral_of_subsingleton",
  "importance": 0.73,
  "family": "scheme",
  "summary": "If X is geometrically integral over a field, then it is integral.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyIntegral.isIntegral_of_subsingleton\n类型签名：[GeometricallyIntegral f] [Subsingleton S] [IsIntegral S] : IsIntegral X\n\nIf X is geometrically integral over a field, then it is integral.\n\n文件：AlgebraicGeometry/Geometrically/Integral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Integral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Integral.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyIntegral.isIntegral_of_subsingleton",
   "kind": "lemma",
   "signature": "[GeometricallyIntegral f] [Subsingleton S] [IsIntegral S] : IsIntegral X",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Integral.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-fromspecstalkofmem-6926c997",
  "latex": ".fromSpecStalkOfMem hx = f.fromSpecStalkOfMem (hU' hx)",
  "name": "fromSpecStalkOfMem_restrict",
  "en": "AlgebraicGeometry.Scheme.PartialMap.fromSpecStalkOfMem_restrict",
  "importance": 0.78,
  "family": "scheme",
  "summary": "A partial map restricts to a map from Spec K(X).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.fromSpecStalkOfMem_restrict\n类型签名：(f : X.PartialMap Y) {U : X.Opens} (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) {x} (hx : x ∈ U) : (f.restrict U hU hU').fromSpecStalkOfMem hx = f.fromSpecStalkOfMem (hU' hx)\n\nA partial map restricts to a map from Spec K(X).\n\n文件：AlgebraicGeometry/Birational/RationalMap\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/RationalMap",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/RationalMap.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.fromSpecStalkOfMem_restrict",
   "kind": "lemma",
   "signature": "(f : X.PartialMap Y) {U : X.Opens} (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) {x} (hx : x ∈ U) : (f.restrict U hU hU').fromSpecStalkOfMem hx = f.fromSpecStalkOfMem (hU' hx)",
   "file": "Mathlib/AlgebraicGeometry/Birational/RationalMap.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyconnected-connectedspac-d35568c2",
  "latex": "ConnectedSpace X",
  "name": "GeometricallyConnected.connectedSpace_of_subsingleton",
  "en": "AlgebraicGeometry.GeometricallyConnected.connectedSpace_of_subsingleton",
  "importance": 0.74,
  "family": "scheme",
  "summary": "If X is geometrically connected over a point, then it is connected.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyConnected.connectedSpace_of_subsingleton\n类型签名：[GeometricallyConnected f] [Subsingleton S] [Nonempty S] : ConnectedSpace X\n\nIf X is geometrically connected over a point, then it is connected.\n\n文件：AlgebraicGeometry/Geometrically/Connected\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Connected",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Connected.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyConnected.connectedSpace_of_subsingleton",
   "kind": "lemma",
   "signature": "[GeometricallyConnected f] [Subsingleton S] [Nonempty S] : ConnectedSpace X",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Connected.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-geometricallyirreducible-irreducible-873e8886",
  "latex": "IrreducibleSpace X",
  "name": "GeometricallyIrreducible.irreducibleSpace_of_subsingleton",
  "en": "AlgebraicGeometry.GeometricallyIrreducible.irreducibleSpace_of_subsingleton",
  "importance": 0.75,
  "family": "scheme",
  "summary": "If X is geometrically irreducible over a point, then it is irreducible.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.GeometricallyIrreducible.irreducibleSpace_of_subsingleton\n类型签名：[GeometricallyIrreducible f] [Subsingleton S] [Nonempty S] : IrreducibleSpace X\n\nIf X is geometrically irreducible over a point, then it is irreducible.\n\n文件：AlgebraicGeometry/Geometrically/Irreducible\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Geometrically/Irreducible",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Geometrically/Irreducible.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.GeometricallyIrreducible.irreducibleSpace_of_subsingleton",
   "kind": "lemma",
   "signature": "[GeometricallyIrreducible f] [Subsingleton S] [Nonempty S] : IrreducibleSpace X",
   "file": "Mathlib/AlgebraicGeometry/Geometrically/Irreducible.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-isdominant-hom-of--f1003c72",
  "latex": "IsDominant f.hom",
  "name": "isDominant_hom_of_isDominant_restrict_hom",
  "en": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_of_isDominant_restrict_hom",
  "importance": 0.78,
  "family": "scheme",
  "summary": "If a restriction of f is dominant, then f is dominant.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_of_isDominant_restrict_hom\n类型签名：(f : X.PartialMap Y) (U : X.Opens) (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) [H : IsDominant (f.restrict U hU hU').hom] : IsDominant f.hom\n\nIf a restriction of f is dominant, then f is dominant.\n\n文件：AlgebraicGeometry/Birational/Dominant\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Dominant",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Dominant.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_of_isDominant_restrict_hom",
   "kind": "lemma",
   "signature": "(f : X.PartialMap Y) (U : X.Opens) (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) [H : IsDominant (f.restrict U hU hU').hom] : IsDominant f.hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/Dominant.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-95e7c040",
  "latex": "IsDominant f.hom ↔ IsDominant (f.restrict U hU hU').hom",
  "name": "isDominant_hom_iff_isDominant_restrict_hom",
  "en": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_isDominant_restrict_hom",
  "importance": 0.78,
  "family": "scheme",
  "summary": "f.hom is dominant iff any restriction of f is.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_isDominant_restrict_hom\n类型签名：(f : X.PartialMap Y) (U : X.Opens) (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) : IsDominant f.hom ↔ IsDominant (f.restrict U hU hU').hom\n\nf.hom is dominant iff any restriction of f is.\n\n文件：AlgebraicGeometry/Birational/Dominant\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · AlgebraicGeometry/Birational/Dominant",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/AlgebraicGeometry/Birational/Dominant.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Scheme.PartialMap.isDominant_hom_iff_isDominant_restrict_hom",
   "kind": "lemma",
   "signature": "(f : X.PartialMap Y) (U : X.Opens) (hU : Dense (U : Set X)) (hU' : U ≤ f.domain) : IsDominant f.hom ↔ IsDominant (f.restrict U hU hU').hom",
   "file": "Mathlib/AlgebraicGeometry/Birational/Dominant.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheafhom-map-app",
  "latex": ".map g.op α).app (op (Over.mk f)) = α.app (op (Over.mk h))",
  "name": "presheafHom_map_app",
  "en": "CategoryTheory.presheafHom_map_app",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "Equational lemma for the presheaf structure on presheafHom. It is advisable to use this lemma rather than dsimp [presheafHom] which may result in the need to prove equalities of ob",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.presheafHom_map_app\n类型签名：{X Y Z : C} (f : Z ⟶ Y) (g : Y ⟶ X) (h : Z ⟶ X) (w : f ≫ g = h) (α : (presheafHom F G).obj (op X)) : ((presheafHom F G).map g.op α).app (op (Over.mk f)) = α.app (op (Over.mk h))\n\nEquational lemma for the presheaf structure on presheafHom. It is advisable to use this lemma rather than dsimp [presheafHom] which may result in the need to prove equalities of objects in an Over category.\n\n文件：CategoryTheory/Sites/SheafHom\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafHom",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafHom.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.presheafHom_map_app",
   "kind": "lemma",
   "signature": "{X Y Z : C} (f : Z ⟶ Y) (g : Y ⟶ X) (h : Z ⟶ X) (w : f ≫ g = h) (α : (presheafHom F G).obj (op X)) : ((presheafHom F G).map g.op α).app (op (Over.mk f)) = α.app (op (Over.mk h))",
   "file": "Mathlib/CategoryTheory/Sites/SheafHom.lean"
  }
 },
 {
  "id": "ml-sheaf-hom-mono-of-presheaf-mono",
  "latex": "{F G : Sheaf J A} (f : F ⟶ G) : Mono f",
  "name": "Sheaf.Hom.mono_of_presheaf_mono",
  "en": "Sheaf.Hom.mono_of_presheaf_mono",
  "importance": 0.71,
  "family": "cohomology",
  "summary": "This is stated as a lemma to prevent class search from forming a loop since a sheaf morphism is monic if and only if it is monic as a presheaf morphism (under suitable assumption).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Sheaf.Hom.mono_of_presheaf_mono\n类型签名：{F G : Sheaf J A} (f : F ⟶ G) [h : Mono f.1] : Mono f\n\nThis is stated as a lemma to prevent class search from forming a loop since a sheaf morphism is monic if and only if it is monic as a presheaf morphism (under suitable assumption).\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "Sheaf.Hom.mono_of_presheaf_mono",
   "kind": "theorem",
   "signature": "{F G : Sheaf J A} (f : F ⟶ G) [h : Mono f.1] : Mono f",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-sup",
  "latex": ".toGrothendieck) P ↔ (Presieve.IsSheaf K.toGrothendieck) P ∧ (Presieve.IsSheaf L.toGrothendieck) P",
  "name": "isSheaf_sup",
  "en": "CategoryTheory.Presieve.isSheaf_sup",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "A presheaf is a sheaf for the Grothendieck topology generated by a union of coverages iff it is a sheaf for the Grothendieck topology generated by each coverage separately.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_sup\n类型签名：(K L : Coverage C) (P : Cᵒᵖ ⥤ Type*) : (Presieve.IsSheaf (K ⊔ L).toGrothendieck) P ↔ (Presieve.IsSheaf K.toGrothendieck) P ∧ (Presieve.IsSheaf L.toGrothendieck) P\n\nA presheaf is a sheaf for the Grothendieck topology generated by a union of coverages iff it is a sheaf for the Grothendieck topology generated by each coverage separately.\n\n文件：CategoryTheory/Sites/Coverage\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Coverage",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Coverage.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_sup",
   "kind": "theorem",
   "signature": "(K L : Coverage C) (P : Cᵒᵖ ⥤ Type*) : (Presieve.IsSheaf (K ⊔ L).toGrothendieck) P ↔ (Presieve.IsSheaf K.toGrothendieck) P ∧ (Presieve.IsSheaf L.toGrothendieck) P",
   "file": "Mathlib/CategoryTheory/Sites/Coverage.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-subsingleton-iff-isseparatedfor",
  "latex": "Aᵒᵖ, IsSeparatedFor (P ⋙ coyoneda.obj E) S.arrows",
  "name": "subsingleton_iff_isSeparatedFor",
  "en": "CategoryTheory.Presheaf.subsingleton_iff_isSeparatedFor",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "Given sieve S and presheaf P : Cᵒᵖ ⥤ A, their natural associated cone admits at most one morphism from every cone in the same category (i.e. over the same diagram), iff Hom (E, P -",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.subsingleton_iff_isSeparatedFor\n类型签名：: (∀ c, Subsingleton (c ⟶ P.mapCone S.arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSeparatedFor (P ⋙ coyoneda.obj E) S.arrows\n\nGiven sieve S and presheaf P : Cᵒᵖ ⥤ A, their natural associated cone admits at most one morphism from every cone in the same category (i.e. over the same diagram), iff Hom (E, P -) is separated for the sieve S and all E : A.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.subsingleton_iff_isSeparatedFor",
   "kind": "theorem",
   "signature": ": (∀ c, Subsingleton (c ⟶ P.mapCone S.arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSeparatedFor (P ⋙ coyoneda.obj E) S.arrows",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-functor-cover-lift",
  "latex": "S.functorPullback G ∈ J U",
  "name": "Functor.cover_lift",
  "en": "CategoryTheory.Functor.cover_lift",
  "importance": 0.79,
  "family": "cohomology",
  "summary": "A functor G : (C, J) ⥤ (D, K) between sites is called cocontinuous (SGA 4 III 2.1) if for all covering sieves R in D, R.pullback G is a covering sieve in C.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Functor.cover_lift\n类型签名：[G.IsCocontinuous J K] {U : C} {S : Sieve (G.obj U)} (hS : S ∈ K (G.obj U)) : S.functorPullback G ∈ J U\n\nA functor G : (C, J) ⥤ (D, K) between sites is called cocontinuous (SGA 4 III 2.1) if for all covering sieves R in D, R.pullback G is a covering sieve in C.\n\n文件：CategoryTheory/Sites/CoverLifting\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverLifting",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverLifting.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Functor.cover_lift",
   "kind": "lemma",
   "signature": "[G.IsCocontinuous J K] {U : C} {S : Sieve (G.obj U)} (hS : S ∈ K (G.obj U)) : S.functorPullback G ∈ J U",
   "file": "Mathlib/CategoryTheory/Sites/CoverLifting.lean"
  }
 },
 {
  "id": "ml-categorytheory-preonehypercover-isstronglysheaffor-iss-fac42119",
  "latex": "E.IsStronglySeparatedFor F where isSeparatedFor_presieve₀",
  "name": "IsStronglySheafFor.isStronglySeparatedFor",
  "en": "CategoryTheory.PreOneHypercover.IsStronglySheafFor.isStronglySeparatedFor",
  "importance": 0.77,
  "family": "cohomology",
  "summary": "A presheaf F of types is (strongly) a sheaf for a pre-1-hypercover if F is a sheaf for both the 0 and the 1-components. This implies that the multiequalizer diagram attached to E i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.PreOneHypercover.IsStronglySheafFor.isStronglySeparatedFor\n类型签名：(h : E.IsStronglySheafFor F) : E.IsStronglySeparatedFor F where isSeparatedFor_presieve₀\n\nA presheaf F of types is (strongly) a sheaf for a pre-1-hypercover if F is a sheaf for both the 0 and the 1-components. This implies that the multiequalizer diagram attached to E is exact (see CategoryTheory.PreOneHypercover.IsStronglySheafFor.isLimitMultifork).\n\n文件：CategoryTheory/Sites/Hypercover/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Hypercover/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Hypercover/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.PreOneHypercover.IsStronglySheafFor.isStronglySeparatedFor",
   "kind": "lemma",
   "signature": "(h : E.IsStronglySheafFor F) : E.IsStronglySeparatedFor F where isSeparatedFor_presieve₀",
   "file": "Mathlib/CategoryTheory/Sites/Hypercover/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-coverage",
  "latex": "Presieve.IsSheaf K.toGrothendieck P ↔ (∀ {X : C} (R : Presieve X), R ∈ K X → Presieve.IsSheafFor P R)",
  "name": "isSheaf_coverage",
  "en": "CategoryTheory.Presieve.isSheaf_coverage",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "The main theorem of this file: Given a coverage K on C, a Type*-valued presheaf on C is a sheaf for K if and only if it is a sheaf for the associated Grothendieck topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_coverage\n类型签名：(K : Coverage C) (P : Cᵒᵖ ⥤ Type*) : Presieve.IsSheaf K.toGrothendieck P ↔ (∀ {X : C} (R : Presieve X), R ∈ K X → Presieve.IsSheafFor P R)\n\nThe main theorem of this file: Given a coverage K on C, a Type*-valued presheaf on C is a sheaf for K if and only if it is a sheaf for the associated Grothendieck topology.\n\n文件：CategoryTheory/Sites/Coverage\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Coverage",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Coverage.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_coverage",
   "kind": "theorem",
   "signature": "(K : Coverage C) (P : Cᵒᵖ ⥤ Type*) : Presieve.IsSheaf K.toGrothendieck P ↔ (∀ {X : C} (R : Presieve X), R ∈ K X → Presieve.IsSheafFor P R)",
   "file": "Mathlib/CategoryTheory/Sites/Coverage.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-islimit-iff-issheaffor-presieve",
  "latex": "Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) R",
  "name": "isLimit_iff_isSheafFor_presieve",
  "en": "CategoryTheory.Presheaf.isLimit_iff_isSheafFor_presieve",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "Given presieve R and presheaf P : Cᵒᵖ ⥤ A, the natural cone associated to P and the sieve Sieve.generate R generated by R is a limit cone iff Hom (E, P -) is a sheaf of types for t",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.isLimit_iff_isSheafFor_presieve\n类型签名：: Nonempty (IsLimit (P.mapCone (generate R).arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) R\n\nGiven presieve R and presheaf P : Cᵒᵖ ⥤ A, the natural cone associated to P and the sieve Sieve.generate R generated by R is a limit cone iff Hom (E, P -) is a sheaf of types for the presieve R and all E : A.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.isLimit_iff_isSheafFor_presieve",
   "kind": "theorem",
   "signature": ": Nonempty (IsLimit (P.mapCone (generate R).arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) R",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-isseparated-iff-subsingleton",
  "latex": "C⦄ (S : Sieve X), S ∈ J X → ∀ c, Subsingleton (c ⟶ P.mapCone S.arrows.cocone.op)",
  "name": "isSeparated_iff_subsingleton",
  "en": "CategoryTheory.Presheaf.isSeparated_iff_subsingleton",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "A presheaf P is separated for the Grothendieck topology J iff for every covering sieve S of J, the natural cone associated to P and S admits at most one morphism from every cone in",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.isSeparated_iff_subsingleton\n类型签名：: (∀ E : A, Presieve.IsSeparated J (P ⋙ coyoneda.obj (op E))) ↔ ∀ ⦃X : C⦄ (S : Sieve X), S ∈ J X → ∀ c, Subsingleton (c ⟶ P.mapCone S.arrows.cocone.op)\n\nA presheaf P is separated for the Grothendieck topology J iff for every covering sieve S of J, the natural cone associated to P and S admits at most one morphism from every cone in the same category.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.isSeparated_iff_subsingleton",
   "kind": "theorem",
   "signature": ": (∀ E : A, Presieve.IsSeparated J (P ⋙ coyoneda.obj (op E))) ↔ ∀ ⦃X : C⦄ (S : Sieve X), S ∈ J X → ∀ c, Subsingleton (c ⟶ P.mapCone S.arrows.cocone.op)",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-coverage-togrothendieck-eq-sinf",
  "latex": "toGrothendieck K = sInf {J | K ≤ J.toCoverage }",
  "name": "toGrothendieck_eq_sInf",
  "en": "CategoryTheory.Coverage.toGrothendieck_eq_sInf",
  "importance": 0.73,
  "family": "cohomology",
  "summary": "An alternative characterization of the Grothendieck topology associated to a coverage K: it is the infimum of all Grothendieck topologies whose associated coverage contains K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Coverage.toGrothendieck_eq_sInf\n类型签名：(K : Coverage C) : toGrothendieck K = sInf {J | K ≤ J.toCoverage }\n\nAn alternative characterization of the Grothendieck topology associated to a coverage K: it is the infimum of all Grothendieck topologies whose associated coverage contains K.\n\n文件：CategoryTheory/Sites/Coverage\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Coverage",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Coverage.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Coverage.toGrothendieck_eq_sInf",
   "kind": "theorem",
   "signature": "(K : Coverage C) : toGrothendieck K = sInf {J | K ≤ J.toCoverage }",
   "file": "Mathlib/CategoryTheory/Sites/Coverage.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-issheaf-iff-islimit-pretopology",
  "latex": "C⦄ (R : Presieve X), R ∈ K X → Nonempty (IsLimit (P.mapCone (generate R).arrows.cocone.op))",
  "name": "isSheaf_iff_isLimit_pretopology",
  "en": "CategoryTheory.Presheaf.isSheaf_iff_isLimit_pretopology",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "A presheaf P is a sheaf for the Grothendieck topology generated by a pretopology K iff for every covering presieve R of K, the natural cone associated to P and Sieve.generate R is ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.isSheaf_iff_isLimit_pretopology\n类型签名：[HasPullbacks C] (K : Pretopology C) : IsSheaf K.toGrothendieck P ↔ ∀ ⦃X : C⦄ (R : Presieve X), R ∈ K X → Nonempty (IsLimit (P.mapCone (generate R).arrows.cocone.op))\n\nA presheaf P is a sheaf for the Grothendieck topology generated by a pretopology K iff for every covering presieve R of K, the natural cone associated to P and Sieve.generate R is a limit cone.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.isSheaf_iff_isLimit_pretopology",
   "kind": "theorem",
   "signature": "[HasPullbacks C] (K : Pretopology C) : IsSheaf K.toGrothendieck P ↔ ∀ ⦃X : C⦄ (R : Presieve X), R ∈ K X → Nonempty (IsLimit (P.mapCone (generate R).arrows.cocone.op))",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-issheaf-iff-islimit",
  "latex": "C⦄ (S : Sieve X), S ∈ J X → Nonempty (IsLimit (P.mapCone S.arrows.cocone.op))",
  "name": "isSheaf_iff_isLimit",
  "en": "CategoryTheory.Presheaf.isSheaf_iff_isLimit",
  "importance": 0.79,
  "family": "cohomology",
  "summary": "A presheaf P is a sheaf for the Grothendieck topology J iff for every covering sieve S of J, the natural cone associated to P and S is a limit cone.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.isSheaf_iff_isLimit\n类型签名：: IsSheaf J P ↔ ∀ ⦃X : C⦄ (S : Sieve X), S ∈ J X → Nonempty (IsLimit (P.mapCone S.arrows.cocone.op))\n\nA presheaf P is a sheaf for the Grothendieck topology J iff for every covering sieve S of J, the natural cone associated to P and S is a limit cone.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.isSheaf_iff_isLimit",
   "kind": "theorem",
   "signature": ": IsSheaf J P ↔ ∀ ⦃X : C⦄ (S : Sieve X), S ∈ J X → Nonempty (IsLimit (P.mapCone S.arrows.cocone.op))",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-presheaf-islimit-iff-issheaffor",
  "latex": "Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) S.arrows",
  "name": "isLimit_iff_isSheafFor",
  "en": "CategoryTheory.Presheaf.isLimit_iff_isSheafFor",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "Given sieve S and presheaf P : Cᵒᵖ ⥤ A, their natural associated cone is a limit cone iff Hom (E, P -) is a sheaf of types for the sieve S and all E : A.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presheaf.isLimit_iff_isSheafFor\n类型签名：: Nonempty (IsLimit (P.mapCone S.arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) S.arrows\n\nGiven sieve S and presheaf P : Cᵒᵖ ⥤ A, their natural associated cone is a limit cone iff Hom (E, P -) is a sheaf of types for the sieve S and all E : A.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presheaf.isLimit_iff_isSheafFor",
   "kind": "theorem",
   "signature": ": Nonempty (IsLimit (P.mapCone S.arrows.cocone.op)) ↔ ∀ E : Aᵒᵖ, IsSheafFor (P ⋙ coyoneda.obj E) S.arrows",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-sheaf-hom-ext-iff",
  "latex": "f = g ↔ f.hom = g.hom",
  "name": "Sheaf.hom_ext_iff",
  "en": "Sheaf.hom_ext_iff",
  "importance": 0.65,
  "family": "cohomology",
  "summary": "The category of sheaves taking values in A on a Grothendieck topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Sheaf.hom_ext_iff\n类型签名：{F G : Sheaf J A} {f g : F ⟶ G} : f = g ↔ f.hom = g.hom\n\nThe category of sheaves taking values in A on a Grothendieck topology.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "Sheaf.hom_ext_iff",
   "kind": "lemma",
   "signature": "{F G : Sheaf J A} {f g : F ⟶ G} : f = g ↔ f.hom = g.hom",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-coverage-eq-top-pullback",
  "latex": "T.pullback f = ⊤",
  "name": "eq_top_pullback",
  "en": "CategoryTheory.Coverage.eq_top_pullback",
  "importance": 0.73,
  "family": "cohomology",
  "summary": "An auxiliary definition used to define the Grothendieck topology associated to a coverage. See Coverage.toGrothendieck.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Coverage.eq_top_pullback\n类型签名：{X Y : C} {S T : Sieve X} (h : S ≤ T) (f : Y ⟶ X) (hf : S f) : T.pullback f = ⊤\n\nAn auxiliary definition used to define the Grothendieck topology associated to a coverage. See Coverage.toGrothendieck.\n\n文件：CategoryTheory/Sites/Coverage\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Coverage",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Coverage.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Coverage.eq_top_pullback",
   "kind": "lemma",
   "signature": "{X Y : C} {S T : Sieve X} (h : S ≤ T) (f : Y ⟶ X) (hf : S f) : T.pullback f = ⊤",
   "file": "Mathlib/CategoryTheory/Sites/Coverage.lean"
  }
 },
 {
  "id": "ml-ran-issheaf-of-iscocontinuous",
  "latex": "Presheaf.IsSheaf K (G.op.ran.obj ℱ.obj)",
  "name": "ran_isSheaf_of_isCocontinuous",
  "en": "ran_isSheaf_of_isCocontinuous",
  "importance": 0.67,
  "family": "cohomology",
  "summary": "If G is cocontinuous, then G.op.ran pushes sheaves to sheaves. This is SGA 4 III 2.2.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ran_isSheaf_of_isCocontinuous\n类型签名：(ℱ : Sheaf J A) : Presheaf.IsSheaf K (G.op.ran.obj ℱ.obj)\n\nIf G is cocontinuous, then G.op.ran pushes sheaves to sheaves. This is SGA 4 III 2.2.\n\n文件：CategoryTheory/Sites/CoverLifting\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverLifting",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverLifting.lean",
  "formal": true,
  "lean": {
   "full": "ran_isSheaf_of_isCocontinuous",
   "kind": "theorem",
   "signature": "(ℱ : Sheaf J A) : Presheaf.IsSheaf K (G.op.ran.obj ℱ.obj)",
   "file": "Mathlib/CategoryTheory/Sites/CoverLifting.lean"
  }
 },
 {
  "id": "ml-categorytheory-coverpreserving-of-iscontinuous",
  "latex": "CoverPreserving J K F where cover_preserve {X S} hS",
  "name": "CoverPreserving.of_isContinuous",
  "en": "CategoryTheory.CoverPreserving.of_isContinuous",
  "importance": 0.73,
  "family": "cohomology",
  "summary": "Continuous functors send covering sieves to covering sieves. The converse is false, see [SGA4, III, Exemple 1.9.3][sga-4-tome-1].",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.CoverPreserving.of_isContinuous\n类型签名：[F.IsContinuous J K] : CoverPreserving J K F where cover_preserve {X S} hS\n\nContinuous functors send covering sieves to covering sieves. The converse is false, see [SGA4, III, Exemple 1.9.3][sga-4-tome-1].\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.CoverPreserving.of_isContinuous",
   "kind": "lemma",
   "signature": "[F.IsContinuous J K] : CoverPreserving J K F where cover_preserve {X S} hS",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-isseparated-issheaf",
  "latex": "IsSheaf J P",
  "name": "IsSeparated.isSheaf",
  "en": "CategoryTheory.Presieve.IsSeparated.isSheaf",
  "importance": 0.78,
  "family": "cohomology",
  "summary": "If P is separated and every compatible family of elements of P for a covering sieve has an amalgamation, P is a sheaf.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.IsSeparated.isSheaf\n类型签名：{P : Cᵒᵖ ⥤ Type w} (h : IsSeparated J P) (h' : ∀ X, ∀ S ∈ J X, ∀ x : FamilyOfElements P S.arrows, x.Compatible → ∃ t, x.IsAmalgamation t) : IsSheaf J P\n\nIf P is separated and every compatible family of elements of P for a covering sieve has an amalgamation, P is a sheaf.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.IsSeparated.isSheaf",
   "kind": "theorem",
   "signature": "{P : Cᵒᵖ ⥤ Type w} (h : IsSeparated J P) (h' : ∀ X, ∀ S ∈ J X, ∀ x : FamilyOfElements P S.arrows, x.Compatible → ∃ t, x.IsAmalgamation t) : IsSheaf J P",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-sheaf-h-longsequence-exact",
  "latex": ": (longSequence hS n₀ n₁ h).Exact",
  "name": "longSequence_exact",
  "en": "CategoryTheory.Sheaf.H.longSequence_exact",
  "importance": 0.64,
  "family": "cohomology",
  "summary": "This is the long exact sequence: Hⁿ(S.X₁) ⟶ Hⁿ(S.X₂) ⟶ Hⁿ(S.X₃) ⟶ Hⁿ⁺¹(S.X₁) ⟶ Hⁿ⁺¹(S.X₂) ⟶ Hⁿ⁺¹(S.X₃).",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Sheaf.H.longSequence_exact\n类型签名：: (longSequence hS n₀ n₁ h).Exact\n\nThis is the long exact sequence: Hⁿ(S.X₁) ⟶ Hⁿ(S.X₂) ⟶ Hⁿ(S.X₃) ⟶ Hⁿ⁺¹(S.X₁) ⟶ Hⁿ⁺¹(S.X₂) ⟶ Hⁿ⁺¹(S.X₃).\n\n文件：CategoryTheory/Sites/SheafCohomology/ExactSequences\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafCohomology/ExactSequences",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafCohomology/ExactSequences.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Sheaf.H.longSequence_exact",
   "kind": "theorem",
   "signature": ": (longSequence hS n₀ n₁ h).Exact",
   "file": "Mathlib/CategoryTheory/Sites/SheafCohomology/ExactSequences.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-pretopology",
  "latex": "IsSheaf K.toGrothendieck P ↔ ∀ {X : C} (R : Presieve X), R ∈ K X → IsSheafFor P R",
  "name": "isSheaf_pretopology",
  "en": "CategoryTheory.Presieve.isSheaf_pretopology",
  "importance": 0.77,
  "family": "cohomology",
  "summary": "For a topology generated by a basis, it suffices to check the sheaf condition on the basis presieves only.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_pretopology\n类型签名：[HasPullbacks C] (K : Pretopology C) : IsSheaf K.toGrothendieck P ↔ ∀ {X : C} (R : Presieve X), R ∈ K X → IsSheafFor P R\n\nFor a topology generated by a basis, it suffices to check the sheaf condition on the basis presieves only.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_pretopology",
   "kind": "theorem",
   "signature": "[HasPullbacks C] (K : Pretopology C) : IsSheaf K.toGrothendieck P ↔ ∀ {X : C} (R : Presieve X), R ∈ K X → IsSheafFor P R",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-issheaf-iff-issheaf",
  "latex": "IsSheaf J P' ↔ IsSheaf' J P'",
  "name": "isSheaf_iff_isSheaf'",
  "en": "CategoryTheory.isSheaf_iff_isSheaf'",
  "importance": 0.62,
  "family": "cohomology",
  "summary": "The equalizer definition of a sheaf given by isSheaf' is equivalent to isSheaf.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.isSheaf_iff_isSheaf'\n类型签名：: IsSheaf J P' ↔ IsSheaf' J P'\n\nThe equalizer definition of a sheaf given by isSheaf' is equivalent to isSheaf.\n\n文件：CategoryTheory/Sites/Sheaf\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheaf",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheaf.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.isSheaf_iff_isSheaf'",
   "kind": "theorem",
   "signature": ": IsSheaf J P' ↔ IsSheaf' J P'",
   "file": "Mathlib/CategoryTheory/Sites/Sheaf.lean"
  }
 },
 {
  "id": "ml-categorytheory-tosheafification-app",
  "latex": ".app P = toSheafify J P",
  "name": "toSheafification_app",
  "en": "CategoryTheory.toSheafification_app",
  "importance": 0.67,
  "family": "cohomology",
  "summary": "The canonical map from P to its sheafification, as a natural transformation.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.toSheafification_app\n类型签名：(P : Cᵒᵖ ⥤ D) : (toSheafification J D).app P = toSheafify J P\n\nThe canonical map from P to its sheafification, as a natural transformation.\n\n文件：CategoryTheory/Sites/Sheafification\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheafification",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheafification.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.toSheafification_app",
   "kind": "theorem",
   "signature": "(P : Cᵒᵖ ⥤ D) : (toSheafification J D).app P = toSheafify J P",
   "file": "Mathlib/CategoryTheory/Sites/Sheafification.lean"
  }
 },
 {
  "id": "ml-categorytheory-sheafifymap-id",
  "latex": "sheafifyMap J (𝟙 P) = 𝟙 (sheafify J P)",
  "name": "sheafifyMap_id",
  "en": "CategoryTheory.sheafifyMap_id",
  "importance": 0.64,
  "family": "cohomology",
  "summary": "The canonical map on sheafifications induced by a morphism.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.sheafifyMap_id\n类型签名：(P : Cᵒᵖ ⥤ D) : sheafifyMap J (𝟙 P) = 𝟙 (sheafify J P)\n\nThe canonical map on sheafifications induced by a morphism.\n\n文件：CategoryTheory/Sites/Sheafification\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheafification",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheafification.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.sheafifyMap_id",
   "kind": "theorem",
   "signature": "(P : Cᵒᵖ ⥤ D) : sheafifyMap J (𝟙 P) = 𝟙 (sheafify J P)",
   "file": "Mathlib/CategoryTheory/Sites/Sheafification.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-bot",
  "latex": "IsSheaf (⊥ : GrothendieckTopology C) P",
  "name": "isSheaf_bot",
  "en": "CategoryTheory.Presieve.isSheaf_bot",
  "importance": 0.63,
  "family": "cohomology",
  "summary": "Any presheaf is a sheaf for the bottom (trivial) Grothendieck topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_bot\n类型签名：: IsSheaf (⊥ : GrothendieckTopology C) P\n\nAny presheaf is a sheaf for the bottom (trivial) Grothendieck topology.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_bot",
   "kind": "theorem",
   "signature": ": IsSheaf (⊥ : GrothendieckTopology C) P",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-sheaf-h-longsequencehom-id",
  "latex": "(h : n₀ + 1 = n₁",
  "name": "longSequenceHom_id",
  "en": "CategoryTheory.Sheaf.H.longSequenceHom_id",
  "importance": 0.6,
  "family": "cohomology",
  "summary": "The induced homomorphism of long exact sequences obtained by applying H.map everywhere.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Sheaf.H.longSequenceHom_id\n类型签名：(h : n₀ + 1 = n₁\n\nThe induced homomorphism of long exact sequences obtained by applying H.map everywhere.\n\n文件：CategoryTheory/Sites/SheafCohomology/ExactSequences\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafCohomology/ExactSequences",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafCohomology/ExactSequences.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Sheaf.H.longSequenceHom_id",
   "kind": "lemma",
   "signature": "(h : n₀ + 1 = n₁",
   "file": "Mathlib/CategoryTheory/Sites/SheafCohomology/ExactSequences.lean"
  }
 },
 {
  "id": "ml-categorytheory-coverpreserving-comp",
  "latex": "CoverPreserving J L (F ⋙ G)",
  "name": "CoverPreserving.comp",
  "en": "CategoryTheory.CoverPreserving.comp",
  "importance": 0.72,
  "family": "cohomology",
  "summary": "The composition of two cover-preserving functors is cover-preserving.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.CoverPreserving.comp\n类型签名：{F} (hF : CoverPreserving J K F) {G} (hG : CoverPreserving K L G) : CoverPreserving J L (F ⋙ G)\n\nThe composition of two cover-preserving functors is cover-preserving.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.CoverPreserving.comp",
   "kind": "theorem",
   "signature": "{F} (hF : CoverPreserving J K F) {G} (hG : CoverPreserving K L G) : CoverPreserving J L (F ⋙ G)",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-iscocontinuous-comp",
  "latex": ".IsCocontinuous J L where cover_lift h",
  "name": "isCocontinuous_comp",
  "en": "CategoryTheory.isCocontinuous_comp",
  "importance": 0.71,
  "family": "cohomology",
  "summary": "The composition of two cocontinuous functors is cocontinuous.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.isCocontinuous_comp\n类型签名：[G.IsCocontinuous J K] [G'.IsCocontinuous K L] : (G ⋙ G').IsCocontinuous J L where cover_lift h\n\nThe composition of two cocontinuous functors is cocontinuous.\n\n文件：CategoryTheory/Sites/CoverLifting\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverLifting",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverLifting.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.isCocontinuous_comp",
   "kind": "theorem",
   "signature": "[G.IsCocontinuous J K] [G'.IsCocontinuous K L] : (G ⋙ G').IsCocontinuous J L where cover_lift h",
   "file": "Mathlib/CategoryTheory/Sites/CoverLifting.lean"
  }
 },
 {
  "id": "ml-categorytheory-idcoverpreserving",
  "latex": "CoverPreserving J J (𝟭 _)",
  "name": "idCoverPreserving",
  "en": "CategoryTheory.idCoverPreserving",
  "importance": 0.59,
  "family": "cohomology",
  "summary": "The identity functor on a site is cover-preserving.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.idCoverPreserving\n类型签名：: CoverPreserving J J (𝟭 _)\n\nThe identity functor on a site is cover-preserving.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.idCoverPreserving",
   "kind": "theorem",
   "signature": ": CoverPreserving J J (𝟭 _)",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-iso",
  "latex": "IsSheaf J P'",
  "name": "isSheaf_iso",
  "en": "CategoryTheory.Presieve.isSheaf_iso",
  "importance": 0.66,
  "family": "cohomology",
  "summary": "The property of being a sheaf is preserved by isomorphism.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_iso\n类型签名：{P' : Cᵒᵖ ⥤ Type w} (i : P ≅ P') (h : IsSheaf J P) : IsSheaf J P'\n\nThe property of being a sheaf is preserved by isomorphism.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_iso",
   "kind": "theorem",
   "signature": "{P' : Cᵒᵖ ⥤ Type w} (i : P ≅ P') (h : IsSheaf J P) : IsSheaf J P'",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-sieve-forallyonedaissheaf-iff-colimit",
  "latex": "(S : Presieve X)) ↔ Nonempty (IsColimit S.arrows.cocone)",
  "name": "forallYonedaIsSheaf_iff_colimit",
  "en": "CategoryTheory.Sieve.forallYonedaIsSheaf_iff_colimit",
  "importance": 0.76,
  "family": "cohomology",
  "summary": "The base of a sieve S is a colimit of S iff all Yoneda-presheaves satisfy the sheaf condition for S.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Sieve.forallYonedaIsSheaf_iff_colimit\n类型签名：(S : Sieve X) : (∀ W : C, Presieve.IsSheafFor (yoneda.obj W) (S : Presieve X)) ↔ Nonempty (IsColimit S.arrows.cocone)\n\nThe base of a sieve S is a colimit of S iff all Yoneda-presheaves satisfy the sheaf condition for S.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Sieve.forallYonedaIsSheaf_iff_colimit",
   "kind": "theorem",
   "signature": "(S : Sieve X) : (∀ W : C, Presieve.IsSheafFor (yoneda.obj W) (S : Presieve X)) ↔ Nonempty (IsColimit S.arrows.cocone)",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-sheafification-obj",
  "latex": ".obj P = sheafify J P",
  "name": "sheafification_obj",
  "en": "CategoryTheory.sheafification_obj",
  "importance": 0.64,
  "family": "cohomology",
  "summary": "The sheafification of a presheaf P, as a functor.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.sheafification_obj\n类型签名：(P : Cᵒᵖ ⥤ D) : (sheafification J D).obj P = sheafify J P\n\nThe sheafification of a presheaf P, as a functor.\n\n文件：CategoryTheory/Sites/Sheafification\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheafification",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheafification.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.sheafification_obj",
   "kind": "theorem",
   "signature": "(P : Cᵒᵖ ⥤ D) : (sheafification J D).obj P = sheafify J P",
   "file": "Mathlib/CategoryTheory/Sites/Sheafification.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-isseparated-iso",
  "latex": "IsSeparated J P'",
  "name": "isSeparated_iso",
  "en": "CategoryTheory.Presieve.isSeparated_iso",
  "importance": 0.68,
  "family": "cohomology",
  "summary": "The property of being separated is preserved under isomorphisms.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSeparated_iso\n类型签名：{P' : Cᵒᵖ ⥤ Type w} (i : P ≅ P') (hP : IsSeparated J P) : IsSeparated J P'\n\nThe property of being separated is preserved under isomorphisms.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSeparated_iso",
   "kind": "theorem",
   "signature": "{P' : Cᵒᵖ ⥤ Type w} (i : P ≅ P') (hP : IsSeparated J P) : IsSeparated J P'",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-grothendiecktopology-coverstop-ext",
  "latex": "(F : Sheaf J A) {c : Cone F.1} (hc : IsLimit c) {X : A} {f g : X ⟶ c.pt} (h : ∀ (i : I), f ≫ c.π.app (Opposite.op (Y i)) = g ≫ c.π.app (Oppo …",
  "name": "ext",
  "en": "CategoryTheory.GrothendieckTopology.CoversTop.ext",
  "importance": 0.75,
  "family": "cohomology",
  "summary": "The cover of any object W : C attached to a family of objects Y that satisfy J.CoversTop Y",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.GrothendieckTopology.CoversTop.ext\n类型签名：(F : Sheaf J A) {c : Cone F.1} (hc : IsLimit c) {X : A} {f g : X ⟶ c.pt} (h : ∀ (i : I), f ≫ c.π.app (Opposite.op (Y i)) = g ≫ c.π.app (Opposite.op (Y i))) : f = g\n\nThe cover of any object W : C attached to a family of objects Y that satisfy J.CoversTop Y\n\n文件：CategoryTheory/Sites/CoversTop/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoversTop/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoversTop/Basic.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.GrothendieckTopology.CoversTop.ext",
   "kind": "lemma",
   "signature": "(F : Sheaf J A) {c : Cone F.1} (hc : IsLimit c) {X : A} {f g : X ⟶ c.pt} (h : ∀ (i : I), f ≫ c.π.app (Opposite.op (Y i)) = g ≫ c.π.app (Opposite.op (Y i))) : f = g",
   "file": "Mathlib/CategoryTheory/Sites/CoversTop/Basic.lean"
  }
 },
 {
  "id": "ml-categorytheory-coverage-mem-togrothendieck-sieves-of-s-346c8866",
  "latex": "S ∈ K.toGrothendieck X",
  "name": "mem_toGrothendieck_sieves_of_superset",
  "en": "CategoryTheory.Coverage.mem_toGrothendieck_sieves_of_superset",
  "importance": 0.78,
  "family": "cohomology",
  "summary": "Any sieve that contains a covering presieve for a coverage is a covering sieve for the associated Grothendieck topology.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Coverage.mem_toGrothendieck_sieves_of_superset\n类型签名：(K : Coverage C) {X : C} {S : Sieve X} {R : Presieve X} (h : R ≤ S) (hR : R ∈ K X) : S ∈ K.toGrothendieck X\n\nAny sieve that contains a covering presieve for a coverage is a covering sieve for the associated Grothendieck topology.\n\n文件：CategoryTheory/Sites/Coverage\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Coverage",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Coverage.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Coverage.mem_toGrothendieck_sieves_of_superset",
   "kind": "theorem",
   "signature": "(K : Coverage C) {X : C} {S : Sieve X} {R : Presieve X} (h : R ≤ S) (hR : R ∈ K X) : S ∈ K.toGrothendieck X",
   "file": "Mathlib/CategoryTheory/Sites/Coverage.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-sheafedspace-mk-coe",
  "latex": "(({ carrier presheaf IsSheaf",
  "name": "mk_coe",
  "en": "AlgebraicGeometry.SheafedSpace.mk_coe",
  "importance": 0.63,
  "family": "cohomology",
  "summary": "Not since it already reduces to carrier = carrier.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.SheafedSpace.mk_coe\n类型签名：(carrier) (presheaf) (h) : (({ carrier presheaf IsSheaf\n\nNot since it already reduces to carrier = carrier.\n\n文件：Geometry/RingedSpace/SheafedSpace\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · Geometry/RingedSpace/SheafedSpace",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/Geometry/RingedSpace/SheafedSpace.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.SheafedSpace.mk_coe",
   "kind": "theorem",
   "signature": "(carrier) (presheaf) (h) : (({ carrier presheaf IsSheaf",
   "file": "Mathlib/Geometry/RingedSpace/SheafedSpace.lean"
  }
 },
 {
  "id": "ml-categorytheory-grothendiecktopology-onehypercover-issh-50297585",
  "latex": "Presieve.IsSheafFor F R",
  "name": "isSheafFor_of_pullback",
  "en": "CategoryTheory.GrothendieckTopology.OneHypercover.isSheafFor_of_pullback",
  "importance": 0.8,
  "family": "cohomology",
  "summary": "If F is a J-sheaf, then being a sheaf for a presieve R is J-local on the target, i.e. it can be checked on the pullbacks from a 1-hypercover.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.GrothendieckTopology.OneHypercover.isSheafFor_of_pullback\n类型签名：(hF : Presieve.IsSheaf J F) {R : Presieve X} (h₁ : ∀ (i : E.I₀), Presieve.IsSheafFor F ((Sieve.generate R).pullback (E.f i)).arrows) (h₂ : ∀ ⦃i j : E.I₀⦄ (k : E.I₁ i j), Presieve.IsSeparatedFor F ((Sieve.generate R).pullback (E.p₁ k ≫ E.f i)).arrows) : Presieve.IsSheafFor F R\n\nIf F is a J-sheaf, then being a sheaf for a presieve R is J-local on the target, i.e. it can be checked on the pullbacks from a 1-hypercover.\n\n文件：CategoryTheory/Sites/Hypercover/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Hypercover/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Hypercover/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.GrothendieckTopology.OneHypercover.isSheafFor_of_pullback",
   "kind": "lemma",
   "signature": "(hF : Presieve.IsSheaf J F) {R : Presieve X} (h₁ : ∀ (i : E.I₀), Presieve.IsSheafFor F ((Sieve.generate R).pullback (E.f i)).arrows) (h₂ : ∀ ⦃i j : E.I₀⦄ (k : E.I₁ i j), Presieve.IsSeparatedFor F ((Sieve.generate R).pullback (E.p₁ k ≫ E.f i)).arrows) : Presieve.IsSheafFor F R",
   "file": "Mathlib/CategoryTheory/Sites/Hypercover/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-comp-uliftfunctor-iff",
  "latex": "IsSheaf J (P ⋙ uliftFunctor.{w'}) ↔ IsSheaf J P",
  "name": "isSheaf_comp_uliftFunctor_iff",
  "en": "CategoryTheory.Presieve.isSheaf_comp_uliftFunctor_iff",
  "importance": 0.66,
  "family": "cohomology",
  "summary": "A presheaf is a sheaf after composing with a universe lift if and only if it is a sheaf.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_comp_uliftFunctor_iff\n类型签名：: IsSheaf J (P ⋙ uliftFunctor.{w'}) ↔ IsSheaf J P\n\nA presheaf is a sheaf after composing with a universe lift if and only if it is a sheaf.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_comp_uliftFunctor_iff",
   "kind": "theorem",
   "signature": ": IsSheaf J (P ⋙ uliftFunctor.{w'}) ↔ IsSheaf J P",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-functor-iscontinuous-of-coverpreserving",
  "latex": "Functor.IsContinuous F J K where op_comp_isSheaf_of_types G X S hS x hx",
  "name": "Functor.isContinuous_of_coverPreserving",
  "en": "CategoryTheory.Functor.isContinuous_of_coverPreserving",
  "importance": 0.75,
  "family": "cohomology",
  "summary": "If F is cover-preserving and compatible-preserving, then F is a continuous functor.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Functor.isContinuous_of_coverPreserving\n类型签名：(hF₁ : CompatiblePreserving.{max u₁ v₁ u₂ v₂} K F) (hF₂ : CoverPreserving J K F) : Functor.IsContinuous F J K where op_comp_isSheaf_of_types G X S hS x hx\n\nIf F is cover-preserving and compatible-preserving, then F is a continuous functor.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Functor.isContinuous_of_coverPreserving",
   "kind": "lemma",
   "signature": "(hF₁ : CompatiblePreserving.{max u₁ v₁ u₂ v₂} K F) (hF₂ : CoverPreserving J K F) : Functor.IsContinuous F J K where op_comp_isSheaf_of_types G X S hS x hx",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaffor-comp-uliftfunctor-iff",
  "latex": "R.IsSheafFor (P ⋙ uliftFunctor.{w'}) ↔ R.IsSheafFor P",
  "name": "isSheafFor_comp_uliftFunctor_iff",
  "en": "CategoryTheory.Presieve.isSheafFor_comp_uliftFunctor_iff",
  "importance": 0.69,
  "family": "cohomology",
  "summary": "A presheaf is a sheaf after composing with a universe lift if and only if it is a sheaf.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheafFor_comp_uliftFunctor_iff\n类型签名：{R : Presieve X} : R.IsSheafFor (P ⋙ uliftFunctor.{w'}) ↔ R.IsSheafFor P\n\nA presheaf is a sheaf after composing with a universe lift if and only if it is a sheaf.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheafFor_comp_uliftFunctor_iff",
   "kind": "theorem",
   "signature": "{R : Presieve X} : R.IsSheafFor (P ⋙ uliftFunctor.{w'}) ↔ R.IsSheafFor P",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-functor-preservesonehypercovers-of-cove-9538c0af",
  "latex": "Functor.PreservesOneHypercovers.{w} F J K",
  "name": "Functor.PreservesOneHypercovers.of_coverPreserving",
  "en": "CategoryTheory.Functor.PreservesOneHypercovers.of_coverPreserving",
  "importance": 0.77,
  "family": "cohomology",
  "summary": "If C has pullbacks and F : C ⥤ D preserves pullbacks, any cover preserving functor preserves all 1-hypercovers.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Functor.PreservesOneHypercovers.of_coverPreserving\n类型签名：[HasPullbacks C] [PreservesLimitsOfShape WalkingCospan F] (H : CoverPreserving J K F) : Functor.PreservesOneHypercovers.{w} F J K\n\nIf C has pullbacks and F : C ⥤ D preserves pullbacks, any cover preserving functor preserves all 1-hypercovers.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Functor.PreservesOneHypercovers.of_coverPreserving",
   "kind": "lemma",
   "signature": "[HasPullbacks C] [PreservesLimitsOfShape WalkingCospan F] (H : CoverPreserving J K F) : Functor.PreservesOneHypercovers.{w} F J K",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-issheaf-comp-uliftfunctor",
  "latex": "IsSheaf J (P ⋙ uliftFunctor.{w'})",
  "name": "isSheaf_comp_uliftFunctor",
  "en": "CategoryTheory.Presieve.isSheaf_comp_uliftFunctor",
  "importance": 0.64,
  "family": "cohomology",
  "summary": "The composition of a sheaf with a ULift functor is still a sheaf.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.isSheaf_comp_uliftFunctor\n类型签名：(h : IsSheaf J P) : IsSheaf J (P ⋙ uliftFunctor.{w'})\n\nThe composition of a sheaf with a ULift functor is still a sheaf.\n\n文件：CategoryTheory/Sites/SheafOfTypes\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/SheafOfTypes",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/SheafOfTypes.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.isSheaf_comp_uliftFunctor",
   "kind": "theorem",
   "signature": "(h : IsSheaf J P) : IsSheaf J (P ⋙ uliftFunctor.{w'})",
   "file": "Mathlib/CategoryTheory/Sites/SheafOfTypes.lean"
  }
 },
 {
  "id": "ml-categorytheory-functor-iscontinuous-iff-coverpreserving",
  "latex": "F.IsContinuous J K ↔ CoverPreserving J K F",
  "name": "Functor.isContinuous_iff_coverPreserving",
  "en": "CategoryTheory.Functor.isContinuous_iff_coverPreserving",
  "importance": 0.67,
  "family": "cohomology",
  "summary": "If F is flat, it is continuous if and only if it preserves covers.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Functor.isContinuous_iff_coverPreserving\n类型签名：[RepresentablyFlat F] : F.IsContinuous J K ↔ CoverPreserving J K F\n\nIf F is flat, it is continuous if and only if it preserves covers.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Functor.isContinuous_iff_coverPreserving",
   "kind": "lemma",
   "signature": "[RepresentablyFlat F] : F.IsContinuous J K ↔ CoverPreserving J K F",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-categorytheory-sheafificationadjunction-unit-app",
  "latex": ".unit.app P = toSheafify J P",
  "name": "sheafificationAdjunction_unit_app",
  "en": "CategoryTheory.sheafificationAdjunction_unit_app",
  "importance": 0.66,
  "family": "cohomology",
  "summary": "The canonical map from P to its sheafification.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.sheafificationAdjunction_unit_app\n类型签名：(P : Cᵒᵖ ⥤ D) : (sheafificationAdjunction J D).unit.app P = toSheafify J P\n\nThe canonical map from P to its sheafification.\n\n文件：CategoryTheory/Sites/Sheafification\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/Sheafification",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/Sheafification.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.sheafificationAdjunction_unit_app",
   "kind": "theorem",
   "signature": "(P : Cᵒᵖ ⥤ D) : (sheafificationAdjunction J D).unit.app P = toSheafify J P",
   "file": "Mathlib/CategoryTheory/Sites/Sheafification.lean"
  }
 },
 {
  "id": "ml-categorytheory-morphismproperty-coverage-eq-tocoverage-2158c6c2",
  "latex": "P.coverage = P.pretopology.toCoverage",
  "name": "coverage_eq_toCoverage_pretopology",
  "en": "CategoryTheory.MorphismProperty.coverage_eq_toCoverage_pretopology",
  "importance": 0.67,
  "family": "cohomology",
  "summary": "If P is also multiplicative, the coverage induced by P is the pretopology induced by P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.MorphismProperty.coverage_eq_toCoverage_pretopology\n类型签名：[P.IsMultiplicative] : P.coverage = P.pretopology.toCoverage\n\nIf P is also multiplicative, the coverage induced by P is the pretopology induced by P.\n\n文件：CategoryTheory/Sites/MorphismProperty\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/MorphismProperty",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/MorphismProperty.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.MorphismProperty.coverage_eq_toCoverage_pretopology",
   "kind": "lemma",
   "signature": "[P.IsMultiplicative] : P.coverage = P.pretopology.toCoverage",
   "file": "Mathlib/CategoryTheory/Sites/MorphismProperty.lean"
  }
 },
 {
  "id": "ml-categorytheory-morphismproperty-grothendiecktopology-e-26b89b37",
  "latex": "P.grothendieckTopology = P.pretopology.toGrothendieck",
  "name": "grothendieckTopology_eq_toGrothendieck_pretopology",
  "en": "CategoryTheory.MorphismProperty.grothendieckTopology_eq_toGrothendieck_pretopology",
  "importance": 0.72,
  "family": "cohomology",
  "summary": "If P is also multiplicative, the topology induced by P is the topology induced by the pretopology induced by P.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.MorphismProperty.grothendieckTopology_eq_toGrothendieck_pretopology\n类型签名：[P.IsMultiplicative] : P.grothendieckTopology = P.pretopology.toGrothendieck\n\nIf P is also multiplicative, the topology induced by P is the topology induced by the pretopology induced by P.\n\n文件：CategoryTheory/Sites/MorphismProperty\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/MorphismProperty",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/MorphismProperty.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.MorphismProperty.grothendieckTopology_eq_toGrothendieck_pretopology",
   "kind": "lemma",
   "signature": "[P.IsMultiplicative] : P.grothendieckTopology = P.pretopology.toGrothendieck",
   "file": "Mathlib/CategoryTheory/Sites/MorphismProperty.lean"
  }
 },
 {
  "id": "ml-categorytheory-presieve-familyofelements-compatible-fu-98196559",
  "latex": ".Compatible",
  "name": "Presieve.FamilyOfElements.Compatible.functorPushforward",
  "en": "CategoryTheory.Presieve.FamilyOfElements.Compatible.functorPushforward",
  "importance": 0.62,
  "family": "cohomology",
  "summary": "CompatiblePreserving functors indeed preserve compatible families.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：CategoryTheory.Presieve.FamilyOfElements.Compatible.functorPushforward\n类型签名：: (x.functorPushforward G).Compatible\n\nCompatiblePreserving functors indeed preserve compatible families.\n\n文件：CategoryTheory/Sites/CoverPreserving\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · CategoryTheory/Sites/CoverPreserving",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/CategoryTheory/Sites/CoverPreserving.lean",
  "formal": true,
  "lean": {
   "full": "CategoryTheory.Presieve.FamilyOfElements.Compatible.functorPushforward",
   "kind": "theorem",
   "signature": ": (x.functorPushforward G).Compatible",
   "file": "Mathlib/CategoryTheory/Sites/CoverPreserving.lean"
  }
 },
 {
  "id": "ml-chevalley-mvpolynomial-mvpolynomial",
  "latex": "ConstructibleSetData (MvPolynomial (Fin n) R), comap f '' S.toSet = T.toSet ∧ ∀ C ∈ T, C.n ≤ numBound k m n d ∧ ∀ i j, (C.g i).degreeOf j ≤  …",
  "name": "chevalley_mvPolynomial_mvPolynomial",
  "en": "chevalley_mvPolynomial_mvPolynomial",
  "importance": 0.8,
  "family": "foundation",
  "summary": "**Chevalley's theorem** with complexity bound. A constructible set of complexity at most M in Spec R[X₁, ..., Xₘ] gets mapped under f : R[Y₁, ..., Yₙ] → R[X₁, ..., Xₘ] to a constru",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：chevalley_mvPolynomial_mvPolynomial\n类型签名：{m n : ℕ} (f : MvPolynomial (Fin n) R →ₐ[R] MvPolynomial (Fin m) R) (k : ℕ) (d : Multiset (Fin m)) (S : ConstructibleSetData (MvPolynomial (Fin m) R)) (hSn : ∀ C ∈ S, C.n ≤ k) (hS : ∀ C ∈ S, ∀ j, (C.g j).degrees ≤ d) (hf : ∀ i, (f (.X i)).degrees ≤ d) : ∃ T : ConstructibleSetData (MvPolynomial (Fin n) R), comap f '' S.toSet = T.toSet ∧ ∀ C ∈ T, C.n ≤ numBound k m n d ∧ ∀ i j, (C.g i).degreeOf j ≤ degBound k m n d\n\n**Chevalley's theorem** with complexity bound. A constructible set of complexity at most M in Spec R[X₁, ..., Xₘ] gets mapped under f : R[Y₁, ..., Yₙ] → R[X₁, ..., Xₘ] to a constructible set of complexity O_{M, m, n}(1) in Spec R[Y₁, ..., Yₙ]. See the module doc of Mathlib/RingTheory/Spectrum/Prime/ChevalleyComplexity.lean for an explanation of this notion of complexity.\n\n文件：RingTheory/Spectrum/Prime/ChevalleyComplexity\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/ChevalleyComplexity",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/ChevalleyComplexity.lean",
  "formal": true,
  "lean": {
   "full": "chevalley_mvPolynomial_mvPolynomial",
   "kind": "lemma",
   "signature": "{m n : ℕ} (f : MvPolynomial (Fin n) R →ₐ[R] MvPolynomial (Fin m) R) (k : ℕ) (d : Multiset (Fin m)) (S : ConstructibleSetData (MvPolynomial (Fin m) R)) (hSn : ∀ C ∈ S, C.n ≤ k) (hS : ∀ C ∈ S, ∀ j, (C.g j).degrees ≤ d) (hf : ∀ i, (f (.X i)).degrees ≤ d) : ∃ T : ConstructibleSetData (MvPolynomial (Fin n) R), comap f '' S.toSet = T.toSet ∧ ∀ C ∈ T, C.n ≤ numBound k m n d ∧ ∀ i j, (C.g i).degreeOf j ≤ degBound k m n d",
   "file": "Mathlib/RingTheory/Spectrum/Prime/ChevalleyComplexity.lean"
  }
 },
 {
  "id": "ml-under-map-eq-map-under",
  "latex": "under C (map (algebraMap B D) P) = map (algebraMap A C) (under A P)",
  "name": "under_map_eq_map_under",
  "en": "under_map_eq_map_under",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Consider the following commutative diagram of ring maps A → B ↓ ↓ C → D and let P be an ideal of B. Assume that the image in C of the ideal of A under P is maximal and that the ima",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：under_map_eq_map_under\n类型签名：{C D : Type*} [CommSemiring C] [Semiring D] [Algebra A C] [Algebra C D] [Algebra A D] [Algebra B D] [IsScalarTower A C D] [IsScalarTower A B D] (h₁ : (map (algebraMap A C) (under A P)).IsMaximal) (h₂ : map (algebraMap B D) P ≠ ⊤) : under C (map (algebraMap B D) P) = map (algebraMap A C) (under A P)\n\nConsider the following commutative diagram of ring maps A → B ↓ ↓ C → D and let P be an ideal of B. Assume that the image in C of the ideal of A under P is maximal and that the image of P in D is not equal to D, then the image in C of the ideal of A under P is equal to the ideal of C under the image of P in D.\n\n文件：RingTheory/Ideal/Over\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Over",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Over.lean",
  "formal": true,
  "lean": {
   "full": "under_map_eq_map_under",
   "kind": "theorem",
   "signature": "{C D : Type*} [CommSemiring C] [Semiring D] [Algebra A C] [Algebra C D] [Algebra A D] [Algebra B D] [IsScalarTower A C D] [IsScalarTower A B D] (h₁ : (map (algebraMap A C) (under A P)).IsMaximal) (h₂ : map (algebraMap B D) P ≠ ⊤) : under C (map (algebraMap B D) P) = map (algebraMap A C) (under A P)",
   "file": "Mathlib/RingTheory/Ideal/Over.lean"
  }
 },
 {
  "id": "ml-bernsteinpolynomial-linearindependent",
  "latex": "Fin (n + 1) => bernsteinPolynomial ℚ n ν",
  "name": "linearIndependent",
  "en": "bernsteinPolynomial.linearIndependent",
  "importance": 0.75,
  "family": "foundation",
  "summary": "The Bernstein polynomials are linearly independent. We prove by induction that the collection of bernsteinPolynomial n ν for ν = 0, ..., k are linearly independent. The inductive s",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：bernsteinPolynomial.linearIndependent\n类型签名：(n : ℕ) : LinearIndependent ℚ fun ν : Fin (n + 1) => bernsteinPolynomial ℚ n ν\n\nThe Bernstein polynomials are linearly independent. We prove by induction that the collection of bernsteinPolynomial n ν for ν = 0, ..., k are linearly independent. The inductive step relies on the observation that the (n-k)-th derivative, evaluated at 1, annihilates bernsteinPolynomial n ν for ν < k, but has a nonzero value at ν = k.\n\n文件：RingTheory/Polynomial/Bernstein\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Bernstein",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Bernstein.lean",
  "formal": true,
  "lean": {
   "full": "bernsteinPolynomial.linearIndependent",
   "kind": "theorem",
   "signature": "(n : ℕ) : LinearIndependent ℚ fun ν : Fin (n + 1) => bernsteinPolynomial ℚ n ν",
   "file": "Mathlib/RingTheory/Polynomial/Bernstein.lean"
  }
 },
 {
  "id": "ml-module-flat-iff-forall-exists-factorization",
  "latex": "Flat R M ↔ ∀ {l : ℕ} {f : Fin l →₀ R} {x : (Fin l →₀ R) →ₗ M}, x f = 0 → ∃ (k : ℕ) (a : (Fin l →₀ R) →ₗ (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ M …",
  "name": "iff_forall_exists_factorization",
  "en": "Module.Flat.iff_forall_exists_factorization",
  "importance": 0.8,
  "family": "map",
  "summary": "**Equational criterion for flatness**, alternate form. A module $M$ is flat if and only if for all finite free modules $R^l$, all $f \\in R^l$, and all linear maps $x \\colon R^l \\to",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Flat.iff_forall_exists_factorization\n类型签名：: Flat R M ↔ ∀ {l : ℕ} {f : Fin l →₀ R} {x : (Fin l →₀ R) →ₗ[R] M}, x f = 0 → ∃ (k : ℕ) (a : (Fin l →₀ R) →ₗ[R] (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ[R] M), x = y ∘ₗ a ∧ a f = 0\n\n**Equational criterion for flatness**, alternate form. A module $M$ is flat if and only if for all finite free modules $R^l$, all $f \\in R^l$, and all linear maps $x \\colon R^l \\to M$ such that $x(f) = 0$, there exist a finite free module $R^k$ and linear maps $a \\colon R^l \\to R^k$ and $y \\colon R^k \\to M$ such that $x = y \\circ a$ and $a(f) = 0$.\n\n文件：RingTheory/Flat/EquationalCriterion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/EquationalCriterion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/EquationalCriterion.lean",
  "formal": true,
  "lean": {
   "full": "Module.Flat.iff_forall_exists_factorization",
   "kind": "theorem",
   "signature": ": Flat R M ↔ ∀ {l : ℕ} {f : Fin l →₀ R} {x : (Fin l →₀ R) →ₗ[R] M}, x f = 0 → ∃ (k : ℕ) (a : (Fin l →₀ R) →ₗ[R] (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ[R] M), x = y ∘ₗ a ∧ a f = 0",
   "file": "Mathlib/RingTheory/Flat/EquationalCriterion.lean"
  }
 },
 {
  "id": "ml-lift-mk",
  "latex": "lift hg (mk' S x y) = g x * ↑(IsUnit.liftRight (g.toMonoidHom.domRestrict M) hg y)⁻¹",
  "name": "lift_mk'",
  "en": "lift_mk'",
  "importance": 0.77,
  "family": "foundation",
  "summary": "Given a localization map f : R →+* S for a submonoid M ⊆ R and a map of CommSemirings g : R →* P such that g y is invertible for all y : M, the homomorphism induced from S to P map",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：lift_mk'\n类型签名：(x y) : lift hg (mk' S x y) = g x * ↑(IsUnit.liftRight (g.toMonoidHom.domRestrict M) hg y)⁻¹\n\nGiven a localization map f : R →+* S for a submonoid M ⊆ R and a map of CommSemirings g : R →* P such that g y is invertible for all y : M, the homomorphism induced from S to P maps f x * (f y)⁻¹ to g x * (g y)⁻¹ for all x : R, y ∈ M.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "lift_mk'",
   "kind": "theorem",
   "signature": "(x y) : lift hg (mk' S x y) = g x * ↑(IsUnit.liftRight (g.toMonoidHom.domRestrict M) hg y)⁻¹",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-ideal-quotient-mk-maps-eq",
  "latex": "))) P)).comp C).comp (Quotient.mk (P.comap (C : R →+* R ))) = (Ideal.quotientMap (map (mapRingHom (Quotient.mk (P.comap (C : R →+* R )))) P) …",
  "name": "quotient_mk_maps_eq",
  "en": "Ideal.quotient_mk_maps_eq",
  "importance": 0.8,
  "family": "foundation",
  "summary": "The identity in this lemma asserts that the \"obvious\" square R → (R / (P ∩ R)) ↓ ↓ R[x] / P → (R / (P ∩ R))[x] / (P / (P ∩ R)) commutes. It is used, for instance, in the proof of q",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.quotient_mk_maps_eq\n类型签名：(P : Ideal R[X]) : ((Quotient.mk (map (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) P)).comp C).comp (Quotient.mk (P.comap (C : R →+* R[X]))) = (Ideal.quotientMap (map (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) P) (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) le_comap_map).comp ((Quotient.mk P).comp C)\n\nThe identity in this lemma asserts that the \"obvious\" square R → (R / (P ∩ R)) ↓ ↓ R[x] / P → (R / (P ∩ R))[x] / (P / (P ∩ R)) commutes. It is used, for instance, in the proof of quotient_mk_comp_C_is_integral_of_jacobson, in the file Mathlib/RingTheory/Jacobson/Polynomial.lean.\n\n文件：RingTheory/Ideal/GoingUp\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/GoingUp",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/GoingUp.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.quotient_mk_maps_eq",
   "kind": "theorem",
   "signature": "(P : Ideal R[X]) : ((Quotient.mk (map (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) P)).comp C).comp (Quotient.mk (P.comap (C : R →+* R[X]))) = (Ideal.quotientMap (map (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) P) (mapRingHom (Quotient.mk (P.comap (C : R →+* R[X])))) le_comap_map).comp ((Quotient.mk P).comp C)",
   "file": "Mathlib/RingTheory/Ideal/GoingUp.lean"
  }
 },
 {
  "id": "ml-away-of-surjective",
  "latex": "IsLocalization.Away r T",
  "name": "Away.of_surjective",
  "en": "Away.of_surjective",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Suppose I is an ideal of R, then R / I is the localization away from r : R if r - 1 ∈ I and for some n, r ^ n • I = ⊥. For sake of usability, we state this for surjective ring maps",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Away.of_surjective\n类型签名：(h₁ : Function.Surjective (algebraMap S T)) {r : S} (hr : IsUnit (algebraMap S T r)) (n : ℕ) (hn : r ^ n • RingHom.ker (algebraMap S T) ≤ ⊥) : IsLocalization.Away r T\n\nSuppose I is an ideal of R, then R / I is the localization away from r : R if r - 1 ∈ I and for some n, r ^ n • I = ⊥. For sake of usability, we state this for surjective ring maps instead of ideals. For a version with two ideals, see Away.of_sub_one_mem_ker'.\n\n文件：RingTheory/Localization/Away/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Away/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Away/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Away.of_surjective",
   "kind": "lemma",
   "signature": "(h₁ : Function.Surjective (algebraMap S T)) {r : S} (hr : IsUnit (algebraMap S T r)) (n : ℕ) (hn : r ^ n • RingHom.ker (algebraMap S T) ≤ ⊥) : IsLocalization.Away r T",
   "file": "Mathlib/RingTheory/Localization/Away/Basic.lean"
  }
 },
 {
  "id": "ml-primespectrum-ishomeomorph-comap",
  "latex": "IsHomeomorph (comap f)",
  "name": "PrimeSpectrum.isHomeomorph_comap",
  "en": "PrimeSpectrum.isHomeomorph_comap",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If the kernel of f : R →+* S consists of nilpotent elements and for every x : S, there exists n > 0 such that x ^ n is in the range of f, then Spec f is a homeomorphism. Note: This",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：PrimeSpectrum.isHomeomorph_comap\n类型签名：(f : R →+* S) (H : ∀ (x : S), ∃ n > 0, x ^ n ∈ f.range) (hker : RingHom.ker f ≤ nilradical R) : IsHomeomorph (comap f)\n\nIf the kernel of f : R →+* S consists of nilpotent elements and for every x : S, there exists n > 0 such that x ^ n is in the range of f, then Spec f is a homeomorphism. Note: This does not hold for semirings, because ℕ →+* ℤ satisfies these conditions, but Spec ℕ has one more point than Spec ℤ.\n\n文件：RingTheory/Spectrum/Prime/Homeomorph\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/Homeomorph",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/Homeomorph.lean",
  "formal": true,
  "lean": {
   "full": "PrimeSpectrum.isHomeomorph_comap",
   "kind": "lemma",
   "signature": "(f : R →+* S) (H : ∀ (x : S), ∃ n > 0, x ^ n ∈ f.range) (hker : RingHom.ker f ≤ nilradical R) : IsHomeomorph (comap f)",
   "file": "Mathlib/RingTheory/Spectrum/Prime/Homeomorph.lean"
  }
 },
 {
  "id": "ml-islocalizedmodule-iff-isbasechange",
  "latex": "IsLocalizedModule S f ↔ IsBaseChange A f",
  "name": "isLocalizedModule_iff_isBaseChange",
  "en": "isLocalizedModule_iff_isBaseChange",
  "importance": 0.69,
  "family": "foundation",
  "summary": "The map (f : M →ₗ[R] M') is a localization of modules iff the map (Localization S) × M → N, (s, m) ↦ s • f m is the tensor product (insomuch as it is the universal bilinear map). I",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isLocalizedModule_iff_isBaseChange\n类型签名：: IsLocalizedModule S f ↔ IsBaseChange A f\n\nThe map (f : M →ₗ[R] M') is a localization of modules iff the map (Localization S) × M → N, (s, m) ↦ s • f m is the tensor product (insomuch as it is the universal bilinear map). In particular, there is an isomorphism between LocalizedModule S M and (Localization S) ⊗[R] M given by m/s ↦ (1/s) ⊗ₜ m.\n\n文件：RingTheory/Localization/BaseChange\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/BaseChange",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/BaseChange.lean",
  "formal": true,
  "lean": {
   "full": "isLocalizedModule_iff_isBaseChange",
   "kind": "theorem",
   "signature": ": IsLocalizedModule S f ↔ IsBaseChange A f",
   "file": "Mathlib/RingTheory/Localization/BaseChange.lean"
  }
 },
 {
  "id": "ml-module-finite-of-localizationspan",
  "latex": "Module.Finite R M",
  "name": "of_localizationSpan'",
  "en": "Module.Finite.of_localizationSpan'",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If there exists a set { r } of R that generates the unit ideal and such that Mᵣ is Rᵣ-finite for each r, then M is a finite R-module. General version for any modules Mᵣ and rings R",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Finite.of_localizationSpan'\n类型签名：(t : Set R) (ht : Ideal.span t = ⊤) {Mₚ : ∀ (_ : t), Type*} [∀ (g : t), AddCommMonoid (Mₚ g)] [∀ (g : t), Module R (Mₚ g)] {Rₚ : ∀ (_ : t), Type*} [∀ (g : t), CommSemiring (Rₚ g)] [∀ (g : t), Algebra R (Rₚ g)] [h₁ : ∀ (g : t), IsLocalization.Away g.val (Rₚ g)] [∀ (g : t), Module (Rₚ g) (Mₚ g)] [∀ (g : t), IsScalarTower R (Rₚ g) (Mₚ g)] (f : ∀ (g : t), M →ₗ[R] Mₚ g) [h₂ : ∀ (g : t), IsLocalizedModule.Away g.val (f g)] (H : ∀ (g : t), Module.Finite (Rₚ g) (Mₚ g)) : Module.Finite R M\n\nIf there exists a set { r } of R that generates the unit ideal and such that Mᵣ is Rᵣ-finite for each r, then M is a finite R-module. General version for any modules Mᵣ and rings Rᵣ satisfying the correct universal properties. See Module.Finite.of_localizationSpan_finite for the specialized version.\n\n文件：RingTheory/Localization/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "Module.Finite.of_localizationSpan'",
   "kind": "theorem",
   "signature": "(t : Set R) (ht : Ideal.span t = ⊤) {Mₚ : ∀ (_ : t), Type*} [∀ (g : t), AddCommMonoid (Mₚ g)] [∀ (g : t), Module R (Mₚ g)] {Rₚ : ∀ (_ : t), Type*} [∀ (g : t), CommSemiring (Rₚ g)] [∀ (g : t), Algebra R (Rₚ g)] [h₁ : ∀ (g : t), IsLocalization.Away g.val (Rₚ g)] [∀ (g : t), Module (Rₚ g) (Mₚ g)] [∀ (g : t), IsScalarTower R (Rₚ g) (Mₚ g)] (f : ∀ (g : t), M →ₗ[R] Mₚ g) [h₂ : ∀ (g : t), IsLocalizedModule.Away g.val (f g)] (H : ∀ (g : t), Module.Finite (Rₚ g) (Mₚ g)) : Module.Finite R M",
   "file": "Mathlib/RingTheory/Localization/Finiteness.lean"
  }
 },
 {
  "id": "ml-ideal-eq-zero-of-polynomial-mem-map-range",
  "latex": "(I : Ideal R ) (x : ((Quotient.mk I).comp C).range) (hx : C x ∈ I.map (Polynomial.mapRingHom ((Quotient.mk I).comp C).rangeRestrict)) : x =  …",
  "name": "eq_zero_of_polynomial_mem_map_range",
  "en": "Ideal.eq_zero_of_polynomial_mem_map_range",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given any ring R and an ideal I of R[X], we get a map R → R[x] → R[x]/I. If we let R be the image of R in R[x]/I then we also have a map R[x] → R'[x]. In particular we can map I ac",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.eq_zero_of_polynomial_mem_map_range\n类型签名：(I : Ideal R[X]) (x : ((Quotient.mk I).comp C).range) (hx : C x ∈ I.map (Polynomial.mapRingHom ((Quotient.mk I).comp C).rangeRestrict)) : x = 0\n\nGiven any ring R and an ideal I of R[X], we get a map R → R[x] → R[x]/I. If we let R be the image of R in R[x]/I then we also have a map R[x] → R'[x]. In particular we can map I across this map, to get I' and a new map R' → R'[x] → R'[x]/I. This theorem shows I' will not contain any non-zero constant polynomials.\n\n文件：RingTheory/Polynomial/Quotient\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Quotient",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Quotient.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.eq_zero_of_polynomial_mem_map_range",
   "kind": "theorem",
   "signature": "(I : Ideal R[X]) (x : ((Quotient.mk I).comp C).range) (hx : C x ∈ I.map (Polynomial.mapRingHom ((Quotient.mk I).comp C).rangeRestrict)) : x = 0",
   "file": "Mathlib/RingTheory/Polynomial/Quotient.lean"
  }
 },
 {
  "id": "ml-ideal-ncard-primesover-lt-of-not-le",
  "latex": ".ncard < (P.primesOver S).ncard",
  "name": "Ideal.ncard_primesOver_lt_of_not_le",
  "en": "Ideal.ncard_primesOver_lt_of_not_le",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given a prime P of R and an ideal I in an R-algebra S. Suppose we can find a prime P' over P, not containing I, then the number of primes of S / I over P is strictly less than prim",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.ncard_primesOver_lt_of_not_le\n类型签名：(f : S →ₐ[R] T) (Hf : Function.Surjective f) (P : Ideal R) (P' : Ideal S) [P'.IsPrime] [P'.LiesOver P] (hkP' : ¬ RingHom.ker f.toRingHom ≤ P') (H : (P.primesOver S).Finite) : (P.primesOver T).ncard < (P.primesOver S).ncard\n\nGiven a prime P of R and an ideal I in an R-algebra S. Suppose we can find a prime P' over P, not containing I, then the number of primes of S / I over P is strictly less than primes of S over P (provided they are finite). The lemma is stated in terms of surjections for syntactic generality.\n\n文件：RingTheory/Ideal/Quotient/Over\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Over",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Over.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.ncard_primesOver_lt_of_not_le",
   "kind": "lemma",
   "signature": "(f : S →ₐ[R] T) (Hf : Function.Surjective f) (P : Ideal R) (P' : Ideal S) [P'.IsPrime] [P'.LiesOver P] (hkP' : ¬ RingHom.ker f.toRingHom ≤ P') (H : (P.primesOver S).Finite) : (P.primesOver T).ncard < (P.primesOver S).ncard",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Over.lean"
  }
 },
 {
  "id": "ml-localization-exists-finite-awaymap",
  "latex": "ₐ_of_surjective_awayMapₐ (f : S →ₐ T) (g : S) (hg : Function.Surjective (Localization.awayMapₐ f g)) (p : Ideal R) (hgp : IsUnit (M",
  "name": "Localization.exists_finite_awayMap",
  "en": "Localization.exists_finite_awayMap",
  "importance": 0.8,
  "family": "map",
  "summary": "Suppose f : S →ₐ[R] T is an R-algebra homomorphism with S integral and T of finite type, such that the induced map S[1/g] → T[1/g] is surjective for some g : S. Then for any prime ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Localization.exists_finite_awayMap\n类型签名：ₐ_of_surjective_awayMapₐ [Algebra.FiniteType R T] [Algebra.IsIntegral R S] (f : S →ₐ[R] T) (g : S) (hg : Function.Surjective (Localization.awayMapₐ f g)) (p : Ideal R) [p.IsPrime] (hgp : IsUnit (M\n\nSuppose f : S →ₐ[R] T is an R-algebra homomorphism with S integral and T of finite type, such that the induced map S[1/g] → T[1/g] is surjective for some g : S. Then for any prime p of R such that 1 ⊗ₜ g is invertible in κ(p) ⊗ S, there exists r ∉ p such that T[1/r] is finite over R[1/r].\n\n文件：RingTheory/Etale/QuasiFinite\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Etale/QuasiFinite",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Etale/QuasiFinite.lean",
  "formal": true,
  "lean": {
   "full": "Localization.exists_finite_awayMap",
   "kind": "lemma",
   "signature": "ₐ_of_surjective_awayMapₐ [Algebra.FiniteType R T] [Algebra.IsIntegral R S] (f : S →ₐ[R] T) (g : S) (hg : Function.Surjective (Localization.awayMapₐ f g)) (p : Ideal R) [p.IsPrime] (hgp : IsUnit (M",
   "file": "Mathlib/RingTheory/Etale/QuasiFinite.lean"
  }
 },
 {
  "id": "ml-ideal-exists-ideal-le-liesover-of-le",
  "latex": "∃ P ≤ Q, P.IsPrime ∧ P.LiesOver p",
  "name": "Ideal.exists_ideal_le_liesOver_of_le",
  "en": "Ideal.exists_ideal_le_liesOver_of_le",
  "importance": 0.8,
  "family": "foundation",
  "summary": "An R-algebra S satisfies Algebra.HasGoingDown R S if for every pair of prime ideals p ≤ q of R with Q a prime of S lying above q, there exists a prime P ≤ Q of S lying above p. The",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.exists_ideal_le_liesOver_of_le\n类型签名：[Algebra.HasGoingDown R S] {p q : Ideal R} [p.IsPrime] (Q : Ideal S) [Q.IsPrime] [Q.LiesOver q] (hle : p ≤ q) : ∃ P ≤ Q, P.IsPrime ∧ P.LiesOver p\n\nAn R-algebra S satisfies Algebra.HasGoingDown R S if for every pair of prime ideals p ≤ q of R with Q a prime of S lying above q, there exists a prime P ≤ Q of S lying above p. The condition only asks for < which is easier to prove, use Ideal.exists_ideal_le_liesOver_of_le for applying it.\n\n文件：RingTheory/Ideal/GoingDown\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/GoingDown",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/GoingDown.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.exists_ideal_le_liesOver_of_le",
   "kind": "lemma",
   "signature": "[Algebra.HasGoingDown R S] {p q : Ideal R} [p.IsPrime] (Q : Ideal S) [Q.IsPrime] [Q.LiesOver q] (hle : p ≤ q) : ∃ P ≤ Q, P.IsPrime ∧ P.LiesOver p",
   "file": "Mathlib/RingTheory/Ideal/GoingDown.lean"
  }
 },
 {
  "id": "ml-natabs-det-equiv",
  "latex": "Int.natAbs (LinearMap.det ((Submodule.subtype I).restrictScalars ℤ ∘ₗ AddMonoidHom.toIntLinearMap (e : S →+ I))) = Ideal.absNorm I",
  "name": "natAbs_det_equiv",
  "en": "natAbs_det_equiv",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let e : S ≃ I be an additive isomorphism (therefore a ℤ-linear equiv). Then an alternative way to compute the norm of I is given by taking the determinant of e. See natAbs_det_basi",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：natAbs_det_equiv\n类型签名：(I : Ideal S) {E : Type*} [EquivLike E S I] [AddEquivClass E S I] (e : E) : Int.natAbs (LinearMap.det ((Submodule.subtype I).restrictScalars ℤ ∘ₗ AddMonoidHom.toIntLinearMap (e : S →+ I))) = Ideal.absNorm I\n\nLet e : S ≃ I be an additive isomorphism (therefore a ℤ-linear equiv). Then an alternative way to compute the norm of I is given by taking the determinant of e. See natAbs_det_basis_change for a more familiar formulation of this result.\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "natAbs_det_equiv",
   "kind": "theorem",
   "signature": "(I : Ideal S) {E : Type*} [EquivLike E S I] [AddEquivClass E S I] (e : E) : Int.natAbs (LinearMap.det ((Submodule.subtype I).restrictScalars ℤ ∘ₗ AddMonoidHom.toIntLinearMap (e : S →+ I))) = Ideal.absNorm I",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-ideal-exists-ideal-ge-liesover-of-le",
  "latex": "∃ Q, P ≤ Q ∧ Q.IsPrime ∧ Q.LiesOver q",
  "name": "exists_ideal_ge_liesOver_of_le",
  "en": "Ideal.exists_ideal_ge_liesOver_of_le",
  "importance": 0.8,
  "family": "foundation",
  "summary": "An R-algebra S satisfies Algebra.HasGoingUp R S if for every pair of prime ideals p ≤ q of R with P a prime of S lying above p, there exists a prime P ≤ Q of S lying above q. The c",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.exists_ideal_ge_liesOver_of_le\n类型签名：[Algebra.HasGoingUp R S] {p q : Ideal R} [q.IsPrime] (P : Ideal S) [P.IsPrime] [P.LiesOver p] (hle : p ≤ q) : ∃ Q, P ≤ Q ∧ Q.IsPrime ∧ Q.LiesOver q\n\nAn R-algebra S satisfies Algebra.HasGoingUp R S if for every pair of prime ideals p ≤ q of R with P a prime of S lying above p, there exists a prime P ≤ Q of S lying above q. The condition only asks for < which is easier to prove, use Ideal.exists_ideal_ge_liesOver_of_le for applying it.\n\n文件：RingTheory/Ideal/HasGoingUp\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/HasGoingUp",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/HasGoingUp.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.exists_ideal_ge_liesOver_of_le",
   "kind": "lemma",
   "signature": "[Algebra.HasGoingUp R S] {p q : Ideal R} [q.IsPrime] (P : Ideal S) [P.IsPrime] [P.LiesOver p] (hle : p ≤ q) : ∃ Q, P ≤ Q ∧ Q.IsPrime ∧ Q.LiesOver q",
   "file": "Mathlib/RingTheory/Ideal/HasGoingUp.lean"
  }
 },
 {
  "id": "ml-away-adjoin-mk-prod-pow-eq-top",
  "latex": "Algebra.adjoin (𝒜 0) { Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) | (a : ℕ) (ai : ι' → ℕ …",
  "name": "Away.adjoin_mk_prod_pow_eq_top",
  "en": "Away.adjoin_mk_prod_pow_eq_top",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let 𝒜 be a graded ring, finitely generated (as an algebra) over 𝒜₀ by { vᵢ }, where vᵢ has degree dvᵢ. If f : A has degree d, then 𝒜_(f) is generated (as an algebra) over 𝒜₀ by",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Away.adjoin_mk_prod_pow_eq_top\n类型签名：{f : A} {d : ℕ} (hf : f ∈ 𝒜 d) (ι' : Type*) [Fintype ι'] (v : ι' → A) (hx : Algebra.adjoin (𝒜 0) (Set.range v) = ⊤) (dv : ι' → ℕ) (hxd : ∀ i, v i ∈ 𝒜 (dv i)) : Algebra.adjoin (𝒜 0) { Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) | (a : ℕ) (ai : ι' → ℕ) (hai : ∑ i, ai i • dv i = a • d) (_ : ∀ i, ai i ≤ d) } = ⊤\n\nLet 𝒜 be a graded ring, finitely generated (as an algebra) over 𝒜₀ by { vᵢ }, where vᵢ has degree dvᵢ. If f : A has degree d, then 𝒜_(f) is generated (as an algebra) over 𝒜₀ by elements of the form (∏ i, vᵢ ^ aᵢ) / fᵃ such that ∑ aᵢ • dvᵢ = a • d and ∀ i, aᵢ ≤ d.\n\n文件：RingTheory/GradedAlgebra/HomogeneousLocalization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/GradedAlgebra/HomogeneousLocalization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean",
  "formal": true,
  "lean": {
   "full": "Away.adjoin_mk_prod_pow_eq_top",
   "kind": "theorem",
   "signature": "{f : A} {d : ℕ} (hf : f ∈ 𝒜 d) (ι' : Type*) [Fintype ι'] (v : ι' → A) (hx : Algebra.adjoin (𝒜 0) (Set.range v) = ⊤) (dv : ι' → ℕ) (hxd : ∀ i, v i ∈ 𝒜 (dv i)) : Algebra.adjoin (𝒜 0) { Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) | (a : ℕ) (ai : ι' → ℕ) (hai : ∑ i, ai i • dv i = a • d) (_ : ∀ i, ai i ≤ d) } = ⊤",
   "file": "Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean"
  }
 },
 {
  "id": "ml-islocalization-isprime-of-isprime-disjoint",
  "latex": "I).IsPrime",
  "name": "isPrime_of_isPrime_disjoint",
  "en": "IsLocalization.isPrime_of_isPrime_disjoint",
  "importance": 0.79,
  "family": "foundation",
  "summary": "If R is a ring, then prime ideals in the localization at M correspond to prime ideals in the original ring R that are disjoint from M. This lemma gives the particular case for an i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.isPrime_of_isPrime_disjoint\n类型签名：(I : Ideal R) (hp : I.IsPrime) (hd : Disjoint (M : Set R) ↑I) : (Ideal.map (algebraMap R S) I).IsPrime\n\nIf R is a ring, then prime ideals in the localization at M correspond to prime ideals in the original ring R that are disjoint from M. This lemma gives the particular case for an ideal and its map, see le_rel_iso_of_prime for the more general relation isomorphism, and the reverse implication\n\n文件：RingTheory/Localization/Ideal\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Ideal",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Ideal.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.isPrime_of_isPrime_disjoint",
   "kind": "theorem",
   "signature": "(I : Ideal R) (hp : I.IsPrime) (hd : Disjoint (M : Set R) ↑I) : (Ideal.map (algebraMap R S) I).IsPrime",
   "file": "Mathlib/RingTheory/Localization/Ideal.lean"
  }
 },
 {
  "id": "ml-primespectrum-exist-ltseries-mem-one-of-mem-last",
  "latex": "LTSeries (PrimeSpectrum R), x ∈ (q 1).asIdeal ∧ p.length = q.length ∧ p.head = q.head ∧ p.last = q.last",
  "name": "exist_ltSeries_mem_one_of_mem_last",
  "en": "PrimeSpectrum.exist_ltSeries_mem_one_of_mem_last",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let $R$ be a Noetherian ring, $\\mathfrak{p}_0 < \\dots < \\mathfrak{p}_n$ be a chain of primes, $x \\in \\mathfrak{p}_n$. Then we can find another chain of primes $\\mathfrak{q}_0 < \\do",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：PrimeSpectrum.exist_ltSeries_mem_one_of_mem_last\n类型签名：(p : LTSeries (PrimeSpectrum R)) {x : R} (hx : x ∈ p.last.asIdeal) : ∃ q : LTSeries (PrimeSpectrum R), x ∈ (q 1).asIdeal ∧ p.length = q.length ∧ p.head = q.head ∧ p.last = q.last\n\nLet $R$ be a Noetherian ring, $\\mathfrak{p}_0 < \\dots < \\mathfrak{p}_n$ be a chain of primes, $x \\in \\mathfrak{p}_n$. Then we can find another chain of primes $\\mathfrak{q}_0 < \\dots < \\mathfrak{q}_n$ such that $x \\in \\mathfrak{q}_1$, $\\mathfrak{p}_0 = \\mathfrak{q}_0$ and $\\mathfrak{p}_n = \\mathfrak{q}_n$.\n\n文件：RingTheory/Spectrum/Prime/LTSeries\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/LTSeries",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/LTSeries.lean",
  "formal": true,
  "lean": {
   "full": "PrimeSpectrum.exist_ltSeries_mem_one_of_mem_last",
   "kind": "theorem",
   "signature": "(p : LTSeries (PrimeSpectrum R)) {x : R} (hx : x ∈ p.last.asIdeal) : ∃ q : LTSeries (PrimeSpectrum R), x ∈ (q 1).asIdeal ∧ p.length = q.length ∧ p.head = q.head ∧ p.last = q.last",
   "file": "Mathlib/RingTheory/Spectrum/Prime/LTSeries.lean"
  }
 },
 {
  "id": "ml-away-span-mk-prod-pow-eq-top",
  "latex": "Submodule.span (𝒜 0) { (Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) : Away 𝒜 f) | (a : ℕ …",
  "name": "Away.span_mk_prod_pow_eq_top",
  "en": "Away.span_mk_prod_pow_eq_top",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let 𝒜 be a graded ring, finitely generated (as an algebra) over 𝒜₀ by { vᵢ }, where vᵢ has degree dvᵢ. If f : A has degree d, then 𝒜_(f) is generated (as a module) over 𝒜₀ by e",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Away.span_mk_prod_pow_eq_top\n类型签名：{f : A} {d : ι} (hf : f ∈ 𝒜 d) {ι' : Type*} [Fintype ι'] (v : ι' → A) (hx : Algebra.adjoin (𝒜 0) (Set.range v) = ⊤) (dv : ι' → ι) (hxd : ∀ i, v i ∈ 𝒜 (dv i)) : Submodule.span (𝒜 0) { (Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) : Away 𝒜 f) | (a : ℕ) (ai : ι' → ℕ) (hai : ∑ i, ai i • dv i = a • d) } = ⊤\n\nLet 𝒜 be a graded ring, finitely generated (as an algebra) over 𝒜₀ by { vᵢ }, where vᵢ has degree dvᵢ. If f : A has degree d, then 𝒜_(f) is generated (as a module) over 𝒜₀ by elements of the form (∏ i, vᵢ ^ aᵢ) / fᵃ such that ∑ aᵢ • dvᵢ = a • d.\n\n文件：RingTheory/GradedAlgebra/HomogeneousLocalization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/GradedAlgebra/HomogeneousLocalization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean",
  "formal": true,
  "lean": {
   "full": "Away.span_mk_prod_pow_eq_top",
   "kind": "theorem",
   "signature": "{f : A} {d : ι} (hf : f ∈ 𝒜 d) {ι' : Type*} [Fintype ι'] (v : ι' → A) (hx : Algebra.adjoin (𝒜 0) (Set.range v) = ⊤) (dv : ι' → ι) (hxd : ∀ i, v i ∈ 𝒜 (dv i)) : Submodule.span (𝒜 0) { (Away.mk 𝒜 hf a (∏ i, v i ^ ai i) (hai ▸ SetLike.prod_pow_mem_graded _ _ _ _ fun i _ ↦ hxd i) : Away 𝒜 f) | (a : ℕ) (ai : ι' → ℕ) (hai : ∑ i, ai i • dv i = a • d) } = ⊤",
   "file": "Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean"
  }
 },
 {
  "id": "ml-module-flat-exists-factorization-of-comp-eq-zero-of-free",
  "latex": "∃ (k : ℕ) (a : N →ₗ (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ M), x = y ∘ₗ a ∧ a ∘ₗ f = 0",
  "name": "exists_factorization_of_comp_eq_zero_of_free",
  "en": "Module.Flat.exists_factorization_of_comp_eq_zero_of_free",
  "importance": 0.8,
  "family": "map",
  "summary": "Let $M$ be a flat module. Let $K$ and $N$ be finite $R$-modules with $N$ free, and let $f \\colon K \\to N$ and $x \\colon N \\to M$ be linear maps such that $x \\circ f = 0$. Then ther",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Flat.exists_factorization_of_comp_eq_zero_of_free\n类型签名：[Flat R M] {K N : Type*} [AddCommGroup K] [Module R K] [Module.Finite R K] [AddCommGroup N] [Module R N] [Free R N] [Module.Finite R N] {f : K →ₗ[R] N} {x : N →ₗ[R] M} (h : x ∘ₗ f = 0) : ∃ (k : ℕ) (a : N →ₗ[R] (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ[R] M), x = y ∘ₗ a ∧ a ∘ₗ f = 0\n\nLet $M$ be a flat module. Let $K$ and $N$ be finite $R$-modules with $N$ free, and let $f \\colon K \\to N$ and $x \\colon N \\to M$ be linear maps such that $x \\circ f = 0$. Then there exist a finite free module $R^k$ and linear maps $a \\colon N \\to R^k$ and $y \\colon R^k \\to M$ such that $x = y \\circ a$ and $a \\circ f = 0$.\n\n文件：RingTheory/Flat/EquationalCriterion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/EquationalCriterion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/EquationalCriterion.lean",
  "formal": true,
  "lean": {
   "full": "Module.Flat.exists_factorization_of_comp_eq_zero_of_free",
   "kind": "theorem",
   "signature": "[Flat R M] {K N : Type*} [AddCommGroup K] [Module R K] [Module.Finite R K] [AddCommGroup N] [Module R N] [Free R N] [Module.Finite R N] {f : K →ₗ[R] N} {x : N →ₗ[R] M} (h : x ∘ₗ f = 0) : ∃ (k : ℕ) (a : N →ₗ[R] (Fin k →₀ R)) (y : (Fin k →₀ R) →ₗ[R] M), x = y ∘ₗ a ∧ a ∘ₗ f = 0",
   "file": "Mathlib/RingTheory/Flat/EquationalCriterion.lean"
  }
 },
 {
  "id": "ml-isintegral-localization",
  "latex": "(show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegral",
  "name": "isIntegral_localization",
  "en": "isIntegral_localization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If R → S is an integral extension, M is a submonoid of R, Rₘ is the localization of R at M, and Sₘ is the localization of S at the image of M under the extension map, then the indu",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isIntegral_localization\n类型签名：[Algebra.IsIntegral R S] : (map Sₘ (algebraMap R S) (show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegral\n\nIf R → S is an integral extension, M is a submonoid of R, Rₘ is the localization of R at M, and Sₘ is the localization of S at the image of M under the extension map, then the induced map Rₘ → Sₘ is also an integral extension\n\n文件：RingTheory/Localization/Integral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Integral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Integral.lean",
  "formal": true,
  "lean": {
   "full": "isIntegral_localization",
   "kind": "theorem",
   "signature": "[Algebra.IsIntegral R S] : (map Sₘ (algebraMap R S) (show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegral",
   "file": "Mathlib/RingTheory/Localization/Integral.lean"
  }
 },
 {
  "id": "ml-islocalring-exists-adjoin-eq-top",
  "latex": "S, Algebra.adjoin R {β} = ⊤",
  "name": "exists_adjoin_eq_top",
  "en": "IsLocalRing.exists_adjoin_eq_top",
  "importance": 0.73,
  "family": "map",
  "summary": "A finite étale extension of local rings is generated by a single element. This is Lemma 3.2, part 1 of [arXiv:2503.07846](https://arxiv.org/abs/2503.07846). The proof lifts a primi",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.exists_adjoin_eq_top\n类型签名：[Algebra.FormallyUnramified R S] : ∃ β : S, Algebra.adjoin R {β} = ⊤\n\nA finite étale extension of local rings is generated by a single element. This is Lemma 3.2, part 1 of [arXiv:2503.07846](https://arxiv.org/abs/2503.07846). The proof lifts a primitive element of the residue field extension via Nakayama's lemma.\n\n文件：RingTheory/LocalRing/Etale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/Etale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/Etale.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.exists_adjoin_eq_top",
   "kind": "theorem",
   "signature": "[Algebra.FormallyUnramified R S] : ∃ β : S, Algebra.adjoin R {β} = ⊤",
   "file": "Mathlib/RingTheory/LocalRing/Etale.lean"
  }
 },
 {
  "id": "ml-islocalization-isprime-iff-isprime-disjoint",
  "latex": "J.IsPrime ↔ (J.under R).IsPrime ∧ Disjoint (M : Set R) (J.under R)",
  "name": "isPrime_iff_isPrime_disjoint",
  "en": "IsLocalization.isPrime_iff_isPrime_disjoint",
  "importance": 0.76,
  "family": "foundation",
  "summary": "If R is a ring, then prime ideals in the localization at M correspond to prime ideals in the original ring R that are disjoint from M. This lemma gives the particular case for an i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.isPrime_iff_isPrime_disjoint\n类型签名：(J : Ideal S) : J.IsPrime ↔ (J.under R).IsPrime ∧ Disjoint (M : Set R) (J.under R)\n\nIf R is a ring, then prime ideals in the localization at M correspond to prime ideals in the original ring R that are disjoint from M. This lemma gives the particular case for an ideal and its comap, see le_rel_iso_of_prime for the more general relation isomorphism\n\n文件：RingTheory/Localization/Ideal\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Ideal",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Ideal.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.isPrime_iff_isPrime_disjoint",
   "kind": "theorem",
   "signature": "(J : Ideal S) : J.IsPrime ↔ (J.under R).IsPrime ∧ Disjoint (M : Set R) (J.under R)",
   "file": "Mathlib/RingTheory/Localization/Ideal.lean"
  }
 },
 {
  "id": "ml-commutes",
  "latex": "IsLocalization.Away (algebraMap R S₁ y) T",
  "name": "commutes",
  "en": "commutes",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If S₁ is the localization of R away from f and S₂ is the localization away from g, then any localization T of S₂ away from f is also a localization of S₁ away from g.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：commutes\n类型签名：{R : Type*} [CommSemiring R] (S₁ S₂ T : Type*) [CommSemiring S₁] [CommSemiring S₂] [CommSemiring T] [Algebra R S₁] [Algebra R S₂] [Algebra R T] [Algebra S₁ T] [Algebra S₂ T] [IsScalarTower R S₁ T] [IsScalarTower R S₂ T] (x y : R) [IsLocalization.Away x S₁] [IsLocalization.Away y S₂] [IsLocalization.Away (algebraMap R S₂ x) T] : IsLocalization.Away (algebraMap R S₁ y) T\n\nIf S₁ is the localization of R away from f and S₂ is the localization away from g, then any localization T of S₂ away from f is also a localization of S₁ away from g.\n\n文件：RingTheory/Localization/Away/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Away/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Away/Basic.lean",
  "formal": true,
  "lean": {
   "full": "commutes",
   "kind": "lemma",
   "signature": "{R : Type*} [CommSemiring R] (S₁ S₂ T : Type*) [CommSemiring S₁] [CommSemiring S₂] [CommSemiring T] [Algebra R S₁] [Algebra R S₂] [Algebra R T] [Algebra S₁ T] [Algebra S₂ T] [IsScalarTower R S₁ T] [IsScalarTower R S₂ T] (x y : R) [IsLocalization.Away x S₁] [IsLocalization.Away y S₂] [IsLocalization.Away (algebraMap R S₂ x) T] : IsLocalization.Away (algebraMap R S₁ y) T",
   "file": "Mathlib/RingTheory/Localization/Away/Basic.lean"
  }
 },
 {
  "id": "ml-islocalization-isunit-piringhom-algebramap-comp-pieval-271ec768",
  "latex": "IsUnit ((RingHom.pi fun i ↦ (algebraMap (R i) (S i)).comp (Pi.evalRingHom R i)) y)",
  "name": "isUnit_piRingHom_algebraMap_comp_piEvalRingHom",
  "en": "IsLocalization.isUnit_piRingHom_algebraMap_comp_piEvalRingHom",
  "importance": 0.77,
  "family": "foundation",
  "summary": "Let M be a submonoid of a direct product of commutative rings R i, and let M' i denote the projection of M onto each corresponding factor. Given a ring homomorphism from the direct",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.isUnit_piRingHom_algebraMap_comp_piEvalRingHom\n类型签名：(y : M) : IsUnit ((RingHom.pi fun i ↦ (algebraMap (R i) (S i)).comp (Pi.evalRingHom R i)) y)\n\nLet M be a submonoid of a direct product of commutative rings R i, and let M' i denote the projection of M onto each corresponding factor. Given a ring homomorphism from the direct product Π i, R i to the product of the localizations of each R i at M' i, every y : M maps to a unit under this homomorphism.\n\n文件：RingTheory/Localization/Pi\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Pi",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Pi.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.isUnit_piRingHom_algebraMap_comp_piEvalRingHom",
   "kind": "lemma",
   "signature": "(y : M) : IsUnit ((RingHom.pi fun i ↦ (algebraMap (R i) (S i)).comp (Pi.evalRingHom R i)) y)",
   "file": "Mathlib/RingTheory/Localization/Pi.lean"
  }
 },
 {
  "id": "ml-resultant-deriv",
  "latex": "resultant f f.derivative f.natDegree (f.natDegree - 1) = (-1) ^ (f.natDegree * (f.natDegree - 1) / 2) * f.leadingCoeff * f.discr",
  "name": "resultant_deriv",
  "en": "resultant_deriv",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Relation between the resultant and the discriminant. (Note this is actually false when f is a constant polynomial not equal to 1, so the assumption on the degree is genuinely neede",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：resultant_deriv\n类型签名：{f : R[X]} (hf : 0 < f.degree) : resultant f f.derivative f.natDegree (f.natDegree - 1) = (-1) ^ (f.natDegree * (f.natDegree - 1) / 2) * f.leadingCoeff * f.discr\n\nRelation between the resultant and the discriminant. (Note this is actually false when f is a constant polynomial not equal to 1, so the assumption on the degree is genuinely needed.)\n\n文件：RingTheory/Polynomial/Resultant/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Resultant/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Resultant/Basic.lean",
  "formal": true,
  "lean": {
   "full": "resultant_deriv",
   "kind": "lemma",
   "signature": "{f : R[X]} (hf : 0 < f.degree) : resultant f f.derivative f.natDegree (f.natDegree - 1) = (-1) ^ (f.natDegree * (f.natDegree - 1) / 2) * f.leadingCoeff * f.discr",
   "file": "Mathlib/RingTheory/Polynomial/Resultant/Basic.lean"
  }
 },
 {
  "id": "ml-primespectrum-exists-maximal-notmem-range-sigmatopi-of-c3dc48b2",
  "latex": "∃ (I : Ideal (Π i, R i)) (_ : I.IsMaximal), ⟨I, inferInstance⟩ ∉ Set.range (sigmaToPi R)",
  "name": "exists_maximal_notMem_range_sigmaToPi_of_infinite",
  "en": "PrimeSpectrum.exists_maximal_notMem_range_sigmaToPi_of_infinite",
  "importance": 0.77,
  "family": "foundation",
  "summary": "An infinite product of nontrivial commutative semirings has a maximal ideal outside of the range of sigmaToPi, i.e. is not of the form πᵢ⁻¹(𝔭) for some prime 𝔭 ⊂ R i, where πᵢ : ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：PrimeSpectrum.exists_maximal_notMem_range_sigmaToPi_of_infinite\n类型签名：: ∃ (I : Ideal (Π i, R i)) (_ : I.IsMaximal), ⟨I, inferInstance⟩ ∉ Set.range (sigmaToPi R)\n\nAn infinite product of nontrivial commutative semirings has a maximal ideal outside of the range of sigmaToPi, i.e. is not of the form πᵢ⁻¹(𝔭) for some prime 𝔭 ⊂ R i, where πᵢ : (Π i, R i) →+* R i is the projection. For a complete description of all prime ideals, see https://math.stackexchange.com/a/1563190.\n\n文件：RingTheory/Spectrum/Prime/RingHom\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/RingHom",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/RingHom.lean",
  "formal": true,
  "lean": {
   "full": "PrimeSpectrum.exists_maximal_notMem_range_sigmaToPi_of_infinite",
   "kind": "theorem",
   "signature": ": ∃ (I : Ideal (Π i, R i)) (_ : I.IsMaximal), ⟨I, inferInstance⟩ ∉ Set.range (sigmaToPi R)",
   "file": "Mathlib/RingTheory/Spectrum/Prime/RingHom.lean"
  }
 },
 {
  "id": "ml-mul-scaleroots",
  "latex": "r ^ (natDegree p + natDegree q - natDegree (p * q)) • (p * q).scaleRoots r = p.scaleRoots r * q.scaleRoots r",
  "name": "mul_scaleRoots",
  "en": "mul_scaleRoots",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Multiplication and scaleRoots commute up to a power of r. The factor disappears if we assume that the product of the leading coeffs does not vanish. See Polynomial.mul_scaleRoots'.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：mul_scaleRoots\n类型签名：(p q : R[X]) (r : R) : r ^ (natDegree p + natDegree q - natDegree (p * q)) • (p * q).scaleRoots r = p.scaleRoots r * q.scaleRoots r\n\nMultiplication and scaleRoots commute up to a power of r. The factor disappears if we assume that the product of the leading coeffs does not vanish. See Polynomial.mul_scaleRoots'.\n\n文件：RingTheory/Polynomial/ScaleRoots\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/ScaleRoots",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/ScaleRoots.lean",
  "formal": true,
  "lean": {
   "full": "mul_scaleRoots",
   "kind": "lemma",
   "signature": "(p q : R[X]) (r : R) : r ^ (natDegree p + natDegree q - natDegree (p * q)) • (p * q).scaleRoots r = p.scaleRoots r * q.scaleRoots r",
   "file": "Mathlib/RingTheory/Polynomial/ScaleRoots.lean"
  }
 },
 {
  "id": "ml-map-map",
  "latex": "map W l hl (map Q g hy x) = map W (l.comp g) (fun _ hx => hl (hy hx)) x",
  "name": "map_map",
  "en": "map_map",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If CommSemiring homs g : R →+* P, l : P →+* A induce maps of localizations, the composition of the induced maps equals the map of localizations induced by l ∘ g.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_map\n类型签名：{A : Type*} [CommSemiring A] {U : Submonoid A} {W} [CommSemiring W] [Algebra A W] [IsLocalization U W] {l : P →+* A} (hl : T ≤ U.comap l) (x : S) : map W l hl (map Q g hy x) = map W (l.comp g) (fun _ hx => hl (hy hx)) x\n\nIf CommSemiring homs g : R →+* P, l : P →+* A induce maps of localizations, the composition of the induced maps equals the map of localizations induced by l ∘ g.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "map_map",
   "kind": "theorem",
   "signature": "{A : Type*} [CommSemiring A] {U : Submonoid A} {W} [CommSemiring W] [Algebra A W] [IsLocalization U W] {l : P →+* A} (hl : T ≤ U.comap l) (x : S) : map W l hl (map Q g hy x) = map W (l.comp g) (fun _ hx => hl (hy hx)) x",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-istensorproduct-map-injective-of-flat-right-left",
  "latex": "Function.Injective (hf.map hg i₁ i₂)",
  "name": "map_injective_of_flat_right_left",
  "en": "IsTensorProduct.map_injective_of_flat_right_left",
  "importance": 0.8,
  "family": "map",
  "summary": "If M₂ and N₁ are flat R-modules, i₁ : M₁ →ₗ[R] N₁ and i₂ : M₂ →ₗ[R] N₂ are injective linear maps, then the linear map i : M ≅ M₁ ⊗[R] M₂ →ₗ[R] N₁ ⊗[R] N₂ ≅ N induced by i₁ and i₂ i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsTensorProduct.map_injective_of_flat_right_left\n类型签名：(h₁ : Function.Injective i₁) (h₂ : Function.Injective i₂) [Module.Flat R M₂] [Module.Flat R N₁] : Function.Injective (hf.map hg i₁ i₂)\n\nIf M₂ and N₁ are flat R-modules, i₁ : M₁ →ₗ[R] N₁ and i₂ : M₂ →ₗ[R] N₂ are injective linear maps, then the linear map i : M ≅ M₁ ⊗[R] M₂ →ₗ[R] N₁ ⊗[R] N₂ ≅ N induced by i₁ and i₂ is injective. See IsTensorProduct.map_injective_of_flat' for different flatness conditions.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IsTensorProduct.map_injective_of_flat_right_left",
   "kind": "theorem",
   "signature": "(h₁ : Function.Injective i₁) (h₂ : Function.Injective i₂) [Module.Flat R M₂] [Module.Flat R N₁] : Function.Injective (hf.map hg i₁ i₂)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-istensorproduct-map-injective-of-flat-left-right",
  "latex": "Function.Injective (hf.map hg i₁ i₂)",
  "name": "map_injective_of_flat_left_right",
  "en": "IsTensorProduct.map_injective_of_flat_left_right",
  "importance": 0.8,
  "family": "map",
  "summary": "If M₁ and N₂ are flat R-modules, i₁ : M₁ →ₗ[R] N₁ and i₂ : M₂ →ₗ[R] N₂ are injective linear maps, then the linear map i : M ≅ M₁ ⊗[R] M₂ →ₗ[R] N₁ ⊗[R] N₂ ≅ N induced by i₁ and i₂ i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsTensorProduct.map_injective_of_flat_left_right\n类型签名：(h₁ : Function.Injective i₁) (h₂ : Function.Injective i₂) [Module.Flat R M₁] [Module.Flat R N₂] : Function.Injective (hf.map hg i₁ i₂)\n\nIf M₁ and N₂ are flat R-modules, i₁ : M₁ →ₗ[R] N₁ and i₂ : M₂ →ₗ[R] N₂ are injective linear maps, then the linear map i : M ≅ M₁ ⊗[R] M₂ →ₗ[R] N₁ ⊗[R] N₂ ≅ N induced by i₁ and i₂ is injective. See IsTensorProduct.map_injective_of_flat for different flatness conditions.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IsTensorProduct.map_injective_of_flat_left_right",
   "kind": "theorem",
   "signature": "(h₁ : Function.Injective i₁) (h₂ : Function.Injective i₂) [Module.Flat R M₁] [Module.Flat R N₂] : Function.Injective (hf.map hg i₁ i₂)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-eq-of-eq",
  "latex": "g x = g y",
  "name": "eq_of_eq",
  "en": "eq_of_eq",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given a localization map f : R →+* S for a submonoid M ⊆ R and a map of CommSemirings g : R →+* P such that g(M) ⊆ Units P, f x = f y → g x = g y for all x y : R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：eq_of_eq\n类型签名：{g : R →+* P} (hg : ∀ y : M, IsUnit (g y)) {x y} (h : (algebraMap R S) x = (algebraMap R S) y) : g x = g y\n\nGiven a localization map f : R →+* S for a submonoid M ⊆ R and a map of CommSemirings g : R →+* P such that g(M) ⊆ Units P, f x = f y → g x = g y for all x y : R.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "eq_of_eq",
   "kind": "theorem",
   "signature": "{g : R →+* P} (hg : ∀ y : M, IsUnit (g y)) {x y} (h : (algebraMap R S) x = (algebraMap R S) y) : g x = g y",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-is-integral-localization-at-leadingcoeff",
  "latex": "(show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegralElem (algebraMap S Sₘ x)",
  "name": "is_integral_localization_at_leadingCoeff",
  "en": "is_integral_localization_at_leadingCoeff",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given a particular witness to an element being algebraic over an algebra R → S, We can localize to a submonoid containing the leading coefficient to make it integral. Explicitly, t",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：is_integral_localization_at_leadingCoeff\n类型签名：{x : S} (p : R[X]) (hp : aeval x p = 0) (hM : p.leadingCoeff ∈ M) : (map Sₘ (algebraMap R S) (show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegralElem (algebraMap S Sₘ x)\n\nGiven a particular witness to an element being algebraic over an algebra R → S, We can localize to a submonoid containing the leading coefficient to make it integral. Explicitly, the map between the localizations will be an integral ring morphism\n\n文件：RingTheory/Localization/Integral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Integral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Integral.lean",
  "formal": true,
  "lean": {
   "full": "is_integral_localization_at_leadingCoeff",
   "kind": "theorem",
   "signature": "{x : S} (p : R[X]) (hp : aeval x p = 0) (hM : p.leadingCoeff ∈ M) : (map Sₘ (algebraMap R S) (show _ ≤ (Algebra.algebraMapSubmonoid S M).comap _ from M.le_comap_map) : Rₘ →+* _).IsIntegralElem (algebraMap S Sₘ x)",
   "file": "Mathlib/RingTheory/Localization/Integral.lean"
  }
 },
 {
  "id": "ml-map-under-le-under-map",
  "latex": "map (algebraMap A C) (under A P) ≤ under C (map (algebraMap B D) P)",
  "name": "map_under_le_under_map",
  "en": "map_under_le_under_map",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Consider the following commutative diagram of ring maps A → B ↓ ↓ C → D and let P be an ideal of B. The image in C of the ideal of A under P is included in the ideal of C under the",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_under_le_under_map\n类型签名：{C D : Type*} [CommSemiring C] [Semiring D] [Algebra A C] [Algebra C D] [Algebra A D] [Algebra B D] [IsScalarTower A C D] [IsScalarTower A B D] : map (algebraMap A C) (under A P) ≤ under C (map (algebraMap B D) P)\n\nConsider the following commutative diagram of ring maps A → B ↓ ↓ C → D and let P be an ideal of B. The image in C of the ideal of A under P is included in the ideal of C under the image of P in D.\n\n文件：RingTheory/Ideal/Over\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Over",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Over.lean",
  "formal": true,
  "lean": {
   "full": "map_under_le_under_map",
   "kind": "theorem",
   "signature": "{C D : Type*} [CommSemiring C] [Semiring D] [Algebra A C] [Algebra C D] [Algebra A D] [Algebra B D] [IsScalarTower A C D] [IsScalarTower A B D] : map (algebraMap A C) (under A P) ≤ under C (map (algebraMap B D) P)",
   "file": "Mathlib/RingTheory/Ideal/Over.lean"
  }
 },
 {
  "id": "ml-mul",
  "latex": "IsLocalization.Away (y * x) T",
  "name": "mul",
  "en": "mul",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Localizing the localization of R at x at the image of y is the same as localizing R at y * x. See IsLocalization.Away.mul' for the x * y version.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：mul\n类型签名：(T : Type*) [CommSemiring T] [Algebra S T] [Algebra R T] [IsScalarTower R S T] (x y : R) [IsLocalization.Away x S] [IsLocalization.Away (algebraMap R S y) T] : IsLocalization.Away (y * x) T\n\nLocalizing the localization of R at x at the image of y is the same as localizing R at y * x. See IsLocalization.Away.mul' for the x * y version.\n\n文件：RingTheory/Localization/Away/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Away/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Away/Basic.lean",
  "formal": true,
  "lean": {
   "full": "mul",
   "kind": "lemma",
   "signature": "(T : Type*) [CommSemiring T] [Algebra S T] [Algebra R T] [IsScalarTower R S T] (x y : R) [IsLocalization.Away x S] [IsLocalization.Away (algebraMap R S y) T] : IsLocalization.Away (y * x) T",
   "file": "Mathlib/RingTheory/Localization/Away/Basic.lean"
  }
 },
 {
  "id": "ml-isprimitiveroot-sum-eq-zero-iff-forall-eq",
  "latex": "∑ i, α i * ζ ^ i.val = 0 ↔ ∀ i j, α i = α j",
  "name": "sum_eq_zero_iff_forall_eq",
  "en": "IsPrimitiveRoot.sum_eq_zero_iff_forall_eq",
  "importance": 0.79,
  "family": "foundation",
  "summary": "For a prime p, a ℚ-linear combination ∑_{i < p} αᵢ ζⁱ vanishes if and only if all coefficients αᵢ are equal. This follows from the irreducibility of the p-th cyclotomic polynomial.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsPrimitiveRoot.sum_eq_zero_iff_forall_eq\n类型签名：(hp : p.Prime) (hζ : IsPrimitiveRoot ζ p) (α : Fin p → ℚ) : ∑ i, α i * ζ ^ i.val = 0 ↔ ∀ i j, α i = α j\n\nFor a prime p, a ℚ-linear combination ∑_{i < p} αᵢ ζⁱ vanishes if and only if all coefficients αᵢ are equal. This follows from the irreducibility of the p-th cyclotomic polynomial. See de Launey–Flannery, *Algebraic Design Theory*, Lemma 2.8.5.\n\n文件：RingTheory/Polynomial/Cyclotomic/Roots\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Roots",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Roots.lean",
  "formal": true,
  "lean": {
   "full": "IsPrimitiveRoot.sum_eq_zero_iff_forall_eq",
   "kind": "lemma",
   "signature": "(hp : p.Prime) (hζ : IsPrimitiveRoot ζ p) (α : Fin p → ℚ) : ∑ i, α i * ζ ^ i.val = 0 ↔ ∀ i j, α i = α j",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Roots.lean"
  }
 },
 {
  "id": "ml-islocalring-of-subring",
  "latex": "IsLocalRing R",
  "name": "of_subring'",
  "en": "IsLocalRing.of_subring'",
  "importance": 0.79,
  "family": "foundation",
  "summary": "If in a sub(semi)ring R of a local (semi)ring R' every element is either invertible or a zero divisor, then R is local. This version is for R and R' that are both sub(semi)rings of",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.of_subring'\n类型签名：{R R' : Subsemiring S} [IsLocalRing R'] (inc : R ≤ R') (h : ∀ a, a ∈ R⁰ → IsUnit a) : IsLocalRing R\n\nIf in a sub(semi)ring R of a local (semi)ring R' every element is either invertible or a zero divisor, then R is local. This version is for R and R' that are both sub(semi)rings of a (semi)ring S.\n\n文件：RingTheory/LocalRing/Subring\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/Subring",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/Subring.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.of_subring'",
   "kind": "theorem",
   "signature": "{R R' : Subsemiring S} [IsLocalRing R'] (inc : R ≤ R') (h : ∀ a, a ∈ R⁰ → IsUnit a) : IsLocalRing R",
   "file": "Mathlib/RingTheory/LocalRing/Subring.lean"
  }
 },
 {
  "id": "ml-lift-algebramap",
  "latex": "lift hg (algebraMap A K x) = g x",
  "name": "lift_algebraMap",
  "en": "lift_algebraMap",
  "importance": 0.72,
  "family": "foundation",
  "summary": "Given a commutative ring A with field of fractions K, and an injective ring hom g : A →+* L where L is a field, the field hom induced from K to L maps x to g x for all x : A.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：lift_algebraMap\n类型签名：(hg : Injective g) (x) : lift hg (algebraMap A K x) = g x\n\nGiven a commutative ring A with field of fractions K, and an injective ring hom g : A →+* L where L is a field, the field hom induced from K to L maps x to g x for all x : A.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "lift_algebraMap",
   "kind": "theorem",
   "signature": "(hg : Injective g) (x) : lift hg (algebraMap A K x) = g x",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-polynomial-splits-surjective-topermhom-of-isup-inertia-6f6a953e",
  "latex": "Function.Surjective (MulAction.toPermHom G (f.rootSet S))",
  "name": "Splits.surjective_toPermHom_of_iSup_inertia_eq_top",
  "en": "Polynomial.Splits.surjective_toPermHom_of_iSup_inertia_eq_top",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If the roots of f in S have at most one collision modulo each maximal ideal m, and if a group G acting transitively on the roots in S is generated by inertia subgroups, then G surj",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.Splits.surjective_toPermHom_of_iSup_inertia_eq_top\n类型签名：(hf : (f.map (algebraMap R S)).Splits) [MulAction.IsPretransitive G (f.rootSet S)] (h : ∀ m : MaximalSpectrum S, (f.rootSet S).ncard ≤ (f.rootSet (S ⧸ m.asIdeal)).ncard + 1) (hG : ⨆ m : MaximalSpectrum S, m.asIdeal.inertia G = ⊤) : Function.Surjective (MulAction.toPermHom G (f.rootSet S))\n\nIf the roots of f in S have at most one collision modulo each maximal ideal m, and if a group G acting transitively on the roots in S is generated by inertia subgroups, then G surjects onto the symmetric group S_n. Such polynomials are called *Morse functions* in Section 4.4 of [serre-galois].\n\n文件：RingTheory/Polynomial/Morse\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Morse",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Morse.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.Splits.surjective_toPermHom_of_iSup_inertia_eq_top",
   "kind": "theorem",
   "signature": "(hf : (f.map (algebraMap R S)).Splits) [MulAction.IsPretransitive G (f.rootSet S)] (h : ∀ m : MaximalSpectrum S, (f.rootSet S).ncard ≤ (f.rootSet (S ⧸ m.asIdeal)).ncard + 1) (hG : ⨆ m : MaximalSpectrum S, m.asIdeal.inertia G = ⊤) : Function.Surjective (MulAction.toPermHom G (f.rootSet S))",
   "file": "Mathlib/RingTheory/Polynomial/Morse.lean"
  }
 },
 {
  "id": "ml-map-mk",
  "latex": "map g comap_le (mk x) = mk ⟨x.1, ⟨_, map_mem g x.2.2⟩, ⟨_, map_mem g x.3.2⟩, comap_le x.4⟩",
  "name": "map_mk",
  "en": "map_mk",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let A be a graded ring and P ≤ Q be two submonoids, then the homogeneous localization of A at P embeds into the homogeneous localization of A at Q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_mk\n类型签名：(g : 𝒜 →+*ᵍ ℬ) (comap_le : P ≤ Q.comap g) (x) : map g comap_le (mk x) = mk ⟨x.1, ⟨_, map_mem g x.2.2⟩, ⟨_, map_mem g x.3.2⟩, comap_le x.4⟩\n\nLet A be a graded ring and P ≤ Q be two submonoids, then the homogeneous localization of A at P embeds into the homogeneous localization of A at Q.\n\n文件：RingTheory/GradedAlgebra/HomogeneousLocalization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/GradedAlgebra/HomogeneousLocalization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean",
  "formal": true,
  "lean": {
   "full": "map_mk",
   "kind": "lemma",
   "signature": "(g : 𝒜 →+*ᵍ ℬ) (comap_le : P ≤ Q.comap g) (x) : map g comap_le (mk x) = mk ⟨x.1, ⟨_, map_mem g x.2.2⟩, ⟨_, map_mem g x.3.2⟩, comap_le x.4⟩",
   "file": "Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean"
  }
 },
 {
  "id": "ml-polynomial-irreducible-of-eisenstein-criterion",
  "latex": "Irreducible f",
  "name": "irreducible_of_eisenstein_criterion",
  "en": "Polynomial.irreducible_of_eisenstein_criterion",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If f is a nonconstant polynomial with coefficients in R, and P is a prime ideal in R, then if every coefficient in R except the leading coefficient is in P, and the trailing coeffi",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.irreducible_of_eisenstein_criterion\n类型签名：{f : R[X]} {P : Ideal R} (hP : P.IsPrime) (hfl : f.leadingCoeff ∉ P) (hfP : ∀ n : ℕ, ↑n < degree f → f.coeff n ∈ P) (hfd0 : 0 < degree f) (h0 : f.coeff 0 ∉ P ^ 2) (hu : f.IsPrimitive) : Irreducible f\n\nIf f is a nonconstant polynomial with coefficients in R, and P is a prime ideal in R, then if every coefficient in R except the leading coefficient is in P, and the trailing coefficient is not in P^2 and no nonunits in R divide f, then f is irreducible.\n\n文件：RingTheory/Polynomial/Eisenstein/Criterion\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/Criterion",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/Criterion.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.irreducible_of_eisenstein_criterion",
   "kind": "theorem",
   "signature": "{f : R[X]} {P : Ideal R} (hP : P.IsPrime) (hfl : f.leadingCoeff ∉ P) (hfP : ∀ n : ℕ, ↑n < degree f → f.coeff n ∈ P) (hfd0 : 0 < degree f) (h0 : f.coeff 0 ∉ P ^ 2) (hu : f.IsPrimitive) : Irreducible f",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/Criterion.lean"
  }
 },
 {
  "id": "ml-map-comp-map",
  "latex": ".comp (map Q g hy : S →+* _) = map W (l.comp g) fun _ hx => hl (hy hx)",
  "name": "map_comp_map",
  "en": "map_comp_map",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If CommSemiring homs g : R →+* P, l : P →+* A induce maps of localizations, the composition of the induced maps equals the map of localizations induced by l ∘ g.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_comp_map\n类型签名：{A : Type*} [CommSemiring A] {U : Submonoid A} {W} [CommSemiring W] [Algebra A W] [IsLocalization U W] {l : P →+* A} (hl : T ≤ U.comap l) : (map W l hl).comp (map Q g hy : S →+* _) = map W (l.comp g) fun _ hx => hl (hy hx)\n\nIf CommSemiring homs g : R →+* P, l : P →+* A induce maps of localizations, the composition of the induced maps equals the map of localizations induced by l ∘ g.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "map_comp_map",
   "kind": "theorem",
   "signature": "{A : Type*} [CommSemiring A] {U : Submonoid A} {W} [CommSemiring W] [Algebra A W] [IsLocalization U W] {l : P →+* A} (hl : T ≤ U.comap l) : (map W l hl).comp (map Q g hy : S →+* _) = map W (l.comp g) fun _ hx => hl (hy hx)",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-ideal-height-le-height-add-of-liesover",
  "latex": "P.height ≤ p.height + (P.map (Ideal.Quotient.mk <| p.map (algebraMap R S))).height",
  "name": "Ideal.height_le_height_add_of_liesOver",
  "en": "Ideal.height_le_height_add_of_liesOver",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If P lies over p, the height of P is bounded by the height of p plus the height of the image of P in S ⧸ p S. Equality holds if S satisfies going-down as an R-algebra (see Ideal.he",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.height_le_height_add_of_liesOver\n类型签名：[IsNoetherianRing S] (p : Ideal R) [p.IsPrime] (P : Ideal S) [P.IsPrime] [P.LiesOver p] : P.height ≤ p.height + (P.map (Ideal.Quotient.mk <| p.map (algebraMap R S))).height\n\nIf P lies over p, the height of P is bounded by the height of p plus the height of the image of P in S ⧸ p S. Equality holds if S satisfies going-down as an R-algebra (see Ideal.height_eq_height_add_of_liesOver_of_hasGoingDown).\n\n文件：RingTheory/Ideal/KrullsHeightTheorem\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/KrullsHeightTheorem",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.height_le_height_add_of_liesOver",
   "kind": "lemma",
   "signature": "[IsNoetherianRing S] (p : Ideal R) [p.IsPrime] (P : Ideal S) [P.IsPrime] [P.LiesOver p] : P.height ≤ p.height + (P.map (Ideal.Quotient.mk <| p.map (algebraMap R S))).height",
   "file": "Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean"
  }
 },
 {
  "id": "ml-dvd-coeff-zero-of-aeval-eq-prime-smul-of-minpoly-iseis-cd3e4bd7",
  "latex": "p ∣ Q.coeff 0",
  "name": "dvd_coeff_zero_of_aeval_eq_prime_smul_of_minpoly_isEisensteinAt",
  "en": "dvd_coeff_zero_of_aeval_eq_prime_smul_of_minpoly_isEisensteinAt",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let K be the field of fraction of an integrally closed domain R and let L be an extension of K, generated by an integral power basis B such that the minimal polynomial of B.gen is ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：dvd_coeff_zero_of_aeval_eq_prime_smul_of_minpoly_isEisensteinAt\n类型签名：{B : PowerBasis K L} (hp : Prime p) (hBint : IsIntegral R B.gen) {z : L} {Q : R[X]} (hQ : aeval B.gen Q = p • z) (hzint : IsIntegral R z) (hei : (minpoly R B.gen).IsEisensteinAt 𝓟) : p ∣ Q.coeff 0\n\nLet K be the field of fraction of an integrally closed domain R and let L be an extension of K, generated by an integral power basis B such that the minimal polynomial of B.gen is Eisenstein at p. Given z : L integral over R, if Q : R[X] is such that aeval B.gen Q = p • z, then p ∣ Q.coeff 0.\n\n文件：RingTheory/Polynomial/Eisenstein/IsIntegral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/IsIntegral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/IsIntegral.lean",
  "formal": true,
  "lean": {
   "full": "dvd_coeff_zero_of_aeval_eq_prime_smul_of_minpoly_isEisensteinAt",
   "kind": "theorem",
   "signature": "{B : PowerBasis K L} (hp : Prime p) (hBint : IsIntegral R B.gen) {z : L} {Q : R[X]} (hQ : aeval B.gen Q = p • z) (hzint : IsIntegral R z) (hei : (minpoly R B.gen).IsEisensteinAt 𝓟) : p ∣ Q.coeff 0",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/IsIntegral.lean"
  }
 },
 {
  "id": "ml-polynomial-isdistinguishedat-mul",
  "latex": ".IsDistinguishedAt I",
  "name": "mul",
  "en": "Polynomial.IsDistinguishedAt.mul",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given an ideal I of a commutative ring R, we say that a polynomial f : R[X] is *Distinguished at I* if f is monic and IsWeaklyEisensteinAt I. i.e. f is of the form xⁿ + a₁xⁿ⁻¹ + ⋯ ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.IsDistinguishedAt.mul\n类型签名：{f f' : R[X]} {I : Ideal R} (hf : f.IsDistinguishedAt I) (hf' : f'.IsDistinguishedAt I) : (f * f').IsDistinguishedAt I\n\nGiven an ideal I of a commutative ring R, we say that a polynomial f : R[X] is *Distinguished at I* if f is monic and IsWeaklyEisensteinAt I. i.e. f is of the form xⁿ + a₁xⁿ⁻¹ + ⋯ + aₙ with aᵢ ∈ I for all i.\n\n文件：RingTheory/Polynomial/Eisenstein/Distinguished\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/Distinguished",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/Distinguished.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.IsDistinguishedAt.mul",
   "kind": "lemma",
   "signature": "{f f' : R[X]} {I : Ideal R} (hf : f.IsDistinguishedAt I) (hf' : f'.IsDistinguishedAt I) : (f * f').IsDistinguishedAt I",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/Distinguished.lean"
  }
 },
 {
  "id": "ml-polynomial-not-finite",
  "latex": "¬ Module.Finite R R",
  "name": "not_finite",
  "en": "Polynomial.not_finite",
  "importance": 0.69,
  "family": "foundation",
  "summary": "If R is a nontrivial ring, the polynomials R[X] are not finite as an R-module. When R is a field, this is equivalent to R[X] being an infinite-dimensional vector space over R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.not_finite\n类型签名：[Nontrivial R] : ¬ Module.Finite R R[X]\n\nIf R is a nontrivial ring, the polynomials R[X] are not finite as an R-module. When R is a field, this is equivalent to R[X] being an infinite-dimensional vector space over R.\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.not_finite",
   "kind": "theorem",
   "signature": "[Nontrivial R] : ¬ Module.Finite R R[X]",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-mem-adjoin-of-smul-prime-smul-of-minpoly-iseisensteinat",
  "latex": "z ∈ adjoin R ({B.gen} : Set L)",
  "name": "mem_adjoin_of_smul_prime_smul_of_minpoly_isEisensteinAt",
  "en": "mem_adjoin_of_smul_prime_smul_of_minpoly_isEisensteinAt",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let K be the field of fraction of an integrally closed domain R and let L be an extension of K, generated by an integral power basis B such that the minimal polynomial of B.gen is ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：mem_adjoin_of_smul_prime_smul_of_minpoly_isEisensteinAt\n类型签名：{B : PowerBasis K L} (hp : Prime p) (hBint : IsIntegral R B.gen) {z : L} (hzint : IsIntegral R z) (hz : p • z ∈ adjoin R ({B.gen} : Set L)) (hei : (minpoly R B.gen).IsEisensteinAt 𝓟) : z ∈ adjoin R ({B.gen} : Set L)\n\nLet K be the field of fraction of an integrally closed domain R and let L be an extension of K, generated by an integral power basis B such that the minimal polynomial of B.gen is Eisenstein at p. Given z : L integral over R, if p • z ∈ R[B.gen], then z ∈ R[B.gen].\n\n文件：RingTheory/Polynomial/Eisenstein/IsIntegral\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/IsIntegral",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/IsIntegral.lean",
  "formal": true,
  "lean": {
   "full": "mem_adjoin_of_smul_prime_smul_of_minpoly_isEisensteinAt",
   "kind": "theorem",
   "signature": "{B : PowerBasis K L} (hp : Prime p) (hBint : IsIntegral R B.gen) {z : L} (hzint : IsIntegral R z) (hz : p • z ∈ adjoin R ({B.gen} : Set L)) (hei : (minpoly R B.gen).IsEisensteinAt 𝓟) : z ∈ adjoin R ({B.gen} : Set L)",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/IsIntegral.lean"
  }
 },
 {
  "id": "ml-surjective-quotientmap-of-maximal-of-localization",
  "latex": "Function.Surjective (Ideal.quotientMap I (algebraMap R S) H)",
  "name": "surjective_quotientMap_of_maximal_of_localization",
  "en": "surjective_quotientMap_of_maximal_of_localization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "quotientMap applied to maximal ideals of a localization is surjective. The quotient by a maximal ideal is a field, so inverses to elements already exist, and the localization neces",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：surjective_quotientMap_of_maximal_of_localization\n类型签名：{I : Ideal S} [I.IsPrime] {J : Ideal R} {H : J ≤ I.under R} (hI : (I.under R).IsMaximal) : Function.Surjective (Ideal.quotientMap I (algebraMap R S) H)\n\nquotientMap applied to maximal ideals of a localization is surjective. The quotient by a maximal ideal is a field, so inverses to elements already exist, and the localization necessarily maps the equivalence class of the inverse in the localization\n\n文件：RingTheory/Localization/Ideal\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Ideal",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Ideal.lean",
  "formal": true,
  "lean": {
   "full": "surjective_quotientMap_of_maximal_of_localization",
   "kind": "theorem",
   "signature": "{I : Ideal S} [I.IsPrime] {J : Ideal R} {H : J ≤ I.under R} (hI : (I.under R).IsMaximal) : Function.Surjective (Ideal.quotientMap I (algebraMap R S) H)",
   "file": "Mathlib/RingTheory/Localization/Ideal.lean"
  }
 },
 {
  "id": "ml-natabs-det-basis-change",
  "latex": "∘ bI)).natAbs = Ideal.absNorm I",
  "name": "natAbs_det_basis_change",
  "en": "natAbs_det_basis_change",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let b be a basis for S over ℤ and bI a basis for I over ℤ of the same dimension. Then an alternative way to compute the norm of I is given by taking the determinant of bI over b.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：natAbs_det_basis_change\n类型签名：{ι : Type*} [Fintype ι] [DecidableEq ι] (b : Basis ι ℤ S) (I : Ideal S) (bI : Basis ι ℤ I) : (b.det ((↑) ∘ bI)).natAbs = Ideal.absNorm I\n\nLet b be a basis for S over ℤ and bI a basis for I over ℤ of the same dimension. Then an alternative way to compute the norm of I is given by taking the determinant of bI over b.\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "natAbs_det_basis_change",
   "kind": "theorem",
   "signature": "{ι : Type*} [Fintype ι] [DecidableEq ι] (b : Basis ι ℤ S) (I : Ideal S) (bI : Basis ι ℤ I) : (b.det ((↑) ∘ bI)).natAbs = Ideal.absNorm I",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-tensorproduct-map-injective-of-flat-flat",
  "latex": "Function.Injective (TensorProduct.map f g)",
  "name": "map_injective_of_flat_flat",
  "en": "TensorProduct.map_injective_of_flat_flat",
  "importance": 0.8,
  "family": "map",
  "summary": "Tensor product of injective maps are injective under some flatness conditions. Also see TensorProduct.map_injective_of_flat_flat' and TensorProduct.map_injective_of_flat_flat_of_is",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：TensorProduct.map_injective_of_flat_flat\n类型签名：(f : P →ₗ[R] M) (g : Q →ₗ[R] N) [Module.Flat R M] [Module.Flat R Q] (hf : Function.Injective f) (hg : Function.Injective g) : Function.Injective (TensorProduct.map f g)\n\nTensor product of injective maps are injective under some flatness conditions. Also see TensorProduct.map_injective_of_flat_flat' and TensorProduct.map_injective_of_flat_flat_of_isDomain for different flatness conditions.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "TensorProduct.map_injective_of_flat_flat",
   "kind": "lemma",
   "signature": "(f : P →ₗ[R] M) (g : Q →ₗ[R] N) [Module.Flat R M] [Module.Flat R Q] (hf : Function.Injective f) (hg : Function.Injective g) : Function.Injective (TensorProduct.map f g)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-islocalization-atprime-mem-primesover-of-isprime",
  "latex": "Q ∈ (maximalIdeal Rₚ).primesOver Sₚ",
  "name": "mem_primesOver_of_isPrime",
  "en": "IsLocalization.AtPrime.mem_primesOver_of_isPrime",
  "importance": 0.78,
  "family": "foundation",
  "summary": "The nonzero prime ideals of Sₚ are prime ideals over the maximal ideal of Rₚ. See Localization.AtPrime.primesOverEquivPrimesOver for the bijection between the prime ideals of Sₚ ov",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.AtPrime.mem_primesOver_of_isPrime\n类型签名：{Q : Ideal Sₚ} [Q.IsMaximal] [Algebra.IsIntegral Rₚ Sₚ] : Q ∈ (maximalIdeal Rₚ).primesOver Sₚ\n\nThe nonzero prime ideals of Sₚ are prime ideals over the maximal ideal of Rₚ. See Localization.AtPrime.primesOverEquivPrimesOver for the bijection between the prime ideals of Sₚ over the maximal ideal of Rₚ and the primes ideals of S above p.\n\n文件：RingTheory/Localization/AtPrime/Extension\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/AtPrime/Extension",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/AtPrime/Extension.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.AtPrime.mem_primesOver_of_isPrime",
   "kind": "theorem",
   "signature": "{Q : Ideal Sₚ} [Q.IsMaximal] [Algebra.IsIntegral Rₚ Sₚ] : Q ∈ (maximalIdeal Rₚ).primesOver Sₚ",
   "file": "Mathlib/RingTheory/Localization/AtPrime/Extension.lean"
  }
 },
 {
  "id": "ml-islocalization-smul-mem-finsetintegermultiple-span",
  "latex": "M, m • x ∈ Submodule.span R (IsLocalization.finsetIntegerMultiple (M.map (algebraMap R S)) s : Set S)",
  "name": "IsLocalization.smul_mem_finsetIntegerMultiple_span",
  "en": "IsLocalization.smul_mem_finsetIntegerMultiple_span",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let S be an R-algebra, M a submonoid of R, and S' = M⁻¹S. If the image of some x : S falls in the span of some finite s ⊆ S' over R, then there exists some m : M such that m • x fa",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.smul_mem_finsetIntegerMultiple_span\n类型签名：[Algebra R S] [Algebra R S'] [IsScalarTower R S S'] [IsLocalization (M.map (algebraMap R S)) S'] (x : S) (s : Finset S') (hx : algebraMap S S' x ∈ Submodule.span R (s : Set S')) : ∃ m : M, m • x ∈ Submodule.span R (IsLocalization.finsetIntegerMultiple (M.map (algebraMap R S)) s : Set S)\n\nLet S be an R-algebra, M a submonoid of R, and S' = M⁻¹S. If the image of some x : S falls in the span of some finite s ⊆ S' over R, then there exists some m : M such that m • x falls in the span of IsLocalization.finsetIntegerMultiple _ s over R.\n\n文件：RingTheory/Localization/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.smul_mem_finsetIntegerMultiple_span",
   "kind": "theorem",
   "signature": "[Algebra R S] [Algebra R S'] [IsScalarTower R S S'] [IsLocalization (M.map (algebraMap R S)) S'] (x : S) (s : Finset S') (hx : algebraMap S S' x ∈ Submodule.span R (s : Set S')) : ∃ m : M, m • x ∈ Submodule.span R (IsLocalization.finsetIntegerMultiple (M.map (algebraMap R S)) s : Set S)",
   "file": "Mathlib/RingTheory/Localization/Finiteness.lean"
  }
 },
 {
  "id": "ml-polynomial-normalizedfactors-cyclotomic-card",
  "latex": ").toFinset.card = φ n / orderOf (unitOfCoprime _ (hn.pow_left f))",
  "name": "normalizedFactors_cyclotomic_card",
  "en": "Polynomial.normalizedFactors_cyclotomic_card",
  "importance": 0.79,
  "family": "foundation",
  "summary": "Let K be a finite field of cardinality p ^ f and let P be an irreducible factor of the n-th cyclotomic polynomial over K, where p and n are coprime. This result computes the number",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.normalizedFactors_cyclotomic_card\n类型签名：: (normalizedFactors (cyclotomic n K)).toFinset.card = φ n / orderOf (unitOfCoprime _ (hn.pow_left f))\n\nLet K be a finite field of cardinality p ^ f and let P be an irreducible factor of the n-th cyclotomic polynomial over K, where p and n are coprime. This result computes the number of distinct irreducible factors of cyclotomic n K.\n\n文件：RingTheory/Polynomial/Cyclotomic/Factorization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Factorization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.normalizedFactors_cyclotomic_card",
   "kind": "theorem",
   "signature": ": (normalizedFactors (cyclotomic n K)).toFinset.card = φ n / orderOf (unitOfCoprime _ (hn.pow_left f))",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean"
  }
 },
 {
  "id": "ml-flat-iff-ltensor-exact",
  "latex": "N' →ₗ N''⦄, Function.Exact f g → Function.Exact (f.lTensor M) (g.lTensor M)",
  "name": "iff_lTensor_exact",
  "en": "Flat.iff_lTensor_exact",
  "importance": 0.8,
  "family": "map",
  "summary": "M is flat if and only if M ⊗ - is an exact functor. See Module.Flat.iff_lTensor_exact' to generalize the universe of N, N', N'' to any universe that is higher than R and M.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Flat.iff_lTensor_exact\n类型签名：: Flat R M ↔ ∀ ⦃N N' N'' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [AddCommGroup N''] [Module R N] [Module R N'] [Module R N''] ⦃f : N →ₗ[R] N'⦄ ⦃g : N' →ₗ[R] N''⦄, Function.Exact f g → Function.Exact (f.lTensor M) (g.lTensor M)\n\nM is flat if and only if M ⊗ - is an exact functor. See Module.Flat.iff_lTensor_exact' to generalize the universe of N, N', N'' to any universe that is higher than R and M.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Flat.iff_lTensor_exact",
   "kind": "theorem",
   "signature": ": Flat R M ↔ ∀ ⦃N N' N'' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [AddCommGroup N''] [Module R N] [Module R N'] [Module R N''] ⦃f : N →ₗ[R] N'⦄ ⦃g : N' →ₗ[R] N''⦄, Function.Exact f g → Function.Exact (f.lTensor M) (g.lTensor M)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-flat-iff-rtensor-exact",
  "latex": "N' →ₗ N''⦄, Function.Exact f g → Function.Exact (f.rTensor M) (g.rTensor M)",
  "name": "iff_rTensor_exact",
  "en": "Flat.iff_rTensor_exact",
  "importance": 0.8,
  "family": "map",
  "summary": "M is flat if and only if - ⊗ M is an exact functor. See Module.Flat.iff_rTensor_exact' to generalize the universe of N, N', N'' to any universe that is higher than R and M.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Flat.iff_rTensor_exact\n类型签名：: Flat R M ↔ ∀ ⦃N N' N'' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [AddCommGroup N''] [Module R N] [Module R N'] [Module R N''] ⦃f : N →ₗ[R] N'⦄ ⦃g : N' →ₗ[R] N''⦄, Function.Exact f g → Function.Exact (f.rTensor M) (g.rTensor M)\n\nM is flat if and only if - ⊗ M is an exact functor. See Module.Flat.iff_rTensor_exact' to generalize the universe of N, N', N'' to any universe that is higher than R and M.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Flat.iff_rTensor_exact",
   "kind": "theorem",
   "signature": ": Flat R M ↔ ∀ ⦃N N' N'' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [AddCommGroup N''] [Module R N] [Module R N'] [Module R N''] ⦃f : N →ₗ[R] N'⦄ ⦃g : N' →ₗ[R] N''⦄, Function.Exact f g → Function.Exact (f.rTensor M) (g.rTensor M)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-away-of-surjective-of-isscalartower",
  "latex": "IsLocalization.Away (algebraMap R S r) T",
  "name": "Away.of_surjective_of_isScalarTower",
  "en": "Away.of_surjective_of_isScalarTower",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Suppose J ≤ I are ideals of R, then R / I is the localization away from r : R / J if r - 1 ∈ I and for some n, r ^ n • I ≤ J. For sake of usability, we state this for surjective ri",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Away.of_surjective_of_isScalarTower\n类型签名：{R : Type*} [CommRing R] [Algebra R S] [Algebra R T] [IsScalarTower R S T] (h₁ : Function.Surjective (algebraMap S T)) (h₂ : Function.Surjective (algebraMap R S)) (r : R) (hr : IsUnit (algebraMap R T r)) {n : ℕ} (hn : r ^ n • RingHom.ker (algebraMap R T) ≤ RingHom.ker (algebraMap R S)) : IsLocalization.Away (algebraMap R S r) T\n\nSuppose J ≤ I are ideals of R, then R / I is the localization away from r : R / J if r - 1 ∈ I and for some n, r ^ n • I ≤ J. For sake of usability, we state this for surjective ring maps instead of ideals.\n\n文件：RingTheory/Localization/Away/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Away/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Away/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Away.of_surjective_of_isScalarTower",
   "kind": "lemma",
   "signature": "{R : Type*} [CommRing R] [Algebra R S] [Algebra R T] [IsScalarTower R S T] (h₁ : Function.Surjective (algebraMap S T)) (h₂ : Function.Surjective (algebraMap R S)) (r : R) (hr : IsUnit (algebraMap R T r)) {n : ℕ} (hn : r ^ n • RingHom.ker (algebraMap R T) ≤ RingHom.ker (algebraMap R S)) : IsLocalization.Away (algebraMap R S r) T",
   "file": "Mathlib/RingTheory/Localization/Away/Basic.lean"
  }
 },
 {
  "id": "ml-multiset-prod-x-add-c-eq-sum-esymm",
  "latex": ".prod = ∑ j ∈ Finset.range (Multiset.card s + 1), (C (s.esymm j) * X ^ (Multiset.card s - j))",
  "name": "prod_X_add_C_eq_sum_esymm",
  "en": "Multiset.prod_X_add_C_eq_sum_esymm",
  "importance": 0.8,
  "family": "foundation",
  "summary": "A sum version of **Vieta's formula** for Multiset: the product of the linear terms X + λ where λ runs through a multiset s is equal to a linear combination of the symmetric functio",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Multiset.prod_X_add_C_eq_sum_esymm\n类型签名：(s : Multiset R) : (s.map fun r => X + C r).prod = ∑ j ∈ Finset.range (Multiset.card s + 1), (C (s.esymm j) * X ^ (Multiset.card s - j))\n\nA sum version of **Vieta's formula** for Multiset: the product of the linear terms X + λ where λ runs through a multiset s is equal to a linear combination of the symmetric functions esymm s of the λ's .\n\n文件：RingTheory/Polynomial/Vieta\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Vieta",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Vieta.lean",
  "formal": true,
  "lean": {
   "full": "Multiset.prod_X_add_C_eq_sum_esymm",
   "kind": "theorem",
   "signature": "(s : Multiset R) : (s.map fun r => X + C r).prod = ∑ j ∈ Finset.range (Multiset.card s + 1), (C (s.esymm j) * X ^ (Multiset.card s - j))",
   "file": "Mathlib/RingTheory/Polynomial/Vieta.lean"
  }
 },
 {
  "id": "ml-exists-primespectrum-prod-le-and-ne-bot-of-domain",
  "latex": "Multiset (PrimeSpectrum A), Multiset.prod (Z.map asIdeal) ≤ I ∧ Multiset.prod (Z.map asIdeal) ≠ ⊥",
  "name": "exists_primeSpectrum_prod_le_and_ne_bot_of_domain",
  "en": "exists_primeSpectrum_prod_le_and_ne_bot_of_domain",
  "importance": 0.8,
  "family": "foundation",
  "summary": "In a Noetherian integral domain which is not a field, every non-zero ideal contains a non-zero product of prime ideals; in a field, the whole ring is a non-zero ideal containing on",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：exists_primeSpectrum_prod_le_and_ne_bot_of_domain\n类型签名：(h_fA : ¬IsField A) {I : Ideal A} (h_nzI : I ≠ ⊥) : ∃ Z : Multiset (PrimeSpectrum A), Multiset.prod (Z.map asIdeal) ≤ I ∧ Multiset.prod (Z.map asIdeal) ≠ ⊥\n\nIn a Noetherian integral domain which is not a field, every non-zero ideal contains a non-zero product of prime ideals; in a field, the whole ring is a non-zero ideal containing only 0 as product or prime ideals ([samuel1967, § 3.3, Lemma 3])\n\n文件：RingTheory/Spectrum/Prime/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/Basic.lean",
  "formal": true,
  "lean": {
   "full": "exists_primeSpectrum_prod_le_and_ne_bot_of_domain",
   "kind": "theorem",
   "signature": "(h_fA : ¬IsField A) {I : Ideal A} (h_nzI : I ≠ ⊥) : ∃ Z : Multiset (PrimeSpectrum A), Multiset.prod (Z.map asIdeal) ≤ I ∧ Multiset.prod (Z.map asIdeal) ≠ ⊥",
   "file": "Mathlib/RingTheory/Spectrum/Prime/Basic.lean"
  }
 },
 {
  "id": "ml-ideal-fg-of-localizationspan",
  "latex": "{I : Ideal R} (t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ (g : t), (I.map (algebraMap R (Localization.Away g.val))).FG) : I.FG",
  "name": "fg_of_localizationSpan",
  "en": "Ideal.fg_of_localizationSpan",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If I is an ideal such that there exists a set { r } of R that generates the unit ideal and such that the image of I in Rᵣ is finitely generated for each r, then I is finitely gener",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.fg_of_localizationSpan\n类型签名：{I : Ideal R} (t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ (g : t), (I.map (algebraMap R (Localization.Away g.val))).FG) : I.FG\n\nIf I is an ideal such that there exists a set { r } of R that generates the unit ideal and such that the image of I in Rᵣ is finitely generated for each r, then I is finitely generated.\n\n文件：RingTheory/Localization/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.fg_of_localizationSpan",
   "kind": "lemma",
   "signature": "{I : Ideal R} (t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ (g : t), (I.map (algebraMap R (Localization.Away g.val))).FG) : I.FG",
   "file": "Mathlib/RingTheory/Localization/Finiteness.lean"
  }
 },
 {
  "id": "ml-polynomial-cyclotomic-pos",
  "latex": "0 < eval x (cyclotomic n R)",
  "name": "cyclotomic_pos'",
  "en": "Polynomial.cyclotomic_pos'",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Cyclotomic polynomials are always positive on inputs larger than one. Similar to cyclotomic_pos but with the condition on the input rather than index of the cyclotomic polynomial.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.cyclotomic_pos'\n类型签名：(n : ℕ) {R} [CommRing R] [LinearOrder R] [IsStrictOrderedRing R] {x : R} (hx : 1 < x) : 0 < eval x (cyclotomic n R)\n\nCyclotomic polynomials are always positive on inputs larger than one. Similar to cyclotomic_pos but with the condition on the input rather than index of the cyclotomic polynomial.\n\n文件：RingTheory/Polynomial/Cyclotomic/Eval\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Eval",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Eval.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.cyclotomic_pos'",
   "kind": "theorem",
   "signature": "(n : ℕ) {R} [CommRing R] [LinearOrder R] [IsStrictOrderedRing R] {x : R} (hx : 1 < x) : 0 < eval x (cyclotomic n R)",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Eval.lean"
  }
 },
 {
  "id": "ml-polynomial-factorial-mul-shiftedlegendre-eq",
  "latex": "* (shiftedLegendre n) = derivative^ (X ^ n * (1 - (X : ℤ )) ^ n)",
  "name": "factorial_mul_shiftedLegendre_eq",
  "en": "Polynomial.factorial_mul_shiftedLegendre_eq",
  "importance": 0.77,
  "family": "foundation",
  "summary": "The shifted Legendre polynomial multiplied by a factorial equals the higher-order derivative of the combinatorial function X ^ n * (1 - X) ^ n. This is the analogue of Rodrigues' f",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.factorial_mul_shiftedLegendre_eq\n类型签名：(n : ℕ) : (n ! : ℤ[X]) * (shiftedLegendre n) = derivative^[n] (X ^ n * (1 - (X : ℤ[X])) ^ n)\n\nThe shifted Legendre polynomial multiplied by a factorial equals the higher-order derivative of the combinatorial function X ^ n * (1 - X) ^ n. This is the analogue of Rodrigues' formula for the shifted Legendre polynomials.\n\n文件：RingTheory/Polynomial/ShiftedLegendre\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/ShiftedLegendre",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/ShiftedLegendre.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.factorial_mul_shiftedLegendre_eq",
   "kind": "theorem",
   "signature": "(n : ℕ) : (n ! : ℤ[X]) * (shiftedLegendre n) = derivative^[n] (X ^ n * (1 - (X : ℤ[X])) ^ n)",
   "file": "Mathlib/RingTheory/Polynomial/ShiftedLegendre.lean"
  }
 },
 {
  "id": "ml-ideal-finiteheight-iff-lt",
  "latex": "Ideal.FiniteHeight I ↔ I = ⊤ ∨ I.height < ⊤",
  "name": "Ideal.finiteHeight_iff_lt",
  "en": "Ideal.finiteHeight_iff_lt",
  "importance": 0.72,
  "family": "foundation",
  "summary": "An ideal has finite height if it is either the unit ideal or its height is finite. We include the unit ideal in order to have the instance IsNoetherianRing R → FiniteHeight I.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.finiteHeight_iff_lt\n类型签名：{I : Ideal R} : Ideal.FiniteHeight I ↔ I = ⊤ ∨ I.height < ⊤\n\nAn ideal has finite height if it is either the unit ideal or its height is finite. We include the unit ideal in order to have the instance IsNoetherianRing R → FiniteHeight I.\n\n文件：RingTheory/Ideal/Height\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Height",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Height.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.finiteHeight_iff_lt",
   "kind": "lemma",
   "signature": "{I : Ideal R} : Ideal.FiniteHeight I ↔ I = ⊤ ∨ I.height < ⊤",
   "file": "Mathlib/RingTheory/Ideal/Height.lean"
  }
 },
 {
  "id": "ml-ideal-isoka-forall-of-forall-prime",
  "latex": "(hmax : ∀ I, ¬P I → ∃ I, Maximal (¬P ·) I) (hprime : ∀ I, I.IsPrime → P I) (I : Ideal R) : P I",
  "name": "forall_of_forall_prime",
  "en": "Ideal.IsOka.forall_of_forall_prime",
  "importance": 0.78,
  "family": "foundation",
  "summary": "If a ring R verify: 1. All prime ideals of R satisfy an Oka predicate P. 2. One ideal not satisfying P implies that there is an ideal maximal for not satisfying P. Then all the ide",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.IsOka.forall_of_forall_prime\n类型签名：(hmax : ∀ I, ¬P I → ∃ I, Maximal (¬P ·) I) (hprime : ∀ I, I.IsPrime → P I) (I : Ideal R) : P I\n\nIf a ring R verify: 1. All prime ideals of R satisfy an Oka predicate P. 2. One ideal not satisfying P implies that there is an ideal maximal for not satisfying P. Then all the ideals of R satisfy P.\n\n文件：RingTheory/Ideal/Oka\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Oka",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Oka.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.IsOka.forall_of_forall_prime",
   "kind": "theorem",
   "signature": "(hmax : ∀ I, ¬P I → ∃ I, Maximal (¬P ·) I) (hprime : ∀ I, I.IsPrime → P I) (I : Ideal R) : P I",
   "file": "Mathlib/RingTheory/Ideal/Oka.lean"
  }
 },
 {
  "id": "ml-range-le-ker-of-exact-rtensor",
  "latex": "LinearMap.range l12 ≤ LinearMap.ker l23",
  "name": "range_le_ker_of_exact_rTensor",
  "en": "range_le_ker_of_exact_rTensor",
  "importance": 0.8,
  "family": "map",
  "summary": "If M is faithfully flat, then exactness of N₁ ⊗ M -> N₂ ⊗ M -> N₃ ⊗ M implies that the composition N₁ -> N₂ -> N₃ is 0. Implementation detail, please use rTensor_reflects_exact ins",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：range_le_ker_of_exact_rTensor\n类型签名：[fl : FaithfullyFlat R M] (ex : Function.Exact (l12.rTensor M) (l23.rTensor M)) : LinearMap.range l12 ≤ LinearMap.ker l23\n\nIf M is faithfully flat, then exactness of N₁ ⊗ M -> N₂ ⊗ M -> N₃ ⊗ M implies that the composition N₁ -> N₂ -> N₃ is 0. Implementation detail, please use rTensor_reflects_exact instead.\n\n文件：RingTheory/Flat/FaithfullyFlat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/FaithfullyFlat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "range_le_ker_of_exact_rTensor",
   "kind": "lemma",
   "signature": "[fl : FaithfullyFlat R M] (ex : Function.Exact (l12.rTensor M) (l23.rTensor M)) : LinearMap.range l12 ≤ LinearMap.ker l23",
   "file": "Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean"
  }
 },
 {
  "id": "ml-flat-iff-rtensor-preserves-injective-linearmap",
  "latex": "Type (max u v)⦄ (f : N →ₗ N'), Function.Injective f → Function.Injective (f.rTensor M)",
  "name": "iff_rTensor_preserves_injective_linearMap",
  "en": "Flat.iff_rTensor_preserves_injective_linearMap",
  "importance": 0.8,
  "family": "map",
  "summary": "M is flat if and only if f ⊗ 𝟙 M is injective whenever f is an injective linear map. See Module.Flat.iff_rTensor_preserves_injective_linearMap' to generalize the universe of N, N'",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Flat.iff_rTensor_preserves_injective_linearMap\n类型签名：: Flat R M ↔ ∀ ⦃N N' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [Module R N] [Module R N'] (f : N →ₗ[R] N'), Function.Injective f → Function.Injective (f.rTensor M)\n\nM is flat if and only if f ⊗ 𝟙 M is injective whenever f is an injective linear map. See Module.Flat.iff_rTensor_preserves_injective_linearMap' to generalize the universe of N, N', N'' to any universe that is higher than R and M.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Flat.iff_rTensor_preserves_injective_linearMap",
   "kind": "lemma",
   "signature": ": Flat R M ↔ ∀ ⦃N N' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [Module R N] [Module R N'] (f : N →ₗ[R] N'), Function.Injective f → Function.Injective (f.rTensor M)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-flat-iff-ltensor-preserves-injective-linearmap",
  "latex": "Type (max u v)⦄ (f : N →ₗ N'), Function.Injective f → Function.Injective (f.lTensor M)",
  "name": "iff_lTensor_preserves_injective_linearMap",
  "en": "Flat.iff_lTensor_preserves_injective_linearMap",
  "importance": 0.8,
  "family": "map",
  "summary": "M is flat if and only if 𝟙 M ⊗ f is injective whenever f is an injective linear map. See Module.Flat.iff_lTensor_preserves_injective_linearMap' to generalize the universe of N, N'",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Flat.iff_lTensor_preserves_injective_linearMap\n类型签名：: Flat R M ↔ ∀ ⦃N N' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [Module R N] [Module R N'] (f : N →ₗ[R] N'), Function.Injective f → Function.Injective (f.lTensor M)\n\nM is flat if and only if 𝟙 M ⊗ f is injective whenever f is an injective linear map. See Module.Flat.iff_lTensor_preserves_injective_linearMap' to generalize the universe of N, N', N'' to any universe that is higher than R and M.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Flat.iff_lTensor_preserves_injective_linearMap",
   "kind": "lemma",
   "signature": ": Flat R M ↔ ∀ ⦃N N' : Type (max u v)⦄ [AddCommGroup N] [AddCommGroup N'] [Module R N] [Module R N'] (f : N →ₗ[R] N'), Function.Injective f → Function.Injective (f.lTensor M)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-polynomial-coeff-mul-invonesubpow-eq-hilbertpoly-eval",
  "latex": ".coeff n = (hilbertPoly p d).eval (n : F)",
  "name": "coeff_mul_invOneSubPow_eq_hilbertPoly_eval",
  "en": "Polynomial.coeff_mul_invOneSubPow_eq_hilbertPoly_eval",
  "importance": 0.8,
  "family": "foundation",
  "summary": "The key property of Hilbert polynomials. If F is a field with characteristic 0, p : F[X] and d : ℕ, then for any large enough n : ℕ, (Polynomial.hilbertPoly p d).eval (n : F) equal",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.coeff_mul_invOneSubPow_eq_hilbertPoly_eval\n类型签名：{p : F[X]} (d : ℕ) {n : ℕ} (hn : p.natDegree < n) : (p * invOneSubPow F d : F⟦X⟧).coeff n = (hilbertPoly p d).eval (n : F)\n\nThe key property of Hilbert polynomials. If F is a field with characteristic 0, p : F[X] and d : ℕ, then for any large enough n : ℕ, (Polynomial.hilbertPoly p d).eval (n : F) equals the coefficient of Xⁿ in the power series expansion of p/(1 - X)ᵈ.\n\n文件：RingTheory/Polynomial/HilbertPoly\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/HilbertPoly",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/HilbertPoly.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.coeff_mul_invOneSubPow_eq_hilbertPoly_eval",
   "kind": "theorem",
   "signature": "{p : F[X]} (d : ℕ) {n : ℕ} (hn : p.natDegree < n) : (p * invOneSubPow F d : F⟦X⟧).coeff n = (hilbertPoly p d).eval (n : F)",
   "file": "Mathlib/RingTheory/Polynomial/HilbertPoly.lean"
  }
 },
 {
  "id": "ml-module-finite-of-localizationspan-finite",
  "latex": "Module.Finite R M",
  "name": "of_localizationSpan_finite",
  "en": "Module.Finite.of_localizationSpan_finite",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If there exists a finite set { r } of R that generates the unit ideal and such that Mᵣ is Rᵣ-finite for each r, then M is a finite R-module. See of_localizationSpan for a version w",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Finite.of_localizationSpan_finite\n类型签名：(t : Finset R) (ht : Ideal.span (t : Set R) = ⊤) (H : ∀ (g : t), Module.Finite (Localization.Away g.val) (LocalizedModule.Away g.val M)) : Module.Finite R M\n\nIf there exists a finite set { r } of R that generates the unit ideal and such that Mᵣ is Rᵣ-finite for each r, then M is a finite R-module. See of_localizationSpan for a version without the finite set assumption.\n\n文件：RingTheory/Localization/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "Module.Finite.of_localizationSpan_finite",
   "kind": "theorem",
   "signature": "(t : Finset R) (ht : Ideal.span (t : Set R) = ⊤) (H : ∀ (g : t), Module.Finite (Localization.Away g.val) (LocalizedModule.Away g.val M)) : Module.Finite R M",
   "file": "Mathlib/RingTheory/Localization/Finiteness.lean"
  }
 },
 {
  "id": "ml-module-flat-iff-rtensor-injective",
  "latex": "Ideal R, Function.Injective (rTensor M I.subtype)",
  "name": "iff_rTensor_injective'",
  "en": "Module.Flat.iff_rTensor_injective'",
  "importance": 0.73,
  "family": "map",
  "summary": "An R-module M is flat iff for all ideals I of R, the tensor product of the inclusion I → R and the identity M → M is injective. See iff_rTensor_injective to restrict to finitely ge",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Flat.iff_rTensor_injective'\n类型签名：: Flat R M ↔ ∀ I : Ideal R, Function.Injective (rTensor M I.subtype)\n\nAn R-module M is flat iff for all ideals I of R, the tensor product of the inclusion I → R and the identity M → M is injective. See iff_rTensor_injective to restrict to finitely generated ideals I.\n\n文件：RingTheory/Flat/Tensor\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Tensor",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Tensor.lean",
  "formal": true,
  "lean": {
   "full": "Module.Flat.iff_rTensor_injective'",
   "kind": "theorem",
   "signature": ": Flat R M ↔ ∀ I : Ideal R, Function.Injective (rTensor M I.subtype)",
   "file": "Mathlib/RingTheory/Flat/Tensor.lean"
  }
 },
 {
  "id": "ml-polynomial-islocalization",
  "latex": "IsLocalization (S.map C) A",
  "name": "isLocalization",
  "en": "Polynomial.isLocalization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If A is the localization of R at a submonoid S, then A[X] is the localization of R[X] at S.map Polynomial.C. See also MvPolynomial.isLocalization for the multivariate case.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.isLocalization\n类型签名：{R} [CommSemiring R] (S : Submonoid R) (A) [CommSemiring A] [Algebra R A] [IsLocalization S A] : IsLocalization (S.map C) A[X]\n\nIf A is the localization of R at a submonoid S, then A[X] is the localization of R[X] at S.map Polynomial.C. See also MvPolynomial.isLocalization for the multivariate case.\n\n文件：RingTheory/Localization/Algebra\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Algebra",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Algebra.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.isLocalization",
   "kind": "lemma",
   "signature": "{R} [CommSemiring R] (S : Submonoid R) (A) [CommSemiring A] [Algebra R A] [IsLocalization S A] : IsLocalization (S.map C) A[X]",
   "file": "Mathlib/RingTheory/Localization/Algebra.lean"
  }
 },
 {
  "id": "ml-multiset-prod-x-add-c-coeff",
  "latex": ".prod.coeff k = s.esymm (Multiset.card s - k)",
  "name": "prod_X_add_C_coeff",
  "en": "Multiset.prod_X_add_C_coeff",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Vieta's formula for the coefficients of the product of linear terms X + λ where λ runs through a multiset s : the kth coefficient is the symmetric function esymm (card s - k) s.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Multiset.prod_X_add_C_coeff\n类型签名：(s : Multiset R) {k : ℕ} (h : k ≤ Multiset.card s) : (s.map fun r => X + C r).prod.coeff k = s.esymm (Multiset.card s - k)\n\nVieta's formula for the coefficients of the product of linear terms X + λ where λ runs through a multiset s : the kth coefficient is the symmetric function esymm (card s - k) s.\n\n文件：RingTheory/Polynomial/Vieta\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Vieta",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Vieta.lean",
  "formal": true,
  "lean": {
   "full": "Multiset.prod_X_add_C_coeff",
   "kind": "theorem",
   "signature": "(s : Multiset R) {k : ℕ} (h : k ≤ Multiset.card s) : (s.map fun r => X + C r).prod.coeff k = s.esymm (Multiset.card s - k)",
   "file": "Mathlib/RingTheory/Polynomial/Vieta.lean"
  }
 },
 {
  "id": "ml-ideal-ideal-prod-prime",
  "latex": "Ideal S, p.IsPrime ∧ I = Ideal.prod ⊤ p",
  "name": "ideal_prod_prime",
  "en": "Ideal.ideal_prod_prime",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Classification of prime ideals in product rings: the prime ideals of R × S are precisely the ideals of the form p × S or R × p, where p is a prime ideal of R or S.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.ideal_prod_prime\n类型签名：(I : Ideal (R × S)) : I.IsPrime ↔ (∃ p : Ideal R, p.IsPrime ∧ I = Ideal.prod p ⊤) ∨ ∃ p : Ideal S, p.IsPrime ∧ I = Ideal.prod ⊤ p\n\nClassification of prime ideals in product rings: the prime ideals of R × S are precisely the ideals of the form p × S or R × p, where p is a prime ideal of R or S.\n\n文件：RingTheory/Ideal/Prod\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Prod",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Prod.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.ideal_prod_prime",
   "kind": "theorem",
   "signature": "(I : Ideal (R × S)) : I.IsPrime ↔ (∃ p : Ideal R, p.IsPrime ∧ I = Ideal.prod p ⊤) ∨ ∃ p : Ideal S, p.IsPrime ∧ I = Ideal.prod ⊤ p",
   "file": "Mathlib/RingTheory/Ideal/Prod.lean"
  }
 },
 {
  "id": "ml-ideal-spannorm-mul-of-bot-or-top",
  "latex": "spanNorm R (I * J) = spanNorm R I * spanNorm R J",
  "name": "spanNorm_mul_of_bot_or_top",
  "en": "Ideal.spanNorm_mul_of_bot_or_top",
  "importance": 0.8,
  "family": "foundation",
  "summary": "This condition eq_bot_or_top is equivalent to being a field. However, Ideal.spanNorm_mul_of_field is harder to apply since we'd need to upgrade a CommRing R instance to a Field R i",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.spanNorm_mul_of_bot_or_top\n类型签名：(eq_bot_or_top : ∀ I : Ideal R, I = ⊥ ∨ I = ⊤) (I J : Ideal S) : spanNorm R (I * J) = spanNorm R I * spanNorm R J\n\nThis condition eq_bot_or_top is equivalent to being a field. However, Ideal.spanNorm_mul_of_field is harder to apply since we'd need to upgrade a CommRing R instance to a Field R instance.\n\n文件：RingTheory/Ideal/Norm/RelNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/RelNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/RelNorm.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.spanNorm_mul_of_bot_or_top",
   "kind": "theorem",
   "signature": "(eq_bot_or_top : ∀ I : Ideal R, I = ⊥ ∨ I = ⊤) (I J : Ideal S) : spanNorm R (I * J) = spanNorm R I * spanNorm R J",
   "file": "Mathlib/RingTheory/Ideal/Norm/RelNorm.lean"
  }
 },
 {
  "id": "ml-ideal-ismaximal-def",
  "latex": "I.IsMaximal ↔ IsCoatom I",
  "name": "isMaximal_def",
  "en": "Ideal.isMaximal_def",
  "importance": 0.69,
  "family": "foundation",
  "summary": "The maximal ideal is a coatom in the ordering on ideals; that is, it is not the entire ring, and there are no other proper ideals strictly containing it.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.isMaximal_def\n类型签名：{I : Ideal α} : I.IsMaximal ↔ IsCoatom I\n\nThe maximal ideal is a coatom in the ordering on ideals; that is, it is not the entire ring, and there are no other proper ideals strictly containing it.\n\n文件：RingTheory/Ideal/Maximal\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Maximal",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Maximal.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.isMaximal_def",
   "kind": "theorem",
   "signature": "{I : Ideal α} : I.IsMaximal ↔ IsCoatom I",
   "file": "Mathlib/RingTheory/Ideal/Maximal.lean"
  }
 },
 {
  "id": "ml-idealfilter-istorsionquot-inter-left-iff",
  "latex": "IsTorsionQuot F (L ⊓ K) K ↔ IsTorsionQuot F L K",
  "name": "isTorsionQuot_inter_left_iff",
  "en": "IdealFilter.isTorsionQuot_inter_left_iff",
  "importance": 0.76,
  "family": "foundation",
  "summary": "Intersecting the left ideal with K does not change IsTorsionQuot on the right. In particular, IsTorsionQuot F L K need not require L ≤ K for it is equivalent to asserting the quoti",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IdealFilter.isTorsionQuot_inter_left_iff\n类型签名：{F : IdealFilter A} {L K : Ideal A} : IsTorsionQuot F (L ⊓ K) K ↔ IsTorsionQuot F L K\n\nIntersecting the left ideal with K does not change IsTorsionQuot on the right. In particular, IsTorsionQuot F L K need not require L ≤ K for it is equivalent to asserting the quotient K / (L ⊓ K) is F-torsion.\n\n文件：RingTheory/IdealFilter/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/IdealFilter/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/IdealFilter/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IdealFilter.isTorsionQuot_inter_left_iff",
   "kind": "lemma",
   "signature": "{F : IdealFilter A} {L K : Ideal A} : IsTorsionQuot F (L ⊓ K) K ↔ IsTorsionQuot F L K",
   "file": "Mathlib/RingTheory/IdealFilter/Basic.lean"
  }
 },
 {
  "id": "ml-num-dvd-of-is-root",
  "latex": "num A r ∣ p.coeff 0",
  "name": "num_dvd_of_is_root",
  "en": "num_dvd_of_is_root",
  "importance": 0.72,
  "family": "foundation",
  "summary": "**Rational root theorem** part 1: if r : f.codomain is a root of a polynomial over the ufd A, then the numerator of r divides the constant coefficient",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：num_dvd_of_is_root\n类型签名：{p : A[X]} {r : K} (hr : aeval r p = 0) : num A r ∣ p.coeff 0\n\n**Rational root theorem** part 1: if r : f.codomain is a root of a polynomial over the ufd A, then the numerator of r divides the constant coefficient\n\n文件：RingTheory/Polynomial/RationalRoot\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/RationalRoot",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/RationalRoot.lean",
  "formal": true,
  "lean": {
   "full": "num_dvd_of_is_root",
   "kind": "theorem",
   "signature": "{p : A[X]} {r : K} (hr : aeval r p = 0) : num A r ∣ p.coeff 0",
   "file": "Mathlib/RingTheory/Polynomial/RationalRoot.lean"
  }
 },
 {
  "id": "ml-primespectrum-isembedding-comap-of-surjective",
  "latex": "IsEmbedding (comap f)",
  "name": "isEmbedding_comap_of_surjective",
  "en": "PrimeSpectrum.isEmbedding_comap_of_surjective",
  "importance": 0.69,
  "family": "foundation",
  "summary": "The embedding has closed range if the domain (and therefore the codomain) is a ring, see PrimeSpectrum.isClosedEmbedding_comap_of_surjective. On the other hand, comap (Nat.castRing",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：PrimeSpectrum.isEmbedding_comap_of_surjective\n类型签名：(hf : Surjective f) : IsEmbedding (comap f)\n\nThe embedding has closed range if the domain (and therefore the codomain) is a ring, see PrimeSpectrum.isClosedEmbedding_comap_of_surjective. On the other hand, comap (Nat.castRingHom (ZMod 2)) does not have closed range.\n\n文件：RingTheory/Spectrum/Prime/Topology\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/Topology",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/Topology.lean",
  "formal": true,
  "lean": {
   "full": "PrimeSpectrum.isEmbedding_comap_of_surjective",
   "kind": "theorem",
   "signature": "(hf : Surjective f) : IsEmbedding (comap f)",
   "file": "Mathlib/RingTheory/Spectrum/Prime/Topology.lean"
  }
 },
 {
  "id": "ml-algebraicgeometry-polynomial-comap-c-mem-imageofdf",
  "latex": "PrimeSpectrum.comap (Polynomial.C : R →+* R ) I ∈ imageOfDf f",
  "name": "comap_C_mem_imageOfDf",
  "en": "AlgebraicGeometry.Polynomial.comap_C_mem_imageOfDf",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If a point of Spec R[x] is not contained in the vanishing set of f, then its image in Spec R is contained in the open set where at least one of the coefficients of f is non-zero. T",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：AlgebraicGeometry.Polynomial.comap_C_mem_imageOfDf\n类型签名：{I : PrimeSpectrum R[X]} (H : I ∈ (zeroLocus {f} : Set (PrimeSpectrum R[X]))ᶜ) : PrimeSpectrum.comap (Polynomial.C : R →+* R[X]) I ∈ imageOfDf f\n\nIf a point of Spec R[x] is not contained in the vanishing set of f, then its image in Spec R is contained in the open set where at least one of the coefficients of f is non-zero. This lemma is a reformulation of exists_C_coeff_notMem.\n\n文件：RingTheory/Spectrum/Prime/IsOpenComapC\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/IsOpenComapC",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/IsOpenComapC.lean",
  "formal": true,
  "lean": {
   "full": "AlgebraicGeometry.Polynomial.comap_C_mem_imageOfDf",
   "kind": "theorem",
   "signature": "{I : PrimeSpectrum R[X]} (H : I ∈ (zeroLocus {f} : Set (PrimeSpectrum R[X]))ᶜ) : PrimeSpectrum.comap (Polynomial.C : R →+* R[X]) I ∈ imageOfDf f",
   "file": "Mathlib/RingTheory/Spectrum/Prime/IsOpenComapC.lean"
  }
 },
 {
  "id": "ml-ideal-spannorm-spannorm-of-bot-or-top",
  "latex": "spanNorm R (spanNorm T I) = spanNorm R I",
  "name": "spanNorm_spanNorm_of_bot_or_top",
  "en": "Ideal.spanNorm_spanNorm_of_bot_or_top",
  "importance": 0.79,
  "family": "foundation",
  "summary": "This condition eq_bot_or_top is equivalent to being a field. However, Ideal.spanNorm_spanNorm_of_field would be harder to apply since we'd need to upgrade a CommRing R instance to ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.spanNorm_spanNorm_of_bot_or_top\n类型签名：(eq_bot_or_top : ∀ I : Ideal R, I = ⊥ ∨ I = ⊤) (I : Ideal S) : spanNorm R (spanNorm T I) = spanNorm R I\n\nThis condition eq_bot_or_top is equivalent to being a field. However, Ideal.spanNorm_spanNorm_of_field would be harder to apply since we'd need to upgrade a CommRing R instance to a Field R instance.\n\n文件：RingTheory/Ideal/Norm/RelNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/RelNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/RelNorm.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.spanNorm_spanNorm_of_bot_or_top",
   "kind": "theorem",
   "signature": "(eq_bot_or_top : ∀ I : Ideal R, I = ⊥ ∨ I = ⊤) (I : Ideal S) : spanNorm R (spanNorm T I) = spanNorm R I",
   "file": "Mathlib/RingTheory/Ideal/Norm/RelNorm.lean"
  }
 },
 {
  "id": "ml-ring-isfield-iff-issimpleorder-ideal",
  "latex": "IsField R ↔ IsSimpleOrder (Ideal R)",
  "name": "isField_iff_isSimpleOrder_ideal",
  "en": "Ring.isField_iff_isSimpleOrder_ideal",
  "importance": 0.68,
  "family": "foundation",
  "summary": "Also see Ideal.isSimpleOrder for the forward direction as an instance when R is a division (semi)ring. This result actually holds for all division semirings, but we lack the predic",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ring.isField_iff_isSimpleOrder_ideal\n类型签名：: IsField R ↔ IsSimpleOrder (Ideal R)\n\nAlso see Ideal.isSimpleOrder for the forward direction as an instance when R is a division (semi)ring. This result actually holds for all division semirings, but we lack the predicate to state it.\n\n文件：RingTheory/Ideal/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Ring.isField_iff_isSimpleOrder_ideal",
   "kind": "theorem",
   "signature": ": IsField R ↔ IsSimpleOrder (Ideal R)",
   "file": "Mathlib/RingTheory/Ideal/Basic.lean"
  }
 },
 {
  "id": "ml-isprime-prod-mem-iff",
  "latex": "∏ i ∈ s, x i ∈ p ↔ ∃ i ∈ s, x i ∈ p",
  "name": "IsPrime.prod_mem_iff",
  "en": "IsPrime.prod_mem_iff",
  "importance": 0.78,
  "family": "foundation",
  "summary": "The product of a finite number of elements in the commutative semiring R lies in the prime ideal p if and only if at least one of those elements is in p.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsPrime.prod_mem_iff\n类型签名：{s : Finset ι} {x : ι → R} {p : Ideal R} [hp : p.IsPrime] : ∏ i ∈ s, x i ∈ p ↔ ∃ i ∈ s, x i ∈ p\n\nThe product of a finite number of elements in the commutative semiring R lies in the prime ideal p if and only if at least one of those elements is in p.\n\n文件：RingTheory/Ideal/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Operations.lean",
  "formal": true,
  "lean": {
   "full": "IsPrime.prod_mem_iff",
   "kind": "theorem",
   "signature": "{s : Finset ι} {x : ι → R} {p : Ideal R} [hp : p.IsPrime] : ∏ i ∈ s, x i ∈ p ↔ ∃ i ∈ s, x i ∈ p",
   "file": "Mathlib/RingTheory/Ideal/Operations.lean"
  }
 },
 {
  "id": "ml-islocalization-surj",
  "latex": "R × M, z * algebraMap R S x.2 = algebraMap R S x.1",
  "name": "surj",
  "en": "IsLocalization.surj",
  "importance": 0.73,
  "family": "foundation",
  "summary": "Every element in the localization can be expressed as a quotient of an element in the range of algebraMap by the image of an element of the submonoid.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.surj\n类型签名：: ∀ z : S, ∃ x : R × M, z * algebraMap R S x.2 = algebraMap R S x.1\n\nEvery element in the localization can be expressed as a quotient of an element in the range of algebraMap by the image of an element of the submonoid.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.surj",
   "kind": "theorem",
   "signature": ": ∀ z : S, ∃ x : R × M, z * algebraMap R S x.2 = algebraMap R S x.1",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-den-dvd-of-is-root",
  "latex": "∣ p.leadingCoeff",
  "name": "den_dvd_of_is_root",
  "en": "den_dvd_of_is_root",
  "importance": 0.74,
  "family": "foundation",
  "summary": "Rational root theorem part 2: if r : f.codomain is a root of a polynomial over the ufd A, then the denominator of r divides the leading coefficient",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：den_dvd_of_is_root\n类型签名：{p : A[X]} {r : K} (hr : aeval r p = 0) : (den A r : A) ∣ p.leadingCoeff\n\nRational root theorem part 2: if r : f.codomain is a root of a polynomial over the ufd A, then the denominator of r divides the leading coefficient\n\n文件：RingTheory/Polynomial/RationalRoot\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/RationalRoot",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/RationalRoot.lean",
  "formal": true,
  "lean": {
   "full": "den_dvd_of_is_root",
   "kind": "theorem",
   "signature": "{p : A[X]} {r : K} (hr : aeval r p = 0) : (den A r : A) ∣ p.leadingCoeff",
   "file": "Mathlib/RingTheory/Polynomial/RationalRoot.lean"
  }
 },
 {
  "id": "ml-ringhom-fieldrange-eq-of-comp-eq-of-range-eq",
  "latex": "f.fieldRange = Subfield.closure s",
  "name": "ringHom_fieldRange_eq_of_comp_eq_of_range_eq",
  "en": "ringHom_fieldRange_eq_of_comp_eq_of_range_eq",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If A is a commutative ring with fraction field K, L is a field, g : A →+* L lifts to f : K →+* L, s is a set such that the image of g is the subring generated by s, then the image ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ringHom_fieldRange_eq_of_comp_eq_of_range_eq\n类型签名：(h : RingHom.comp f (algebraMap A K) = g) {s : Set L} (hs : g.range = Subring.closure s) : f.fieldRange = Subfield.closure s\n\nIf A is a commutative ring with fraction field K, L is a field, g : A →+* L lifts to f : K →+* L, s is a set such that the image of g is the subring generated by s, then the image of f is the subfield generated by s.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "ringHom_fieldRange_eq_of_comp_eq_of_range_eq",
   "kind": "theorem",
   "signature": "(h : RingHom.comp f (algebraMap A K) = g) {s : Set L} (hs : g.range = Subring.closure s) : f.fieldRange = Subfield.closure s",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-algebra-norm-localization",
  "latex": "Algebra.norm Rₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.norm R a)",
  "name": "Algebra.norm_localization",
  "en": "Algebra.norm_localization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Then the norm of a : Sₘ over Rₘ is the norm of a : S over R if S is free as R-module.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Algebra.norm_localization\n类型签名：[Module.Free R S] [Module.Finite R S] (a : S) : Algebra.norm Rₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.norm R a)\n\nLet S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Then the norm of a : Sₘ over Rₘ is the norm of a : S over R if S is free as R-module.\n\n文件：RingTheory/Localization/NormTrace\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/NormTrace",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/NormTrace.lean",
  "formal": true,
  "lean": {
   "full": "Algebra.norm_localization",
   "kind": "theorem",
   "signature": "[Module.Free R S] [Module.Finite R S] (a : S) : Algebra.norm Rₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.norm R a)",
   "file": "Mathlib/RingTheory/Localization/NormTrace.lean"
  }
 },
 {
  "id": "ml-islocalization-bijective-lift-piringhom-algebramap-com-533ad255",
  "latex": "Function.Bijective (lift (S",
  "name": "bijective_lift_piRingHom_algebraMap_comp_piEvalRingHom",
  "en": "IsLocalization.bijective_lift_piRingHom_algebraMap_comp_piEvalRingHom",
  "importance": 0.72,
  "family": "foundation",
  "summary": "Let M be a submonoid of a direct product of commutative rings R i, and let M' i denote the projection of M onto each factor. Then the canonical map from the localization of the dir",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.bijective_lift_piRingHom_algebraMap_comp_piEvalRingHom\n类型签名：[IsLocalization M S'] [Finite ι] : Function.Bijective (lift (S\n\nLet M be a submonoid of a direct product of commutative rings R i, and let M' i denote the projection of M onto each factor. Then the canonical map from the localization of the direct product Π i, R i at M to the direct product of the localizations of each R i at M' i is bijective.\n\n文件：RingTheory/Localization/Pi\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Pi",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Pi.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.bijective_lift_piRingHom_algebraMap_comp_piEvalRingHom",
   "kind": "theorem",
   "signature": "[IsLocalization M S'] [Finite ι] : Function.Bijective (lift (S",
   "file": "Mathlib/RingTheory/Localization/Pi.lean"
  }
 },
 {
  "id": "ml-algebra-trace-localization",
  "latex": "Algebra.trace Rₘ Sₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.trace R S a)",
  "name": "Algebra.trace_localization",
  "en": "Algebra.trace_localization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Then the trace of a : Sₘ over Rₘ is the trace of a : S over R if S is free as R-module.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Algebra.trace_localization\n类型签名：[Module.Free R S] [Module.Finite R S] (a : S) : Algebra.trace Rₘ Sₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.trace R S a)\n\nLet S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Then the trace of a : Sₘ over Rₘ is the trace of a : S over R if S is free as R-module.\n\n文件：RingTheory/Localization/NormTrace\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/NormTrace",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/NormTrace.lean",
  "formal": true,
  "lean": {
   "full": "Algebra.trace_localization",
   "kind": "theorem",
   "signature": "[Module.Free R S] [Module.Finite R S] (a : S) : Algebra.trace Rₘ Sₘ (algebraMap S Sₘ a) = algebraMap R Rₘ (Algebra.trace R S a)",
   "file": "Mathlib/RingTheory/Localization/NormTrace.lean"
  }
 },
 {
  "id": "ml-ideal-exists-ne-zero-mem-of-ne-bot",
  "latex": "R , p ∈ P ∧ Polynomial.map (Quotient.mk (P.comap (C : R →+* R ))) p ≠ 0",
  "name": "exists_ne_zero_mem_of_ne_bot",
  "en": "Ideal.exists_ne_zero_mem_of_ne_bot",
  "importance": 0.8,
  "family": "foundation",
  "summary": "This technical lemma asserts the existence of a polynomial p in an ideal P ⊂ R[x] that is non-zero in the quotient R / (P ∩ R) [x]. The assumptions are equivalent to P ≠ 0 and P ∩ ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.exists_ne_zero_mem_of_ne_bot\n类型签名：{P : Ideal R[X]} (Pb : P ≠ ⊥) (hP : ∀ x : R, C x ∈ P → x = 0) : ∃ p : R[X], p ∈ P ∧ Polynomial.map (Quotient.mk (P.comap (C : R →+* R[X]))) p ≠ 0\n\nThis technical lemma asserts the existence of a polynomial p in an ideal P ⊂ R[x] that is non-zero in the quotient R / (P ∩ R) [x]. The assumptions are equivalent to P ≠ 0 and P ∩ R = (0).\n\n文件：RingTheory/Ideal/GoingUp\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/GoingUp",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/GoingUp.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.exists_ne_zero_mem_of_ne_bot",
   "kind": "theorem",
   "signature": "{P : Ideal R[X]} (Pb : P ≠ ⊥) (hP : ∀ x : R, C x ∈ P → x = 0) : ∃ p : R[X], p ∈ P ∧ Polynomial.map (Quotient.mk (P.comap (C : R →+* R[X]))) p ≠ 0",
   "file": "Mathlib/RingTheory/Ideal/GoingUp.lean"
  }
 },
 {
  "id": "ml-ideal-exists-mul-add-mem-pow-succ",
  "latex": "S, ∃ e ∈ P ^ (i + 1), a * d + e = c",
  "name": "Ideal.exists_mul_add_mem_pow_succ",
  "en": "Ideal.exists_mul_add_mem_pow_succ",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If a ∈ P^i \\ P^(i+1) and c ∈ P^i, then a * d + e = c for e ∈ P^(i+1). Ideal.mul_add_mem_pow_succ_unique shows the choice of d is unique, up to P. Inspired by [Neukirch], propositio",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.exists_mul_add_mem_pow_succ\n类型签名：[IsDedekindDomain S] (hP : P ≠ ⊥) {i : ℕ} (a c : S) (a_mem : a ∈ P ^ i) (a_notMem : a ∉ P ^ (i + 1)) (c_mem : c ∈ P ^ i) : ∃ d : S, ∃ e ∈ P ^ (i + 1), a * d + e = c\n\nIf a ∈ P^i \\ P^(i+1) and c ∈ P^i, then a * d + e = c for e ∈ P^(i+1). Ideal.mul_add_mem_pow_succ_unique shows the choice of d is unique, up to P. Inspired by [Neukirch], proposition 6.1\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.exists_mul_add_mem_pow_succ",
   "kind": "theorem",
   "signature": "[IsDedekindDomain S] (hP : P ≠ ⊥) {i : ℕ} (a c : S) (a_mem : a ∈ P ^ i) (a_notMem : a ∉ P ^ (i + 1)) (c_mem : c ∈ P ^ i) : ∃ d : S, ∃ e ∈ P ^ (i + 1), a * d + e = c",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-linearindependent-tmul-of-isdomain",
  "latex": "ι × κ ↦ v i.1 ⊗ₜ w i.2",
  "name": "LinearIndependent.tmul_of_isDomain",
  "en": "LinearIndependent.tmul_of_isDomain",
  "importance": 0.8,
  "family": "map",
  "summary": "Tensor product of linearly independent families is linearly independent over domains. This is true over non-domains if one of the modules is flat. See LinearIndependent.tmul_of_fla",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：LinearIndependent.tmul_of_isDomain\n类型签名：(hv : LinearIndependent R v) (hw : LinearIndependent R w) : LinearIndependent R fun i : ι × κ ↦ v i.1 ⊗ₜ[R] w i.2\n\nTensor product of linearly independent families is linearly independent over domains. This is true over non-domains if one of the modules is flat. See LinearIndependent.tmul_of_flat_left.\n\n文件：RingTheory/Flat/Domain\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Domain",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Domain.lean",
  "formal": true,
  "lean": {
   "full": "LinearIndependent.tmul_of_isDomain",
   "kind": "lemma",
   "signature": "(hv : LinearIndependent R v) (hw : LinearIndependent R w) : LinearIndependent R fun i : ι × κ ↦ v i.1 ⊗ₜ[R] w i.2",
   "file": "Mathlib/RingTheory/Flat/Domain.lean"
  }
 },
 {
  "id": "ml-scaleroots-dvd",
  "latex": "p.scaleRoots r ∣ q.scaleRoots r",
  "name": "scaleRoots_dvd'",
  "en": "scaleRoots_dvd'",
  "importance": 0.75,
  "family": "foundation",
  "summary": "v4.7.0-rc1 Previously mul_assoc was part of the simp only above, and this rw was not needed. but this now causes a max rec depth error.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：scaleRoots_dvd'\n类型签名：(p q : R[X]) {r : R} (hr : IsUnit r) (hpq : p ∣ q) : p.scaleRoots r ∣ q.scaleRoots r\n\nv4.7.0-rc1 Previously mul_assoc was part of the simp only above, and this rw was not needed. but this now causes a max rec depth error.\n\n文件：RingTheory/Polynomial/ScaleRoots\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/ScaleRoots",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/ScaleRoots.lean",
  "formal": true,
  "lean": {
   "full": "scaleRoots_dvd'",
   "kind": "lemma",
   "signature": "(p q : R[X]) {r : R} (hr : IsUnit r) (hpq : p ∣ q) : p.scaleRoots r ∣ q.scaleRoots r",
   "file": "Mathlib/RingTheory/Polynomial/ScaleRoots.lean"
  }
 },
 {
  "id": "ml-polynomial-isweaklyeisensteinat-map",
  "latex": ".IsWeaklyEisensteinAt (𝓟.map φ)",
  "name": "map",
  "en": "Polynomial.IsWeaklyEisensteinAt.map",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given an ideal 𝓟 of a commutative semiring R, we say that a polynomial f : R[X] is *Eisenstein at 𝓟* if f.leadingCoeff ∉ 𝓟, ∀ n, n < f.natDegree → f.coeff n ∈ 𝓟 and f.coeff 0 ∉",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.IsWeaklyEisensteinAt.map\n类型签名：(hf : f.IsWeaklyEisensteinAt 𝓟) {A : Type v} [CommSemiring A] (φ : R →+* A) : (f.map φ).IsWeaklyEisensteinAt (𝓟.map φ)\n\nGiven an ideal 𝓟 of a commutative semiring R, we say that a polynomial f : R[X] is *Eisenstein at 𝓟* if f.leadingCoeff ∉ 𝓟, ∀ n, n < f.natDegree → f.coeff n ∈ 𝓟 and f.coeff 0 ∉ 𝓟 ^ 2.\n\n文件：RingTheory/Polynomial/Eisenstein/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.IsWeaklyEisensteinAt.map",
   "kind": "theorem",
   "signature": "(hf : f.IsWeaklyEisensteinAt 𝓟) {A : Type v} [CommSemiring A] (φ : R →+* A) : (f.map φ).IsWeaklyEisensteinAt (𝓟.map φ)",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/Basic.lean"
  }
 },
 {
  "id": "ml-coeff-isunit-isnilpotent-of-isunit",
  "latex": "IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))",
  "name": "coeff_isUnit_isNilpotent_of_isUnit",
  "en": "coeff_isUnit_isNilpotent_of_isUnit",
  "importance": 0.75,
  "family": "foundation",
  "summary": "Let P be a polynomial over R. If P is a unit, then all its coefficients are nilpotent, except its constant term which is a unit. See also Polynomial.isUnit_iff_coeff_isUnit_isNilpo",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：coeff_isUnit_isNilpotent_of_isUnit\n类型签名：(hunit : IsUnit P) : IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))\n\nLet P be a polynomial over R. If P is a unit, then all its coefficients are nilpotent, except its constant term which is a unit. See also Polynomial.isUnit_iff_coeff_isUnit_isNilpotent.\n\n文件：RingTheory/Polynomial/Nilpotent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Nilpotent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Nilpotent.lean",
  "formal": true,
  "lean": {
   "full": "coeff_isUnit_isNilpotent_of_isUnit",
   "kind": "theorem",
   "signature": "(hunit : IsUnit P) : IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))",
   "file": "Mathlib/RingTheory/Polynomial/Nilpotent.lean"
  }
 },
 {
  "id": "ml-polynomial-natdegree-wronskian-lt-add",
  "latex": ".natDegree < a.natDegree + b.natDegree",
  "name": "natDegree_wronskian_lt_add",
  "en": "Polynomial.natDegree_wronskian_lt_add",
  "importance": 0.78,
  "family": "foundation",
  "summary": "natDegree version of the above theorem. Note this would be false with just (ha : a ≠ 0) and (hb : b ≠ 0), since when a = b = 1 we have (wronskian a b).natDegree = a.natDegree = b.n",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.natDegree_wronskian_lt_add\n类型签名：{a b : R[X]} (hw : wronskian a b ≠ 0) : (wronskian a b).natDegree < a.natDegree + b.natDegree\n\nnatDegree version of the above theorem. Note this would be false with just (ha : a ≠ 0) and (hb : b ≠ 0), since when a = b = 1 we have (wronskian a b).natDegree = a.natDegree = b.natDegree = 0.\n\n文件：RingTheory/Polynomial/Wronskian\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Wronskian",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Wronskian.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.natDegree_wronskian_lt_add",
   "kind": "theorem",
   "signature": "{a b : R[X]} (hw : wronskian a b ≠ 0) : (wronskian a b).natDegree < a.natDegree + b.natDegree",
   "file": "Mathlib/RingTheory/Polynomial/Wronskian.lean"
  }
 },
 {
  "id": "ml-islocalization-sec-spec",
  "latex": "algebraMap R S (IsLocalization.sec M z).1 = algebraMap R S (IsLocalization.sec M z).2 * z",
  "name": "sec_spec'",
  "en": "IsLocalization.sec_spec'",
  "importance": 0.79,
  "family": "foundation",
  "summary": "Given z : S, IsLocalization.sec M z is defined to be a pair (x, y) : R × M such that z * f y = f x, so this lemma is just an application of S's commutativity.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.sec_spec'\n类型签名：(z : S) : algebraMap R S (IsLocalization.sec M z).1 = algebraMap R S (IsLocalization.sec M z).2 * z\n\nGiven z : S, IsLocalization.sec M z is defined to be a pair (x, y) : R × M such that z * f y = f x, so this lemma is just an application of S's commutativity.\n\n文件：RingTheory/Localization/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Defs.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.sec_spec'",
   "kind": "theorem",
   "signature": "(z : S) : algebraMap R S (IsLocalization.sec M z).1 = algebraMap R S (IsLocalization.sec M z).2 * z",
   "file": "Mathlib/RingTheory/Localization/Defs.lean"
  }
 },
 {
  "id": "ml-trans",
  "latex": "IsFractionRing R L",
  "name": "trans",
  "en": "trans",
  "importance": 0.77,
  "family": "foundation",
  "summary": "Taking fraction ring is idempotent: a fraction ring of a fraction ring of R is itself a fraction ring of R.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：trans\n类型签名：(L) [CommRing L] [Algebra K L] [IsFractionRing K L] [Algebra R L] [IsScalarTower R K L] : IsFractionRing R L\n\nTaking fraction ring is idempotent: a fraction ring of a fraction ring of R is itself a fraction ring of R.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "trans",
   "kind": "theorem",
   "signature": "(L) [CommRing L] [Algebra K L] [IsFractionRing K L] [Algebra R L] [IsScalarTower R K L] : IsFractionRing R L",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-le-of-dvd",
  "latex": "I ∣ J → J ≤ I | ⟨_, h⟩ => h.symm ▸ le_trans mul_le_inf inf_le_left @[",
  "name": "le_of_dvd",
  "en": "le_of_dvd",
  "importance": 0.74,
  "family": "foundation",
  "summary": "If I divides J, then I contains J. In a Dedekind domain, to divide and contain are equivalent, see Ideal.dvd_iff_le.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：le_of_dvd\n类型签名：{I J : Ideal R} : I ∣ J → J ≤ I | ⟨_, h⟩ => h.symm ▸ le_trans mul_le_inf inf_le_left @[\n\nIf I divides J, then I contains J. In a Dedekind domain, to divide and contain are equivalent, see Ideal.dvd_iff_le.\n\n文件：RingTheory/Ideal/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Operations.lean",
  "formal": true,
  "lean": {
   "full": "le_of_dvd",
   "kind": "theorem",
   "signature": "{I J : Ideal R} : I ∣ J → J ≤ I | ⟨_, h⟩ => h.symm ▸ le_trans mul_le_inf inf_le_left @[",
   "file": "Mathlib/RingTheory/Ideal/Operations.lean"
  }
 },
 {
  "id": "ml-fixingsubgroup-range-algebramap",
  "latex": "fixingSubgroup G (Set.range (algebraMap A B)) = fixingSubgroup G (Set.range (algebraMap K L))",
  "name": "fixingSubgroup_range_algebraMap",
  "en": "fixingSubgroup_range_algebraMap",
  "importance": 0.78,
  "family": "foundation",
  "summary": "If K is the fraction field of A and L is the fraction field of B with A ⊆ B, then for G acting on B and L, the fixing subgroup of A in B equals the fixing subgroup of K in L.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：fixingSubgroup_range_algebraMap\n类型签名：: fixingSubgroup G (Set.range (algebraMap A B)) = fixingSubgroup G (Set.range (algebraMap K L))\n\nIf K is the fraction field of A and L is the fraction field of B with A ⊆ B, then for G acting on B and L, the fixing subgroup of A in B equals the fixing subgroup of K in L.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "fixingSubgroup_range_algebraMap",
   "kind": "theorem",
   "signature": ": fixingSubgroup G (Set.range (algebraMap A B)) = fixingSubgroup G (Set.range (algebraMap K L))",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-unique-int-coeff-of-cycl",
  "latex": "ℤ , map (Int.castRingHom K) P = cyclotomic' n K",
  "name": "unique_int_coeff_of_cycl",
  "en": "unique_int_coeff_of_cycl",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If K is of characteristic 0 and there is a primitive n-th root of unity in K, then cyclotomic n K comes from a unique polynomial with integer coefficients.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：unique_int_coeff_of_cycl\n类型签名：{K : Type*} [CommRing K] [IsDomain K] [CharZero K] {ζ : K} {n : ℕ+} (h : IsPrimitiveRoot ζ n) : ∃! P : ℤ[X], map (Int.castRingHom K) P = cyclotomic' n K\n\nIf K is of characteristic 0 and there is a primitive n-th root of unity in K, then cyclotomic n K comes from a unique polynomial with integer coefficients.\n\n文件：RingTheory/Polynomial/Cyclotomic/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean",
  "formal": true,
  "lean": {
   "full": "unique_int_coeff_of_cycl",
   "kind": "theorem",
   "signature": "{K : Type*} [CommRing K] [IsDomain K] [CharZero K] {ζ : K} {n : ℕ+} (h : IsPrimitiveRoot ζ n) : ∃! P : ℤ[X], map (Int.castRingHom K) P = cyclotomic' n K",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean"
  }
 },
 {
  "id": "ml-ideal-isaugmentation-subalgebra-iff",
  "latex": "I.IsAugmentation S ↔ IsCompl S.toSubmodule (I.restrictScalars R)",
  "name": "isAugmentation_subalgebra_iff",
  "en": "Ideal.isAugmentation_subalgebra_iff",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If S is a subalgebra of an R-algebra A, then an ideal Iof A is an augmentation ideal for the R-algebra structure if and only if it is an augmentation ideal for the S-algebra struct",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.isAugmentation_subalgebra_iff\n类型签名：[CommSemiring A] [Algebra R A] {S : Subalgebra R A} {I : Ideal A} : I.IsAugmentation S ↔ IsCompl S.toSubmodule (I.restrictScalars R)\n\nIf S is a subalgebra of an R-algebra A, then an ideal Iof A is an augmentation ideal for the R-algebra structure if and only if it is an augmentation ideal for the S-algebra structure.\n\n文件：RingTheory/Ideal/IsAugmentation\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/IsAugmentation",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/IsAugmentation.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.isAugmentation_subalgebra_iff",
   "kind": "theorem",
   "signature": "[CommSemiring A] [Algebra R A] {S : Subalgebra R A} {I : Ideal A} : I.IsAugmentation S ↔ IsCompl S.toSubmodule (I.restrictScalars R)",
   "file": "Mathlib/RingTheory/Ideal/IsAugmentation.lean"
  }
 },
 {
  "id": "ml-fieldequivofalgequiv-algebramap",
  "latex": "fieldEquivOfAlgEquiv FA FB FC f (algebraMap B FB b) = algebraMap C FC (f b)",
  "name": "fieldEquivOfAlgEquiv_algebraMap",
  "en": "fieldEquivOfAlgEquiv_algebraMap",
  "importance": 0.79,
  "family": "foundation",
  "summary": "This says that fieldEquivOfAlgEquiv f is an extension of f (i.e., it agrees with f on B). Whereas (fieldEquivOfAlgEquiv f).commutes says that fieldEquivOfAlgEquiv f fixes K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：fieldEquivOfAlgEquiv_algebraMap\n类型签名：(f : B ≃ₐ[A] C) (b : B) : fieldEquivOfAlgEquiv FA FB FC f (algebraMap B FB b) = algebraMap C FC (f b)\n\nThis says that fieldEquivOfAlgEquiv f is an extension of f (i.e., it agrees with f on B). Whereas (fieldEquivOfAlgEquiv f).commutes says that fieldEquivOfAlgEquiv f fixes K.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "fieldEquivOfAlgEquiv_algebraMap",
   "kind": "lemma",
   "signature": "(f : B ≃ₐ[A] C) (b : B) : fieldEquivOfAlgEquiv FA FB FC f (algebraMap B FB b) = algebraMap C FC (f b)",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-ideal-ker-tensorproductmk-quotient",
  "latex": "ker (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1) = (⨅ i, I i) • (⊤ : Submodule R M)",
  "name": "ker_tensorProductMk_quotient",
  "en": "Ideal.ker_tensorProductMk_quotient",
  "importance": 0.78,
  "family": "foundation",
  "summary": "A form of Chinese remainder theorem for modules, part II: if ideals Iᵢ of R are pairwise coprime, then for any R-module M, the kernel of M → Πᵢ (R ⧸ Iᵢ) ⊗[R] M equals (⋂ᵢ Iᵢ) • M.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.ker_tensorProductMk_quotient\n类型签名：: ker (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1) = (⨅ i, I i) • (⊤ : Submodule R M)\n\nA form of Chinese remainder theorem for modules, part II: if ideals Iᵢ of R are pairwise coprime, then for any R-module M, the kernel of M → Πᵢ (R ⧸ Iᵢ) ⊗[R] M equals (⋂ᵢ Iᵢ) • M.\n\n文件：RingTheory/Ideal/Quotient/ChineseRemainder\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/ChineseRemainder",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/ChineseRemainder.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.ker_tensorProductMk_quotient",
   "kind": "theorem",
   "signature": ": ker (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1) = (⨅ i, I i) • (⊤ : Submodule R M)",
   "file": "Mathlib/RingTheory/Ideal/Quotient/ChineseRemainder.lean"
  }
 },
 {
  "id": "ml-isunit-of-coeff-isunit-isnilpotent",
  "latex": "IsUnit P",
  "name": "isUnit_of_coeff_isUnit_isNilpotent",
  "en": "isUnit_of_coeff_isUnit_isNilpotent",
  "importance": 0.76,
  "family": "foundation",
  "summary": "Let P be a polynomial over R. If its constant term is a unit and its other coefficients are nilpotent, then P is a unit. See also Polynomial.isUnit_iff_coeff_isUnit_isNilpotent.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isUnit_of_coeff_isUnit_isNilpotent\n类型签名：(hunit : IsUnit (P.coeff 0)) (hnil : ∀ i, i ≠ 0 → IsNilpotent (P.coeff i)) : IsUnit P\n\nLet P be a polynomial over R. If its constant term is a unit and its other coefficients are nilpotent, then P is a unit. See also Polynomial.isUnit_iff_coeff_isUnit_isNilpotent.\n\n文件：RingTheory/Polynomial/Nilpotent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Nilpotent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Nilpotent.lean",
  "formal": true,
  "lean": {
   "full": "isUnit_of_coeff_isUnit_isNilpotent",
   "kind": "theorem",
   "signature": "(hunit : IsUnit (P.coeff 0)) (hnil : ∀ i, i ≠ 0 → IsNilpotent (P.coeff i)) : IsUnit P",
   "file": "Mathlib/RingTheory/Polynomial/Nilpotent.lean"
  }
 },
 {
  "id": "ml-mvpolynomial-prod-c-add-x-eq-sum-esymm",
  "latex": ")) = ∑ j ∈ range (card σ + 1), Polynomial.C (MvPolynomial.esymm σ R j) * Polynomial.X ^ (card σ - j)",
  "name": "MvPolynomial.prod_C_add_X_eq_sum_esymm",
  "en": "MvPolynomial.prod_C_add_X_eq_sum_esymm",
  "importance": 0.8,
  "family": "foundation",
  "summary": "A sum version of Vieta's formula for MvPolynomial: viewing X i as variables, the product of linear terms λ + X i is equal to a linear combination of the symmetric polynomials esymm",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：MvPolynomial.prod_C_add_X_eq_sum_esymm\n类型签名：: (∏ i : σ, (Polynomial.X + Polynomial.C (MvPolynomial.X i))) = ∑ j ∈ range (card σ + 1), Polynomial.C (MvPolynomial.esymm σ R j) * Polynomial.X ^ (card σ - j)\n\nA sum version of Vieta's formula for MvPolynomial: viewing X i as variables, the product of linear terms λ + X i is equal to a linear combination of the symmetric polynomials esymm σ R j.\n\n文件：RingTheory/Polynomial/Vieta\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Vieta",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Vieta.lean",
  "formal": true,
  "lean": {
   "full": "MvPolynomial.prod_C_add_X_eq_sum_esymm",
   "kind": "theorem",
   "signature": ": (∏ i : σ, (Polynomial.X + Polynomial.C (MvPolynomial.X i))) = ∑ j ∈ range (card σ + 1), Polynomial.C (MvPolynomial.esymm σ R j) * Polynomial.X ^ (card σ - j)",
   "file": "Mathlib/RingTheory/Polynomial/Vieta.lean"
  }
 },
 {
  "id": "ml-polynomial-exists-degree-le-of-mem-span-of-finite",
  "latex": "∃ p' ∈ s, ∀ (p : R ), p ∈ Submodule.span R s → degree p ≤ degree p'",
  "name": "exists_degree_le_of_mem_span_of_finite",
  "en": "Polynomial.exists_degree_le_of_mem_span_of_finite",
  "importance": 0.8,
  "family": "foundation",
  "summary": "A stronger version of Polynomial.exists_degree_le_of_mem_span under the assumption that the set s : R[X] is finite. There exists a polynomial p' ∈ s whose degree dominates the degr",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.exists_degree_le_of_mem_span_of_finite\n类型签名：{s : Set R[X]} (s_fin : s.Finite) (hs : s.Nonempty) : ∃ p' ∈ s, ∀ (p : R[X]), p ∈ Submodule.span R s → degree p ≤ degree p'\n\nA stronger version of Polynomial.exists_degree_le_of_mem_span under the assumption that the set s : R[X] is finite. There exists a polynomial p' ∈ s whose degree dominates the degree of every element of p ∈ span R s.\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.exists_degree_le_of_mem_span_of_finite",
   "kind": "theorem",
   "signature": "{s : Set R[X]} (s_fin : s.Finite) (hs : s.Nonempty) : ∃ p' ∈ s, ∀ (p : R[X]), p ∈ Submodule.span R s → degree p ≤ degree p'",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-map-pi",
  "latex": "f x i ∈ I",
  "name": "map_pi",
  "en": "map_pi",
  "importance": 0.76,
  "family": "foundation",
  "summary": "If f : R^n → R^m is an R-linear map and I ⊆ R is an ideal, then the image of I^n is contained in I^m.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_pi\n类型签名：[I.IsTwoSided] [Finite ι] (x : ι → R) (hi : ∀ i, x i ∈ I) (f : (ι → R) →ₗ[R] ι' → R) (i : ι') : f x i ∈ I\n\nIf f : R^n → R^m is an R-linear map and I ⊆ R is an ideal, then the image of I^n is contained in I^m.\n\n文件：RingTheory/Ideal/Quotient/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Basic.lean",
  "formal": true,
  "lean": {
   "full": "map_pi",
   "kind": "theorem",
   "signature": "[I.IsTwoSided] [Finite ι] (x : ι → R) (hi : ∀ i, x i ∈ I) (f : (ι → R) →ₗ[R] ι' → R) (i : ι') : f x i ∈ I",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Basic.lean"
  }
 },
 {
  "id": "ml-mem-map-c-iff",
  "latex": "ℕ, f.coeff n ∈ I",
  "name": "mem_map_C_iff",
  "en": "mem_map_C_iff",
  "importance": 0.76,
  "family": "foundation",
  "summary": "The push-forward of an ideal I of R to R[X] via inclusion is exactly the set of polynomials whose coefficients are in I",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：mem_map_C_iff\n类型签名：{I : Ideal R} {f : R[X]} : f ∈ (Ideal.map (C : R →+* R[X]) I : Ideal R[X]) ↔ ∀ n : ℕ, f.coeff n ∈ I\n\nThe push-forward of an ideal I of R to R[X] via inclusion is exactly the set of polynomials whose coefficients are in I\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "mem_map_C_iff",
   "kind": "theorem",
   "signature": "{I : Ideal R} {f : R[X]} : f ∈ (Ideal.map (C : R →+* R[X]) I : Ideal R[X]) ↔ ∀ n : ℕ, f.coeff n ∈ I",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-islocalring-not-islocalring-tfae",
  "latex": "List.TFAE",
  "name": "not_isLocalRing_tfae",
  "en": "IsLocalRing.not_isLocalRing_tfae",
  "importance": 0.8,
  "family": "foundation",
  "summary": "The following conditions are equivalent for a commutative (semi)ring R: * R is not local, * the maximal spectrum of R is nontrivial, * R has two distinct maximal ideals.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.not_isLocalRing_tfae\n类型签名：{R : Type*} [CommSemiring R] [Nontrivial R] : List.TFAE [ ¬IsLocalRing R, Nontrivial (MaximalSpectrum R), ∃ m₁ m₂ : Ideal R, m₁.IsMaximal ∧ m₂.IsMaximal ∧ m₁ ≠ m₂]\n\nThe following conditions are equivalent for a commutative (semi)ring R: * R is not local, * the maximal spectrum of R is nontrivial, * R has two distinct maximal ideals.\n\n文件：RingTheory/LocalRing/NonLocalRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/NonLocalRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/NonLocalRing.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.not_isLocalRing_tfae",
   "kind": "theorem",
   "signature": "{R : Type*} [CommSemiring R] [Nontrivial R] : List.TFAE [ ¬IsLocalRing R, Nontrivial (MaximalSpectrum R), ∃ m₁ m₂ : Ideal R, m₁.IsMaximal ∧ m₂.IsMaximal ∧ m₁ ≠ m₂]",
   "file": "Mathlib/RingTheory/LocalRing/NonLocalRing.lean"
  }
 },
 {
  "id": "ml-ker-isprime",
  "latex": ".IsPrime",
  "name": "ker_isPrime",
  "en": "ker_isPrime",
  "importance": 0.77,
  "family": "foundation",
  "summary": "The kernel of a homomorphism to a nontrivial semiring with no zero divisors (such as a domain) is a prime ideal.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ker_isPrime\n类型签名：{F : Type*} [Semiring R] [Semiring S] [Nontrivial S] [NoZeroDivisors S] [FunLike F R S] [RingHomClass F R S] (f : F) : (ker f).IsPrime\n\nThe kernel of a homomorphism to a nontrivial semiring with no zero divisors (such as a domain) is a prime ideal.\n\n文件：RingTheory/Ideal/Maps\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Maps",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Maps.lean",
  "formal": true,
  "lean": {
   "full": "ker_isPrime",
   "kind": "theorem",
   "signature": "{F : Type*} [Semiring R] [Semiring S] [Nontrivial S] [NoZeroDivisors S] [FunLike F R S] [RingHomClass F R S] (f : F) : (ker f).IsPrime",
   "file": "Mathlib/RingTheory/Ideal/Maps.lean"
  }
 },
 {
  "id": "ml-algebra-discr-localizationlocalization",
  "latex": "Algebra.discr Rₘ (b.localizationLocalization Rₘ M Sₘ) = algebraMap R Rₘ (Algebra.discr R b)",
  "name": "Algebra.discr_localizationLocalization",
  "en": "Algebra.discr_localizationLocalization",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Let b be an R-basis of S. Then discriminant of the Rₘ-basis of Sₘ induced by b is the discriminant o",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Algebra.discr_localizationLocalization\n类型签名：(b : Basis ι R S) : Algebra.discr Rₘ (b.localizationLocalization Rₘ M Sₘ) = algebraMap R Rₘ (Algebra.discr R b)\n\nLet S be an extension of R and Rₘ Sₘ be localizations at M of R S respectively. Let b be an R-basis of S. Then discriminant of the Rₘ-basis of Sₘ induced by b is the discriminant of b.\n\n文件：RingTheory/Localization/NormTrace\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/NormTrace",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/NormTrace.lean",
  "formal": true,
  "lean": {
   "full": "Algebra.discr_localizationLocalization",
   "kind": "theorem",
   "signature": "(b : Basis ι R S) : Algebra.discr Rₘ (b.localizationLocalization Rₘ M Sₘ) = algebraMap R Rₘ (Algebra.discr R b)",
   "file": "Mathlib/RingTheory/Localization/NormTrace.lean"
  }
 },
 {
  "id": "ml-module-basis-span-repr-one-eq-top",
  "latex": "Ideal.span (Set.range (e.repr 1)) = ⊤",
  "name": "Module.Basis.span_repr_one_eq_top",
  "en": "Module.Basis.span_repr_one_eq_top",
  "importance": 0.8,
  "family": "map",
  "summary": "In a nonzero algebra that is free as a module, the coordinates of 1 in any basis generate the unit ideal. Equivalently, 1 is unimodular: see Module.Free.isUnimodular_one.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.Basis.span_repr_one_eq_top\n类型签名：{R : Type*} [CommRing R] {A ι : Type*} [Ring A] [Nontrivial A] [Algebra R A] (e : Basis ι R A) : Ideal.span (Set.range (e.repr 1)) = ⊤\n\nIn a nonzero algebra that is free as a module, the coordinates of 1 in any basis generate the unit ideal. Equivalently, 1 is unimodular: see Module.Free.isUnimodular_one.\n\n文件：RingTheory/Flat/FaithfullyFlat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/FaithfullyFlat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Module.Basis.span_repr_one_eq_top",
   "kind": "theorem",
   "signature": "{R : Type*} [CommRing R] {A ι : Type*} [Ring A] [Nontrivial A] [Algebra R A] (e : Basis ι R A) : Ideal.span (Set.range (e.repr 1)) = ⊤",
   "file": "Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean"
  }
 },
 {
  "id": "ml-polynomial-irreducible-of-dvd-cyclotomic-of-natdegree",
  "latex": "Irreducible P",
  "name": "irreducible_of_dvd_cyclotomic_of_natDegree",
  "en": "Polynomial.irreducible_of_dvd_cyclotomic_of_natDegree",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let K be a finite field of cardinality p ^ f and let P be a factor of the n-th cyclotomic polynomial over K, where p and n are coprime. If the degree of P is the multiplicative ord",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.irreducible_of_dvd_cyclotomic_of_natDegree\n类型签名：(hP : P ∣ cyclotomic n K) (hPdeg : P.natDegree = orderOf (unitOfCoprime _ (hn.pow_left f))) : Irreducible P\n\nLet K be a finite field of cardinality p ^ f and let P be a factor of the n-th cyclotomic polynomial over K, where p and n are coprime. If the degree of P is the multiplicative order of p ^ f modulo n then P is irreducible.\n\n文件：RingTheory/Polynomial/Cyclotomic/Factorization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Factorization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.irreducible_of_dvd_cyclotomic_of_natDegree",
   "kind": "theorem",
   "signature": "(hP : P ∣ cyclotomic n K) (hPdeg : P.natDegree = orderOf (unitOfCoprime _ (hn.pow_left f))) : Irreducible P",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean"
  }
 },
 {
  "id": "ml-ideal-quotient-ringhom-ext",
  "latex": "⦃f g : R ⧸ I →+* S⦄ (h : f.comp (mk I) = g.comp (mk I)) : f = g",
  "name": "ringHom_ext",
  "en": "Ideal.Quotient.ringHom_ext",
  "importance": 0.76,
  "family": "foundation",
  "summary": "Two RingHoms from the quotient by an ideal are equal if their compositions with Ideal.Quotient.mk' are equal. See note [partially-applied ext lemmas].",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.Quotient.ringHom_ext\n类型签名：[NonAssocSemiring S] ⦃f g : R ⧸ I →+* S⦄ (h : f.comp (mk I) = g.comp (mk I)) : f = g\n\nTwo RingHoms from the quotient by an ideal are equal if their compositions with Ideal.Quotient.mk' are equal. See note [partially-applied ext lemmas].\n\n文件：RingTheory/Ideal/Quotient/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Defs.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.Quotient.ringHom_ext",
   "kind": "theorem",
   "signature": "[NonAssocSemiring S] ⦃f g : R ⧸ I →+* S⦄ (h : f.comp (mk I) = g.comp (mk I)) : f = g",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Defs.lean"
  }
 },
 {
  "id": "ml-ideal-ideal-prod-eq",
  "latex": "I = Ideal.prod (map (RingHom.fst R S) I : Ideal R) (map (RingHom.snd R S) I)",
  "name": "ideal_prod_eq",
  "en": "Ideal.ideal_prod_eq",
  "importance": 0.77,
  "family": "foundation",
  "summary": "Every ideal of the product ring is of the form I × J, where I and J can be explicitly given as the image under the projection maps.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.ideal_prod_eq\n类型签名：(I : Ideal (R × S)) : I = Ideal.prod (map (RingHom.fst R S) I : Ideal R) (map (RingHom.snd R S) I)\n\nEvery ideal of the product ring is of the form I × J, where I and J can be explicitly given as the image under the projection maps.\n\n文件：RingTheory/Ideal/Prod\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Prod",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Prod.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.ideal_prod_eq",
   "kind": "theorem",
   "signature": "(I : Ideal (R × S)) : I = Ideal.prod (map (RingHom.fst R S) I : Ideal R) (map (RingHom.snd R S) I)",
   "file": "Mathlib/RingTheory/Ideal/Prod.lean"
  }
 },
 {
  "id": "ml-ofnat-eq-top",
  "latex": ": Ideal R) = ⊤",
  "name": "ofNat_eq_top",
  "en": "ofNat_eq_top",
  "importance": 0.68,
  "family": "foundation",
  "summary": "3 : Ideal R is *not* the ideal generated by 3 (which would be spelt Ideal.span {3}), it is simply 1 + 1 + 1 = ⊤.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ofNat_eq_top\n类型签名：{n : ℕ} [n.AtLeastTwo] : (ofNat(n) : Ideal R) = ⊤\n\n3 : Ideal R is *not* the ideal generated by 3 (which would be spelt Ideal.span {3}), it is simply 1 + 1 + 1 = ⊤.\n\n文件：RingTheory/Ideal/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Operations.lean",
  "formal": true,
  "lean": {
   "full": "ofNat_eq_top",
   "kind": "theorem",
   "signature": "{n : ℕ} [n.AtLeastTwo] : (ofNat(n) : Ideal R) = ⊤",
   "file": "Mathlib/RingTheory/Ideal/Operations.lean"
  }
 },
 {
  "id": "ml-closure-range-algebramap",
  "latex": "Subfield.closure (Set.range (algebraMap A K)) = ⊤",
  "name": "closure_range_algebraMap",
  "en": "closure_range_algebraMap",
  "importance": 0.71,
  "family": "foundation",
  "summary": "If A is a commutative ring with fraction field K, then the subfield of K generated by the image of algebraMap A K is equal to the whole field K.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：closure_range_algebraMap\n类型签名：: Subfield.closure (Set.range (algebraMap A K)) = ⊤\n\nIf A is a commutative ring with fraction field K, then the subfield of K generated by the image of algebraMap A K is equal to the whole field K.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "closure_range_algebraMap",
   "kind": "theorem",
   "signature": ": Subfield.closure (Set.range (algebraMap A K)) = ⊤",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-smul-mem-iff",
  "latex": "s • x ∈ N' ↔ x ∈ N'",
  "name": "smul_mem_iff",
  "en": "smul_mem_iff",
  "importance": 0.7,
  "family": "foundation",
  "summary": "If x in a R' = S⁻¹ R-module M', then for a submodule N' of M', s • x ∈ N' if and only if x ∈ N' for some s in S.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：smul_mem_iff\n类型签名：{N' : Submodule R' M'} {x : M'} {s : S} : s • x ∈ N' ↔ x ∈ N'\n\nIf x in a R' = S⁻¹ R-module M', then for a submodule N' of M', s • x ∈ N' if and only if x ∈ N' for some s in S.\n\n文件：RingTheory/Localization/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Basic.lean",
  "formal": true,
  "lean": {
   "full": "smul_mem_iff",
   "kind": "lemma",
   "signature": "{N' : Submodule R' M'} {x : M'} {s : S} : s • x ∈ N' ↔ x ∈ N'",
   "file": "Mathlib/RingTheory/Localization/Basic.lean"
  }
 },
 {
  "id": "ml-natdegree-cyclotomic-le",
  "latex": "natDegree (cyclotomic n R) ≤ n.totient",
  "name": "natDegree_cyclotomic_le",
  "en": "natDegree_cyclotomic_le",
  "importance": 0.73,
  "family": "foundation",
  "summary": "The natural degree of cyclotomic n is at most totient n. If the base ring is nontrivial, then the degree is exactly φ n, otherwise it's zero.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：natDegree_cyclotomic_le\n类型签名：{R : Type*} [Ring R] {n : ℕ} : natDegree (cyclotomic n R) ≤ n.totient\n\nThe natural degree of cyclotomic n is at most totient n. If the base ring is nontrivial, then the degree is exactly φ n, otherwise it's zero.\n\n文件：RingTheory/Polynomial/Cyclotomic/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean",
  "formal": true,
  "lean": {
   "full": "natDegree_cyclotomic_le",
   "kind": "lemma",
   "signature": "{R : Type*} [Ring R] {n : ℕ} : natDegree (cyclotomic n R) ≤ n.totient",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean"
  }
 },
 {
  "id": "ml-span-le-of-c-coeff-mem",
  "latex": "Ideal.span { g | ∃ i, g = C (f.coeff i) } ≤ I",
  "name": "span_le_of_C_coeff_mem",
  "en": "span_le_of_C_coeff_mem",
  "importance": 0.75,
  "family": "foundation",
  "summary": "If the coefficients of a polynomial belong to an ideal, then that ideal contains the ideal spanned by the coefficients of the polynomial.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：span_le_of_C_coeff_mem\n类型签名：(cf : ∀ i : ℕ, C (f.coeff i) ∈ I) : Ideal.span { g | ∃ i, g = C (f.coeff i) } ≤ I\n\nIf the coefficients of a polynomial belong to an ideal, then that ideal contains the ideal spanned by the coefficients of the polynomial.\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "span_le_of_C_coeff_mem",
   "kind": "theorem",
   "signature": "(cf : ∀ i : ℕ, C (f.coeff i) ∈ I) : Ideal.span { g | ∃ i, g = C (f.coeff i) } ≤ I",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-ringhom-fieldrange-eq-of-comp-eq",
  "latex": "f.fieldRange = Subfield.closure g.range",
  "name": "ringHom_fieldRange_eq_of_comp_eq",
  "en": "ringHom_fieldRange_eq_of_comp_eq",
  "importance": 0.76,
  "family": "foundation",
  "summary": "If A is a commutative ring with fraction field K, L is a field, g : A →+* L lifts to f : K →+* L, then the image of f is the subfield generated by the image of g.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：ringHom_fieldRange_eq_of_comp_eq\n类型签名：(h : RingHom.comp f (algebraMap A K) = g) : f.fieldRange = Subfield.closure g.range\n\nIf A is a commutative ring with fraction field K, L is a field, g : A →+* L lifts to f : K →+* L, then the image of f is the subfield generated by the image of g.\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "ringHom_fieldRange_eq_of_comp_eq",
   "kind": "theorem",
   "signature": "(h : RingHom.comp f (algebraMap A K) = g) : f.fieldRange = Subfield.closure g.range",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-isreduced-tensorproduct-of-flat-of-forall-fg",
  "latex": "IsReduced (C ⊗ A)",
  "name": "IsReduced.tensorProduct_of_flat_of_forall_fg",
  "en": "IsReduced.tensorProduct_of_flat_of_forall_fg",
  "importance": 0.8,
  "family": "map",
  "summary": "Let R be a commutative semiring, let C be a commutative R-algebra, and let A be an R-algebra. If C ⊗[R] B is reduced for all finitely generated subalgebras B of A, then C ⊗[R] A is",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsReduced.tensorProduct_of_flat_of_forall_fg\n类型签名：{R C A : Type*} [CommSemiring R] [CommSemiring C] [Semiring A] [Algebra R A] [Algebra R C] [Module.Flat R C] (h : ∀ B : Subalgebra R A, B.FG → IsReduced (C ⊗[R] B)) : IsReduced (C ⊗[R] A)\n\nLet R be a commutative semiring, let C be a commutative R-algebra, and let A be an R-algebra. If C ⊗[R] B is reduced for all finitely generated subalgebras B of A, then C ⊗[R] A is also reduced.\n\n文件：RingTheory/Flat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IsReduced.tensorProduct_of_flat_of_forall_fg",
   "kind": "theorem",
   "signature": "{R C A : Type*} [CommSemiring R] [CommSemiring C] [Semiring A] [Algebra R A] [Algebra R C] [Module.Flat R C] (h : ∀ B : Subalgebra R A, B.FG → IsReduced (C ⊗[R] B)) : IsReduced (C ⊗[R] A)",
   "file": "Mathlib/RingTheory/Flat/Basic.lean"
  }
 },
 {
  "id": "ml-exists-prime-and-absnorm-eq-pow",
  "latex": "∃ p n, 0 < n ∧ ↑p ∈ P ∧ p.Prime ∧ P.absNorm = p ^ n",
  "name": "exists_prime_and_absNorm_eq_pow",
  "en": "exists_prime_and_absNorm_eq_pow",
  "importance": 0.76,
  "family": "foundation",
  "summary": "The norm of a maximal ideal is a prime power. The prime is (P.under ℤ).absNorm and the exponent is (P.under ℤ).inertialDeg P. See Ideal.absNorm_pow_inertiaDeg.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：exists_prime_and_absNorm_eq_pow\n类型签名：(P : Ideal S) [P.IsMaximal] : ∃ p n, 0 < n ∧ ↑p ∈ P ∧ p.Prime ∧ P.absNorm = p ^ n\n\nThe norm of a maximal ideal is a prime power. The prime is (P.under ℤ).absNorm and the exponent is (P.under ℤ).inertialDeg P. See Ideal.absNorm_pow_inertiaDeg.\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "exists_prime_and_absNorm_eq_pow",
   "kind": "lemma",
   "signature": "(P : Ideal S) [P.IsMaximal] : ∃ p n, 0 < n ∧ ↑p ∈ P ∧ p.Prime ∧ P.absNorm = p ^ n",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-polynomial-natdegree-of-dvd-cyclotomic-of-irreducible",
  "latex": "P.natDegree = orderOf (unitOfCoprime _ (hn.pow_left f))",
  "name": "natDegree_of_dvd_cyclotomic_of_irreducible",
  "en": "Polynomial.natDegree_of_dvd_cyclotomic_of_irreducible",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let K be a finite field of cardinality p ^ f and let P be an irreducible factor of the n-th cyclotomic polynomial over K, where p and n are coprime. Then the degree of P is the mul",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.natDegree_of_dvd_cyclotomic_of_irreducible\n类型签名：(hP : P ∣ cyclotomic n K) (hPirr : Irreducible P) : P.natDegree = orderOf (unitOfCoprime _ (hn.pow_left f))\n\nLet K be a finite field of cardinality p ^ f and let P be an irreducible factor of the n-th cyclotomic polynomial over K, where p and n are coprime. Then the degree of P is the multiplicative order of p ^ f modulo n.\n\n文件：RingTheory/Polynomial/Cyclotomic/Factorization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Factorization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.natDegree_of_dvd_cyclotomic_of_irreducible",
   "kind": "theorem",
   "signature": "(hP : P ∣ cyclotomic n K) (hPirr : Irreducible P) : P.natDegree = orderOf (unitOfCoprime _ (hn.pow_left f))",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Factorization.lean"
  }
 },
 {
  "id": "ml-isunit-iff-coeff-isunit-isnilpotent",
  "latex": "IsUnit P ↔ IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))",
  "name": "isUnit_iff_coeff_isUnit_isNilpotent",
  "en": "isUnit_iff_coeff_isUnit_isNilpotent",
  "importance": 0.74,
  "family": "foundation",
  "summary": "Let P be a polynomial over R. P is a unit if and only if all its coefficients are nilpotent, except its constant term which is a unit. See also Polynomial.isUnit_iff'.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isUnit_iff_coeff_isUnit_isNilpotent\n类型签名：: IsUnit P ↔ IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))\n\nLet P be a polynomial over R. P is a unit if and only if all its coefficients are nilpotent, except its constant term which is a unit. See also Polynomial.isUnit_iff'.\n\n文件：RingTheory/Polynomial/Nilpotent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Nilpotent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Nilpotent.lean",
  "formal": true,
  "lean": {
   "full": "isUnit_iff_coeff_isUnit_isNilpotent",
   "kind": "theorem",
   "signature": ": IsUnit P ↔ IsUnit (P.coeff 0) ∧ (∀ i, i ≠ 0 → IsNilpotent (P.coeff i))",
   "file": "Mathlib/RingTheory/Polynomial/Nilpotent.lean"
  }
 },
 {
  "id": "ml-ideal-pi-quotient-surjective",
  "latex": "R, ∀ i, r = x i",
  "name": "pi_quotient_surjective",
  "en": "Ideal.pi_quotient_surjective",
  "importance": 0.78,
  "family": "foundation",
  "summary": "Corollary of Chinese Remainder Theorem: if Iᵢ are pairwise coprime ideals in a commutative ring then the canonical map R → ∏ (R ⧸ Iᵢ) is surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.pi_quotient_surjective\n类型签名：{I : ι → Ideal R} (hf : Pairwise (IsCoprime on I)) (x : (i : ι) → R ⧸ I i) : ∃ r : R, ∀ i, r = x i\n\nCorollary of Chinese Remainder Theorem: if Iᵢ are pairwise coprime ideals in a commutative ring then the canonical map R → ∏ (R ⧸ Iᵢ) is surjective.\n\n文件：RingTheory/Ideal/Quotient/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Operations.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.pi_quotient_surjective",
   "kind": "lemma",
   "signature": "{I : ι → Ideal R} (hf : Pairwise (IsCoprime on I)) (x : (i : ι) → R ⧸ I i) : ∃ r : R, ∀ i, r = x i",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Operations.lean"
  }
 },
 {
  "id": "ml-ideal-mem-minimalprimes-span-of-mem-minimalprimes-span-ae57d3b6",
  "latex": "q ∈ (span t).minimalPrimes",
  "name": "Ideal.mem_minimalPrimes_span_of_mem_minimalPrimes_span_insert",
  "en": "Ideal.mem_minimalPrimes_span_of_mem_minimalPrimes_span_insert",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If q < p are prime ideals such that p is minimal over span (s ∪ {x}) and t is a set contained in q such that s ⊆ √span (t ∪ {x}), then q is minimal over span t. This is used in the",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.mem_minimalPrimes_span_of_mem_minimalPrimes_span_insert\n类型签名：{q p : Ideal R} [q.IsPrime] (hqp : q < p) (x : R) (s : Set R) (hp : p ∈ (span (insert x s)).minimalPrimes) (t : Set R) (htq : t ⊆ q) (hsp : s ⊆ (span (insert x t)).radical) : q ∈ (span t).minimalPrimes\n\nIf q < p are prime ideals such that p is minimal over span (s ∪ {x}) and t is a set contained in q such that s ⊆ √span (t ∪ {x}), then q is minimal over span t. This is used in the induction step for the proof of Krull's height theorem.\n\n文件：RingTheory/Ideal/KrullsHeightTheorem\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/KrullsHeightTheorem",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.mem_minimalPrimes_span_of_mem_minimalPrimes_span_insert",
   "kind": "theorem",
   "signature": "{q p : Ideal R} [q.IsPrime] (hqp : q < p) (x : R) (s : Set R) (hp : p ∈ (span (insert x s)).minimalPrimes) (t : Set R) (htq : t ⊆ q) (hsp : s ⊆ (span (insert x t)).radical) : q ∈ (span t).minimalPrimes",
   "file": "Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean"
  }
 },
 {
  "id": "ml-ideal-exists-forall-sub-mem-ideal",
  "latex": "R, ∀ i, r - x i ∈ I i",
  "name": "exists_forall_sub_mem_ideal",
  "en": "Ideal.exists_forall_sub_mem_ideal",
  "importance": 0.77,
  "family": "foundation",
  "summary": "Corollary of Chinese Remainder Theorem: if Iᵢ are pairwise coprime ideals in a commutative ring then given elements xᵢ you can find r with r - xᵢ ∈ Iᵢ for all i.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.exists_forall_sub_mem_ideal\n类型签名：{I : ι → Ideal R} (hI : Pairwise (IsCoprime on I)) (x : ι → R) : ∃ r : R, ∀ i, r - x i ∈ I i\n\nCorollary of Chinese Remainder Theorem: if Iᵢ are pairwise coprime ideals in a commutative ring then given elements xᵢ you can find r with r - xᵢ ∈ Iᵢ for all i.\n\n文件：RingTheory/Ideal/Quotient/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Operations.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.exists_forall_sub_mem_ideal",
   "kind": "lemma",
   "signature": "{I : ι → Ideal R} (hI : Pairwise (IsCoprime on I)) (x : ι → R) : ∃ r : R, ∀ i, r - x i ∈ I i",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Operations.lean"
  }
 },
 {
  "id": "ml-ideal-height-le-spanrank-toenat",
  "latex": "I.height ≤ I.spanRank.toENat",
  "name": "Ideal.height_le_spanRank_toENat",
  "en": "Ideal.height_le_spanRank_toENat",
  "importance": 0.72,
  "family": "foundation",
  "summary": "In a commutative Noetherian ring R, the height of a (finitely-generated) ideal is smaller than or equal to the minimum number of generators for this ideal.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.height_le_spanRank_toENat\n类型签名：(I : Ideal R) (hI : I ≠ ⊤) : I.height ≤ I.spanRank.toENat\n\nIn a commutative Noetherian ring R, the height of a (finitely-generated) ideal is smaller than or equal to the minimum number of generators for this ideal.\n\n文件：RingTheory/Ideal/KrullsHeightTheorem\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/KrullsHeightTheorem",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.height_le_spanRank_toENat",
   "kind": "lemma",
   "signature": "(I : Ideal R) (hI : I ≠ ⊤) : I.height ≤ I.spanRank.toENat",
   "file": "Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean"
  }
 },
 {
  "id": "ml-relnorm-eq-pow-of-ismaximal",
  "latex": "relNorm R P = p ^ P.inertiaDeg R",
  "name": "relNorm_eq_pow_of_isMaximal",
  "en": "relNorm_eq_pow_of_isMaximal",
  "importance": 0.8,
  "family": "foundation",
  "summary": "The relative norm of a maximal ideal is the prime below it raised to the inertia degree, whenever the extension of fraction fields is separable.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：relNorm_eq_pow_of_isMaximal\n类型签名：[Algebra.IsSeparable (FractionRing R) (FractionRing S)] [P.IsMaximal] [p.IsMaximal] : relNorm R P = p ^ P.inertiaDeg R\n\nThe relative norm of a maximal ideal is the prime below it raised to the inertia degree, whenever the extension of fraction fields is separable.\n\n文件：RingTheory/Ideal/Norm/RelNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/RelNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/RelNorm.lean",
  "formal": true,
  "lean": {
   "full": "relNorm_eq_pow_of_isMaximal",
   "kind": "theorem",
   "signature": "[Algebra.IsSeparable (FractionRing R) (FractionRing S)] [P.IsMaximal] [p.IsMaximal] : relNorm R P = p ^ P.inertiaDeg R",
   "file": "Mathlib/RingTheory/Ideal/Norm/RelNorm.lean"
  }
 },
 {
  "id": "ml-primespectrum-isopen-singleton-tfae-of-isnoetherian-of-093553cd",
  "latex": "List.TFAE",
  "name": "isOpen_singleton_tfae_of_isNoetherian_of_isJacobsonRing",
  "en": "PrimeSpectrum.isOpen_singleton_tfae_of_isNoetherian_of_isJacobsonRing",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If R is both Noetherian and Jacobson, then the following are equivalent for x : Spec R: 1. {x} is open (i.e. x is an isolated point) 2. {x} is clopen 3. {x} is both closed and stab",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：PrimeSpectrum.isOpen_singleton_tfae_of_isNoetherian_of_isJacobsonRing\n类型签名：[IsNoetherianRing R] [IsJacobsonRing R] (x : PrimeSpectrum R) : List.TFAE [IsOpen {x}, IsClopen {x}, IsClosed {x} ∧ StableUnderGeneralization {x}]\n\nIf R is both Noetherian and Jacobson, then the following are equivalent for x : Spec R: 1. {x} is open (i.e. x is an isolated point) 2. {x} is clopen 3. {x} is both closed and stable under generalization (i.e. x is both a minimal prime and a maximal ideal)\n\n文件：RingTheory/Spectrum/Prime/Jacobson\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/Jacobson",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/Jacobson.lean",
  "formal": true,
  "lean": {
   "full": "PrimeSpectrum.isOpen_singleton_tfae_of_isNoetherian_of_isJacobsonRing",
   "kind": "lemma",
   "signature": "[IsNoetherianRing R] [IsJacobsonRing R] (x : PrimeSpectrum R) : List.TFAE [IsOpen {x}, IsClopen {x}, IsClosed {x} ∧ StableUnderGeneralization {x}]",
   "file": "Mathlib/RingTheory/Spectrum/Prime/Jacobson.lean"
  }
 },
 {
  "id": "ml-isnoetherianring-exists-relseries-isquotientequivquoti-70c1e64c",
  "latex": "RelSeries {(N₁, N₂) | Submodule.IsQuotientEquivQuotientPrime (A",
  "name": "IsNoetherianRing.exists_relSeries_isQuotientEquivQuotientPrime",
  "en": "IsNoetherianRing.exists_relSeries_isQuotientEquivQuotientPrime",
  "importance": 0.74,
  "family": "foundation",
  "summary": "If A is a Noetherian ring and M is a finitely generated A-module, then there exists a chain of submodules 0 = M₀ ≤ M₁ ≤ M₂ ≤ ... ≤ Mₙ = M of M, such that for each 0 ≤ i < n, Mᵢ₊₁ /",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsNoetherianRing.exists_relSeries_isQuotientEquivQuotientPrime\n类型签名：: ∃ s : RelSeries {(N₁, N₂) | Submodule.IsQuotientEquivQuotientPrime (A\n\nIf A is a Noetherian ring and M is a finitely generated A-module, then there exists a chain of submodules 0 = M₀ ≤ M₁ ≤ M₂ ≤ ... ≤ Mₙ = M of M, such that for each 0 ≤ i < n, Mᵢ₊₁ / Mᵢ is isomorphic to A / pᵢ for some prime ideal pᵢ of A.\n\n文件：RingTheory/Ideal/AssociatedPrime/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/AssociatedPrime/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/AssociatedPrime/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "IsNoetherianRing.exists_relSeries_isQuotientEquivQuotientPrime",
   "kind": "theorem",
   "signature": ": ∃ s : RelSeries {(N₁, N₂) | Submodule.IsQuotientEquivQuotientPrime (A",
   "file": "Mathlib/RingTheory/Ideal/AssociatedPrime/Finiteness.lean"
  }
 },
 {
  "id": "ml-tensorproduct-map-injective-of-flat-flat-of-isdomain",
  "latex": "Injective (TensorProduct.map f g)",
  "name": "TensorProduct.map_injective_of_flat_flat_of_isDomain",
  "en": "TensorProduct.map_injective_of_flat_flat_of_isDomain",
  "importance": 0.8,
  "family": "map",
  "summary": "Tensor product of injective maps over domains are injective under some flatness conditions. Also see TensorProduct.map_injective_of_flat_flat for different flatness conditions but ",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：TensorProduct.map_injective_of_flat_flat_of_isDomain\n类型签名：(f : P →ₗ[R] M) (g : Q →ₗ[R] N) [H : Module.Flat R P] [Module.Flat R Q] (hf : Injective f) (hg : Injective g) : Injective (TensorProduct.map f g)\n\nTensor product of injective maps over domains are injective under some flatness conditions. Also see TensorProduct.map_injective_of_flat_flat for different flatness conditions but without the domain assumption.\n\n文件：RingTheory/Flat/Domain\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/Domain",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/Domain.lean",
  "formal": true,
  "lean": {
   "full": "TensorProduct.map_injective_of_flat_flat_of_isDomain",
   "kind": "lemma",
   "signature": "(f : P →ₗ[R] M) (g : Q →ₗ[R] N) [H : Module.Flat R P] [Module.Flat R Q] (hf : Injective f) (hg : Injective g) : Injective (TensorProduct.map f g)",
   "file": "Mathlib/RingTheory/Flat/Domain.lean"
  }
 },
 {
  "id": "ml-polynomial-eq-hilbertpoly-of-forall-coeff-eq-eval",
  "latex": "{d : ℕ} (N : ℕ) (hhN : ∀ n > N, PowerSeries.coeff (R",
  "name": "eq_hilbertPoly_of_forall_coeff_eq_eval",
  "en": "Polynomial.eq_hilbertPoly_of_forall_coeff_eq_eval",
  "importance": 0.73,
  "family": "foundation",
  "summary": "If h : F[X] and there exists some N : ℕ such that for any number n : ℕ bigger than N we have PowerSeries.coeff F n (p * invOneSubPow F d) = h.eval (n : F), then h is exactly Polyno",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.eq_hilbertPoly_of_forall_coeff_eq_eval\n类型签名：{p h : F[X]} {d : ℕ} (N : ℕ) (hhN : ∀ n > N, PowerSeries.coeff (R\n\nIf h : F[X] and there exists some N : ℕ such that for any number n : ℕ bigger than N we have PowerSeries.coeff F n (p * invOneSubPow F d) = h.eval (n : F), then h is exactly Polynomial.hilbertPoly p d.\n\n文件：RingTheory/Polynomial/HilbertPoly\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/HilbertPoly",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/HilbertPoly.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.eq_hilbertPoly_of_forall_coeff_eq_eval",
   "kind": "theorem",
   "signature": "{p h : F[X]} {d : ℕ} (N : ℕ) (hhN : ∀ n > N, PowerSeries.coeff (R",
   "file": "Mathlib/RingTheory/Polynomial/HilbertPoly.lean"
  }
 },
 {
  "id": "ml-polynomial-exists-degree-le-of-mem-span",
  "latex": "∃ p' ∈ s, degree p ≤ degree p'",
  "name": "exists_degree_le_of_mem_span",
  "en": "Polynomial.exists_degree_le_of_mem_span",
  "importance": 0.8,
  "family": "foundation",
  "summary": "For every polynomial p in the span of a set s : Set R[X], there exists a polynomial of p' ∈ s with higher degree. See also Polynomial.exists_degree_le_of_mem_span_of_finite.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.exists_degree_le_of_mem_span\n类型签名：{s : Set R[X]} {p : R[X]} (hs : s.Nonempty) (hp : p ∈ Submodule.span R s) : ∃ p' ∈ s, degree p ≤ degree p'\n\nFor every polynomial p in the span of a set s : Set R[X], there exists a polynomial of p' ∈ s with higher degree. See also Polynomial.exists_degree_le_of_mem_span_of_finite.\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.exists_degree_le_of_mem_span",
   "kind": "theorem",
   "signature": "{s : Set R[X]} {p : R[X]} (hs : s.Nonempty) (hp : p ∈ Submodule.span R s) : ∃ p' ∈ s, degree p ≤ degree p'",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-islocalization-iff-of-islocalization",
  "latex": "IsLocalization M P ↔ IsLocalization N P",
  "name": "isLocalization_iff_of_isLocalization",
  "en": "isLocalization_iff_of_isLocalization",
  "importance": 0.78,
  "family": "foundation",
  "summary": "If an algebra is simultaneously localizations for two submonoids, then an arbitrary algebra is a localization of one submonoid iff it is a localization of the other.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isLocalization_iff_of_isLocalization\n类型签名：[IsLocalization M S] [IsLocalization N S] [Algebra R P] : IsLocalization M P ↔ IsLocalization N P\n\nIf an algebra is simultaneously localizations for two submonoids, then an arbitrary algebra is a localization of one submonoid iff it is a localization of the other.\n\n文件：RingTheory/Localization/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Basic.lean",
  "formal": true,
  "lean": {
   "full": "isLocalization_iff_of_isLocalization",
   "kind": "theorem",
   "signature": "[IsLocalization M S] [IsLocalization N S] [Algebra R P] : IsLocalization M P ↔ IsLocalization N P",
   "file": "Mathlib/RingTheory/Localization/Basic.lean"
  }
 },
 {
  "id": "ml-isnilpotent-tensor-residuefield-iff",
  "latex": "IsNilpotent (algebraMap A (A ⊗ I.ResidueField) f) ↔ ∀ i < Module.finrank R A, (Algebra.lmul R A f).charpoly.coeff i ∈ I",
  "name": "isNilpotent_tensor_residueField_iff",
  "en": "isNilpotent_tensor_residueField_iff",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If A is a finite free R-algebra, then f : A is nilpotent on κ(𝔭) ⊗ A for some prime 𝔭 ◃ R if and only if every non-leading coefficient of charpoly(f) is in 𝔭.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：isNilpotent_tensor_residueField_iff\n类型签名：[Module.Free R A] [Module.Finite R A] (f : A) (I : Ideal R) [I.IsPrime] : IsNilpotent (algebraMap A (A ⊗[R] I.ResidueField) f) ↔ ∀ i < Module.finrank R A, (Algebra.lmul R A f).charpoly.coeff i ∈ I\n\nIf A is a finite free R-algebra, then f : A is nilpotent on κ(𝔭) ⊗ A for some prime 𝔭 ◃ R if and only if every non-leading coefficient of charpoly(f) is in 𝔭.\n\n文件：RingTheory/Spectrum/Prime/Polynomial\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Spectrum/Prime/Polynomial",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Spectrum/Prime/Polynomial.lean",
  "formal": true,
  "lean": {
   "full": "isNilpotent_tensor_residueField_iff",
   "kind": "lemma",
   "signature": "[Module.Free R A] [Module.Finite R A] (f : A) (I : Ideal R) [I.IsPrime] : IsNilpotent (algebraMap A (A ⊗[R] I.ResidueField) f) ↔ ∀ i < Module.finrank R A, (Algebra.lmul R A f).charpoly.coeff i ∈ I",
   "file": "Mathlib/RingTheory/Spectrum/Prime/Polynomial.lean"
  }
 },
 {
  "id": "ml-map-nonunit",
  "latex": "f a ∈ maximalIdeal S",
  "name": "map_nonunit",
  "en": "map_nonunit",
  "importance": 0.72,
  "family": "foundation",
  "summary": "The image of the maximal ideal of the source is contained within the maximal ideal of the target.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_nonunit\n类型签名：(f : R →+* S) [IsLocalHom f] (a : R) (h : a ∈ maximalIdeal R) : f a ∈ maximalIdeal S\n\nThe image of the maximal ideal of the source is contained within the maximal ideal of the target.\n\n文件：RingTheory/LocalRing/RingHom/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/RingHom/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/RingHom/Basic.lean",
  "formal": true,
  "lean": {
   "full": "map_nonunit",
   "kind": "theorem",
   "signature": "(f : R →+* S) [IsLocalHom f] (a : R) (h : a ∈ maximalIdeal R) : f a ∈ maximalIdeal S",
   "file": "Mathlib/RingTheory/LocalRing/RingHom/Basic.lean"
  }
 },
 {
  "id": "ml-module-exists-basis-of-basis-basechange",
  "latex": "∃ (b : Basis ι R M), ∀ i, b i = v i",
  "name": "exists_basis_of_basis_baseChange",
  "en": "Module.exists_basis_of_basis_baseChange",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If M is of finite presentation over a local ring (R, 𝔪, k) such that 𝔪 ⊗ M → M is injective, then every family of elements that is a k-basis of k ⊗ M is an R-basis of M.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Module.exists_basis_of_basis_baseChange\n类型签名：[Module.FinitePresentation R M] {ι : Type*} (v : ι → M) (hli : LinearIndependent k (TensorProduct.mk R k M 1 ∘ v)) (hsp : Submodule.span k (Set.range (TensorProduct.mk R k M 1 ∘ v)) = ⊤) (H : Function.Injective ((𝔪).subtype.rTensor M)) : ∃ (b : Basis ι R M), ∀ i, b i = v i\n\nIf M is of finite presentation over a local ring (R, 𝔪, k) such that 𝔪 ⊗ M → M is injective, then every family of elements that is a k-basis of k ⊗ M is an R-basis of M.\n\n文件：RingTheory/LocalRing/Module\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/Module",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/Module.lean",
  "formal": true,
  "lean": {
   "full": "Module.exists_basis_of_basis_baseChange",
   "kind": "lemma",
   "signature": "[Module.FinitePresentation R M] {ι : Type*} (v : ι → M) (hli : LinearIndependent k (TensorProduct.mk R k M 1 ∘ v)) (hsp : Submodule.span k (Set.range (TensorProduct.mk R k M 1 ∘ v)) = ⊤) (H : Function.Injective ((𝔪).subtype.rTensor M)) : ∃ (b : Basis ι R M), ∀ i, b i = v i",
   "file": "Mathlib/RingTheory/LocalRing/Module.lean"
  }
 },
 {
  "id": "ml-localization-atprime-map-eq-maximalideal",
  "latex": "Ideal.map (algebraMap R (Localization.AtPrime I)) I = IsLocalRing.maximalIdeal (Localization I.primeCompl)",
  "name": "AtPrime.map_eq_maximalIdeal",
  "en": "Localization.AtPrime.map_eq_maximalIdeal",
  "importance": 0.8,
  "family": "foundation",
  "summary": "The image of I in the localization at I.primeCompl is a maximal ideal, and in particular it is the unique maximal ideal given by the local ring structure AtPrime.isLocalRing",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Localization.AtPrime.map_eq_maximalIdeal\n类型签名：: Ideal.map (algebraMap R (Localization.AtPrime I)) I = IsLocalRing.maximalIdeal (Localization I.primeCompl)\n\nThe image of I in the localization at I.primeCompl is a maximal ideal, and in particular it is the unique maximal ideal given by the local ring structure AtPrime.isLocalRing\n\n文件：RingTheory/Localization/AtPrime/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/AtPrime/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/AtPrime/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Localization.AtPrime.map_eq_maximalIdeal",
   "kind": "theorem",
   "signature": ": Ideal.map (algebraMap R (Localization.AtPrime I)) I = IsLocalRing.maximalIdeal (Localization I.primeCompl)",
   "file": "Mathlib/RingTheory/Localization/AtPrime/Basic.lean"
  }
 },
 {
  "id": "ml-ideal-quotient-quotient-ring-saturate",
  "latex": "I, (fun y => x.1 + y) '' s",
  "name": "quotient_ring_saturate",
  "en": "Ideal.Quotient.quotient_ring_saturate",
  "importance": 0.73,
  "family": "foundation",
  "summary": "If I is an ideal of a commutative ring R, if q : R → R/I is the quotient map, and if s ⊆ R is a subset, then q⁻¹(q(s)) = ⋃ᵢ(i + s), the union running over all i ∈ I.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.Quotient.quotient_ring_saturate\n类型签名：(s : Set R) : mk I ⁻¹' mk I '' s = ⋃ x : I, (fun y => x.1 + y) '' s\n\nIf I is an ideal of a commutative ring R, if q : R → R/I is the quotient map, and if s ⊆ R is a subset, then q⁻¹(q(s)) = ⋃ᵢ(i + s), the union running over all i ∈ I.\n\n文件：RingTheory/Ideal/Quotient/Defs\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Defs",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Defs.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.Quotient.quotient_ring_saturate",
   "kind": "theorem",
   "signature": "(s : Set R) : mk I ⁻¹' mk I '' s = ⋃ x : I, (fun y => x.1 + y) '' s",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Defs.lean"
  }
 },
 {
  "id": "ml-ideal-mul-add-mem-pow-succ-inj",
  "latex": "a * d + e - (a * d' + e') ∈ P ^ (i + 1)",
  "name": "Ideal.mul_add_mem_pow_succ_inj",
  "en": "Ideal.mul_add_mem_pow_succ_inj",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If the d from Ideal.exists_mul_add_mem_pow_succ is unique, up to P, then so are the cs, up to P ^ (i + 1). Inspired by [Neukirch], proposition 6.1",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.mul_add_mem_pow_succ_inj\n类型签名：(P : Ideal S) {i : ℕ} (a d d' e e' : S) (a_mem : a ∈ P ^ i) (e_mem : e ∈ P ^ (i + 1)) (e'_mem : e' ∈ P ^ (i + 1)) (h : d - d' ∈ P) : a * d + e - (a * d' + e') ∈ P ^ (i + 1)\n\nIf the d from Ideal.exists_mul_add_mem_pow_succ is unique, up to P, then so are the cs, up to P ^ (i + 1). Inspired by [Neukirch], proposition 6.1\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.mul_add_mem_pow_succ_inj",
   "kind": "theorem",
   "signature": "(P : Ideal S) {i : ℕ} (a d d' e e' : S) (a_mem : a ∈ P ^ i) (e_mem : e ∈ P ^ (i + 1)) (e'_mem : e' ∈ P ^ (i + 1)) (h : d - d' ∈ P) : a * d + e - (a * d' + e') ∈ P ^ (i + 1)",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-exists-ideal-over-maximal-of-isintegral",
  "latex": "Ideal S, IsMaximal Q ∧ Q.under R = P",
  "name": "exists_ideal_over_maximal_of_isIntegral",
  "en": "exists_ideal_over_maximal_of_isIntegral",
  "importance": 0.8,
  "family": "foundation",
  "summary": "comap (algebraMap R S) is a surjection from the max spec of S to max spec of R. hP : (algebraMap R S).ker ≤ P is a slight generalization of the extension being injective",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：exists_ideal_over_maximal_of_isIntegral\n类型签名：[Algebra.IsIntegral R S] (P : Ideal R) [P_max : IsMaximal P] (hP : RingHom.ker (algebraMap R S) ≤ P) : ∃ Q : Ideal S, IsMaximal Q ∧ Q.under R = P\n\ncomap (algebraMap R S) is a surjection from the max spec of S to max spec of R. hP : (algebraMap R S).ker ≤ P is a slight generalization of the extension being injective\n\n文件：RingTheory/Ideal/GoingUp\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/GoingUp",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/GoingUp.lean",
  "formal": true,
  "lean": {
   "full": "exists_ideal_over_maximal_of_isIntegral",
   "kind": "theorem",
   "signature": "[Algebra.IsIntegral R S] (P : Ideal R) [P_max : IsMaximal P] (hP : RingHom.ker (algebraMap R S) ≤ P) : ∃ Q : Ideal S, IsMaximal Q ∧ Q.under R = P",
   "file": "Mathlib/RingTheory/Ideal/GoingUp.lean"
  }
 },
 {
  "id": "ml-polynomial-gaussnorm-mul-le",
  "latex": ".gaussNorm v c ≤ p.gaussNorm v c * q.gaussNorm v c",
  "name": "gaussNorm_mul_le",
  "en": "Polynomial.gaussNorm_mul_le",
  "importance": 0.79,
  "family": "foundation",
  "summary": "If v is a nonnegative nonarchimedean multiplicative function with v 0 = 0 and c is nonnegative, then the Gauss norm is submultiplicative.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.gaussNorm_mul_le\n类型签名：[MulHomClass F R ℝ] (hna : IsNonarchimedean v) (p q : R[X]) (hc : 0 ≤ c) : (p * q).gaussNorm v c ≤ p.gaussNorm v c * q.gaussNorm v c\n\nIf v is a nonnegative nonarchimedean multiplicative function with v 0 = 0 and c is nonnegative, then the Gauss norm is submultiplicative.\n\n文件：RingTheory/Polynomial/GaussNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/GaussNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/GaussNorm.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.gaussNorm_mul_le",
   "kind": "theorem",
   "signature": "[MulHomClass F R ℝ] (hna : IsNonarchimedean v) (p q : R[X]) (hc : 0 ≤ c) : (p * q).gaussNorm v c ≤ p.gaussNorm v c * q.gaussNorm v c",
   "file": "Mathlib/RingTheory/Polynomial/GaussNorm.lean"
  }
 },
 {
  "id": "ml-ideal-height-le-iff-exists-minimalprimes",
  "latex": "Ideal R, p ∈ I.minimalPrimes ∧ I.spanRank ≤ n",
  "name": "Ideal.height_le_iff_exists_minimalPrimes",
  "en": "Ideal.height_le_iff_exists_minimalPrimes",
  "importance": 0.79,
  "family": "foundation",
  "summary": "In a commutative Noetherian ring R, a prime ideal p has height no greater than n if and only if it is a minimal ideal over some ideal generated by no more than n elements.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.height_le_iff_exists_minimalPrimes\n类型签名：(p : Ideal R) [p.IsPrime] (n : ℕ∞) : p.height ≤ n ↔ ∃ I : Ideal R, p ∈ I.minimalPrimes ∧ I.spanRank ≤ n\n\nIn a commutative Noetherian ring R, a prime ideal p has height no greater than n if and only if it is a minimal ideal over some ideal generated by no more than n elements.\n\n文件：RingTheory/Ideal/KrullsHeightTheorem\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/KrullsHeightTheorem",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.height_le_iff_exists_minimalPrimes",
   "kind": "lemma",
   "signature": "(p : Ideal R) [p.IsPrime] (n : ℕ∞) : p.height ≤ n ↔ ∃ I : Ideal R, p ∈ I.minimalPrimes ∧ I.spanRank ≤ n",
   "file": "Mathlib/RingTheory/Ideal/KrullsHeightTheorem.lean"
  }
 },
 {
  "id": "ml-hasseparableresiduefieldsat-tower-top",
  "latex": "HasSeparableResidueFieldsAt B C q where isSeparable' r _ _",
  "name": "HasSeparableResidueFieldsAt.tower_top",
  "en": "HasSeparableResidueFieldsAt.tower_top",
  "importance": 0.78,
  "family": "foundation",
  "summary": "For a tower of rings C/B/A and a prime q of B lying over p, separability of the residue field extensions of C/A above p gives separability of those of C/B above q.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HasSeparableResidueFieldsAt.tower_top\n类型签名：[HasSeparableResidueFieldsAt A C p] : HasSeparableResidueFieldsAt B C q where isSeparable' r _ _\n\nFor a tower of rings C/B/A and a prime q of B lying over p, separability of the residue field extensions of C/A above p gives separability of those of C/B above q.\n\n文件：RingTheory/LocalRing/ResidueField/Separable\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/ResidueField/Separable",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/ResidueField/Separable.lean",
  "formal": true,
  "lean": {
   "full": "HasSeparableResidueFieldsAt.tower_top",
   "kind": "theorem",
   "signature": "[HasSeparableResidueFieldsAt A C p] : HasSeparableResidueFieldsAt B C q where isSeparable' r _ _",
   "file": "Mathlib/RingTheory/LocalRing/ResidueField/Separable.lean"
  }
 },
 {
  "id": "ml-islocalring-of-injective",
  "latex": "IsLocalRing R",
  "name": "of_injective",
  "en": "IsLocalRing.of_injective",
  "importance": 0.78,
  "family": "foundation",
  "summary": "If a (semi)ring R in which every element is either invertible or a zero divisor embeds in a local (semi)ring S, then R is local.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.of_injective\n类型签名：[IsLocalRing S] {f : R →+* S} (hf : Function.Injective f) (h : ∀ a, a ∈ R⁰ → IsUnit a) : IsLocalRing R\n\nIf a (semi)ring R in which every element is either invertible or a zero divisor embeds in a local (semi)ring S, then R is local.\n\n文件：RingTheory/LocalRing/Subring\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/Subring",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/Subring.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.of_injective",
   "kind": "theorem",
   "signature": "[IsLocalRing S] {f : R →+* S} (hf : Function.Injective f) (h : ∀ a, a ∈ R⁰ → IsUnit a) : IsLocalRing R",
   "file": "Mathlib/RingTheory/LocalRing/Subring.lean"
  }
 },
 {
  "id": "ml-map-symm",
  "latex": "I.map f.symm = I.comap f",
  "name": "map_symm",
  "en": "map_symm",
  "importance": 0.66,
  "family": "foundation",
  "summary": "If f : R ≃+* S is a ring isomorphism and I : Ideal R, then map f.symm I = comap f I.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：map_symm\n类型签名：{I : Ideal S} (f : R ≃+* S) : I.map f.symm = I.comap f\n\nIf f : R ≃+* S is a ring isomorphism and I : Ideal R, then map f.symm I = comap f I.\n\n文件：RingTheory/Ideal/Maps\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Maps",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Maps.lean",
  "formal": true,
  "lean": {
   "full": "map_symm",
   "kind": "theorem",
   "signature": "{I : Ideal S} (f : R ≃+* S) : I.map f.symm = I.comap f",
   "file": "Mathlib/RingTheory/Ideal/Maps.lean"
  }
 },
 {
  "id": "ml-cardquot-mul-of-coprime",
  "latex": "cardQuot (I * J) = cardQuot I * cardQuot J",
  "name": "cardQuot_mul_of_coprime",
  "en": "cardQuot_mul_of_coprime",
  "importance": 0.75,
  "family": "foundation",
  "summary": "Multiplicity of the ideal norm, for coprime ideals. This is essentially just a repackaging of the Chinese Remainder Theorem.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：cardQuot_mul_of_coprime\n类型签名：{I J : Ideal S} (coprime : IsCoprime I J) : cardQuot (I * J) = cardQuot I * cardQuot J\n\nMultiplicity of the ideal norm, for coprime ideals. This is essentially just a repackaging of the Chinese Remainder Theorem.\n\n文件：RingTheory/Ideal/Norm/AbsNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Norm/AbsNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean",
  "formal": true,
  "lean": {
   "full": "cardQuot_mul_of_coprime",
   "kind": "theorem",
   "signature": "{I J : Ideal S} (coprime : IsCoprime I J) : cardQuot (I * J) = cardQuot I * cardQuot J",
   "file": "Mathlib/RingTheory/Ideal/Norm/AbsNorm.lean"
  }
 },
 {
  "id": "ml-surjective-iff-isfield",
  "latex": "Function.Surjective (algebraMap R K) ↔ IsField R where mp h",
  "name": "surjective_iff_isField",
  "en": "surjective_iff_isField",
  "importance": 0.72,
  "family": "foundation",
  "summary": "A CommRing K which is the localization of an integral domain R at R - {0} is a field. See note [reducible non-instances].",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：surjective_iff_isField\n类型签名：[IsDomain R] : Function.Surjective (algebraMap R K) ↔ IsField R where mp h\n\nA CommRing K which is the localization of an integral domain R at R - {0} is a field. See note [reducible non-instances].\n\n文件：RingTheory/Localization/FractionRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/FractionRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/FractionRing.lean",
  "formal": true,
  "lean": {
   "full": "surjective_iff_isField",
   "kind": "lemma",
   "signature": "[IsDomain R] : Function.Surjective (algebraMap R K) ↔ IsField R where mp h",
   "file": "Mathlib/RingTheory/Localization/FractionRing.lean"
  }
 },
 {
  "id": "ml-int-coeff-of-cyclotomic",
  "latex": "ℤ , map (Int.castRingHom K) P = cyclotomic' n K ∧ P.degree = (cyclotomic' n K).degree ∧ P.Monic",
  "name": "int_coeff_of_cyclotomic'",
  "en": "int_coeff_of_cyclotomic'",
  "importance": 0.78,
  "family": "foundation",
  "summary": "If there is a primitive n-th root of unity in K, then cyclotomic' n K comes from a monic polynomial with integer coefficients.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：int_coeff_of_cyclotomic'\n类型签名：{K : Type*} [CommRing K] [IsDomain K] {ζ : K} {n : ℕ} (h : IsPrimitiveRoot ζ n) : ∃ P : ℤ[X], map (Int.castRingHom K) P = cyclotomic' n K ∧ P.degree = (cyclotomic' n K).degree ∧ P.Monic\n\nIf there is a primitive n-th root of unity in K, then cyclotomic' n K comes from a monic polynomial with integer coefficients.\n\n文件：RingTheory/Polynomial/Cyclotomic/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Cyclotomic/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean",
  "formal": true,
  "lean": {
   "full": "int_coeff_of_cyclotomic'",
   "kind": "theorem",
   "signature": "{K : Type*} [CommRing K] [IsDomain K] {ζ : K} {n : ℕ} (h : IsPrimitiveRoot ζ n) : ∃ P : ℤ[X], map (Int.castRingHom K) P = cyclotomic' n K ∧ P.degree = (cyclotomic' n K).degree ∧ P.Monic",
   "file": "Mathlib/RingTheory/Polynomial/Cyclotomic/Basic.lean"
  }
 },
 {
  "id": "ml-mvpolynomial-mem-map-c-iff",
  "latex": "σ →₀ ℕ, f.coeff m ∈ I",
  "name": "mem_map_C_iff",
  "en": "MvPolynomial.mem_map_C_iff",
  "importance": 0.79,
  "family": "foundation",
  "summary": "The push-forward of an ideal I of R to MvPolynomial σ R via inclusion is exactly the set of polynomials whose coefficients are in I",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：MvPolynomial.mem_map_C_iff\n类型签名：{I : Ideal R} {f : MvPolynomial σ R} : f ∈ (Ideal.map (C : R →+* MvPolynomial σ R) I : Ideal (MvPolynomial σ R)) ↔ ∀ m : σ →₀ ℕ, f.coeff m ∈ I\n\nThe push-forward of an ideal I of R to MvPolynomial σ R via inclusion is exactly the set of polynomials whose coefficients are in I\n\n文件：RingTheory/Polynomial/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean",
  "formal": true,
  "lean": {
   "full": "MvPolynomial.mem_map_C_iff",
   "kind": "theorem",
   "signature": "{I : Ideal R} {f : MvPolynomial σ R} : f ∈ (Ideal.map (C : R →+* MvPolynomial σ R) I : Ideal (MvPolynomial σ R)) ↔ ∀ m : σ →₀ ℕ, f.coeff m ∈ I",
   "file": "Mathlib/RingTheory/Polynomial/Basic.lean"
  }
 },
 {
  "id": "ml-mem-of-span-eq-top-of-smul-pow-mem",
  "latex": "(M' : Submodule R M) (s : Set R) (hs : Ideal.span s = ⊤) (x : M) (H : ∀ r : s, ∃ n : ℕ, ((r : R) ^ n : R) • x ∈ M') : x ∈ M'",
  "name": "mem_of_span_eq_top_of_smul_pow_mem",
  "en": "mem_of_span_eq_top_of_smul_pow_mem",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Given s, a generating set of R, to check that an x : M falls in a submodule M' of x, we only need to show that r ^ n • x ∈ M' for some n for each r : s.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：mem_of_span_eq_top_of_smul_pow_mem\n类型签名：(M' : Submodule R M) (s : Set R) (hs : Ideal.span s = ⊤) (x : M) (H : ∀ r : s, ∃ n : ℕ, ((r : R) ^ n : R) • x ∈ M') : x ∈ M'\n\nGiven s, a generating set of R, to check that an x : M falls in a submodule M' of x, we only need to show that r ^ n • x ∈ M' for some n for each r : s.\n\n文件：RingTheory/Ideal/Operations\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Operations",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Operations.lean",
  "formal": true,
  "lean": {
   "full": "mem_of_span_eq_top_of_smul_pow_mem",
   "kind": "theorem",
   "signature": "(M' : Submodule R M) (s : Set R) (hs : Ideal.span s = ⊤) (x : M) (H : ∀ r : s, ∃ n : ℕ, ((r : R) ^ n : R) • x ∈ M') : x ∈ M'",
   "file": "Mathlib/RingTheory/Ideal/Operations.lean"
  }
 },
 {
  "id": "ml-polynomial-monic-irreducible-of-irreducible-map-of-isp-c38df1f3",
  "latex": "Irreducible f",
  "name": "Polynomial.Monic.irreducible_of_irreducible_map_of_isPrime_nilradical",
  "en": "Polynomial.Monic.irreducible_of_irreducible_map_of_isPrime_nilradical",
  "importance": 0.8,
  "family": "foundation",
  "summary": "A polynomial over an irreducible ring R is irreducible if it is monic and irreducible after mapping into an integral domain S (https://math.stackexchange.com/a/4843432/235999). A g",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.Monic.irreducible_of_irreducible_map_of_isPrime_nilradical\n类型签名：{R S : Type*} [CommRing R] [(nilradical R).IsPrime] [CommRing S] [IsDomain S] (φ : R →+* S) (f : R[X]) (hm : f.Monic) (hi : Irreducible (f.map φ)) : Irreducible f\n\nA polynomial over an irreducible ring R is irreducible if it is monic and irreducible after mapping into an integral domain S (https://math.stackexchange.com/a/4843432/235999). A generalization to Polynomial.Monic.irreducible_of_irreducible_map.\n\n文件：RingTheory/Polynomial/IrreducibleRing\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/IrreducibleRing",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/IrreducibleRing.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.Monic.irreducible_of_irreducible_map_of_isPrime_nilradical",
   "kind": "theorem",
   "signature": "{R S : Type*} [CommRing R] [(nilradical R).IsPrime] [CommRing S] [IsDomain S] (φ : R →+* S) (f : R[X]) (hm : f.Monic) (hi : Irreducible (f.map φ)) : Irreducible f",
   "file": "Mathlib/RingTheory/Polynomial/IrreducibleRing.lean"
  }
 },
 {
  "id": "ml-of-linearequiv",
  "latex": "FaithfullyFlat R N",
  "name": "of_linearEquiv",
  "en": "of_linearEquiv",
  "importance": 0.75,
  "family": "map",
  "summary": "If M is a faithfully flat R-module and N is R-linearly isomorphic to M, then N is faithfully flat.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：of_linearEquiv\n类型签名：{N : Type*} [AddCommGroup N] [Module R N] [FaithfullyFlat R M] (e : N ≃ₗ[R] M) : FaithfullyFlat R N\n\nIf M is a faithfully flat R-module and N is R-linearly isomorphic to M, then N is faithfully flat.\n\n文件：RingTheory/Flat/FaithfullyFlat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/FaithfullyFlat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "of_linearEquiv",
   "kind": "lemma",
   "signature": "{N : Type*} [AddCommGroup N] [Module R N] [FaithfullyFlat R M] (e : N ≃ₗ[R] M) : FaithfullyFlat R N",
   "file": "Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean"
  }
 },
 {
  "id": "ml-islocalring-minpoly-map-residue",
  "latex": ".map (residue R) = minpoly (ResidueField R) (residue S β)",
  "name": "minpoly_map_residue",
  "en": "IsLocalRing.minpoly_map_residue",
  "importance": 0.8,
  "family": "map",
  "summary": "For a monogenic étale extension of local rings, the minimal polynomial of β maps to the minimal polynomial of β mod m_S over the residue field.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.minpoly_map_residue\n类型签名：[Algebra.Etale R S] {β : S} (hadj : Algebra.adjoin R {β} = ⊤) : (minpoly R β).map (residue R) = minpoly (ResidueField R) (residue S β)\n\nFor a monogenic étale extension of local rings, the minimal polynomial of β maps to the minimal polynomial of β mod m_S over the residue field.\n\n文件：RingTheory/LocalRing/Etale\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/Etale",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/Etale.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.minpoly_map_residue",
   "kind": "lemma",
   "signature": "[Algebra.Etale R S] {β : S} (hadj : Algebra.adjoin R {β} = ⊤) : (minpoly R β).map (residue R) = minpoly (ResidueField R) (residue S β)",
   "file": "Mathlib/RingTheory/LocalRing/Etale.lean"
  }
 },
 {
  "id": "ml-irreducible",
  "latex": "Irreducible f",
  "name": "irreducible",
  "en": "irreducible",
  "importance": 0.75,
  "family": "foundation",
  "summary": "If a primitive f satisfies f.IsEisensteinAt 𝓟, where 𝓟.IsPrime, then f is irreducible.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：irreducible\n类型签名：(hf : f.IsEisensteinAt 𝓟) (hprime : 𝓟.IsPrime) (hu : f.IsPrimitive) (hfd0 : 0 < f.natDegree) : Irreducible f\n\nIf a primitive f satisfies f.IsEisensteinAt 𝓟, where 𝓟.IsPrime, then f is irreducible.\n\n文件：RingTheory/Polynomial/Eisenstein/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Eisenstein/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Eisenstein/Basic.lean",
  "formal": true,
  "lean": {
   "full": "irreducible",
   "kind": "theorem",
   "signature": "(hf : f.IsEisensteinAt 𝓟) (hprime : 𝓟.IsPrime) (hu : f.IsPrimitive) (hfd0 : 0 < f.natDegree) : Irreducible f",
   "file": "Mathlib/RingTheory/Polynomial/Eisenstein/Basic.lean"
  }
 },
 {
  "id": "ml-polynomial-exists-min-eq-gaussnorm",
  "latex": "∃ i, p.gaussNorm v c = v (p.coeff i) * c ^ i ∧ ∀ j, j < i → v (p.coeff j) * c ^ j < p.gaussNorm v c",
  "name": "exists_min_eq_gaussNorm",
  "en": "Polynomial.exists_min_eq_gaussNorm",
  "importance": 0.8,
  "family": "foundation",
  "summary": "If v is a nonnegative function with v 0 = 0 and c is nonnegative, there exists a minimal index i such that the Gauss norm of p at c is attained at i.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.exists_min_eq_gaussNorm\n类型签名：(p : R[X]) (hc : 0 ≤ c) : ∃ i, p.gaussNorm v c = v (p.coeff i) * c ^ i ∧ ∀ j, j < i → v (p.coeff j) * c ^ j < p.gaussNorm v c\n\nIf v is a nonnegative function with v 0 = 0 and c is nonnegative, there exists a minimal index i such that the Gauss norm of p at c is attained at i.\n\n文件：RingTheory/Polynomial/GaussNorm\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/GaussNorm",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/GaussNorm.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.exists_min_eq_gaussNorm",
   "kind": "lemma",
   "signature": "(p : R[X]) (hc : 0 ≤ c) : ∃ i, p.gaussNorm v c = v (p.coeff i) * c ^ i ∧ ∀ j, j < i → v (p.coeff j) * c ^ j < p.gaussNorm v c",
   "file": "Mathlib/RingTheory/Polynomial/GaussNorm.lean"
  }
 },
 {
  "id": "ml-one-tmul-eq-zero-iff",
  "latex": "⊗ₜ m = 0 ↔ m = 0",
  "name": "one_tmul_eq_zero_iff",
  "en": "one_tmul_eq_zero_iff",
  "importance": 0.75,
  "family": "map",
  "summary": "If A is a faithfully flat R-algebra, and m is a term of an R-module M, then 1 ⊗ₜ[R] m = 0 if and only if m = 0.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：one_tmul_eq_zero_iff\n类型签名：{A : Type*} [Ring A] [Algebra R A] [FaithfullyFlat R A] (m : M) : (1 : A) ⊗ₜ[R] m = 0 ↔ m = 0\n\nIf A is a faithfully flat R-algebra, and m is a term of an R-module M, then 1 ⊗ₜ[R] m = 0 if and only if m = 0.\n\n文件：RingTheory/Flat/FaithfullyFlat/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Flat/FaithfullyFlat/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean",
  "formal": true,
  "lean": {
   "full": "one_tmul_eq_zero_iff",
   "kind": "theorem",
   "signature": "{A : Type*} [Ring A] [Algebra R A] [FaithfullyFlat R A] (m : M) : (1 : A) ⊗ₜ[R] m = 0 ↔ m = 0",
   "file": "Mathlib/RingTheory/Flat/FaithfullyFlat/Basic.lean"
  }
 },
 {
  "id": "ml-islocalring-local-hom-tfae",
  "latex": "List.TFAE",
  "name": "local_hom_tfae",
  "en": "IsLocalRing.local_hom_tfae",
  "importance": 0.79,
  "family": "foundation",
  "summary": "A ring homomorphism between local rings is a local ring hom iff it reflects units, i.e. any preimage of a unit is still a unit.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalRing.local_hom_tfae\n类型签名：(f : R →+* S) : List.TFAE [IsLocalHom f, f '' maximalIdeal R ⊆ maximalIdeal S, (maximalIdeal R).map f ≤ maximalIdeal S, maximalIdeal R ≤ (maximalIdeal S).comap f, (maximalIdeal S).comap f = maximalIdeal R]\n\nA ring homomorphism between local rings is a local ring hom iff it reflects units, i.e. any preimage of a unit is still a unit.\n\n文件：RingTheory/LocalRing/RingHom/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/LocalRing/RingHom/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/LocalRing/RingHom/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalRing.local_hom_tfae",
   "kind": "theorem",
   "signature": "(f : R →+* S) : List.TFAE [IsLocalHom f, f '' maximalIdeal R ⊆ maximalIdeal S, (maximalIdeal R).map f ≤ maximalIdeal S, maximalIdeal R ≤ (maximalIdeal S).comap f, (maximalIdeal S).comap f = maximalIdeal R]",
   "file": "Mathlib/RingTheory/LocalRing/RingHom/Basic.lean"
  }
 },
 {
  "id": "ml-ideal-pi-tensorproductmk-quotient-surjective",
  "latex": "Surjective (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1)",
  "name": "pi_tensorProductMk_quotient_surjective",
  "en": "Ideal.pi_tensorProductMk_quotient_surjective",
  "importance": 0.73,
  "family": "foundation",
  "summary": "A form of Chinese remainder theorem for modules, part I: if ideals Iᵢ of R are pairwise coprime, then for any R-module M, the natural map M → Πᵢ (R ⧸ Iᵢ) ⊗[R] M is surjective.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.pi_tensorProductMk_quotient_surjective\n类型签名：: Surjective (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1)\n\nA form of Chinese remainder theorem for modules, part I: if ideals Iᵢ of R are pairwise coprime, then for any R-module M, the natural map M → Πᵢ (R ⧸ Iᵢ) ⊗[R] M is surjective.\n\n文件：RingTheory/Ideal/Quotient/ChineseRemainder\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/ChineseRemainder",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/ChineseRemainder.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.pi_tensorProductMk_quotient_surjective",
   "kind": "theorem",
   "signature": ": Surjective (LinearMap.pi fun i ↦ TensorProduct.mk R (R ⧸ I i) M 1)",
   "file": "Mathlib/RingTheory/Ideal/Quotient/ChineseRemainder.lean"
  }
 },
 {
  "id": "ml-comap-symm",
  "latex": "I.comap f.symm = I.map f",
  "name": "comap_symm",
  "en": "comap_symm",
  "importance": 0.66,
  "family": "foundation",
  "summary": "If f : R ≃+* S is a ring isomorphism and I : Ideal R, then comap f.symm I = map f I.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：comap_symm\n类型签名：{I : Ideal R} (f : R ≃+* S) : I.comap f.symm = I.map f\n\nIf f : R ≃+* S is a ring isomorphism and I : Ideal R, then comap f.symm I = map f I.\n\n文件：RingTheory/Ideal/Maps\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Maps",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Maps.lean",
  "formal": true,
  "lean": {
   "full": "comap_symm",
   "kind": "theorem",
   "signature": "{I : Ideal R} (f : R ≃+* S) : I.comap f.symm = I.map f",
   "file": "Mathlib/RingTheory/Ideal/Maps.lean"
  }
 },
 {
  "id": "ml-ringhom-ker-fg-of-localizationspan",
  "latex": "(t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ g : t, (RingHom.ker (Localization.awayMap f g.val)).FG) : (RingHom.ker f).FG",
  "name": "RingHom.ker_fg_of_localizationSpan",
  "en": "RingHom.ker_fg_of_localizationSpan",
  "importance": 0.8,
  "family": "foundation",
  "summary": "To check that the kernel of a ring homomorphism is finitely generated, it suffices to check this after localizing at a spanning set of the source.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：RingHom.ker_fg_of_localizationSpan\n类型签名：(t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ g : t, (RingHom.ker (Localization.awayMap f g.val)).FG) : (RingHom.ker f).FG\n\nTo check that the kernel of a ring homomorphism is finitely generated, it suffices to check this after localizing at a spanning set of the source.\n\n文件：RingTheory/Localization/Finiteness\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Finiteness",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Finiteness.lean",
  "formal": true,
  "lean": {
   "full": "RingHom.ker_fg_of_localizationSpan",
   "kind": "lemma",
   "signature": "(t : Set R) (ht : Ideal.span t = ⊤) (H : ∀ g : t, (RingHom.ker (Localization.awayMap f g.val)).FG) : (RingHom.ker f).FG",
   "file": "Mathlib/RingTheory/Localization/Finiteness.lean"
  }
 },
 {
  "id": "ml-ideal-isnilpotent-induction-on",
  "latex": "(hI : IsNilpotent I) {P : ∀ ⦃S : Type _⦄ , Ideal S → Prop} (h₁ : ∀ ⦃S : Type _⦄ , ∀ I : Ideal S, I ^ 2 = ⊥ → P I) (h₂ : ∀ ⦃S : Type _⦄ , ∀ I …",
  "name": "Ideal.IsNilpotent.induction_on",
  "en": "Ideal.IsNilpotent.induction_on",
  "importance": 0.79,
  "family": "foundation",
  "summary": "Let P be a property on ideals. If P holds for square-zero ideals, and if P I → P (J ⧸ I) → P J, then P holds for all nilpotent ideals.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.IsNilpotent.induction_on\n类型签名：(hI : IsNilpotent I) {P : ∀ ⦃S : Type _⦄ [CommRing S], Ideal S → Prop} (h₁ : ∀ ⦃S : Type _⦄ [CommRing S], ∀ I : Ideal S, I ^ 2 = ⊥ → P I) (h₂ : ∀ ⦃S : Type _⦄ [CommRing S], ∀ I J : Ideal S, I ≤ J → P I → P (J.map (Ideal.Quotient.mk I)) → P J) : P I\n\nLet P be a property on ideals. If P holds for square-zero ideals, and if P I → P (J ⧸ I) → P J, then P holds for all nilpotent ideals.\n\n文件：RingTheory/Ideal/Quotient/Nilpotent\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Quotient/Nilpotent",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Quotient/Nilpotent.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.IsNilpotent.induction_on",
   "kind": "theorem",
   "signature": "(hI : IsNilpotent I) {P : ∀ ⦃S : Type _⦄ [CommRing S], Ideal S → Prop} (h₁ : ∀ ⦃S : Type _⦄ [CommRing S], ∀ I : Ideal S, I ^ 2 = ⊥ → P I) (h₂ : ∀ ⦃S : Type _⦄ [CommRing S], ∀ I J : Ideal S, I ≤ J → P I → P (J.map (Ideal.Quotient.mk I)) → P J) : P I",
   "file": "Mathlib/RingTheory/Ideal/Quotient/Nilpotent.lean"
  }
 },
 {
  "id": "ml-polynomial-sylvesterderiv-updaterow",
  "latex": ".updateRow ⟨2 * f.natDegree - 2,",
  "name": "sylvesterDeriv_updateRow",
  "en": "Polynomial.sylvesterDeriv_updateRow",
  "importance": 0.76,
  "family": "foundation",
  "summary": "We can get the usual Sylvester matrix of f and f.derivative back from the modified one by multiplying the last row by the leading coefficient of f.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Polynomial.sylvesterDeriv_updateRow\n类型签名：(f : R[X]) (hf : 0 < f.natDegree) : (sylvesterDeriv f).updateRow ⟨2 * f.natDegree - 2,\n\nWe can get the usual Sylvester matrix of f and f.derivative back from the modified one by multiplying the last row by the leading coefficient of f.\n\n文件：RingTheory/Polynomial/Resultant/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Polynomial/Resultant/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Resultant/Basic.lean",
  "formal": true,
  "lean": {
   "full": "Polynomial.sylvesterDeriv_updateRow",
   "kind": "lemma",
   "signature": "(f : R[X]) (hf : 0 < f.natDegree) : (sylvesterDeriv f).updateRow ⟨2 * f.natDegree - 2,",
   "file": "Mathlib/RingTheory/Polynomial/Resultant/Basic.lean"
  }
 },
 {
  "id": "ml-homogeneouslocalization-numdensamedeg-ext",
  "latex": "{𝒜 : ι → σ} (x : Submonoid A) {c1 c2 : NumDenSameDeg 𝒜 x} (hdeg : c1.deg = c2.deg) (hnum : (c1.num : A) = c2.num) (hden : (c1.den : A) = c …",
  "name": "ext",
  "en": "HomogeneousLocalization.NumDenSameDeg.ext",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Let x be a submonoid of A, then NumDenSameDeg 𝒜 x is a structure with a numerator and a denominator with same grading such that the denominator is contained in x.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：HomogeneousLocalization.NumDenSameDeg.ext\n类型签名：{𝒜 : ι → σ} (x : Submonoid A) {c1 c2 : NumDenSameDeg 𝒜 x} (hdeg : c1.deg = c2.deg) (hnum : (c1.num : A) = c2.num) (hden : (c1.den : A) = c2.den) : c1 = c2\n\nLet x be a submonoid of A, then NumDenSameDeg 𝒜 x is a structure with a numerator and a denominator with same grading such that the denominator is contained in x.\n\n文件：RingTheory/GradedAlgebra/HomogeneousLocalization\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/GradedAlgebra/HomogeneousLocalization",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean",
  "formal": true,
  "lean": {
   "full": "HomogeneousLocalization.NumDenSameDeg.ext",
   "kind": "theorem",
   "signature": "{𝒜 : ι → σ} (x : Submonoid A) {c1 c2 : NumDenSameDeg 𝒜 x} (hdeg : c1.deg = c2.deg) (hnum : (c1.num : A) = c2.num) (hden : (c1.den : A) = c2.den) : c1 = c2",
   "file": "Mathlib/RingTheory/GradedAlgebra/HomogeneousLocalization.lean"
  }
 },
 {
  "id": "ml-ideal-height-eq-ringkrulldim-iff",
  "latex": "I.height = ringKrullDim R ↔ I = IsLocalRing.maximalIdeal R",
  "name": "Ideal.height_eq_ringKrullDim_iff",
  "en": "Ideal.height_eq_ringKrullDim_iff",
  "importance": 0.8,
  "family": "foundation",
  "summary": "For a local ring with finite Krull dimension, a prime ideal has height equal to the Krull dimension if and only if it is the maximal ideal.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：Ideal.height_eq_ringKrullDim_iff\n类型签名：[FiniteRingKrullDim R] [IsLocalRing R] {I : Ideal R} [I.IsPrime] : I.height = ringKrullDim R ↔ I = IsLocalRing.maximalIdeal R\n\nFor a local ring with finite Krull dimension, a prime ideal has height equal to the Krull dimension if and only if it is the maximal ideal.\n\n文件：RingTheory/Ideal/Height\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Ideal/Height",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Ideal/Height.lean",
  "formal": true,
  "lean": {
   "full": "Ideal.height_eq_ringKrullDim_iff",
   "kind": "theorem",
   "signature": "[FiniteRingKrullDim R] [IsLocalRing R] {I : Ideal R} [I.IsPrime] : I.height = ringKrullDim R ↔ I = IsLocalRing.maximalIdeal R",
   "file": "Mathlib/RingTheory/Ideal/Height.lean"
  }
 },
 {
  "id": "ml-islocalization-map-injective-of-injective",
  "latex": "Function.Injective (map Sₘ f hf : Rₘ →+* Sₘ)",
  "name": "map_injective_of_injective'",
  "en": "IsLocalization.map_injective_of_injective'",
  "importance": 0.8,
  "family": "foundation",
  "summary": "Another version of IsLocalization.map_injective_of_injective that is more general for the choice of the localization submonoid but requires it does not contain zero.",
  "detail": "Lean 4 形式化陈述（mathlib4）\n\n定理名：IsLocalization.map_injective_of_injective'\n类型签名：{f : R →+* S} {Rₘ : Type*} [CommRing Rₘ] [Algebra R Rₘ] [IsLocalization M Rₘ] (Sₘ : Type*) {N : Submonoid S} [CommRing Sₘ] [Algebra S Sₘ] [IsLocalization N Sₘ] (hf : M ≤ Submonoid.comap f N) (hN : 0 ∉ N) [IsDomain S] (hf' : Function.Injective f) : Function.Injective (map Sₘ f hf : Rₘ →+* Sₘ)\n\nAnother version of IsLocalization.map_injective_of_injective that is more general for the choice of the localization submonoid but requires it does not contain zero.\n\n文件：RingTheory/Localization/Basic\n⚠ 本条目由 Lean 源码自动抽取；正确性由 mathlib 的 Lean 内核保证，\n  而非本知识库的编辑。类型签名是 Lean 语法，不是 LaTeX。",
  "source": "mathlib4 · RingTheory/Localization/Basic",
  "url": "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Localization/Basic.lean",
  "formal": true,
  "lean": {
   "full": "IsLocalization.map_injective_of_injective'",
   "kind": "theorem",
   "signature": "{f : R →+* S} {Rₘ : Type*} [CommRing Rₘ] [Algebra R Rₘ] [IsLocalization M Rₘ] (Sₘ : Type*) {N : Submonoid S} [CommRing Sₘ] [Algebra S Sₘ] [IsLocalization N Sₘ] (hf : M ≤ Submonoid.comap f N) (hN : 0 ∉ N) [IsDomain S] (hf' : Function.Injective f) : Function.Injective (map Sₘ f hf : Rₘ →+* Sₘ)",
   "file": "Mathlib/RingTheory/Localization/Basic.lean"
  }
 }
]

export const MATHLIB_LINKS = [["ml-projectivespectrum-proj-islocalization-atprime","ml-projectivespectrum-proj-toopen-tospec-val-c-app",0.22,"同文件","related"],
  ["ml-ext-of-isdominant","ml-ext-of-isdominant-of-isseparated",0.22,"同文件","related"],
  ["ml-topologically-respectsiso","ml-topologically-iso-le",0.22,"同文件","related"],
  ["ml-topologically-respectsiso","ml-topologically-iszariskilocalattarget",0.22,"同文件","related"],
  ["ml-topologically-iso-le","ml-topologically-iszariskilocalattarget",0.22,"同文件","related"],
  ["ml-topologically-iso-le","ml-topologically-isstableundercomposition",0.22,"同文件","related"],
  ["ml-topologically-iszariskilocalattarget","ml-topologically-isstableundercomposition",0.22,"同文件","related"],
  ["ml-topologically-iszariskilocalattarget","ml-topologically-iszariskilocalatsource",0.22,"同文件","related"],
  ["ml-topologically-isstableundercomposition","ml-topologically-iszariskilocalatsource",0.22,"同文件","related"],
  ["ml-topologically-isstableundercomposition","ml-stalkwise-respectsiso",0.22,"同文件","related"],
  ["ml-topologically-iszariskilocalatsource","ml-stalkwise-respectsiso",0.22,"同文件","related"],
  ["ml-topologically-iszariskilocalatsource","ml-stalkwiseiszariskilocalattarget-of-respectsiso",0.22,"同文件","related"],
  ["ml-stalkwise-respectsiso","ml-stalkwiseiszariskilocalattarget-of-respectsiso",0.22,"同文件","related"],
  ["ml-stalkwise-respectsiso","ml-stalkwise-iszariskilocalatsource-of-respectsiso",0.22,"同文件","related"],
  ["ml-stalkwiseiszariskilocalattarget-of-respectsiso","ml-stalkwise-iszariskilocalatsource-of-respectsiso",0.22,"同文件","related"],
  ["ml-stalkwiseiszariskilocalattarget-of-respectsiso","ml-affinetargetmorphismproperty-isstableunderbasechange-o-d450810a",0.22,"同文件","related"],
  ["ml-stalkwise-iszariskilocalatsource-of-respectsiso","ml-affinetargetmorphismproperty-isstableunderbasechange-o-d450810a",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-iff","ml-hasaffineproperty-affineand-containsidentities",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-iff","ml-hasaffineproperty-affineand-isstableunderbasechange",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-containsidentities","ml-hasaffineproperty-affineand-isstableunderbasechange",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-containsidentities","ml-algebraicgeometry-affineand-islocal",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-isstableunderbasechange","ml-algebraicgeometry-affineand-islocal",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-isstableunderbasechange","ml-hasaffineproperty-affineand-isstableundercomposition",0.22,"同文件","related"],
  ["ml-algebraicgeometry-affineand-islocal","ml-hasaffineproperty-affineand-isstableundercomposition",0.22,"同文件","related"],
  ["ml-algebraicgeometry-affineand-islocal","ml-algebraicgeometry-affineand-respectsiso",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-isstableundercomposition","ml-algebraicgeometry-affineand-respectsiso",0.22,"同文件","related"],
  ["ml-hasaffineproperty-affineand-isstableundercomposition","ml-algebraicgeometry-targetaffinelocally-affineand-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-affineand-respectsiso","ml-algebraicgeometry-targetaffinelocally-affineand-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-affineand-respectsiso","ml-algebraicgeometry-affineand-isstableunderbasechange",0.22,"同文件","related"],
  ["ml-algebraicgeometry-targetaffinelocally-affineand-iff","ml-algebraicgeometry-affineand-isstableunderbasechange",0.22,"同文件","related"],
  ["ml-algebraicgeometry-sourceaffinelocally-respectsiso","ml-hasringhomproperty-stalkmap",0.22,"同文件","related"],
  ["ml-algebraicgeometry-sourceaffinelocally-respectsiso","ml-algebraicgeometry-exists-affineopens-le-apple-of-apple",0.22,"同文件","related"],
  ["ml-hasringhomproperty-stalkmap","ml-algebraicgeometry-exists-affineopens-le-apple-of-apple",0.22,"同文件","related"],
  ["ml-hasringhomproperty-stalkmap","ml-hasringhomproperty-of-stalkmap",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-affineopens-le-apple-of-apple","ml-hasringhomproperty-of-stalkmap",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-affineopens-le-apple-of-apple","ml-hasringhomproperty-stalkmap-of-respectsiso",0.22,"同文件","related"],
  ["ml-hasringhomproperty-of-stalkmap","ml-hasringhomproperty-stalkmap-of-respectsiso",0.22,"同文件","related"],
  ["ml-hasringhomproperty-of-stalkmap","ml-algebraicgeometry-exists-basicopen-le-apple-of-apple-o-8fa658d3",0.22,"同文件","related"],
  ["ml-hasringhomproperty-stalkmap-of-respectsiso","ml-algebraicgeometry-exists-basicopen-le-apple-of-apple-o-8fa658d3",0.22,"同文件","related"],
  ["ml-hasringhomproperty-stalkmap-of-respectsiso","ml-hasringhomproperty-respects-isopenimmersion",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-basicopen-le-apple-of-apple-o-8fa658d3","ml-hasringhomproperty-respects-isopenimmersion",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-basicopen-le-apple-of-apple-o-8fa658d3","ml-hasringhomproperty-iff-exists-apple-locally",0.22,"同文件","related"],
  ["ml-hasringhomproperty-respects-isopenimmersion","ml-hasringhomproperty-iff-exists-apple-locally",0.22,"同文件","related"],
  ["ml-hasringhomproperty-respects-isopenimmersion","ml-hasringhomproperty-iff-exists-apple",0.22,"同文件","related"],
  ["ml-hasringhomproperty-iff-exists-apple-locally","ml-hasringhomproperty-iff-exists-apple",0.22,"同文件","related"],
  ["ml-algebraicgeometry-smooth-iff-forall-exists-isstandards-5b276a66","ml-algebraicgeometry-smoothofrelativedimension-smooth",0.22,"同文件","related"],
  ["ml-algebraicgeometry-quasicompactcover-of-isopenmap","ml-algebraicgeometry-isaffineopen-iscompactopencovered",0.22,"同文件","related"],
  ["ml-algebraicgeometry-quasicompactcover-of-isopenmap","ml-algebraicgeometry-quasicompactcover-of-hom",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-iscompactopencovered","ml-algebraicgeometry-quasicompactcover-of-hom",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-islocallyclosed-range","ml-algebraicgeometry-scheme-hom-liftcoborder",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-islocallyclosed-range","ml-algebraicgeometry-isimmersion-isimmersion-iff-exists",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-liftcoborder","ml-algebraicgeometry-isimmersion-isimmersion-iff-exists",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-liftcoborder","ml-algebraicgeometry-isimmersion-ispullback-toimage-liftc-c1af745b",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isimmersion-isimmersion-iff-exists","ml-algebraicgeometry-isimmersion-ispullback-toimage-liftc-c1af745b",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isimmersion-isimmersion-iff-exists","ml-algebraicgeometry-isimmersion-isimmersion-iff-exists-o-99225e5b",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isimmersion-ispullback-toimage-liftc-c1af745b","ml-algebraicgeometry-isimmersion-isimmersion-iff-exists-o-99225e5b",0.22,"同文件","related"],
  ["ml-restrict-obj","ml-restrict-map",0.22,"同文件","related"],
  ["ml-hasaffineproperty-of-iszariskilocalattarget","ml-algebraicgeometry-iszariskilocalatsource-iff-exists-resle",0.22,"同文件","related"],
  ["ml-hasaffineproperty-of-iszariskilocalattarget","ml-algebraicgeometry-iszariskilocalatsource-resle",0.22,"同文件","related"],
  ["ml-algebraicgeometry-iszariskilocalatsource-iff-exists-resle","ml-algebraicgeometry-iszariskilocalatsource-resle",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-isopenmap","ml-algebraicgeometry-isopenmap-of-generalizingmap",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-isclosedmap","ml-algebraicgeometry-compactspace-of-universallyclosed",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-inf","ml-algebraicgeometry-isaffineopen-preimage",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-inf","ml-algebraicgeometry-isaffinehom-of-isinducing",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-preimage","ml-algebraicgeometry-isaffinehom-of-isinducing",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-preimage","ml-algebraicgeometry-isaffineopen-of-isaffineopen-basicopen",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffinehom-of-isinducing","ml-algebraicgeometry-isaffineopen-of-isaffineopen-basicopen",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-eq-inf","ml-algebraicgeometry-isclosedimmersion-spec-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-eq-inf","ml-algebraicgeometry-isdominant-of-of-apptop-injective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-spec-of-surjective","ml-algebraicgeometry-isdominant-of-of-apptop-injective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-spec-of-surjective","ml-algebraicgeometry-isclosedimmersion-of-comp-isclosedim-eef334bd",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isdominant-of-of-apptop-injective","ml-algebraicgeometry-isclosedimmersion-of-comp-isclosedim-eef334bd",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isdominant-of-of-apptop-injective","ml-algebraicgeometry-stalkmap-injective-of-isopenmap-of-i-55ccdf80",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-of-comp-isclosedim-eef334bd","ml-algebraicgeometry-stalkmap-injective-of-isopenmap-of-i-55ccdf80",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-of-comp-isclosedim-eef334bd","ml-isiso-of-isclosedimmersion-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-stalkmap-injective-of-isopenmap-of-i-55ccdf80","ml-isiso-of-isclosedimmersion-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-stalkmap-injective-of-isopenmap-of-i-55ccdf80","ml-algebraicgeometry-isclosedimmersion-isiso-of-injective-351fc71b",0.22,"同文件","related"],
  ["ml-isiso-of-isclosedimmersion-of-surjective","ml-algebraicgeometry-isclosedimmersion-isiso-of-injective-351fc71b",0.22,"同文件","related"],
  ["ml-isiso-of-isclosedimmersion-of-surjective","ml-algebraicgeometry-isclosedimmersion-isaffine-surjectiv-0fd23ff2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-isiso-of-injective-351fc71b","ml-algebraicgeometry-isclosedimmersion-isaffine-surjectiv-0fd23ff2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-isiso-of-injective-351fc71b","ml-algebraicgeometry-isclosedimmersion-of-surjective-of-i-90f45d2c",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isclosedimmersion-isaffine-surjectiv-0fd23ff2","ml-algebraicgeometry-isclosedimmersion-of-surjective-of-i-90f45d2c",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isiso-pushoutsection-iff","ml-algebraicgeometry-flat-epi-of-flat-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isiso-pushoutsection-iff","ml-algebraicgeometry-flat-isquotientmap-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-flat-epi-of-flat-of-surjective","ml-algebraicgeometry-flat-isquotientmap-of-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-naturality","ml-algebraicgeometry-scheme-forget-obj",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-naturality","ml-algebraicgeometry-scheme-mem-basicopen",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-forget-obj","ml-algebraicgeometry-scheme-mem-basicopen",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isproper-eq","ml-algebraicgeometry-finite-apptop-of-universallyclosed",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isproper-eq","ml-algebraicgeometry-isfield-of-universallyclosed",0.22,"同文件","related"],
  ["ml-algebraicgeometry-finite-apptop-of-universallyclosed","ml-algebraicgeometry-isfield-of-universallyclosed",0.22,"同文件","related"],
  ["ml-algebraicgeometry-finite-apptop-of-universallyclosed","ml-algebraicgeometry-isintegral-apptop-of-universallyclosed",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isfield-of-universallyclosed","ml-algebraicgeometry-isintegral-apptop-of-universallyclosed",0.22,"同文件","related"],
  ["ml-dominant-eq-topologically","ml-surjective-eq-topologically",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-etale-forget-mk","ml-algebraicgeometry-etale-of-comp",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opencover-ext-elem","ml-algebraicgeometry-scheme-zero-of-zero-cover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opencover-ext-elem","ml-algebraicgeometry-scheme-isnilpotent-of-isnilpotent-cover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zero-of-zero-cover","ml-algebraicgeometry-scheme-isnilpotent-of-isnilpotent-cover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zero-of-zero-cover","ml-algebraicgeometry-scheme-opencover-isopencover-opensrange",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isnilpotent-of-isnilpotent-cover","ml-algebraicgeometry-scheme-opencover-isopencover-opensrange",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isstableunderbasechange-of-pullback--4d95981f","ml-algebraicgeometry-iszariskilocalattarget-descendsalong",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isstableunderbasechange-of-pullback--4d95981f","ml-algebraicgeometry-scheme-exists-hom-isaffine-of-iszari-c4f0b6a6",0.22,"同文件","related"],
  ["ml-algebraicgeometry-iszariskilocalattarget-descendsalong","ml-algebraicgeometry-scheme-exists-hom-isaffine-of-iszari-c4f0b6a6",0.22,"同文件","related"],
  ["ml-algebraicgeometry-islocaliso-eq-iinf","ml-algebraicgeometry-islocaliso-le-of-iszariskilocalatsource",0.22,"同文件","related"],
  ["ml-algebraicgeometry-islocaliso-eq-iinf","ml-algebraicgeometry-islocaliso-eq-sourcelocalclosure-iso-828062e5",0.22,"同文件","related"],
  ["ml-algebraicgeometry-islocaliso-le-of-iszariskilocalatsource","ml-algebraicgeometry-islocaliso-eq-sourcelocalclosure-iso-828062e5",0.22,"同文件","related"],
  ["ml-algebraicgeometry-quasicompact-iff-isspectralmap","ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--83e9a379",0.22,"同文件","related"],
  ["ml-algebraicgeometry-quasicompact-iff-isspectralmap","ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq-bot",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--83e9a379","ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq-bot",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--83e9a379","ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--59e2398d",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq-bot","ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--59e2398d",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq-bot","ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq--cec20ad7",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--59e2398d","ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq--cec20ad7",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-zerolocus-eq-univ-iff-subset--59e2398d","ml-algebraicgeometry-exists-pow-mul-eq-zero-of-res-basico-b6c4c302",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isnilpotent-iff-basicopen-eq--cec20ad7","ml-algebraicgeometry-exists-pow-mul-eq-zero-of-res-basico-b6c4c302",0.22,"同文件","related"],
  ["ml-isunit","ml-coe",0.22,"同文件","related"],
  ["ml-isunit","ml-j-eq-zero-iff",0.22,"同文件","related"],
  ["ml-coe","ml-j-eq-zero-iff",0.22,"同文件","related"],
  ["ml-coe","ml-j-eq-zero-iff-of-char-two",0.22,"同文件","related"],
  ["ml-j-eq-zero-iff","ml-j-eq-zero-iff-of-char-two",0.22,"同文件","related"],
  ["ml-j-eq-zero-iff","ml-j-eq-zero-iff-of-char-three",0.22,"同文件","related"],
  ["ml-j-eq-zero-iff-of-char-two","ml-j-eq-zero-iff-of-char-three",0.22,"同文件","related"],
  ["ml-comap-id-eq-map","ml-comap-id",0.22,"同文件","related"],
  ["ml-exists-preimage-pullback","ml-triplet-exists-preimage",0.22,"同文件","related"],
  ["ml-exists-preimage-pullback","ml-carrierequiv-eq-iff",0.22,"同文件","related"],
  ["ml-triplet-exists-preimage","ml-carrierequiv-eq-iff",0.22,"同文件","related"],
  ["ml-triplet-exists-preimage","ml-pullbackcomparison-forget-surjective",0.22,"同文件","related"],
  ["ml-carrierequiv-eq-iff","ml-pullbackcomparison-forget-surjective",0.22,"同文件","related"],
  ["ml-pullbackspeciso-inv-snd","ml-pullbackspeciso-inv-fst",0.22,"同文件","related"],
  ["ml-pullbackspeciso-inv-snd","ml-pullbackspeciso-hom-snd",0.22,"同文件","related"],
  ["ml-pullbackspeciso-inv-fst","ml-pullbackspeciso-hom-snd",0.22,"同文件","related"],
  ["ml-pullbackspeciso-inv-fst","ml-pullbackspeciso-hom-fst",0.22,"同文件","related"],
  ["ml-pullbackspeciso-hom-snd","ml-pullbackspeciso-hom-fst",0.22,"同文件","related"],
  ["ml-pullbackspeciso-hom-snd","ml-algebraicgeometry-scheme-pullback-lift-comp",0.22,"同文件","related"],
  ["ml-pullbackspeciso-hom-fst","ml-algebraicgeometry-scheme-pullback-lift-comp",0.22,"同文件","related"],
  ["ml-algebraicgeometry-reduce-to-affine-global","ml-algebraicgeometry-isfield-stalk-of-closure-mem-irreduc-3c1413f9",0.22,"同文件","related"],
  ["ml-algebraicgeometry-ofarrows","ml-algebraicgeometry-scheme-zariskitopology-eq",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spread-out-of-isgerminjective","ml-algebraicgeometry-spread-out-unique-of-isgerminjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spread-out-of-isgerminjective","ml-algebraicgeometry-exists-lift-of-germinjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spread-out-unique-of-isgerminjective","ml-algebraicgeometry-exists-lift-of-germinjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spread-out-unique-of-isgerminjective","ml-algebraicgeometry-scheme-isgerminjective-of-opencover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-lift-of-germinjective","ml-algebraicgeometry-scheme-isgerminjective-of-opencover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-lift-of-germinjective","ml-algebraicgeometry-injective-germ-basicopen",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isgerminjective-of-opencover","ml-algebraicgeometry-injective-germ-basicopen",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-eq","ml-weierstrasscurve-den-duplication-ne-zero-or-num-duplic-63f2f3d3",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-eq","ml-weierstrasscurve-den-duplication-eq-zero-iff",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-ne-zero-or-num-duplic-63f2f3d3","ml-weierstrasscurve-den-duplication-eq-zero-iff",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-ne-zero-or-num-duplic-63f2f3d3","ml-weierstrasscurve-addx-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-eq-zero-iff","ml-weierstrasscurve-addx-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-den-duplication-eq-zero-iff","ml-weierstrasscurve-addx-self-of-y-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-addx-of-x-ne","ml-weierstrasscurve-addx-self-of-y-ne",0.22,"同文件","related"],
  ["ml-algebraicgeometry-eq-of-specmap-comp-eq-of-isaffineopen","ml-algebraicgeometry-scheme-tospec",0.22,"同文件","related"],
  ["ml-algebraicgeometry-eq-of-specmap-comp-eq-of-isaffineopen","ml-algebraicgeometry-isup-basicopen-of-span-eq-top",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-tospec","ml-algebraicgeometry-isup-basicopen-of-span-eq-top",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-tospec","ml-algebraicgeometry-isaffineopen-isup-basicopen-eq-self-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isup-basicopen-of-span-eq-top","ml-algebraicgeometry-isaffineopen-isup-basicopen-eq-self-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isup-basicopen-of-span-eq-top","ml-algebraicgeometry-scheme-isospec-image-zerolocus",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-isup-basicopen-eq-self-iff","ml-algebraicgeometry-scheme-isospec-image-zerolocus",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-isup-basicopen-eq-self-iff","ml-algebraicgeometry-scheme-eq-zerolocus-of-isclosed-of-i-11543488",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isospec-image-zerolocus","ml-algebraicgeometry-scheme-eq-zerolocus-of-isclosed-of-i-11543488",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isospec-image-zerolocus","ml-algebraicgeometry-isaffineopen-primeidealof-ismaximal--6e2be180",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-eq-zerolocus-of-isclosed-of-i-11543488","ml-algebraicgeometry-isaffineopen-primeidealof-ismaximal--6e2be180",0.22,"同文件","related"],
  ["ml-hasgoodreduction-or-hasmultiplicativereduction-or-hasa-7b2988d5","ml-variablechange-integral-of-u-integral",0.22,"同文件","related"],
  ["ml-hasgoodreduction-or-hasmultiplicativereduction-or-hasa-7b2988d5","ml-hasgoodreduction-iff-iselliptic-reduction",0.22,"同文件","related"],
  ["ml-variablechange-integral-of-u-integral","ml-hasgoodreduction-iff-iselliptic-reduction",0.22,"同文件","related"],
  ["ml-scheme-exists","ml-algebraicgeometry-exists-map-eq-top",0.22,"同文件","related"],
  ["ml-scheme-exists","ml-algebraicgeometry-exists-mem-of-isclosed-of-nonempty",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-map-eq-top","ml-algebraicgeometry-exists-mem-of-isclosed-of-nonempty",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-map-eq-top","ml-scheme-exists-isopencover-and-isaffine",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-mem-of-isclosed-of-nonempty","ml-scheme-exists-isopencover-and-isaffine",0.22,"同文件","related"],
  ["ml-algebraicgeometry-exists-mem-of-isclosed-of-nonempty","ml-scheme-exists-isaffine-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isopencover-and-isaffine","ml-scheme-exists-isaffine-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isopencover-and-isaffine","ml-scheme-exists-isquasiaffine-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isaffine-of-islimit","ml-scheme-exists-isquasiaffine-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isaffine-of-islimit","ml-algebraicgeometry-scheme-nonempty-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isquasiaffine-of-islimit","ml-algebraicgeometry-scheme-nonempty-of-islimit",0.22,"同文件","related"],
  ["ml-scheme-exists-isquasiaffine-of-islimit","ml-scheme-opencover-exists-of-iscofiltered-of-finite",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-nonempty-of-islimit","ml-scheme-opencover-exists-of-iscofiltered-of-finite",0.22,"同文件","related"],
  ["ml-hom-residuedegree-eq-finrank","ml-hom-residuefieldisooffield-inv-residuefieldmap",0.22,"同文件","related"],
  ["ml-hom-residuedegree-eq-finrank","ml-spectoequivoffield-eq-iff",0.22,"同文件","related"],
  ["ml-hom-residuefieldisooffield-inv-residuefieldmap","ml-spectoequivoffield-eq-iff",0.22,"同文件","related"],
  ["ml-hom-residuefieldisooffield-inv-residuefieldmap","ml-algebraicgeometry-scheme-evaluation-eq-zero-iff-notmem-e7e97d2c",0.22,"同文件","related"],
  ["ml-spectoequivoffield-eq-iff","ml-algebraicgeometry-scheme-evaluation-eq-zero-iff-notmem-e7e97d2c",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isnoetherianring-of-away","ml-islocallynoetherian-iff-of-isup-eq-top",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isnoetherianring-of-away","ml-islocallynoetherian-iff-opencover",0.22,"同文件","related"],
  ["ml-islocallynoetherian-iff-of-isup-eq-top","ml-islocallynoetherian-iff-opencover",0.22,"同文件","related"],
  ["ml-islocallynoetherian-iff-of-isup-eq-top","ml-isnoetherian-spec",0.22,"同文件","related"],
  ["ml-islocallynoetherian-iff-opencover","ml-isnoetherian-spec",0.22,"同文件","related"],
  ["ml-islocallynoetherian-iff-opencover","ml-isnoetherian-iff-of-finite-isup-eq-top",0.22,"同文件","related"],
  ["ml-isnoetherian-spec","ml-isnoetherian-iff-of-finite-isup-eq-top",0.22,"同文件","related"],
  ["ml-isnoetherian-spec","ml-islocallynoetherian-of-affine-cover",0.22,"同文件","related"],
  ["ml-isnoetherian-iff-of-finite-isup-eq-top","ml-islocallynoetherian-of-affine-cover",0.22,"同文件","related"],
  ["ml-isnoetherian-iff-of-finite-isup-eq-top","ml-finite-irreduciblecomponents-of-isnoetherian",0.22,"同文件","related"],
  ["ml-islocallynoetherian-of-affine-cover","ml-finite-irreduciblecomponents-of-isnoetherian",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-map-basechange","ml-weierstrasscurve-point-isroot-twotorsionpolynomial-iff",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-map-basechange","ml-weierstrasscurve-point-xrep-add-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-isroot-twotorsionpolynomial-iff","ml-weierstrasscurve-point-xrep-add-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-isroot-twotorsionpolynomial-iff","ml-weierstrasscurve-point-xrep-sub-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-xrep-add-of-x-ne","ml-weierstrasscurve-point-xrep-sub-of-x-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-xrep-add-of-x-ne","ml-weierstrasscurve-point-isroot-twotorsionpolynomial-of--b887b49e",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-xrep-sub-of-x-ne","ml-weierstrasscurve-point-isroot-twotorsionpolynomial-of--b887b49e",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-xrep-sub-of-x-ne","ml-weierstrasscurve-point-xrep-add-self-of-y-eq",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-isroot-twotorsionpolynomial-of--b887b49e","ml-weierstrasscurve-point-xrep-add-self-of-y-eq",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-isroot-twotorsionpolynomial-of--b887b49e","ml-weierstrasscurve-point-xrep-add-self-of-y-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-point-xrep-add-self-of-y-eq","ml-weierstrasscurve-point-xrep-add-self-of-y-ne",0.22,"同文件","related"],
  ["ml-weierstrasscurve-variablechange-def","ml-weierstrasscurve-variablechange-mul-def",0.22,"同文件","related"],
  ["ml-weierstrasscurve-variablechange-def","ml-weierstrasscurve-variablechange-inv-def",0.22,"同文件","related"],
  ["ml-weierstrasscurve-variablechange-mul-def","ml-weierstrasscurve-variablechange-inv-def",0.22,"同文件","related"],
  ["ml-weierstrasscurve-variablechange-mul-def","ml-weierstrasscurve-variablechange-one-def",0.22,"同文件","related"],
  ["ml-weierstrasscurve-variablechange-inv-def","ml-weierstrasscurve-variablechange-one-def",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-coe-image","ml-algebraicgeometry-scheme-hom-app-invapp",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-coe-image","ml-algebraicgeometry-scheme-hom-appiso-hom",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-app-invapp","ml-algebraicgeometry-scheme-hom-appiso-hom",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-app-invapp","ml-isopenimmersion-app-eq-appiso-inv-app-of-comp-eq",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-hom-appiso-hom","ml-isopenimmersion-app-eq-appiso-inv-app-of-comp-eq",0.22,"同文件","related"],
  ["ml-essimage-hopfspec","ml-essimage-bialgspec",0.22,"同文件","related"],
  ["ml-essimage-hopfspec","ml-essimage-algspec",0.22,"同文件","related"],
  ["ml-essimage-bialgspec","ml-essimage-algspec",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-ispullback-tospec","ml-algebraicgeometry-scheme-isquasiaffine-of-isimmersion",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-ispullback-tospec","ml-algebraicgeometry-scheme-isquasiaffine-of-forall-exist-b3bfa86b",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isquasiaffine-of-isimmersion","ml-algebraicgeometry-scheme-isquasiaffine-of-forall-exist-b3bfa86b",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-grothendiecktopology-eq-inf","ml-algebraicgeometry-scheme-pretopology-eq-inf",0.22,"同文件","related"],
  ["ml-algebraicgeometry-localringhom-comp-stalkiso","ml-algebraicgeometry-isiso-specmap-stalkmap-localization",0.22,"同文件","related"],
  ["ml-algebraicgeometry-islocalizing-of-iso","ml-algebraicgeometry-isiso-fromtilde",0.22,"同文件","related"],
  ["ml-algebraicgeometry-islocalizing-of-iso","ml-isquasicoherent-iff-isiso-fromtilde",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isiso-fromtilde","ml-isquasicoherent-iff-isiso-fromtilde",0.22,"同文件","related"],
  ["ml-nonempty-iscolimit-cofanmk-of","ml-disjoint-opensrange-sigma",0.22,"同文件","related"],
  ["ml-nonempty-iscolimit-cofanmk-of","ml-nonempty-iscolimit-binarycofanmk-of-iscompl",0.22,"同文件","related"],
  ["ml-disjoint-opensrange-sigma","ml-nonempty-iscolimit-binarycofanmk-of-iscompl",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-bot-mem-propqctopology","ml-algebraicgeometry-scheme-propqcprecoverage-le-precoverage",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-bot-mem-propqctopology","ml-algebraicgeometry-scheme-precoverage-le-qcprecoverage--ed8a442c",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-propqcprecoverage-le-precoverage","ml-algebraicgeometry-scheme-precoverage-le-qcprecoverage--ed8a442c",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-smallgrothendiecktopology-eq--f765b943","ml-algebraicgeometry-scheme-overgrothendiecktopology-eq-t-2c88ede1",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-fromspecstalk-eq","ml-spectoequivoflocalring-eq-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-isaffineopen-fromspecstalk-eq","ml-algebraicgeometry-spec-fromspecstalk-eq",0.22,"同文件","related"],
  ["ml-spectoequivoflocalring-eq-iff","ml-algebraicgeometry-spec-fromspecstalk-eq",0.22,"同文件","related"],
  ["ml-weierstrasscurve-jacobian-fin3-def","ml-weierstrasscurve-jacobian-smul-equiv",0.22,"同文件","related"],
  ["ml-weierstrasscurve-jacobian-fin3-def","ml-weierstrasscurve-jacobian-polynomial-relation",0.22,"同文件","related"],
  ["ml-weierstrasscurve-jacobian-smul-equiv","ml-weierstrasscurve-jacobian-polynomial-relation",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opens","ml-algebraicgeometry-pullbackrestrictisorestrict-hom-morp-b295d1ec",0.22,"同文件","related"],
  ["ml-weierstrasscurve-projective-fin3-def","ml-weierstrasscurve-projective-smul-equiv",0.22,"同文件","related"],
  ["ml-weierstrasscurve-projective-fin3-def","ml-weierstrasscurve-projective-polynomial-relation",0.22,"同文件","related"],
  ["ml-weierstrasscurve-projective-smul-equiv","ml-weierstrasscurve-projective-polynomial-relation",0.22,"同文件","related"],
  ["ml-projectivespectrum-gc-set","ml-projectivespectrum-gc-ideal",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-7e762294","ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-5ddfb69e",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-7e762294","ml-algebraicgeometry-scheme-partialmap-equiv-topartialmap-6bf9b239",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-5ddfb69e","ml-algebraicgeometry-scheme-partialmap-equiv-topartialmap-6bf9b239",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-issep-5ddfb69e","ml-algebraicgeometry-scheme-partialmap-ext-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-topartialmap-6bf9b239","ml-algebraicgeometry-scheme-partialmap-ext-iff",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-topartialmap-6bf9b239","ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-domai-8717ce8a",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-ext-iff","ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-domai-8717ce8a",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-ext-iff","ml-algebraicgeometry-scheme-partialmap-torationalmap-surj-f73270f4",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-domai-8717ce8a","ml-algebraicgeometry-scheme-partialmap-torationalmap-surj-f73270f4",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-equiv-iff-of-domai-8717ce8a","ml-algebraicgeometry-scheme-partialmap-fromspecstalkofmem-6926c997",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-torationalmap-surj-f73270f4","ml-algebraicgeometry-scheme-partialmap-fromspecstalkofmem-6926c997",0.22,"同文件","related"],
  ["ml-algebraicgeometry-right-triangle","ml-algebraicgeometry-spec-map-surjective",0.22,"同文件","related"],
  ["ml-algebraicgeometry-right-triangle","ml-algebraicgeometry-locallyringedspace-tostalk-stalkmap-to",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spec-map-surjective","ml-algebraicgeometry-locallyringedspace-tostalk-stalkmap-to",0.22,"同文件","related"],
  ["ml-algebraicgeometry-spec-map-surjective","ml-algebraicgeometry-root-algebraicgeometry-ext-to-spec",0.22,"同文件","related"],
  ["ml-algebraicgeometry-locallyringedspace-tostalk-stalkmap-to","ml-algebraicgeometry-root-algebraicgeometry-ext-to-spec",0.22,"同文件","related"],
  ["ml-algebraicgeometry-locallyringedspace-tostalk-stalkmap-to","ml-algebraicgeometry-locallyringedspace-isunit-res-to",0.22,"同文件","related"],
  ["ml-algebraicgeometry-root-algebraicgeometry-ext-to-spec","ml-algebraicgeometry-locallyringedspace-isunit-res-to",0.22,"同文件","related"],
  ["ml-algebraicgeometry-geometricallyconnected-eq-geometrically","ml-algebraicgeometry-geometricallyconnected-connectedspac-d35568c2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-geometricallyintegral-eq-geometrically","ml-algebraicgeometry-geometricallyintegral-isintegral-of--ae14fac2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-geometricallyirreducible-eq-geometri-b60f4f78","ml-algebraicgeometry-geometricallyirreducible-irreducible-873e8886",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isartinianscheme-spec","ml-algebraicgeometry-scheme-islocallyartinianscheme-spec",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-isartinianscheme-spec","ml-algebraicgeometry-isartinianscheme-iff-isnoetherian-an-3c72bb48",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-islocallyartinianscheme-spec","ml-algebraicgeometry-isartinianscheme-iff-isnoetherian-an-3c72bb48",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-idealsheafdata-map-gc","ml-algebraicgeometry-scheme-idealsheafdata-root-algebraic-cd01a329",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-isdominant-toratio-45be8304","ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-288f7554",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-isdominant-toratio-45be8304","ml-algebraicgeometry-scheme-partialmap-isdominant-hom-of--f1003c72",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-288f7554","ml-algebraicgeometry-scheme-partialmap-isdominant-hom-of--f1003c72",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-288f7554","ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-95e7c040",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-isdominant-hom-of--f1003c72","ml-algebraicgeometry-scheme-partialmap-isdominant-hom-iff-95e7c040",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialiso-ext-iff","ml-algebraicgeometry-scheme-birationalover-isrationalover",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialiso-ext-iff","ml-algebraicgeometry-scheme-opens-birationalover-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-birationalover-isrationalover","ml-algebraicgeometry-scheme-opens-birationalover-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-birationalover-isrationalover","ml-algebraicgeometry-scheme-opens-isrationalover-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opens-birationalover-of-dense","ml-algebraicgeometry-scheme-opens-isrationalover-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opens-birationalover-of-dense","ml-algebraicgeometry-scheme-opens-birational-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-opens-isrationalover-of-dense","ml-algebraicgeometry-scheme-opens-birational-of-dense",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equiv","ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-f0ae2dd1",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equiv","ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-31cd20f2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-f0ae2dd1","ml-algebraicgeometry-scheme-partialmap-comp-equiv-of-equi-31cd20f2",0.22,"同文件","related"],
  ["ml-algebraicgeometry-universallyclosed-eq-valuativecriterion","ml-algebraicgeometry-universallyclosed-of-valuativecriterion",0.22,"同文件","related"],
  ["ml-algebraicgeometry-geometrically-iff-forall-fibertospec-40e5ab9e","ml-algebraicgeometry-self-of-isintegral-of-geometrically",0.22,"同文件","related"],
  ["ml-sheaf-hom-mono-of-presheaf-mono","ml-categorytheory-presheaf-subsingleton-iff-isseparatedfor",0.22,"同文件","related"],
  ["ml-sheaf-hom-mono-of-presheaf-mono","ml-categorytheory-presheaf-islimit-iff-issheaffor-presieve",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-subsingleton-iff-isseparatedfor","ml-categorytheory-presheaf-islimit-iff-issheaffor-presieve",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-subsingleton-iff-isseparatedfor","ml-categorytheory-presheaf-isseparated-iff-subsingleton",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-islimit-iff-issheaffor-presieve","ml-categorytheory-presheaf-isseparated-iff-subsingleton",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-islimit-iff-issheaffor-presieve","ml-categorytheory-presheaf-issheaf-iff-islimit-pretopology",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-isseparated-iff-subsingleton","ml-categorytheory-presheaf-issheaf-iff-islimit-pretopology",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-isseparated-iff-subsingleton","ml-categorytheory-presheaf-issheaf-iff-islimit",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-issheaf-iff-islimit-pretopology","ml-categorytheory-presheaf-issheaf-iff-islimit",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-issheaf-iff-islimit-pretopology","ml-categorytheory-presheaf-islimit-iff-issheaffor",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-issheaf-iff-islimit","ml-categorytheory-presheaf-islimit-iff-issheaffor",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-issheaf-iff-islimit","ml-sheaf-hom-ext-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-islimit-iff-issheaffor","ml-sheaf-hom-ext-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presheaf-islimit-iff-issheaffor","ml-categorytheory-issheaf-iff-issheaf",0.22,"同文件","related"],
  ["ml-sheaf-hom-ext-iff","ml-categorytheory-issheaf-iff-issheaf",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-sup","ml-categorytheory-presieve-issheaf-coverage",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-sup","ml-categorytheory-coverage-togrothendieck-eq-sinf",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-coverage","ml-categorytheory-coverage-togrothendieck-eq-sinf",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-coverage","ml-categorytheory-coverage-eq-top-pullback",0.22,"同文件","related"],
  ["ml-categorytheory-coverage-togrothendieck-eq-sinf","ml-categorytheory-coverage-eq-top-pullback",0.22,"同文件","related"],
  ["ml-categorytheory-coverage-togrothendieck-eq-sinf","ml-categorytheory-coverage-mem-togrothendieck-sieves-of-s-346c8866",0.22,"同文件","related"],
  ["ml-categorytheory-coverage-eq-top-pullback","ml-categorytheory-coverage-mem-togrothendieck-sieves-of-s-346c8866",0.22,"同文件","related"],
  ["ml-categorytheory-functor-cover-lift","ml-ran-issheaf-of-iscocontinuous",0.22,"同文件","related"],
  ["ml-categorytheory-functor-cover-lift","ml-categorytheory-iscocontinuous-comp",0.22,"同文件","related"],
  ["ml-ran-issheaf-of-iscocontinuous","ml-categorytheory-iscocontinuous-comp",0.22,"同文件","related"],
  ["ml-categorytheory-preonehypercover-isstronglysheaffor-iss-fac42119","ml-categorytheory-grothendiecktopology-onehypercover-issh-50297585",0.22,"同文件","related"],
  ["ml-categorytheory-coverpreserving-of-iscontinuous","ml-categorytheory-coverpreserving-comp",0.22,"同文件","related"],
  ["ml-categorytheory-coverpreserving-of-iscontinuous","ml-categorytheory-idcoverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-coverpreserving-comp","ml-categorytheory-idcoverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-coverpreserving-comp","ml-categorytheory-functor-iscontinuous-of-coverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-idcoverpreserving","ml-categorytheory-functor-iscontinuous-of-coverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-idcoverpreserving","ml-categorytheory-functor-preservesonehypercovers-of-cove-9538c0af",0.22,"同文件","related"],
  ["ml-categorytheory-functor-iscontinuous-of-coverpreserving","ml-categorytheory-functor-preservesonehypercovers-of-cove-9538c0af",0.22,"同文件","related"],
  ["ml-categorytheory-functor-iscontinuous-of-coverpreserving","ml-categorytheory-functor-iscontinuous-iff-coverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-functor-preservesonehypercovers-of-cove-9538c0af","ml-categorytheory-functor-iscontinuous-iff-coverpreserving",0.22,"同文件","related"],
  ["ml-categorytheory-functor-preservesonehypercovers-of-cove-9538c0af","ml-categorytheory-presieve-familyofelements-compatible-fu-98196559",0.22,"同文件","related"],
  ["ml-categorytheory-functor-iscontinuous-iff-coverpreserving","ml-categorytheory-presieve-familyofelements-compatible-fu-98196559",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-isseparated-issheaf","ml-categorytheory-presieve-issheaf-pretopology",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-isseparated-issheaf","ml-categorytheory-presieve-issheaf-bot",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-pretopology","ml-categorytheory-presieve-issheaf-bot",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-pretopology","ml-categorytheory-presieve-issheaf-iso",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-bot","ml-categorytheory-presieve-issheaf-iso",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-bot","ml-categorytheory-sieve-forallyonedaissheaf-iff-colimit",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-iso","ml-categorytheory-sieve-forallyonedaissheaf-iff-colimit",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-iso","ml-categorytheory-presieve-isseparated-iso",0.22,"同文件","related"],
  ["ml-categorytheory-sieve-forallyonedaissheaf-iff-colimit","ml-categorytheory-presieve-isseparated-iso",0.22,"同文件","related"],
  ["ml-categorytheory-sieve-forallyonedaissheaf-iff-colimit","ml-categorytheory-presieve-issheaf-comp-uliftfunctor-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-isseparated-iso","ml-categorytheory-presieve-issheaf-comp-uliftfunctor-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-isseparated-iso","ml-categorytheory-presieve-issheaffor-comp-uliftfunctor-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-comp-uliftfunctor-iff","ml-categorytheory-presieve-issheaffor-comp-uliftfunctor-iff",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaf-comp-uliftfunctor-iff","ml-categorytheory-presieve-issheaf-comp-uliftfunctor",0.22,"同文件","related"],
  ["ml-categorytheory-presieve-issheaffor-comp-uliftfunctor-iff","ml-categorytheory-presieve-issheaf-comp-uliftfunctor",0.22,"同文件","related"],
  ["ml-categorytheory-sheaf-h-longsequence-exact","ml-categorytheory-sheaf-h-longsequencehom-id",0.22,"同文件","related"],
  ["ml-categorytheory-tosheafification-app","ml-categorytheory-sheafifymap-id",0.22,"同文件","related"],
  ["ml-categorytheory-tosheafification-app","ml-categorytheory-sheafification-obj",0.22,"同文件","related"],
  ["ml-categorytheory-sheafifymap-id","ml-categorytheory-sheafification-obj",0.22,"同文件","related"],
  ["ml-categorytheory-sheafifymap-id","ml-categorytheory-sheafificationadjunction-unit-app",0.22,"同文件","related"],
  ["ml-categorytheory-sheafification-obj","ml-categorytheory-sheafificationadjunction-unit-app",0.22,"同文件","related"],
  ["ml-categorytheory-morphismproperty-coverage-eq-tocoverage-2158c6c2","ml-categorytheory-morphismproperty-grothendiecktopology-e-26b89b37",0.22,"同文件","related"],
  ["ml-under-map-eq-map-under","ml-map-under-le-under-map",0.22,"同文件","related"],
  ["ml-module-flat-iff-forall-exists-factorization","ml-module-flat-exists-factorization-of-comp-eq-zero-of-free",0.22,"同文件","related"],
  ["ml-lift-mk","ml-map-map",0.22,"同文件","related"],
  ["ml-lift-mk","ml-eq-of-eq",0.22,"同文件","related"],
  ["ml-map-map","ml-eq-of-eq",0.22,"同文件","related"],
  ["ml-map-map","ml-map-comp-map",0.22,"同文件","related"],
  ["ml-eq-of-eq","ml-map-comp-map",0.22,"同文件","related"],
  ["ml-eq-of-eq","ml-islocalization-surj",0.22,"同文件","related"],
  ["ml-map-comp-map","ml-islocalization-surj",0.22,"同文件","related"],
  ["ml-map-comp-map","ml-islocalization-sec-spec",0.22,"同文件","related"],
  ["ml-islocalization-surj","ml-islocalization-sec-spec",0.22,"同文件","related"],
  ["ml-ideal-quotient-mk-maps-eq","ml-ideal-exists-ne-zero-mem-of-ne-bot",0.22,"同文件","related"],
  ["ml-ideal-quotient-mk-maps-eq","ml-exists-ideal-over-maximal-of-isintegral",0.22,"同文件","related"],
  ["ml-ideal-exists-ne-zero-mem-of-ne-bot","ml-exists-ideal-over-maximal-of-isintegral",0.22,"同文件","related"],
  ["ml-away-of-surjective","ml-commutes",0.22,"同文件","related"],
  ["ml-away-of-surjective","ml-mul",0.22,"同文件","related"],
  ["ml-commutes","ml-mul",0.22,"同文件","related"],
  ["ml-commutes","ml-away-of-surjective-of-isscalartower",0.22,"同文件","related"],
  ["ml-mul","ml-away-of-surjective-of-isscalartower",0.22,"同文件","related"],
  ["ml-module-finite-of-localizationspan","ml-islocalization-smul-mem-finsetintegermultiple-span",0.22,"同文件","related"],
  ["ml-module-finite-of-localizationspan","ml-ideal-fg-of-localizationspan",0.22,"同文件","related"],
  ["ml-islocalization-smul-mem-finsetintegermultiple-span","ml-ideal-fg-of-localizationspan",0.22,"同文件","related"],
  ["ml-islocalization-smul-mem-finsetintegermultiple-span","ml-module-finite-of-localizationspan-finite",0.22,"同文件","related"],
  ["ml-ideal-fg-of-localizationspan","ml-module-finite-of-localizationspan-finite",0.22,"同文件","related"],
  ["ml-ideal-fg-of-localizationspan","ml-ringhom-ker-fg-of-localizationspan",0.22,"同文件","related"],
  ["ml-module-finite-of-localizationspan-finite","ml-ringhom-ker-fg-of-localizationspan",0.22,"同文件","related"],
  ["ml-natabs-det-equiv","ml-natabs-det-basis-change",0.22,"同文件","related"],
  ["ml-natabs-det-equiv","ml-ideal-exists-mul-add-mem-pow-succ",0.22,"同文件","related"],
  ["ml-natabs-det-basis-change","ml-ideal-exists-mul-add-mem-pow-succ",0.22,"同文件","related"],
  ["ml-natabs-det-basis-change","ml-exists-prime-and-absnorm-eq-pow",0.22,"同文件","related"],
  ["ml-ideal-exists-mul-add-mem-pow-succ","ml-exists-prime-and-absnorm-eq-pow",0.22,"同文件","related"],
  ["ml-ideal-exists-mul-add-mem-pow-succ","ml-ideal-mul-add-mem-pow-succ-inj",0.22,"同文件","related"],
  ["ml-exists-prime-and-absnorm-eq-pow","ml-ideal-mul-add-mem-pow-succ-inj",0.22,"同文件","related"],
  ["ml-exists-prime-and-absnorm-eq-pow","ml-cardquot-mul-of-coprime",0.22,"同文件","related"],
  ["ml-ideal-mul-add-mem-pow-succ-inj","ml-cardquot-mul-of-coprime",0.22,"同文件","related"],
  ["ml-away-adjoin-mk-prod-pow-eq-top","ml-away-span-mk-prod-pow-eq-top",0.22,"同文件","related"],
  ["ml-away-adjoin-mk-prod-pow-eq-top","ml-map-mk",0.22,"同文件","related"],
  ["ml-away-span-mk-prod-pow-eq-top","ml-map-mk",0.22,"同文件","related"],
  ["ml-away-span-mk-prod-pow-eq-top","ml-homogeneouslocalization-numdensamedeg-ext",0.22,"同文件","related"],
  ["ml-map-mk","ml-homogeneouslocalization-numdensamedeg-ext",0.22,"同文件","related"],
  ["ml-islocalization-isprime-of-isprime-disjoint","ml-islocalization-isprime-iff-isprime-disjoint",0.22,"同文件","related"],
  ["ml-islocalization-isprime-of-isprime-disjoint","ml-surjective-quotientmap-of-maximal-of-localization",0.22,"同文件","related"],
  ["ml-islocalization-isprime-iff-isprime-disjoint","ml-surjective-quotientmap-of-maximal-of-localization",0.22,"同文件","related"],
  ["ml-isintegral-localization","ml-is-integral-localization-at-leadingcoeff",0.22,"同文件","related"],
  ["ml-islocalring-exists-adjoin-eq-top","ml-islocalring-minpoly-map-residue",0.22,"同文件","related"],
  ["ml-islocalization-isunit-piringhom-algebramap-comp-pieval-271ec768","ml-islocalization-bijective-lift-piringhom-algebramap-com-533ad255",0.22,"同文件","related"],
  ["ml-resultant-deriv","ml-polynomial-sylvesterderiv-updaterow",0.22,"同文件","related"],
  ["ml-mul-scaleroots","ml-scaleroots-dvd",0.22,"同文件","related"],
  ["ml-istensorproduct-map-injective-of-flat-right-left","ml-istensorproduct-map-injective-of-flat-left-right",0.22,"同文件","related"],
  ["ml-istensorproduct-map-injective-of-flat-right-left","ml-tensorproduct-map-injective-of-flat-flat",0.22,"同文件","related"],
  ["ml-istensorproduct-map-injective-of-flat-left-right","ml-tensorproduct-map-injective-of-flat-flat",0.22,"同文件","related"],
  ["ml-istensorproduct-map-injective-of-flat-left-right","ml-flat-iff-ltensor-exact",0.22,"同文件","related"],
  ["ml-tensorproduct-map-injective-of-flat-flat","ml-flat-iff-ltensor-exact",0.22,"同文件","related"],
  ["ml-tensorproduct-map-injective-of-flat-flat","ml-flat-iff-rtensor-exact",0.22,"同文件","related"],
  ["ml-flat-iff-ltensor-exact","ml-flat-iff-rtensor-exact",0.22,"同文件","related"],
  ["ml-flat-iff-ltensor-exact","ml-flat-iff-rtensor-preserves-injective-linearmap",0.22,"同文件","related"],
  ["ml-flat-iff-rtensor-exact","ml-flat-iff-rtensor-preserves-injective-linearmap",0.22,"同文件","related"],
  ["ml-flat-iff-rtensor-exact","ml-flat-iff-ltensor-preserves-injective-linearmap",0.22,"同文件","related"],
  ["ml-flat-iff-rtensor-preserves-injective-linearmap","ml-flat-iff-ltensor-preserves-injective-linearmap",0.22,"同文件","related"],
  ["ml-flat-iff-rtensor-preserves-injective-linearmap","ml-isreduced-tensorproduct-of-flat-of-forall-fg",0.22,"同文件","related"],
  ["ml-flat-iff-ltensor-preserves-injective-linearmap","ml-isreduced-tensorproduct-of-flat-of-forall-fg",0.22,"同文件","related"],
  ["ml-islocalring-of-subring","ml-islocalring-of-injective",0.22,"同文件","related"],
  ["ml-lift-algebramap","ml-ringhom-fieldrange-eq-of-comp-eq-of-range-eq",0.22,"同文件","related"],
  ["ml-lift-algebramap","ml-trans",0.22,"同文件","related"],
  ["ml-ringhom-fieldrange-eq-of-comp-eq-of-range-eq","ml-trans",0.22,"同文件","related"],
  ["ml-ringhom-fieldrange-eq-of-comp-eq-of-range-eq","ml-fixingsubgroup-range-algebramap",0.22,"同文件","related"],
  ["ml-trans","ml-fixingsubgroup-range-algebramap",0.22,"同文件","related"],
  ["ml-trans","ml-fieldequivofalgequiv-algebramap",0.22,"同文件","related"],
  ["ml-fixingsubgroup-range-algebramap","ml-fieldequivofalgequiv-algebramap",0.22,"同文件","related"],
  ["ml-fixingsubgroup-range-algebramap","ml-closure-range-algebramap",0.22,"同文件","related"],
  ["ml-fieldequivofalgequiv-algebramap","ml-closure-range-algebramap",0.22,"同文件","related"],
  ["ml-fieldequivofalgequiv-algebramap","ml-ringhom-fieldrange-eq-of-comp-eq",0.22,"同文件","related"],
  ["ml-closure-range-algebramap","ml-ringhom-fieldrange-eq-of-comp-eq",0.22,"同文件","related"],
  ["ml-closure-range-algebramap","ml-surjective-iff-isfield",0.22,"同文件","related"],
  ["ml-ringhom-fieldrange-eq-of-comp-eq","ml-surjective-iff-isfield",0.22,"同文件","related"],
  ["ml-ideal-height-le-height-add-of-liesover","ml-ideal-mem-minimalprimes-span-of-mem-minimalprimes-span-ae57d3b6",0.22,"同文件","related"],
  ["ml-ideal-height-le-height-add-of-liesover","ml-ideal-height-le-spanrank-toenat",0.22,"同文件","related"],
  ["ml-ideal-mem-minimalprimes-span-of-mem-minimalprimes-span-ae57d3b6","ml-ideal-height-le-spanrank-toenat",0.22,"同文件","related"],
  ["ml-ideal-mem-minimalprimes-span-of-mem-minimalprimes-span-ae57d3b6","ml-ideal-height-le-iff-exists-minimalprimes",0.22,"同文件","related"],
  ["ml-ideal-height-le-spanrank-toenat","ml-ideal-height-le-iff-exists-minimalprimes",0.22,"同文件","related"],
  ["ml-dvd-coeff-zero-of-aeval-eq-prime-smul-of-minpoly-iseis-cd3e4bd7","ml-mem-adjoin-of-smul-prime-smul-of-minpoly-iseisensteinat",0.22,"同文件","related"],
  ["ml-polynomial-not-finite","ml-polynomial-exists-degree-le-of-mem-span-of-finite",0.22,"同文件","related"],
  ["ml-polynomial-not-finite","ml-mem-map-c-iff",0.22,"同文件","related"],
  ["ml-polynomial-exists-degree-le-of-mem-span-of-finite","ml-mem-map-c-iff",0.22,"同文件","related"],
  ["ml-polynomial-exists-degree-le-of-mem-span-of-finite","ml-span-le-of-c-coeff-mem",0.22,"同文件","related"],
  ["ml-mem-map-c-iff","ml-span-le-of-c-coeff-mem",0.22,"同文件","related"],
  ["ml-mem-map-c-iff","ml-polynomial-exists-degree-le-of-mem-span",0.22,"同文件","related"],
  ["ml-span-le-of-c-coeff-mem","ml-polynomial-exists-degree-le-of-mem-span",0.22,"同文件","related"],
  ["ml-span-le-of-c-coeff-mem","ml-mvpolynomial-mem-map-c-iff",0.22,"同文件","related"],
  ["ml-polynomial-exists-degree-le-of-mem-span","ml-mvpolynomial-mem-map-c-iff",0.22,"同文件","related"],
  ["ml-polynomial-normalizedfactors-cyclotomic-card","ml-polynomial-irreducible-of-dvd-cyclotomic-of-natdegree",0.22,"同文件","related"],
  ["ml-polynomial-normalizedfactors-cyclotomic-card","ml-polynomial-natdegree-of-dvd-cyclotomic-of-irreducible",0.22,"同文件","related"],
  ["ml-polynomial-irreducible-of-dvd-cyclotomic-of-natdegree","ml-polynomial-natdegree-of-dvd-cyclotomic-of-irreducible",0.22,"同文件","related"],
  ["ml-multiset-prod-x-add-c-eq-sum-esymm","ml-multiset-prod-x-add-c-coeff",0.22,"同文件","related"],
  ["ml-multiset-prod-x-add-c-eq-sum-esymm","ml-mvpolynomial-prod-c-add-x-eq-sum-esymm",0.22,"同文件","related"],
  ["ml-multiset-prod-x-add-c-coeff","ml-mvpolynomial-prod-c-add-x-eq-sum-esymm",0.22,"同文件","related"],
  ["ml-ideal-finiteheight-iff-lt","ml-ideal-height-eq-ringkrulldim-iff",0.22,"同文件","related"],
  ["ml-range-le-ker-of-exact-rtensor","ml-module-basis-span-repr-one-eq-top",0.22,"同文件","related"],
  ["ml-range-le-ker-of-exact-rtensor","ml-of-linearequiv",0.22,"同文件","related"],
  ["ml-module-basis-span-repr-one-eq-top","ml-of-linearequiv",0.22,"同文件","related"],
  ["ml-module-basis-span-repr-one-eq-top","ml-one-tmul-eq-zero-iff",0.22,"同文件","related"],
  ["ml-of-linearequiv","ml-one-tmul-eq-zero-iff",0.22,"同文件","related"],
  ["ml-polynomial-coeff-mul-invonesubpow-eq-hilbertpoly-eval","ml-polynomial-eq-hilbertpoly-of-forall-coeff-eq-eval",0.22,"同文件","related"],
  ["ml-ideal-ideal-prod-prime","ml-ideal-ideal-prod-eq",0.22,"同文件","related"],
  ["ml-ideal-spannorm-mul-of-bot-or-top","ml-ideal-spannorm-spannorm-of-bot-or-top",0.22,"同文件","related"],
  ["ml-ideal-spannorm-mul-of-bot-or-top","ml-relnorm-eq-pow-of-ismaximal",0.22,"同文件","related"],
  ["ml-ideal-spannorm-spannorm-of-bot-or-top","ml-relnorm-eq-pow-of-ismaximal",0.22,"同文件","related"],
  ["ml-num-dvd-of-is-root","ml-den-dvd-of-is-root",0.22,"同文件","related"],
  ["ml-isprime-prod-mem-iff","ml-le-of-dvd",0.22,"同文件","related"],
  ["ml-isprime-prod-mem-iff","ml-ofnat-eq-top",0.22,"同文件","related"],
  ["ml-le-of-dvd","ml-ofnat-eq-top",0.22,"同文件","related"],
  ["ml-le-of-dvd","ml-mem-of-span-eq-top-of-smul-pow-mem",0.22,"同文件","related"],
  ["ml-ofnat-eq-top","ml-mem-of-span-eq-top-of-smul-pow-mem",0.22,"同文件","related"],
  ["ml-algebra-norm-localization","ml-algebra-trace-localization",0.22,"同文件","related"],
  ["ml-algebra-norm-localization","ml-algebra-discr-localizationlocalization",0.22,"同文件","related"],
  ["ml-algebra-trace-localization","ml-algebra-discr-localizationlocalization",0.22,"同文件","related"],
  ["ml-linearindependent-tmul-of-isdomain","ml-tensorproduct-map-injective-of-flat-flat-of-isdomain",0.22,"同文件","related"],
  ["ml-polynomial-isweaklyeisensteinat-map","ml-irreducible",0.22,"同文件","related"],
  ["ml-coeff-isunit-isnilpotent-of-isunit","ml-isunit-of-coeff-isunit-isnilpotent",0.22,"同文件","related"],
  ["ml-coeff-isunit-isnilpotent-of-isunit","ml-isunit-iff-coeff-isunit-isnilpotent",0.22,"同文件","related"],
  ["ml-isunit-of-coeff-isunit-isnilpotent","ml-isunit-iff-coeff-isunit-isnilpotent",0.22,"同文件","related"],
  ["ml-unique-int-coeff-of-cycl","ml-natdegree-cyclotomic-le",0.22,"同文件","related"],
  ["ml-unique-int-coeff-of-cycl","ml-int-coeff-of-cyclotomic",0.22,"同文件","related"],
  ["ml-natdegree-cyclotomic-le","ml-int-coeff-of-cyclotomic",0.22,"同文件","related"],
  ["ml-ideal-ker-tensorproductmk-quotient","ml-ideal-pi-tensorproductmk-quotient-surjective",0.22,"同文件","related"],
  ["ml-ker-isprime","ml-map-symm",0.22,"同文件","related"],
  ["ml-ker-isprime","ml-comap-symm",0.22,"同文件","related"],
  ["ml-map-symm","ml-comap-symm",0.22,"同文件","related"],
  ["ml-ideal-quotient-ringhom-ext","ml-ideal-quotient-quotient-ring-saturate",0.22,"同文件","related"],
  ["ml-smul-mem-iff","ml-islocalization-iff-of-islocalization",0.22,"同文件","related"],
  ["ml-smul-mem-iff","ml-islocalization-map-injective-of-injective",0.22,"同文件","related"],
  ["ml-islocalization-iff-of-islocalization","ml-islocalization-map-injective-of-injective",0.22,"同文件","related"],
  ["ml-ideal-pi-quotient-surjective","ml-ideal-exists-forall-sub-mem-ideal",0.22,"同文件","related"],
  ["ml-map-nonunit","ml-islocalring-local-hom-tfae",0.22,"同文件","related"],
  ["ml-polynomial-gaussnorm-mul-le","ml-polynomial-exists-min-eq-gaussnorm",0.22,"同文件","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-ispreimmersion-eq-inf",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isopenimmersion-of-flat-of-mono",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-hom-injective",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-islocalization-basicopen-of-qcqs",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-essentiallysmall-costructuredarrow-spec",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-hom-isconstructible-image",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-surjectiveonstalks-isembedding-pullback",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isfinite-iff-locallyoffinitetype-of--4940f322",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isschemetheoreticallydominant-iff-is-023f6567",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-cover-exists-eq",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-smooth-of-smooth-fibertospecresiduefield",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isopenimmersion-specmap-iff-of-surje-04525d8e",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-hom-finrank-eq-one-of-isiso",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-ext-of-apply-eq",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-exists-variablechange-of-j-eq",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-localrepresentability-isrepre-cd27b340",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-hom-normalization-hom-ext",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-proj-away",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-hom-isover-iff",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-ideal-ker-le-ker",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-exists-isunit-germ-eq",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isiso-of-comp-eq-sigmaspec",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-geometricallyreduced-eq-geometrically",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-weierstrasscurve-jacobian-point-mk-point",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-weierstrasscurve-projective-point-mk-point",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-proj-isup-basicopen-eq-top",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-isregularepi-of-flat-of-surjective-o-53c428b9",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-map-ideal",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-proetaletopology-eq-propqctop-979c5203",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-fpqctopology-eq-propqctopology",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-weierstrasscurve-affine-point-sym2x-add-sub-eq-addsubm-e425a41f",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-gluedata-glue-condition",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-scheme-zariskitopology-le-etaletopology",0.12,"本族锚点","related"],
  ["ml-projectivespectrum-proj-islocalization-atprime","ml-algebraicgeometry-iscommmonobj-of-isproper-of-geometri-eaff051a",0.12,"本族锚点","related"],
  ["ml-categorytheory-presieve-issheaf-sup","ml-categorytheory-presheafhom-map-app",0.12,"本族锚点","related"],
  ["ml-categorytheory-presieve-issheaf-sup","ml-categorytheory-grothendiecktopology-coverstop-ext",0.12,"本族锚点","related"],
  ["ml-categorytheory-presieve-issheaf-sup","ml-algebraicgeometry-sheafedspace-mk-coe",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-chevalley-mvpolynomial-mvpolynomial",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-bernsteinpolynomial-linearindependent",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-primespectrum-ishomeomorph-comap",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-islocalizedmodule-iff-isbasechange",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-eq-zero-of-polynomial-mem-map-range",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-ncard-primesover-lt-of-not-le",0.12,"本族锚点","related"],
  ["ml-module-flat-iff-forall-exists-factorization","ml-localization-exists-finite-awaymap",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-exists-ideal-le-liesover-of-le",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-exists-ideal-ge-liesover-of-le",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-primespectrum-exist-ltseries-mem-one-of-mem-last",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-primespectrum-exists-maximal-notmem-range-sigmatopi-of-c3dc48b2",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-isprimitiveroot-sum-eq-zero-iff-forall-eq",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-splits-surjective-topermhom-of-isup-inertia-6f6a953e",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-irreducible-of-eisenstein-criterion",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-isdistinguishedat-mul",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-islocalization-atprime-mem-primesover-of-isprime",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-exists-primespectrum-prod-le-and-ne-bot-of-domain",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-cyclotomic-pos",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-factorial-mul-shiftedlegendre-eq",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-isoka-forall-of-forall-prime",0.12,"本族锚点","related"],
  ["ml-module-flat-iff-forall-exists-factorization","ml-module-flat-iff-rtensor-injective",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-islocalization",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-ismaximal-def",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-idealfilter-istorsionquot-inter-left-iff",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-primespectrum-isembedding-comap-of-surjective",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-algebraicgeometry-polynomial-comap-c-mem-imageofdf",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ring-isfield-iff-issimpleorder-ideal",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-natdegree-wronskian-lt-add",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-isaugmentation-subalgebra-iff",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-map-pi",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-islocalring-not-islocalring-tfae",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-primespectrum-isopen-singleton-tfae-of-isnoetherian-of-093553cd",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-isnoetherianring-exists-relseries-isquotientequivquoti-70c1e64c",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-isnilpotent-tensor-residuefield-iff",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-module-exists-basis-of-basis-basechange",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-localization-atprime-map-eq-maximalideal",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-hasseparableresiduefieldsat-tower-top",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-polynomial-monic-irreducible-of-irreducible-map-of-isp-c38df1f3",0.12,"本族锚点","related"],
  ["ml-under-map-eq-map-under","ml-ideal-isnilpotent-induction-on",0.12,"本族锚点","related"]]
