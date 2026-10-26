import type { AuthoredDay } from './types';

const vjepaCommit = '204698b45b3712590f06245fbfba32d3be539812';
const vjepaRoot = 'https://github.com/facebookresearch/vjepa2/blob/' + vjepaCommit;

const sources = [
  { id: 'vjepaPaper59', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/abs/2506.09985', reading: '2026-10-26 实读预训练、动作条件后训练与评测章节：V-JEPA 2先在超过100万小时互联网视频/图像上做无动作masked latent prediction；V-JEPA 2-AC另用不到62小时DROID轨迹训练动作条件predictor并以图像目标规划，不能把两阶段混成一个动作模型。' },
  { id: 'vjepa21Paper59', label: 'Meta/FAIR · V-JEPA 2.1论文v3', url: 'https://arxiv.org/abs/2603.14482v3', reading: '2026-10-26 实读§2.2—2.3、表1—3与机器人评测：context loss覆盖可见token并按到最近mask的时空距离加权，deep self-supervision拼接多层目标，2D/3D tokenizer分别处理图像/视频；论文同时报告dense/global取舍，不把单一probe增益泛化为任意控制任务。' },
  { id: 'vjepaOfficial59', label: 'Meta AI · Introducing V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-26 复核官方两阶段表述：先从自然视频自监督训练encoder/predictor，再用机器人数据后训练用于规划；62小时DROID与Franka结果属于V-JEPA 2-AC，不是无动作预训练器直接输出关节动作。' },
  { id: 'vjepaTrain59', label: 'V-JEPA 2训练循环（固定提交）', url: vjepaRoot + '/app/vjepa/train.py', reading: '2026-10-26 精读forward_target、forward_context、loss_fn和momentum update：target encoder在no_grad中处理完整clip，online encoder只看masks_enc，predictor补masks_pred，损失只监督目标mask，target参数用EMA更新。' },
  { id: 'vjepa21Train59', label: 'V-JEPA 2.1训练循环（固定提交）', url: vjepaRoot + '/app/vjepa_2_1/train.py', reading: '2026-10-26 精读forward_target、forward_context与loss_fn：target可拼接四个层级的归一化特征；predictor返回z_pred和z_context；predict_all开启后masks_pred与masks_enc分别形成prediction/context loss，后者可用时空距离权重。' },
  { id: 'vjepa21Predictor59', label: 'V-JEPA 2.1 predictor（固定提交）', url: vjepaRoot + '/app/vjepa_2_1/models/predictor.py', reading: '2026-10-26 定位VisionTransformerPredictor.forward：context token投影后与带位置的mask token拼接、按原token索引排序；return_all_tokens时分别投影目标与context输出；image/video modality embedding在predictor内显式加入。' },
  { id: 'vjepa21Encoder59', label: 'V-JEPA 2.1 encoder（固定提交）', url: vjepaRoot + '/app/vjepa_2_1/models/vision_transformer.py', reading: '2026-10-26 定位VisionTransformer.forward：图像走2D patch_embed_img，视频走3D patch_embed；modality embedding、mask删除、多个out_layers_distillation及channel拼接共同定义dense/deep feature，不是从最后一个class token猜空间位置。' },
  { id: 'vjepaMask59', label: 'V-JEPA 2.1 mask collator（固定提交）', url: vjepaRoot + '/src/masks/multiseq_multiblock3d.py', reading: '2026-10-26 精读MaskCollator/_MaskGenerator：按frames-per-clip选择generator，在T×H×W token网格采样多个时空块，返回互补的encoder/predictor索引，并按batch最短长度裁齐；索引本身就是训练语义。' },
  { id: 'vjepaDistance59', label: 'V-JEPA 2.1 context距离权重（固定提交）', url: vjepaRoot + '/app/vjepa_2_1/models/utils/masks_dist.py', reading: '2026-10-26 精读separate_positions与compute_mask_distance：展平token id还原frame/row/column，对每个context token求到最近prediction token的欧氏距离并开平方，训练loss再除以该值，等价强调mask边界附近连续性。' },
  { id: 'vjepaConfig59', label: 'V-JEPA 2.1预训练配置（固定提交）', url: vjepaRoot + '/configs/train_2_1/vitl16/pretrain-256px-16f.yaml', reading: '2026-10-26 核对16帧、256分辨率、patch 16、tubelet 2、predict_all=true、image/video独立batch、modality_embedding和EMA等可复现实验身份；它是大规模预训练配置，不是个人设备建议。' },
  { id: 'behaviorEval59', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-26 复核BDDL目标、部分成功、隐藏实例、单次rollout和时间预算；可把局部状态probe与最终任务证据分开，属于Stanford Vision and Learning Lab评测线，不归World Labs。' },
  { id: 'atlas59', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-26 复核图像、相机位姿、深度与3D共享空间上下文及Real-to-Sim用途；Atlas属于World Labs的生成/重建/仿真路线，可提供视角与几何压力测试，不是V-JEPA 2.1训练组件。' },
  { id: 'r2s2r59', label: 'World Labs · R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-26 复核真实环境重建、可控外观/物理/机器人变体与sim-real对齐；用于构造表征反例，不能替代真实SO-101闭环验收。' },
  { id: 'ami59', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-26 核对当前一手页面：AMI公开的是抽象表征空间预测、动作条件world model、可靠性和安全方向；本课V-JEPA 2/2.1论文、代码与实验仍归Meta/FAIR历史谱系，不写成AMI已经发布的checkpoint。' },
];

export const day59: AuthoredDay = {
  reviewedAt: '2026-10-26',
  revision: '逐课编写 1.0',
  deliverable: '一张V-JEPA 2到2.1的mask目标、context监督、deep supervision与image/video tokenizer差异图；一个复刻固定源码索引和dense loss语义的PyTorch正负测试夹具；一份面向SO-101/RAW的冻结表征probe—动作排序—闭环晋级表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: 'V-JEPA 2.1为什么给可见token也加loss，却仍不能被直接称为机器人策略？',
    summary: '稠密局部监督改善表征可读性，但没有引入动作定义、控制器与任务闭环。',
    keywords: ['context loss', 'dense feature', 'deep supervision', 'action-conditioned', 'probe', 'closed loop'],
    reference: 'V-JEPA 2只在masked token上预测EMA target embedding，可见context token可能承担全局聚合而缺少位置约束；2.1让predictor也重建context token的target embedding，并对mask附近位置加权，再用多层目标和独立图像/视频tokenizer补回局部与全局能力。这个训练仍只接收图像/视频与mask，不含SO-101动作单位、action horizon、控制频率或安全状态机。要称为机器人world-action model还需动作条件predictor；要称为策略还需候选动作选择、执行接口和闭环证据。',
  },
  lessons: {
    foundation: {
      title: 'V-JEPA 2到2.1：从masked预测到时空稠密表征', minutes: 35,
      prerequisites: '理解10月28日的target encoder、stop-gradient、EMA和masked embedding loss；会读视频token网格[T/tubelet,H/P,W/P]。',
      connection: '昨天比较生成目标与latent目标，并预告表征可能丢失局部细节；今天解释V-JEPA 2.1如何直接约束可见token与中间层。明天将把冻结表征接到动作条件rollout，严格区分无动作SSL与V-JEPA 2-AC。',
      intro: 'dense feature不是“token很多”的同义词，而是每个时空token仍能被定位、比较和用于局部任务。V-JEPA 2.1的核心问题很具体：只监督被遮住区域时，为什么看得见的token反而可能没有局部语义；怎样增加监督又不把模型退化成复制输入。',
      outcomes: ['用token集合写出V-JEPA 2与2.1的prediction/context loss差异', '解释距离权重、deep self-supervision和多模态tokenizer分别修什么问题', '用数值例说明dense与global指标存在真实取舍，不能只报一个最好分数'],
      sections: [
        { heading: '01 V-JEPA 2只问被遮住的token，context可以变成全局草稿纸', body: `把视频切成N个tubelet/patch token，M是被遮住位置，C是可见位置。target encoder看完整输入并产生h_i；online encoder只处理C，predictor收到context embedding、mask token及位置，预测M中的target embedding。V-JEPA 2的损失只落在M，因此C中的某个token只要帮助预测所有mask，就未必需要保留“我来自左上角杯沿”这样的局部身份。

这不表示V-JEPA 2没有时序或语义能力。论文在动作理解和预测上给出强结果，恰恰说明全局聚合有价值；问题是局部结构不一定容易被简单probe读取。V-JEPA 2.1论文用PCA、深度和分割probe观察到这一缺口，再提出context监督。结论边界是“可提取的dense结构不足”，不是宣称原模型完全没有几何。`, formulas: [{ latex: String.raw`\mathcal L_{\mathrm{pred}}=\frac{1}{|M|}\sum_{i\in M}\left\lVert \hat h_i-\operatorname{sg}(h_i)\right\rVert_1`, explanation: 'M是masked token索引；hat h来自online encoder与predictor，h来自EMA target encoder。只对M求和意味着可见集合C没有逐位置目标。' }], sourceIds: ['vjepaPaper59', 'vjepa21Paper59', 'vjepaTrain59'] },
        { heading: '02 Dense prediction给可见token位置责任，但要防复制捷径', body: `V-JEPA 2.1让predictor在return_all_tokens模式下同时返回z_pred和z_context：前者对M计算原有预测损失，后者对C计算context loss。论文与源码都强调离mask越近的context token权重越大；这让mask边界两侧的表征保持局部连续，而不是所有可见token同权重地复制target。

若context权重太大，模型会优先做容易的可见token复制，global action recognition可能下降。论文表2正显示固定context系数提高ADE20K分割，却显著伤害SSv2；warm-up和距离加权用于折中。于是dense loss不是无条件免费午餐：它改变了容量分配，验收必须同时看局部和全局任务。`, formulas: [{ latex: String.raw`\mathcal L_{\mathrm{dense}}=\mathcal L_{\mathrm{pred}}+\frac{1}{|C|}\sum_{i\in C}\frac{\lambda}{\sqrt{d_{\min}(i,M)}}\left\lVert \hat h_i-\operatorname{sg}(h_i)\right\rVert_1`, explanation: 'd_min是context token到最近masked token的时空网格距离；距离越近权重越大。实现先算欧氏距离再开平方，loss中取倒数。' }], sourceIds: ['vjepa21Paper59', 'vjepa21Train59', 'vjepaDistance59'] },
        { heading: '03 Deep self-supervision把局部信号送进不同深度', body: `只监督最后一层时，中间层即使保留局部结构，最后层也可能为了全局语义重新压缩。2.1从多个encoder block取输出，分别layer norm后沿channel拼接，轻量映射再交给predictor；target分支也以同样层级组成h。源码的forward_target在levels_predictor>1时显式切成四段逐段归一化，loss仍逐mask和clip计算。

这和“把四层loss相加”略有差别：predictor先接收融合后的多层context，又输出与多级target对齐的通道结构。论文消融显示context loss单独改善dense任务但伤global任务，多层监督恢复相当一部分global能力。课程把它视为特定训练配方的证据，不推断任何多层拼接都必然提升机器人控制。`, sourceIds: ['vjepa21Paper59', 'vjepa21Train59', 'vjepa21Encoder59'] },
        { heading: '04 图像与视频需要不同tokenizer，动作则仍然缺席', body: `V-JEPA 2.1为图像使用16×16的2D卷积，为视频使用16×16×2的3D卷积，并加入image/video modality embedding。这样单图不必复制成16帧静态视频，既减少计算，也避免把静态图错误解释为零运动视频。配置中图像和视频来自不同worker/batch，梯度聚合后更新共享encoder。

但两条输入路径都没有机器人action。一个视频token可以保留手与物体的局部运动，却仍无法回答“若SO-101第三关节反向转动，下一状态怎样”。动作进入是明天V-JEPA 2-AC的独立后训练问题。Meta/FAIR的2/2.1/2-AC属于历史技术谱系；AMI当前只按官方的表征空间预测与动作条件world model方向记录，不能把本课checkpoint改署为AMI成果。`, sourceIds: ['vjepa21Paper59', 'vjepa21Encoder59', 'vjepa21Predictor59', 'vjepaConfig59', 'vjepaOfficial59', 'ami59'] },
      ],
      points: ['masked loss约束不可见区域，不自动让可见token保留逐位置语义。', 'context loss、距离权重和deep supervision共同改善dense/global折中。', 'image/video双tokenizer解决模态身份；动作条件仍需另一数据与模型阶段。'],
      codeTitle: 'dense_loss_counterexample.py · masked-only盲区与context补偿',
      code: [
        'import torch',
        '',
        'target=torch.tensor([[[0.,0.],[0.,1.],[1.,0.],[1.,1.]]])',
        'prediction=target.clone()',
        'prediction[:,0:2]+=1.0  # 只破坏可见context token',
        'context=torch.tensor([0,1])',
        'masked=torch.tensor([2,3])',
        '',
        'def validate_partition(c,m,n):',
        '    both=torch.cat([c,m])',
        '    if len(torch.unique(both))!=n or not torch.equal(torch.sort(both).values,torch.arange(n)):',
        '        raise ValueError("context/mask must partition token grid")',
        '',
        'def l1_at(pred,tgt,idx):',
        '    return (pred[:,idx]-tgt[:,idx].detach()).abs().mean()',
        '',
        'validate_partition(context,masked,4)',
        'loss_masked=l1_at(prediction,target,masked)',
        'loss_context=l1_at(prediction,target,context)',
        'assert loss_masked==0 and loss_context==1',
        'assert loss_masked+.5*loss_context==.5',
        '',
        'try:',
        '    validate_partition(torch.tensor([0,1,2]),torch.tensor([2,3]),4)',
        '    raise AssertionError("overlapping masks accepted")',
        'except ValueError: pass',
        'print("dense loss counterexample: PASS",float(loss_masked),float(loss_context))',
      ].join('\n'),
      codeNotes: ['4个二维token只是损失支持集的教学模型，不复制ViT、predictor或论文权重。', '正例故意只破坏context：masked-only loss完全看不见错误，加入context项后错误可测。', '负例拒绝context与mask重叠；真实collator还要保证batch内裁齐、时空索引与位置编码一致。'],
      exercise: { prompt: '有6个token，M={4,5}的平均L1为0.2，C={0,1,2,3}的逐tokenL1为[0.1,0.2,0.4,0.1]，context权重均为0.5。计算L_dense，并解释若把context系数从0.5改为2可能出现什么取舍。', steps: ['先求四个context误差的平均。', '乘context系数后与prediction loss相加。', '结合论文dense/global消融解释大系数风险。'], solution: 'context平均L1=(0.1+0.2+0.4+0.1)/4=0.2，所以L_dense=0.2+0.5×0.2=0.3。若系数为2，loss变0.6，可见token复制会占更大优化权重，局部probe可能改善，但模型可能牺牲全局动作/语义表征；必须同时报告dense与global保留集。' },
      quiz: { question: '为什么“predict_all=true”比“输出所有token”多一层训练含义？', hint: '区分张量返回值与哪些位置真正进入loss。', keywords: ['return_all_tokens', 'context loss', 'mask support', 'distance weight', 'optimization'], reference: 'predictor返回全部token只改变可访问张量；predict_all还让z_context在masks_enc上与EMA target对齐，并可按到mask的距离加权，真正改变梯度支持集和表征容量分配。若只是返回却不进loss，context token仍没有逐位置自监督。' },
      sources,
    },
    code: {
      title: '源码精读：collator→双tokenizer→多层target→全token predictor', minutes: 40,
      prerequisites: '能追踪[B,N,D]、[B,C,T,H,W]、展平token id、gather、layer_norm与detach；理解一个batch可含不同frames-per-clip分组。',
      connection: '基础课解释了2.1的四个机制；本课按固定提交还原真实调用链和索引语义。下一课会把同一dense feature接到probe与SO-101证据门，不运行上游训练或真机控制。',
      intro: '2.1最容易读错的不是Transformer层数，而是mask索引在collator、encoder、predictor和loss之间是否指向同一时空token。只看shape会漏过重叠mask、错误展平顺序、图像走视频tokenizer以及多层target通道错位。',
      outcomes: ['定位MaskCollator到load_clips、forward_target、forward_context和loss_fn的真实调用链', '说明predictor排序/逆排序为何是token语义的一部分', '运行含多层target、mask距离权重、stop-gradient和负例的原创PyTorch夹具'],
      sections: [
        { heading: '01 collator先按frames-per-clip分组，再生成可比长度mask', body: `MaskCollator读取每个sample的clip_indices推断frames-per-clip，为每个fpc选择对应_MaskGenerator。generator在duration×height×width网格采样时空块：mask_p是值为0的预测位置，mask_e是其余可见位置；batch内再截到最短keep长度，保证default_collate可堆叠。

这一步决定后面索引的坐标系。展平顺序是frame→row→column，compute_mask_distance也按同一规则把id还原为三维位置。若数据预处理把T/H/W换位而mask仍按原顺序，gather依然返回合法[B,N,D]，但监督会落在错误时空位置。负测试必须验证已知角点和相邻帧，而不只验证元素数量。`, sourceIds: ['vjepaMask59', 'vjepaDistance59'] },
        { heading: '02 encoder用模态专属patch入口，共享主体但保留身份', body: `2.1 encoder检查输入时间维：图像走patch_embed_img的2D卷积，视频走patch_embed的3D tubelet卷积；随后加入各自modality embedding、位置编码，再用apply_masks删除不可见token。共享Transformer blocks处理两种模态，但输入身份没有被抹平。

训练配置把图像与视频设为独立dataset_fpcs和batch size，分布式节点分别消费模态后聚合梯度。源码事实并不是“同一batch逐样本混图像视频”。教学实现不复制分布式调度，却要保留modality断言：单图不得靠复制T维伪装视频，16帧视频也不能误走2D路径。`, sourceIds: ['vjepa21Encoder59', 'vjepaConfig59', 'vjepa21Paper59'] },
        { heading: '03 target多层拼接，context与prediction必须同一通道合同', body: `forward_target在no_grad下运行target_encoder。levels_predictor>1时，它把每个hi沿最后一维切成四段，每段按自身embed_dim做layer_norm，再拼回4D通道；否则对完整特征归一化。online encoder与predictor必须产生相同的多层通道布局，否则loss中的广播可能掩盖错误。

predictor先把context投影到predictor维度，生成带时空位置的mask token，拼接后按原token id排序送入blocks；return_all_tokens时再逆排序，拆出x_pred与x_context，经两个projection分别回到target维度。排序不是性能优化，而是让局部attention/位置语义与mask索引重合。`, sourceIds: ['vjepa21Train59', 'vjepa21Predictor59', 'vjepa21Encoder59'] },
        { heading: '04 两个loss共享target，但支持集与权重不同', body: `loss_pred将完整target h按masks_pred抽取，与z_pred做L1；loss_context按masks_enc抽取，与z_context做加权L1。compute_mask_distance对每个context token求最近masked token的3D欧氏距离，再开平方；loss_fn乘1/d，因此边界附近权重更高。训练后仅online encoder和predictor由optimizer更新，target encoder用EMA同步。

原创夹具只复刻四个不可省略的合同：多层target逐层归一化后拼接、M/C严格分割、target detach、context距离权重。它没有实现ViT、RoPE、分布式多模态batch或官方数值，不能冒充复现结果；价值是让错索引和错误梯度在小张量上立刻失败。`, sourceIds: ['vjepa21Train59', 'vjepaDistance59', 'vjepa21Predictor59'] },
      ],
      points: ['mask索引、展平顺序和位置编码必须共享同一T/H/W语义。', '图像与视频拥有专属patch入口和modality embedding，而非静态帧复制。', '多层target、pred/context拆分和EMA共同定义2.1训练问题。'],
      codeTitle: 'vjepa21_contract.py · 多层target与时空mask合同',
      code: [
        'import torch',
        'import torch.nn.functional as F',
        '',
        'def build_target(levels):',
        '    if not levels or any(x.ndim!=3 for x in levels): raise ValueError("need [B,N,D] levels")',
        '    if len({x.shape[:2] for x in levels})!=1: raise ValueError("token grids differ")',
        '    return torch.cat([F.layer_norm(x,(x.shape[-1],)) for x in levels],dim=-1).detach()',
        '',
        'def validate_masks(context,masked,n):',
        '    ids=torch.cat([context,masked])',
        '    if ids.numel()!=n or ids.min()<0 or ids.max()>=n or len(torch.unique(ids))!=n:',
        '        raise ValueError("masks must be a disjoint full partition")',
        '',
        'level1=torch.tensor([[[1.,0.],[0.,1.],[2.,0.],[0.,2.]]])',
        'level2=torch.tensor([[[1.,3.],[2.,0.],[0.,2.],[3.,1.]]])',
        'target=build_target([level1,level2])',
        'context=torch.tensor([0,1])',
        'masked=torch.tensor([2,3])',
        'validate_masks(context,masked,4)',
        '',
        'pred=target.clone().requires_grad_(True)',
        'with torch.no_grad():',
        '    pred[:,2]+=1.0',
        '    pred[:,0]+=.5',
        'coords=torch.tensor([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])',
        'distance=torch.cdist(coords[context],coords[masked]).min(dim=1).values.sqrt()',
        'weights=.5/distance.clamp_min(1e-6)',
        'loss_pred=(pred[:,masked]-target[:,masked]).abs().mean()',
        'per_context=(pred[:,context]-target[:,context]).abs().mean(dim=(0,2))',
        'loss_context=(per_context*weights).mean()',
        'loss=loss_pred+loss_context',
        'loss.backward()',
        'assert target.requires_grad is False and pred.grad[:,2].abs().sum()>0',
        'assert pred.grad[:,0].abs().sum()>0 and pred.grad[:,1].abs().sum()==0',
        '',
        'try:',
        '    validate_masks(torch.tensor([0,1,2]),torch.tensor([2,3]),4)',
        '    raise AssertionError("overlap accepted")',
        'except ValueError: pass',
        'print("V-JEPA 2.1 contract: PASS",float(loss_pred),float(loss_context))',
      ].join('\n'),
      codeNotes: ['build_target用两个层级代替官方四层，并保留逐层layer_norm、channel拼接和stop-gradient。', '2×2坐标代替T×H×W网格；权重形式保留到最近mask的距离开平方再取倒数。', '梯度断言同时验证masked token、出错context token和正确context token；负例拒绝mask重叠。'],
      exercise: { prompt: '视频为T=4、H=W=32，tubelet=2、patch=16。求token数和展平id=5对应的(t,h,w)。若mask={5}，context token id=1到它的三维欧氏距离与论文权重lambda/sqrt(d)（lambda=0.5）是多少？', steps: ['先算网格2×2×2共8个token。', '按id=t×4+h×2+w分解。', '求两点欧氏距离，再代入权重。'], solution: 'id=5：t=floor(5/4)=1，余1，所以h=0、w=1，即(1,0,1)。id=1为(0,0,1)，欧氏距离d=1；权重0.5/sqrt(1)=0.5。这里d的单位是token格，不是秒或像素。' },
      quiz: { question: '为什么把图像复制成16帧再送3D patch embed，与2.1的image tokenizer不等价？', hint: '比较卷积核、计算量、模态偏置与embedding。', keywords: ['2D tokenizer', '3D tokenizer', 'static duplication', 'modality embedding', 'bias'], reference: '复制静态帧会让3D tubelet卷积把图像解释为零运动视频，增加时间维计算并引入错误模态先验；2.1用独立2D patch embedding和image modality embedding处理原生图像，再与视频路径共享主体和梯度。' },
      sources,
    },
    insight: {
      title: '路线洞察：dense feature要经局部probe、动作反事实与闭环三次验真', minutes: 25,
      prerequisites: '掌握两类loss、mask网格与冻结encoder probe；能记录SO-101相机时间戳、动作、关节状态、成功谓词和人工介入。',
      connection: '前两课解释dense表征如何训练与实现；路线课决定它对RAW/深度经验和SO-101作品能提出哪些有限主张。明天进入动作条件V-JEPA 2-AC，只有通过本课probe的状态量才值得进入planner cost。',
      intro: '“特征图更平滑”是可视化，不是机器人证据。对个人项目最省算力的用法不是从零训练2B encoder，而是冻结同一checkpoint，在同一时间窗上检查哪些局部物理量能被读出、哪些在扰动下保持、哪些最终改变动作排序和闭环结果。',
      outcomes: ['设计局部几何、接触前兆和时间一致性probe', '把RAW/深度增益与相机泄漏、时移和带宽混杂分开', '用双团队研究线构造压力测试但保持组织与技术归属边界'],
      sections: [
        { heading: '01 三层验真不能跳级：可解码、可干预、可闭环', body: `第一层冻结encoder，只训练同容量probe：预测夹爪—物体像素/深度间隙、接触前时间、目标mask和遮挡后身份，并报告随机/位置编码/上一帧基线。dense feature若只在分割上好，却不能读出接触前兆，就不能进入控制论证。

第二层固定观测，替换零、相反、置乱和时移动作，检查动作条件模型的未来latent与候选排序是否改变；这一步不属于无动作V-JEPA 2.1本身。第三层才在安全评审后的受控闭环中比较成功、介入、近失和p99时延。probe好只证明表征可用，反事实好才证明动作后果可辨，闭环好才证明系统有效。`, sourceIds: ['vjepa21Paper59', 'vjepaPaper59', 'behaviorEval59'] },
        { heading: '02 RAW、HDR与深度应瞄准会改变动作的局部歧义', body: `用户已有RAW/感知经验，可选的高价值难例包括高光夹爪边缘、透明物体轮廓、黑色物体与阴影粘连、运动模糊下的接触点。采集RGB、线性RAW/HDR、depth与关节状态的同时间戳配对，分别训练相同probe；再做模态缺失、时间平移、随机噪声和同带宽假通道，排除“多一个输入就更好”。

如果RAW只提高静态边缘IoU，却增加40 ms预处理并让接触前200 ms的time-to-contact误差不变，就保留为离线诊断工具，不进入实时策略。若深度改善局部probe但在跨相机外参扰动下崩溃，先修标定/坐标契约。dense feature的价值要落实到具体物理量和动作时刻，不用PCA颜色图代替。`, sourceIds: ['vjepa21Paper59', 'atlas59', 'r2s2r59'] },
        { heading: '03 双团队主线提供不同压力源，不能互相背书', body: `StanfordVL的BEHAVIOR-1K/OmniGibson提供BDDL目标、对象状态、隐藏实例和Q-score，可检查局部表征是否保留任务谓词；World Labs的Atlas/R2S2R提供空间重建、相机位姿、深度和可控real-to-sim变体，可生成视角/外观/物理压力测试。两者是李飞飞相关但组织与证据类型不同：World Labs生成质量不能冒充Stanford基准成绩。

LeCun谱系中，V-JEPA 2/2.1是Meta/FAIR的无动作视觉表征成果，V-JEPA 2-AC和JEPA-WM才显式研究动作条件预测/规划；AMI Labs当前官网给出表征空间预测、动作条件world model与安全方向，但没有把本课固定提交改成AMI发布。课程只用一手关联保持技术连续，不用人物履历替代输入、预测对象、动作入口与评测。`, sourceIds: ['behaviorEval59', 'atlas59', 'r2s2r59', 'vjepaOfficial59', 'ami59'] },
        { heading: '04 用最弱证据门选择SO-101下一步', body: `把四项指标归一化为[0,1]：局部几何probe q_geo、接触前兆q_contact、跨扰动跟踪q_track、加入固定action head后的闭环q_loop，定义G为四者最小值。例：V-JEPA 2.1候选[0.84,0.63,0.79,0.58]，G=0.58；即使前三项平均0.75，也不能进入无人值守真机。

个人路线先做冻结probe和离线回放，只有相对RGB基线的置信区间稳定、负例不过拟合、p99时延合格，才接小action head；再与当前SmolVLA/BC基线在相同episode和动作预算下比较。阈值由任务损坏后果倒推，本课示例0.75只是教学值。本自动化不控制机械臂、不代替安全评审。`, formulas: [{ latex: String.raw`G=\min\{q_{\mathrm{geo}},q_{\mathrm{contact}},q_{\mathrm{track}},q_{\mathrm{loop}}\}`, explanation: '四项均归一化到0至1；最小值门防止漂亮的dense probe平均掉接触或闭环失败。它是课程验收框架，不是Meta、StanfordVL或World Labs官方指标。' }], sourceIds: ['vjepa21Paper59', 'behaviorEval59', 'r2s2r59'] },
      ],
      points: ['冻结probe回答信息是否可读，动作反事实回答后果是否可辨，闭环回答系统是否有效。', 'RAW/深度只有修复动作相关歧义且不过时，才值得进入在线路径。', 'StanfordVL、World Labs、Meta/FAIR与AMI的组织和证据边界必须分别标注。'],
      codeTitle: 'dense_feature_gate.py · 局部表征到闭环的最弱项门',
      code: [
        'def evaluate(candidate,threshold=.75):',
        '    required=("geometry","contact","tracking","closed_loop")',
        '    if set(candidate)!=set(required): raise ValueError("incomplete evidence")',
        '    if any(not 0<=candidate[k]<=1 for k in required): raise ValueError("score range")',
        '    weakest=min(required,key=lambda k:candidate[k])',
        '    score=candidate[weakest]',
        '    return score,weakest,score>=threshold',
        '',
        'dense={"geometry":.84,"contact":.63,"tracking":.79,"closed_loop":.58}',
        'baseline={"geometry":.70,"contact":.68,"tracking":.69,"closed_loop":.70}',
        'gd,wd,pd=evaluate(dense)',
        'gb,wb,pb=evaluate(baseline)',
        'assert (gd,wd,pd)==(.58,"closed_loop",False)',
        'assert (gb,wb,pb)==(.68,"contact",False)',
        'assert sum(dense.values())/4>sum(baseline.values())/4 and not pd',
        '',
        'try:',
        '    evaluate({"geometry":.9,"tracking":.9,"closed_loop":.9})',
        '    raise AssertionError("missing contact evidence accepted")',
        'except ValueError: pass',
        'print("dense feature gate: PASS",gd,wd,gb,wb)',
      ].join('\n'),
      codeNotes: ['分数是归一化教学输入；真实报告必须附样本数、置信区间、阈值和原始单位。', 'dense候选平均分更高却卡在closed_loop，证明probe优势不能自动替代系统效果。', '负例拒绝缺少contact证据的候选；代码仅做离线审核，不触发机械臂。'],
      exercise: { prompt: '候选A的[geometry,contact,tracking,closed_loop]=[0.82,0.77,0.80,0.74]，候选B为[0.76,0.78,0.77,0.79]，阈值0.75。谁可晋级？为A设计最小补证实验。', steps: ['分别取最小值。', '不要用平均分补偿最弱项。', '最小实验只改变与失败门直接相关的证据。'], solution: 'A的G=0.74，卡在closed_loop，不晋级；B的G=0.76，可进入下一层受控测试，但不等于已证明安全。A应固定数据、动作head、候选动作和时延预算，只比较表征替换前后的离线回放与受控闭环，复核成功、介入、近失和置信区间；继续调geometry probe不能修复该缺口。' },
      quiz: { question: 'V-JEPA 2.1的dense probe优于V-JEPA 2时，为什么仍要与RGB/RAW/深度基线做同时间戳配对？', hint: '考虑数据、时延、标定和动作相关性混杂。', keywords: ['paired data', 'timestamp', 'latency', 'calibration', 'action relevance'], reference: '不同采集时刻、视角、预处理时延或标定会把数据差异冒充表征增益；同时dense benchmark改善未必覆盖SO-101接触前兆。只有同时间戳、同split、同容量probe和负例配对，才能判断RAW/深度或JEPA特征是否真的保留动作相关局部状态。' },
      sources,
    },
  },
};
