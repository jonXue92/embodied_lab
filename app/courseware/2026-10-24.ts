import type { AuthoredDay } from './types';

const lingbotCommit = '4eb34b7693a0565c67433f8fac9c59a2e67eb60b';
const lingbotRoot = 'https://github.com/Robbyant/lingbot-vla/blob/' + lingbotCommit;
const depthCommit = 'a561b849ebae10a6f5ef49e26c83cbbcd36c71bf';
const depthRoot = 'https://github.com/DepthAnything/Depth-Anything-V2/blob/' + depthCommit;

const sources = [
  { id: 'dav2paper54', label: 'Depth Anything V2论文', url: 'https://arxiv.org/abs/2406.09414', reading: '2026-10-21 实读方法、数据和损失：先用精确合成深度训练强teacher，再给真实图像生成伪标签；基础模型学习仿射不变逆深度，metric版本另行微调。论文使用595K合成标注与62M伪标注真实图像，并忽略teacher损失最高的10%区域。' },
  { id: 'dav2code54', label: 'Depth Anything V2 dpt.py（固定提交）', url: depthRoot + '/depth_anything_v2/dpt.py', reading: '2026-10-21 逐段实读DepthAnythingV2.forward、infer_image和image2tensor：DINOv2中间层进入DPT head，输出经ReLU；输入先BGR转RGB、归一化、按14倍数缩放，输出再双线性插值回原图H×W。' },
  { id: 'dav2transform54', label: 'Depth Anything V2 transform.py（固定提交）', url: depthRoot + '/depth_anything_v2/util/transform.py', reading: '2026-10-21 实读Resize、NormalizeImage与PrepareForNet：图像使用cubic resize，随样本携带的depth/mask使用nearest，最后转连续CHW float32；这解释了几何标签不能照搬图像插值。' },
  { id: 'dav2readme54', label: 'Depth Anything V2 README（固定提交）', url: depthRoot + '/README.md', reading: '2026-10-21 核对相对/metric模型、infer_image返回H×W NumPy深度及Small/Base/Large参数量；Small为Apache-2.0，Base/Large/Giant为CC-BY-NC-4.0，选型时必须同时审查用途与许可证。' },
  { id: 'lingbotmodel54', label: 'LingBot-VLA模型源码（固定提交）', url: lingbotRoot + '/lingbotvla/models/vla/pi0/modeling_lingbot_vla.py', reading: '2026-10-21 复核LingbotVlaPolicy.forward、FlowMatching.depth_emb_forward与sample_actions：深度teacher监督发生在训练forward，公开采样签名仍是RGB、mask、语言和state。' },
  { id: 'lingbotconfig54', label: 'LingBot-VLA深度训练配置（固定提交）', url: lingbotRoot + '/configs/vla/real_load20000h_depth.yaml', reading: '2026-10-21 复核depth_loss_weight=0.004、teacher/query设置和三相机字段；配置说明checkpoint训练身份，不证明SO-101运行时深度传感器收益。' },
  { id: 'ogsensor54', label: 'StanfordVL · OmniGibson Sensors', url: 'https://behavior.stanford.edu/omnigibson/sensors.html', reading: '2026-10-21 实读VisionSensor模态：depth与depth_linear都为H×W float32，但语义不同，且与RGB、法线、分割、光流等并列；属于StanfordVL仿真传感器契约。' },
  { id: 'atlasdocs54', label: 'World Labs · Atlas使用文档', url: 'https://marble5.worldlabs.ai/docs/how-to-use-atlas', reading: '2026-10-21 实读posed RGB、camera与depth必须保持对齐，PNG/EXR、坐标和单位需显式处理；Atlas生成的metric scale为预测/近似量，不能当作真机标定真值。' },
  { id: 'vjepar54', label: 'Meta/FAIR · V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-21 复核其历史线是视频表征与动作条件预测，可作RGB表征基线；它不是LingBot深度teacher，也不属于AMI当前发布。' },
  { id: 'ami54', label: 'AMI Labs官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-21 复核当前公开方向为抽象表征空间预测、动作条件世界模型、可靠性与安全；官网方向不等于已发布深度checkpoint或SO-101实验。' },
];

export const day54: AuthoredDay = {
  reviewedAt: '2026-10-21',
  revision: '逐课编写 1.0',
  deliverable: '一张运行时深度、离线伪深度与训练期深度蒸馏的三分图；一个相对逆深度对齐与有/无深度checkpoint运行卡夹具；一份SO-101传感器成本—几何收益晋级决策。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '同样写着depth，深度相机、Depth Anything输出和LingBot深度版checkpoint为什么不能直接互换？',
    summary: '先识别几何量、尺度、时间对齐和训练/部署身份。',
    keywords: ['z-depth', 'inverse depth', 'affine ambiguity', 'pseudo label', 'distillation', 'checkpoint A/B'],
    reference: '深度相机给出带标定、噪声和时间戳的运行时测量；Depth Anything基础模型给出仿射不变逆深度排序，metric模型也需核对尺度域；LingBot深度版把teacher token作为训练监督，公开推理仍是RGB。三者只有在坐标、单位、有效mask、时间同步和接口都明示后才能建立转换，名称相同不构成可替换证据。',
  },
  lessons: {
    foundation: {
      title: '深度的三种身份：运行时传感器、伪标签与表征教师',
      minutes: 35,
      prerequisites: '会使用针孔相机内参，理解10-23的LingBot训练期深度蒸馏与RGB推理边界。',
      connection: '昨天确认LingBot深度版在训练forward增加teacher token监督；今天把“深度”拆成物理测量、离线估计与表征约束。明天再把这种模态身份落实为跨本体adapter契约。',
      intro: '深度不是一个可随意交换的H×W数组。机器人系统至少要问四件事：像素表示的是光轴z、射线距离还是逆深度；数值是否有米制尺度；它来自运行时传感器、离线单目模型还是训练teacher；它与RGB、相机位姿和动作时刻是否对齐。先回答这些问题，才有资格比较有/无深度checkpoint。',
      outcomes: ['区分z-depth、射线距离、相对逆深度与metric depth', '解释单目仿射不确定性并用锚点恢复可解释尺度', '画出传感器、伪标签和蒸馏teacher的不同数据流'],
      sections: [
        { heading: '01 H×W相同不代表几何语义相同', body: `针孔投影常把depth定义为相机光轴方向的z。像素(u,v)与内参(fx,fy,cx,cy)反投影为X=(u-cx)z/fx、Y=(v-cy)z/fy、Z=z；射线距离r则是相机中心到点的欧氏距离，离主点越远，r与z差越大。若把r直接塞进z公式，点云边缘会被系统性拉伸。

数值例取fx=fy=600像素、cx=320、cy=240，像素(380,270)的z=0.8米，则X=0.08米、Y=0.04米、Z=0.8米，射线距离约0.805米。差看似小，但广角边缘、近距离抓取和多相机融合会累积。OmniGibson把depth与depth_linear列成不同模态，正是在提醒消费者不能只按shape猜语义；真实相机还要记录无效值、裁剪范围、内参版本和时间戳。`, formulas: [{ latex: 'X=((u-c_x)z)/(f_x), Y=((v-c_y)z)/(f_y), Z=z, r=(X^2+Y^2+Z^2)^{1/2}', explanation: 'z是光轴深度，r是射线距离。例中点为(0.08,0.04,0.8)米，r约0.805米；二者不能仅因单位都是米就混用。' }], sourceIds: ['ogsensor54', 'atlasdocs54'] },
        { heading: '02 相对逆深度先有排序，再谈米制阈值', body: `Depth Anything V2基础模型输出的是仿射不变逆深度：预测p可以与真实1/z存在比例a和偏移b。它很适合判断谁近谁远，却不能未经校准就执行“距离小于0.25米停止”。metric模型经过专门数据微调，仍需核对数据域、相机与量程，不应把文件名里的metric当成现场标定证书。

可以在同一帧用有效锚点拟合p≈a/z+b，再将(aligned inverse depth-b)/a转换；拟合必须排除零值、饱和、反光和动态错位像素。例：真实z为0.5和1.0米，模型p为3和1，解得a=2、b=-1；若第三点p=1.667，则z约0.75米。只有一个锚点无法同时确定a、b，常数预测也使方程退化，这两种失败都应被测试拒绝。`, formulas: [{ latex: 'p_i=a z_i^{-1}+b, (a_{fit},b_{fit})=argmin_{a,b} sum_{i in V} rho(p_i-a/z_i-b)', explanation: 'p是相对逆深度，V是有效锚点集合，ρ可取稳健损失。两个不重复锚点才能解比例与偏移；拟合后仍需报告残差和适用帧。' }], sourceIds: ['dav2paper54', 'dav2readme54'] },
        { heading: '03 三条depth数据流解决不同问题', body: `运行时深度传感器在控制环每帧产生测量，收益可能来自遮挡边界或尺度，成本是硬件、同步、标定、带宽和失效模式。离线伪深度由单目模型从训练RGB推断，可为数据加几何排序或teacher目标；它不会在部署时增加传感器，却会继承模型偏差。训练期蒸馏则把teacher token约束学生表征，teacher甚至可以不输出可解释的米制图。

LingBot固定源码属于第三类：depth_emb_forward让query预测冻结teacher token，sample_actions仍只接RGB/mask、语言和state。因此比较其有/无深度checkpoint是在问训练监督是否留下可迁移几何表征，不是在比较RGB相机与RGB-D相机。若另加真实深度输入，就是新的adapter、同步与训练问题，不能拿原checkpoint名称代替接口证据。`, sourceIds: ['lingbotmodel54', 'lingbotconfig54', 'dav2paper54'] },
        { heading: '04 数据工程要保存身份、变换和许可证', body: `Depth Anything V2的image2tensor先把OpenCV BGR转RGB、除以255、按14的倍数缩放并做ImageNet归一化；infer_image把网络输出双线性插值回原图。配套transform在联合样本中对图像用cubic，对depth和mask用nearest。教学管线应记录原始尺寸、resize矩阵、插值方式、模型提交、权重种类和有效mask，避免把平滑后的彩色图与错位几何标签混合。

开源也不是统一使用许可：官方README标明Small为Apache-2.0，而Base/Large/Giant为CC-BY-NC-4.0。Atlas的posed RGB、camera与depth同样要求保持对齐，其预测尺度不能冒充真机标定。StanfordVL仿真传感器、World Labs空间模型、Meta/FAIR历史表征与AMI当前方向分别记账；它们能提供外部对照，不能互相归属或替SO-101闭环背书。`, sourceIds: ['dav2code54', 'dav2transform54', 'dav2readme54', 'atlasdocs54', 'vjepar54', 'ami54'] },
      ],
      points: ['先声明深度的几何语义、单位、坐标和有效mask。', '相对逆深度不能未经尺度/偏移对齐就使用米制阈值。', '运行时传感器、离线伪标签与训练teacher是三种不同因果路径。'],
      codeTitle: 'depth_identity.py · 逆深度锚点对齐与针孔反投影',
      code: [
        'def fit_two_anchors(z1,p1,z2,p2):',
        '    if min(z1,z2)<=0: raise ValueError("depth must be positive")',
        '    x1,x2=1.0/z1,1.0/z2',
        '    if abs(x1-x2)<1e-9: raise ValueError("anchors are degenerate")',
        '    a=(p1-p2)/(x1-x2); b=p1-a*x1',
        '    if abs(a)<1e-9: raise ValueError("prediction has no scale")',
        '    return a,b',
        '',
        'def metric_from_relative(p,a,b):',
        '    inv=(p-b)/a',
        '    if inv<=0: raise ValueError("non-positive inverse depth")',
        '    return 1.0/inv',
        '',
        'a,b=fit_two_anchors(.5,3.,1.,1.)',
        'assert abs(a-2.)<1e-9 and abs(b+1.)<1e-9',
        'assert abs(metric_from_relative(5/3,a,b)-.75)<1e-9',
        'u,v,fx,fy,cx,cy,z=380,270,600,600,320,240,.8',
        'xyz=((u-cx)*z/fx,(v-cy)*z/fy,z)',
        'assert xyz==(.08,.04,.8)',
        'try:',
        '    fit_two_anchors(1.,2.,1.,3.)',
        '    raise AssertionError("degenerate anchors accepted")',
        'except ValueError: pass',
        'print("depth identity: PASS")',
      ].join('\n'),
      codeNotes: ['两锚点闭式解只用于暴露scale/shift契约；真实数据应使用更多锚点、稳健损失和残差检查。', '正例恢复0.75米并核对针孔反投影，负例拒绝无法估计两个参数的退化锚点。', '代码不读取相机、不调用模型，也不把相对深度伪装成安全距离。'],
      exercise: { prompt: '模型输出p=5和1分别对应真实z=0.4米与0.8米。求a、b；当p=3时估计z。', steps: ['把z变为逆深度2.5和1.25。', '解两元一次方程。', '代回p=3。'], solution: '5=2.5a+b、1=1.25a+b，得a=3.2、b=-3；p=3时1/z=(3+3)/3.2=1.875，所以z约0.533米。该结果只在同一校准条件与有效域内成立。' },
      quiz: { question: '为什么Depth Anything基础模型的H×W输出不能直接作为SO-101的米制碰撞阈值？', hint: '区分数组形状、逆深度语义与scale/shift。', keywords: ['affine invariant', 'inverse depth', 'scale', 'shift', 'metric calibration', 'valid mask'], reference: '基础模型学习仿射不变逆深度，输出p与1/z之间仍有未知比例和偏移；resize回原分辨率只恢复shape，不恢复米制。必须用有效锚点或经验证的metric模型确定尺度、偏移、坐标、误差和失效域，再谈控制阈值。' },
      sources,
    },
    code: {
      title: '源码精读：设计有深度和无深度checkpoint对比',
      minutes: 40,
      prerequisites: '会读PyTorch张量、最小二乘、checkpoint元数据与配对实验；理解训练teacher不等于推理输入。',
      connection: '把深度身份转成可归因的A/B运行卡：唯一允许变化的是训练监督或指定checkpoint，其他输入、adapter和评测轨迹保持一致。',
      intro: '公平对比不是加载两个文件各跑一次。要从真实源码入口记录预处理与checkpoint身份，冻结数据切分、种子、动作adapter、推理步数和运行环境，再按同一轨迹做配对评测。今天的PyTorch夹具同时验证相对逆深度对齐和运行卡守卫，目的不是复现大模型，而是让偷换变量立即失败。',
      outcomes: ['定位Depth Anything V2与LingBot的真实函数调用链', '写出可机检的A/B不变量和checkpoint指纹', '用正负测试阻止退化对齐与运行卡偷换变量'],
      sections: [
        { heading: '01 从image2tensor追到原图深度，而不是只看README调用', body: `DepthAnythingV2.infer_image先保存原H、W，调用image2tensor；后者执行Resize、NormalizeImage、PrepareForNet并增加batch维。forward从DINOv2指定中间层取特征，经DPTHead融合后ReLU并squeeze channel；infer_image再用bilinear插值回原H×W，最后转CPU NumPy。

这条链决定输入是BGR还是RGB、网络看到的尺寸以及输出插值。若训练标签与RGB共同几何变换，源码transform对image用cubic、对depth/mask用nearest；不能把可视化插值当作标签真值。运行卡必须记录固定提交a561b84、encoder/权重、相对或metric身份、输入尺寸与变换版本，否则两个checkpoint的差可能只是预处理差。`, sourceIds: ['dav2code54', 'dav2transform54', 'dav2readme54'] },
        { heading: '02 LingBot A/B比较的是训练身份，不改公开采样接口', body: `固定LingBot源码的训练链是LingbotVlaPolicy.forward进入FlowMatching.forward；深度配置还调用depth_emb_forward并把加权Smooth L1辅助项加到动作loss。推理链是LingbotVlaPolicy.select_actions进入sample_actions，公开参数没有raw depth。A可定义为无深度checkpoint，B为深度蒸馏checkpoint，但两者推理都必须接相同有序RGB、mask、语言、state和动作归一化。

必须保存checkpoint内容哈希或官方版本、config哈希、数据清单、adapter版本与源码提交，而不是只保存文件名。若B顺便换成更多相机、更长训练或新数据，结果只能称“系统组合差”，不能归因于深度蒸馏。若权重结构不兼容，应先报告不可比，不能静默strict=False吞掉缺失键后继续算分。`, sourceIds: ['lingbotmodel54', 'lingbotconfig54'] },
        { heading: '03 成对轨迹与分组指标减少环境噪声', body: `建立固定episode manifest：每条记录包含场景、初始状态、任务文本、相机顺序、风险组和种子。A、B在同一episode顺序与同一控制预算下执行；随机策略需锁定起始噪声。主指标是每个episode的成对差d_i=y_i^B-y_i^A，再按低纹理、遮挡、反光、尺度变化和普通组汇总，而不是只比较两个总体均值。

例如同一10个低纹理episode里A成功4次、B成功6次，配对提升是0.2；但样本太小，不能写成稳定提升。应对episode做配对bootstrap或报告Wilson区间，并列出A失败/B成功与反向案例。离线动作误差、仿真成功和真机成功分别报告，不能用Depth Anything视觉效果好看替代操作因果证据。`, formulas: [{ latex: 'Delta_g=(1/n_g) sum_{i in g}(y_i^B-y_i^A), y_i in {0,1}', explanation: 'Δg是风险组g的成对成功率差。同一episode相减可消去部分初始难度；仍需区间与反向失败案例，不能只报点估计。' }], sourceIds: ['lingbotmodel54', 'dav2paper54'] },
        { heading: '04 运行卡守卫要先于汇总脚本', body: `每次运行卡至少包含dataset_manifest、split、adapter、camera_order、action_schema、seed、solver_steps、source_commit和checkpoint_id。比较函数先断言除checkpoint_id与预先声明的treatment外字段完全相等，再读取episode结果；任何缺项、顺序差或重复episode都应停止，而不是补默认值。

对深度对齐也要做退化守卫：有效像素不少于阈值、预测有方差、最小二乘矩阵满秩、metric depth为正。教学代码用torch.linalg.lstsq拟合pred≈a/depth+b，并用共同mask计算残差；正例恢复已知参数，负例用常数预测触发秩不足。它验证数学契约，不下载权重、不上传数据，也不连接机械臂。`, sourceIds: ['dav2code54', 'lingbotmodel54'] },
      ],
      points: ['固定源码、权重、预处理、adapter与episode manifest后才有A/B。', 'LingBot深度版和无深度版公开推理输入应保持一致。', '成对分组效果、区间和反向失败比总体均值更有解释力。'],
      codeTitle: 'depth_ab_contract.py · PyTorch对齐与运行卡守卫',
      code: [
        'import torch',
        '',
        'def align_relative(pred,metric,valid):',
        '    if pred.shape!=metric.shape or valid.shape!=pred.shape:',
        '        raise ValueError("shape mismatch")',
        '    keep=valid.bool() & torch.isfinite(pred) & torch.isfinite(metric) & (metric>0)',
        '    p=pred[keep].double(); y=(1.0/metric[keep]).double()',
        '    if p.numel()<3 or torch.var(p)<1e-12: raise ValueError("degenerate anchors")',
        '    x=torch.stack((y,torch.ones_like(y)),dim=1)',
        '    if torch.linalg.matrix_rank(x)<2: raise ValueError("rank deficient")',
        '    coef=torch.linalg.lstsq(x,p.unsqueeze(1)).solution[:,0]',
        '    return coef,torch.mean(torch.abs(x@coef-p))',
        '',
        'def assert_comparable(a,b):',
        '    fixed=("dataset_manifest","split","adapter","camera_order","action_schema","seed","solver_steps","source_commit")',
        '    missing=[k for k in fixed if k not in a or k not in b]',
        '    if missing: raise ValueError("missing "+str(missing))',
        '    changed=[k for k in fixed if a[k]!=b[k]]',
        '    if changed: raise ValueError("confounded "+str(changed))',
        '    if a.get("checkpoint_id")==b.get("checkpoint_id"):',
        '        raise ValueError("same checkpoint")',
        '    return True',
        '',
        'metric=torch.tensor([.5,1.,2.,4.])',
        'pred=2./metric-1.; valid=torch.ones(4,dtype=torch.bool)',
        'coef,mae=align_relative(pred,metric,valid)',
        'assert torch.allclose(coef,torch.tensor([2.,-1.],dtype=torch.float64),atol=1e-8) and mae<1e-8',
        'base={"dataset_manifest":"sha256:x","split":"test-v1","adapter":"so101-v3","camera_order":["wrist","front"],"action_schema":"delta-rad","seed":7,"solver_steps":10,"source_commit":"4eb34b7","checkpoint_id":"rgb"}',
        'deep=dict(base,checkpoint_id="depth-distilled")',
        'assert assert_comparable(base,deep)',
        'try:',
        '    align_relative(torch.ones(4),metric,valid)',
        '    raise AssertionError("constant prediction accepted")',
        'except ValueError: pass',
        'try:',
        '    assert_comparable(base,dict(deep,solver_steps=20))',
        '    raise AssertionError("confounded card accepted")',
        'except ValueError: pass',
        'print("depth A/B contract: PASS")',
      ].join('\n'),
      codeNotes: ['lstsq拟合pred=a/depth+b，返回参数与有效锚点MAE；真实项目还需稳健拟合和独立验证帧。', '运行卡只允许checkpoint身份变化；负例拒绝同时改变solver步数的混杂比较。', '夹具使用CPU PyTorch实际执行，不加载外部模型或任何客户数据。'],
      exercise: { prompt: 'A、B在同一20个遮挡episode上分别成功9和12次，其中A失败/B成功5次、A成功/B失败2次。成对提升是多少？为什么不能只写“提升33%”？', steps: ['用(5-2)/20计算配对差。', '区分百分点与相对比例。', '判断样本量与区间。'], solution: '成对成功率差为3/20=0.15，即15个百分点。12/9-1约33%是相对成功次数变化，容易掩盖总样本和反向失败；20条样本区间很宽，必须报告配对明细、置信区间并继续复验。' },
      quiz: { question: '有/无深度checkpoint公平A/B中，哪些变量必须完全固定，哪些结果必须分组报告？', hint: '从输入、adapter、推理预算、episode配对和风险组回答。', keywords: ['manifest', 'adapter', 'camera order', 'solver steps', 'paired episodes', 'risk groups'], reference: '固定数据清单与split、RGB及相机顺序、文本/state、动作schema与adapter、种子/起始噪声、solver步数、源码和评测预算；只切换已核验的checkpoint训练身份。按同一episode配对，并在低纹理、遮挡、反光、尺度变化和普通组报告差值、区间及反向失败。' },
      sources,
    },
    insight: {
      title: '何时值得给SO-101增加深度：收益、成本与失效域',
      minutes: 25,
      prerequisites: '能区分训练监督和部署模态，并能读取分组成功率、p95时延与成本清单。',
      connection: '将A/B证据转成传感器采购与部署决策；明天进入跨本体表征和adapter时，继续把模态、字段、单位与时间同步写成显式契约。',
      intro: '是否增加深度不能靠“几何更丰富”一句话决定。低成本路径是先建立RGB基线，再尝试离线伪深度或训练期蒸馏；只有关键风险组出现稳定闭环收益，且收益无法由RGB与校准改进获得，才值得承担运行时深度传感器的硬件、同步、带宽和维护成本。',
      outcomes: ['列出运行时深度的完整成本栈与典型失效域', '用风险加权效用而非总体均值做晋级', '建立RGB、离线teacher、运行时RGB-D三阶段证据门'],
      sections: [
        { heading: '01 成本不止传感器价格，还包括每帧对齐债务', body: `运行时RGB-D要增加硬件、电源、安装刚度、内外参标定、曝光/深度同步、数据带宽、记录容量、推理输入和线上健康监控。相机被碰撞后外参漂移、深度帧迟到或无效像素激增，都可能让shape正常但语义错误；因此部署卡应记录depth age、RGB-depth skew、valid ratio、温度与标定版本。

如果一帧RGB为640×480×3 uint8约0.92 MB，同尺寸float32 depth约1.23 MB；30 Hz原始流量分别约27.6和36.9 MB/s，加入depth使这两路原始负载从27.6增至约64.5 MB/s，尚未计时间戳、压缩和其他相机。SO-101小系统常先受USB、CPU复制和日志写盘限制，而不是模型参数限制。`, formulas: [{ latex: 'R=H W C b f, R_{RGB+D}=H W (3 times 1+1 times 4) f', explanation: 'H、W为分辨率，C为通道，b为每元素字节，f为帧率。640×480、30 Hz时RGB约27.6 MB/s，float32 depth约36.9 MB/s。' }], sourceIds: ['ogsensor54', 'atlasdocs54'] },
        { heading: '02 主动深度也有失效域，单目伪深度也有域偏差', body: `主动深度在反光、透明、黑色吸光、强阳光、最小量程外和多机干扰时可能产生空洞或飞点；单目模型在镜面、极端视角、相似纹理和新相机域也可能把语义先验误作几何。两者不是“真值与假值”的简单二分，必须保存valid mask、置信度与RGB回退路径。

训练期蒸馏的优势是部署不增加传感器和时延，风险是teacher偏差被写进表示；运行时RGB-D能提供当前尺度，风险是同步和硬件失效。Atlas生成的对齐RGB/depth可用来构造视角与空间压力测试，但其预测尺度是近似量；OmniGibson传感器可提供受控真值，却仍与真实材料噪声有sim-to-real差距。`, sourceIds: ['dav2paper54', 'ogsensor54', 'atlasdocs54'] },
        { heading: '03 用风险加权下界而不是平均分决定采购', body: `设关键组g权重w_g、B相对A的成功率提升下界LCB_g，运行时总成本C归一化到0到1，p95数据年龄为L、预算为T。可用效用U=Σw_g·LCB_g-λC-μ·max(0,(L-T)/T)。只有U为正、普通组无明显退化且安全失败不增加，才进入下一阶段。

数值例：低纹理和遮挡权重0.6/0.4，提升下界0.12/0.05，收益0.092；若成本C=0.20、λ=0.25，成本项0.05，L=90 ms不超100 ms预算，则U=0.042。若p95升至140 ms且μ=0.2，超时罚0.08，U变为-0.038，应拒绝运行时方案，即使总体均值上升。权重和罚系数必须在看结果前约定。`, formulas: [{ latex: 'U=sum_g w_g LCB(Delta_g)-lambda C-mu max(0,(L-T)/T)', explanation: 'LCB使用提升的置信下界而非点估计；C表示全生命周期成本，L/T惩罚超出时延预算。例中及时方案U=0.042，p95为140 ms时U=-0.038。' }], sourceIds: ['lingbotmodel54', 'dav2paper54'] },
        { heading: '04 三阶段门禁把最昂贵变更放到最后', body: `阶段一用现有RGB建立可复现基线，先修相机顺序、曝光、adapter和动作schema；阶段二只在训练侧增加离线伪深度或深度蒸馏，部署输入保持RGB，查看关键几何组是否稳定改善；阶段三才设计运行时RGB-D输入，单独验证标定、同步、带宽、掉帧回退和安全停止。每一阶段都保留前一阶段作可回滚基线。

双团队主线提供互补压力测试：StanfordVL BEHAVIOR/OmniGibson组织任务状态、对象交互与仿真传感器；World Labs Atlas/R2S2R组织空间和视角变体。Meta/FAIR V-JEPA历史成果可作不依赖像素深度的表征基线，AMI当前方向提醒研究动作条件表征预测；它们都不能替本项目给出采购结论。通过今天的模态门禁后，10-25再设计跨本体adapter，避免把深度收益与关节字段变化混在一起。`, sourceIds: ['ogsensor54', 'atlasdocs54', 'vjepar54', 'ami54'] },
      ],
      points: ['运行时深度成本包含标定、同步、带宽、监控和回退。', '关键风险组置信下界、时延与安全失败共同决定晋级。', '先RGB，再离线teacher，最后才是运行时RGB-D。'],
      codeTitle: 'depth_promotion.py · 风险加权传感器晋级门',
      code: [
        'def utility(lcbs,weights,cost,p95_ms,budget_ms,lam=.25,mu=.2):',
        '    if set(lcbs)!=set(weights) or abs(sum(weights.values())-1)>1e-9:',
        '        raise ValueError("invalid risk weights")',
        '    if budget_ms<=0 or cost<0: raise ValueError("invalid budget or cost")',
        '    gain=sum(weights[g]*lcbs[g] for g in lcbs)',
        '    late=max(0.0,(p95_ms-budget_ms)/budget_ms)',
        '    return gain-lam*cost-mu*late',
        '',
        'lcbs={"low_texture":.12,"occlusion":.05}',
        'weights={"low_texture":.6,"occlusion":.4}',
        'good=utility(lcbs,weights,.20,90,100)',
        'late=utility(lcbs,weights,.20,140,100)',
        'assert abs(good-.042)<1e-9 and abs(late+.038)<1e-9',
        'assert good>0 and late<0',
        'try:',
        '    utility(lcbs,{"low_texture":1.0},.2,90,100)',
        '    raise AssertionError("incomplete groups accepted")',
        'except ValueError: pass',
        'print("depth promotion gate: PASS")',
      ].join('\n'),
      codeNotes: ['权重、成本系数和时延预算必须在实验前冻结，避免按结果调参。', '正例在收益下界抵消成本后晋级，负例因p95超时转为拒绝。', '教学效用只做决策透明化，不替代安全评审、硬件测试或真实置信区间。'],
      exercise: { prompt: '三组权重0.5/0.3/0.2，提升下界0.10/0.04/-0.02；C=0.16、λ=0.25，p95=120 ms、T=100 ms、μ=0.2。计算U并判断。', steps: ['计算风险加权收益。', '计算成本项。', '计算超时罚并相减。'], solution: '收益为0.05+0.012-0.004=0.058；成本项0.04，超时罚0.04，所以U=-0.022。即使前两组改善，第三组退化且超时后不应晋级，应先查失败类型和延迟来源。' },
      quiz: { question: '什么证据足以把SO-101从RGB/离线teacher推进到运行时RGB-D？', hint: '回答分组收益、因果控制、时延、失效回退与成本。', keywords: ['LCB', 'paired A/B', 'calibration', 'synchronization', 'p95 latency', 'fallback'], reference: '先证明同数据、adapter和推理预算下，离线teacher仍不能解决的关键几何组在运行时RGB-D中有稳定正下界；同时普通组不退化，p95年龄满足预算，标定/同步/有效率可监控，掉帧有RGB回退，生命周期成本可接受。总体均值或可视化好看都不够。' },
      sources,
    },
  },
};
