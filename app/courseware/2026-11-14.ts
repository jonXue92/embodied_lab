import type { AuthoredDay } from './types';

export const day75: AuthoredDay = {
  reviewedAt: '2026-11-10',
  revision: '逐课编写 1.0',
  deliverable: '两条独立计时链的故障表、带锁存的离线 watchdog 和配对故障注入矩阵。35+40+25=100 分钟。',
  question: {
    title: '心跳仍在更新，但夹爪前方的最后一帧已过龄，回退确认又没有回来，这一拍与下一拍分别该记什么？',
    summary: '结合距离预算、控制权锁存和配对故障注入，说明为什么不能让恢复的图像自动续跑。',
    keywords: ['采样年龄', '反应延迟', '控制权', '锁存', '回退确认', '配对注入'],
    reference: '心跳只证明发送端在报到，观测过龄仍应收走策略控制权，作废旧代号并记录触发时刻和未确认的回退请求。下一拍如果回退确认仍缺失，就按独立期限记录未确认或升级，不能把请求当成停止。以速度、反应延迟、制动距离及误差裕量核算可用余量，复位需要授权和新状态。用同一故障种子对照并记录触发、交接、到达安全状态三个时刻，晚停和未确认分别入账。',
  },
  lessons: {
    foundation: {
      title: '异常检测与安全回退',
      minutes: 35,
      prerequisites: '会区分观测年龄、阶段期限及 requested/sent/measured，能把毫米和毫秒转换到 SI 单位。',
      connection: '11 月 13 日的阶段机回答任务能否推进，今天由独立监督层判断控制权是否仍有效。11 月 15 日将把触发、交接与测量结果串成因果日志。',
      intro: '从失联、旧观测和物理余量三种证据出发，推导检测阈值可用的时间预算。',
      outcomes: ['区分进程活性、输入有效性与物理可恢复性', '手算一维停止余量和可用反应时间'],
      sections: [
        {
          heading: '01 在线进程也可能在重复过期事实',
          body: '图像采集卡住时，推理服务仍可定期发心跳，也可能每次用同一张图生成新编号动作。只看接收时间会把这些候选误当成新证据。监测器应分别跟踪最后一次合规心跳的接收时刻、用于当前动作的传感采样时刻以及执行反馈的有效性。三者的身份和时钟域各自登记，跨设备时钟转换误差要计入观测年龄预算。\n\n抓取阶段达到期限说明本次任务失败，读写失联则意味着连保持当前位置的能力都要重新核实。把阶段成功、策略活性和设备健康分开记账。命令缓冲区有内容仅说明有待执行项，既不能延长图像的有效期，也不能充当设备写入回执。',
        },
        {
          heading: '02 从接近速度推到停止距离',
          body: '设沿障碍法向的接近速度上界为 v，反应阶段最多持续 T，其间保守地以 v 前进。反应结束后，在一维且保证减速度至少为 a 的假设下，速度以 v-at 降至零，把该速度从零积分到 v/a 得到 v²/(2a)。加上标定与距离估计误差裕量 ε，就能比较当前可用间距与所需余量。若反应期间还能超过 v，就应重新选取速度上界。\n\n夹具用 v=0.20 m/s、T=0.12 s、a=0.80 m/s²、ε=0.008 m。延迟前进 24 mm，制动 25 mm，加裕量共 57 mm。若净间距只有 50 mm，则允许的总反应时间最多 85 ms。这个上限还要分给故障判定、监督 tick 等待、交接以及执行器响应，不能全分配给心跳超时。',
          formulas: [{
            latex: String.raw`d_{\mathrm{req}}=vT+\frac{v^2}{2a}+\varepsilon,\qquad T_{\max}=\frac{d-\varepsilon-v^2/(2a)}{v}`,
            explanation: 'v>0 用 m/s，a>0 用 m/s²，T 与 T_max 用 s，净间距 d 和裕量 ε 用 m。T_max 为负时，按此上界即刻开始制动也缺少余量。公式只适用于给定的一维速度和制动假设。',
          }],
          sourceIds: ['simplex'],
        },
        {
          heading: '03 回退动作取决于还能信任哪些接口',
          body: '有可信位置反馈且执行接口可用时，保持或受限停止可以作为待验证的回退候选。若工具带载，切断动力可能导致下坠，回到固定关节角也可能扫过障碍或拉扯被夹物体。保守姿态应和到达路径、制动距离、负载及有效传感条件一起定义，不能只在配置里写一个目标角。\n\nBlack-Box Simplex 的决策模块在接受新候选时检查该动作连同后续序列能否保持可接受状态，不通过就沿用已存的安全序列。这里借鉴控制权与可恢复状态的区分。我们的标量距离练习未覆盖关节耦合、重力、夹持或障碍移动，不能用来为 SO-101 认证。',
          sourceIds: ['simplex', 'manager'],
        },
        {
          heading: '04 给回退留出确认和复位两道边界',
          body: '检测失败后先冻结策略输出和旧队列的授权，记录回退请求及其代号。命令接口回执说明交接是否被接受，编码器或外部测量才能支持速度降到界内。停止确认必须有单独期限；回执缺失或反馈仍超速时，继续保持策略禁用并升级故障记录。\n\n一条恢复的心跳只能更新活性证据。解除锁存前需要核对当前姿态、设备与观测的新鲜度，再由授权的复位开启新代号。以此画三段时间线：故障首次可能发生到检测，检测到接管，以及接管到测得安全状态；下一课可以直接用它定位超预算段。',
          sourceIds: ['manager'],
        },
      ],
      points: ['分别记录活性、采样新鲜度与物理停止。', '总反应时间由距离预算反推。', '回退请求、停止确认与授权复位分开记账。'],
      codeTitle: 'stop_margin.py · 一维停止预算',
      code: `from math import isclose, isfinite

def stopping_margin(gap, speed, delay, braking, uncertainty):
    values = (gap, speed, delay, braking, uncertainty)
    if not all(isfinite(x) and x >= 0 for x in values) or braking == 0:
        raise ValueError('expected nonnegative SI inputs and positive deceleration')
    travel = speed * delay + speed ** 2 / (2 * braking)
    return gap - uncertainty - travel

assert isclose(stopping_margin(.060, .20, .12, .80, .008), .003)
assert isclose(stopping_margin(.050, .20, .12, .80, .008), -.007)
assert isclose(stopping_margin(.050, .20, .085, .80, .008), 0, abs_tol=1e-12)
for invalid_braking in (0, float('nan')):
    try:
        stopping_margin(.060, .20, .12, invalid_braking, .008)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid braking bound')
print('margin and boundary cases verified')`,
      codeNotes: ['输入是 SI 单位的夹具标量，braking 是保证达到的减速度下界。返回正余量、零边界或负缺口。', '三个数值夹具对照推导。非有限或无减速度界的输入显式报错；没有控制输出。'],
      exercise: {
        prompt: '给 85 ms 总预算排队',
        steps: ['假设监测 tick 最坏等待 20 ms，接管和设备响应合计 35 ms。', '算可留给故障判定的最长时间，检验连续等待两个 20 ms 周期是否可行。'],
        solution: '剩余 85−20−35=30 ms。连续等待两个 20 ms 周期共 40 ms，总和 95 ms，超过预算 10 ms。应在模型假设下调整等待、速度或距离，不能用平均 tick 替代最坏等待。',
      },
      quiz: {
        question: '安全监测每次从收包时间算年龄，为什么可能在冻结视频下继续放行？',
        hint: '把本次收包和实际采样写成两列。',
        keywords: ['采样时间', '接收时间', '冻结帧', '心跳', '动作来源'],
        reference: '缓存图像可被重复包装成新消息，接收时刻会前进而原采样身份与时刻不变。应保留候选引用的原采样时间和 ID，单独监测发送方活性，并在采样过龄时收回权限。',
      },
      sources: [
        { id: 'simplex', label: 'Black-Box Simplex 原论文 v3', url: 'https://arxiv.org/html/2102.12981v3', reading: '实读 §2.1 决策模块的候选序列替换、执行顺序与 §2.2 admissible state 定义。一维公式是课堂推导。' },
        { id: 'manager', label: 'ros2_control Controller Manager 官方手册', url: 'https://control.ros.org/rolling/doc/ros2_control/controller_manager/doc/userdoc.html', reading: '2026-11-10 实读 Parameters 中 fallback_controllers 的接口可用性警告和 read/update/write 顺序。Rolling 文档可变。' },
        { id: 'cosmos', label: '选读 · Cosmos3 推理计时方法', url: 'https://github.com/NVIDIA/cosmos/blob/81c5298f76af994e830fb5f68b380f1b65131701/docs/reference/inference_benchmarks/benchmark_methodology.md', reading: '对照生成、去噪、请求和服务端的计时边界。分别记入预算的不同阶段，不能把 GPU 推理表当作端到端反应时间。' },
      ],
    },
    code: {
      title: '实现 watchdog、超时和保守姿态',
      minutes: 40,
      prerequisites: '理解单调时钟、阶段代号、dataclass，以及上一课的一维预算假设。',
      connection: '把 11 月 13 日的任务状态与控制权拆开，今天用故障代号和确认状态演练接管；下一课加入关联 ID 定位丢失的交接事件。',
      intro: '对照 ROS 2 参考量超时与控制器失效回退，用合成记录测试独立权限门。',
      outcomes: ['定位订阅接收、更新周期及限幅之间的边界', '回放超龄、回拨、设备错误、迟到包和授权复位'],
      sections: [
        {
          heading: '01 沿 ROS 2 源码追消息到输出',
          body: 'DiffDriveController::on_configure 创建 TwistStamped 订阅。订阅回调检查是否活跃，零 header 时间戳改用节点当前时间，超龄过滤后才放入线程安全缓冲。这里输入是线速度 x 与角速度 z，使用消息时间戳算年龄。零戳补写有兼容价值，但对相机样本重包会掩盖真实采样年龄，课堂夹具直接要求显式时间。\n\nupdate_reference_from_subscribers 尝试取缓冲快照，以控制周期的 time 减最近命令 header.stamp。若超龄严格大于阈值且超时功能开启，把两个导出的参考量置零；该超时分支仍返回 OK。update_and_write_commands 随后处理限速和车轮映射。因此参考量置零、管理器切换回退和物理停止是三个不同事件。',
          sourceIds: ['ros'],
        },
        {
          heading: '02 对照管理器的失败契约',
          body: 'Controller Manager 文档中的 fallback_controllers 针对控制器 update 返回 ERROR。回退依赖所需状态和命令接口可用，组合控制器还需考虑依赖链。差速车参考量超时返回 OK，所以仅配置管理器 fallback 不会把此分支变成错误切换。读写故障则可能让回退依赖的执行通道也不可用。\n\n教学监督器显式接受观测时刻、心跳接收时刻和独立设备状态。输入形状是两个整数毫秒标量、一个布尔健康位与一个控制代号；没有相机数组、关节向量或 ROS 节点。时间界采用年龄达到上限即触发，刻意区别于上述参考量更新的严格大于。',
          sourceIds: ['manager'],
        },
        {
          heading: '03 锁存要覆盖迟到候选和迟到确认',
          body: 'tick 的首个故障原因进入锁存，只接受发出请求之后属于当前代号的回退确认。确认数据按决策 tick 串行送入，教学代码将它抽象成代号参数，代表独立测量已核实的安全状态。确认期限到达时才收到的确认判为超时。早先已确认的安全状态仍属于当时的测量，后续继续监控是部署层职责。\n\n回放让 tick 返回交接状态，故障原因与代号保存在对象上，供测试驱动读取。它不拼装保守姿态，也不会发布总线命令。授权复位要求已确认、当拍健康且明确授权，随后递增代号。发出新任务时仍须重验每个候选的关联时间；本例的 permits 仅示范代号门，部署中还需最后时刻的年龄、状态及队列检查。',
          sourceIds: ['simplex'],
        },
        {
          heading: '04 把同拍竞争写成能失败的断言',
          body: '夹具从有效状态进入观测超龄，验证心跳当拍新鲜仍无法保留权限。重复 tick 并带错代号的确认不能解锁；正确确认到达后，没有授权的复位仍失败。最终只放行新代号，证明迟到的旧策略候选失效。\n\n另外用设备错误与确认恰好踩期限的回放检验优先级。回拨属于时钟合同失败，代码在更新自身状态之前拒绝。离线调用者负责按固定周期喂数据，进程卡死、确认消息伪造、设备安全回路和多线程原子发布都超出夹具范围。',
        },
      ],
      points: ['参考量超时可以返回 OK。', '回退确认使用当前故障代号。', '复位后旧代号仍失效。'],
      codeTitle: 'watchdog_replay.py · 独立权限锁存',
      code: `class Watchdog:
    def __init__(self):
        self.epoch = 0
        self.last_tick = -1
        self.fault = None
        self.triggered = None
        self.result = 'armed'
        self.healthy = False

    def tick(self, now, obs_at, beat_at, device_ok=True, ack_epoch=None):
        if now < self.last_tick:
            raise ValueError('decision clock regressed')
        self.last_tick = now
        fault = None
        if not device_ok:
            fault = 'device'
        elif not 0 <= now - obs_at < 60:
            fault = 'observation'
        elif not 0 <= now - beat_at < 80:
            fault = 'heartbeat'
        self.healthy = fault is None
        if self.fault is None and fault is not None:
            self.epoch += 1
            self.fault = fault
            self.triggered = now
            self.result = 'awaiting-confirmation'
            return self.result
        if self.result == 'awaiting-confirmation':
            if now - self.triggered >= 40:
                self.result = 'unconfirmed'
            elif ack_epoch == self.epoch:
                self.result = 'confirmed'
        return self.result

    def permits(self, candidate_epoch):
        return self.fault is None and self.healthy and candidate_epoch == self.epoch

    def reset(self, authorized):
        if not (authorized and self.healthy and self.result == 'confirmed'):
            return False
        self.epoch += 1
        self.fault = self.triggered = None
        self.result = 'armed'
        return True

w = Watchdog()
assert not w.permits(0)
assert w.tick(20, 20, 20) == 'armed' and w.permits(0)
assert w.tick(80, 20, 80, ack_epoch=1) == 'awaiting-confirmation'
assert w.fault == 'observation' and not w.permits(0)
assert w.tick(90, 90, 90, ack_epoch=0) == 'awaiting-confirmation'
assert w.tick(100, 100, 100, ack_epoch=1) == 'confirmed'
assert not w.reset(False) and not w.permits(1)
assert w.reset(True) and w.permits(2) and not w.permits(0)
before = vars(w).copy()
try:
    w.tick(99, 99, 99)
except ValueError:
    assert vars(w) == before
else:
    raise AssertionError('clock rollback accepted')

w = Watchdog()
assert w.tick(100, 100, 0, device_ok=False) == 'awaiting-confirmation'
assert w.fault == 'device'
assert w.tick(140, 140, 140, ack_epoch=1) == 'unconfirmed'
assert not w.reset(True)
for obs_at, beat_at, cause in [(0, 0, 'observation'), (100, 20, 'heartbeat'),
                              (101, 100, 'observation')]:
    w = Watchdog()
    w.tick(100, obs_at, beat_at)
    assert w.fault == cause
print('authority, freshness, acknowledgement deadline and reset verified')`,
      codeNotes: ['tick 接受同钟的合成采样与接收时间。首个故障递增代号，锁存故障原因，设置 40 ms 的确认期限。', '等待期间先判确认期限，再匹配代号。unconfirmed 无法走课堂复位路径；它代表需要独立升级。', 'permits 仅验证当拍健康和代号。测试驱动串行调用且授权只用于当前 tick，无驱动、姿态执行、时钟同步或线程。'],
      exercise: {
        prompt: '区分设备健康恢复与交接完成',
        steps: ['从新 Watchdog 开始，在 now=100 传 obs_at=100、beat_at=100 和 device_ok=False。', '在 now=120 给齐新鲜数据但不给确认，尝试授权复位，再在 now=130 给正确确认。'],
        solution: '首拍锁存 device 并升为代号 1。120 ms 健康证据恢复但仍 awaiting-confirmation，reset(True) 为 False。130 ms 给 ack_epoch=1，在 140 ms 期限前变为 confirmed，当拍授权复位后升为代号 2。',
      },
      quiz: {
        question: '为什么差速控制器的命令超时清零不能用来证明管理器已经切换 fallback？',
        hint: '检查参考量更新函数的返回值与管理器的触发条件。',
        keywords: ['参考量', 'return_type::OK', 'ERROR', '接口可用', '回退控制器'],
        reference: '参考量更新在超时分支把线速度和角速度参考设零并返回 OK。管理器的 fallback 针对 update 返回 ERROR 且接口可用的情况。物理停止仍需要独立反馈。',
      },
      sources: [
        { id: 'ros', label: 'ROS 2 Controllers · DiffDriveController 固定源码', url: 'https://github.com/ros-controls/ros2_controllers/blob/3c23b1b453a39ac98437a2e65503dc7f2885abb7/diff_drive_controller/src/diff_drive_controller.cpp#L110', reading: '核验 on_configure 订阅回调（约 430 行）、update_reference_from_subscribers（110 行）和 update_and_write_commands（157 行）。' },
        { id: 'manager', label: 'ros2_control Controller Manager 官方手册', url: 'https://control.ros.org/rolling/doc/ros2_control/controller_manager/doc/userdoc.html', reading: '阅读 fallback_controllers 参数和接口可用性条件。2026-11-10 核验 Rolling 文档。' },
        { id: 'simplex', label: 'Black-Box Simplex 原论文 v3', url: 'https://arxiv.org/html/2102.12981v3', reading: '读 §2.1 的 Execution Semantics。课堂锁存是原创简化，没有论文中的安全序列验证。' },
        { id: 'newton', label: '选读 · Isaac Lab Newton 动作进子步', url: 'https://github.com/isaac-sim/IsaacLab/commit/43359cf99658adcf4ce1657c80a0270d84ba1db2', reading: '读 handle_actions 和逐物理步回调测试。若用这种后端做故障回放，记录环境步与物理子步，复制原地更新的 processed_actions 再作历史快照。' },
        { id: 'coupling', label: '选读 · Isaac Lab Newton 耦合入口迁移', url: 'https://github.com/isaac-sim/IsaacLab/commit/299af19313671417c03b9c355f5f6fffbace7bad', reading: '读 breaking changelog，复现刚柔接触夹具时固定耦合模块与任务 preset，避免将配置迁移误诊为回退失效。' },
      ],
    },
    insight: {
      title: '失败时系统应该怎样退化',
      minutes: 25,
      prerequisites: '掌握停止预算、锁存与确认期限，能按同一批扰动试验比较两个策略。',
      connection: '今天用配对夹具选择退化分支。明天把每条失败拆成采样、候选、发送、接管和确认的因果链。',
      intro: '把质量下降、传感丢失和设备故障分开试验，用晚停和误停选择降级策略。',
      outcomes: ['为两级退化列出可用的信号和拒绝条件', '用配对种子量化晚停和健康误停的权衡'],
      sections: [
        {
          heading: '01 信号还剩多少决定能退到哪里',
          body: 'RAW 图像出现饱和或拖影时，若 RGB 或另一视角仍通过同一观测年龄和距离界检查，可以在受限速度下做独立对照。把曝光质量与通道可用性分开：高动态范围可能缓解饱和，却修复不了采集线程冻结。双路若共用驱动、电源或时间同步，也会同时失去证据。\n\n如果失去用于测距的全部通道，低速只有在独立设备反馈仍能维持可恢复条件时才有意义。用离线夹具比较立即交给停机监督与先进入受限降级两种方案，分别记录故障类型、剩余接口、回退确认及是否触碰任务物体。读写已失效的试验单列，不能用视觉质量改进解释执行通道恢复。',
        },
        {
          heading: '02 配对故障注入要同时看漏失和误停',
          body: '两种方案都跑同一组已注入故障的种子。以首次可观测故障到独立停止确认为准，超过 100 ms 或未得到确认都计入期限违例。记 b 为立即回退违例而分级退化通过的种子数，c 为相反的种子数；同为通过或同为失败的对不会改变差值。未确认记录还要另列，方便区分证据缺失与实测晚停。\n\n设四个故障种子中两种都失败 1 次，只有立即回退失败 1 次，只有分级退化失败 2 次，分级退化的违例率高 25 个百分点。再准备未注入故障的健康回放报告误停率，不能把少停当成恢复能力强。四个种子只够验算，放大样本时按物体与扰动类型分层并报告覆盖。',
          formulas: [{
            latex: String.raw`\widehat p_{\mathrm{graded}}-\widehat p_{\mathrm{direct}}=\frac{c-b}{N}`,
            explanation: 'N 是有故障的配对种子数，每种方案在每个种子有一次结果；b、c 为方向相反的两类不一致计数。差值无量纲，正值表示分级方案的期限违例更多。',
          }],
          sourceIds: ['simplex'],
        },
        {
          heading: '03 用空间变体找漏点，用表征预测挑候选',
          body: 'StanfordVL 的 OmniGibson BehaviorTask 在对应环境对象作用域评估目标谓词，也单列步数超时。可以借此为仿真故障注入记载任务是否达成、对象是否掉落，另加独立的停止确认判据。World Labs 的 R2S2R 以真实任务和环境为输入生成交互式仿真变体，适合组织视角、照明与物理因素的测试矩阵。生成场景的变化是否保真，要靠独立反馈和接触校验。\n\nMeta/FAIR V-JEPA 2-AC 以视频表征、机器人状态及候选动作预测未来潜变量，用目标图像表征距离规划。可离线比较将候选停留或撤退动作排序时，潜变量距离和接触余量是否冲突，尤其准备外观近似但负载不同的对照。其 Franka 试验采用 blocking control，不能替代本课测量的超时确认；AMI Labs 当前提出表征空间预测与动作条件方向，本例尚无 AMI 模型实验。',
          sourceIds: ['behavior', 'r2s', 'jepa', 'ami'],
        },
        {
          heading: '04 从笔记本回放筛掉没有证据的设计',
          body: '用 Mac 生成事件轨迹并固定种子，先覆盖照度变化、时间错乱、冻结帧、丢确认四种类型，各设有故障和健康对照。存故障首见、控制权转移、确认时刻与是否仍持有物体。固定回放可以比较监测器输出，却不能测出换动作后的真实停止时间；需要可交互仿真或另行授权的设备试验才能验证动作影响。\n\n如需云端预算，先在同一仿真记录上比较规则与轻量感知对低质量观测的误判分布，再决定是否测试预测排序。分级分支只有在可用接口和距离条件已验证时才纳入闭环对照。把严重违例作为独立结果保留，即使该方案在普通任务中减少了中断也不抵消这类失败。',
        },
        {
          heading: '延伸阅读 · 把恢复能力与安全交接分别测量',
          body: 'NVIDIA GEAR 的 GR00T 2 把近期视频、指令和机器人状态作为条件，联合去噪未来视频与动作段。其 Agentic Control 报告在掉件或停滞时由上层代理调用恢复技能，再把任务交还策略。可借用这个流程为我们的回放增加恢复前后事件，同时把任务恢复成功和安全停机确认放在两列。作者在 YAM 上报告的任务完成次数未给出这里需要的停止期限证明。\n\nRobbyant 的 LingBot-Touch 用传感器专用 tokenizer 和共享 Transformer 进行掩码潜表征预测，发布冻结编码器用于读取带时间、指头和空间地址的触觉 token。若以后具备合规触觉数据，可在同组冻结视频回放里给停止判据加一条接触证据，并单列触觉也过龄的种子。token 包含跨位置上下文，选中某个地址不能直接当成该点的力读数。两项阅读均为选读，课堂夹具不依赖这些模型。',
          sourceIds: ['groot2', 'touch'],
        },
      ],
      points: ['健康误停与故障晚停使用不同分母。', '回退未确认属于违例并需单列。', '空间变体与潜变量排序分别验证。'],
      codeTitle: 'paired_faults.py · 合成种子比较',
      code: `from fractions import Fraction

def violation_delta(direct, graded, limit_ms):
    if not direct or direct.keys() != graded.keys():
        raise ValueError('same nonempty fault seeds required')
    def violation(value):
        if value is not None and value < 0:
            raise ValueError('confirmation cannot precede fault')
        return value is None or value > limit_ms

    b = c = missing_direct = missing_graded = 0
    for seed in direct:
        old, new = direct[seed], graded[seed]
        old_bad, new_bad = violation(old), violation(new)
        b += old_bad and not new_bad
        c += new_bad and not old_bad
        missing_direct += old is None
        missing_graded += new is None
    return Fraction(c - b, len(direct)), (missing_direct, missing_graded)

direct = {'freeze': None, 'late': 120, 'glare': 100, 'drop': 80}
graded = {'freeze': 150, 'late': 90, 'glare': 130, 'drop': None}
assert violation_delta(direct, graded, 100) == (Fraction(1, 4), (1, 1))
assert violation_delta({'a': 100}, {'a': 100}, 100) == (0, (0, 0))
for bad in ({'b': 20}, {'a': -1}):
    try:
        violation_delta({'a': 80}, bad, 100)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid comparison accepted')
print('paired deadline delta and unconfirmed outcomes verified')`,
      codeNotes: ['每个字典键是一条配对的合成故障种子，值为整数毫秒或 None。正好 100 ms 仍通过，这里审计的是测量结果期限，与代码精读的确认门限合同分别定义。', '循环累加不一致对和缺确认数，分数保留精确差值。拒绝错配种子和负延迟，未调用仿真或真实设备。'],
      exercise: {
        prompt: '给四个故障种子和六个健康种子分别记账',
        steps: ['用代码的 direct/graded 夹具手算两种违例率。', '若六个健康种子中立即回退误停两次而分级方案一次，写出两组指标和取舍理由。'],
        solution: '立即回退违例 2/4，分级 3/4，相差 25 个百分点。健康误停是 2/6 对 1/6，说明较少打断健康任务的同时多出一次故障违例。继续定位 glare 与 drop 的失败条件，在有可靠回退证据之前，少一次误停不足以抵消安全期限违例。',
      },
      quiz: {
        question: '有两个回退方案都没收到停止确认，为什么这对种子仍应留在报告里？',
        hint: '区分配对差值的分子和每种方案自己的违例率。',
        keywords: ['共同失败', '配对分母', '停止确认', '期限违例', '绝对风险'],
        reference: '该对在方向差值的分子中相互抵消，但仍进入两组违例率与配对总分母。两次均记为未确认，避免差值为零被误读为两个方案都可靠。',
      },
      sources: [
        { id: 'behavior', label: 'StanfordVL OmniGibson BehaviorTask', url: 'https://behavior.stanford.edu/reference/tasks/behavior_task.html', reading: '读 _create_termination_conditions 的 Timeout、PredicateGoal 与 env_idx 路由，区分任务状态和独立停止判据。' },
        { id: 'r2s', label: 'World Labs R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '实读可复用交互环境和外观、物理、视角变化，作为故障注入维度来源。' },
        { id: 'jepa', label: 'Meta/FAIR V-JEPA 2 原论文 v1', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 §3.1 输入、§3.2 目标能量与 §4.1 Robot deployment 的 blocking control。' },
        { id: 'ami', label: 'AMI Labs 研究方向', url: 'https://amilabs.xyz/', reading: '核对表征预测、动作条件和可靠性主张，课堂假设没有归作 AMI 成果。' },
        { id: 'simplex', label: 'Black-Box Simplex 原论文 v3', url: 'https://arxiv.org/html/2102.12981v3', reading: '查 §2.2 的安全定义。配对故障率仅为课堂测试统计，不能推出形式安全定理。' },
        { id: 'groot2', label: '选读 · NVIDIA GEAR GR00T 2', url: 'https://research.nvidia.com/labs/gear/gr00t-2/#agentic-control', reading: '核对 Model Architecture 与 Agentic Control 的任务分解、观测和接触技能交接，使用作者项目页，未复现实验。' },
        { id: 'touch', label: '选读 · Robbyant LingBot-Touch', url: 'https://github.com/Robbyant/lingbot-touch/blob/c6268dd3e5d2f6f5c33d3fa4a9e999683a937086/README.md', reading: '读 Pre-Training、Usage、Sharpa/XHand 接口及 latent/time_id/finger_id/pos_xyz 输出；区分跨传感器表征和物理测量。' },
        { id: 'ov', label: '选读 · Isaac Lab OVPhysX 并行场景', url: 'https://github.com/isaac-sim/IsaacLab/commit/2742c2d5e6b950d0150781e384bcd8388c29e3ee', reading: '核对 _warmup_and_load 去掉强制 broadphase 环境位数的差异。故障注入做配对时固定后端、克隆数及地面设置，单独记录模拟吞吐和停止测量。' },
      ],
    },
  },
};
