import type { AuthoredDay } from './types';

export const day74: AuthoredDay = {
  reviewedAt: '2026-11-09',
  revision: '逐课编写 1.0',
  deliverable: '带观测守卫的 approach → grasp → lift 状态图、纯内存回放夹具和三方案分阶段对照表。35+40+25=100 分钟。',
  question: {
    title: '抓取规划找到解，但闭爪后目标被遮挡，怎样避免阶段机误进 lift？',
    summary: '写出缺证、阶段超时和策略输出作废的处理顺序，并设计一次可归因的回放。',
    keywords: ['阶段守卫', '未知证据', '单调时钟', '阶段代号', '条件分母', '回放'],
    reference: '规划解只表明规划模型下存在候选路径。缺少同一目标的新鲜持有证据时，守卫为未知，grasp 不晋级，阶段计时继续；达到期限后结束本次任务并交给独立监督层。切换阶段时作废旧阶段代号下的候选动作。保留原始时间戳、闭爪事件、目标身份及持有信号，按到达 grasp 的试验计算条件转移率，另报误晋级、超时和整任务成功。先用同一段回放替换守卫验证差异，再做等预算闭环对照。',
  },
  lessons: {
    foundation: {
      title: '状态机与任务阶段',
      minutes: 35,
      prerequisites: '会区分上一课的 requested、sent、measured，并理解图像时间戳和动作限速。',
      connection: '11 月 12 日回答命令怎么变得平滑，今天回答哪个阶段拥有发出候选的资格。11 月 14 日再把异常检测与安全回退拆成独立监督层。',
      intro: '用观测守卫、阶段记忆与优先级把接近、抓住和提起连成可审计的混合过程。',
      outcomes: ['给出接近、抓取与提起各自的物体反馈', '手算连续证据计数并解释超时优先级'],
      sections: [
        {
          heading: '01 连续反馈里为什么要记住阶段',
          body: '想象 SO-101 夹爪离方块两厘米。接近时这个距离意味着可以继续向目标移动，提起时同样的图像距离可能说明物体已经脱落。当前图像与关节值相同，合理的下一步仍可能不同，因为夹爪是否已闭合、当前目标是谁、上个阶段是否获得持有证据，属于跨帧的任务记忆。\n\n将连续控制量留在阶段内部，用离散状态记录任务进展。approach 绑定本次抓取的目标身份和坐标，grasp 等待能够区分夹空与持有的反馈，lift 在持有仍有效时考察物体离开支撑面的高度。阶段名记录正在尝试什么，转移原因记录为什么可以进入下一段，执行结果记录物理世界发生了什么。',
          sourceIds: ['mtc', 'behavior'],
        },
        {
          heading: '02 从谓词组成可判定的转移',
          body: '在离线夹具里将距离换算成毫米，接近证据由小于等于阈值、帧龄合格及目标身份一致共同给出。每个谓词可以为真、假或未知。未知包括遮挡和定位失效，必须打断连续证据计数。达到阶段期限与普通晋级同拍出现时，先处理超时，防止边界帧让已经过期的任务重新获得执行资格。\n\n设两次合格的新帧才允许接近转入抓取。示例阈值 20 mm，帧龄上限 60 ms。距离 18、19 mm 的两帧都新鲜且指向同一目标，计数为 1、2；如果中间插入未知帧，后面的 19 mm 只能将计数重新置 1。重复收到旧帧编号也不能累计证据。门限仅用于推导与回放。',
          formulas: [{
            latex: String.raw`c_t=\mathbf{1}[g_t=\mathrm{true}](c_{t-1}+1),\qquad g_t=(d_t\le D)\land(0\le a_t\le A)\land(i_t=i^\star)`,
            explanation: 't 遍历严格递增的新观测。c 为连续有效帧数，d 和 D 单位 mm，a 是同一时钟域的观测年龄，A 单位 ms，i 是观测目标 ID。指示函数只在证据明确为真时取 1，缺失也清零。',
          }],
        },
        {
          heading: '03 抓住与提起是两个不同的可观测结论',
          body: '闭爪请求发出属于命令日志，闭爪达到某一位置属于执行反馈，方块随夹爪移动才是可支持抓稳的物体证据。可将相对位姿稳定、夹爪间隙和观测质量同时记录。示例用外部给定的 held 三值信号，实际采集时需要为该信号记录传感器来源、单位、估计误差和时间戳。\n\nlift 的参照高度应固定到抓取前的支撑面或任务坐标。只看末端高度会把空夹也算成成功。若已持有的明确证据消失，记录脱落或证据未知的区别：前者可以立即结束本次任务，后者暂停产出新提起候选并等待期限。若存在下发队列，禁止产出和撤销在途命令必须由不同层各自确认。',
          sourceIds: ['behavior', 'mtc'],
        },
        {
          heading: '04 同一时钟下明确一拍的优先顺序',
          body: '观测年龄用决策时刻减去采样时刻，阶段时长用决策时刻减去进入阶段时刻。假设进入抓取时是 1000 ms，期限是 300 ms，1300 ms 才收到的强持有证据也应进入失败记录。即使帧龄只有 20 ms，它仍然无法改变阶段时长已经达到期限这一事实。\n\n记录旧阶段、新阶段、触发守卫、决策时刻、观测身份以及拒绝原因。ROS 2 Managed Nodes 的 Active/Inactive 可作为区分组件可用性与任务阶段的参考：节点 Active 可以处在任何抓取阶段，进程恢复也不应该自动复用之前的任务记忆。今天只构造阶段账本，下一课才继续研究设备失联和回退。',
          sourceIds: ['lifecycle'],
        },
      ],
      points: ['阶段是任务记忆。', '守卫由新鲜、同一目标的证据组成。', '超时优先于普通晋级。'],
      codeTitle: 'approach_evidence.py · 连续证据回放',
      code: `def approach_tick(count, distance_mm, age_ms, target, expected):
    known = distance_mm is not None and age_ms is not None
    eligible = known and 0 <= distance_mm <= 20 and 0 <= age_ms <= 60
    return count + 1 if eligible and target == expected else 0

count = 0
trace = []
for distance, age, target in [(18, 30, 'cube'), (None, 15, 'cube'),
                              (19, 25, 'cube'), (17, 20, 'cube')]:
    count = approach_tick(count, distance, age, target, 'cube')
    trace.append(count)
assert trace == [1, 0, 1, 2]
assert approach_tick(1, 15, 61, 'cube', 'cube') == 0
assert approach_tick(1, 15, 10, 'other', 'cube') == 0
print(trace)`,
      codeNotes: ['第一段只计算接近守卫的连续计数，输入每项代表一条已去重的新观测。', '主回放在遮挡后重新累积两帧，负例区分帧龄超限和目标错配；阶段期限、通信与电机均未实现。'],
      exercise: {
        prompt: '计算接近守卫的第一处晋级',
        steps: ['给出 (距离 mm，年龄 ms) 为 (19,20)、(18,65)、(20,60)、(19,25) 的四条同目标新观测。', '用 20 mm、60 ms 与两帧阈值手算计数，说明第二帧为何被拒。'],
        solution: '计数为 1、0、1、2，首次允许晋级是第四帧。第二帧虽然空间距离合格，但 65 ms 超龄，清除连续证据。第三帧两项均等于允许上限，按闭区间合同有效。',
      },
      quiz: {
        question: '为什么闭爪命令成功写入，还需要在 grasp 阶段等待新观测？',
        hint: '想象夹爪已经闭合，但物体一直停在桌上。',
        keywords: ['持有证据', '闭爪命令', '遮挡', '目标身份', '超时'],
        reference: '命令写入仅证明请求提交，夹爪可能夹空。grasp 应等待同一目标的新鲜持有证据，例如物体随夹爪稳定移动。遮挡导致证据未知，需要阻止晋级并继续阶段计时，超时按失败事件处理。',
      },
      sources: [
        { id: 'mtc', label: 'MoveIt Task Constructor 官方抓取教程', url: 'https://moveit.picknik.ai/main/doc/tutorials/pick_and_place_with_moveit_task_constructor/pick_and_place_with_moveit_task_constructor.html', reading: '11 月 9 日实读 Basic Concepts 与 Pick Object 的 MoveRelative、GenerateGraspPose、ComputeIK、闭爪和附着。上游组合规划阶段，课堂转移依据在线反馈。' },
        { id: 'behavior', label: 'StanfordVL OmniGibson BehaviorTask', url: 'https://behavior.stanford.edu/reference/tasks/behavior_task.html', reading: '查看 BehaviorTask 的_create_termination_conditions、Timeout、PredicateGoal 和 BDDL goal options；任务条件可检查，阶段机不是该基准提供的控制器。' },
        { id: 'lifecycle', label: 'ROS 2 Managed Nodes 设计文档', url: 'https://design.ros2.org/articles/node_lifecycle.html', reading: '读 Primary States、Active 和 Transition State ErrorProcessing，区分组件监督与业务阶段。' },
      ],
    },
    code: {
      title: '实现 approach、grasp、lift 状态',
      minutes: 40,
      prerequisites: '能用 dataclass 表达事件，知道状态枚举、单调时钟和输入验证。',
      connection: '把基础课的谓词放进纯内存阶段机，观察证据被消费的时刻。下一课将用这里的失败原因区分状态机失效与设备监督失效。',
      intro: '精读 MoveIt 从阶段规划到单独执行的入口，写一套以反馈和时钟为输入的阶段回放。',
      outcomes: ['找到规划搜索与动作执行的源码边界', '用回放验证旧帧、时间边界及阶段转移'],
      sections: [
        {
          heading: '01 从真实规划入口找到边界',
          body: '从 MoveIt 官方教程的 createTask 看起。CurrentState 提供规划起点，Connect 尝试连接候选，SerialContainer 把接近、求抓取位姿、闭爪、附着与抬升组合起来。生成器、传播器与连接器按可用接口传递规划结果，因此教程代码的排列也不能直接解释为控制线程每拍依次执行这些类。\n\n再读 core/src/task.cpp 的 Task::plan。它 init 后循环检查 canCompute 和解数量限制，处理抢占与超时，并由 compute 触发 stage 的 runCompute。已有可用解时 success_or 可以返回成功。Task::execute 是另一个入口，将指定解转成 action goal 并等待结果；规划阶段的 success 不提供夹爪当前是否握住方块的观测。',
          sourceIds: ['tutorial', 'source'],
        },
        {
          heading: '02 输入采用帧和决策双时间',
          body: 'Frame 包括采样时刻、目标 ID、距离、held 三值与物体高度。教学帧只有标量，没有批维，单位统一为 ms 和 mm。不同相机真实采样时刻需要在进入本函数前完成同步。Machine.tick 的 now 是回放时钟，可在没有帧时调用，因而阶段期限不会被视频停流悄悄冻结。\n\n时钟倒退先拒绝，且不提交任何状态。有效的新帧时间必须严格晚于上一帧且不在未来。无帧和重复帧不会增加计数，只有观测年龄超过合同上限才清空历史连续证据。明确收到的新帧若超龄、采自本阶段进入前、目标错配或谓词未知，则当拍立即清零。生产系统还需要会话 ID 以区分相机重启后的时间与序列。',
        },
        {
          heading: '03 转移只提交一次并清除旧证据',
          body: 'tick 先检查阶段期限，再读该阶段的守卫。APPROACH 需要合格的距离，GRASP 需要明确持有，LIFT 需要持有与物体高度同时满足（教学工作区为 30–100 mm）；明确失去持有则进入 FAILED。单次调用最多一次转移，进入新阶段后计数归零，触发转移的那条帧已经消费。这样一个同时带距离、持有与高度的观测不会在一拍内跳到 DONE。\n\n阶段序号每次转移递增，可作为上层队列附带的标签。发布候选时应重新核对阶段序号、观测年龄和独立监督许可，禁止旧阶段结果穿越边界。这里仅返回状态和原因，未实现队列、控制器或并发；不能据此认为已经取消了真实设备收到的命令。',
          sourceIds: ['source', 'lifecycle'],
        },
        {
          heading: '04 正负回放怎样定位失败',
          body: '正例先给两个接近观测，其中一条被重复投递，检查阶段只在第二条新帧后改变。之后两条持有帧进入 LIFT，再用两条高度合格的物体反馈进入 DONE。通过阶段代号的递增可验证迁移只发生三次。所有通过值来自合成数据，未调用 MoveIt、ROS 或设备。\n\n负例覆盖恰好到期限且持有为真的竞争、错目标清零、未来帧、视频停流、明确脱落以及时钟倒退。测试还检查阶段转换的触发帧即使再次投递也不能成为下一阶段的第一票。区别记录 timeout、waiting、wrong-target 与 dropped，才能用同一个录像复查失败出在观察还是阶段转移。',
        },
      ],
      points: ['plan 与 execute 是独立入口。', 'tick 能在无帧时推动期限。', '每帧最多提交一次阶段转移。'],
      codeTitle: 'pick_phase_replay.py · 原创内存阶段机',
      code: `from dataclasses import dataclass
from enum import Enum, auto

class Phase(Enum):
    APPROACH = auto()
    GRASP = auto()
    LIFT = auto()
    DONE = auto()
    FAILED = auto()

NEXT = {Phase.APPROACH: Phase.GRASP, Phase.GRASP: Phase.LIFT,
        Phase.LIFT: Phase.DONE}

@dataclass(frozen=True)
class Frame:
    at: int
    target: str = 'cube'
    distance: float | None = None
    held: bool | None = None
    height: float | None = None

class Machine:
    def __init__(self):
        self.phase = Phase.APPROACH
        self.entered = self.now = self.generation = self.count = 0
        self.last_frame = None

    def transition(self, phase, reason):
        self.phase, self.entered, self.count = phase, self.now, 0
        self.generation += 1
        return reason

    def tick(self, now, frame=None):
        if now < self.now:
            raise ValueError('decision clock went backwards')
        self.now = now
        if self.phase not in NEXT:
            return 'terminal'
        if now - self.entered >= 300:
            return self.transition(Phase.FAILED, 'timeout')
        if self.last_frame is not None and now - self.last_frame > 60:
            self.count = 0
        if frame is None or (self.last_frame is not None and frame.at <= self.last_frame):
            return 'waiting'
        if frame.at > now:
            self.count = 0
            return 'future-frame'
        self.last_frame = frame.at
        if frame.at < self.entered or now - frame.at > 60:
            self.count = 0
            return 'stale-frame'
        if frame.target != 'cube':
            self.count = 0
            return 'wrong-target'
        if self.phase is Phase.APPROACH:
            good = frame.distance is not None and 0 <= frame.distance <= 20
        elif self.phase is Phase.GRASP:
            good = frame.held is True
        else:
            if frame.held is False:
                return self.transition(Phase.FAILED, 'dropped')
            good = frame.held is True and frame.height is not None and 30 <= frame.height <= 100
        self.count = self.count + 1 if good else 0
        if self.count == 2:
            return self.transition(NEXT[self.phase], 'advanced')
        return 'evidence' if good else 'missing-evidence'

def at_grasp():
    machine = Machine()
    assert machine.tick(20, Frame(20, distance=18)) == 'evidence'
    assert machine.tick(30, Frame(20, distance=18)) == 'waiting'
    assert machine.tick(40, Frame(40, distance=19, held=True)) == 'advanced'
    assert machine.phase is Phase.GRASP and machine.count == 0
    assert machine.tick(41, Frame(40, held=True)) == 'waiting'
    return machine

m = at_grasp()
for time, expected in [(60, 'evidence'), (80, 'advanced')]:
    assert m.tick(time, Frame(time, held=True)) == expected
assert m.phase is Phase.LIFT
assert m.tick(100, Frame(100, held=True, height=31)) == 'evidence'
assert m.tick(120, Frame(120, held=True, height=33)) == 'advanced'
assert m.phase is Phase.DONE and m.generation == 3

delayed = Machine()
delayed.tick(20, Frame(20, distance=18))
delayed.tick(80, Frame(30, distance=19))
assert delayed.phase is Phase.GRASP
assert delayed.tick(90, Frame(70, held=True)) == 'stale-frame'
assert delayed.count == 0

m = at_grasp()
assert m.tick(60, Frame(60, held=True)) == 'evidence'
assert m.tick(80, Frame(80, target='other', held=True)) == 'wrong-target'
assert m.count == 0
assert m.tick(100, Frame(105, held=True)) == 'future-frame'
assert m.tick(110, Frame(110, held=True)) == 'evidence'
assert m.tick(171) == 'waiting' and m.count == 0
assert m.tick(320, Frame(320, held=True)) == 'evidence'
assert m.tick(340, Frame(340, held=True)) == 'timeout'
assert m.phase is Phase.FAILED
snapshot = vars(m).copy()
try:
    m.tick(339)
except ValueError:
    assert vars(m) == snapshot
else:
    raise AssertionError('backwards clock was accepted')

m = at_grasp()
m.tick(60, Frame(60, held=True))
m.tick(80, Frame(80, held=True))
assert m.tick(100, Frame(100, held=False)) == 'dropped'
print('stage sequence, timestamp guards, timeout priority and drop verified')`,
      codeNotes: ['枚举与 NEXT 描述可推进阶段；Frame 是不可变输入。教学假设调用已按单一决策时钟串行化，目标固定为 cube，限值只用于夹具。', 'tick 先处理全局阶段期限，再检查时间和身份，最后消费一条阶段证据。transition 清理计数并更新阶段代号。', '正例验证完整阶段序列。负例精确触发时间边界与重复帧，还断言回拨失败前后对象字段一致。'],
      exercise: {
        prompt: '给回放加一个超龄证据夹具',
        steps: ['从 at_grasp() 出发，用 now=140、frame.at=70、held=True 造一条之前未处理但超龄的帧。', '再给 now=160、frame.at=160 的持有帧，断言原因和阶段计数。'],
        solution: '第一拍返回 stale-frame，70 ms 大于 60 ms，计数为 0；它的采样时刻仍被记录为已消费。第二拍返回 evidence，计数为 1 且阶段仍是 GRASP。这排除了把超龄帧与新帧拼成两票的错误。',
      },
      quiz: {
        question: '为什么 Task::plan 返回 SUCCESS 与离线阶段机报告 LIFT 属于不同类型的事实？',
        hint: '对比 success_or 的判据和 GRASP 守卫的输入。',
        keywords: ['候选解', 'Task::execute', '持有反馈', '阶段守卫', '解数量'],
        reference: 'Task::plan 的成功来自搜索得到可用规划解，取决于阶段接口和规划模型。Task::execute 才发送指定解。离线阶段机报告 LIFT 表示实际输入轨迹满足抓取守卫，判断基于时间、目标和持有反馈，与候选解数量无关。',
      },
      sources: [
        { id: 'tutorial', label: 'MoveIt 官方 MTC 抓放教程', url: 'https://moveit.picknik.ai/main/doc/tutorials/pick_and_place_with_moveit_task_constructor/pick_and_place_with_moveit_task_constructor.html', reading: '实读 CurrentState、Connect、Pick Object 串行容器、MoveRelative 和 ComputeIK 的接口属性。' },
        { id: 'source', label: 'MoveIt Task Constructor task.cpp', url: 'https://github.com/moveit/moveit_task_constructor/blob/f527048b3db1574f68f5c646e9ed7099085af5c8/core/src/task.cpp#L213-L313', reading: '2026-11-09 核验 ros2 分支及固定提交 f527048，定位 Task::canCompute、Task::compute、Task::plan 与 Task::execute；规划候选数量和实际控制结果分开。' },
        { id: 'lifecycle', label: 'ROS 2 组件生命周期', url: 'https://design.ros2.org/articles/node_lifecycle.html', reading: '复读 Active、Deactivate 与 ErrorProcessing，教学任务代号与节点生命周期事件分别记账。' },
      ],
    },
    insight: {
      title: '何时需要模型，何时规则更可靠',
      minutes: 25,
      prerequisites: '会读阶段条件、条件概率及 11 月 11 日的感知年龄日志。',
      connection: '沿用上一课的发送前后动作和测量日志，把规则、学习策略与预测规划的收益拆到各阶段；为明天的异常与回退课程留下可重复失败用例。',
      intro: '用同难度的分阶段闭环实验定位学习收益，并让空间仿真和预测模型各自接受适合的验证。',
      outcomes: ['按正确分母计算阶段通过率与整任务成功率', '为规则、局部策略与预测排序定义可比的闭环证据'],
      sections: [
        {
          heading: '01 规则、局部策略与全程策略各自负责什么',
          body: '固定工位中，已标定的深度和重复出现的工件使目标距离与支撑面高度可直接比较。规则阶段机能把错误定位到门限、坐标或传感器。透明、反光和局部遮挡会系统性破坏几何观测，规则即使确定性很强，输入证据也可能长期未知。可以先用 RAW 与 RGB 的成对录像验证检测稳定性，保留同曝光、同轨迹和相同的判定标准。\n\n局部学习策略可在接近阶段提出绕障或调整姿态的候选，阶段守卫仍负责何时进入抓取，代价是需要交接分布的训练数据。全程 VLA 可能共享阶段间的恢复线索并减少手工拆分，代价是更难从一次失败中分离错误阶段与错误动作。三者共用独立监督和相同的任务成功谓词，才便于把收益归到策略而非试验条件。',
        },
        {
          heading: '02 条件分母让阶段瓶颈可见',
          body: '对同一批 N 次任务，用 N_A、N_G、N_L 分别记录通过 approach、继续通过 grasp、继续通过 lift 的次数。教学计数按一次性串行路径，失败试验不会重入；链式分解不要求各阶段独立。若上游筛掉难例，下一阶段的条件成功率甚至可能上升，所以需要同时报告每阶段覆盖率、目标扰动分层和全程分母。\n\n例子取 100 次，90 次接近、72 次抓稳、54 次提起，条件率为 0.90、0.80、0.75。另一个方案是 80、72、60 次，抓取条件率 0.90，但抓稳次数仍为 72，最终通过数多六次；要判断是否来自提起策略，还要核对进入 lift 的试验组成。两套通过的样本身份可能不同，需要按相同物体和遮挡种子配对复核才能解释成因。',
          formulas: [{
            latex: String.raw`\widehat P(L\cap G\cap A)=\frac{N_A}{N}\frac{N_G}{N_A}\frac{N_L}{N_G}=\frac{N_L}{N}`,
            explanation: 'A、G、L 是相继通过三个阶段的事件，N 是总试验数，N_A、N_G、N_L 为嵌套计数。只有分母大于零时才报告对应条件率，分母为零时标记缺测。',
          }],
        },
        {
          heading: '03 空间生成与动作条件预测进入不同的试验位置',
          body: 'StanfordVL 的 BEHAVIOR/OmniGibson 以场景对象状态和任务谓词定义起点与终点。可用仿真接触或目标位置作参照，测量从视觉中估计持有的守卫有多少漏报和误报。World Labs 的 R2S2R 则公开描述将真实任务重建成可交互仿真，并变更外观、物理及视角；Atlas 的共享空间上下文可用于考虑视角覆盖。两者分别提供评测语义和空间试验条件，其材料不能合并成 SO-101 实测结论。\n\nMeta/FAIR 的 V-JEPA 2-AC 用视频表征、机器人状态和候选动作预测后续潜变量，并通过目标图像的表征距离选动作。其训练把相邻末端状态的差分用作动作条件。可以据此设计课堂对照：让候选动作对 approach 的接近有利，同时准备一组目标没被真正夹住的潜在近邻；用物体反馈量化预测排序与真实持有的一致性。AMI Labs 将表征预测、动作条件模型与可靠性列为当前研究方向，这项实验属于个人验证设计。',
          sourceIds: ['behavior', 'r2s', 'atlas', 'jepa', 'ami'],
        },
        {
          heading: '04 先把证据采齐，再决定是否加复杂模型',
          body: 'Mac 上先回放同批合成和自有录像，导出阶段代号、观测年龄、守卫真假、候选动作、发送结果及原因。用遮挡时段、换物体位置和不同反光强度分层，比较规则感知与学习感知对同一持有标签的判断。录像回放适合估计守卫误报漏报，却无法给出替代动作引起的反事实转移。\n\n需要学习时再在 4090 预算内比较冻结视觉特征探针与小型局部策略，固定示范划分、控制频率和处理合同，记录训练耗时、条件成功率、接管与观测年龄分布。只有可交互仿真或另行获得授权的闭环数据才能检验换策略后抓取是否变好。Isaac Lab 的 Newton 后端提供了一个本期延伸例子：请求接触传感器位姿时，以显式不支持代替未写入的零值。相应地，把输入缺失编码成未知，避免零位姿制造距离合格的假证据。',
          sourceIds: ['jepa', 'r2s', 'newton'],
        },
      ],
      points: ['条件阶段率与全程分母一起报告。', '配对回放能检查感知守卫。', '替换动作的因果结果需要交互证据。'],
      codeTitle: 'stage_funnel.py · 嵌套分母审计',
      code: `def funnel(total, approached, grasped, lifted):
    if not total >= approached >= grasped >= lifted >= 0 or total == 0:
        raise ValueError('counts must be nested within a nonempty cohort')
    stages = (total, approached, grasped, lifted)
    conditional = tuple(
        passed / entered if entered else None
        for entered, passed in zip(stages, stages[1:])
    )
    return conditional, lifted / total

a, end_a = funnel(100, 90, 72, 54)
b, end_b = funnel(100, 80, 72, 60)
assert a == (.90, .80, .75) and end_a == .54
assert b[1] == .90 and end_b == .60
assert funnel(100, 0, 0, 0) == ((0., None, None), 0.)
try:
    funnel(100, 50, 51, 30)
except ValueError:
    pass
else:
    raise AssertionError('accepted mismatched denominator')
print(a, b, end_a, end_b)`,
      codeNotes: ['检查器先验证四个计数嵌套。这里假定上游传入来自同一批唯一试验的整数计数。', '阶段条件率分母为零时返回 None，仍保留全程成功率为零；负例捕捉下游通过数超过上游通过数。该脚本不执行模型或仿真。'],
      exercise: {
        prompt: '识别看似更强的抓取模块',
        steps: ['比较 60 次任务中 50、40、30 与 40、36、29 的两组阶段通过数。', '计算抓取条件率和全程率，写出一个必须配对复查的分层变量。'],
        solution: '抓取条件率从 40/50=80% 升到 36/40=90%，全程率从 30/60=50% 降到 29/60≈48.3%。按同物体与同遮挡程度配对复查，判断新方案的接近阶段是否先筛掉了难抓的样本。',
      },
      quiz: {
        question: '用世界模型给接近动作排序后，抓取条件率提高，应补什么证据才能判断端到端收益？',
        hint: '比较两种策略进入 grasp 的试验是否一样难。',
        keywords: ['条件分母', '全程成功率', '配对分层', '目标谓词', '闭环'],
        reference: '同时报告接近覆盖率、整任务成功率、持有误报与执行年龄。按同一物体、视角和遮挡种子配对，固定安全监督与成功谓词。候选排序可用离线预测验证，动作改变后的任务收益需要可交互仿真或真机闭环支持。',
      },
      sources: [
        { id: 'behavior', label: 'StanfordVL BEHAVIOR 任务与终止 API', url: 'https://behavior.stanford.edu/reference/tasks/behavior_task.html', reading: '读取 BehaviorTask._create_termination_conditions 对 Timeout 和 PredicateGoal 的构造，作为外部持有/任务谓词的设计参照。' },
        { id: 'r2s', label: 'World Labs R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读 one real task / thousands of variations 图文与评估段，区分可交互重建变体和厂商报告的迁移结果。' },
        { id: 'atlas', label: 'World Labs Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '查共享空间上下文与相机视角生成，视角鲁棒性实验与接触动力学实验分开。' },
        { id: 'jepa', label: 'Meta/FAIR V-JEPA 2 原论文 v1', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 §3.1 动作与状态输入、§3.2 图像目标规划、§4.3 长程任务与相机局限；以 Franka 试验边界解释 SO-101 教学外推。' },
        { id: 'newton', label: '延伸阅读 · Isaac Lab Newton 接触传感器', url: 'https://github.com/isaac-sim/IsaacLab/commit/4cfdfcfa52d7cb64eb83ab293b2fcfc92452aaf1', reading: '可选。实读 ContactSensorData.pos_w、quat_w 和配置告警：track_pose 开启时不支持的位姿读取抛出 NotImplementedError；仅属于 Isaac Lab Newton 后端。' },
        { id: 'ami', label: 'AMI Labs 官方研究方向', url: 'https://amilabs.xyz/', reading: '查看表征空间预测、可控性与可靠性主张；这里的阶段实验和数量是假设。' },
      ],
    },
  },
};
