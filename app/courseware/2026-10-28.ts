import type { AuthoredDay } from './types';

const cosmosCommit = 'a2c298b0a3df3778b973fe65e9e58877b292d8a7';
const cosmosRoot = 'https://github.com/nvidia-cosmos/cosmos-predict2.5/blob/' + cosmosCommit;
const vjepaCommit = '204698b45b3712590f06245fbfba32d3be539812';
const vjepaRoot = 'https://github.com/facebookresearch/vjepa2/blob/' + vjepaCommit;

const sources = [
  { id: 'atlas58', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-25 实读架构、Spatial Reconstruction、Space-Time Simulation与Benchmarks：Atlas把文本、图像、相机位姿和3D深度置于共享空间上下文，以自回归diffusion transformer生成像素/深度并可转为点云或3D Gaussian splats；公开量化重点是相机条件生成与稀疏视图3D重建，不是通用动作规划成功率。' },
  { id: 'worldTax58', label: 'World Labs · A Functional Taxonomy of World Models', url: 'https://www.worldlabs.ai/blog/taxonomy-of-world-models', reading: '2026-10-25 复读renderer、simulator、planner与闭环的功能划分：像素或3D输出优先服务观测和可视化，是否能用于决策还需动作反事实、状态一致和闭环证据。' },
  { id: 'r2s2r58', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-25 复读真实任务重建、可控变体、sim-real对齐与策略排序：对机器人有用的生成世界要保留任务相关观测和交互后果，并由真机失败区域与相对排序复核。' },
  { id: 'cosmosDocs58', label: 'NVIDIA · Cosmos-Predict2.5官方文档', url: 'https://docs.nvidia.com/cosmos/latest/predict2.5/index.html', reading: '2026-10-25 实读模型概述与Model Matrix：Predict2.5是预测视频形式未来世界的flow模型，统一Text2World、Image2World和Video2World；官方另列robot/action-conditioned变体，说明普通视频生成不自动等于动作条件物理预测。' },
  { id: 'cosmosFlow58', label: 'Cosmos rectified-flow训练源码（固定提交）', url: cosmosRoot + '/cosmos_predict2/_src/predict2/models/text2world_model_rectified_flow.py', reading: '2026-10-25 精读training_step与forward：get_data_and_condition生成x0及condition，随机噪声epsilon与x0经get_interpolation得xt与目标速度vt，denoise输出预测速度场，再对[B,C,T,H,W]的非batch轴求均方误差并乘时间权重。' },
  { id: 'cosmosAction58', label: 'Cosmos action-conditioned入口（固定提交）', url: cosmosRoot + '/cosmos_predict2/action_conditioned.py', reading: '2026-10-25 精读_get_actions、get_action_sequence_from_states和inference：从相邻末端位姿/夹爪状态建立相对动作，按chunk填充，视频整理为[B,C,T,H,W]并把action显式传入pipeline。这条路径才能测动作反事实。' },
  { id: 'vjepaPaper58', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/abs/2506.09985', reading: '2026-10-25 复读表征预测、动作条件后训练和机器人规划边界：无动作视频预训练学视觉表征，机器人规划则另需动作条件predictor和目标代价。' },
  { id: 'vjepa21Paper58', label: 'Meta/FAIR · V-JEPA 2.1论文', url: 'https://arxiv.org/abs/2603.14482', reading: '2026-10-25 实读稠密预测损失、deep self-supervision与image/video联合训练：目标是空间稠密、时间一致表征，而非解码RGB像素；但表征丢弃的细节是否无关，必须用下游任务和安全反例验证。' },
  { id: 'vjepaCode58', label: 'V-JEPA 2训练主循环（固定提交）', url: vjepaRoot + '/app/vjepa/train.py', reading: '2026-10-25 精读forward_target、forward_context、loss_fn和momentum update：target encoder在no_grad下产生h，context encoder仅看可见token，predictor预测masked token，损失对归一化embedding做Lp距离，target参数用EMA更新。' },
  { id: 'vjepa21Code58', label: 'V-JEPA 2.1稠密损失（固定提交）', url: vjepaRoot + '/app/vjepa_2_1/train.py', reading: '2026-10-25 精读forward_target、forward_context与loss_fn：可组合多个encoder深度的归一化target，z_pred对masks_pred计算预测损失；开启predict_all时z_context还对masks_enc计算距离加权的context loss。' },
  { id: 'behaviorEval58', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-25 复核BDDL目标、Q-score、隐藏实例、时间预算和单次rollout：只有闭环任务证据才能检查生成或latent目标是否保留真正的成功条件。' },
  { id: 'ami58', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-25 核对当前一手页面：AMI当前公开的是表征空间预测、动作条件世界模型、可靠性和安全方向；本课的V-JEPA代码与已有实验仍归Meta/FAIR历史谱系，不写成AMI已发布模型。' },
];

export const day58: AuthoredDay = {
  reviewedAt: '2026-10-25',
  revision: '逐课编写 1.0',
  deliverable: '一张像素、深度/3D、flow速度场与latent embedding目标的类型—损失—消费者—证据表；一个对照Cosmos与V-JEPA真实源码语义的PyTorch正负测试夹具；一份用于SO-101/RAW项目的视觉逼真与控制有效双门验收表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '为什么“像素损失更低”和“latent损失更低”都不能单独证明机器人规划更好？',
    summary: '优化目标、不可预测细节、任务信息与动作反事实必须分开验证。',
    keywords: ['pixel loss', 'latent loss', 'action conditioning', 'counterfactual', 'task sufficiency', 'closed loop'],
    reference: '像素或flow损失惩罚高维观测误差，可能把容易测量但与动作无关的纹理、光照与噪声当作重点；latent损失允许encoder忽略难预测细节，但也可能丢掉夹爪—物体间隙、透明障碍或接触前兆。两者都要额外验证：错配/相反动作是否改变预测，候选动作排序是否与真实后果一致，任务和安全变量是否可解码，以及闭环重规划是否改善成功率与近失事件。',
  },
  lessons: {
    foundation: {
      title: '像素、3D与latent预测：先分清学习对象，再谈世界模型', minutes: 34,
      prerequisites: '理解10月27日renderer、simulator、planner的职责分工；会读[B,C,T,H,W]视频张量、均方误差、mask和encoder/predictor。',
      connection: '昨天把world model拆成输出合同；今天比较像素/3D生成与latent预测的训练信号。明天将进入V-JEPA 2/2.1自监督表征，重用本课的mask、target encoder与信息丢失检查。',
      intro: '“预测未来”可以指未来RGB、深度、显式3D、噪声到数据的速度场，也可以指未来表征。这些目标的单位、可观测性和失败方式不同。本课不判定哪条路线绝对更好，而是建立一个能把损失值翻译成可验收主张的框架。',
      outcomes: ['区分RGB/深度/3D目标、rectified-flow速度目标和latent embedding目标', '推导像素/flow与JEPA损失并说明各自不能证明什么', '用数值反例理解“忽略不可预测细节”的收益与安全风险'],
      sections: [
        { heading: '01 生成目标把世界还原为可观测信号', body: `对RGB视频，模型可以直接预测o_{t+1:t+H}，也可以在VAE latent中使用diffusion/flow生成，最后解码回像素。对空间世界，目标还可以是depth、point cloud或3D Gaussian splat。Atlas的公开描述属于这一大类：输入文本、图像、相机位姿与深度，共享空间上下文中自回归生成新元素。

这类目标的优势是可检视：可计算相机轨迹跟随、几何重建误差、深度一致性，人也能看见错帧。但生成合理的“观测”不等于内部拥有可交互物理状态；单图未见区域本来就有多个合理答案，若用一份真值像素逐点惩罚，会把“另一个合理未来”也当成错误。`, sourceIds: ['atlas58', 'worldTax58'] },
        { heading: '02 Rectified Flow学的是从噪声到数据的速度场', body: `Cosmos-Predict2.5源码先将干净视频latent写成x_0，采样高斯噪声epsilon和时间t，构造x_t=alpha(t)x_0+sigma(t)epsilon。网络接收x_t、t与文本/视频/动作condition，回归速度v_t=d x_t/dt。在最简直线路径alpha=t、sigma=1-t下，v_t=x_0-epsilon。

源码的per_instance_loss对C、T、H、W全部非batch轴求(v_hat-v)^2平均，再乘时间权重。这不是直接计算视频PSNR，但它依然为生成高维观测服务；降低flow loss证明速度回归更接近训练目标，不能自动推出动作后果、接触或闭环成功更准。只有action明确进入condition并通过反事实测试，才能把它升级为动作条件主张。`, formulas: [{ latex: String.raw`x_t=\alpha(t)x_0+\sigma(t)\epsilon,\qquad \mathcal L_{\mathrm{flow}}=\mathbb E_{t,x_0,\epsilon}\left[w(t)\lVert \hat v_\theta(x_t,t,c)-v_t\rVert_2^2\right]`, explanation: 'x0是干净视频latent，epsilon为高斯噪声，c是文本/视频/动作条件，w(t)是时间权重；损失单位是latent速度差的平方。' }], sourceIds: ['cosmosDocs58', 'cosmosFlow58', 'cosmosAction58'] },
        { heading: '03 JEPA在表征空间对齐“被遮住的事实”', body: `V-JEPA不让predictor解码每个RGB值。target encoder看完整clip并产生h=E_target(x)；context encoder只看mask后的可见token，predictor输出z_hat=P(E_context(x_visible),mask)。源码用apply_masks从h取目标token，对归一化后的z_hat与h计算Lp距离，target encoder本身不反传，而由online encoder参数的EMA更新。

表征目标的直觉是不必为镜头噪声、树叶的不可预测颤动或每个纹理位相支付容量，可把资源留给物体、动作和时序结构。但“encoder忽略了某信息”只有在该信息对所有目标任务无关时才是优点。若它把透明材料、微小间隙或夹爪接触前兆一起丢掉，latent loss仍可以很低，控制却会失败。`, formulas: [{ latex: String.raw`\mathcal L_{\mathrm{JEPA}}=\frac{1}{|M|}\sum_{i\in M}\frac{\left\lVert \hat z_i-\operatorname{sg}(z_i^{\mathrm{target}})\right\rVert_p^p}{p}`, explanation: 'M是目标mask的token集，hat z_i是predictor输出，sg表示target分支停止梯度；距离发生在embedding空间，不是RGB单位。' }], sourceIds: ['vjepaPaper58', 'vjepa21Paper58', 'vjepaCode58', 'vjepa21Code58'] },
        { heading: '04 一个数值反例：不管低层纹理可以，不管安全细节不行', body: `把一帧极度简化为[目标x,目标y,安全间隙,背景亮度]=[1,1,0.2,0.5]。预测A=[1,1,0.2,0.9]只错背景，像素平均平方误差为0.04；预测B=[1,1,0.0,0.5]只错安全间隙，误差为0.01。如果规划要求间隙至少0.1，B虽然“更像”，却会做出错误安全判断。

反过来，假设encoder只z=[x,y]，A和B的latent误差都是0。这正是latent抽象的双刃剑：背景不变性很好，但安全间隙也被折叠了。最小补救不是把所有像素都加回去，而是添加任务probe、深度/接触辅助目标和反事实动作测试，证明被丢弃的只是无关变化。权重和阈值必须由真实任务标定，不是看图决定。`, sourceIds: ['r2s2r58', 'behaviorEval58', 'vjepa21Paper58'] },
      ],
      points: ['先写清预测对象的类型和单位，再比较损失。', '生成目标保留可视细节，latent目标主动追求不变性；两者都可能丢掉控制必需信息。', '训练损失只验收优化对象，不代替动作反事实和闭环任务证据。'],
      codeTitle: 'objective_counterexample.py · 同时检查像素排序与latent折叠',
      code: [
        'import torch',
        '',
        'target=torch.tensor([1.0,1.0,0.2,0.5])',
        'background_error=torch.tensor([1.0,1.0,0.2,0.9])',
        'safety_error=torch.tensor([1.0,1.0,0.0,0.5])',
        '',
        'def mse(a,b): return (a-b).square().mean()',
        'pixel_a=mse(background_error,target)',
        'pixel_b=mse(safety_error,target)',
        'assert torch.allclose(pixel_a,torch.tensor(.04))',
        'assert torch.allclose(pixel_b,torch.tensor(.01)) and pixel_b<pixel_a',
        '',
        '# 教学encoder只保留目标xy，因而对背景和安全间隙都不敏感。',
        'encoder=lambda x:x[:2]',
        'assert mse(encoder(background_error),encoder(target))==0',
        'assert mse(encoder(safety_error),encoder(target))==0',
        '',
        'def safety_probe(x,minimum=.1): return bool(x[2]>=minimum)',
        'assert safety_probe(target) and not safety_probe(safety_error)',
        'try:',
        '    assert safety_probe(safety_error)==safety_probe(target)',
        '    raise AssertionError("collapsed safety detail accepted")',
        'except AssertionError: pass',
        'print("objective counterexample: PASS",float(pixel_a),float(pixel_b))',
      ].join('\n'),
      codeNotes: ['4维向量只是观测的教学投影，不把真实像素、深度或3D几何等同于4个标量。', 'MSE更小的safety_error却跨过安全阈值，证明平均重建误差不等于任务代价。', '负例故意要求折叠后的latent恢复安全判断并捕获失败；代码不运行生成模型或机器人。'],
      exercise: { prompt: '目标观测为[0.8,0.2,0.15,0.5]，预测C只把背景亮度改成0.9，预测D只把间隙改成0.05。计算两者四维MSE，并在安全阈值0.1下解释为什么MSE排序不能做晋级决策。', steps: ['只有一维不同，用平方差除4。', '分别把目标和预测的间隙与0.1比较。'], solution: 'C的MSE=(0.9-0.5)^2/4=0.04；D的MSE=(0.05-0.15)^2/4=0.0025。MSE认为D更好，但D把安全间隙从阈值上方预测到下方，会改变行动决策；必须额外检查任务/安全变量。' },
      quiz: { question: '表征预测为什么可以忽略像素细节，又为什么不能默认忽略的细节一定无关？', hint: '分别举一个不可预测噪声和一个安全相关细节。', keywords: ['invariance', 'unpredictable detail', 'task sufficiency', 'probe', 'safety'], reference: '表征目标可不还原光照噪声、纹理位相等不可预测又与决策无关的变化，降低容量浪费。但encoder也可能折叠透明障碍、接触前间隙或滑移前兆。因此要用任务probe、辅助监督、动作反事实和闭环安全指标验证信息充分性。' },
      sources,
    },
    code: {
      title: '源码精读：Cosmos速度回归与V-JEPA masked embedding loss', minutes: 40,
      prerequisites: '会跟踪PyTorch张量shape、区分batch/时间/token轴，理解no_grad、EMA和布尔mask。',
      connection: '基础课建立了两类目标的数学合同；本课对照固定提交的真实函数、轴和更新规则。明天精读V-JEPA 2/2.1时将继续追mask collator和dense/deep target。',
      intro: '两个仓库都有predictor和loss，但同名变量不代表同一语义。Cosmos的prediction是生成路径上的速度场，V-JEPA的prediction是目标encoder定义的token embedding。源码精读要回答四个问题：真值从哪来，哪些轴被reduce，哪条分支收梯度，输出给谁用。',
      outcomes: ['定位Cosmos training_step→forward→get_interpolation→denoise→loss路径', '定位V-JEPA forward_target/forward_context/loss_fn/EMA路径', '运行一个带shape、mask、stop-gradient和负例的最小PyTorch对照'],
      sections: [
        { heading: '01 Cosmos forward把视频生成拆成带权速度回归', body: `固定提交的Text2WorldModelRectifiedFlow.training_step先更新训练统计，然后直接进入forward。forward通过get_data_and_condition得到x0_B_C_T_H_W与condition，采样同shape噪声epsilon和batch级t，并把t扩成[b,1]，表示同一视频各帧共享噪声等级。

get_interpolation返回x_t与v_t，denoise接收噪声、x_t、timestep与condition后预测v_hat。代码对v_hat-v的维度1..N求均，所以per_instance_loss保留[B]，再与train_time_weight相乘得标量。若误把T当batch，会让不同帧抽到不同t并改变训练问题；教学夹具用[B,C,T,H,W]断言防止这类“能运行的轴错”。`, sourceIds: ['cosmosFlow58'] },
        { heading: '02 action-conditioned不是文件名，而是可测的数据契约', body: `Cosmos的action_conditioned.py从相邻机器人state计算末端位移、旋转和夹爪动作，按chunk_size切分，不足处用零填充。vid_input由[T,H,W,C]转为[B,C,T,H,W]，action作为独立参数进入pipeline。所以动作轴A、时间轴T、填充范围和尺度都是模型事实，不能只写“条件于动作”。

最小正测试是固定首帧和噪声，只改动作，要求生成的后果或目标状态按物理方向分开。负测试包括置乱T轴、把填充动作当真实动作、不同单位未反归一化以及把相机轨迹当机器人控制。若两组相反动作生成同一结果，再低的视频损失也不支持规划。`, sourceIds: ['cosmosDocs58', 'cosmosAction58'] },
        { heading: '03 V-JEPA的真值是EMA target encoder，不是原始像素', body: `V-JEPA 2的forward_target在torch.no_grad中运行target_encoder，对特征维做layer_norm；forward_context让online encoder只处理masks_enc指定的token，predictor再尝试补出masks_pred。loss_fn先对target h应用相同masks_pred，然后遍历mask组和clip，求|z-h|^p/p平均。

训练步只对online encoder与predictor反传，之后用target=m·target+(1-m)·online做动量更新。如果忘记detach/no_grad，target会和predictor一起追逐损失，任务就不再是源码定义的慢速target；如果mask不对齐，损失可能在不同token之间广播，数值存在但没有语义。`, sourceIds: ['vjepaCode58', 'vjepaPaper58'] },
        { heading: '04 V-JEPA 2.1扩展稠密监督，但仍不输出动作', body: `V-JEPA 2.1的forward_target可从多个encoder深度抽特征、分别layer norm后拼接；forward_context区分image/video modality，predictor返回z_pred与z_context。loss_pred在masks_pred上求目标距离；predict_all开启时，loss_context还覆盖masks_enc，可按与预测区域的空间距离加权。

“dense”说的是表征在空间/时间token上更有定位能力，不是生成稠密RGB，也不是输出关节动作。要成为机器人world-action model，还需动作条件predictor、本体和相机契约、目标代价与planner。本课只精读自监督目标，不用V-JEPA 2-AC的成果为无动作预训练代码补齐功能。`, sourceIds: ['vjepa21Code58', 'vjepa21Paper58', 'vjepaPaper58'] },
      ],
      points: ['Cosmos在[B,C,T,H,W]上回归生成速度，V-JEPA在masked token上回归target embedding。', 'action-conditioned要由数据轴、单位和反事实测试证明。', 'target encoder的no_grad+EMA和mask对齐是JEPA损失语义的组成部分。'],
      codeTitle: 'flow_vs_jepa.py · 速度场与masked embedding的shape合同',
      code: [
        'import torch',
        '',
        'def flow_objective(x0,eps,t,v_pred):',
        '    if x0.ndim!=5 or eps.shape!=x0.shape: raise ValueError("need [B,C,T,H,W]")',
        '    if t.shape!=(x0.shape[0],1,1,1,1): raise ValueError("t must be per-video")',
        '    xt=(1-t)*eps+t*x0',
        '    v_target=x0-eps',
        '    per_instance=(v_pred-v_target).square().mean(dim=(1,2,3,4))',
        '    return xt,v_target,per_instance.mean()',
        '',
        'x0=torch.tensor([[[[[1.,2.],[3.,4.]]]]])',
        'eps=torch.zeros_like(x0)',
        't=torch.full((1,1,1,1,1),.25)',
        'xt,v,loss=flow_objective(x0,eps,t,x0.clone())',
        'assert xt.shape==x0.shape and torch.allclose(xt,.25*x0) and loss==0',
        '',
        'def masked_embedding_loss(pred,target,mask):',
        '    if pred.shape!=target.shape or pred.ndim!=3: raise ValueError("need [B,N,D]")',
        '    if mask.shape!=pred.shape[:2] or mask.dtype!=torch.bool: raise ValueError("bad mask")',
        '    chosen=(pred-target.detach())[mask]',
        '    if chosen.numel()==0: raise ValueError("empty target mask")',
        '    return chosen.square().mean()',
        '',
        'target=torch.tensor([[[1.,0.],[0.,1.],[1.,1.]]],requires_grad=True)',
        'pred=torch.tensor([[[9.,9.],[0.,1.],[2.,1.]]],requires_grad=True)',
        'mask=torch.tensor([[False,True,True]])',
        'jloss=masked_embedding_loss(pred,target,mask)',
        'assert torch.allclose(jloss,torch.tensor(.25))',
        'jloss.backward()',
        'assert target.grad is None and torch.all(pred.grad[0,0]==0)',
        'try:',
        '    masked_embedding_loss(pred.detach(),target.detach(),torch.tensor([[True,False]]))',
        '    raise AssertionError("misaligned mask accepted")',
        'except ValueError: pass',
        'print("flow vs JEPA: PASS",float(loss),float(jloss))',
      ].join('\n'),
      codeNotes: ['flow夹具使用alpha=t、sigma=1-t的教学直线；Cosmos真实实现还有噪声schedule、time weighting、condition和并行切分。', 'JEPA夹具直接接收[B,N,D]，省略ViT、多级特征和mask collator，但保留target detach与token对齐。', '正测试验证非mask位置无梯度、target不收梯度；负测试拒绝shape错位的mask。'],
      exercise: { prompt: '在教学flow路径中，x0=2，epsilon=-1，t=0.25，求xt和v_target。若v_pred=2.5，求单元素MSE。', steps: ['用xt=(1-t)epsilon+t x0。', '用v_target=x0-epsilon。', '计算(v_pred-v_target)^2。'], solution: 'xt=0.75×(-1)+0.25×2=-0.25；v_target=2-(-1)=3；MSE=(2.5-3)^2=0.25。这个0.25是速度回归误差，不是像素误差或任务失败率。' },
      quiz: { question: '为什么把Cosmos的per_instance_loss和V-JEPA的loss_fn都叫MSE仍然会产生严重误读？', hint: '说清真值的生成方式、轴与输出消费者。', keywords: ['velocity field', 'target encoder', 'mask', 'axes', 'consumer'], reference: 'Cosmos的真值是由干净视频latent、噪声和时间路径构造的速度场，在C/T/H/W上reduce，服务生成采样；V-JEPA的真值是EMA target encoder的masked token embedding，在对齐的token/特征上计算，服务表征学习。公式形状相似不代表学到同一对象。' },
      sources,
    },
    insight: {
      title: '证据路线：视觉逼真与控制有效必须分门验收', minutes: 26,
      prerequisites: '掌握基础课的目标类型和代码课的flow/JEPA张量合同；能为SO-101记录时间戳、动作、成功谓词和近失事件。',
      connection: '前两课说清了不同损失的语义；路线课把它们转成可在个人算力、RAW模态和SO-101上执行的证据门。明天的V-JEPA表征课会把probe和稠密特征加入此表。',
      intro: '生成世界最容易被演示视频说服，latent模型最容易被一个低loss说服。真正的路线选择应用同一个任务拆出两道门：观测/几何门验证世界看起来和测量起来是否正确；决策/安全门验证这些预测是否让候选动作排序、闭环结果和风险判断变好。',
      outcomes: ['为生成与latent系统分别选择观测、反事实和闭环指标', '设计RGB与RAW/深度成对的同预算测试', '用硬门防止视觉质量提升被冒充为控制收益'],
      sections: [
        { heading: '01 四层证据表：忠实度、可控性、决策与闭环', body: `第一层是观测/几何忠实度：相机位姿跟随、深度/点云误差、跨视角一致、动态物体身份。第二层是可控性：固定初态，施加零、相反、置乱和错位动作，预测后果必须按对应方向改变，且不应从未来帧泄漏答案。

第三层是决策有效性：在完全相同的候选动作和搜索预算下，比较action ranking、top-k包含率、目标/接触变量可解码性和约束违反。第四层才是闭环：成功率、BDDL/Q-score式部分进度、人工介入、近失、p99时延和扰动后恢复。上一层通过只是进入下一层的条件，不是闭环结论的替代。`, sourceIds: ['atlas58', 'r2s2r58', 'behaviorEval58'] },
        { heading: '02 同预算配对实验才能比较路线，不能比演示', body: `比较pixel/3D与latent路线时，固定数据episode、train/eval split、动作表示、候选集、planner查询次数和算力上限。生成路线可以使用视频/深度误差与人类偏好，latent路线可以使用probe与embedding距离，但两者最后必须在同一个action-ranking和闭环表中交汇。

个人算力不适合从零训练Atlas或Cosmos级生成基座，可以从小型probe开始：冻结现有encoder，训练相同容量的线性/小MLP头预测目标位姿、夹爪间隙和失败前兆；另一路用低分辨率视频或深度预测做对照。若latent probe快但漏掉透明/接触风险，应添加辅助几何或RAW特征，而不是只扩大latent维度。`, sourceIds: ['cosmosDocs58', 'vjepa21Paper58', 'r2s2r58'] },
        { heading: '03 RAW、HDR和深度的价值是修复任务可观测性', body: `用户的RAW、HDR、深度、事件相机经验最适合贡献在“RGB折叠了哪两个物理状态”。例如逆光下黑色夹爪与背景同亮度，RGB encoder可能把有间隙和已接触折成相近latent；深度或RAW高光余量若能让两者分开，才是对规划有用的新信息。

配对实验应在同一时刻对比RGB、RGB+depth、RGB+RAW，加上模态缺失、时间移位、置乱和同带宽假信号负例。若只在静态成功帧上提高重建质量，但在接触前200 ms不改善状态判断、动作排序或急停前量，就只能声称renderer/感知收益。所有变体还要报告同步偏差和p99处理时延，否则多模态优势可能在控制时已过期。`, sourceIds: ['atlas58', 'r2s2r58', 'behaviorEval58'] },
        { heading: '04 用“最弱一门”做晋级，避免平均分掩盖安全失效', body: `可以把候选模型写成四个[0,1]分数：geometry g、action counterfactual a、decision ranking d、safety recall s。不用加权平均，而用G=min(g,a,d,s)作硬门。例如生成模型[0.92,0.55,0.60,0.88]的G=0.55，latent模型[0.70,0.82,0.78,0.48]的G=0.48；两者都不该因为某一项漂亮就晋级。

硬门的分数不是官方benchmark，阈值要从任务后果倒推。对SO-101可先离线设门：反向动作后果方向正确率≥90%、安全事件recall≥95%、排序置信区间不跨过随机基线；p99时延另做不可补偿门。任一门失败就回到数据、表征或动作契约定位，不由其他项平均掉。真机试验需人工安全评审，本自动化只生成离线协议，不控制机械臂。`, formulas: [{ latex: String.raw`G=\min\{g_{\mathrm{geometry}},a_{\mathrm{counterfactual}},d_{\mathrm{ranking}},s_{\mathrm{safety}}\}`, explanation: '四项均归一化到0至1；取最小值表示任一关键能力不足都不能由视觉逼真或平均分补偿。这是教学门控，非三家机构的官方指标。' }], sourceIds: ['r2s2r58', 'behaviorEval58', 'ami58'] },
      ],
      points: ['观测忠实、动作可控、决策排序和闭环安全是递进证据。', '比较路线要固定数据、候选动作、planner和算力预算。', '多模态只有修复任务可观测性并通过时延/负例检查，才能升级为控制收益。'],
      codeTitle: 'evidence_gate.py · 四门最弱项与成对晋级',
      code: [
        'def gate(scores,threshold=.75):',
        '    required=("geometry","counterfactual","ranking","safety")',
        '    if set(scores)!=set(required): raise ValueError("missing or extra evidence")',
        '    if any(not 0<=scores[k]<=1 for k in required): raise ValueError("scores must be normalized")',
        '    weakest=min(required,key=lambda k:scores[k])',
        '    return min(scores.values()),weakest,min(scores.values())>=threshold',
        '',
        'generative={"geometry":.92,"counterfactual":.55,"ranking":.60,"safety":.88}',
        'latent={"geometry":.70,"counterfactual":.82,"ranking":.78,"safety":.48}',
        'g,weak_g,pass_g=gate(generative)',
        'z,weak_z,pass_z=gate(latent)',
        'assert (g,weak_g,pass_g)==(.55,"counterfactual",False)',
        'assert (z,weak_z,pass_z)==(.48,"safety",False)',
        '',
        '# 平均分会掩盖最弱门；两个模型即使平均高也不晋级。',
        'assert sum(generative.values())/4>.7 and not pass_g',
        'assert sum(latent.values())/4>.6 and not pass_z',
        'try:',
        '    gate({"geometry":.9,"ranking":.9,"safety":.9})',
        '    raise AssertionError("missing action counterfactual accepted")',
        'except ValueError: pass',
        'print("evidence gate: PASS",g,weak_g,z,weak_z)',
      ].join('\n'),
      codeNotes: ['threshold=.75是教学值，真实阈值要根据损坏后果、人工介入能力和置信区间确定。', '门函数拒绝缺失counterfactual的证据包，防止用geometry和ranking的平均分补一项空白。', '代码只审核离线指标字典，不触发仿真、真机或客户数据上传。'],
      exercise: { prompt: '模型E的[g,a,d,s]=[0.90,0.76,0.80,0.72]，模型L为[0.78,0.81,0.77,0.83]。在硬门0.75下判断谁可晋级，并给未通过模型的最小修复实验。', steps: ['分别取四项最小值。', '找到未通过的具体门，不修改其他项。'], solution: 'E的G=0.72，卡在safety，不晋级；L的G=0.77，四门均达0.75，可进入下一层受控验证，不表示已证明真机安全。E的最小修复是针对漏检的安全事件做保留集和反例复测，检查表征、深度/接触辅助监督与时间对齐，而不是继续优化geometry。' },
      quiz: { question: '如果Atlas/Cosmos类生成路线的视频质量高于JEPA latent路线，你会用哪三组实验判断它是否也更适合SO-101规划？', hint: '至少覆盖动作反事实、同预算排序和闭环安全。', keywords: ['counterfactual', 'paired budget', 'action ranking', 'closed loop', 'safety'], reference: '第一，固定初帧与噪声，替换零/相反/置乱/时移动作，检查预测后果方向与接触状态。第二，固定数据、候选动作集、planner查询次数和时延预算，比较两路的真实后果排序/top-k。第三，在人工安全评审后做受控闭环扰动测试，报告成功、近失、介入、p99时延和恢复。视频偏好只能作第一层观测证据。' },
      sources,
    },
  },
};
