import type { AuthoredDay } from './types';

export const day77: AuthoredDay = {
  reviewedAt: '2026-11-12',
  revision: '逐课编写 1.0',
  deliverable: '按发布代号绑定的离线 smoke、固定夹具回归和发布验收记录，共 100 分钟。',
  question: {
    title: '候选策略完成 9/10 个仿真任务，旧版完成 8/10，候选只在一次过龄观测上发出了动作。你会如何签收这个版本？',
    summary: '同时处理版本身份、硬性不变量、配对回归及回退的证据。',
    keywords: ['版本身份', '不变量', '负例', '配对', '预算', '回退'],
    reference: '先核对候选与报告的制品和配置身份，并用固定过龄夹具复现旧观测放行，违反控制边界即阻止晋级。逐实例列出新版改善与退化，成功率差值不覆盖安全失败。用离线测试查边界，用交互仿真查新动作与后续状态，缺失证据标记为未完成。重新验收前核对上一版的配置和回退验证，保留本次负例作为固定回归。',
  },
  lessons: {
    foundation: {
      title: '部署验收与回归测试',
      minutes: 35,
      prerequisites: '理解事件身份、命令边界和真实测量，能区分可用性、任务成功与安全不变量。',
      connection: '把 11 月 15 日定位出的失败写进发布门。11 月 17 日将把这些轨迹组织成 RL 的 transition。',
      intro: '以旧帧放行问题为例，设计发布制品、证据和验收判据的对应关系。',
      outcomes: ['明确 smoke 与回归各能检验什么', '手算零次故障观测能支持的风险上界'],
      sections: [
        {
          heading: '让同一个候选贯穿全部证据',
          body: '为一个发布候选记录策略权重、预处理、标定、控制合同、夹具集合和后端版本。输出的测试记录引用这个清单身份，部署加载后读取实际身份再比较。只记 Git 版本可能漏掉外部权重与运行配置，只记 checkpoint 也可能漏掉单位转换或动作裁剪。内容哈希适合固定字节身份，环境能力与操作者授权仍需独立记录。\n\nReproducible Builds 将可复现构建定义在相同源代码、环境和构建指令得到相同制品的条件下。即使字节一致，设备固件或照明改变也可能导致效果变化。将制品一致性作为可追溯的前置项，部署结果另由回归和运行证据签收。',
          sourceIds: ['build'],
        },
        {
          heading: '先检验一个会失败的关键请求',
          body: 'Smoke 用少数确定性案例检查正常输入能到达软件输出边界、缺失或过龄观测会被拒绝、出错后能解释拒绝原因。选择一个夹具时要明确其预期结果由哪条合同决定。模拟发出新动作并检查事件链的测试，只能证明软件能抵达相应边界，不能推断编码器、力或制动正常。\n\n回归的范围比 smoke 更宽，覆盖曾出现的超时、错误代号、缺测和相机形状变化。把昨天的最小复现纳入长期夹具，保存固定预期而非只比最新版本的输出。若基线也会在同一危险输入上放行，只有对合同的绝对检查能捕捉共同失败。',
        },
        {
          heading: '零次故障提供多少信息',
          body: '假设每次是独立且具有相同故障概率 p 的 Bernoulli 试验，n 次全部未观察到故障的概率是 (1−p) 的 n 次方。令它等于 0.05，解出 p 的单侧 95% 上界。上界含义是该抽样假设下的频率置信界，和机器人已经有 95% 把握安全是两回事。\n\n30 次未见故障，上界仍约 9.5%。若希望上界不超过 1%，至少需要 299 次零故障的独立试验。反复播放同一确定性夹具可验证回归，但不构成 299 个独立场景。相同物体、设备漂移或同源视觉干扰会让样本相关，须按故障条件分组报告。',
          formulas: [{ latex: String.raw`P(X=0\mid p)=(1-p)^n,\qquad p_{\mathrm{upper}}=1-\alpha^{1/n},\qquad n\geq \frac{\log\alpha}{\log(1-p_\star)}`, explanation: 'n 是无量纲独立试验数，p 是固定单次故障概率，α 是单侧显著性水平，p_* 是目标上界。求试验数时向上取整。' }],
        },
        {
          heading: '把回退验证作为一个独立结果',
          body: '保留最近一次验收通过的制品及兼容配置，离线模拟切回后检查加载的身份、旧队列是否失效、关键 smoke 是否仍通过。软件版本恢复与设备恢复是两项证据，旧版也必须读取当前校准、观测和停止状态。等待回退的期间禁止把失联或未知当成通过。\n\nGoogle SRE 的渐进发布用受控暴露发现新版本问题，对照也可能受共享依赖影响。机器人作业涉及物理后果，教学以离线和仿真保守验收为主。小范围验证的顺序由风险和证据决定，课堂代码不发送控制指令。',
          sourceIds: ['sre'],
        },
      ],
      points: ['制品身份、运行配置和测试报告相互绑定。', '正向 smoke 要搭配失败夹具。', '零故障结论依赖代表性和独立性。'],
      codeTitle: 'zero_incidents.py · 零故障上界',
      code: `from math import ceil, expm1, log, log1p

def upper_bound(trials, alpha=.05):
    if not isinstance(trials, int) or trials < 1 or not 0 < alpha < 1:
        raise ValueError('require positive integer trial count and valid alpha')
    return -expm1(log(alpha) / trials)

def minimum_trials(target, alpha=.05):
    if not 0 < target < 1 or not 0 < alpha < 1:
        raise ValueError('probabilities must be strictly inside (0, 1)')
    return ceil(log(alpha) / log1p(-target))

assert .095 < upper_bound(30) < .096
n = minimum_trials(.01)
assert n == 299 and upper_bound(n) <= .01 < upper_bound(n - 1)
try:
    upper_bound(0)
except ValueError:
    print('299 trials and empty evidence rejected')
else:
    raise AssertionError('no observations cannot supply an upper bound')`,
      codeNotes: ['函数只处理零次故障的固定试验数，使用 expm1 和 log1p 减少小数差的精度损失。', '测试对 298/299 边界断言。无观察量拒绝计算，不输出 0 风险。'],
      exercise: { prompt: '核对重复回放的分母', steps: ['对 60 个独立零故障试验计算单侧 95% 上界。', '说明同一输入重复 60 次的验收结果能证明什么。'], solution: '1−0.05^(1/60) 约为 4.87%。固定夹具重复可以检查指定路径的稳定性，但无法借独立场景假设推出相同上界。' },
      quiz: { question: '权重哈希匹配且十次抓取都成功，为什么相机标定版本仍应进入发布清单？', hint: '权重之后的输入和执行坐标仍由哪些配置决定？', keywords: ['标定', '制品身份', '输入', '坐标', '可复现'], reference: '相同权重配不同标定时，像素到几何、坐标变换与控制结果可改变。测试证据只覆盖其实际运行组合；核对标定版本及其兼容性才能复现该组合。' },
      sources: [
        { id: 'build', label: 'Reproducible Builds · Definition', url: 'https://reproducible-builds.org/docs/definition/', reading: '读定义对源、构建环境、指令和指定制品的要求。' },
        { id: 'sre', label: 'Google SRE Workbook · Canarying Releases', url: 'https://sre.google/workbook/canarying-releases/', reading: '读 Canary Population and Duration、Dependencies and Isolation。' },
      ],
    },
    code: {
      title: '编写 smoke test 和安全 checklist',
      minutes: 40,
      prerequisites: '会写 Python 断言，理解上一课中观测来源和动作候选身份。',
      connection: '将昨天定位的旧帧、错代号和缺测抽成夹具，给明天的 transition 测试保留准确的终止证据。',
      intro: '借 kubectl 的发布观察逻辑设计可拒绝过时报告的离线验收门。',
      outcomes: ['读懂 watch 事件与版本就绪判定', '给候选制品的失败与缺测写独立断言'],
      sections: [
        {
          heading: '定位 rollout status 的观察与判定',
          body: '在 Kubernetes v1.34.1 的 rollout_status.go，RolloutStatusOptions.Run 通过资源名和命名空间建立 ListWatch。Added 和 Modified 事件进入对应资源的 StatusViewer，返回完成或错误；Deleted 事件使命令退出，避免等待同名重建对象。关闭 watch 只取当时状态，可以在未完成时正常结束，因此脚本不能只把命令退出当成工作负载就绪。\n\n进一步读 DeploymentStatusViewer.Status。给出 revision 时先核对部署修订号，随后检查 observedGeneration 是否追上 Generation，再查进度超时、新副本数、旧副本是否退出及新副本可用数。此处只验证发布控制面和工作负载条件。观测者无需知道机器人策略内容，应用自己的动作合同仍靠独立 smoke。',
          sourceIds: ['command', 'viewer'],
        },
        {
          heading: '把报告身份与内容绑定',
          body: '教学夹具输入是预期制品字符串、代号整数和多行报告。每行包括制品、代号、用例和结果。就绪情况简化成三个用例：新鲜输入通过、旧观测拒绝、执行反馈缺失时请求停止且标为待确认。输出以失败原因区分版本错误、缺项、重复和不符合合同。外层编排可据此保留上版，函数本身没有发布动作。\n\n从策略加载器和夹具驱动读取真实版本身份，比让上层测试命令手填常量更可信。课堂的字符串身份由调用方提供，信任上游采集器，未实现签名、并发发布、重试或真实控制面。report 若来自一个旧代号，即使结果完全相同也必须重测。',
        },
        {
          heading: '拒绝缺测和重复汇报',
          body: '一个空报告可能来自进程未启动、采集链断流或过滤条件失误。测试门将它归为 incomplete，并保持待办。重复用例存在不同结果时，选择最后一条会掩盖波动；当前合同规定每个用例只有一次聚合结果，把重复交回采集器处理。若设计多次回归，应显式增加重复次数和种子字段。\n\n结果字典中的字符串代表软件判定，不表示速度已降到阈值。对缺测夹具，正确值 pending 确认表示没有吞掉停止请求，也没有过早宣布停止。与 11 月 14 日锁存的确认期限组合时，还要覆盖期限到达后触发升级的回归。',
        },
        {
          heading: '让 checklist 对应可审计的阶段',
          body: '把离线产物签收、仿真结果签收和设备确认分成三个独立字段。每次签收写明运行的候选身份、覆盖的夹具、结果与证明链接。若上一版不兼容当前输入，应当保留拒绝与未确认状态，回退切换不能为了恢复任务而跳过观测有效性或重新建立控制权限。\n\n示例用标量检查器替代真实驱动，输入里没有张量或物理参数。接入策略时还应验观测张量通道顺序和 dtype、动作维度与单位、时序编号及裁剪前后差异。课堂负例的价值是看清这些信息绑定失败时门如何关闭。',
        },
      ],
      points: ['控制面就绪与应用 smoke 都需取证。', '旧报告或重复报告不会晋级。', '缺失测量保持待确认。'],
      codeTitle: 'release_smoke.py · 固定代号的报告验收',
      code: `expected = {'fresh': 'accepted', 'stale': 'rejected', 'missing_feedback': 'pending'}

def evaluate(bundle, epoch, reports):
    seen = {}
    for reported_bundle, reported_epoch, case, outcome in reports:
        if (reported_bundle, reported_epoch) != (bundle, epoch):
            return 'version_mismatch'
        if case not in expected or case in seen:
            return 'invalid_case'
        seen[case] = outcome
    if seen.keys() != expected.keys():
        return 'incomplete'
    if seen != expected:
        return 'contract_failure'
    return 'smoke_pass'

rows = [('v2/rig-a', 7, case, outcome) for case, outcome in expected.items()]
assert evaluate('v2/rig-a', 7, rows[::-1]) == 'smoke_pass'
assert evaluate('v2/rig-a', 8, rows) == 'version_mismatch'
assert evaluate('v2/rig-a', 7, rows[:2]) == 'incomplete'
assert evaluate('v2/rig-a', 7, rows + rows[:1]) == 'invalid_case'
assert evaluate('v2/rig-a', 7, rows[:2] + [('v2/rig-a', 7, 'missing_feedback', 'stopped')]) == 'contract_failure'
assert evaluate('v2/rig-a', 7, rows[:1] + [('v2/rig-a', 7, 'stale', 'accepted')] + rows[2:]) == 'contract_failure'
print('smoke contract, stale identity and missing evidence verified')`,
      codeNotes: ['制品和代号校验早于按用例汇总，输入顺序不影响通过。', '负例分别覆盖陈旧报告、遗漏、重复、提前确认停止及误接收旧帧。'],
      exercise: { prompt: '把回退的旧报告隔离开', steps: ['假设 v1 曾在代号 6 通过，当前 v2 的代号 7 失败，计划回到 v1。', '写出回退后需要的报告与它应拒绝的陈旧回执。'], solution: '回到 v1 后仍分配新的代号，例如 8，以 v1 实际运行制品和代号 8 重跑三条用例；代号 6 和 7 的日志均不可充当这次验收。' },
      quiz: { question: '为什么 kubectl 部署状态已经完成，仍可能需要专门测试候选策略拒绝旧帧？', hint: '找出 StatusViewer 使用的字段，以及它没有读取的输入。', keywords: ['副本', '修订号', '应用合同', '采样年龄', '负例'], reference: '部署状态按修订、generation、进度与可用副本判定，未执行机器人观测和动作语义的测试。应把过龄观测送入候选版本并核对拒绝事件，绑定制品身份保留结果。' },
      sources: [
        { id: 'command', label: 'Kubernetes v1.34.1 · RolloutStatusOptions.Run', url: 'https://raw.githubusercontent.com/kubernetes/kubernetes/v1.34.1/staging/src/k8s.io/kubectl/pkg/cmd/rollout/rollout_status.go', reading: '读 Run 中 ListWatch、Revision 参数传递、完成与 Deleted 分支。' },
        { id: 'shards', label: '选读 · LeRobot 分片权重加载', url: 'https://github.com/huggingface/lerobot/commit/37aee5935534a11c0dd9be027a65fa8388ebd843', reading: '读 SafetensorsCheckpoint.shapes、tensors 和严格加载缺项测试，发布清单应包括索引和全部分片。' },
        { id: 'viewer', label: 'Kubernetes v1.34.1 · DeploymentStatusViewer.Status', url: 'https://raw.githubusercontent.com/kubernetes/kubernetes/v1.34.1/staging/src/k8s.io/kubectl/pkg/polymorphichelpers/rollout_status.go', reading: '读状态函数中的 revision、observedGeneration、deadline 和副本条件。' },
      ],
    },
    insight: {
      title: '一次成功演示为什么还不够',
      minutes: 25,
      prerequisites: '理解任务级成功与硬性安全判据，能阅读按实例组织的仿真记录。',
      connection: '用部署回归把前七天的动作、延迟与监督证据串起来；下一单元从固定评测转向奖励和策略改进。',
      intro: '用固定实例对照、失败优先的版本门和分层验证判断一次演示的价值。',
      outcomes: ['计算配对改善与退化并保留失败模式', '按成本选择离线、仿真和受控实测证据'],
      sections: [
        {
          heading: '同一平均差值可能掩盖失败迁移',
          body: '固定物体、目标、初始位姿、种子和评测预算，按每个实例成对运行基线和候选。记旧失败新成功的 n01 和旧成功新失败的 n10。成功率差的分子可通过抵消双方均成功和均失败的项得到。把两项一起报告，可判断改动改善了哪些例子、同时把问题迁到哪里。\n\n合成 10 次中，若两项分别是 2 和 1，差值为 10 个百分点；若分别是 1 和 0，差值也相同。前者多了一项退化需要定位。光照、接触或丢帧子集应单列，避免把一次危险放行平均进多数正常成功。小样本差值是筛查信号，不能独自证明泛化优势。',
          formulas: [{ latex: String.raw`\Delta \widehat p = \frac{n_{01}-n_{10}}{N}`, explanation: 'N 为固定配对实例数。n01 与 n10 分别为改善和退化对数，结果为比例，乘 100 转为百分点。' }],
        },
        {
          heading: '选择能回应失败的下一层',
          body: '离线夹具成本最低，适合快速确认拒绝旧帧和动作单位。若换策略后可能改变夹持接触，使用可执行候选动作的仿真再看后续状态。StanfordVL BEHAVIOR 协议规定任务实例、时间预算和超时记账，可借它约束同一批评测的分母；实际评分和对象几何仍属于该基准的配置。\n\nWorld Labs R2S2R 用现实任务的扫描、动作和结果校验重建，随后改变视角、照明或物理参数以生成交互经验。个人项目可以先为 RAW 与 RGB 做相同初始条件的仿真对照，再在具备独立验收的真实测量方案中确认域差。选择两种不同证据时要登记哪个不变量和哪个任务指标由它支持。Isaac Lab 的接触时间回归把位姿、速度和地形随机种子一起固定，首帧渲染回归则跨 reset 检查 Fabric 矩阵与深度。这两种夹具分别隔离动力学残留与图像发布滞后。',
          sourceIds: ['behavior', 'world', 'contact-test', 'reset-test'],
        },
        {
          heading: '将规划层改动单列验收',
          body: '若候选加入负责分解任务和重试的 Agent，单列状态识别准确率、检测到失败至发出恢复请求的时间、下游接管结果和实际任务恢复率。策略或控制器执行动作并送回观测；人工接管后，代理建议可继续留档，但不能自动恢复旧权限。先固定下游 VLA 比上层，再固定上层比较策略，能定位收益来自哪一层。Runway Praxis-1 的 Qwen3.5-2B 冻结编码器只处理语言，视频骨干与动作专家才输出视频潜变量与动作段；报告中 Franka/DROID 的 24 行对应 15 Hz 的 1.6 秒，段内执行与下一次观测刷新应分别计时。\n\nMeta/FAIR V-JEPA 2-AC 可作为规划层的对照例子：用视频和本体状态表示当前情境，比较候选序列的潜在结果与视觉目标距离，低层按机器人接口执行。固定目标还需记录失败和重规划时延，论文真机条件并非个人硬件验收。AMI Labs 的记忆、规划和安全是当前组织方向，后续仅在有实际评测材料时进入版本门。',
          sourceIds: ['jepa', 'ami', 'praxis'],
        },
        {
          heading: '从分数回到发布决定',
          body: '把硬性失效先写在报告顶部。观察到任何一次过龄放行、越过约定的软边界或丢失控制权后未按合同处理时，维持停在软件验收或仿真阶段。只有门槛都满足，再根据改进对和退化对判断是否值得花更多预算。用同样的种子和配置核对上一版，在共享故障时把问题归因留作未知。\n\n对低预算 SO-101 作品，一份注明合成或仿真条件、包含反例与回退验证的报告，更容易解释到底改善了什么。演示视频可以附在同一制品记录下，列出录制实例和挑选方式，之后再据实际测量说明覆盖范围。',
          sourceIds: ['sre'],
        },
      ],
      points: ['配对差值与退化清单一并输出。', '绝对安全门优先于平均收益。', '规划、执行和人工接管分层验收。'],
      codeTitle: 'release_pairs.py · 成功差值和阻断原因',
      code: `def paired_release(base, candidate, unsafe):
    if not base or base.keys() != candidate.keys() or not unsafe <= candidate.keys():
        raise ValueError('incomplete or inconsistent case identities')
    gain = sum(not base[key] and candidate[key] for key in base)
    loss = sum(base[key] and not candidate[key] for key in base)
    return gain, loss, (gain - loss) / len(base), sorted(unsafe)

base = {str(i): i < 8 for i in range(10)}
candidate = {str(i): i != 3 for i in range(10)}
assert paired_release(base, candidate, {'8'}) == (2, 1, .1, ['8'])
assert paired_release(base, candidate, set()) == (2, 1, .1, [])
try:
    paired_release(base, {'0': True}, set())
except ValueError:
    print('positive paired gain retains unsafe case and full denominator')
else:
    raise AssertionError('dropped case must fail')`,
      codeNotes: ['布尔字典表示合成任务完成结果，unsafe 是独立判据产生的实例集合。', '即使任务完成仍可出现 unsafe，列表非空即需要阻断。空列表仅表示该批夹具未触发。'],
      exercise: { prompt: '分别评价 2 个改善和 1 个退化', steps: ['在十个固定仿真实例中，把退化标为光照导致的失物，把一次改善标为过龄放行。', '给出差值、优先排查项和下一层验证。'], solution: '净成功率提高 10 个百分点，仍需阻止过龄放行。先用固定旧帧重放修复权限门，再在交互仿真复核光照退化与恢复时延；同一批配对实例要保留。' },
      quiz: { question: '为什么相同的成功率提升可能对应完全不同的发布风险？', hint: '分解改善与退化对，再加入一列独立的不变量。', keywords: ['配对退化', '成功率', '硬门槛', '分母', '故障类别'], reference: '同一净差值可来自小幅单向改善或同时发生大量改善与退化，平均值不会显示危险失效。保留每一对、按场景报告失败并用独立安全门决定是否阻断。' },
      sources: [
        { id: 'behavior', label: 'StanfordVL BEHAVIOR · Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-11-12 实读 Running Evaluations、预算和 Metrics and Results。' },
        { id: 'world', label: 'World Labs · Building Worlds That Train Robots', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读匹配开环交互的重建验证及 Sim-to-Real 中对训练扰动的定义。' },
        { id: 'praxis', label: '选读 · Runway Praxis-1 技术报告', url: 'https://runway.com/research/praxis-1-video-pretraining-to-robot-control', reading: '§2、§5 的语言编码、末端动作及观测回流，§7.3 的 YAM 对比仅限三项任务。' },
        { id: 'contact-test', label: '选读 · Isaac Lab OVPhysX 接触回归', url: 'https://github.com/isaac-sim/IsaacLab/commit/fc48dd6ceeab11825aeebcbfbde7f62c4a96c652', reading: '读 timing_terrain_seed 与 _test_sensor_contact 中的 pose/velocity 和单步记录。' },
        { id: 'reset-test', label: '选读 · Isaac Lab reset 首帧回归', url: 'https://github.com/isaac-sim/IsaacLab/commit/4c5343f0818871c1a824fe40c82535961f050aa1', reading: '读 reset 物理步计数、深度比较和直接读取 Fabric 矩阵的辅助函数。' },
        { id: 'jepa', label: 'Meta/FAIR · V-JEPA 2 v1', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 `3 动作条件输入与图像目标规划、`4 的真机执行与失败条件。' },
        { id: 'ami', label: 'AMI Labs 研究方向', url: 'https://amilabs.xyz/', reading: '实读表征预测、动作条件规划与安全的组织目标。' },
        { id: 'sre', label: 'Google SRE Workbook · Canarying Releases', url: 'https://sre.google/workbook/canarying-releases/', reading: '读依赖、隔离与绝对指标，课程按离线仿真夹具转换其比较方式。' },
      ],
    },
  },
};
