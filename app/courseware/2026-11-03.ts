import type { AuthoredDay } from './types';

const urdfCommit = '5c261d6d9a66c55b696ab8fa5ed08fb7d2a1b251';
const behaviorUpgrade = 'e24fdcd238517d9747537deed6b06caa787e0cef';
const behaviorRotationFix = '14bc29c66821eca9e2f7948a749397d9e7fddd13';

const sources = [
  { id: 'rosUrdf64', label: 'ROS 2 · URDF 教程', url: 'https://docs.ros.org/en/rolling/Tutorials/Intermediate/URDF/URDF-Main.html', reading: '2026-10-31 实读 link、joint、visual/collision/inertial 与 robot_state_publisher 教程入口；URDF 描述的是有名字、有父子关系和单位语义的树，不是只供渲染的网格清单。' },
  { id: 'urdfReadme64', label: 'ros/urdfdom README（固定提交）', url: `https://github.com/ros/urdfdom/blob/${urdfCommit}/README.md`, reading: '核对 URDF 1.0/1.1/1.2 的版本边界、joint type、pose 与 limit 语义；旧版本缺省值与 1.2 的严格校验不同，课程不把当前 parser 行为外推给所有导入器。' },
  { id: 'urdfJoint64', label: 'ros/urdfdom joint.cpp（固定提交）', url: `https://github.com/ros/urdfdom/blob/${urdfCommit}/urdf_parser/src/joint.cpp`, reading: '定位 parseJoint、parsePoseInternal、axis 缺省、parseJointLimits、revolute/prismatic 必需 limit 以及 URDF 1.2 上下界校验；源码事实与课程额外的树/单位审计分开标注。' },
  { id: 'ogImport64', label: 'StanfordVL · OmniGibson Custom Robot Import', url: 'https://behavior.stanford.edu/tutorials/custom_robot_import.html', reading: '2026-10-31 实读 URDF→USD、collision mesh、fixed-joint merge、RobotDefinition、默认关节姿态和静置/微动验收；导入成功不等于运动学、动力学或控制语义正确。' },
  { id: 'ogPrep64', label: 'StanfordVL · urdf_preprocessing API', url: 'https://behavior.stanford.edu/reference/utils/urdf_preprocessing.html', reading: '定位 urdf_audit、override_joint_limits、mesh 路径与 collision 代理等预处理入口；这些工具属于 StanfordVL/OmniGibson，不归 World Labs。' },
  { id: 'stanfordRot64', label: 'StanfordVL · vecs2axisangle 修复（固定提交）', url: `https://github.com/StanfordVL/BEHAVIOR-1K/commit/${behaviorRotationFix}`, reading: '核对 torch/numpy 两条实现由 raw cross×angle 改为 normalize(cross)×angle，并新增 30° 非正交回归测试；旧实现幅值为 θsinθ，90° 正例会掩盖错误。' },
  { id: 'behaviorUpgrade64', label: 'StanfordVL · Isaac Sim 6.0 升级（固定提交）', url: `https://github.com/StanfordVL/BEHAVIOR-1K/commit/${behaviorUpgrade}`, reading: '核对 OmniGibson 升级 Isaac Sim 6.0、LeRobot 接口、VisionSensor/语义映射、测试与安装合同变化；这是当前工程版本变化，不代表任务分数自动提高。' },
  { id: 'isaacArt64', label: 'Isaac Lab · Robot and articulation configuration', url: 'https://isaac-sim.github.io/IsaacLab/main/source/how-to/write_articulation_cfg.html', reading: '核对 actuator 选择、solver joint limit 与 actuator limit 的职责；velocity/effort 字段不应被当作跨后端一致的硬安全夹具。' },
  { id: 'behaviorEval64', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '核对 BDDL 目标、Q-score、隐藏实例和单次 rollout；URDF 通过 parser 只是静态门，最终仍需任务闭环与隐藏实例验证。' },
  { id: 'r2s2r64', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '核对 aligned simulation、可控物理/视角变化与 policy ranking；World Labs 资产可帮助暴露模型描述误差，但官方页面没有声称自动修复 URDF。' },
  { id: 'vjepa64', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '核对自然视频表征、少量机器人视频动作后训练与 goal-image planning 边界；Meta/FAIR 的 latent predictor 仍依赖一致的动作和坐标语义。' },
  { id: 'ami64', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '核对 AMI 当前公开的表征空间预测、动作条件世界模型、可靠性与安全方向；没有发布对应 URDF 工具，不把 Meta 代码或 Stanford 修复改署为 AMI 成果。' },
];

export const day64: AuthoredDay = {
  reviewedAt: '2026-10-31',
  revision: '逐课编写 1.0',
  deliverable: '一张“URDF 静态合同→正运动学→导入器→静置/微动→闭环任务”验收链；一个检查 link/joint 树、axis 与 limit 的原创可运行审计器；一份 SO-101 坐标、单位、版本和回退登记表。三课共 100 分钟，另留 20 分钟复盘。',
  question: {
    title: '为什么机器人能在仿真里显示出来，仍可能让所有训练和评测结论失效？',
    summary: '可渲染只证明资产被读取；坐标、关节、碰撞、单位与控制合同仍需逐层验证。',
    keywords: ['URDF', 'joint frame', 'transform tree', 'axis-angle', 'joint limit', 'contract gate'],
    reference: '导入器可以在 origin、axis、limit、惯量或 collision 错误时仍生成可看的模型。此后正运动学、控制方向、接触、相机外参、动作归一化和任务读出会共享同一系统偏差，训练甚至可能学会补偿错误而在真机失败。应冻结源 URDF 与转换版本，先审计父子树、单位、右手坐标和关节范围，再用已知姿态、零动作静置、单关节微动与碰撞检查验证，最后才进入同一 task/instance/seed 的闭环评测。',
  },
  lessons: {
    foundation: {
      title: 'URDF、关节坐标系与正运动学：先把机器人描述成同一棵树', minutes: 35,
      prerequisites: '理解齐次矩阵、弧度/米单位、旋转轴与 11 月 2 日的配对评测；会区分 proposed action 和 executed state。',
      connection: '昨天用配对闭环判断 world model 路线是否真能排序动作；今天进入 Sim2Real 单元，先审计被两条路线共同依赖的机器人几何与动作坐标。明天将继续读 OmniGibson/BEHAVIOR 环境结构。',
      intro: 'URDF 的核心不是“把 STL 拼起来”，而是声明 parent link 到 joint frame 的固定变换、joint 绕哪个局部轴运动、child link 如何继承，以及允许的状态范围。任何一处含糊都会沿 transform tree 传播，使相机、末端、碰撞体和控制器看见不同的机器人。',
      outcomes: ['解释 origin、axis、joint value 在父子变换中的先后顺序', '用二连杆数值例估算角度错误如何变成末端位置误差', '区分 parser 通过、运动学正确和安全可部署三个不同门槛'],
      sections: [
        { heading: '01 link 是刚体坐标系，joint 是带约束的父子关系', body: `URDF 的 link 可以带 visual、collision 与 inertial，但三者各自的 origin 都相对该 link frame；joint 再把 parent link 连接到 child link。joint 的 origin 描述 parent frame 到 joint frame 的固定姿态，axis 则在 joint frame 中表达。把 axis=[0,0,1] 误读成 world z，会在上游关节转动后产生完全不同的运动。

ros/urdfdom 的 parseJoint 先读取 origin，再读取 parent/child、type、axis 和 limit；缺 origin 时使用单位变换，非 floating/fixed 且缺 axis 时默认 [1,0,0]。这些缺省让文件可能顺利解析，却不证明它符合硬件。工程审计应把“使用缺省”当显式告警，并要求每个可动关节与 SO-101 标定表一一对应。`, formulas: [{ latex: String.raw`{}^{P}T_C(q)={}^PT_J\,T_{mathrm{axis}}(q)\,{}^JT_C(0)`, explanation: 'P、J、C 分别是父、关节和子坐标系；固定 origin 与沿局部 axis 的运动顺序不可交换。URDF 常把 child link frame 放在 joint frame，教学式保留最后一项以提醒网格/惯量仍可有局部偏置。' }], sourceIds: ['rosUrdf64', 'urdfJoint64'] },
        { heading: '02 transform tree 的乘法方向必须写进变量名', body: `若 T_ab 表示把 b 中坐标变到 a，则链式组合是 T_ac=T_ab T_bc；列向量右乘时，最右边的局部变换先发生。只写 T1、T2 很容易把 world-to-camera 与 camera-to-world 混用。建议接口名直接写 parent_T_child、world_T_base，并用已知基准点做往返测试。

二连杆平面臂令 l1=0.20 m、l2=0.15 m，q1=30°、q2=-20°，末端约为 (0.321,0.126) m。若 q2 的符号被反转为 +20°，末端变成约 (0.270,0.215) m，位置差约 0.103 m；渲染仍是一条合理机械臂，但抓取目标已偏离一个物体尺度。`, formulas: [{ latex: String.raw`x=l_1\cos q_1+l_2\cos(q_1+q_2),\quad y=l_1\sin q_1+l_2\sin(q_1+q_2)`, explanation: '角度使用弧度、长度使用米；数值例展示关节符号错误会沿链累积，而不是只影响单个 mesh。' }], sourceIds: ['rosUrdf64'] },
        { heading: '03 axis-angle 必须满足“方向单位化、长度等于角度”', body: `旋转向量 r=ûθ 同时编码单位轴与弧度角；若直接用两个单位向量的叉积乘 θ，叉积范数是 sinθ，得到的长度会变成 θsinθ。StanfordVL 本窗口修复的 vecs2axisangle 正是这个问题：旧测试只覆盖 90°，此时 sinθ=1，错误被巧合掩盖。

对 30°，正确旋转向量长度是 π/6≈0.524 rad，旧实现给 π/12≈0.262 rad，恰好少一半。修复先 normalize(cross) 再乘 arccos(dot)，并新增非正交回归测试。平行/反平行向量仍有轴不唯一的边界，生产实现必须声明 eps 与退化策略，不能只复制正常分支。`, formulas: [{ latex: String.raw`\hat u=\frac{a\times b}{\lVert a\times b\rVert},\quad \theta=\arccos(\operatorname{clip}(a^Tb,-1,1)),\quad r=\hat u\theta`, explanation: 'û 是单位旋转轴，r 的欧氏范数才等于旋转角；30° 用未归一化叉积会错误缩成 15°。' }], sourceIds: ['stanfordRot64'] },
        { heading: '04 joint limit 是模型合同，不等于独立安全系统', body: `urdfdom 对 revolute/prismatic 要求 limit；URDF 1.2 还拒绝 upper<lower，并校验非负 effort、velocity、acceleration、deceleration 与 jerk。旧版本的缺省和导入器转换规则可能不同，因此必须同时保存 URDF version、parser/Importer revision 和转换后的 USD 摘要。

Isaac Lab 文档进一步区分 solver joint limit 与 actuator model limit，velocity 的实际强制还依赖后端。课程中的 clamp 只能验证数据合同，不能当真实机械臂安全保证。真机还需要标定、控制器限位、急停和人工评审；本自动化只构造合成张量，不发送控制命令。`, formulas: [{ latex: String.raw`q_{soft}^{min}=q_{mid}-\alpha\frac{q_{max}-q_{min}}2,\quad q_{soft}^{max}=q_{mid}+\alpha\frac{q_{max}-q_{min}}2`, explanation: '0<α<1 可定义训练/终止用软区间，但硬件限制、solver limit 和 actuator 能力仍是不同层；α 不是通用安全常数。' }], sourceIds: ['urdfReadme64', 'urdfJoint64', 'isaacArt64'] },
      ],
      points: ['joint origin 是 parent→joint 的固定变换，axis 在 joint frame 中表达。', '变换方向、角度单位和关节符号错误会沿整条链传播。', 'parser 通过只是一道静态门，不能替代导入、物理与真机安全验收。'],
      codeTitle: 'planar_fk_contract.py · 二连杆坐标合同',
      code: [
        'import math',
        'import torch',
        '',
        'DT=torch.float64',
        'def rz(q):',
        '    c,s=math.cos(q),math.sin(q)',
        '    return torch.tensor([[c,-s,0.,0.],[s,c,0.,0.],[0.,0.,1.,0.],[0.,0.,0.,1.]],dtype=DT)',
        '',
        'def tx(length):',
        '    if length<=0: raise ValueError("link length must be positive meters")',
        '    T=torch.eye(4,dtype=DT); T[0,3]=length; return T',
        '',
        'def fk(q1,q2,l1=.20,l2=.15):',
        '    if max(abs(q1),abs(q2))>math.pi: raise ValueError("joint input must be radians in [-pi,pi]")',
        '    return rz(q1)@tx(l1)@rz(q2)@tx(l2)',
        '',
        'good=fk(math.radians(30),math.radians(-20))[:2,3]',
        'bad=fk(math.radians(30),math.radians(20))[:2,3]',
        'assert torch.allclose(good,torch.tensor([.3205,.1260],dtype=DT),atol=1e-3)',
        'assert torch.linalg.vector_norm(good-bad)>.10',
        'try:',
        '    fk(30,-20)',
        '    raise AssertionError("degrees silently accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['矩阵采用 column-vector、parent_T_child 约定；@ 的最右局部变换先作用。', '数值例只实现平面 revolute FK，不含 URDF mesh、惯量、碰撞或控制器。', '负例把 30/-20 误当弧度，必须在进入训练或评测前拒绝。'],
      exercise: { prompt: '给二连杆加入 base_T_robot 的 90° z 旋转与 0.1 m 平移，并验证 world 末端；再故意把矩阵反乘，解释误差。', steps: ['明确每个矩阵的 from/to frame。', '先算 robot_T_tip，再左乘 world_T_robot。', '用 tip→robot→world 的手算点检查。'], solution: 'world_T_tip=world_T_robot@robot_T_tip；若将 base 变换右乘，它会在 tip 局部坐标中作用，平移方向随末端旋转而变化。测试应同时检查齐次末行、旋转正交和已知点。' },
      quiz: { question: '为什么 URDF 中 joint axis=[0,0,1] 不能直接理解成世界坐标 z 轴？', hint: 'axis 属于哪个 frame？上游关节会做什么？', keywords: ['joint frame', 'local axis', 'origin', 'transform composition', 'parent link'], reference: 'axis 在 joint frame 中表达，joint frame 又由 parent→joint origin 和所有上游变换决定。上游关节运动后，该局部 z 轴在世界中的方向会改变；只有特定姿态下才可能与 world z 重合。' },
      sources,
    },
    code: {
      title: '源码精读：从 urdfdom parseJoint 到 OmniGibson 导入回归', minutes: 40,
      prerequisites: '会读 XML、树结构、异常路径和 PyTorch shape；理解静态 parser 与仿真 runtime 的职责不同。',
      connection: '基础课定义了坐标和 limit 合同；本课沿真实 parser、OmniGibson 预处理和本窗口旋转修复建立可运行审计夹具。路线课再决定哪些门失败时必须停止训练。',
      intro: '源码阅读的目标不是抄一套完整 URDF importer，而是找出“上游实际接受什么”和“项目还必须额外拒绝什么”。教学审计器使用标准库处理最小 XML，不加载外部 mesh、不启动仿真，也不冒充 urdfdom 或 Isaac Sim 的完整语义。',
      outcomes: ['定位 parseJoint 的 origin/axis/limit 分支和版本差异', '实现 link/joint、轴范数、上下界和单父节点审计', '用 30° 回归解释为何正例覆盖不足会放过几何 bug'],
      sections: [
        { heading: '01 parseJoint 的顺序就是一份输入合同', body: `固定提交的 parseJoint 先 clear，拒绝无名 joint；origin 缺失时记录并使用 identity，随后读取 parent/child、type、axis 与 limit。未知 type 直接失败；revolute/prismatic 无 limit 失败。axis 缺失则默认 x 轴，这属于规范兼容行为，不代表机器人的真实轴就是 x。

因此项目级审计要比 parser 更严格：SO-101 已知有固定关节表时，缺 origin/axis 应作为发布阻塞；parent/child 必须存在且 child 只能有一个父 joint；可动轴应有限、非零并归一化；limit 的单位、方向和标定零位要与数据 adapter 对照。`, sourceIds: ['urdfJoint64', 'urdfReadme64'] },
        { heading: '02 URDF 1.2 更严格，但版本号本身不能保证正确', body: `parseJointLimits 在 1.2 上要求 revolute/prismatic 同时给 lower/upper，拒绝 upper<lower，并允许某些缺省为 infinity；旧版本对 effort/velocity 缺失会失败，而 lower/upper 的旧缺省可能是 0。把同一文件静默改版本可能改变 parser 行为，因此 migration 要保存差异报告。

教学审计器不复刻所有版本规则，只采用本项目的保守子集：所有 revolute/prismatic 必须有 lower/upper/velocity/effort，且 upper>lower、velocity/effort>0。这个严格范围已明确标注；continuous、mimic、safety_controller、transmission、惯量与 mesh 需要交给正式工具继续验证。`, sourceIds: ['urdfJoint64', 'urdfReadme64'] },
        { heading: '03 OmniGibson 预处理解决“能导入”，runtime 测试解决“能工作”', body: `OmniGibson 的自定义机器人教程把流程拆为 URDF/mesh 清理、collision 生成、URDF→USD、RobotDefinition 注册与控制测试。urdf_audit 可发现 package URI、坏相对路径、缺惯量、mimic 与零 limit；override_joint_limits 能修复明确已知的坏值，但必须保留来源和 rename map，不能随手猜参数。

导入后还要做零动作静置与逐关节微动：静置检查漂移、穿透和错误重力；微动检查名字→action slice→实际 joint 的方向和幅度。本窗口 Isaac Sim 6.0 升级同时修改 VisionSensor、LeRobot wrapper、依赖与测试，说明后端升级会改变接口合同，旧 smoke test 不能自动继承为通过。`, sourceIds: ['ogImport64', 'ogPrep64', 'behaviorUpgrade64'] },
        { heading: '04 回归测试必须选择旧实现会失败的角度', body: `vecs2axisangle 的旧实现对 0° 和 90° 恰好看似正确：0° 两边都是零，90° 时叉积已经是单位轴。新增 30° 测试才观察到范数少一半。这是测试设计的通用原则：正例不仅要覆盖常见值，还要覆盖能区分两个实现假设的值。

对 URDF 也应选择有辨识力的 fixture：非 x 轴 joint、非零 origin、上下界非对称、两级父子旋转、刻意重复 child 和一条反向 axis。只用零姿态、对称 limit 和单 link 会让符号、顺序与单位错误彼此抵消。`, formulas: [{ latex: String.raw`\lVert (a\times b)\theta\rVert=\theta\sin\theta\ne\theta\quad(0<\theta<\pi,\ \theta\ne\pi/2)`, explanation: '该式直接给出可区分旧实现的测试域；30° 的 sinθ=0.5，使幅值错误显著。' }], sourceIds: ['stanfordRot64'] },
      ],
      points: ['真实 parser 的兼容缺省不等于项目可接受缺省。', 'URDF→USD 成功后仍需静置、单关节微动与传感器回归。', '负测试要选择能打破错误假设的非对称、非正交输入。'],
      codeTitle: 'urdf_joint_audit.py · 最小树与关节合同审计',
      code: [
        'import math',
        'import xml.etree.ElementTree as ET',
        '',
        'def vec3(text):',
        '    xs=tuple(float(x) for x in text.split())',
        '    if len(xs)!=3 or not all(math.isfinite(x) for x in xs): raise ValueError("bad vec3")',
        '    return xs',
        '',
        'def audit(xml):',
        '    root=ET.fromstring(xml)',
        '    links={x.attrib["name"] for x in root.findall("link")}',
        '    if len(links)!=len(root.findall("link")): raise ValueError("duplicate link")',
        '    children=set()',
        '    for j in root.findall("joint"):',
        '        name=j.attrib.get("name",""); kind=j.attrib.get("type","")',
        '        p=j.find("parent"); c=j.find("child")',
        '        if not name or p is None or c is None: raise ValueError("incomplete joint")',
        '        parent=p.attrib.get("link"); child=c.attrib.get("link")',
        '        if parent not in links or child not in links or child in children: raise ValueError("bad tree edge")',
        '        children.add(child)',
        '        if kind in {"revolute","prismatic"}:',
        '            axis=j.find("axis"); limit=j.find("limit")',
        '            if axis is None or limit is None: raise ValueError("explicit axis/limit required")',
        '            a=vec3(axis.attrib.get("xyz","")); n=math.sqrt(sum(x*x for x in a))',
        '            if abs(n-1)>1e-6: raise ValueError("axis must be unit length")',
        '            lo=float(limit.attrib["lower"]); hi=float(limit.attrib["upper"])',
        '            if not lo<hi or float(limit.attrib["velocity"])<=0 or float(limit.attrib["effort"])<=0:',
        '                raise ValueError("invalid limits")',
        '    if len(links-children)!=1: raise ValueError("expected exactly one root link")',
        '    return len(links),len(children)',
        '',
        'good="""<robot name="arm"><link name="base"/><link name="tip"/><joint name="j1" type="revolute"><parent link="base"/><child link="tip"/><axis xyz="0 0 1"/><limit lower="-1" upper="1" velocity="2" effort="3"/></joint></robot>"""',
        'assert audit(good)==(2,1)',
        'bad=good.replace("0 0 1","0 0 2")',
        'try:',
        '    audit(bad)',
        '    raise AssertionError("non-unit axis accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['审计器是保守教学子集，不支持 continuous/mimic/transmission/inertial/mesh，也不替代 urdfdom 或 Isaac Sim importer。', 'child 唯一和单 root 拦截多父与断裂森林；完整生产版还需显式 DFS 检查 cycle。', '正例使用 z 轴与非对称 limit，负例只改变 axis 范数，便于定位失败原因。'],
      exercise: { prompt: '为审计器加入 DFS 环检测、joint 名唯一和 origin rpy 有限性检查，并各写一个故意失败的 XML。', steps: ['建立 parent→child 邻接表。', '使用 white/gray/black 颜色发现回边。', '分别构造 cycle、重复 joint 和 NaN rpy。'], solution: '遍历所有 link，gray 节点再次被访问即存在 cycle；joint 名集合发现重复立即失败；origin 若存在就用 vec3 解析 xyz/rpy 并要求 finite。三个负例应在导入器运行前独立报错。' },
      quiz: { question: '为什么 urdfdom 对缺 axis 默认 [1,0,0]，项目审计仍可把缺 axis 设为失败？', hint: '区分格式兼容与具体机器人的证据。', keywords: ['parser compatibility', 'project contract', 'default axis', 'fail fast', 'hardware mapping'], reference: 'parser 的默认值服务格式兼容；它无法知道某个 SO-101 关节的真实轴。项目已有硬件与标定合同，缺 axis 会让错误静默进入 FK 和控制，因此可以采用更严格的 fail-fast 子集，同时明确这不是上游 parser 的通用规则。' },
      sources,
    },
    insight: {
      title: '模型描述错误如何污染数据、策略、世界模型与 Sim2Real 结论', minutes: 25,
      prerequisites: '完成 FK 数值例与 URDF 审计器，理解 Atlas/R2S2R、BEHAVIOR/OmniGibson 与 JEPA 的组织和输出边界。',
      connection: '本课把静态描述错误映射到训练和评测因果链，给 11 月 Sim2Real 实验设上线门；明天学习 OmniGibson/BEHAVIOR 环境结构时将复用这些 frame、版本和回归字段。',
      intro: '错误 URDF 最棘手之处不是立即崩溃，而是让整个系统在同一错误坐标中“自洽”：采集、标签、策略和仿真都可能配合它。只有与独立测量、真实传感器或隐藏任务对照，系统偏差才暴露。路线选择前先修共同底座，否则比较的是谁更会适应错误。',
      outcomes: ['画出模型描述错误向数据、loss、规划和闭环指标传播的路径', '用误差预算决定先修几何、动力学还是模型', '为 SO-101 建立冻结、回放、重评和回退门'],
      sections: [
        { heading: '01 同一个 frame bug 会同时改写输入和标签', body: `若相机外参来自错误 link，图像本身仍真实，但由 FK 生成的末端 pose、抓取点和 action delta 会系统偏移。策略可能在训练分布里学会抵消；一旦换成正确标定、另一套 importer 或真机 controller，补偿方向反而成为新错误。离线 L1 甚至可以更低，因为标签与输入共享偏差。

应把 robot_description_hash、converted_asset_hash、calibration_hash、joint_order、unit、action convention 写入每个 dataset/checkpoint/run。任何一项变化都触发旧日志回放和 checkpoint 重评，不允许只重训一个新模型后与旧分数比较。`, formulas: [{ latex: String.raw`\tilde y=f(x;M+\delta M),\quad \hat y_\theta=g_\theta(x;M+\delta M)`, explanation: '标签与模型输入共同依赖错误描述 M+δM 时，训练 loss 可很小；对真实 M 的外部有效性仍可能失败。' }], sourceIds: ['ogImport64', 'behaviorEval64'] },
        { heading: '02 用误差传播决定“先修描述还是换模型”', body: `小角度下，第 i 个关节轴误差 δθ_i 对末端位置的上界可粗略写成其后链长 L_i|δθ_i| 之和。若 SO-101 某两关节各有 2° 轴/零位误差，后链长分别 0.25 m 与 0.12 m，上界约 13 mm；目标间隙只有 8 mm 时，再换更大 policy 也无法证明收益来自算法。

这个一阶上界忽略方向抵消、柔性与 backlash，只用于排序排查。先用独立尺量/标定板/encoder 检查几何，再做静置和单关节微动检查动力学与控制，最后才比较 policy。模型升级不能越过已超预算的描述误差。`, formulas: [{ latex: String.raw`\lVert\delta p_{ee}\rVert\lesssim\sum_i L_i|\delta\theta_i|`, explanation: 'L_i 是关节 i 到末端的后链长度；0.25×0.0349+0.12×0.0349≈12.9 mm，只是保守一阶预算，不是实测值。' }], sourceIds: ['rosUrdf64', 'isaacArt64'] },
        { heading: '03 双团队路线都依赖正确合同，但提供的证据不同', body: `StanfordVL 的 BEHAVIOR-1K/OmniGibson 提供任务、对象状态、仿真与评测接口，可用已知关节和 BDDL 目标发现描述错误；World Labs 的 Atlas/R2S2R 提供空间重建与 aligned simulation，可用多视角/物理变体扩大压力测试。后者不会因创始人相同变成 Stanford 工具，也没有官方证据表明 Atlas 自动修复 URDF。

Meta/FAIR 的 V-JEPA 2/2.1、V-JEPA 2-AC 与 JEPA-WM 在表征空间预测和规划，动作条件同样要求 joint order、单位与 frame 稳定；AMI 当前方向强调可靠性和安全，但本日没有一手发布可替代上述工程验证。人物或品牌不能充当坐标系测试。`, sourceIds: ['ogPrep64', 'r2s2r64', 'vjepa64', 'ami64'] },
        { heading: '04 五级门让“能显示”无法跳到“可训练”', body: `建议按 static→kinematic→dynamic→sensor/control→task 五级推进。static 查树、单位、mesh 与 limit；kinematic 查已知姿态和单关节方向；dynamic 查静置、碰撞、惯量与响应；sensor/control 查 joint order、相机 frame、proposed/executed action；task 才做同 task/instance/seed 的成功率、Q-score 与安全事件。

任一低级门失败，后级结果只用于诊断，不进入模型排名。Isaac Sim 6.0 或 URDF 更新必须生成新资产身份并全链重跑；若回归失败，保留上一已验证版本，不用新模型分数掩盖。自动化不代打卡、不追溯改分、不连接机械臂，也不上传客户数据。`, formulas: [{ latex: String.raw`G=G_s\land G_k\land G_d\land G_c\land G_t`, explanation: '最终可用性是五级门的逻辑与，不是加权平均；低层合同失败不能被一次任务成功抵消。' }], sourceIds: ['behaviorUpgrade64', 'behaviorEval64', 'ogImport64'] },
      ],
      points: ['输入与标签共享 frame bug 时，低 loss 也可能是假自洽。', '先比较描述误差预算与任务容差，再决定是否值得换模型。', 'static→task 五级门必须连续通过，版本升级触发全链回归。'],
      codeTitle: 'description_release_gate.py · 误差预算与连续门',
      code: [
        'LEVELS=("static","kinematic","dynamic","sensor_control","task")',
        '',
        'def tip_error_bound(lengths,angle_errors_rad):',
        '    if len(lengths)!=len(angle_errors_rad) or any(x<0 for x in lengths):',
        '        raise ValueError("bad error budget")',
        '    return sum(L*abs(e) for L,e in zip(lengths,angle_errors_rad))',
        '',
        'def release(gates,tolerance_m,error_bound_m):',
        '    if set(gates)!=set(LEVELS): raise ValueError("all five gates required")',
        '    first_fail=next((x for x in LEVELS if not gates[x]),None)',
        '    if first_fail: return "stop:"+first_fail',
        '    if error_bound_m>tolerance_m: return "stop:error_budget"',
        '    return "eligible_for_shadow_eval"',
        '',
        'err=tip_error_bound([.25,.12],[.0349,.0349])',
        'assert .012<err<.014',
        'ok={x:True for x in LEVELS}',
        'assert release(ok,.008,err)=="stop:error_budget"',
        'bad=dict(ok); bad["kinematic"]=False',
        'assert release(bad,.02,err)=="stop:kinematic"',
        'assert release(ok,.02,err)=="eligible_for_shadow_eval"',
      ].join('\n'),
      codeNotes: ['一阶误差预算只用于排查优先级；真实误差需由标定和测量确认。', '五级键必须完整，防止调用方漏掉 task 或 sensor_control 仍获得通过。', '通过只进入 shadow evaluation，不授予真机动作权限。'],
      exercise: { prompt: '为一次 URDF→USD 版本升级设计最小回归矩阵，并说明哪些结果可复用、哪些必须重跑。', steps: ['列出资产/标定/数据/checkpoint 哈希。', '覆盖五级门各一个正例与负例。', '按共同依赖判断下游结果失效范围。'], solution: '静态 diff 后重跑已知姿态 FK、零动作静置、每关节正负微动、相机重投影和固定任务回放；转换资产变化会使所有依赖其 joint/frame/collision 的仿真分数失效。原始只读图像可保留，但由旧 FK 生成的 pose/action 标签必须重算并版本化。' },
      quiz: { question: '为什么策略在错误 URDF 下训练和离线评测都更好，仍不能说明它更适合真机？', hint: '输入、标签和评测是否共享同一错误？', keywords: ['shared bias', 'external validity', 'calibration', 're-evaluation', 'Sim2Real'], reference: '若训练输入、标签与离线评测都由同一错误 frame/limit 生成，策略可以学习补偿并在内部自洽；真实硬件或正确资产不共享该偏差。必须用独立标定、传感器/执行反馈和冻结任务闭环重评，才能判断外部有效性。' },
      sources,
    },
  },
};
