import type { AuthoredDay } from './types';

export const day78: AuthoredDay = {
  reviewedAt: '2026-11-12',
  revision: '逐课编写 1.0',
  deliverable: '一张遮挡夹持的状态、观测与动作图，一组跨回合拒绝用例，以及信息采集的离线比较表。共 100 分钟。',
  question: {
    title: '两段回放最后一帧相同，一段此前见到夹持成功的线索，另一段曾见物体滑落。短时限后环境 reset，应如何组织训练样本和闭环对照？',
    summary: '解释观测混叠，用已执行动作更新信念，保留真正的后继观测与截止原因。',
    keywords: ['观测混叠', '信念', '执行动作', '后继观测', '截断', '配对'],
    reference: '定义持稳与松脱为隐藏状态，分别用回合内历史形成先验，再用已执行动作预测下一状态，用新观测似然更新。回放记录原回合与步号、执行动作、结束位及 reset 前的后继观测；外部时限截断切断序列，留出从真实后继 bootstrap 的条件。用相同隐藏初值和时限比较单帧、历史和主动观测，按每回合任务成功、超时和恢复成本评价。',
  },
  lessons: {
    foundation: {
      title: 'MDP 与部分可观测性',
      minutes: 35,
      prerequisites: '复习 9 月 4 日的 Bellman target，并带上 11 月 15–16 日的动作与反馈日志合同。',
      connection: '今天先判断日志里哪一个量能作为决策状态。11 月 18 日将在同一回合里计算多步回报。',
      intro: '从遮挡下的持稳与松脱出发，推导动作条件的贝叶斯滤波。',
      outcomes: ['识别观测混叠与隐藏状态', '手算一次预测和校正并解释失败条件'],
      sections: [
        {
          heading: '从系统状态和策略输入分别建模',
          body: '设合成夹持任务的真实状态包含物体是否持稳、夹爪位置与接触条件。若给定当前状态和动作，下一状态与即时奖励的联合分布对更早历史不再改变，这个状态满足 Markov 条件。物理系统可带噪声，条件独立性仍能成立。时限属于任务时，剩余步数也可能是状态的一部分，因为同一姿态在最后一步与中途的决策价值不同。\n\n策略实际只拿到夹爪开度和相机图像。遮挡时两种夹持结果可有相同开度与像素，后续执行同一提升动作却可能有不同结果。这种观测混叠需要用历史区分，或等待新的可辨识证据。先画出仿真可记录的真值、上线能读取的观测和训练可额外使用的标签，确保评测策略没有读取隐藏真值。',
          formulas: [{ latex: String.raw`P(s_{t+1},r_t\mid s_{0:t},a_{0:t})=P(s_{t+1},r_t\mid s_t,a_t)`, explanation: 's 为环境状态，a 为环境实际接收的动作，r_t 是从 t 到 t+1 得到的即时奖励。概率条件在本课假设的动态模型内成立。' }],
          sourceIds: ['mit'],
        },
        {
          heading: '把动作传播与传感校正接起来',
          body: '先对每个可能的旧状态乘以进入新状态的转移概率，再求和得到预测信念。这一步吸收动作的效果，因此动作被护栏改写后，应使用执行版本对应的核。随后把每个新状态的预测质量乘上当前观测在该状态下的似然。所有乘积的总和是这个观测的边际概率，除以它使总概率回到一。\n\n本课假设观测只依赖新状态与已执行动作。实际若可见奖励也泄露夹持结果，可将奖励并入观测似然。分母为零表示所用模型完全不允许该证据，需检查错帧、模型支持或缺失传感器。本例用已知离散概率表，连续接触力和未知噪声在实际系统中需要另做建模与标定。',
          formulas: [{ latex: String.raw`\bar b_{t+1}(s')=\sum_s T(s'\mid s,a_t)b_t(s),\qquad b_{t+1}(s')=\frac{O(o_{t+1}\mid s',a_t)\bar b_{t+1}(s')}{\sum_u O(o_{t+1}\mid u,a_t)\bar b_{t+1}(u)}`, explanation: 'b_t 是由回合历史形成的后验，T 是状态转移核，O 是观测似然。s′ 与 u 都遍历下一状态，所有概率无量纲。' }],
          sourceIds: ['mit'],
        },
        {
          heading: '同一帧也可保留不同信念',
          body: '用持稳 H、松脱 L 两态。若先验持稳概率 0.60，执行后的持稳条件概率分别是 0.90 与 0.10，则预测质量为 0.60×0.90+0.40×0.10=0.58。若看到线索 C，在两态下的似然分别为 0.80 与 0.20，持稳权重为 0.464，松脱权重为 0.084，归一后约 0.847。若下一张图只有遮挡标志且在两态下等概率，校正会保留该拍的预测信念。\n\n比较另一条历史，先验持稳只有 0.20。用同一动作核预测得 0.26，即使当前也是遮挡标志，后验依旧是 0.26。只保留最后一帧的策略必须给两段历史同一个决策，显式信念则可以分别进入继续观察或任务评估。例中概率是教学参数，可以手算复核。',
        },
        {
          heading: '检查记忆有无提供决策信息',
          body: '从公开合成回放中选相同当前帧、不同接触历史的样本，固定下一步动作，比较两组滑落频率。若不同历史给出的结果分布系统性不同，单帧仍有未解释的信息。若加入更早画面后改善仅发生在按固定时钟运行的任务，需加入随机暂停并控制物体进度，防止模型用经过时间猜答案。\n\n工程上把观测缺失、可见但低信噪、与上一帧重复送达分别编码。只有在缺失与状态无关的假设下，缺帧才适合直接沿用预测分布。对 RAW 与 RGB 输入可以先固定动作和真实状态分组，量化各模态在遮挡之外增加的似然分辨力，并对传感器延迟单独计时。',
        },
      ],
      points: ['Markov 条件约束状态的充分性。', '先传播动作效果，再根据证据更新。', '观测一样时历史仍可改变决策。'],
      codeTitle: 'grip_belief.py · 两态信念的预测与校正',
      code: `from math import isclose

def posterior(prior, p_hold_after_hold, p_hold_after_loose, likelihood):
    predicted = prior * p_hold_after_hold + (1 - prior) * p_hold_after_loose
    hold = predicted * likelihood[0]
    loose = (1 - predicted) * likelihood[1]
    evidence = hold + loose
    if evidence == 0:
        raise ValueError('observation outside model support')
    return hold / evidence

assert isclose(posterior(.60, .90, .10, (.80, .20)), .464 / .548)
assert isclose(posterior(.60, .90, .10, (.50, .50)), .58)
assert isclose(posterior(.20, .90, .10, (.50, .50)), .26)
try:
    posterior(.60, .90, .10, (0., 0.))
except ValueError:
    print('two histories differ and unsupported evidence is rejected')
else:
    raise AssertionError('zero evidence cannot be normalized')`,
      codeNotes: ['约定概率参数已标定且在 [0,1]，似然顺序为 H、L。预测折叠为一个标量，另一个状态用补概率。', '两条历史在等似然遮挡下得到不同后验。负例明确拒绝归一化，代码只处理合成概率。'],
      exercise: { prompt: '换成偏向松脱的观测', steps: ['沿用 0.58 的预测持稳概率。', '在 H 与 L 下将观测似然改为 0.20 和 0.80，计算后验。'], solution: '两项权重是 0.116 和 0.336，总和 0.452，持稳概率约为 0.257。线索改变了相对权重。' },
      quiz: { question: '摄像头被手腕遮住，缺帧主要发生在夹爪贴近物体时。可以将缺帧似然设为两态完全相同吗？', hint: '先问遮挡机制是否和姿态、接触结果或动作相关。', keywords: ['似然', '缺失机制', '条件依赖', '后验'], reference: '需要按姿态和动作核对缺失与状态的依赖。只有条件独立时才可用等似然保持该拍的预测信念，否则缺失本身含有信息。' },
      sources: [
        { id: 'mit', label: 'MIT Underactuated Robotics · Planning Under Uncertainty', url: 'https://underactuated.csail.mit.edu/belief.html', reading: '读 POMDPs 小节的离散状态、belief state、贝叶斯更新和 belief MDP。' },
      ],
    },
    code: {
      title: '实现 transition 数据结构',
      minutes: 40,
      prerequisites: '会读 Python dataclass，熟悉上节的状态、动作、观测以及 11 月 15 日的执行标识。',
      connection: '从 11 月 16 日的固定夹具中抽取单步数据。11 月 18 日会沿这些边界累计 n-step return。',
      intro: '对照 Gymnasium 的 step 和 TimeLimit，写一个拒绝跨回合连接的 transition。',
      outcomes: ['追踪动作怎样进入状态转移核', '区分序列边界与价值 bootstrap 掩码'],
      sections: [
        {
          heading: '从 FrozenLake 的状态表跟到外层包装',
          body: '在 Gymnasium v1.2.3 的 FrozenLakeEnv.__init__ 中，网格行列被编码为整数 s，P[s][a] 是候选边列表。每项依次包含抽样概率、后继整数状态、奖励、终止位。打滑时把请求方向和两个侧方向分别添入表中；边界可能使两项落在同一格。若要计算状态核，需要把通向同一后继的质量相加。\n\nFrozenLakeEnv.step 依据候选边权重抽样，将 s 写回内部状态，然后返回 int(s)、r、terminated、False 和 info 中的抽样边权重。此环境返回的整数格子可直接识别状态。TimeLimit.step 在底层调用之后累加步数，达到步数上限时把 truncated 设为 True，因此同一拍可以同时终止和截断。',
          sourceIds: ['lake', 'limit'],
        },
        {
          heading: '将物理动作与下一次决策观测配对',
          body: '写成回放结构时用同一 episode_id 的 step 和 step+1 确认相邻观测，第二帧必须来自该次环境更新。对机器人还应保存控制器实际接收的执行动作，另列策略提议和裁剪事件以供诊断。教学代码把观测简化为分类整数，把动作简化成离散索引；没有实现动力学、相机解码和控制器。\n\n批处理时可以把批维 B 上的整数观测向量编码为特征，奖励和两个标志各为 B 个标量。若保留相机则另记 B×C×H×W、时间与有效性掩码。回放 transition 仍存储观测，只有确实可得的仿真真值才单列为调试标签。若下一帧来自自动 reset，使用接口提供的最终观测或隔离该样本，不能拿新回合开场帧代填。LeRobot 的 G1 遥操作变更让同一侧外骨骼的一次串口读数同时供给关节解码与摇杆；回放可借用这种单次采样身份，把动作来源、采样时刻和观测分开落盘。',
          sourceIds: ['g1'],
        },
        {
          heading: '把停止序列和能否接价值分开',
          body: '对外部截断，轨迹采集到此结束，训练目标仍可用截断前真实后继估计继续任务的价值。对任务定义中的终止，后继价值项置零。若固定的有限期限本来属于任务目标，到期可作为终止，并将剩余步数纳入可用状态以说明不同时间的含义。\n\n两标志同时为真时照样保留两位，后继价值按终止置零。真实机器人突然失联、执行状态未知或没有后继观测时，本示例的可 bootstrap 条件不完整，应在训练数据里显式标记。不要把未知动作直接当作零位移或假定已经结束。',
          sourceIds: ['farama'],
        },
        {
          heading: '给错序和 reset 写出可触发的负例',
          body: '正例是当前回合步号 4 到 5，两帧都存在且该拍仅外部截断，结束序列但允许 bootstrap。另一条用两标志同时为真检查优先级。负例用 reset 后的 episode_id 和倒序步号分别尝试配对，期望在构造时直接失败。实际向量环境还应把环境索引加入身份，避免同一批不同机器人样本串线。\n\n若日志丢一帧，不能简单以相邻落盘行代替真实相邻决策。固定步长训练需要剔除断裂段或从可信记录补齐，若研究可变步长动作，需增加持续时间和已累计奖励合同。先保存原始标志与采集结束原因，便于后续训练按已声明的任务定义重建掩码。',
        },
      ],
      points: ['P[s][a] 的一个条目是一条可抽样边。', '保留终止与截断两个标志。', '截断后开场帧不参与上回合的价值估计。'],
      codeTitle: 'observed_transition.py · 回合边界和 bootstrap',
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Observation:
    episode: str
    step: int
    symbol: int

@dataclass(frozen=True)
class Transition:
    observation: Observation
    executed_action: int
    reward: float
    successor: Observation
    terminated: bool
    truncated: bool

    def __post_init__(self):
        before, after = self.observation, self.successor
        if after.episode != before.episode or after.step != before.step + 1:
            raise ValueError('successor must be the next step in this episode')

    @property
    def boundary(self):
        return self.terminated or self.truncated

    @property
    def bootstrap(self):
        return not self.terminated

before = Observation('trial-a', 4, 0)
after = Observation('trial-a', 5, 1)
timeout = Transition(before, 1, .2, after, False, True)
both = Transition(before, 1, 1., after, True, True)
assert timeout.boundary and timeout.bootstrap
assert both.boundary and not both.bootstrap
for wrong in (Observation('trial-b', 0, 0), Observation('trial-a', 3, 0)):
    try:
        Transition(before, 1, 0., wrong, False, True)
    except ValueError:
        continue
    raise AssertionError('invalid transition was accepted')
print('truncation retains the final observation and rejects reset and reverse order')`,
      codeNotes: ['构造器假定调用方已核对观测有效、执行已知且步号是决策边界，再检查同回合和相邻性。', 'boundary 控制回放切段，bootstrap 对应任务未终止且已提供真实后继的本例输入。'],
      exercise: { prompt: '核对同拍终止与时限', steps: ['在最后一个允许步到达目标，任务奖励 1。', '写出两个标志、是否切段及是否使用下一状态价值。'], solution: 'Gymnasium v1.2.3 的包装可同时返回 True 和 True。回放切段，目标按终止不加后继价值。' },
      quiz: { question: '外层时限截断且自动 reset 返回新回合第一帧，为什么用该帧估值会污染目标？', hint: '检查后继是由哪一次动作和哪一个回合生成的。', keywords: ['截断', '回合身份', '最终观测', 'bootstrap'], reference: '目标需要当前动作生成的真实后继。reset 产生的开场帧来自新初值分布。应提取同回合最终观测，缺失时标记该样本不可用于这种目标。' },
      sources: [
        { id: 'lake', label: 'Farama Gymnasium v1.2.3 · FrozenLakeEnv', url: 'https://github.com/Farama-Foundation/Gymnasium/blob/v1.2.3/gymnasium/envs/toy_text/frozen_lake.py', reading: '读 __init__ 中 self.P、update_probability_matrix，以及 step 和 reset。' },
        { id: 'limit', label: 'Farama Gymnasium v1.2.3 · TimeLimit', url: 'https://github.com/Farama-Foundation/Gymnasium/blob/v1.2.3/gymnasium/wrappers/common.py', reading: '读 TimeLimit.step 中底层调用、步数累加和 truncated 分支。' },
        { id: 'farama', label: 'Farama · Deep Dive: Gymnasium Step API', url: 'https://farama.org/Gymnasium-Terminated-Truncated-Step-API', reading: '读 Termination vs Truncation 和 Theory，核对 bootstrap 条件。' },
        { id: 'g1', label: '选读 · LeRobot G1 遥操作主线更新', url: 'https://github.com/huggingface/lerobot/commit/1ef599dc5a7fd6aca6ad2ded8cf710e4d0e3f1be', reading: '读 UnitreeG1Teleoperator.get_action 与 ExoskeletonArm.angles_from_raw 中同一原始样本的使用，检查测试如何区分无线和外骨骼。' },
      ],
    },
    insight: {
      title: '机器人为何常常是 POMDP',
      minutes: 25,
      prerequisites: '能解释似然、遮挡与外部时限，知道候选模型和控制器的接口职责。',
      connection: '将 11 月 16 日的配对验收方法用于可观测性对照。下一课把观测成本和延迟写进回报。',
      intro: '用显式信念、有限历史和主动查看解决不同的信息缺口。',
      outcomes: ['估算主动观测在截止风险下的净收益', '区分仿真真值、策略输入和世界模型输出'],
      sections: [
        {
          heading: '先给记忆和传感器同一场考试',
          body: '固定初始夹持状态、遮挡条件和执行策略，比较单帧、近三帧和显式两态滤波三种输入。持稳真值只进入评测记录。三帧特征有机会看出刚发生的滑动，代价是更长推理路径和对时间对齐的依赖；显式滤波能报告持稳概率，却依赖动力学和观测似然在新材料、光照与速度下仍有效。\n\n若三帧都在遮挡后，延长历史可追溯到较早线索，但会引入累积漂移。加入一次改变视角的动作有机会直接增加信息，成本是时间、额外动作失败和视角后处理。使用相同实例及截止条件，分组记录误判、恢复、超时、控制层拒绝和人工接管率；有接管的回合仍计入分母。',
        },
        {
          heading: '手算一次主动观测的收益',
          body: '假定两隐藏状态等概率，单帧没有辨识力，盲选动作对一半状态有效，成功奖励为 1，失败为 0。主动查看的合成分类正确率为 0.85，查看成本为 0.05 奖励单位。设 q 是查看后超过截止时间的概率，超时时任务奖励为 0；另假设未超时时分类正确率仍是 0.85，成本每次都支付。\n\nq 为 0.20 时，净值为 0.63，比盲选的 0.50 高。q 达到 0.40 时，净值降至 0.46。令 0.85(1−q)−0.05 大于 0.50，可得 q 小于约 0.353。若更难辨识的视角也更容易超时，需要直接估计准时且选对的联合概率，再减掉成本。',
          formulas: [{ latex: String.raw`J_{\mathrm{view}}=(1-q)c-k,\qquad q<1-\frac{J_{\mathrm{blind}}+k}{c}`, explanation: 'c 为准时条件下正确率，q 为超时概率，k 是以单位成功奖励为基准的固定观测成本。c>0 时右式给主动查看严格占优的条件。' }],
        },
        {
          heading: '分开环境生成、表征预测和动作执行',
          body: 'StanfordVL 的 BEHAVIOR/OmniGibson 提供任务实例、交互模拟及评测协议，可用模拟器状态给夹持和遮挡分组，策略侧只读声明允许的输入。World Labs R2S2R 从现实任务的空间与交互证据重建环境，提供改变视角或外观的仿真对照。拿这些环境研究可观测性，仍需检查遮挡是否改变物理接触与行为分布。\n\nMeta/FAIR V-JEPA 2-AC 用相机及末端状态预测动作条件下未来的视觉表征，候选序列由规划器比较目标距离，Franka 低层执行第一步后再观测。可在离线对照里检查潜表征是否保留滑落线索，再用交互试验比较恢复。AMI Labs 官网描述表征预测、行动和可靠性方向，此处仅作为研究线索，不从中提取当前系统指标。',
          sourceIds: ['behavior', 'world', 'jepa', 'ami'],
        },
        {
          heading: '把信息请求做成可核对的闭环事件',
          body: '在软件仿真中让 Agent 读取当前帧、夹持信念与剩余时间，按明确的可用动作表请求补观测或调用现有技能。若要调用 VLA，可把新鲜图像、目标及技能请求送给它，输出再经过执行层；若用世界模型，先比较候选轨迹再交给低层。反馈携带请求身份、实测观测和完成或超时原因。\n\n早期 uni-robot-agent 的作者系统用请求身份避免反馈丢失后重复动作，动作工具回传图像、误差和停止原因。借这个接口思路做合成超时回放，分别量出补观测往返、重新决策和闭环恢复耗时。记录执行未知后是否阻止再次提交，并为人工接管留单独结果；课程例子仅比较离线期望值。',
          sourceIds: ['agent', 'rlc'],
        },
      ],
      points: ['显式信念依赖观测与转移模型的适用性。', '主动查看的价值需要扣除截止和成本。', '仿真标签、策略表征与执行反馈分别留痕。'],
      codeTitle: 'view_budget.py · 查看价值的精确枚举',
      code: `from math import isclose

def score_view(c, q, cost):
    if not (0 <= c <= 1 and 0 <= q <= 1 and cost >= 0):
        raise ValueError('invalid probability or cost')
    events = ((q, 0), ((1 - q) * c, 1), ((1 - q) * (1 - c), 0))
    return sum(probability * reward for probability, reward in events) - cost

assert isclose(score_view(.85, .20, .05), .63)
assert score_view(.85, .20, .05) > .50
assert isclose(score_view(.85, .40, .05), .46)
assert score_view(.85, .40, .05) < .50
assert score_view(.85, 1., .05) == -.05
try:
    score_view(.85, 1.1, .05)
except ValueError:
    print('view value flips under a deadline; invalid probability rejected')
else:
    raise AssertionError('impossible deadline probability accepted')`,
      codeNotes: ['枚举超时、准时选对、准时选错三条互斥结果。c 按准时样本定义，始终扣除固定查看成本。', '断言检验推荐翻转、必然超时和非法概率。未模拟感知噪声或机械臂动作。'],
      exercise: { prompt: '用新模态降低对视角补采的要求', steps: ['假设保留当前画面的基线改用可用触觉，盲选净值提高到 0.65。', '保持 c=0.85、k=0.05，计算允许的最大超时概率。'], solution: '严格占优需 q<1−0.70/0.85≈0.1765。q 等于该阈值时，两者在简化目标下持平。' },
      quiz: { question: '加入第二视角后只在准时回合报告 85% 正确率，如何判断它是否改善完整任务？', hint: '还缺全分母、截止和成本，想想人工接管如何计数。', keywords: ['截止', '全回合', '联合概率', '观测成本', '配对'], reference: '固定回合与预算，记录准时且完成的联合比例、所有超时、接管与延迟。将成本按全部查看回合计入，与同实例的单视角基线比较。' },
      sources: [
        { id: 'behavior', label: 'StanfordVL BEHAVIOR · Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '读 Running Evaluations、Metrics and Results，检查交互任务的实例与截止语义。' },
        { id: 'world', label: 'World Labs · R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读重建验证、摄像机视角与训练环境变体，作为空间和外观的对照。' },
        { id: 'jepa', label: 'Meta/FAIR · V-JEPA 2 v1', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 §3.1 动作与本体状态输入、§4.1 真机相机、控制器和重规划条件。' },
        { id: 'ami', label: 'AMI Labs · 当前研究方向', url: 'https://amilabs.xyz/', reading: '读官网对世界模型、预测、计划与可靠性的研究目标。' },
        { id: 'agent', label: '选读 · uni-robot-agent v1', url: 'https://arxiv.org/html/2611.01560v1', reading: '读 §2.5 请求去重、停止与可诊断反馈，§3 区分仿真和真机。' },
        { id: 'rlc', label: '选读 · Robot Learning Collective 的 BEHAVIOR 参赛报告 v1', url: 'https://arxiv.org/html/2611.14432v1', reading: '读 §9.4–9.5 的 RGB-D 查询、控制器回流与 π0.5 回退，以及 §10 的公开实例、任务选样和耗时。用这个交互仿真案例比较主动取证与直接策略的时间预算。' },
      ],
    },
  },
};
