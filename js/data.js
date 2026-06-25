/*
 * IntelliHub — synthetic data module
 * ---------------------------------------------------
 * EVERYTHING in this file is fabricated sample data for a local concept prototype.
 * No real clients, internal system names, proprietary logic, or real screenshots.
 * CRM field names and technical terms are kept in English (source-of-record language).
 */

const AUTHORITY = {
  POLICY: {
    id: "policy", rank: 1,
    en: "Approved configuration standard",
    fr: "Standard de configuration approuvé",
    es: "Estándar de configuración aprobado",
    ja: "承認済み構成基準",
    cls: "auth-policy",
  },
  PLAYBOOK: {
    id: "playbook", rank: 2,
    en: "Validated team playbook",
    fr: "Guide d'équipe validé",
    es: "Manual de equipo validado",
    ja: "検証済みチームプレイブック",
    cls: "auth-playbook",
  },
  PRECEDENT: {
    id: "precedent", rank: 3,
    en: "Historical CRM precedent",
    fr: "Précédent CRM historique",
    es: "Precedente CRM histórico",
    ja: "過去のCRM事例",
    cls: "auth-precedent",
  },
  CONVERSATION: {
    id: "conversation", rank: 4,
    en: "Team discussion / unvalidated suggestion",
    fr: "Discussion d'équipe / suggestion non validée",
    es: "Discusión de equipo / sugerencia no validada",
    ja: "チーム議論 / 未検証の提案",
    cls: "auth-conversation",
  },
};

/* ---- Navigation rail ---- */
const NAV_ITEMS = [
  { id: "activity", icon: "bell", labelKey: "nav.activity" },
  { id: "chat", icon: "chat", labelKey: "nav.chat" },
  { id: "teams", icon: "people", labelKey: "nav.teams", active: true },
  { id: "calendar", icon: "calendar", labelKey: "nav.calendar" },
  { id: "hub", icon: "hub", labelKey: "nav.hub" },
];

/* ---- Team + channel tree ---- */
const TEAMS = [
  {
    id: "global-ops",
    name: "CRM Resolution",
    channels: [
      { id: "crm-global", name: "CRM Resolution — Global Operations", active: true, unread: 3 },
      { id: "config-standards", name: "Configuration Standards" },
      { id: "change-control", name: "Change Control & Releases" },
      { id: "announcements", name: "Announcements" },
    ],
  },
  {
    id: "platform-eng",
    name: "Platform Engineering",
    channels: [
      { id: "integrations", name: "Integrations & Middleware" },
      { id: "infra-standards", name: "Infrastructure Standards" },
    ],
  },
];

/* ---- Team members (synthetic) ---- */
const PEOPLE = {
  marco: { name: "Marco Oliveira", role: { en: "Senior Configuration Consultant", fr: "Consultant senior en configuration", es: "Consultor senior de configuración", ja: "シニア構成コンサルタント" }, region: "Brazil", initials: "MO", color: "#6264a7" },
  lena: { name: "Lena Dvořáková", role: { en: "Platform Configuration Engineer", fr: "Ingénieure configuration plateforme", es: "Ingeniera de configuración de plataforma", ja: "プラットフォーム構成エンジニア" }, region: "Czech Republic", initials: "LD", color: "#2e7d5b" },
  rajesh: { name: "Rajesh Kapoor", role: { en: "Configuration Team Lead", fr: "Chef d'équipe configuration", es: "Líder del equipo de configuración", ja: "構成チームリード" }, region: "India", initials: "RK", color: "#c4571f" },
  yuki: { name: "Yuki Tanaka", role: { en: "Systems Analyst", fr: "Analyste systèmes", es: "Analista de sistemas", ja: "システムアナリスト" }, region: "Japan", initials: "YT", color: "#8a4fbe" },
  jason: { name: "Jason Torres", role: { en: "Configuration Specialist", fr: "Spécialiste configuration", es: "Especialista en configuración", ja: "構成スペシャリスト" }, region: "US", initials: "JT", color: "#3572a5" },
  mockupai: { name: "Amazon Kiro Resolution Companion", role: { en: "Governed advisor", fr: "Conseiller encadré", es: "Asesor gobernado", ja: "ガバナンスアドバイザー" }, region: "—", initials: "AI", color: "#1f6f6f", bot: true },
};

/* ---- Channel conversation (synthetic travel reimbursement scenario) ---- */
const CONVERSATION = [
  {
    type: "message",
    person: "marco",
    time: "09:12",
    body: {
      en: "Hey team — I'm seeing an issue with international travel reimbursement configuration. A multi-day travel scenario is producing partial-day results when the full-day rate should apply. The itinerary clearly spans complete days but the system is calculating as if some days are partial.",
      fr: "Bonjour l'équipe — je rencontre un problème avec la configuration du remboursement de voyage international. Un scénario de voyage sur plusieurs jours produit des résultats partiels alors que le taux journée complète devrait s'appliquer. L'itinéraire couvre clairement des journées complètes mais le système calcule comme si certains jours étaient partiels.",
      es: "Hola equipo — estoy viendo un problema con la configuración de reembolso de viajes internacionales. Un escenario de viaje de varios días produce resultados de día parcial cuando debería aplicarse la tarifa de día completo. El itinerario claramente abarca días completos pero el sistema calcula como si algunos días fueran parciales.",
      ja: "チームの皆さん — 海外出張の精算設定で問題が発生しています。複数日の出張シナリオで、全日レートが適用されるべきところ、一部日が部分日として計算されています。旅程は明らかに完全な日を含んでいますが、システムは一部の日を部分日として計算しています。",
    },
  },
  {
    type: "message",
    person: "lena",
    time: "09:15",
    body: {
      en: "I've seen something similar before. The first thing I'd check is the travel-period classification — how the system determines whether a day counts as full or partial. There are usually threshold rules for departure and arrival times that affect how each day is categorized.",
      fr: "J'ai déjà vu quelque chose de similaire. La première chose que je vérifierais est la classification de la période de voyage — comment le système détermine si un jour compte comme complet ou partiel. Il y a généralement des règles de seuil pour les heures de départ et d'arrivée qui affectent la catégorisation de chaque jour.",
      es: "He visto algo similar antes. Lo primero que verificaría es la clasificación del período de viaje — cómo el sistema determina si un día cuenta como completo o parcial. Generalmente hay reglas de umbral para las horas de salida y llegada que afectan cómo se categoriza cada día.",
      ja: "以前似たようなケースを見たことがあります。最初に確認すべきは出張期間の分類です — システムがどのように全日か部分日かを判定しているか。通常、出発時刻と到着時刻に閾値ルールがあり、各日の分類に影響します。",
    },
  },
  {
    type: "message",
    person: "rajesh",
    time: "09:18",
    body: {
      en: "Good point, Lena. Also check the configuration hierarchy — rule precedence matters here. If there's a general interval definition that conflicts with the specific travel-period rule, the wrong one might be winning. And look at supporting adjustment logic — deduction or proration rules that could override the base calculation.",
      fr: "Bon point, Lena. Vérifiez également la hiérarchie de configuration — la priorité des règles est importante ici. S'il y a une définition d'intervalle générale qui entre en conflit avec la règle spécifique de période de voyage, la mauvaise pourrait l'emporter. Et regardez la logique d'ajustement — les règles de déduction ou prorata qui pourraient supplanter le calcul de base.",
      es: "Buen punto, Lena. También verifica la jerarquía de configuración — la precedencia de reglas importa aquí. Si hay una definición de intervalo general que entra en conflicto con la regla específica de período de viaje, la incorrecta podría estar prevaleciendo. Y revisa la lógica de ajuste — reglas de deducción o prorrateo que podrían anular el cálculo base.",
      ja: "良い指摘です、レナ。構成階層も確認してください — ルールの優先順位が重要です。一般的なインターバル定義が特定の出張期間ルールと競合している場合、間違った方が優先されているかもしれません。また、調整ロジック — 基本計算を上書きする可能性のある控除や按分ルールも確認してください。",
    },
  },
  {
    type: "message",
    person: "jason",
    time: "09:21",
    body: {
      en: "I had a similar case last month with a US-based scenario. The issue was that policy conditions were evaluated before the interval definitions, so the system was applying a partial-day cap before it even determined the correct travel period. Once we sorted out the evaluation sequence, the full-day rate applied correctly.",
      fr: "J'ai eu un cas similaire le mois dernier avec un scénario basé aux États-Unis. Le problème était que les conditions de politique étaient évaluées avant les définitions d'intervalles, donc le système appliquait un plafond de jour partiel avant même de déterminer la période de voyage correcte. Une fois la séquence d'évaluation corrigée, le taux journée complète s'appliquait correctement.",
      es: "Tuve un caso similar el mes pasado con un escenario basado en EE.UU. El problema era que las condiciones de política se evaluaban antes de las definiciones de intervalos, por lo que el sistema aplicaba un tope de día parcial antes de determinar el período de viaje correcto. Una vez que ordenamos la secuencia de evaluación, la tarifa de día completo se aplicó correctamente.",
      ja: "先月、米国ベースのシナリオで似たケースがありました。問題はポリシー条件がインターバル定義より先に評価されていたことで、システムが正しい出張期間を決定する前に部分日の上限を適用していました。評価順序を整理したら、全日レートが正しく適用されました。",
    },
  },
  {
    type: "advisor",
    recommendation: "rec-travel",
    time: "09:22",
    compact: true,
  },
];

/* ---- Demo question (posted on demand) ---- */
const DEMO_QUESTION = {
  type: "message",
  person: "marco",
  time: "09:24",
  highlight: true,
  body: {
    en: "Has anyone encountered multi-day travel configurations producing partial-day results unexpectedly? Is this a known pattern?",
    fr: "Quelqu'un a-t-il rencontré des configurations de voyage multi-jours produisant des résultats de jours partiels de manière inattendue ? Est-ce un schéma connu ?",
    es: "¿Alguien ha encontrado configuraciones de viaje de varios días que producen resultados de día parcial inesperadamente? ¿Es un patrón conocido?",
    ja: "複数日の出張設定が予期せず部分日の結果を生成するケースに遭遇した方はいますか？これは既知のパターンですか？",
  },
};

/* ---- Amazon Kiro recommendations (governed) ---- */
const RECOMMENDATIONS = {
  "rec-travel": {
    id: "rec-travel",
    title: { en: "Review Configuration Precedence Before Changing Values", fr: "Examiner la priorité de configuration avant de modifier les valeurs", es: "Revisar la precedencia de configuración antes de cambiar valores", ja: "値を変更する前に構成の優先順位を確認" },
    summary: {
      en: "I found relevant approved knowledge, 14 comparable historical CRM cases, and validated team practices that apply to this scenario.",
      fr: "J'ai trouvé des connaissances approuvées pertinentes, 14 cas CRM historiques comparables et des pratiques d'équipe validées applicables à ce scénario.",
      es: "Encontré conocimiento aprobado relevante, 14 casos CRM históricos comparables y prácticas de equipo validadas aplicables a este escenario.",
      ja: "このシナリオに適用される承認済み知識、14件の類似CRM事例、検証済みチーム実践を見つけました。",
    },
    nextStep: {
      en: "Review configuration precedence and calculation sequence before modifying reimbursement values.",
      fr: "Examiner la priorité de configuration et la séquence de calcul avant de modifier les valeurs de remboursement.",
      es: "Revisar la precedencia de configuración y la secuencia de cálculo antes de modificar los valores de reembolso.",
      ja: "精算値を変更する前に構成の優先順位と計算順序を確認してください。",
    },
    steps: {
      en: [
        "Confirm that the travel period is classified correctly.",
        "Review the order in which related configuration rules are evaluated.",
        "Check whether supporting interval, deduction, or adjustment rules are affecting the result.",
        "Compare the current setup against the approved configuration standard.",
        "Retest using a controlled multi-day scenario.",
        "Escalate to an SME if the expected result is still not produced.",
      ],
      fr: [
        "Confirmer que la période de voyage est correctement classifiée.",
        "Examiner l'ordre dans lequel les règles de configuration sont évaluées.",
        "Vérifier si les règles d'intervalle, de déduction ou d'ajustement affectent le résultat.",
        "Comparer la configuration actuelle avec le standard de configuration approuvé.",
        "Retester avec un scénario multi-jours contrôlé.",
        "Escalader vers un SME si le résultat attendu n'est toujours pas produit.",
      ],
      es: [
        "Confirmar que el período de viaje está clasificado correctamente.",
        "Revisar el orden en que se evalúan las reglas de configuración relacionadas.",
        "Verificar si las reglas de intervalo, deducción o ajuste están afectando el resultado.",
        "Comparar la configuración actual con el estándar de configuración aprobado.",
        "Volver a probar con un escenario controlado de varios días.",
        "Escalar a un SME si el resultado esperado aún no se produce.",
      ],
      ja: [
        "出張期間が正しく分類されていることを確認する。",
        "関連する構成ルールの評価順序を確認する。",
        "インターバル、控除、または調整ルールが結果に影響していないか確認する。",
        "現在の設定を承認済み構成基準と比較する。",
        "管理された複数日シナリオで再テストする。",
        "期待される結果がまだ得られない場合はSMEにエスカレーションする。",
      ],
    },
    why: {
      en: "In 12 of 14 comparable historical cases, configured values were correct but a secondary configuration rule affected how values were applied. The issue appeared across multiple days, not just one calculation. Successful resolution involved reviewing the calculation sequence and supporting rules before changing reimbursement values.",
      fr: "Dans 12 des 14 cas historiques comparables, les valeurs configurées étaient correctes mais une règle de configuration secondaire affectait la façon dont les valeurs étaient appliquées. Le problème apparaissait sur plusieurs jours, pas sur un seul calcul. La résolution réussie impliquait l'examen de la séquence de calcul et des règles associées avant de modifier les valeurs de remboursement.",
      es: "En 12 de 14 casos históricos comparables, los valores configurados eran correctos pero una regla de configuración secundaria afectaba cómo se aplicaban los valores. El problema aparecía en múltiples días, no solo en un cálculo. La resolución exitosa involucró revisar la secuencia de cálculo y las reglas de soporte antes de cambiar los valores de reembolso.",
      ja: "14件中12件の類似事例で、設定値は正しかったものの、二次的な構成ルールが値の適用方法に影響していました。問題は1回の計算だけでなく複数日にわたって現れました。成功した解決には、精算値を変更する前に計算順序とサポートルールの確認が含まれていました。",
    },
    authority: AUTHORITY.POLICY,
    confidence: 0.91,
    approval: { en: "Aligned with approved configuration guidance", fr: "Aligné sur les directives de configuration approuvées", es: "Alineado con la guía de configuración aprobada", ja: "承認済み構成ガイダンスに準拠" },
    governanceNote: { en: "Human review required before changes are made in a live environment.", fr: "Revue humaine requise avant toute modification dans un environnement de production.", es: "Se requiere revisión humana antes de realizar cambios en un entorno de producción.", ja: "本番環境での変更前に人間によるレビューが必要です。" },
    citations: ["kb-demo-204", "play-demo-015", "crm-demo-101", "crm-demo-107", "crm-demo-114"],
    escalation: {
      en: "Escalate if: source-of-record conflict detected, or unexpected result remains after controlled validation.",
      fr: "Escalader si : conflit de source de référence détecté, ou résultat inattendu persiste après validation contrôlée.",
      es: "Escalar si: se detecta conflicto de fuente de registro, o el resultado inesperado persiste después de la validación controlada.",
      ja: "エスカレーション条件：記録元の競合が検出された場合、または管理された検証後も予期しない結果が残る場合。",
    },
    translation: { lang: "fr", confidence: 0.96, level: "high" },
    cases: ["crm-demo-101", "crm-demo-107", "crm-demo-114"],
    caseStats: {
      total: 14,
      resolved: 12,
      pattern: { en: "Configured values were correct; a secondary configuration rule affected how values were applied", fr: "Les valeurs configurées étaient correctes ; une règle secondaire affectait la façon dont les valeurs étaient appliquées", es: "Los valores configurados eran correctos; una regla de configuración secundaria afectaba cómo se aplicaban los valores", ja: "設定値は正しかったが、二次的な構成ルールが値の適用方法に影響していた" },
    },
    resolutionRate: { value: 0.86, illustrative: true },
  },
};

/* ---- Similar configuration cases (synthetic, anonymized) ---- */
const CRM_CASES = {
  "crm-demo-101": {
    ref: "CRM-DEMO-101",
    rootCause: { en: "Secondary interval rule overrode full-day classification for travel days spanning midnight boundaries", fr: "Règle d'intervalle secondaire supplantant la classification journée complète pour les jours de voyage traversant minuit", es: "Regla de intervalo secundaria anuló la clasificación de día completo para días de viaje que cruzan medianoche", ja: "深夜をまたぐ出張日の全日分類を二次インターバルルールが上書き" },
    resolution: { en: "Corrected rule evaluation sequence; interval definition moved below travel-period classification in precedence", fr: "Séquence d'évaluation des règles corrigée ; définition d'intervalle déplacée sous la classification de période de voyage", es: "Se corrigió la secuencia de evaluación de reglas; la definición de intervalo se movió debajo de la clasificación de período de viaje", ja: "ルール評価順序を修正；インターバル定義を出張期間分類の下に移動" },
    outcome: { en: "Resolved", fr: "Résolu", es: "Resuelto", ja: "解決済み" },
    region: "EMEA",
    similarity: 0.94,
  },
  "crm-demo-107": {
    ref: "CRM-DEMO-107",
    rootCause: { en: "Adjustment logic applied partial-day deduction before the travel-period rule was evaluated", fr: "Logique d'ajustement appliquant une déduction de jour partiel avant l'évaluation de la règle de période de voyage", es: "Lógica de ajuste aplicó deducción de día parcial antes de evaluar la regla de período de viaje", ja: "出張期間ルール評価前に調整ロジックが部分日控除を適用" },
    resolution: { en: "Reordered policy condition evaluation; adjustment logic now fires after period classification", fr: "Réordonnancement de l'évaluation des conditions de politique ; la logique d'ajustement s'exécute maintenant après la classification de période", es: "Se reordenó la evaluación de condiciones de política; la lógica de ajuste ahora se ejecuta después de la clasificación de período", ja: "ポリシー条件の評価順序を変更；調整ロジックが期間分類後に実行されるように" },
    outcome: { en: "Resolved", fr: "Résolu", es: "Resuelto", ja: "解決済み" },
    region: "Americas",
    similarity: 0.91,
  },
  "crm-demo-114": {
    ref: "CRM-DEMO-114",
    rootCause: { en: "Multiple interval definitions conflicted across configuration layers; lowest-level rule produced partial-day cap unexpectedly", fr: "Plusieurs définitions d'intervalles en conflit entre les couches de configuration ; la règle de plus bas niveau produisait un plafond de jour partiel inattendu", es: "Múltiples definiciones de intervalo en conflicto entre capas de configuración; la regla de nivel más bajo produjo un tope de día parcial inesperado", ja: "複数のインターバル定義が構成レイヤー間で競合；最下位ルールが予期しない部分日上限を生成" },
    resolution: { en: "Isolated conflicting layers using controlled test scenario; removed redundant interval definition from lower layer", fr: "Couches conflictuelles isolées via un scénario de test contrôlé ; définition d'intervalle redondante supprimée de la couche inférieure", es: "Se aislaron las capas en conflicto usando escenario de prueba controlado; se eliminó la definición de intervalo redundante de la capa inferior", ja: "管理テストシナリオで競合レイヤーを特定；下位レイヤーの冗長なインターバル定義を削除" },
    outcome: { en: "Resolved", fr: "Résolu", es: "Resuelto", ja: "解決済み" },
    region: "APAC",
    similarity: 0.87,
  },
};

/* ---- Knowledge & best practices (distinct authority levels) ---- */
const KNOWLEDGE = {
  "kb-demo-204": {
    id: "KB-DEMO-204",
    authority: AUTHORITY.POLICY,
    title: { en: "Configuration Troubleshooting Guide", fr: "Guide de dépannage de configuration", es: "Guía de resolución de problemas de configuración", ja: "構成トラブルシューティングガイド" },
    excerpt: {
      en: "Review areas: rule hierarchy, calculation sequence, interval definitions, supporting adjustment logic, policy conditions, and test scenario design. When troubleshooting unexpected reimbursement results, systematically validate each configuration layer before modifying values.",
      fr: "Domaines de revue : hiérarchie des règles, séquence de calcul, définitions d'intervalles, logique d'ajustement, conditions de politique et conception de scénarios de test. Lors du dépannage de résultats de remboursement inattendus, valider systématiquement chaque couche de configuration avant de modifier les valeurs.",
      es: "Áreas de revisión: jerarquía de reglas, secuencia de cálculo, definiciones de intervalos, lógica de ajuste de soporte, condiciones de política y diseño de escenarios de prueba. Al resolver resultados de reembolso inesperados, validar sistemáticamente cada capa de configuración antes de modificar valores.",
      ja: "確認領域：ルール階層、計算順序、インターバル定義、サポート調整ロジック、ポリシー条件、テストシナリオ設計。予期しない精算結果のトラブルシューティング時は、値を変更する前に各構成レイヤーを体系的に検証してください。",
    },
    sourceOfRecord: "English",
    status: { en: "Approved", fr: "Approuvé", es: "Aprobado", ja: "承認済み" },
  },
  "play-demo-015": {
    id: "PLAY-DEMO-015",
    authority: AUTHORITY.PLAYBOOK,
    title: { en: "Confirm configuration precedence before changing reimbursement values", fr: "Confirmer la priorité de configuration avant de modifier les valeurs de remboursement", es: "Confirmar la precedencia de configuración antes de cambiar valores de reembolso", ja: "精算値を変更する前に構成の優先順位を確認する" },
    excerpt: {
      en: "Validated team best practice: Always review the full rule evaluation sequence and supporting adjustment logic before modifying any reimbursement configuration value. This prevents unintended cascading changes across related rules.",
      fr: "Bonne pratique d'équipe validée : Toujours examiner la séquence complète d'évaluation des règles et la logique d'ajustement avant de modifier toute valeur de configuration de remboursement. Cela empêche les modifications en cascade non intentionnelles.",
      es: "Mejor práctica de equipo validada: Siempre revisar la secuencia completa de evaluación de reglas y la lógica de ajuste antes de modificar cualquier valor de configuración de reembolso. Esto previene cambios en cascada no intencionados.",
      ja: "検証済みチームベストプラクティス：精算構成値を変更する前に、必ずルール評価シーケンス全体とサポート調整ロジックを確認してください。これにより、関連ルール間の意図しないカスケード変更を防止します。",
    },
    sourceOfRecord: "English",
    status: { en: "Validated", fr: "Validé", es: "Validado", ja: "検証済み" },
  },
  "play-proposed-test": {
    id: "PLAY-PROPOSED-001",
    authority: AUTHORITY.CONVERSATION,
    title: { en: "Proposed: Use a controlled test scenario to isolate each configuration layer", fr: "Proposé : Utiliser un scénario de test contrôlé pour isoler chaque couche de configuration", es: "Propuesta: Usar un escenario de prueba controlado para aislar cada capa de configuración", ja: "提案：各構成レイヤーを分離するために管理テストシナリオを使用する" },
    excerpt: {
      en: "Suggested by a team member based on successful resolution of CRM-DEMO-114. Before applying configuration changes to a broader setup, use a controlled test scenario to isolate and validate each configuration layer independently.",
      fr: "Suggéré par un membre de l'équipe sur la base de la résolution réussie de CRM-DEMO-114. Avant d'appliquer des modifications de configuration à une configuration plus large, utiliser un scénario de test contrôlé pour isoler et valider chaque couche indépendamment.",
      es: "Sugerido por un miembro del equipo basado en la resolución exitosa de CRM-DEMO-114. Antes de aplicar cambios de configuración a una configuración más amplia, usar un escenario de prueba controlado para aislar y validar cada capa independientemente.",
      ja: "CRM-DEMO-114の成功した解決に基づきチームメンバーが提案。より広い設定に構成変更を適用する前に、管理テストシナリオを使用して各構成レイヤーを独立して分離・検証する。",
    },
    sourceOfRecord: "English",
    status: { en: "Pending SME Review", fr: "En attente de revue SME", es: "Pendiente de revisión SME", ja: "SMEレビュー待ち" },
    workflow: "Team insight → Proposed best practice → Pending SME review → Approved playbook entry",
  },
};

/* ---- Team context ---- */
const TEAM_CONTEXT = {
  threadSummary: {
    en: "A team member reported unexpected partial-day results in a multi-day international travel reimbursement configuration scenario. The likely investigation areas are travel-duration classification, rule precedence, and supporting calculation or adjustment logic.",
    fr: "Un membre de l'équipe a signalé des résultats partiels inattendus dans un scénario de configuration de remboursement de voyage international multi-jours. Les domaines d'investigation probables sont la classification de durée de voyage, la priorité des règles et la logique de calcul ou d'ajustement.",
    es: "Un miembro del equipo reportó resultados de día parcial inesperados en un escenario de configuración de reembolso de viaje internacional de varios días. Las áreas de investigación probables son la clasificación de duración del viaje, la precedencia de reglas y la lógica de cálculo o ajuste.",
    ja: "チームメンバーが複数日の海外出張精算設定シナリオで予期しない部分日の結果を報告しました。調査すべき領域は、出張期間の分類、ルールの優先順位、計算または調整ロジックです。",
  },
  capabilities: {
    en: [
      "Summarize the thread and identify key investigation areas",
      "Surface related historical CRM cases",
      "Identify approved knowledge and validated practices",
      "Suggest subject matter experts",
      "Draft a response for human review",
      "Convert the final resolution into a proposed knowledge entry",
    ],
    fr: [
      "Résumer le fil et identifier les domaines d'investigation clés",
      "Faire remonter les cas CRM historiques connexes",
      "Identifier les connaissances approuvées et les pratiques validées",
      "Suggérer des experts du domaine",
      "Rédiger une réponse pour revue humaine",
      "Convertir la résolution finale en entrée de connaissance proposée",
    ],
    es: [
      "Resumir el hilo e identificar áreas clave de investigación",
      "Mostrar casos CRM históricos relacionados",
      "Identificar conocimiento aprobado y prácticas validadas",
      "Sugerir expertos en la materia",
      "Redactar una respuesta para revisión humana",
      "Convertir la resolución final en una entrada de conocimiento propuesta",
    ],
    ja: [
      "スレッドを要約し、主要な調査領域を特定する",
      "関連する過去のCRM事例を表示する",
      "承認済み知識と検証済み実践を特定する",
      "該当分野の専門家を提案する",
      "人間のレビュー用に回答を下書きする",
      "最終解決策を提案済み知識エントリに変換する",
    ],
  },
  experts: [
    { person: "lena", reason: { en: "Handled similar interval-classification issues in EMEA configurations", fr: "A traité des problèmes similaires de classification d'intervalles dans les configurations EMEA", es: "Manejó problemas similares de clasificación de intervalos en configuraciones EMEA", ja: "EMEAの構成でインターバル分類の類似問題を処理" } },
    { person: "rajesh", reason: { en: "Configuration Team Lead with cross-region visibility; owns the configuration standard approval process", fr: "Chef d'équipe configuration avec visibilité inter-régions ; responsable du processus d'approbation des standards", es: "Líder del equipo de configuración con visibilidad inter-regional; responsable del proceso de aprobación de estándares", ja: "構成チームリード、地域横断の可視性；構成基準承認プロセスの責任者" } },
    { person: "yuki", reason: { en: "Systems Analyst specializing in calculation sequence and rule precedence validation", fr: "Analyste systèmes spécialisée dans la séquence de calcul et la validation de priorité des règles", es: "Analista de sistemas especializada en secuencia de cálculo y validación de precedencia de reglas", ja: "計算順序とルール優先順位の検証を専門とするシステムアナリスト" } },
  ],
};

/* ---- Governance hierarchy ---- */
const GOVERNANCE_HIERARCHY = [
  { rank: 1, en: "Approved policy or procedure", fr: "Politique ou procédure approuvée", es: "Política o procedimiento aprobado", ja: "承認済みポリシーまたは手順" },
  { rank: 2, en: "Validated team playbook", fr: "Guide d'équipe validé", es: "Manual de equipo validado", ja: "検証済みチームプレイブック" },
  { rank: 3, en: "Historical CRM precedent", fr: "Précédent CRM historique", es: "Precedente CRM histórico", ja: "過去のCRM事例" },
  { rank: 4, en: "Team conversation or unvalidated suggestion", fr: "Conversation d'équipe ou suggestion non validée", es: "Conversación de equipo o sugerencia no validada", ja: "チーム会話または未検証の提案" },
];

/* ---- Best practice workflow (self-approval impossible) ---- */
const BP_WORKFLOW = {
  steps: [
    { en: "Team insight", fr: "Insight d'équipe", es: "Insight de equipo", ja: "チームインサイト" },
    { en: "Proposed best practice", fr: "Bonne pratique proposée", es: "Mejor práctica propuesta", ja: "提案済みベストプラクティス" },
    { en: "Pending SME review", fr: "En attente de revue SME", es: "Pendiente de revisión SME", ja: "SMEレビュー待ち" },
    { en: "Approved playbook entry", fr: "Entrée de guide approuvée", es: "Entrada de manual aprobada", ja: "承認済みプレイブックエントリ" },
  ],
  note: {
    en: "A contributor cannot self-approve a best practice. SME review is always required.",
    fr: "Un contributeur ne peut pas auto-approuver une bonne pratique. La revue SME est toujours requise.",
    es: "Un contribuyente no puede auto-aprobar una mejor práctica. La revisión SME siempre es requerida.",
    ja: "貢献者はベストプラクティスを自己承認できません。SMEレビューが常に必要です。",
  },
};

window.HUB_DATA = {
  AUTHORITY,
  NAV_ITEMS,
  TEAMS,
  PEOPLE,
  CONVERSATION,
  DEMO_QUESTION,
  RECOMMENDATIONS,
  CRM_CASES,
  KNOWLEDGE,
  TEAM_CONTEXT,
  GOVERNANCE_HIERARCHY,
  BP_WORKFLOW,
};
