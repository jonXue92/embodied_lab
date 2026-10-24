import type { AuthoredDay } from './types';

const grootCommit = 'dac54b313160c201c450f97df0fd74ebd379c892';
const grootRoot = 'https://github.com/NVIDIA/Isaac-GR00T/blob/' + grootCommit;

const sources = [
  { id: 'oxePaper55', label: 'Open X-Embodiment / RT-X 论文', url: 'https://arxiv.org/abs/2310.08864', reading: '2026-10-22 实读数据标准化、跨机器人训练与正负迁移结论：统一格式不等于统一物理动作；RT-X实验只支持论文列出的本体、任务和协议。' },
  { id: 'oxeRepo55', label: 'Open X-Embodiment 官方仓库', url: 'https://github.com/google-deepmind/open_x_embodiment', reading: '2026-10-22 实读RLDS episode、RT-1-X观测与动作说明：输入是工作区RGB与任务文本，动作含xyz、roll/pitch/yaw和夹爪，但每维仍可能是绝对量、增量或速度，必须由数据集契约消歧。' },
  { id: 'octoPaper55', label: 'Octo论文', url: 'https://arxiv.org/abs/2405.12213', reading: '2026-10-22 实读架构、跨本体预训练与微调章节：共享Transformer从多数据集学习表示，新观测与新动作空间仍通过目标数据和新模块适配；不能把预训练写成任意机器人零样本控制保证。' },
  { id: 'octoProject55', label: 'Octo官方项目页', url: 'https://octo-models.github.io/', reading: '2026-10-22 核对25个Open X数据集、800K episode、语言/目标图条件以及新传感器、新动作空间和双臂微调评测；数值只属于项目列出的评测设置。' },
  { id: 'octoFinetune55', label: 'Octo新观测/动作微调示例（main，按日核验）', url: 'https://github.com/octo-models/octo/blob/main/examples/02_finetune_new_observation_action.py', reading: '2026-10-22 逐段实读：示例删除wrist tokenizer、增加proprio tokenizer，以14维L1ActionHead替换旧head，再用merge_params复用形状兼容的预训练参数；新head保持随机初始化。main会变化，课程只描述当日读到的调用链。' },
  { id: 'octoModel55', label: 'OctoModel.sample_actions（main，按日核验）', url: 'https://github.com/octo-models/octo/blob/main/octo/model/octo_model.py', reading: '2026-10-22 精读sample_actions：unnormalization_statistics既决定embodiment_action_dim，也按mean/std或p01/p99反归一化并裁切动作维；缺少目标本体统计时，归一化输出不能直接当物理命令。' },
  { id: 'grootProcessor55', label: 'GR00T N1.7 processor（固定提交）', url: grootRoot + '/gr00t/model/gr00t_n1d7/processing_gr00t_n1d7.py', reading: '2026-10-22 复核tag到projector index映射、embodiment_id写入batch、state/action padding与mask、统计反归一化；processor负责身份路由，不从shape猜机器人。' },
  { id: 'grootModel55', label: 'GR00T N1.7 action head（固定提交）', url: grootRoot + '/gr00t/model/gr00t_n1d7/gr00t_n1d7.py', reading: '2026-10-22 逐行实读Gr00tN1d7ActionHead：state encoder、action encoder和decoder接收embodiment_id，DiT与视觉语言backbone共享；flow loss按action_mask求和并以有效元素数归一。' },
  { id: 'grootAdapter55', label: 'GR00T本体条件MLP（固定提交）', url: grootRoot + '/gr00t/model/modules/embodiment_conditioned_mlp.py', reading: '2026-10-22 精读CategorySpecificLinear.forward与MultiEmbodimentActionEncoder：参数以[num_categories,input_dim,hidden_dim]保存，按cat_ids选权重后bmm；这是本体条件投影，不是运动学求解器。' },
  { id: 'behavior55', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-22 复核BDDL目标、公开/隐藏实例、Q-score和超时规则；用于构造跨本体同任务评测，但不规定SO-101动作adapter。' },
  { id: 'r2s2r55', label: 'World Labs · R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-22 实读其同一仿真系统服务不同机器人、传感器与策略的主张，以及仿真排序需用真机闭环验证的边界；属于World Labs空间仿真线。' },
  { id: 'vjepa55', label: 'Meta/FAIR · V-JEPA 2官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-22 复核冻结视频表征、动作条件预测和目标图规划；可作共享视觉表示对照，不提供GR00T或SO-101动作投影。' },
  { id: 'ami55', label: 'AMI Labs官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-22 复核当前方向为表征空间预测、动作条件世界模型、可靠性与安全；方向声明不等于已发布跨本体adapter或可用checkpoint。' },
];

export const day55: AuthoredDay = {
  reviewedAt: '2026-10-22',
  revision: '逐课编写 1.0',
  deliverable: '一张“共享视觉语言表示—本体专属状态/动作投影—物理执行”边界图；一个复刻GR00T按embodiment选择参数并正确mask loss的PyTorch夹具；一份SO-101从单本体head到跨本体共享的证据阶梯。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '两个机器人看到同一画面并执行“向右移动2厘米”，为什么仍不能共享同一组关节动作输出？',
    summary: '区分可共享任务语义、任务空间目标与本体专属逆映射。',
    keywords: ['shared representation', 'embodiment adapter', 'Jacobian', 'action semantics', 'projector', 'group evaluation'],
    reference: '视觉语言表示可以共享“目标物在右侧”和任务阶段，任务空间也可共享向右2厘米的位移目标；但不同连杆长度、关节顺序、坐标系、控制模式、夹爪与限幅会让同一末端目标对应不同关节动作。应保留本体ID、统计、state/action encoder与decoder或显式运动学adapter，并按本体分组验证。相同shape、归一化范围或共享backbone都不能证明物理动作可互换。',
  },
  lessons: {
    foundation: {
      title: '跨本体表示的边界：共享“做什么”，隔离“身体怎样做”',
      minutes: 35,
      prerequisites: '理解10-21的数据目录—配置—tag绑定、10-24的模态身份，以及关节空间、末端任务空间和动作归一化。',
      connection: '昨天把depth身份落实到传感器、teacher和checkpoint；今天继续把robot identity落实到状态与动作通道。明天将用四模型统一横评检查哪些跨本体主张有闭环证据。',
      intro: '跨本体学习不是把不同长度的动作向量补零后送进同一网络。真正可共享的是视觉物体、语言意图、接触阶段和部分任务空间几何；最需要隔离的是关节顺序、单位、坐标、控制器、夹爪语义与动力学。adapter的工作，是在共享表示与具体身体之间建立带身份、可逆性和评测约束的桥。',
      outcomes: ['画出共享表示与本体专属投影的分界', '用二维机械臂数值例证明同一末端速度对应不同关节速度', '区分统一数据格式、统一任务空间和统一低层动作三种主张'],
      sections: [
        { heading: '01 先分三层：任务语义、任务空间和执行空间', body: `语言“把杯子放进盒子”与视觉中的杯子、盒子、遮挡关系可以跨机器人共享；末端向右移动2厘米、保持夹爪朝向属于任务空间目标，也可能跨单臂共享；真正发给控制器的关节位置、速度、力矩或夹爪脉冲属于执行空间，通常必须本体专属。把三层压成一个action向量，会把可迁移知识和硬件接口同时混乱。

Open X-Embodiment把episode统一为RLDS并给RT-1-X定义公共动作字段，但官方说明同一维仍可能表示absolute、delta或velocity。格式统一解决“能批处理”，不自动解决参考系、单位和控制周期。Octo进一步让共享Transformer吸收多数据集经验，但对新双臂14维动作仍替换action head并微调，而不是让旧7维head零样本长出新身体。`, sourceIds: ['oxePaper55', 'oxeRepo55', 'octoPaper55', 'octoFinetune55'] },
        { heading: '02 同一末端速度会被不同Jacobian翻译成不同关节速度', body: `二维两连杆机械臂的末端速度满足v=J_e(q)·qdot，其中e标记本体。取q1=0、q2=π/2，Jacobian化为[[-l2,-l2],[l1,0]]。要求末端速度v=(0.02,0.01)米/秒，A臂l1=0.25、l2=0.20米时qdot=(0.04,-0.14)弧度/秒；B臂l1=0.40、l2=0.10米时qdot=(0.025,-0.225)弧度/秒。

两台机器人共享的是“向右并略向上”的任务空间速度，不是关节命令。若再改变关节零位、轴方向或控制频率，差异更大；接近奇异位形时还需要阻尼伪逆、限幅和安全回退。学习型adapter可以近似这条映射，但训练数据必须携带本体ID与物理契约，不能让网络从动作shape暗猜。`, formulas: [{ latex: String.raw`v=J_e(q)\dot q,\quad J_e=\begin{bmatrix}-l_1\sin q_1-l_2\sin(q_1+q_2)&-l_2\sin(q_1+q_2)\\l_1\cos q_1+l_2\cos(q_1+q_2)&l_2\cos(q_1+q_2)\end{bmatrix}`, explanation: 'e决定连杆与关节定义。数值例中同一v让A、B得到不同qdot，证明共享任务目标不等于共享低层动作。' }], sourceIds: ['oxeRepo55', 'grootAdapter55'] },
        { heading: '03 一种稳健架构是共享主干、按本体选择输入输出投影', body: `可把视觉与语言先编码为共享h=fθ(images,text)，把状态和噪声动作经本体专属E_e投到公共宽度，再让共享策略核心Fθ处理，最后用D_e解码到本体动作：vhat_e=D_e(Fθ(h,E_e(state,a_t,t)))。共享主干学习任务与交互规律，E_e/D_e负责数值和执行语义；两者不是“完全隔离”，而是有意设置的信息瓶颈。

GR00T固定源码正采用这种边界：视觉语言backbone和DiT共享，state encoder、MultiEmbodimentActionEncoder与action decoder按embodiment_id选择参数。processor先把tag映射为projector index并产生mask。这里的category-specific MLP是学习投影，不包含机械臂正逆运动学或安全控制器；即使loss下降，也还要反归一化、限幅、回放与闭环验证。`, formulas: [{ latex: String.raw`h=f_\theta(o,\ell),\quad z_e=E_e(s,a_t,t),\quad \hat v_e=D_e(F_\theta(h,z_e,t))`, explanation: 'θ表示共享参数，Ee/De是本体专属投影，vhat是flow velocity而非直接硬件指令；e不能由shape隐式推断。' }], sourceIds: ['grootProcessor55', 'grootModel55', 'grootAdapter55'] },
        { heading: '04 表征共享要用probe与闭环分开验，不靠可视化相似', body: `共享表示可先用冻结probe检查物体、相对位姿、接触阶段或目标进度是否跨本体可线性读出，再检查本体ID是否不必要地支配语义特征。但“机器人身份不可预测”也不是目标：相机高度、夹爪外形和可达域确实影响行动。需要的是任务相关信息可迁移、物理差异在adapter可见，而不是强迫所有特征完全不变。

最终评测必须分本体、任务、相机与起始状态，报告单训、混训和只换adapter三组。StanfordVL的BEHAVIOR协议可提供BDDL目标与隐藏实例，World Labs R2S2R可提供多机器人/视角仿真压力测试；前者属于StanfordVL评测线，后者属于World Labs空间仿真线，均不能替SO-101真机闭环给出结论。`, sourceIds: ['behavior55', 'r2s2r55', 'vjepa55', 'ami55'] },
      ],
      points: ['共享语义与任务空间目标，不等于共享关节命令。', '本体ID、统计、mask和投影必须一起版本化。', '跨本体收益要由分组probe与闭环结果共同支持。'],
      codeTitle: 'planar_adapter.py · 同一任务速度的本体专属Jacobian映射',
      code: [
        'import math',
        '',
        'def joint_velocity(name,q,v,registry):',
        '    if name not in registry: raise ValueError("unknown embodiment")',
        '    l1,l2=registry[name]',
        '    q1,q2=q',
        '    J=[[-l1*math.sin(q1)-l2*math.sin(q1+q2),-l2*math.sin(q1+q2)],',
        '       [ l1*math.cos(q1)+l2*math.cos(q1+q2), l2*math.cos(q1+q2)]]',
        '    det=J[0][0]*J[1][1]-J[0][1]*J[1][0]',
        '    if abs(det)<1e-8: raise ValueError("singular configuration")',
        '    return ((J[1][1]*v[0]-J[0][1]*v[1])/det,',
        '            (-J[1][0]*v[0]+J[0][0]*v[1])/det)',
        '',
        'robots={"arm_a":(.25,.20),"arm_b":(.40,.10)}',
        'qa=joint_velocity("arm_a",(0.,math.pi/2),(.02,.01),robots)',
        'qb=joint_velocity("arm_b",(0.,math.pi/2),(.02,.01),robots)',
        'assert all(abs(x-y)<1e-9 for x,y in zip(qa,(.04,-.14)))',
        'assert all(abs(x-y)<1e-9 for x,y in zip(qb,(.025,-.225)))',
        'assert qa!=qb',
        'try:',
        '    joint_velocity("arm_x",(0.,0.),(.02,.01),robots)',
        '    raise AssertionError("unknown embodiment accepted")',
        'except ValueError: pass',
        'print("task-space adapter: PASS")',
      ].join('\n'),
      codeNotes: ['解析2×2逆矩阵只用于教学数值例；真实多自由度机器人应使用带阻尼伪逆、关节限位和碰撞约束。', 'registry显式绑定本体尺寸，负例拒绝未知身份；不从动作维度推断机器人。', '代码只计算离线速度，不连接SO-101端口或发送控制命令。'],
      exercise: { prompt: '若A臂仍在q=(0,π/2)，目标改为纯向上v=(0,0.02)米/秒，计算qdot并解释第二关节为什么反向。', steps: ['使用J=[[-0.2,-0.2],[0.25,0]]。', '由第二行求qdot1。', '代回第一行求qdot2。'], solution: '0.25·qdot1=0.02，所以qdot1=0.08 rad/s；-0.2(qdot1+qdot2)=0，所以qdot2=-0.08 rad/s。两关节反向使水平速度抵消，只留下向上速度。' },
      quiz: { question: '为什么“动作都归一化到[-1,1]”仍不能说明两个本体可共享同一action head？', hint: '归一化只改变数值尺度，不改变物理语义。', keywords: ['normalization', 'reference frame', 'control mode', 'Jacobian', 'embodiment id'], reference: '[-1,1]只说明数值范围；每维仍可能对应不同关节、方向、单位、绝对/增量/速度、控制周期和可达域。相同归一化值经不同统计与Jacobian会产生不同物理运动，因此仍需本体专属统计、mask、投影与闭环验证。' },
      sources,
    },
    code: {
      title: '源码精读：GR00T按本体选参数，Octo如何替换新动作head',
      minutes: 40,
      prerequisites: '会读PyTorch Parameter、batch matrix multiply、mask reduction，以及JAX/Flax配置和参数树合并。',
      connection: '把基础课的E_e/F/D_e边界落到真实函数；明天横评四模型时会检查每个系统究竟是共享head、替换head还是只统一数据格式。',
      intro: '真实代码给出两种不同适配策略。GR00T预留多个本体投影槽位，在同一action head里按ID选状态/动作编码器和decoder参数；Octo的新双臂示例直接换成14维L1ActionHead，再合并可兼容的预训练参数。二者都没有声称“padding本身创造跨本体控制能力”。',
      outcomes: ['定位GR00T身份从processor进入三个投影器的调用链', '解释CategorySpecificLinear的张量shape与梯度隔离', '运行含正负测试的本体投影和二维mask loss夹具'],
      sections: [
        { heading: '01 processor先把名字变成ID，模型不从shape猜身体', body: `Gr00tN1d7Processor按embodiment tag选择modality config与统计，再查询tag→projector index，把embodiment_id放进BatchFeature。state/action被pad到模型最大维度，同时保留维度与时间mask。tag、统计、projector index和checkpoint映射必须同版本保存；只复制模型权重、不复制processor身份文件会让路由失真。

这一步与10-21的dataset tag不同层但同一身份链：数据目录声明样本属于谁，processor把该身份编码为整数，模型用整数选择参数。字符串同名不保证物理同体；整数相同更不保证。注册新SO-101槽位前应保存关节顺序、单位、动作表示、horizon、统计哈希与投影索引。`, sourceIds: ['grootProcessor55', 'grootModel55'] },
        { heading: '02 CategorySpecificLinear是按batch选择权重的并行adapter', body: `固定源码把W存成[E,I,O]、b存成[E,O]。forward用cat_ids得到[B,I,O]与[B,O]，再对输入x[B,T,I]执行torch.bmm，输出[B,T,O]。同一batch可包含不同本体；样本e只更新被索引的We和be，而共享DiT仍接收所有本体梯度。

state encoder和decoder是两层CategorySpecificMLP，action encoder则把本体条件线性层与时间编码结合。它隔离的是输入输出投影，不是完全独立策略：共享DiT若被一个大数据本体主导，仍可能伤害小本体。因此采样权重、每本体loss与梯度范数要分栏，不能以“adapter独立”推断无负迁移。`, formulas: [{ latex: String.raw`y_{b,t}=x_{b,t}W_{e_b}+b_{e_b},\quad W\in\mathbb{R}^{E\times I\times O}`, explanation: 'eb来自processor的embodiment_id。每个样本选择一片参数，但共享核心仍跨本体训练。' }], sourceIds: ['grootAdapter55', 'grootModel55'] },
        { heading: '03 mask必须同时覆盖时间和动作维，分母只计有效元素', body: `GR00T的flow训练先采noise与t，构造noisy trajectory和velocity=action-noise；预测经本体decoder输出最大动作维。逐元素MSE乘action_mask后，以mask.sum()+ε归一。这使短horizon和低维本体的padding不直接贡献loss，也避免把固定最大张量的零位当监督。

但mask正确不等于语义正确：如果SO-101的第0维和另一机器人第0维含义不同，只要各自adapter与统计正确就可以共存；若错误共享同一projector index，mask不会发现关节置换。最低负测试应覆盖错误ID、越界ID、mask全零、padding值任意变化不改变loss，以及交换语义相同shape时由schema哈希拒绝。`, sourceIds: ['grootModel55', 'grootProcessor55'] },
        { heading: '04 Octo示例展示“复用主干、重建接口”的另一条路', body: `Octo新观测/动作示例加载预训练模型，删除wrist tokenizer，添加proprio tokenizer，并把旧action head完整替换成action_horizon=50、action_dim=14的L1ActionHead。OctoModel.from_config按新example batch初始化模型，merge_params只拷贝形状兼容的预训练参数；源码注释明确新proprio位置编码和新head权重从头开始。

推理时OctoModel.sample_actions把目标数据集的unnormalization_statistics传给head，embodiment_action_dim由统计长度决定，之后才裁切与反归一化。课程选择GR00T做可运行PyTorch夹具，是因为其按ID投影更直观；并不宣称它优于Octo。对SO-101，若只有一个新本体，小数据重建head常比虚构多本体槽位更可审计。`, sourceIds: ['octoFinetune55', 'octoModel55', 'octoPaper55'] },
      ],
      points: ['processor身份决定使用哪组本体投影参数。', '共享DiT仍可能产生跨本体负迁移。', 'padding mask隔离无效维度，但不能修复错误动作语义。'],
      codeTitle: 'embodiment_projector.py · PyTorch参数选择与mask loss夹具',
      code: [
        'import torch',
        '',
        'def grouped_linear(x,ids,W,b):',
        '    if ids.ndim!=1 or ids.shape[0]!=x.shape[0]: raise ValueError("bad id shape")',
        '    if ids.dtype!=torch.long or (ids<0).any() or (ids>=W.shape[0]).any():',
        '        raise ValueError("unknown embodiment id")',
        '    return torch.bmm(x,W.index_select(0,ids))+b.index_select(0,ids)[:,None,:]',
        '',
        'def masked_mse(pred,target,mask):',
        '    if pred.shape!=target.shape or mask.shape!=pred.shape: raise ValueError("shape mismatch")',
        '    n=mask.sum()',
        '    if n.item()==0: raise ValueError("empty action mask")',
        '    return (((pred-target)**2)*mask).sum()/n',
        '',
        'W=torch.zeros(2,2,2); b=torch.zeros(2,2)',
        'W[0]=torch.eye(2); W[1]=2*torch.eye(2)',
        'x=torch.tensor([[[1.,2.]],[[1.,2.]]]); ids=torch.tensor([0,1])',
        'y=grouped_linear(x,ids,W,b)',
        'assert torch.equal(y,torch.tensor([[[1.,2.]],[[2.,4.]]]))',
        'mask=torch.tensor([[[1.,1.]],[[1.,0.]]])',
        'target=torch.zeros_like(y)',
        'loss=masked_mse(y,target,mask)',
        'y_bad=y.clone(); y_bad[1,0,1]=999.',
        'assert torch.allclose(loss,masked_mse(y_bad,target,mask))',
        'try:',
        '    grouped_linear(x,torch.tensor([0,2]),W,b)',
        '    raise AssertionError("unknown id accepted")',
        'except ValueError: pass',
        'print("embodiment projector: PASS")',
      ].join('\n'),
      codeNotes: ['grouped_linear复刻CategorySpecificLinear按ID选择W/b再bmm的核心，不实现完整flow、DiT或processor。', '正例证明同一输入因本体ID进入不同投影；padding位改成999仍不改变masked loss。', '上游直接索引可能接受Python负索引语义；教学夹具额外拒绝负数和越界ID，作为接口护栏。'],
      exercise: { prompt: 'W有4个本体、输入维12、输出维64，忽略bias共有多少参数？若共享一个W又有多少？这能否单独决定方案？', steps: ['计算4×12×64。', '计算12×64。', '说明参数量与语义隔离、数据量、负迁移的关系。'], solution: '专属W共有3072个参数，共享W为768个，差2304。参数节省不能单独决定：共享W可能混淆物理语义，专属W在小数据下也可能欠拟合或过拟合；应结合接口正确性、每本体数据量、分组loss/闭环和共享主干收益选择。' },
      quiz: { question: 'GR00T的action_mask正确后，为什么错误共享projector index仍可能静默训练？', hint: 'mask知道哪些位置有效，但不知道每个位置代表什么。', keywords: ['action mask', 'projector index', 'schema hash', 'joint order', 'silent mismatch'], reference: 'mask只排除padding的时间和动作维，不编码关节名称、方向、单位或控制模式。两个本体若错误共用index且shape相同，loss可正常下降，却把不同物理量送进同一参数。必须由tag映射、schema哈希、反归一化往返和分组回放发现。' },
      sources,
    },
    insight: {
      title: 'SO-101跨本体路线：先证实共享表示，再扩大动作边界',
      minutes: 25,
      prerequisites: '已有单本体SO-101可复现数据与RGB基线，能按本体/任务报告成功率、介入、安全事件和置信区间。',
      connection: '将本体adapter机制变成个人项目决策；明天四模型统一横评时，以“共享了什么、隔离了什么、如何闭环证明”作为共同表头。',
      intro: '个人项目的目标不是最快宣称“多本体大模型”，而是找到迁移发生在哪一层。先证明共享视觉语言主干能减少SO-101数据需求，再检查任务空间动作是否值得统一，最后才讨论多个真实机器人共同训练。每扩一层都增加混杂变量与安全成本。',
      outcomes: ['建立单本体head、共享主干与多本体adapter三阶段证据门', '用transfer efficiency和最坏组退化同时判断共享收益', '把双团队研究线转成仿真/表征对照而不混淆组织归属'],
      sections: [
        { heading: '01 阶段一只换SO-101 head，先证明预训练表示有用', body: `保留固定SO-101数据、split、相机、state/action schema与评测格子，对比从头训练和共享预训练主干+新head。新head、统计和optimizer重新初始化；主干可先冻结，再逐层解冻。若相同目标成功率所需episode减少，或固定episode下最坏风险组下界提高，才有“表示迁移”证据。

这一步不需要第二台机器人，也不应声称跨本体控制成功。Octo示例提供了“新proprio tokenizer+新14维head+兼容参数合并”的公开路径；GR00T提供“NEW_EMBODIMENT投影槽位”。两者都要求目标本体数据。对个人硬件，先得到可复现收益比构造看似通用的padding格式更重要。`, sourceIds: ['octoFinetune55', 'octoProject55', 'grootProcessor55'] },
        { heading: '02 阶段二用同本体变化检查共享是否真来自任务知识', body: `在同一SO-101上改变背景、物体、相机高度、RAW/RGB处理或语言表达，保持控制器不变；训练共享主干时保留source_id，检查冻结probe和闭环。若收益只出现在相同背景，可能是视觉记忆；若新物体语义提高但接触恢复不变，说明共享发生在语义层而非控制层。

可定义数据效率比R=N_scratch/N_transfer，其中N是在预注册成功率下界达到门槛所需的episode数。例：从头需要120条、预训练+新head需要60条，则R=2；但若预训练方案的最坏组成功率低8个百分点或安全介入增加，它仍不能晋级。R必须来自同一采集与训练预算协议，不能把已有额外数据藏在预训练组。`, formulas: [{ latex: String.raw`R_{data}=N_{scratch}(\tau)/N_{transfer}(\tau),\quad G_{worst}=\min_g\left[LCB(p^{transfer}_g-p^{base}_g)\right]`, explanation: 'τ是预注册成功率下界门槛；数据效率提高还需最坏组差值下界不为负，并单列安全事件。' }], sourceIds: ['octoPaper55', 'oxePaper55'] },
        { heading: '03 阶段三才引入第二本体，并冻结一张接口差异表', body: `第二本体进入前，逐项列出相机角色、state键、动作键、关节顺序、单位、参考系、absolute/delta/velocity、频率、horizon、夹爪与安全器。可先共享视觉语言主干、保持独立head；只有两者存在明确定义的共同任务空间且运动学/控制桥经过往返测试，才尝试共享更深的action core。

训练报告至少包含单训A、单训B、混训共享主干、混训共享主干+专属adapter，以及错误ID/交换head负例。每组给样本数、置信区间、p95动作年龄、介入和近失。目标本体提升但另一组明显退化时，不能用总体平均掩盖；应回看采样权重、共享层梯度冲突和adapter容量。`, sourceIds: ['grootModel55', 'grootAdapter55', 'oxePaper55'] },
        { heading: '04 双团队资料提供测试世界与表征对照，不提供万能动作头', body: `StanfordVL的BEHAVIOR-1K/OmniGibson可用BDDL目标、不同机器人、对象状态和Q-score定义“同任务是否真的等价”；World Labs的R2S2R/Atlas强调从真实任务构建多机器人、传感器、视角与物理变体，并要求仿真排序由真机验证。前者属于Stanford Vision and Learning Lab，后者属于World Labs，不能因李飞飞关联而合并归属。

Meta/FAIR的V-JEPA 2/2.1与动作条件历史工作可作冻结共享视觉表征或规划对照；AMI Labs当前公开方向是表征空间预测、动作条件世界模型、可靠性与安全。它提醒我们预测结果应依赖action与身体约束，但官网方向不是已发布SO-101 adapter。个人项目可先做冻结probe和离线counterfactual，再决定是否进入动作条件模型。`, sourceIds: ['behavior55', 'r2s2r55', 'vjepa55', 'ami55'] },
      ],
      points: ['第一步证明共享表示降低SO-101数据需求，不抢跑多本体控制。', '引入第二本体时先共享主干、隔离head与统计。', '数据效率、最坏组、安全和时延必须同时过门。'],
      codeTitle: 'transfer_gate.py · 数据效率与最坏组联合晋级门',
      code: [
        'def transfer_gate(n_scratch,n_transfer,base,mixed,max_regression=.03):',
        '    if min(n_scratch,n_transfer)<=0 or set(base)!=set(mixed):',
        '        raise ValueError("incomparable transfer report")',
        '    delta={g:mixed[g]-base[g] for g in base}',
        '    worst=min(delta.values())',
        '    return {"data_ratio":n_scratch/n_transfer,"worst_delta":worst,',
        '            "pass":n_scratch/n_transfer>1 and worst>=-max_regression}',
        '',
        'ok=transfer_gate(120,60,{"so101":.60,"robot_b":.70},{"so101":.68,"robot_b":.68})',
        'bad=transfer_gate(120,60,{"so101":.60,"robot_b":.70},{"so101":.72,"robot_b":.55})',
        'assert ok["data_ratio"]==2 and ok["pass"] is True',
        'assert round(bad["worst_delta"],2)==-.15 and bad["pass"] is False',
        'try:',
        '    transfer_gate(120,60,{"so101":.6},{"renamed":.7})',
        '    raise AssertionError("group identity drift accepted")',
        'except ValueError: pass',
        'print("cross-embodiment transfer gate: PASS")',
      ].join('\n'),
      codeNotes: ['点估计夹具只检查报告结构与退化方向；正式门禁必须使用每组回合数、置信下界和安全事件。', '正例数据量减半且最坏退化2个百分点，负例虽SO-101提升12个百分点却伤害另一机器人15个百分点。', '组名变化会被拒绝，防止通过重命名绕过历史基线。'],
      exercise: { prompt: '从头需90条、迁移需45条；三组差值为+0.08、-0.01、-0.04，允许最大退化0.03。是否晋级？', steps: ['计算Rdata。', '找最坏组差值。', '同时应用效率与退化门。'], solution: 'Rdata=2，数据效率通过；最坏组为-0.04，超过允许的-0.03，因此不晋级。应检查该组是否是接口错位、采样不足或共享梯度冲突，而不是用总体提升覆盖。' },
      quiz: { question: '个人SO-101项目何时才可以把结果称为“跨本体动作迁移”？', hint: '不仅要有预训练主干，还要有第二本体、接口隔离和闭环对照。', keywords: ['second embodiment', 'separate head', 'single-task baseline', 'worst group', 'closed-loop'], reference: '至少需要第二个真实或受控仿真本体，冻结接口差异表，保留本体专属统计/head或明确任务空间adapter，并与各自单训基线在匹配任务上比较。共享模型须在两本体闭环、最坏组、安全与时延上通过；仅SO-101微调通用主干、统一格式或离线loss改善只能称表示迁移。' },
      sources,
    },
  },
};
