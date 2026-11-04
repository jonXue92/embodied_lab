import type { AuthoredDay } from './types';

const isaacSha = 'e4a79c7fd6db24db14b5758d881202f9c7420530';
const isaacRoot = 'https://github.com/isaac-sim/IsaacLab/blob/' + isaacSha;
const lerobotSha = '6e3b67c5f0b77c93a5179d88d7c1d6a5f7ff7b27';
const lerobotRoot = 'https://github.com/huggingface/lerobot/blob/' + lerobotSha;
const sources = [
  { id: 'simopt68', label: 'Chebotar 等 · SimOpt 原论文', url: 'https://arxiv.org/abs/1810.05687', reading: '2026-11-04 实读问题定义、轨迹差异、模拟参数分布更新和真实 rollout 预算；用于说明辨识目标应是轨迹分布而非单个静态数值，不把论文机器人结果写成本地复现。' },
  { id: 'dynrand68', label: 'Peng 等 · Dynamics Randomization 原论文', url: 'https://arxiv.org/abs/1710.06537', reading: '实读质量、摩擦、阻尼、控制增益和观测噪声等随机轴，以及校准误差下的迁移实验；用于对照“精确校准”与“分布训练”，不外推其机械手成绩。' },
  { id: 'isaacActDoc68', label: 'Isaac Lab · Actuators 官方文档', url: 'https://isaac-sim.github.io/IsaacLab/v3.0.0/source/concepts/actuators.html', reading: '核对 implicit/explicit 执行路径、PD 方程、stiffness/damping、静态/动态/黏性摩擦、effort limit、command delay 与参数归属；特别记录后端和单位差异。' },
  { id: 'isaacPd68', label: 'Isaac Lab · actuator_pd.py（固定提交）', url: isaacRoot + '/source/isaaclab/isaaclab/actuators/actuator_pd.py', reading: '定位 IdealPDActuator.compute、DCMotor._clip_effort、DelayedPDActuator.compute/reset；核对期望位置/速度、applied/computed effort、饱和和每次 reset 采样延迟的调用链。' },
  { id: 'isaacDelay68', label: 'Isaac Lab · DelayBuffer（固定提交）', url: isaacRoot + '/source/isaaclab/isaaclab/utils/buffers/delay_buffer.py', reading: '定位 append、set_time_lag 与 CircularBuffer；延迟以 physics step 计数，设置范围和 episode reset 身份必须写入 manifest。' },
  { id: 'isaacEvent68', label: 'Isaac Lab · events.py（固定提交）', url: isaacRoot + '/source/isaaclab/isaaclab/envs/mdp/events.py', reading: '定位 randomize_actuator_gains、randomize_joint_parameters 与 _randomize_prop_by_op；核对 abs/add/scale、uniform/log_uniform/gaussian 和 joint writer 入口。' },
  { id: 'lerobotSo68', label: 'LeRobot · SO-101 官方指南（固定提交）', url: lerobotRoot + '/docs/source/so101.mdx', reading: '核对 follower/leader 舵机、设备 ID、居中与扫全行程的标定流程；该流程建立编码器零点/范围，不等于识别执行器动力学。' },
  { id: 'lerobotBus68', label: 'LeRobot · motors_bus.py（固定提交）', url: lerobotRoot + '/src/lerobot/motors/motors_bus.py', reading: '定位 read_calibration、write_calibration、set_half_turn_homings、record_ranges_of_motion 与 normalize/unnormalize；核对 range_min/max、homing_offset、drive_mode 和 motor-name 身份。' },
  { id: 'r2s2r68', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '实读真实机器人/环境/对象/交互到 aligned simulation、可控变体、开闭环对齐和策略排序；用于参数证据回到真实复核，不把产品主张写成 Stanford 基准结果。' },
  { id: 'behaviorEval68', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '核对固定公开/隐藏实例、单次 rollout、Q-score 和禁止 cherry-pick；辨识轨迹与策略评测实例必须分离。' },
  { id: 'vjepa68', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '仅用于谱系边界：V-JEPA 2/动作条件世界模型属于 Meta/FAIR 历史成果，不把本课执行器辨识或 Isaac Lab 更新改署为 LeCun 当前团队。' },
  { id: 'ami68', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '仅用于当前组织边界：表征空间预测、动作条件世界模型、可靠性与安全是公开方向；未发布参数辨识方法时不写成 AMI 实证。' },
];

export const day68: AuthoredDay = {
  reviewedAt: '2026-11-04',
  revision: '逐课编写 1.0',
  deliverable: '一份“激励→对齐→拟合→残差→复验”系统辨识协议；一个含延迟、摩擦与一阶执行器响应的离线拟合夹具；一张按可辨识性、漂移和安全敏感度划分校准/随机化/冻结的决策表。三课共 100 分钟，另留 20 分钟复盘。',
  question: {
    title: '为什么 SO-101 已完成零点和行程标定，仍不能直接说仿真执行器已经与真机一致？',
    summary: '编码器映射只解决坐标身份，动力学一致还要测延迟、带宽、摩擦、饱和与负载依赖。',
    keywords: ['encoder calibration', 'system identification', 'latency', 'time constant', 'friction', 'held-out excitation'],
    reference: '零点、方向和 min/max 行程把 raw tick 映射为统一位置坐标，解决的是“读数代表什么”；它没有给出命令到 measured position 的延迟、增益、时间常数、静摩擦死区、速度/力矩饱和及负载变化。应在限速、限位和人工监护下记录 command/sent/measured 时间线，用与拟合不同的激励复验残差；可稳定识别且安全敏感的参数校准，漂移或不可辨识的剩余不确定性再按真实证据随机化。',
  },
  lessons: {
    foundation: {
      title: '系统辨识：从命令—测量轨迹反推延迟、摩擦与执行器响应', minutes: 35,
      prerequisites: '理解 11 月 5 日的 physics/render/action 三时钟、11 月 6 日的参数分布与相关随机化，并会读位置、速度和时间戳日志。',
      connection: '昨日回答“真实不确定性怎样进入训练分布”；今日先用真实轨迹收缩可识别的不确定性。明日将为仿真/真机数据加来源标签和采样权重，避免把校准后的模拟样本当成真实样本。',
      intro: '系统辨识不是调到“看起来差不多”，而是预先定义激励、参数、损失、约束和留出轨迹，再用 command 与 measured response 的差异估计模型。一次拟合得出的小数点很多，不代表参数可辨识；真正的结论来自多种激励、残差结构和跨负载复验。',
      outcomes: ['区分几何/编码器标定与动力学系统辨识', '推导带纯延迟的一阶响应并计算数值例', '识别激励不足、参数耦合和时间戳错位三类假精确'],
      sections: [
        { heading: '01 先区分“坐标正确”与“响应正确”', body: `SO-101 标定流程记录 homing offset、方向和关节可达范围，使同一 motor name 的 raw tick 能归一化到位置单位。这一步若错，所有状态和动作都会整体偏置或翻转；但即使映射完全正确，同一目标位置也可能因负载、摩擦、供电、控制增益和通信排队产生不同轨迹。

动力学辨识关心命令 u(t) 经过控制器、总线、执行器和机构后如何形成 measured q(t)。必须同时保存 proposed、sent、measured 及各自时间戳；把 UI 发出时间当成电机接收时间，会把软件排队误拟合成机械惯性。`, sourceIds: ['lerobotSo68', 'lerobotBus68', 'isaacActDoc68'] },
        { heading: '02 用最小一阶加纯延迟模型建立可检查基线', body: `对低速、小范围、无接触的位置阶跃，可先用一阶模型 q_dot=(K u(t-d)-q)/tau。K 是稳态增益，tau 是时间常数，d 是纯延迟；这不是 SO-101 舵机完整物理，只是能被数据否证的教学基线。若残差呈振荡、方向相关或随负载系统变化，就应增加二阶、摩擦或饱和结构，而不是继续微调一个错误模型。

单位必须写清：u 与 q 若为度，K 无量纲；tau 和 d 为秒。样本周期 20 ms 时，估计 d=60 ms 等价于 3 个采样步，但真实链路可能是抖动分布，不能把整数移位冒充固定硬件常数。`, formulas: [{ latex: String.raw`\dot q(t)=\frac{K\,u(t-d)-q(t)}{\tau},\qquad q(t)=K U\left(1-e^{-(t-d)/\tau}\right)\mathbf 1[t\ge d]`, explanation: 'U 是从零开始的阶跃幅值，K 为稳态增益，tau 为一阶时间常数，d 为纯延迟；公式只适用于所声明的小信号区间。' }], sourceIds: ['isaacActDoc68', 'isaacPd68', 'isaacDelay68'] },
        { heading: '03 数值例必须同时检查延迟与带宽', body: `设 U=30 度、K=0.9、d=0.06 s、tau=0.12 s。t=0.06 s 时响应刚开始；t=0.18 s 已经历一个 tau，因此 q=27(1-e^-1)≈17.07 度；最终稳态趋近 27 度。若只用终点拟合，可识别 K，却无法区分 d 与 tau；若只看首次运动，又会受传感噪声阈值影响。

因此至少需要上升/下降阶跃和若干不同频率的平滑输入。阶跃揭示延迟、稳态误差与饱和，多频正弦揭示带宽与相位；反向运动揭示背隙和方向相关摩擦。每种激励都应限制幅度、速度、姿态和碰撞空间。`, formulas: [{ latex: String.raw`q(0.18)=0.9\times30\times(1-e^{-1})\approx17.07\ ^\circ`, explanation: '0.18-0.06=0.12 秒，恰好是一个时间常数；该算例展示延迟与响应速度是两个不同参数。' }], sourceIds: ['simopt68', 'isaacActDoc68'] },
        { heading: '04 摩擦不能只用一个“摩擦系数”概括', body: `关节可有静摩擦阈值、运动中的库仑摩擦和与速度成比例的黏性摩擦；接触面还有独立的材质摩擦。Isaac Lab 文档明确区分 joint friction 与 contact material，并提示后端/版本的单位和执行方式可能不同。若把关节不动全归因于桌面摩擦，参数会补偿到错误层。

最小方向模型可写 tau_f=F_c sign(q_dot)+b q_dot，并用低速往返轨迹观察死区和速度斜率。静止附近 sign 不连续，有限采样下应设置速度阈值并报告无法区分的区间；没有力矩测量时，F_c、负载重力和控制器积分项可能耦合，不能给出唯一物理解释。`, formulas: [{ latex: String.raw`\tau_f(\dot q)=F_c\operatorname{sign}(\dot q)+b\dot q`, explanation: 'F_c 是库仑摩擦力矩，b 是黏性系数；静止区还需单独的静摩擦/死区规则，不能由 sign(0) 自动代表。' }], sourceIds: ['isaacActDoc68', 'isaacEvent68'] },
        { heading: '05 可辨识性来自激励和留出验证，不来自优化器收敛', body: `若输入始终是常数，K、tau、d 可能出现多组近似解；若所有轨迹只在一个姿态、一个负载和一个方向采集，质量、重力项与摩擦会互相补偿。优化器给出的最小 loss 只说明这批数据上更像，不说明参数唯一，也不说明新轨迹上有效。

应按 session、负载、方向和激励类型分组，使用部分轨迹拟合、另一部分复验。检查 residual 是否随时间、速度、方向或温度仍有结构；白噪声般的小残差比一个漂亮的平均 RMSE 更可信。真实设备实验必须另行授权，本课只在合成数据上演示。`, sourceIds: ['simopt68', 'dynrand68', 'behaviorEval68'] },
      ],
      points: ['编码器标定解决位置身份，系统辨识解决命令到响应的动力学。', '延迟、时间常数、摩擦和饱和需要不同激励才能分开。', '拟合轨迹与留出轨迹必须隔离，结构化残差意味着模型仍错。'],
      codeTitle: 'first_order_delay_fit.py · 延迟与一阶响应网格拟合',
      code: [
        'from math import exp',
        '',
        'def predict(times, step, gain, tau, delay):',
        '    if tau <= 0 or delay < 0: raise ValueError("invalid dynamics")',
        '    return [0.0 if t < delay else gain*step*(1-exp(-(t-delay)/tau)) for t in times]',
        '',
        'def fit_grid(times, ys, step, gains, taus, delays):',
        '    if len(times) != len(ys) or len(times) < 5: raise ValueError("insufficient trace")',
        '    if max(times) - min(times) <= 0: raise ValueError("no temporal excitation")',
        '    rows = []',
        '    for g in gains:',
        '        for tau in taus:',
        '            for delay in delays:',
        '                pred = predict(times, step, g, tau, delay)',
        '                mse = sum((a-b)**2 for a, b in zip(pred, ys)) / len(ys)',
        '                rows.append((mse, g, tau, delay))',
        '    return min(rows)',
        '',
        'times = [i*0.02 for i in range(31)]',
        'measured = predict(times, 30.0, 0.9, 0.12, 0.06)',
        'best = fit_grid(times, measured, 30.0, [0.8,0.9,1.0], [0.08,0.12,0.16], [0.02,0.06,0.10])',
        'assert best[1:] == (0.9, 0.12, 0.06) and best[0] < 1e-12',
        'try:',
        '    fit_grid([0.0]*5, [0.0]*5, 30.0, [1.0], [0.1], [0.0])',
        '    raise AssertionError("unexcited timestamps accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['这是合成的一阶阶跃拟合，不读取串口、不估计真实 SO-101 参数，也不替代安全实验审批。', '网格刻意包含真值，所以正例应精确恢复；真实数据需噪声模型、置信区间和 train/validation 分组。', '负例拒绝所有时间戳相同的伪轨迹，说明“有五行数据”不等于存在时间激励。'],
      exercise: { prompt: '把合成真值改成 K=0.95、tau=0.14、d=0.05，并故意使用不包含真值的粗网格；解释最优点和残差为什么不能叫真实参数。', steps: ['记录网格边界和步长。', '比较拟合轨迹与另一幅值的留出轨迹。', '检查最优解是否贴在搜索边界。'], solution: '粗网格只能给出候选集合中的最佳近似；若最优点贴边或换一幅值后残差显著增大，说明范围/模型或非线性有问题。应扩大有物理依据的范围、增加激励并报告不确定区间，而不是把网格点小数位当成测量精度。' },
      quiz: { question: '为何只记录阶跃最终位置，无法同时识别 K、tau 与 d？', hint: '终点保留了哪些时间信息？', keywords: ['steady-state gain', 'time constant', 'pure delay', 'transient', 'persistent excitation'], reference: '最终稳态主要约束 K×U；tau 决定过渡速度、d 决定响应开始时间，这些瞬态信息在只看终点时已丢失。必须保留同步时间线和过渡段，并用多种激励与留出轨迹检查参数是否可分。' },
      sources,
    },
    code: {
      title: '源码精读：从 LeRobot 行程标定到 Isaac Lab 延迟/PD/摩擦参数入口', minutes: 40,
      prerequisites: '会读 Python 类、缓存、ring buffer、张量 shape 和 reset 生命周期；理解位置命令、measured position 与 joint effort 的区别。',
      connection: '基础课给出可辨识模型；本课核对真实源码中“校准文件写什么、仿真参数住哪里、延迟何时采样”。路线课再决定拟合结果怎样进入标称值和随机范围。',
      intro: '源码审计的重点不是找到同名字段，而是确认单位、身份、执行位置和生命周期。LeRobot 的 calibration JSON、Isaac Lab actuator config、solver joint property 和 episode delay buffer 属于四种不同状态；把它们合并成一个“robot calibrated=true”会失去复现能力。',
      outcomes: ['追踪 SO-101 raw tick 到归一化位置的标定链', '定位 IdealPD、effort clip 与 DelayBuffer 的执行顺序', '写出不接设备的辨识 manifest 和正反测试'],
      sections: [
        { heading: '01 LeRobot 标定文件保存的是坐标合同', body: `SO-101 指南要求复用同一 robot/teleop id；源码按 motor name 读取 calibration，并保存 id、drive_mode、homing_offset、range_min 和 range_max。set_half_turn_homings 把当前中位姿态映射到编码器半圈，record_ranges_of_motion 再扫描范围，normalize/unnormalize 负责 raw 与统一范围之间转换。

这条链可以验证 motor 名称集合、方向和范围，却没有记录 tau、摩擦或总线延迟。重新装配、换舵机或误用 calibration id 会先破坏坐标身份；即使文件匹配，机构负载和供电变化仍可能改变动力学。`, sourceIds: ['lerobotSo68', 'lerobotBus68'] },
        { heading: '02 Isaac Lab 的 PD 参数归属取决于 implicit/explicit 路径', body: `IdealPDActuator.compute 读取 desired joint position/velocity 和 feed-forward effort，按 kp、kd 形成 computed effort，再由 _clip_effort 形成 applied effort。对 implicit actuator，solver 执行 drive，数据字段中的 stiffness/damping 是 solver 属性；对 explicit actuator，增益由模型消费，solver 自身增益应为零。

因此从 robot.data.joint_stiffness 读到零，不代表 explicit actuator 没有 kp。辨识 manifest 必须记录 backend、actuator class、参数拥有者、effort limit 和控制周期；否则同一个数值写到不同入口会产生不同响应。`, formulas: [{ latex: String.raw`\tau_{computed}=k_p(q_d-q)+k_d(\dot q_d-\dot q)+\tau_{ff},\qquad \tau_{applied}=\operatorname{clip}(\tau_{computed},-\tau_{max},\tau_{max})`, explanation: 'computed effort 是模型需求，applied effort 经过能力上限；饱和会同时削弱位置项和阻尼项。' }], sourceIds: ['isaacActDoc68', 'isaacPd68'] },
        { heading: '03 DelayedPDActuator 的延迟是离散 step 状态', body: `DelayedPDActuator 使用 DelayBuffer，把 position/velocity/effort command 推入 circular buffer，再按 time_lag 取旧命令。reset 时可在 min_delay 到 max_delay 之间为环境重新采样；单位是 physics step，不是毫秒。若 physics dt 从 5 ms 改成 10 ms，同样的 3 steps 代表不同现实延迟。

真实日志中测得 58 ms，仿真 dt=20 ms 时只能先映射为约 3 steps，并保留量化误差；若实测 p50/p99 相差很大，固定 delay 不是完整模型。随机 delay 也应说明是每 episode、每 command 还是分段保持，不能把 reset 采样与每步白噪声混用。`, formulas: [{ latex: String.raw`n_d=\operatorname{round}(d/\Delta t_{phys});\qquad d=58\text{ ms},\ \Delta t_{phys}=20\text{ ms}\Rightarrow n_d=3`, explanation: '离散步延迟需要物理步长才能还原为时间；round 还带来约 2 ms 的量化误差。' }], sourceIds: ['isaacPd68', 'isaacDelay68'] },
        { heading: '04 randomize 入口决定标称值与分布如何组合', body: `events.py 的 randomize_actuator_gains 与 randomize_joint_parameters 将分布样本通过 abs/add/scale 作用到默认或当前属性，并经 joint writer 写回仿真。abs 直接取样物理值，scale 乘标称值，add 加偏移；三者对零值、单位和相关性的含义完全不同。

若系统辨识得到 kp=30±3，scale [0.9,1.1] 与 abs [27,33] 在这个标称点等价；标称值改成 40 后只有 scale 会随之变为 [36,44]。manifest 应冻结操作类型、分布、seed、采样时机和 baseline revision，避免配置看似相同却训练了不同世界。`, sourceIds: ['isaacEvent68', 'dynrand68'] },
        { heading: '05 离线 manifest 要把数据身份与验证切分写死', body: `每条辨识记录至少包含 robot/calibration id、motor names、固件/供电/负载、command/sent/measured 时间基、采样率、激励、限位和 session。拟合结果还要保存模型结构、参数单位、训练轨迹、留出轨迹、loss 与残差摘要。缺任一关键身份时，应拒绝合并，而不是补默认值。

课程夹具只验证这些静态合同，不调用 write_calibration、send_action、Isaac Lab 或机械臂端口。真实标定会写电机非易失参数并可能驱动 follower 扫范围，属于必须由用户在现场安全条件下明确授权的动作。`, sourceIds: ['lerobotBus68', 'behaviorEval68'] },
      ],
      points: ['LeRobot calibration 是坐标合同，Isaac actuator config 是动力学合同。', 'delay step 必须与 physics dt 绑定，reset 生命周期也要版本化。', 'abs/add/scale、参数拥有者和验证切分都是复现所需字段。'],
      codeTitle: 'sysid_manifest_contract.py · 标定与辨识资产合同',
      code: [
        'REQUIRED = {"robot_id","calibration_id","motor_names","sample_hz","timebase",',
        '            "excitation","fit_sessions","validation_sessions","parameters","backend"}',
        '',
        'def validate_manifest(m):',
        '    missing = REQUIRED - m.keys()',
        '    if missing: raise ValueError("missing: " + ",".join(sorted(missing)))',
        '    if not m["motor_names"] or len(m["motor_names"]) != len(set(m["motor_names"])):',
        '        raise ValueError("motor identity must be unique")',
        '    if set(m["fit_sessions"]) & set(m["validation_sessions"]):',
        '        raise ValueError("fit/validation leakage")',
        '    if m["sample_hz"] <= 0 or m["timebase"] not in {"monotonic_ns", "ptp_ns"}:',
        '        raise ValueError("invalid clock contract")',
        '    for name, spec in m["parameters"].items():',
        '        if not {"value","unit","owner","source"} <= spec.keys():',
        '            raise ValueError("incomplete parameter " + name)',
        '    return True',
        '',
        'm = {"robot_id":"so101-follower-a", "calibration_id":"cal-v3",',
        '     "motor_names":["shoulder_pan","shoulder_lift"], "sample_hz":50,',
        '     "timebase":"monotonic_ns", "excitation":"bounded_step+sine",',
        '     "fit_sessions":["s1","s2"], "validation_sessions":["s3"], "backend":"physx",',
        '     "parameters":{"delay":{"value":0.06,"unit":"s","owner":"command_path","source":"s1-s2"}}}',
        'assert validate_manifest(m)',
        'bad = dict(m); bad["validation_sessions"] = ["s2"]',
        'try:',
        '    validate_manifest(bad)',
        '    raise AssertionError("validation leakage accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['字段名对应课程合同，不是 LeRobot 或 Isaac Lab 的完整原生 schema；owner 用来阻止把 controller delay 写成 contact friction。', '正例只含两个 motor，是刻意缩小的离线 manifest；真实 SO-101 应覆盖六轴、固件、供电、负载和安全配置。', '负例让 s2 同时参与拟合和验证，必须拒绝；随机拆同一 session 的相邻帧也会泄漏，应按 session 切分。'],
      exercise: { prompt: '为六轴 SO-101 manifest 增加 firmware、supply_voltage、payload、physics_dt 和 delay_steps，并验证 delay_steps 与秒单位相符。', steps: ['明确允许的时间误差不超过半个 physics step。', '为每轴保存参数 owner。', '构造 physics_dt 改变但 delay_steps 未更新的失败样例。'], solution: '计算 abs(delay_steps*physics_dt-delay_seconds)，要求不超过 physics_dt/2；若 dt 从0.02改为0.01而仍保留3步，58 ms会被错误模拟为30 ms，应拒绝或重新量化。payload与供电应属于session条件，不能静默覆盖全局标称。' },
      quiz: { question: '为什么 explicit actuator 下 joint_stiffness=0 不能据此判断 kp 未配置？', hint: '增益由 solver 还是 actuator model 持有？', keywords: ['explicit actuator', 'implicit actuator', 'parameter ownership', 'solver gain', 'actuator model'], reference: 'explicit actuator 在模型中使用 kp/kd 计算 effort，solver 的 drive gain 会置零，因此 joint_stiffness 只反映 solver 属性。应检查 actuator class/config 与 computed/applied effort 路径；implicit actuator 才把增益交给 solver。' },
      sources,
    },
    insight: {
      title: '何时校准、何时随机化：按可辨识性、漂移和安全敏感度分工', minutes: 25,
      prerequisites: '理解系统辨识的激励/残差/留出验证，以及昨日 domain randomization 的支撑、相关结构和采样时机。',
      connection: '基础与代码课得到参数估计和合同；本课把估计转成标称仿真、随机范围和冻结身份。明日混合仿真/真机训练时，这份分工表将成为 source tag 与采样权重的前置证据。',
      intro: '“校准还是随机化”不是二选一。通常先冻结语义身份，校准安全敏感且稳定可识别的中心值，再对测量不确定度、设备差异和随时间漂移的剩余部分随机化；不可观测且会改变任务定义的量则不能靠扩大范围掩盖。',
      outcomes: ['用四象限判断参数处理方式', '把估计不确定度转换为有证据的训练分布', '设计 SO-101 低风险 shadow replay 与晋级门'],
      sections: [
        { heading: '01 先冻结身份，再讨论数值不确定性', body: `joint name、方向、单位、坐标系、action semantic、相机序号和时间基属于身份合同，应通过标定/配置固定。把 shoulder_lift 与 elbow_flex 交换后再随机化，只会训练模型适应数据错误；把绝对角与 delta action 混合，也不是鲁棒性而是标签冲突。

中心值参数如相机外参、零偏、控制周期和标称延迟，应在可观测且稳定时校准。它们若偏离会造成系统性误差，扩大随机范围只能让策略更保守，不能修复线上坐标身份。`, sourceIds: ['lerobotBus68', 'isaacDelay68'] },
        { heading: '02 用可辨识性×漂移速度形成第一张决策表', body: `高可辨识、低漂移：校准中心并保留小测量区间，如固定装配后的相机外参。高可辨识、高漂移：在线监测或分 session 校准，并按温度/负载条件随机化。低可辨识、低漂移：补更有信息的激励或采用保守先验。低可辨识、高漂移：不要声称精确物理值，应训练适应或换传感器。

可用留出轨迹 Fisher/灵敏度或候选参数间预测差异近似可辨识性；漂移来自跨日/跨负载重复测量。只有一次 session 的窄置信区间无法证明长期稳定。`, formulas: [{ latex: String.raw`I_j\approx\sum_t\left(\frac{\partial \hat q_t}{\partial\theta_j}\right)^2/\sigma^2,\qquad D_j=\operatorname{MAD}\{\hat\theta_j^{(session)}\}`, explanation: 'I_j 表示轨迹对参数 theta_j 的信息量近似，D_j 用跨 session 中位绝对偏差描述漂移；两者只在同一模型和单位下比较。' }], sourceIds: ['simopt68', 'dynrand68'] },
        { heading: '03 安全敏感度决定“先校准”的优先级', body: `即使某参数难辨识，只要对碰撞、越界或动作年龄高度敏感，就不能随意给宽分布后直接真机部署。应先降低速度/力矩、增加软件限位和 watchdog，用 shadow replay 比较 measured trajectory，再决定是否收集更多安全激励。

例如延迟从40 ms到120 ms可能让控制相位裕度明显下降；若训练只随机视觉颜色而不覆盖动作年龄，照片更丰富也不能弥补闭环不稳定。安全门应独立于平均 success：存在越界、急停或未解释的高频振荡即停止晋级。`, sourceIds: ['isaacActDoc68', 'r2s2r68'] },
        { heading: '04 把点估计扩展成“中心+不确定度+相关组”', body: `系统辨识得到的不是一个可直接复制的真值，而是受模型、噪声和激励约束的估计。可把稳定中心写入标称仿真，再用 bootstrap、跨 session 差异和设备批次形成范围；质量—惯量、延迟—队列、曝光—噪声仍应按机制成组采样。

若拟合 delay=60±10 ms，而线上 p99 达140 ms，应先区分正常模式与拥塞模式，不能只用单峰 uniform[50,140] 抹平。分段/混合分布能保留模式身份，评测也应按模式报告失败率。`, formulas: [{ latex: String.raw`p(\theta)=\sum_m w_m\,p(\theta\mid m),\qquad m\in\{\text{normal},\text{congested}\}`, explanation: '混合模式保留正常与拥塞链路的不同机制；权重 w_m 必须来自运行日志或明确的压力测试预算。' }], sourceIds: ['simopt68', 'r2s2r68'] },
        { heading: '05 双团队主线只提供不同证据层，不替代执行器测量', body: `StanfordVL 的 BEHAVIOR/OmniGibson给出任务实例、交互状态和评测协议，可用于检验参数变化是否影响长程任务；World Labs R2S2R强调真实锚点、aligned simulation、变体和策略排序。二者都不能替代本地 SO-101 的时延、摩擦与带宽测量，组织归属也必须分开。

Meta/FAIR 的 V-JEPA/JEPA-WM历史工作可在未来作为 latent rollout 或规划层，但本课参数拟合不是 JEPA 方法；AMI 当前公开的是表征预测、动作条件世界模型与可靠性方向，没有新发布时不写成已完成的系统辨识工具。SO-101 晋级仍以真实日志、授权低速闭环和配对留出任务为准。`, sourceIds: ['behaviorEval68', 'r2s2r68', 'vjepa68', 'ami68'] },
      ],
      points: ['身份字段要冻结，不能用随机化容忍 schema 错误。', '稳定可辨识中心先校准，漂移与剩余不确定性再条件随机化。', '安全敏感参数需要 shadow replay 和独立硬门，平均成功率不能覆盖风险。'],
      codeTitle: 'calibrate_or_randomize.py · 参数处理决策夹具',
      code: [
        'def decide(row):',
        '    required = {"name","identifiability","drift","safety","identity"}',
        '    if not required <= row.keys(): raise ValueError("incomplete evidence")',
        '    for key in ("identifiability","drift","safety"):',
        '        if not 0 <= row[key] <= 1: raise ValueError("scores must be normalized")',
        '    if row["identity"]: return "freeze_and_validate"',
        '    if row["safety"] >= .8 and row["identifiability"] < .5: return "guard_then_collect_more"',
        '    if row["identifiability"] >= .7 and row["drift"] <= .2: return "calibrate_center_small_range"',
        '    if row["drift"] > .2: return "condition_and_randomize"',
        '    return "improve_excitation_or_use_prior"',
        '',
        'rows = [',
        ' {"name":"joint_name", "identifiability":1, "drift":0, "safety":1, "identity":True},',
        ' {"name":"camera_extrinsic", "identifiability":.9, "drift":.1, "safety":.7, "identity":False},',
        ' {"name":"queue_delay", "identifiability":.8, "drift":.6, "safety":.9, "identity":False},',
        ' {"name":"contact_friction", "identifiability":.3, "drift":.4, "safety":.9, "identity":False},',
        ']',
        'assert [decide(r) for r in rows] == ["freeze_and_validate", "calibrate_center_small_range",',
        '                                        "condition_and_randomize", "guard_then_collect_more"]',
        'try:',
        '    decide({"name":"mystery", "identifiability":2, "drift":0, "safety":0, "identity":False})',
        '    raise AssertionError("invalid evidence accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['阈值是教学决策规则，不是行业标准；真实项目必须保存分数来源、置信区间和审批人。', 'identity 优先级最高，说明 schema/坐标错误不能被“鲁棒训练”掩盖。', 'contact friction 的示例先加安全护栏再补激励，绝不让脚本自动触发真实机器人实验。'],
      exercise: { prompt: '为相机外参、关节零偏、动作延迟、静摩擦、物体质量和光照各填一行决策证据，并指出相关采样组。', steps: ['给出可辨识性、漂移和安全敏感度的测量依据。', '选择 freeze/calibrate/randomize/collect-more。', '写出至少一个条件变量，如负载、温度或拥塞模式。'], solution: '相机外参和零偏通常先校准；动作延迟按正常/拥塞模式条件化；静摩擦先在安全低速激励下辨识，剩余按方向/负载随机；物体质量可测中心并按物体类别分布；光照按场景/曝光成组随机。任何选择都要保留留出真实轨迹复核。' },
      quiz: { question: '如果某参数跨 session 漂移很大，但每次都容易辨识，最合理的处理是什么？', hint: '一次永久校准还是条件化更新？', keywords: ['high identifiability', 'session drift', 'conditional calibration', 'domain randomization', 'monitoring'], reference: '不应把一次测量永久固化，也不应忽略可辨识信息。应按 session/温度/负载等条件重估或在线监测中心值，并把剩余跨条件差异建成有证据的条件分布；训练和评测都保存条件身份，安全敏感时另加护栏。' },
      sources,
    },
  },
};
