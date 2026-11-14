import type { AuthoredDay } from './types';

export const day79: AuthoredDay = {
  reviewedAt: '2026-11-14',
  revision: '逐课编写 1.0',
  deliverable: '一张稀疏奖励沿回放传播的手算表、一个可审计的多步目标函数和一份分层对照记录。共 100 分钟。',
  question: {
    title: '夹持回放依次得到 0、0、1，第三步外部采集截止，最后真观测价值为 0.4。取 γ=0.9、n=5，首步目标是多少，如何证明成功信用没有流入下一回合？',
    summary: '区分任务终止与采集截止，找出回放边界、有效步数和尾项来源，再解释公平对照。',
    keywords: ['稀疏奖励', '有效步数', '截断', '真实后继', 'bootstrap', '配对评测'],
    reference: '前三步实际被采集，成功信号在首步目标中是 0.9²×1，外部截断允许从同回合最后真观测补 0.9³×0.4，合计 1.1016。若该成功定义就是任务终止，尾项为零，得 0.81。按 episode、连续步号、控制 tick 与最终帧身份检查窗口，明确标记成功与采集原因，配对比较 n=1 和 n=5 的闭环成功和恢复分层。',
  },
  lessons: {
    foundation: {
      title: 'Return、discount 与 credit assignment',
      minutes: 35,
      prerequisites: '复习 9 月 4 日一步 Bellman 目标和 11 月 17 日的终止、截断及观测身份。',
      connection: '今天让一段已发生的后续奖励进入当前目标。11 月 19 日再拆出状态价值、动作价值和优势。',
      intro: '用放置成功的稀疏奖励推导多步目标，理解时间尺度与末端边界怎样决定早期动作拿到多少学习信号。',
      outcomes: ['区分即时奖励、样本回报和价值期望', '手算提前终止与外部截断的多步目标'],
      sections: [
        {
          heading: '从实际执行后的一次反馈开始',
          body: '沿用昨天的夹持环境，定义 r_t 为执行 a_t 并转入下一状态后登记的奖励。首个动作的即时奖励是 r_t，其指数为零。若取放任务只在稳定放入盒中给 1，那么对齐、闭合和搬运阶段都可能记录零，回报仍会因后续成功而不同。回报是已实现轨迹或带尾项的学习目标，状态价值是固定策略下对未来回报的条件期望。\n\n日志应明确成功来自哪一次环境更新，不能按标注员事后点击时间插到另一条 transition 上。以裁剪后的执行动作和执行帧身份建立窗口。如果观测包含遮挡，价值估计可使用昨天的信念或历史编码；单帧价值混合了不同接触历史时，提高窗口长度也无法恢复本来没记录的区别。',
          sourceIds: ['spinning'],
        },
        {
          heading: '展开递推，数清最后一拍',
          body: '把未来回报写成当前奖励加上下一时刻回报的折扣。继续代入下一时刻的等式，第二个奖励乘一次折扣，第三个乘两次。窗口最多取 n 条 transition，实际取到 k 条时，用最后一条的后继状态补未知尾部，尾项折扣是 k 次。折扣因子无量纲，奖励、目标和尾部价值使用同一奖励量纲。\n\n把 γ=0.9 代入三步成功的奖励序列 0、0、1，若第三步任务结束，当前目标等于 0.81。若数据仅因外部采集时限停止，最后真后继价值为 0.4，则加 0.729×0.4，得 1.1016。外部截断仍结束当前窗口，取出的尾部观测必须在 reset 之前。若终止与截断同时为真，任务终止决定尾项为零。',
          formulas: [{ latex: String.raw`G_t^{(k)}=\sum_{j=0}^{k-1}\gamma^j r_{t+j}+\gamma^k(1-d_{t+k-1})\hat V(s_{t+k})`, explanation: 'k 是取到的 transition 数，j 是相对步号，d 是真实任务终止位，s 是最后的真后继状态，V̂ 是固定的尾部价值估计。' }],
          sourceIds: ['spinning', 'limits'],
        },
        {
          heading: '把折扣与控制时间对齐',
          body: '固定步长下同一个 γ 表示每过一个决策步价值衰减一次。20 Hz 与 10 Hz 都取 γ=0.9，则相同的一秒分别衰减 20 次和 10 次，权重约 0.122 和 0.349。若目标是相同的物理时间偏好，可以先给定半衰期，再按实际决策步长换算；例如半衰期一秒且间隔 0.1 秒，每步约为 0.933。\n\n相机掉帧会影响观测年龄，环境步数也可能继续推进。先选定折扣时钟，记录执行 tick 和每步秒数。若用逐段时间折扣，后续各项乘此前步的折扣乘积，并确保尾部价值使用相同定义。课程代码采用固定决策间隔与常数 γ，可用缺帧合成例子验证步数没有被相机刷新率替换。',
          formulas: [{ latex: String.raw`\gamma(\Delta t)=2^{-\Delta t/h}`, explanation: 'Δt 为两次决策之间的秒数，h 为正的半衰期，二者单位相同，γ 是一个决策间隔后的无量纲权重。' }],
        },
        {
          heading: '更长的窗口会混入谁的行为',
          body: '小 n 更依赖当前尾部价值。大 n 让远处的实测结果直接进入较早窗口，但同时带入更多轨迹随机性。若中间动作来自另一版策略、人工接管或随机探索，直接累加所得目标反映了那段行为的后果，和当前策略继续执行的分布可能不同。成功回放中接管后完成放置的结果尤其容易抬高接管前动作的估值。\n\n先把无接管成功、接管后成功、真实失败及外部截断分开列出。固定同一数据集与尾部估计做 n=1、3、5 对照，检查长窗口具体跨过了哪些决策和奖励，再看同等预算的闭环成功率。要定位哪一个早期动作真正有效，还需要改变该动作并观察后果，仅凭奖励回传无法建立因果归因。',
        },
      ],
      points: ['即时奖励从 γ 的零次幂开始。', '实际步数决定尾项指数。', '跨策略或接管的回放需要分层。'],
      codeTitle: 'discount_clock.py · 用物理时间核对同一折扣',
      code: `from math import isclose

def weight(intervals, half_life):
    if half_life <= 0 or any(interval < 0 for interval in intervals):
        raise ValueError('invalid decision clock')
    return 2 ** (-sum(intervals) / half_life)

assert isclose(weight([.05] * 20, 1), .5)
assert isclose(weight([.10] * 10, 1), .5)
assert isclose(weight([.05, .15], 1), weight([.2], 1))
try:
    weight([.05, -.15], 1)
except ValueError:
    print('equal elapsed time and reversed-clock rejection verified')
else:
    raise AssertionError('negative intervals must be rejected')`,
      codeNotes: ['输入为已对齐的决策间隔，单位秒。指数给出末端权重，等价于逐间隔权重相乘。', '正例比较两种步频和不规则间隔，负例拒绝时间倒退。只计算折扣，不读取设备或估计价值。'],
      exercise: { prompt: '把末步成功向前多移两拍', steps: ['沿用 γ=0.9，在终止序列 0、0、1 前插入两个零奖励。', '分别用 n=3 且尾值为 0，以及 n=5 算首步目标。'], solution: 'n=3 首步窗口内没有成功，且尾值假设为零，故为 0。n=5 看到第五条 transition 的成功，得 0.9⁴=0.6561，任务终止使尾项为零。' },
      quiz: { question: '同一秒的成功奖励在两套不同决策步频的回放里权重不同，哪两个字段能帮助你复核并统一时间偏好？', hint: '奖励偏移需要决策身份，也需要实际耗时。', keywords: ['决策步', '执行时间', '半衰期', '折扣'], reference: '保留连续决策步号和执行时间戳或间隔，以同一半衰期换算每个间隔的折扣。相机帧号独立记录，不能替代控制决策步。' },
      sources: [
        { id: 'spinning', label: 'OpenAI Spinning Up', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro.html', reading: '读 Reward and Return、Value Functions、Bellman Equations，沿一步递推推导本课多步式。' },
        { id: 'limits', label: 'Farama Gymnasium · Handling Time Limits', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/', reading: '读 Termination、Truncation 与 Importance in learning code，核对实际任务终点和外部采集界线。' },
      ],
    },
    code: {
      title: '计算 n-step return',
      minutes: 40,
      prerequisites: '会读 Python dataclass、数组广播与昨天的 transition 标志约定。',
      connection: '今天输出折扣奖励、最后后继和有效步数。明天在相邻状态价值之差上实现 GAE。',
      intro: '沿 Stable-Baselines3 的环形 replay 索引读到 SAC 目标，再写一条可逐步审计的 CPU 参考路径。',
      outcomes: ['解释 B×n 奖励掩码和 B×1 折扣的分工', '写出终止、截断和缺数据的正负测试'],
      sections: [
        {
          heading: '沿真实批量索引定位时间轴',
          body: 'Stable-Baselines3 v2.7.1 的 NStepReplayBuffer._get_samples 接收一批起点索引。每行随机选择一个向量环境下标，并沿时间加上 0 到 n−1，再对环形容量取模。取奖励时，起点与步号广播成 B×n，环境下标保持该行一致。时间轴是每个环境自己的决策步，不能把不同并行环境当成相邻步。\n\n最后一个已写槽位可能紧接旧数据或未写数据。该实现暂时把最后有效槽位的非终止行标成超时，采样完恢复原标志。逻辑或找到首个终止或超时，先用 any 判断是否存在命中，再用 argmax 定位首个位置；若全为假，直接 argmax 会错误地返回零。掩码包含事件所在那一拍，故末步成功奖励仍保留。',
          sourceIds: ['sb3'],
        },
        {
          heading: '分开传累计奖励、指数与价值边界',
          body: '函数按行用 1×n 的折扣向量乘奖励，再把时间轴求和到 B×1。从最后有效槽位取 next_observations，另用掩码真值计数得 γ 的指数。final_dones 由最后的 done 和 timeout 组合得到，决定学习端是否要加尾项。读 SAC.train 时可看到 replay_data.discounts 进入软 Q 目标，尾项由目标 critic 的最小值与熵项组成。\n\n教学实现直接读取明示 episode 和步号的不可变记录，返回标量奖励与布尔边界，便于逐条打印。上游使用并行环境、环形内存、归一化和向量计算，示例不复制这些设施，也不训练 SAC。尾项用调用方提供的标量价值，与上游软 Q 目标的类型和来源不同。',
          sourceIds: ['sb3', 'sac'],
        },
        {
          heading: '检查链路是否实际可重建',
          body: '每条合成记录带 episode、步号、reward、真后继编号及两个标志。读到结束事件立即停止扫描。如果记录用完却没有结束且窗口不足 n，本课抛出异常，让调用方决定等待更多数据还是明确登记采集边界。真实 replay 写入时也要核对 obs 与上一步的 next_obs 身份，示例假设这一对已由采集合同验收。\n\n测试故意在外部截断后附一条奖励 99 的新回合记录，期望窗口仍只保留原回合。再把同一个夹持结果分别标成真实终止、双标志和外部截断，比较尾项。另一个负例把当前序列的第二步换成新回合但不声明结束；这类坏拼接必须报错，不能用高奖励掩盖数据缺陷。',
          sourceIds: ['limits'],
        },
        {
          heading: '用小批量基准定位向量化故障',
          body: '把单条参考与批量实现对比时，同一批应包含完整 n 步、第一步终止、窗口中间截断和末尾未写槽。检查每行的有效步数与最后观测 ID，再对照回报和尾项，而不是只看最终均值。如果 done 的维度误变为 B，和 B×1 的折扣相乘会扩成 B×B，样本之间就互相串入。\n\n将同一条记录放在两个不同批位置，输出应保持不变；然后复制两个并行环境的时间索引并给第二环境一个不同的末步奖励，第一环境的结果仍应保持。PyTorch 中可先用 CPU double 对照标量实现，确认语义，再比较 float32 容差。正式训练前先保留样本的起止 ID 和 boundary reason，便于回放定位。',
        },
      ],
      points: ['同一行始终使用同一个环境。', '包含结束拍奖励，分别决定序列与尾值。', '比较每行有效步数和最后观测身份。'],
      codeTitle: 'nstep_trace.py · 追踪可复算的回放窗口',
      code: `from dataclasses import dataclass
from math import isclose

@dataclass(frozen=True)
class Edge:
    episode: str
    step: int
    reward: float
    next_obs: str
    terminated: bool = False
    truncated: bool = False

def nstep(edges, n, gamma, values):
    if n < 1 or not edges:
        raise ValueError('a positive window and start edge are required')
    first = edges[0]
    total, weight = 0.0, 1.0
    for offset, edge in enumerate(edges[:n]):
        if (edge.episode, edge.step) != (first.episode, first.step + offset):
            raise ValueError('noncontiguous replay')
        total += weight * edge.reward
        weight *= gamma
        steps = offset + 1
        if edge.terminated:
            return total, steps, edge.next_obs
        if edge.truncated or steps == n:
            return total + weight * values[edge.next_obs], steps, edge.next_obs
    raise ValueError('incomplete window without a boundary')

prefix = [Edge('A', 7, 0, 'A8'), Edge('A', 8, 0, 'A9')]
tail = Edge('A', 9, 1, 'A10', truncated=True)
reset = Edge('B', 0, 99, 'B1')
target, steps, last = nstep(prefix + [tail, reset], 5, .9, {'A10': .4})
assert isclose(target, 1.1016) and (steps, last) == (3, 'A10')
target, steps, last = nstep(prefix + [Edge('A', 9, 1, 'A10', True, True)], 5, .9, {})
assert isclose(target, .81) and (steps, last) == (3, 'A10')
assert isclose(nstep(prefix, 2, .9, {'A9': .4})[0], .324)
for broken in (prefix + [reset], prefix):
    try:
        nstep(broken, 5, .9, {})
    except ValueError:
        continue
    raise AssertionError('invalid replay accepted')
print('short windows, true next observation, and replay gaps verified')`,
      codeNotes: ['循环累计当前权重后乘 γ，结束时的权重对应已读步数。真终止先返回，所以两个标志同时出现也不查尾值。', '合成后继用字符串表示，values 假设是同策略和折扣定义下的估计。测试覆盖截断、真终止、满窗口、跨回合和无边界缺尾。'],
      exercise: { prompt: '复算两行并行回放', steps: ['固定 γ=0.9、n=3。第一行在首步以奖励 2 真终止。', '第二行奖励 0、1 后截断，末端价值 0.5。写出有效步数、折扣和目标。'], solution: '第一行有效步数 1，若像 SB3 分开传折扣则 γ¹=0.9，终止掩码抑制尾项，目标 2。第二行有效步数 2，折扣 0.81，目标 0.9+0.81×0.5=1.305。' },
      quiz: { question: '第一个样本提前结束，第二个样本走满三步。为什么用一个固定 γ³ 与统一 done 位会使截断样本的 target 错？', hint: '分别核对实际长度、最终观测和真正终止。', keywords: ['有效长度', '截断', '指数', '后继'], reference: '提前截断仍可使用最后的真实后继，其折扣指数等于实际读取的步数。统一 done 会抹掉合法尾项，固定指数则改变了尾项的时间位置。' },
      sources: [
        { id: 'sb3', label: 'DLR-RM Stable-Baselines3 v2.7.1 · buffers.py', url: 'https://github.com/DLR-RM/stable-baselines3/blob/v2.7.1/stable_baselines3/common/buffers.py#L801-L858', reading: '逐行读 NStepReplayBuffer._get_samples 的环境索引、环绕、掩码及临时 timeout。' },
        { id: 'sac', label: 'DLR-RM Stable-Baselines3 v2.7.1 · SAC', url: 'https://github.com/DLR-RM/stable-baselines3/blob/v2.7.1/stable_baselines3/sac/sac.py#L212-L247', reading: '读 SAC.train 对 replay_data.discounts 的使用、最小目标 Q 和熵尾项。' },
        { id: 'limits', label: 'Farama Gymnasium · Handling Time Limits', url: 'https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/', reading: '复核终止和截断进入 bootstrap 的不同含义。' },
      ],
    },
    insight: {
      title: '稀疏成功信号怎样传回早期动作',
      minutes: 25,
      prerequisites: '已能手算终止与截断样本，理解 11 月 17 日主动观测及执行日志。',
      connection: '今天比较学习信号的传播方式。11 月 19 日会将动作价值相对于基线的差写成优势，并比较预测规划。',
      intro: '在同一批合成夹持轨迹中比较多步窗口与阶段奖励，再用闭环数据辨认哪种改进真的来自早期决策。',
      outcomes: ['判断 n 的改变与奖励目标的改变分别影响什么', '设计成功、接管和恢复的分层闭环比较'],
      sections: [
        {
          heading: '先测奖励能传播多远',
          body: '以对齐、闭合、搬运、释放四个决策区间模拟放入盒中的任务。沿同一个回放表固定奖励和尾值版本，只把 n 从 1 改为 3 或 5，输出首个看到非零成功信号的位置和这段窗口的接管标签。选择较长窗口能减少依赖不成熟尾值的步骤，但早期样本的信号会更容易随之后的随机滑移而跳变。\n\n在合成夹具里把早期观察动作替换成同耗时等待，其他初值和下游策略固定，用配对试验观察成功差。保留末端位姿和奖励的原始时钟，可以定位改善来自更早判断夹稳，还是某个动作阶段较短而获得了更大的折扣权重。将学习目标变化、控制用时及物理完成分开登记。',
        },
        {
          heading: '阶段奖励会怎样重排策略',
          body: '另一条路线是在稳定闭合时给奖励。收益是早期探索更快得到反馈，代价是改变优化目标。如果靠重复闭合能拿多次分，智能体可能放弃放置。可先在小环境里检查势函数式塑形，额外项是折扣后的下个状态势减当前势。逐步加权求和时中间势相消，剩下初态偏移与终点残差；在相同初态且任务终点势为零的有限回合中，所有完整轨迹得到同一偏移。\n\n例如 γ=0.9，初态势 0.2，持稳势 0.6，任务终点势 0。两拍塑形奖励为 0.34 和 −0.6，其折扣和为 −0.2，直接从初态抵消。采集截断时状态仍有势，学习端尾值也要按塑形定义调整。RAW 相关对照可固定同一套接触标签和终点判据，再评估感知更清楚能否减少误发阶段奖励。',
          formulas: [{ latex: String.raw`\sum_{j=0}^{k-1}\gamma^j\bigl(\gamma\Phi(s_{t+j+1})-\Phi(s_{t+j})\bigr)=\gamma^k\Phi(s_{t+k})-\Phi(s_t)`, explanation: 'Φ 与奖励使用同一量纲，k 是已执行步数。等式来自中间项逐项相消，外部截断时不能假定剩余势为零。' }],
          sourceIds: ['shaping'],
        },
        {
          heading: '把任务评测、仿真和预测的信号分开',
          body: 'StanfordVL 的 BEHAVIOR 用任务条件检查仿真里的行为完成，可借用其谓词思想冻结放置成功定义。World Labs 的 R2S2R 则重建可交互场景并在仿真与硬件对照闭环，提供测试不同光照和几何初值的实验思路。仅有相机重建或渲染结果时，还需要动力学、接触和低层动作执行，才能采集此处的 transition 和任务奖励。\n\nMeta/FAIR 的 V-JEPA 2-AC 用历史视觉及动作预测后继表征，再以目标图像表征距离为代价搜索动作。规划代价帮助选择候选，环境执行和测得成功仍需独立反馈。AMI Labs 描述的动作条件表征预测是当前研究方向。把预测距离与真实放置事件分别写日志，有助于检验潜在代价是否在遮挡下仍能区分假成功。',
          sourceIds: ['behavior', 'r2s2r', 'vjepa', 'ami'],
        },
        {
          heading: '从分阶段成功追到完整回合',
          body: 'HEIR 的真实机器人流水线先推断人类意图，再由微调的 Qwen3.5-4B 根据最新机器人观测和当前子目标决定继续、切换或结束。InternVLA-N1 和 Lingbot-VLA2 分别处理导航与操作，系统按机器人状态检测静止并触发下一次规划。论文报告导航子任务成功率 81.25%（32 个子任务），完整回合为 18.52%（27 个回合）。两者分母不同，可据此设计误差累积分析，不能直接做百分点差来估算规划损失。\n\n本课在 CPU 合成回放上先按失败阶段、接管和时限做配对。在 SO-101 项目中可以离线复用公开或合成日志，固定相同初始条件、下游控制与最大用时，逐次核对完成事件和恢复路径。比较 n 的影响时保留同一奖励；比较阶段塑形时固定 n，并报告原始任务成功指标。Runway 的 SO-101 接口可作后续选读，六维关节段及低层客户端执行需要单独记录其观测和控制 tick。',
          sourceIds: ['heir', 'praxis'],
        },
      ],
      points: ['用配对改变拆分时间传播和奖励目标。', '势函数尾项随实际边界处理。', '完整回合成功率与子任务成功率使用各自分母。'],
      codeTitle: 'reward_potential.py · 查找截止造成的塑形残差',
      code: `from math import isclose

def shaping_trace(potentials, gamma):
    if len(potentials) < 2:
        raise ValueError('need a transition')
    bonuses = [gamma * after - before for before, after in zip(potentials, potentials[1:])]
    return sum(gamma ** index * bonus for index, bonus in enumerate(bonuses))

assert isclose(shaping_trace([.2, .6, 0.], .9), -.2)
assert isclose(shaping_trace([.2, .3, 0.], .9), -.2)
partial = shaping_trace([.2, .6], .9)
assert isclose(partial, .34)
assert not isclose(partial, -.2)
assert isclose(partial - .9 * .6, -.2)
try:
    shaping_trace([.2], .9)
except ValueError:
    print('terminal cancellation, cutoff residual and empty-transition rejection verified')
else:
    raise AssertionError('expected a transition')`,
      codeNotes: ['先逐对构造附加奖励，再用决策步的折扣累加。两条同初态完整路径验证相同偏移。', '外部截止的正势留下残差，减去相应折扣势可核对一致性。负例检查缺少 transition，只使用手工构造的势。'],
      exercise: { prompt: '比较完整回合与采集截断的势差', steps: ['设 γ=0.8，轨迹上的势为 0.1、0.4、0。手算塑形累计值。', '若第一拍外部截断，算残差，并说明哪项应由价值接口处理。'], solution: '完整塑形累计为 −0.1。第一拍得 0.8×0.4−0.1=0.22，相比 −0.1 多出 0.32。塑形后尾部价值应减去该边界状态的势 0.4，再经 0.8 折扣抵消残差。' },
      quiz: { question: '加入夹稳奖励后训练回报提高，为什么仍应复核同批任务里的放置成功与重复闭合？', hint: '检查新增奖励是否改变了完整行为的相对排序。', keywords: ['目标变化', '重复闭合', '任务成功', '配对'], reference: '重复闭合可能反复得到阶段奖励，导致训练目标偏离最终放置。使用固定初值与控制预算，比较原始任务成功、循环次数和接管，才能定位收益来自何处。' },
      sources: [
        { id: 'shaping', label: 'Ng、Harada、Russell · ICML 1999', url: 'https://people.eecs.berkeley.edu/~russell/papers/icml99-shaping.pdf', reading: '读定理 1、推论 2 与折扣势差，复核回合边界及价值平移。' },
        { id: 'behavior', label: 'StanfordVL · BEHAVIOR Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '读任务评测与仿真提交设置，提取成功谓词与环境身份。' },
        { id: 'r2s2r', label: 'World Labs · Building Worlds That Train Robots', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读 Sim-to-Real 的 Training 与 Evaluation，核对可变条件和真实／仿真闭环。' },
        { id: 'vjepa', label: 'Meta/FAIR · V-JEPA 2 v1', url: 'https://arxiv.org/html/2506.09985v1', reading: '读动作条件预测和机器人规划实验，区分潜在目标距离与测得结果。' },
        { id: 'ami', label: 'AMI Labs · Research direction', url: 'https://amilabs.xyz/', reading: '读表征空间预测及动作条件规划，核对当前组织目标。' },
        { id: 'heir', label: 'HEIR v1 · 真实机器人闭环', url: 'https://arxiv.org/html/2611.17238v1', reading: '选读 §5.5 与附录 C.1，核对分派、反馈和不同评测分母。' },
        { id: 'praxis', label: 'Runway · Praxis-1 SO-101 接口提交', url: 'https://github.com/runwayml/praxis-1-oss/commit/afef2e18a0af22b2e9926e9f743dc4694ab8b6b5', reading: '选读 README 的 SO-101 rig 和服务预设，核对六维关节动作和观测契约。' },
      ],
    },
  },
};
