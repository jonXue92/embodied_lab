import type { AuthoredDay } from './types';

export const day76: AuthoredDay = {
  reviewedAt: '2026-11-12',
  revision: '逐课编写 1.0',
  deliverable: '一份可按动作身份追溯的故障账本、最小离线回放器和根因干预表，共 100 分钟。',
  question: {
    title: '两次候选都引用同一张相机帧，后一条收到设备回执却没测得停止。怎样回放才能区分误配、陈旧输入与反馈缺失？',
    summary: '画出两个候选的证据链，给出时间误差界和两种单变量干预。',
    keywords: ['动作身份', '采样时刻', '时钟误差', '设备回执', '测量', '干预'],
    reference: '同一采样可以派生两个不同候选，各自有动作 ID、父帧和控制代号。把发出、回执和测量分别归到对应动作，跨时钟差要带误差区间。先在纯软件回放中修正关联而保留原时间，再固定关联只换成新鲜帧，观察第一个差异在哪一层出现。后一条的回执证明接口应答，缺测时物理停止标为未知。若要估计改动后的任务完成，需要会响应新动作的仿真或另行审批的受控实验。',
  },
  lessons: {
    foundation: {
      title: '日志、回放与根因定位',
      minutes: 35,
      prerequisites: '能区分采样、接收、候选、发出和设备反馈，并理解 11 月 14 日的锁存代号。',
      connection: '把昨天的回退阶段变成可连接的事件。11 月 16 日会把已定位的故障制成固定回归夹具。',
      intro: '从一次看似晚停的日志出发，建立可检验的事件身份与时钟契约。',
      outcomes: ['为相机帧、候选动作和测量建立可审计的引用', '根据校时误差判断延迟结论能否成立'],
      sections: [
        {
          heading: '事件身份比相邻行更可靠',
          body: '相机帧可以被多个推理请求重用。把夹爪动作连接到时间最近的一帧，在两个候选交错时很容易误接。给每次采集分配帧 ID，在观测快照中记清参与的帧和关节状态版本，再让候选引用该快照。另给每次候选、仲裁结果和发送尝试分配身份；用会话与控制代号阻止上一轮迟到回执串到本轮。\n\nOpenTelemetry 日志模型为源事件时间、收集端观察时间和 TraceId/SpanId 留有不同字段。可把一次任务尝试作为关联范围，但同一 trace 内仍有并行步骤及重试。把原始观测、动作引用和阶段代号放在明确的属性中，事件丢失时保留引用与缺口，不根据日志相邻行推断父子。',
          sourceIds: ['otel'],
        },
        {
          heading: '给跨设备时延加上可解释的误差界',
          body: '相机与控制主机先各自使用单调时钟记录持续时间，再把采样时刻经本次校时估计映射到主机域。若真实映射与估计的差至多为 ε，发送端本身的时间戳再有至多 η 的误差，最坏情况用三角不等式相加。校时只对给定窗口及稳定时钟成立，重启或漂移可能使旧界失效。\n\n合成样本的映射采样为 1000 ms，发送记录为 1042 ms，两端误差界分别 4 与 2 ms，实际间隔在 36–48 ms。若门槛为 45 ms，区间跨线，结论是证据不足。把收集端 1080 ms 的入库时间代进公式，会把异步日志队列的等待混入动作年龄。',
          formulas: [{ latex: String.raw`\widehat{\Delta}=t_{\mathrm{send}}-\widehat{t}_{\mathrm{capture}},\qquad |\Delta-\widehat{\Delta}|\leq \varepsilon+\eta`, explanation: '所有量都在主机时钟域，单位 ms。ε 是采样映射误差界，η 是发送记录误差界，Δ 是真实动作发送与所用观测采集之差。' }],
          sourceIds: ['clock', 'otel'],
        },
        {
          heading: '回执与可测结果各有边界',
          body: '在一条轨迹里同时记候选关节向量、裁剪结果、真正写出的值与之后测得的关节速度。总线回执可能只表示驱动接收；停止判断还要读取指定窗口的速度以及测量是否有效。缺测和超限分别入账，能够区分反馈链异常与证实的晚停。若同一候选重试两次，应记录哪一次写入产生了有效命令。\n\n对 RAW 流水线，曝光开始或中点的定义、裁剪版本、帧校验和也要随观测引用。坏帧被滤掉时记录原因和替代帧身份。即使任务结束标记存在，缺少与它同一会话且晚于发出事件的测量，仍只能把停止结果记为未知。',
        },
        {
          heading: '把故障假设转成可证伪的差异',
          body: '对冻结帧案例，先保留原候选及其时间，只修关联 ID，检查错误是否消失。接着固定身份连接，在软件夹具替换为更新且内容相同的帧，检查年龄门是否转为放行。分别比较被拒原因、候选序列号与首次分叉的事件，才能把误配和真正过龄拆开。\n\n若替换观测也改变模型输出，需把相同观测送入固定策略版本或记录决策分叉。在固定记录的回放中，后续关节状态沿用历史，即使当前候选不同也不会影响下一帧。记录回放能重现决策输入，实际后果需要会随动作推进的环境。',
        },
      ],
      points: ['用会话、动作和父帧组合追溯。', '时钟不确定性跨门槛时保留未知。', '回执与物理测量分别入账。'],
      codeTitle: 'clock_interval.py · 判定时延区间',
      code: `def classify_delay(capture_est, sent, capture_error, send_error, limit):
    if min(capture_error, send_error, limit) < 0:
        raise ValueError('nonnegative error and limit required')
    delta = sent - capture_est
    radius = capture_error + send_error
    lower, upper = delta - radius, delta + radius
    if upper < 0:
        raise ValueError('event order conflicts with clock bounds')
    lower = max(0, lower)
    if upper <= limit:
        return lower, upper, 'within'
    if lower > limit:
        return lower, upper, 'late'
    return lower, upper, 'unknown'

assert classify_delay(1000, 1042, 4, 2, 45) == (36, 48, 'unknown')
assert classify_delay(1000, 1039, 4, 2, 45) == (33, 45, 'within')
assert classify_delay(1000, 1052, 4, 2, 45) == (46, 58, 'late')
try:
    classify_delay(1000, 990, 4, 2, 45)
except ValueError:
    print('invalid ordering rejected')
else:
    raise AssertionError('clock contract must reject reversed events')`,
      codeNotes: ['输入为同一时钟域中的合成整数毫秒。区间和真实时延非负的前提相交，完全为负时拒绝。', '上界等于门槛允许通过，下界等于门槛且上界更高则保留未知。'],
      exercise: { prompt: '带误差地判断旧帧是否超龄', steps: ['映射采样为 500 ms，写出为 538 ms，两端界分别为 6 ms 和 1 ms。', '对 40 ms 与 45 ms 两个门槛各给判断。'], solution: '估计差 38 ms，误差界 7 ms，区间为 31–45 ms。40 ms 跨线，结论未知。45 ms 等于上界，按允许等于的契约在限内。' },
      quiz: { question: '为什么采集进程复用一张帧时，日志收集端每次更新 ObservedTimestamp 仍不能延长这帧的寿命？', hint: '分别写源时钟与收集端发生了什么。', keywords: ['源时刻', '收集端', '复用', '采样身份', '误差界'], reference: 'ObservedTimestamp 表示日志记录被观察到的时刻，可能反映重包、延迟和异步队列。动作仍使用同一帧的源采样 ID 和时刻。换算到发送端域并带校时误差界后，才能判断观测年龄。' },
      sources: [
        { id: 'otel', label: 'OpenTelemetry Logs Data Model', url: 'https://opentelemetry.io/docs/specs/otel/logs/data-model/', reading: '实读 Field: Timestamp、ObservedTimestamp 和 Trace Context Fields，按来源与关联身份区分。' },
        { id: 'clock', label: 'ROS 2 Clock and Time 设计文档', url: 'https://design.ros2.org/articles/clock_and_time.html', reading: '读 Time Abstractions、ROS Time 的回拨以及 Steady Time 的边界。误差区间是本课推导。' },
      ],
    },
    code: {
      title: '关联 observation、action 和 event',
      minutes: 40,
      prerequisites: '会使用 Python 字典、不可变记录和逐拍断言，能区分收到记录与事件发生。',
      connection: '11 月 14 日监督器只处理当前 tick；这里把多条记录离线连接，为次日验收保存最小失败夹具。',
      intro: '读 rosbag2 的取队列、睡眠、发布和回调边界，编写只处理内存记录的关联器。',
      outcomes: ['定位回放队列时间与载荷采样时间', '用失败夹具抓出跨会话连接、非法事件次序和缺测'],
      sections: [
        {
          heading: '从 rosbag2 的接收时戳找到发布边界',
          body: '读 rosbag2 0.26.11 的 PlayerImpl::play_messages_from_queue。循环取队头，常规模式等待回放时钟达到消息 recv_timestamp，再尝试发布。暂停单步可以跳到消息的回放时间；seek 发生后，原队头可能失效，循环会重取。这里的时间来自记录器接收消息的标量，消息载荷里的原始相机采样戳还需要从实际消息解码。\n\npublish_message 按 topic 找发布者，普通发布者路径调用播放前回调、尝试发布，即使前回调或发布抛出的异常被捕获，也会尝试调用播放后回调。发布成功标志与后回调分开返回。这个回调可记录软件边界；订阅回调、控制器仲裁和设备测量发生在其他位置。源码还包含服务等其他路径，下面只用普通话题的边界组织本地夹具，不创建 ROS 节点。',
          sourceIds: ['bag'],
        },
        {
          heading: '把关联合同放到数据结构里',
          body: '样例以 Event 保存 run、id、kind、parent 和 ms。每条输入是一项标量事件，输入顺序是采集器交付顺序，夹具时间已在同一单调时钟域。父链依次是 obs、proposal、sent、ack 或 measured；ack 与 measured 都引用 sent，因此两者可以乱序抵达。真实执行未必能可靠把测量唯一映射到某次发送，接口没有身份时要保留歧义。\n\n先用 (run,id) 构建索引，再验证父类型及时间。接收端交付顺序和因果顺序因此解耦。观测可以有多个候选；教学的每个 sent 只保留一条回执和一条测量，重复报告会报错。真实系统可用带重试号的多值记录，去重应有独立的协议和校验。',
        },
        {
          heading: '输出保留未知和多个分支',
          body: '测量缺失时输出 None，不能和 0 ms 或失败码混在一起。夹具中的 measured 是已关联的测量时刻，函数不读取数值也不判定速度合格。输出记录以每次发送的身份为键，并列返回源观测、观测到发送的差、回执时刻与测量时刻。\n\n真实队列可由不同线程发布。这里完整载入小型输入，先索引后审计，空间复杂度随事件数线性增长。两个候选共享帧且其中一个没有执行时，不应把另一条的结果归到它。负例采用重复身份、未知父项、测量早于发送；跨会话同名 ID 则保持独立。',
        },
        {
          heading: '用标准协议校验回放结论的范围',
          body: 'StanfordVL BEHAVIOR 挑战可选 action-chunk replay，由策略服务器返回形如 (..., L, action_dim) 的动作块，客户端逐步把动作交给仿真，耗尽后才用新的观测请求下一块，重置清缓存。该协议会执行仿真步，和逐条读历史记录的本例在环境反馈上有明确区别。\n\n对 SO-101 的回放夹具，可以记环境步、块 ID、块内下标与重新请求标记。这样即使一帧连接到多个执行步，也能区分按设计重用与误配。课堂程序只处理自造事件，不包含视频解码、话题发布、仿真或设备驱动。',
          sourceIds: ['behavior'],
        },
      ],
      points: ['recv_timestamp 决定这一版播放的常规等待。', '父链检查与日志抵达顺序解耦。', '记录回放与闭环仿真分开验证。'],
      codeTitle: 'lineage_replay.py · 纯内存身份关联',
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Event:
    run: str
    id: str
    kind: str
    parent: str | None
    ms: int

def link_events(events):
    by_id = {(e.run, e.id): e for e in events}
    if len(by_id) != len(events):
        raise ValueError('duplicate event identity')

    parents = {'proposal': 'obs', 'sent': 'proposal', 'ack': 'sent', 'measured': 'sent'}
    feedback = {}
    for event in events:
        if event.kind == 'obs' and event.parent is None:
            continue
        parent = by_id.get((event.run, event.parent))
        if parent is None or parents.get(event.kind) != parent.kind or event.ms < parent.ms:
            raise ValueError('broken event chain')
        if event.kind in ('ack', 'measured'):
            key = (event.run, parent.id, event.kind)
            if key in feedback:
                raise ValueError('ambiguous feedback')
            feedback[key] = event.ms

    linked = {}
    for event in events:
        if event.kind == 'sent':
            proposal = by_id[event.run, event.parent]
            obs = by_id[event.run, proposal.parent]
            key = (event.run, event.id)
            linked[key] = (obs.id, event.ms - obs.ms,
                           feedback.get((*key, 'ack')), feedback.get((*key, 'measured')))
    return linked

first = [Event('a', 'o', 'obs', None, 10), Event('a', 'p', 'proposal', 'o', 20),
         Event('a', 's', 'sent', 'p', 30), Event('a', 'r', 'ack', 's', 32)]
second = [Event('b', 'o', 'obs', None, 11), Event('b', 'p', 'proposal', 'o', 15),
          Event('b', 's', 'sent', 'p', 17), Event('b', 'm', 'measured', 's', 25)]
assert link_events(list(reversed(first + second))) == {
    ('a', 's'): ('o', 20, 32, None), ('b', 's'): ('o', 6, None, 25)}
for invalid in (first + [first[0]], first + [Event('b', 'x', 'ack', 's', 33)],
                first + [Event('a', 'm', 'measured', 's', 29)]):
    try:
        link_events(invalid)
    except ValueError:
        continue
    raise AssertionError('invalid trace should fail')
print('two traces linked, missing measurement retained')`,
      codeNotes: ['第一遍建立会话内索引与按类型区分的反馈表，第二遍仅从发送事件向前找候选和帧。', '反转输入验证日志交付可乱序，反例验证重复键、只在另一会话存在的父项和时间反转。'],
      exercise: { prompt: '给同一帧加一个未发出的候选', steps: ['在 run a 加一个引用 o 的 proposal，但不加 sent。', '再加一条声称引用此候选的 ack，判断两次输出。'], solution: '单加未发出的候选，发送字典不变。加入把 proposal 当父亲的 ack 后应报错，回执的父类型必须是 sent。' },
      quiz: { question: 'rosbag2 普通话题的发布后回调触发了，为什么仍要在离线关联器里保留 measured 缺项？', hint: '找出发布边界以后还有哪些独立环节。', keywords: ['发布回调', '订阅', '控制器', '测量', '设备反馈'], reference: '发布后回调在尝试发布的路径之后运行，前回调或发布异常时也可进入。订阅是否处理、控制器是否写入及硬件如何响应仍需各自记录。只有满足时间和身份约束的物理测量，才支持判断执行结果。' },
      sources: [
        { id: 'bag', label: 'ROS 2 rosbag2 0.26.11 Player 源码', url: 'https://raw.githubusercontent.com/ros2/rosbag2/0.26.11/rosbag2_transport/src/rosbag2_transport/player.cpp', reading: '读 PlayerImpl::play_messages_from_queue 与 PlayerImpl::publish_message 的等待、seek 失效和前后回调。' },
        { id: 'behavior', label: 'StanfordVL BEHAVIOR Challenge Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html#optional-action-chunk-replay-protocol', reading: '2026-11-12 实读可选 action-chunk 协议、步数和 reset 清缓存。' },
      ],
    },
    insight: {
      title: '可观测性如何缩短真机调试',
      minutes: 25,
      prerequisites: '能读动作来源链、判断缺测与保守时间区间。',
      connection: '把 11 月 14 日的晚停故障变成反事实试验，次日将最小差异固化为 smoke 和版本回归。',
      intro: '用少量配对夹具比较只留视频、结构化记录和可交互诊断所能回答的问题。',
      outcomes: ['用配对的诊断时间和覆盖率比较记录设计', '标注代理建议、策略输出与执行反馈各自的证据'],
      sections: [
        {
          heading: '用同一组故障比较记录策略',
          body: '让同一诊断者分别查看只有视频的记录，以及保留关联 ID、时间界和物理结果的结构化记录。先准备同难度的合成病例，交错工具呈现顺序，防止第二次看见同一故障自然更快。记录从打开到给出可检验解释的时间与是否命中已注入原因。超时和误判仍计入总样本。\n\n例中两种记录在 4 个夹具上的用时为 9、7、12、10 分钟与 3、5、8、6 分钟，四项配对节省为 6、2、4、4，平均 4 分钟。若其中一个结构化夹具在期限内未定位，可先以固定截止时间计入时间指标，再分别报正确定位率；样本很小时不据此宣称真实团队节省比例。',
          formulas: [{ latex: String.raw`\bar d=\frac{1}{N}\sum_{i=1}^{N}\left(T_{i,\mathrm{video}}-T_{i,\mathrm{trace}}\right)`, explanation: 'N 为固定夹具数，两个 T 用分钟，对同一故障难度或同一实例配对。采用截止时间时，定位正确率作为独立指标。' }],
        },
        {
          heading: '给存储成本和判因能力各一列',
          body: '仅保存视频最适合人工重看碰撞前后，难以定位选中了哪个采样或为何忽略停止确认。保存结构化事件通常开销较低，能定向发现错配和缺测，但可能丢失判断光照或材料问题所需的像素证据。可保留全量小事件，另在故障触发前后保留本地合成或授权素材的短窗口，并记录未保存的原因。\n\n对相机对比实验，使用同样的触发阈值、日志限额和光照分组。异步队列满时记丢弃计数，并记录记录器本身的开销。这样若 RAW 方案在高曝光下诊断得快，可以查清是多了有效信号、传感时间更稳定，还是仅留存窗口更长。',
        },
        {
          heading: '让代理提出下一项检查',
          body: '离线 Agent 可读取局部 trace 并选择查帧、查配置或重放固定决策；它可以生成根因候选以及下一步取证动作。让它输出被引用的事件 ID、反证与缺失项。涉及 VLA 时，真实动作由下游策略与控制器执行，代理观察结果才可进行闭环重规划。文本诊断工具的成功率只覆盖根因命中，不说明机器人恢复成功。清华与 UC Berkeley 的 uni-robot-agent §2.5 给出了通信重试的具体合同，可对照请求身份、重复动作和可诊断结果。\n\nMeta/FAIR V-JEPA 2-AC 以近期视频表征和机器人状态、候选动作预测潜变量，`3.2 依据目标距离选序列，`4.1 由 Franka 逐次执行并从新观测更新。可记录模型候选排序、最终下发和下一帧身份，以审计错误出在预测或执行。AMI Labs 的表征预测和安全方向来自当前组织说明，课程没有用该说明补出模型或真机评测。',
          sourceIds: ['uni', 'jepa', 'ami'],
        },
        {
          heading: '从历史记录到会响应动作的对照',
          body: '如果怀疑换灯后失败来自视觉而非控制延迟，可以在同一数字场景固定控制与动力学，只换相机外观，再测试第二个固定外观但注入延迟的版本。World Labs R2S2R 描述从现实锚点构造视角、空间与物理变体的路线。StanfordVL BEHAVIOR 提供任务与仿真计分条件，适合给这些对照写任务结果字段。\n\n同一历史视频只能检验重走决策流程时的首个差异。交互仿真能推进新动作后的状态，但接触与采样分布仍需另行核验。保留原版本与注入版本两份轨迹，以首次可解释差异和是否完成目标两个结果报告，避免把界面里看到的顺利动画解释成实物恢复。',
          sourceIds: ['world', 'behavior'],
        },
      ],
      points: ['比较诊断时间时同时保留命中率与分母。', '代理诊断、候选预测和实际执行分开记录。', '新动作导致的后果需要交互环境。'],
      codeTitle: 'diagnostic_pairs.py · 配对诊断用时',
      code: `from statistics import mean

def compare_diagnostics(video, trace, deadline):
    if deadline <= 0 or not video or set(video) != set(trace):
        raise ValueError('identical nonempty cases and positive deadline required')
    if any(t is not None and not 0 <= t <= deadline for runs in (video, trace) for t in runs.values()):
        raise ValueError('out-of-range time')
    def elapsed(t):
        return deadline if t is None else t
    gain = mean(elapsed(t) - elapsed(trace[k]) for k, t in video.items())
    hits = tuple(sum(t is not None for t in runs.values()) for runs in (video, trace))
    return gain, hits, len(video)

video = {'freeze': 9, 'stale': 7, 'gap': 12, 'clamp': 10}
trace = {'freeze': 3, 'stale': 5, 'gap': 8, 'clamp': 6}
assert compare_diagnostics(video, trace, 15) == (4, (4, 4), 4)
assert compare_diagnostics(video, {**trace, 'gap': None}, 15) == (2.25, (4, 3), 4)
try:
    compare_diagnostics(video, {'freeze': 3}, 15)
except ValueError:
    print('paired denominator retained')
else:
    raise AssertionError('cannot drop hard cases')`,
      codeNotes: ['映射值为首次正确解释的分钟数；None 表示截至期限仍未命中。', '固定同一夹具集合，输出平均节省、命中数和分母，防止通过删难例改善指标。'],
      exercise: { prompt: '把曝光异常和控制排队分开', steps: ['设计一组只换曝光条件的仿真配对和一组只换执行延迟的配对。', '列出每组必须固定的版本和决定根因的第一个事件。'], solution: '先固定策略、物理与执行延迟，替换曝光并检查帧饱和、候选与任务结果。再固定画面及任务实例，只替换执行延迟，检查发出与测量间隔。两组均记录同一身份链和测量缺口。' },
      quiz: { question: '结构化回放显示 VLA 候选改变，为什么不能直接给出任务成功率改进？', hint: '想想历史视频是否会响应当前候选。', keywords: ['历史观测', '新动作', '交互', '闭环', '任务结果'], reference: '历史观测来自旧动作，当前候选改变时，后续帧仍沿用旧轨迹。可以据此判定决策差异，但要评估成功率，需要环境执行新动作并提供新观测，且对照采用相同任务和统计分母。' },
      sources: [
        { id: 'uni', label: '选读 · uni-robot-agent v1', url: 'https://arxiv.org/html/2611.01560v1', reading: '§2.5 的重复动作防护与动作结果诊断，§3 分别看 RoboDojo 交互仿真与桌面真机。' },
        { id: 'clock-memory', label: '选读 · Temporal Shortcuts in Memory-Augmented VLA Policies v1', url: 'https://arxiv.org/html/2611.14488v1', reading: '§3、§4、§6：在 RoboMME 注入不改变任务进度的停顿与手腕动作，比较可见/隐藏干预及事件索引。因果证据来自仿真。' },
        { id: 'jepa', label: 'V-JEPA 2 原论文 v1 · Meta/FAIR', url: 'https://arxiv.org/html/2506.09985v1', reading: '`3.1、`3.2、`4.1 的状态、候选预测、规划与真机执行边界。' },
        { id: 'ami', label: 'AMI Labs 组织研究方向', url: 'https://amilabs.xyz/', reading: '2026-11-12 实读表示空间预测与动作条件规划段落。' },
        { id: 'world', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读以现实为锚点生成变体和以仿真开展训练评估的流程。' },
        { id: 'behavior', label: 'StanfordVL BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '读仿真任务指标和预算，作为场景与结果合同的独立来源。' },
      ],
    },
  },
};
