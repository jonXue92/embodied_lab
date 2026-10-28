import type { AuthoredDay } from './types';

const behaviorCommit = '7330a54518e9594d19649ddc6cd474c3fc8b90c9';
const behaviorRoot = 'https://github.com/StanfordVL/BEHAVIOR-1K/blob/' + behaviorCommit;

const sources = [
  { id: 'atlas61', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-28 实读官方发布：Atlas以多模态自回归扩散Transformer统一文本、图像、视频与3D，输入可含文本、图像、相机位姿和深度；共享空间上下文可导出新视图、深度、点云与Gaussian splats。官方页没有公开训练源码，课程不虚构函数定位。' },
  { id: 'r2s2r61', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-28 实读官方方法与实验说明：从真实场景构建对齐仿真后，可系统变化物体配置、机器人状态、视角、外观、物理参数、速度和难度，并读取接触、可见性、力和反事实；评测重点是成功/失败区域与policy排序是否跨sim/real一致。' },
  { id: 'taxonomy61', label: 'World Labs · A Taxonomy of World Models', url: 'https://www.worldlabs.ai/blog/taxonomy-of-world-models', reading: '2026-10-28 复核“生成观察”与“维护可交互世界状态”的边界：空间一致生成可以支持探索，但机器人训练还要求动作、接触、持续状态和可测评接口，不能把新视图生成自动等同于物理仿真。' },
  { id: 'visionDocs61', label: 'OmniGibson · VisionSensor API', url: 'https://behavior.stanford.edu/reference/sensors/vision_sensor.html', reading: '2026-10-28 精读VisionSensor公开接口：支持rgb、depth、depth_linear、normal、segmentation、optical_flow、bbox与camera_params；intrinsic_matrix和图像尺寸构成像素反投影的真实接口锚点。' },
  { id: 'visionSource61', label: 'OmniGibson VisionSensor源码（固定提交）', url: behaviorRoot + '/omnigibson/sensors/vision_sensor.py', reading: '2026-10-28 定位VisionSensor、all_modalities、intrinsic_matrix、get_obs和camera_params相关实现；源码说明不同深度模态与相机参数必须按语义读取，不能只凭数组形状猜单位。' },
  { id: 'behaviorEval61', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-28 复核BDDL终态、Q-score、隐藏实例、时间预算与单次rollout约束；这些任务谓词和闭环指标适合作为生成场景的外部验收门，而不是Atlas训练信号的说明。' },
  { id: 'behaviorUpdates61', label: 'StanfordVL · BEHAVIOR Challenge Updates', url: 'https://behavior.stanford.edu/challenge/updates.html', reading: '2026-10-28 核对挑战公告与时间线，最新公开更新仍为2026-10-09；课程采用当前官方评测口径，但不把旧公告冒充今日新增。' },
  { id: 'vjepa61', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/html/2506.09985v1', reading: '2026-10-28 对照动作条件latent rollout：V-JEPA 2-AC在固定相机机器人数据上预测表征并规划；它与Atlas的空间上下文生成回答不同问题，不能因都叫world model而交换证据。' },
  { id: 'jepaWm61', label: 'Meta/FAIR · JEPA-WM论文v4', url: 'https://arxiv.org/html/2512.24497v4', reading: '2026-10-28 对照闭环规划证据：JEPA-WM显式比较多步预测与planner，适合检验“生成质量不等于动作排序”；本课不把Meta/FAIR结果归到World Labs。' },
  { id: 'ami61', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-28 核对AMI当前强调表征空间预测、动作条件world model、规划和安全；本日Atlas/R2S2R属于World Labs，BEHAVIOR/OmniGibson属于Stanford Vision and Learning Lab，组织归属严格分开。' },
];

export const day61: AuthoredDay = {
  reviewedAt: '2026-10-28',
  revision: '逐课编写 1.0',
  deliverable: '一张“空间上下文→对齐场景→可控变化→policy评测→真实复核”证据链图；一个校验相机内外参、深度语义和投影往返的原创Python工具；一份面向SO-101的Real-to-Sim评测矩阵与上线门。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '会生成一致新视角的世界，何时才够资格训练和评测机器人？',
    summary: '空间外观一致只是起点；状态、接触、动作响应与policy排序需要独立验收。',
    keywords: ['Atlas', 'R2S2R', 'spatial context', 'camera calibration', 'decision equivalence', 'policy ranking'],
    reference: '首先把RGB、深度、内外参与时间戳对齐成可审计空间上下文；随后将真实场景转成可交互仿真，并逐轴变化视角、外观、物体状态和物理参数。生成世界只有在关键任务谓词可测、动作后果合理、成功/失败边界和policy排序与真实环境一致时，才能作为训练与评测引擎。World Labs的Atlas/R2S2R、StanfordVL的BEHAVIOR/OmniGibson，以及Meta/FAIR的JEPA规划分别提供空间生成、任务仿真和动作预测证据，三者不可混署或相互替代。',
  },
  lessons: {
    foundation: {
      title: 'Atlas共享空间上下文与R2S2R对齐仿真', minutes: 35,
      prerequisites: '掌握10月30日的动作条件rollout、goal cost与MPC，理解针孔相机内参、齐次变换和训练/评测分离。',
      connection: '昨天在固定观测下追问动作候选能否被latent world model正确排序；今天扩大到可生成空间和Real-to-Sim，追问场景变化能否保持机器人决策证据。下一阶段将把这套接口接到强化学习与SO-101毕业项目。',
      intro: '“世界模型”不是单一产品类型。Atlas强调共享空间上下文与多模态空间生成；R2S2R强调从真实场景构造对齐、可变化、可查询的仿真；JEPA路线则强调在表征空间预测动作后果。机器人系统可以组合它们，但必须分别写出输入合同、可观测状态、动作接口和验收指标。',
      outcomes: ['用投影方程解释图像、深度、位姿怎样形成共享空间上下文', '区分空间一致生成、可交互仿真和动作条件预测', '设计检验sim/real成功边界与policy排序的对齐实验'],
      sections: [
        { heading: '01 共享空间上下文先解决“这些观测属于同一个哪里”', body: `Atlas官方描述的输入不只是一句文字：图像提供外观与局部几何，深度提供沿像素射线的尺度，相机位姿把不同视角放进共同坐标系，文本补充不可直接测量的语义约束。模型以共享空间上下文生成视频、3D或新视角，因此同一物体跨视角的身份、遮挡和几何关系比单帧美观更重要。

针孔模型把相机坐标点(X,Y,Z)投影为u=f_xX/Z+c_x、v=f_yY/Z+c_y；反投影则需知道深度到底是沿光轴Z还是沿射线的距离。若把ray depth误当Z，画面中心可能近似正确，边缘点却系统偏移。共享上下文的第一道门不是主观画质，而是固定内外参下的投影往返误差。`, formulas: [{ latex: String.raw`\begin{bmatrix}u\\v\\1\end{bmatrix}\sim K\begin{bmatrix}X/Z\\Y/Z\\1\end{bmatrix},\qquad p_w=T_{wc}\,dK^{-1}\tilde p`, explanation: 'K是相机内参，T_wc把相机坐标点变换到世界坐标；该反投影式假设d是光轴深度。若传感器给ray depth，必须先转换语义。' }], sourceIds: ['atlas61', 'visionDocs61', 'visionSource61'] },
        { heading: '02 空间生成不自动拥有机器人可交互状态', body: `新视角生成能检验外观与几何一致性，却未必暴露关节约束、接触、摩擦、力、可抓取性和对象持续状态。World Labs的taxonomy把生成观察与维护世界状态区分开来；R2S2R进一步要求场景可被机器人动作改变，并能读取对象状态、接触、可见性、力和反事实结果。

因此“Atlas生成了一个厨房”不能直接推出“这个厨房可以训练抓取”。工程上至少要有状态映射g:真实场景→仿真状态、动作适配h:控制命令→仿真执行，以及任务读出q:状态→成功谓词。任何一项缺失都只能称空间资产或视觉生成结果，不能声称已建立闭环机器人benchmark。`, formulas: [{ latex: String.raw`\hat s_0=g(o^{real}_{1:n}),\quad \hat s_{t+1}=F_{sim}(\hat s_t,h(a_t)),\quad \hat y_t=q(\hat s_t)`, explanation: 'g构建初始仿真状态，F_sim执行动作，q读取任务指标；三者共同构成可交互评测接口。' }], sourceIds: ['taxonomy61', 'r2s2r61', 'behaviorEval61'] },
        { heading: '03 Real-to-Sim的价值在于可控变化，而非复制一张静态照片', body: `R2S2R从真实环境建立对齐仿真后，系统地改变物体配置、机器人初态、相机视角、外观、物理参数、速度与难度。这些轴将一个昂贵真实场景扩展成可重复实验族：同一policy在轻微遮挡、摩擦变化或目标位置变化下怎样退化，可以被逐项测量，而不是靠一次成功视频下结论。

变化必须保留可追溯基准。比如先锁定真实标定场景S0，再生成只改变相机偏航的S_cam、只改变摩擦的S_mu和组合变化S_mix；如果每个变体同时随机化所有因素，失败就无法归因。课程采用单轴、双轴、压力组合三级矩阵，并保留seed、资产版本、物理参数和相机manifest。`, formulas: [{ latex: String.raw`\Delta_i(\pi)=J(\pi,S_i)-J(\pi,S_0),\qquad \Delta_{ij}^{int}=\Delta_{ij}-\Delta_i-\Delta_j`, explanation: 'Delta_i衡量单一变化轴的性能影响；交互项显示两种变化组合是否带来非加性退化。' }], sourceIds: ['r2s2r61'] },
        { heading: '04 对齐验收看决策等价，不只看像素相似', body: `评测引擎最危险的失败是“所有policy都在sim里显得更好”，或真实环境的A优于B而仿真排序相反。R2S2R官方强调成功/失败区域和policy排名；BEHAVIOR以BDDL终态、Q-score、隐藏实例和单次rollout提供另一套外部任务约束。两条线组织不同，但都提醒我们把任务结果置于生成美学之前。

李飞飞研究主线在本日明确分支：BEHAVIOR-1K/OmniGibson归Stanford Vision and Learning Lab，Atlas/R2S2R归World Labs。LeCun谱系的V-JEPA 2与JEPA-WM归Meta/FAIR历史成果，AMI只记录其当前研究方向。组织边界不是脚注：它决定源码、实验和主张究竟能支持哪一层结论。`, formulas: [{ latex: String.raw`\rho=\operatorname{Spearman}(J_{sim}(\pi_{1:m}),J_{real}(\pi_{1:m})),\qquad e_b=\frac1N\sum_n\mathbf1[\hat y_n\ne y_n]`, explanation: 'rho检验policy排序一致性；e_b检验成功/失败边界错配。高视觉相似度不能替代这两项。' }], sourceIds: ['r2s2r61', 'behaviorEval61', 'vjepa61', 'jepaWm61', 'ami61'] },
      ],
      points: ['共享空间上下文的最低合同是RGB/深度/内参/外参/时间戳语义一致。', '生成新视角、维护可交互状态、预测动作后果是三类证据。', 'Real-to-Sim要用真实成功边界和policy排序验收。'],
      codeTitle: 'projection_contract.py · 深度语义与投影往返',
      code: [
        'import numpy as np',
        '',
        'def backproject(u,v,depth,K,T_wc):',
        '    if depth<=0: raise ValueError("depth must be positive z-depth")',
        '    if K.shape!=(3,3) or T_wc.shape!=(4,4): raise ValueError("bad calibration shape")',
        '    ray=np.linalg.solve(K,np.array([u,v,1.0]))',
        '    p_c=np.r_[ray*depth,1.0]',
        '    return (T_wc@p_c)[:3]',
        '',
        'def project(p_w,K,T_wc):',
        '    p_c=np.linalg.inv(T_wc)@np.r_[p_w,1.0]',
        '    if p_c[2]<=0: raise ValueError("point behind camera")',
        '    uvw=K@p_c[:3]',
        '    return uvw[:2]/uvw[2]',
        '',
        'K=np.array([[400.,0,320.],[0,400.,240.],[0,0,1.]])',
        'T=np.eye(4); p=backproject(420,290,2.0,K,T)',
        'assert np.allclose(p,[.5,.25,2.])',
        'assert np.allclose(project(p,K,T),[420,290])',
        'try:',
        '    backproject(0,0,-1,K,T)',
        '    raise AssertionError("negative depth accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['np.linalg.solve保留K的真实数值合同；不要把fx、fy和主点硬编码成经验常数。', 'backproject明确只接受光轴z-depth，调用方若拿到ray depth必须先转换。', '正例检查已知三维点和像素往返；负例拒绝非正深度，避免点落到相机后方。'],
      exercise: { prompt: '扩展函数支持一批像素，并给每个点附frame_id、timestamp和depth_semantics；若批内元数据不一致必须拒绝。', steps: ['验证像素、深度和元数据数组第一维相同。', '要求frame_id唯一且时间差在阈值内。', '加入ray depth、奇异K和相机后方点负例。'], solution: '先验证所有数组第一维一致，再验证frame_id唯一、时间差在阈值内、depth_semantics等于z；使用齐次矩阵批量变换。负测试包含混入ray depth、4×4内参、奇异K和相机后方点，任一项失败都不产生部分点云。' },
      quiz: { question: '为什么把ray depth直接代入dK^{-1}像素，在图像边缘会产生系统几何误差？', hint: '光轴深度和射线长度不是同一个分量。', keywords: ['ray depth', 'z-depth', 'intrinsics', 'backprojection', 'edge pixel'], reference: 'K逆变换得到的射线通常令z分量为1，乘数应是光轴z-depth；ray depth是三维射线长度，边缘射线范数大于1。直接相乘会把点沿射线推远，且离主点越远误差越大，必须先按射线方向换算。' },
      sources,
    },
    code: {
      title: '空间上下文manifest：从OmniGibson真实接口到可审计资产', minutes: 40,
      prerequisites: '会读Python类属性与张量shape，理解RGB、depth、camera_params和坐标变换不是可互换数组。',
      connection: '基础课建立了空间/决策验收标准；本课落到VisionSensor真实函数和一个不依赖私有Atlas实现的原创适配层。洞察课将用这些manifest构造SO-101训练与评测门。',
      intro: 'Atlas官方没有公开训练源码，本课不会编造Atlas函数。真实源码精读锚点选用StanfordVL/OmniGibson的VisionSensor：它公开模态枚举、intrinsic_matrix与get_obs。原创代码只负责把这些输出包装成明确合同，且标明不模拟接触物理。',
      outcomes: ['定位VisionSensor的模态和内参接口', '实现严格校验的spatial context manifest', '以正负测试拦截深度语义、坐标系和时间同步错误'],
      sections: [
        { heading: '01 从all_modalities读语义，不从shape猜语义', body: `VisionSensor源码在all_modalities中列出rgb、depth、depth_linear、normal、seg_*、optical_flow、bbox_*和camera_params。即使depth与depth_linear都可能呈H×W数组，它们的几何定义也不同；segmentation即使也是整数图，也不能当距离。适配器应按请求模态名分派，而不是看到二维数组就执行反投影。

源码定位的目的不是复制整个传感器，而是确认边界：get_obs产出观测字典，intrinsic_matrix给K，相机参数承载投影信息。课程代码把frame_id、timestamp、pose convention和depth semantics补齐，形成可归档manifest。Atlas的输入概念由官方发布支持，OmniGibson的函数位置只支持接口实现，二者不互相冒充源码。`, sourceIds: ['visionDocs61', 'visionSource61', 'atlas61'] },
        { heading: '02 manifest必须把矩阵方向和单位写成人能审计的句子', body: `一个4×4矩阵可能是T_wc也可能是T_cw；一个平移值0.3可能是米也可能是归一化单位。仅存数组会把错误推迟到训练阶段。manifest至少包括frame_id、parent_frame、timestamp_ns、K、T_wc、translation_unit、depth_semantics、image_size和source revision，并在加载时检查最后一行[0,0,0,1]及旋转正交性。

时间也属于几何：机械臂运动时，RGB在t、depth在t+80ms、位姿在t+160ms的组合并不对应任何真实瞬间。对SO-101低速采集可以先设可解释阈值，例如20ms；阈值需由运动速度与允许像素误差反推，不能把示例常数当通用真理。`, formulas: [{ latex: String.raw`\lVert R^TR-I\rVert_F<\epsilon_R,\quad \det(R)>0,\quad |t_{rgb}-t_{pose}|<\epsilon_t`, explanation: '前两项验证刚体旋转，最后一项验证时间同步；epsilon_R和epsilon_t应写入数据版本。' }], sourceIds: ['visionSource61'] },
        { heading: '03 可见性、遮挡和越界必须与几何点分开返回', body: `投影一个世界点后，u、v在图像范围内只是“落在成像平面”，不代表真实可见。还要检查Z>0，并将预测深度与观测z-buffer比较；差值超过容差通常表示被更近物体遮挡。将不可见点悄悄裁到边界会制造假的监督信号，尤其会误导抓取点和接触标注。

接口应返回uv、in_front、in_frame、not_occluded四个字段，让上层明确选择。训练可将遮挡点作为unknown，评测可单独统计可见子集和全量子集。World Labs R2S2R强调可见性和反事实读出，正说明“看不见”本身是状态，而不是缺失值清洗掉即可。`, formulas: [{ latex: String.raw`m_{vis}=\mathbf1[Z>0]\mathbf1[0\le u<W,0\le v<H]\mathbf1[|D(u,v)-Z|<\tau_z]`, explanation: '可见掩码依次检查相机前方、图像范围和z-buffer一致；tau_z需考虑传感器噪声。' }], sourceIds: ['r2s2r61', 'visionDocs61'] },
        { heading: '04 正负测试要对应真实事故，不只追求代码覆盖率', body: `正例包括中心点、带平移外参的往返、同一场景多视角重投影；负例包括ray depth冒充z-depth、T_cw冒充T_wc、奇异K、左手坐标旋转、时间戳超限和点在相机后方。每个负例都应在进入训练集前失败，并打印可定位字段，而不是在模型loss出现NaN后才排查。

这段教学代码只校验空间上下文，不声称生成Atlas场景，也不执行机械臂。真实SO-101数据仍应留在授权本地目录，示例用合成矩阵。若未来接入客户数据，要先获授权、做去标识与访问控制；本次课程和测试均不上传任何学习者或客户资产。`, sourceIds: ['visionSource61', 'r2s2r61'] },
      ],
      points: ['真实函数锚点是VisionSensor/get_obs/intrinsic_matrix，不虚构Atlas源码。', 'manifest必须声明矩阵方向、单位、时间和深度语义。', '遮挡、越界和相机后方是不同状态，应分别返回。'],
      codeTitle: 'spatial_manifest.py · 相机上下文合同',
      code: [
        'from dataclasses import dataclass',
        'import numpy as np',
        '',
        '@dataclass(frozen=True)',
        'class SpatialFrame:',
        '    frame_id: str; timestamp_ns: int; K: np.ndarray; T_wc: np.ndarray',
        '    depth_semantics: str="z"; translation_unit: str="m"',
        '',
        'def validate(f):',
        '    if not f.frame_id: raise ValueError("empty frame_id")',
        '    if f.K.shape!=(3,3) or f.T_wc.shape!=(4,4): raise ValueError("bad matrix shape")',
        '    if f.depth_semantics!="z": raise ValueError("convert ray depth before use")',
        '    if f.translation_unit!="m": raise ValueError("translation must be meters")',
        '    if not np.allclose(f.T_wc[3],[0,0,0,1]): raise ValueError("bad homogeneous row")',
        '    R=f.T_wc[:3,:3]',
        '    if not np.allclose(R.T@R,np.eye(3),atol=1e-6) or np.linalg.det(R)<=0:',
        '        raise ValueError("invalid right-handed rotation")',
        '    if abs(np.linalg.det(f.K))<1e-9: raise ValueError("singular intrinsics")',
        '    return f',
        '',
        'ok=SpatialFrame("cam0",123,np.diag([400.,400.,1.]),np.eye(4))',
        'assert validate(ok) is ok',
        'try:',
        '    validate(SpatialFrame("cam0",123,ok.K,ok.T_wc,"ray"))',
        '    raise AssertionError("ray depth accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['dataclass冻结元数据，减少下游悄悄修改标定的风险。', 'validate同时检查shape、语义、单位、齐次行、旋转和内参可逆性。', '测试使用合成矩阵，不访问相机、不控制机械臂，也不上传数据。'],
      exercise: { prompt: '增加project_visible函数：输入世界点、图像尺寸、观测深度和容差，返回uv以及in_front/in_frame/not_occluded。', steps: ['先由T_wc求逆并变换到相机坐标。', '分别检查Z、像素范围和z-buffer。', '构造相机后方、越界和遮挡三个独立负例。'], solution: '先用T_cw=inv(T_wc)变换到相机坐标；Z<=0立即标in_front=false。只对in-frame像素采样深度，以abs(D-Z)<tau判遮挡。不要把越界坐标clip后再比较，否则会把图外点伪装成边界可见点。' },
      quiz: { question: '为什么空间manifest必须同时保存T_wc方向、平移单位和时间戳，而不能只存一个4×4数组？', hint: '同shape矩阵可能表达相反变换，数值单位和采样时刻也可能不同。', keywords: ['T_wc', 'convention', 'unit', 'timestamp', 'manifest'], reference: '4×4 shape无法说明矩阵是相机到世界还是世界到相机，平移0.3也无法说明米或归一化单位；运动场景中不同时间的位姿更不对应同一图像。显式字段和加载校验才能在训练前拒绝语义错误。' },
      sources,
    },
    insight: {
      title: '从生成世界到SO-101训练与评测引擎：四道上线门', minutes: 25,
      prerequisites: '完成前两课的空间manifest、R2S2R变化轴和policy排序指标。',
      connection: '本课把Atlas/R2S2R能力翻译为可落地的数据、训练、评测和安全门，并为后续强化学习与毕业项目保留可复现资产。',
      intro: '生成世界的商业价值不在“无限场景”这句口号，而在低成本地产生可归因变化，并证明这些变化对真实机器人决策有预测力。SO-101项目应从小场景、少policy和明确终态开始，用四道门逐级放行。',
      outcomes: ['建立空间、交互、决策、真实复核四级gate', '用排序与边界误差决定仿真是否可用于选模', '给出失败时回退到数据采集或标定的路径'],
      sections: [
        { heading: '01 Gate A：空间资产必须可重建、可版本化', body: `第一道门只回答资产是否可信：RGB/深度/位姿时间同步，投影往返误差低于阈值，关键尺寸与真实测量相符，资产、标定和生成器版本可追溯。Atlas类空间模型可减少人工建模，但模型生成区域与真实观测区域要分层标注，不能把补全内容当测量真值。

SO-101可从桌面抓取小场景开始，保留三张标定视图、尺规测量和一个未参与重建的验证视角。若验证视角误差失败，回退到重新标定或补采集，不进入policy训练。`, sourceIds: ['atlas61', 'visionDocs61'] },
        { heading: '02 Gate B：交互状态必须覆盖任务需要的物理量', body: `第二道门检查关节、物体位姿、接触、抓持、摩擦与任务谓词是否有定义。不是所有物理量都要完美模拟，但遗漏项必须与任务无关。例如只评测“到达目标位姿”可暂不模拟软体变形；评测插接则不能忽略接触和顺应性。

用BEHAVIOR式终态谓词把“成功”写成机器可判表达式，并给每个谓词准备正负状态。若仿真可达成功而真实机械约束根本不可达，说明状态或动作映射错误，而不是policy需要更多训练。`, sourceIds: ['r2s2r61', 'behaviorEval61'] },
        { heading: '03 Gate C：sim必须保住policy排序和失败边界', body: `第三道门选择至少三种强弱不同且训练过程独立的policy，在成对sim/real条件上测成功率、Q-score和失败类型。只有Spearman排序高、成功边界错配低，并且差异置信区间可接受，才允许用sim做大规模选模。单一policy的sim成功率与real接近，可能只是误差相互抵消。

数值例：真实成功率A/B/C为0.8/0.6/0.3，仿真为0.9/0.7/0.4，排序一致；若仿真变成0.6/0.85/0.4，即使均值差不大，也会错误选择B。排序门失败时，应定位变化轴和失败簇，不应继续扩大合成数据量。`, formulas: [{ latex: String.raw`G_C=\mathbf1[\rho\ge\rho_{min}]\,\mathbf1[e_b\le e_{max}]\,\mathbf1[|J_{sim}-J_{real}|\le\delta_J]`, explanation: '只有排序、边界和绝对性能差同时过门，仿真才用于选模；阈值需由项目风险确定。' }], sourceIds: ['r2s2r61', 'behaviorEval61'] },
        { heading: '04 Gate D：真实小流量复核与安全回退', body: `最后一道门始终在授权真实设备上小流量复核：低速、限幅、明确急停、先空载再接触，并记录仿真未覆盖的失败。课程只设计评测，不替学习者执行机械臂控制。若真实失败簇集中在相机漂移，回退Gate A；集中在接触，回退Gate B；排序反转，回退Gate C并停止用仿真选模。

双团队主线在此汇合但不混署：World Labs提供空间生成与R2S2R框架，StanfordVL提供家庭任务/OmniGibson评测基础，Meta/FAIR JEPA工作提供动作条件表征规划的历史证据，AMI当前方向只作为未来追踪。新热点先进入延伸阅读，除非本地重点JD或三份独立岗位/面经共同支持，不改课程总纲。`, sourceIds: ['r2s2r61', 'behaviorEval61', 'jepaWm61', 'ami61'] },
      ],
      points: ['空间、交互、决策、真实复核四道门逐级放行。', '排序反转比均值小偏差更危险，因为它会让选模结论反向。', '失败应回退到对应数据/标定/物理层，而不是盲目加合成量。'],
      codeTitle: 'ranking_gate.py · policy排序验收',
      code: [
        'import numpy as np',
        '',
        'def ranks(x):',
        '    order=np.argsort(x); r=np.empty_like(order,dtype=float)',
        '    r[order]=np.arange(len(x),dtype=float)',
        '    return r',
        '',
        'def gate(sim,real,min_rho=.8,max_gap=.2):',
        '    sim=np.asarray(sim,float); real=np.asarray(real,float)',
        '    if sim.shape!=real.shape or sim.size<3: raise ValueError("need >=3 paired policies")',
        '    rho=float(np.corrcoef(ranks(sim),ranks(real))[0,1])',
        '    gap=float(np.max(np.abs(sim-real)))',
        '    return rho>=min_rho and gap<=max_gap,rho,gap',
        '',
        'ok,rho,gap=gate([.9,.7,.4],[.8,.6,.3])',
        'assert ok and rho==1.0',
        'bad,_,_=gate([.6,.85,.4],[.8,.6,.3])',
        'assert not bad',
      ].join('\n'),
      codeNotes: ['ranks将绝对成功率转换为policy顺序，示例无并列值；正式版应处理ties。', 'gate同时限制排序相关和单policy最大sim-real差。', '负例刻意让A/B反转，即使总体数值看似接近也拒绝。'],
      exercise: { prompt: '设计一个3个policy×4个变化轴×2个环境的最小实验表，并写清何时回退Gate A/B/C。', steps: ['列出policy、变化轴、seed与环境字段。', '同时记录成功率和失败类型。', '将每种失败映射到空间、交互或决策门。'], solution: '每行包含policy_id、axis、seed、sim_success、real_success、failure_type和asset_revision。几何/相机误差集中回退A；接触或不可达状态回退B；排序反转或边界错配回退C。任何安全异常立即停止真实复核。' },
      quiz: { question: '为什么三个policy的sim平均成功率接近real，仍不能直接用sim做模型选择？', hint: '平均误差可能抵消，但排序决定选谁。', keywords: ['policy ranking', 'Spearman', 'sim-real gap', 'model selection', 'decision equivalence'], reference: '某些policy可在sim被高估、另一些被低估，使总体均值误差抵消；若A/B排序反转，sim会直接选错模型。必须同时检查逐policy差、成功边界和排序相关，并以真实配对实验确认决策等价。' },
      sources,
    },
  },
};
