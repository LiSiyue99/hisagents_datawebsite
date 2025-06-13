import React from 'react';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link as LinkIcon } from 'lucide-react';
import type { Stats } from '@/lib/api';

interface TeamItem { org: string; names: string; }

const organizingTeam: TeamItem[] = [
  { org: 'AI Lab, Princeton University', names: 'Jiahao Qiu, Jiacheng Guo, Yifu Lu, Shuyao Zhou, Ling Yang, Shilong Liu, Kaixuan Huang, Mengdi Wang' },
  { org: 'Department of History, Fudan University', names: 'Fulian Xiao, Siran Wang, Jurdi Cui, Junran Zhou, Xi Gao' },
  { org: 'University of Michigan', names: 'Yimin Wang, Xinzhe Juan' },
  { org: 'Shanghai Jiao Tong University', names: 'Yuchen Mao, Tongcheng Zhang, Zhanpeng Zhou' },
  { org: 'School of Philosophy, Fudan University', names: 'Yijia Chen, Daixin Chen' },
  { org: 'IIS, Tsinghua University', names: 'Xuan Qi' },
  { org: 'Department of Philosophy, Columbia University', names: 'Zixin Yao' },
  { org: 'Department of History, Princeton University', names: 'Charles Argon' },
  { org: 'The Chinese University of Hong Kong', names: 'Hongru Wang' },
  { org: 'Tianqiao and Chrissy Chen Institute & Theta Health Inc.', names: 'Xun Jiang' }
];

const contributors = "Yuming Cao, Yue Chen, Yunfei Chen, Zhengyi Chen, Ruowei Dai, Mengqiu Deng, Jiye Fu, Yunting Gu, Zijie Guan, Zirui Huang, Xiaoyan Ji, Yumeng Jiang, Delong Kong, Haolong Li, Jiaqi Li, Ruipeng Li, Tianze Li, Zhuoran Li, Haixia Lian, Mengyue Lin, Xudong Liu, Jiayi Lu, Jinghan Lu, Wanyu Luo, Ziyue Luo, Zihao Pu, Zhi Qiao, Ruihuan Ren, Liang Wan, Ruixiang Wang, Tianhui Wang, Yang Wang, Zeyu Wang, Zihua Wang, Yujia Wu, Zhaoyi Wu, Hao Xin, Weiao Xing, Ruojun Xiong, Weijie Xu, Yao Shu, Yao Xiao, Xiaorui Yang, Yuchen Yang, Nan Yi, Jiadong Yu, Yangyuxuan Yu, Huiting Zeng, Danni Zhang, Yunjie Zhang, Zhaoyu Zhang, Zhiheng Zhang, Xiaofeng Zheng, Peirong Zhou, Linyan Zhong, Xiaoyin Zong, Ying Zhao, Zhenxin Chen, Lin Ding, Xiaoyu Gao, Bingbing Gong, Yichao Li, Yang Liao, Guang Ma, Tianyuan Ma, Xinrui Sun, Tianyi Wang, Han Xia, Ruobing Xian, Gen Ye, Tengfei Yu, Wentao Zhang, Yuxi Wang".split(', ');

const evaluationDimensions = [
  'Bibliographic Retrieval',
  'Source Identification',
  'Source Processing',
  'Historical Analysis',
  'Interdisciplinary Integration',
  'Cultural Contextualization'
];

const domains = [ 'Political, social, and cultural history', 'Classics and ancient civilizations', 'Art and visual culture', 'Material culture and archaeology', 'Environmental and climate history', 'History of science and medicine', 'Economic and institutional history', 'Interdisciplinary and comparative studies' ];

const sourceModalities = [
  { name: 'Visual materials (illustrations, photos)', count: 96 },
  { name: 'Manuscripts and handwritten sources', count: 88 },
  { name: 'Text-based questions (narrative excerpts)', count: 64 },
  { name: 'Ancient or undeciphered scripts', count: 22 },
  { name: 'Maps and schematics', count: 18 },
  { name: 'Inscriptions or stone rubbings', count: 14 },
  { name: 'Charts, diagrams, or tables', count: 10 },
  { name: 'Mixed text + image sources', count: 10 },
  { name: 'Audio recordings', count: 9 },
  { name: 'Video content', count: 5 }
];

const languageData = [ { language: 'English', count: 228 }, { language: 'Chinese', count: 52 }, { language: 'Classical Chinese', count: 47 }, { language: 'Russian', count: 22 }, { language: 'Japanese', count: 13 }, { language: 'French', count: 10 }, { language: 'Latin', count: 8 }, { language: 'German', count: 8 }, { language: 'Dutch', count: 5 }, { language: 'Tibetan', count: 2 }, { language: 'Armenian', count: 2 }, { language: 'Arabic', count: 2 }, { language: 'Khitan', count: 2 }, { language: 'Ancient Greek', count: 2 }, { language: 'Khmer', count: 1 }, { language: 'Indonesian', count: 1 }, { language: 'Old Tibetan', count: 1 }, { language: 'Sanskrit', count: 1 }, { language: 'Old Uyghur', count: 1 }, { language: 'Middle Polish', count: 1 }, { language: 'Aramaic', count: 1 }, { language: 'Danish', count: 1 }, { language: 'Bosnian', count: 1 }, { language: 'Italian', count: 1 }, { language: 'Macedonian', count: 1 }, { language: 'Yukaghir', count: 1 } ];

export default function DatasetSection({ stats }: { stats: Stats | null }) {
  const t = useTranslations('DatasetInfo');
  const tAnswerType = useTranslations('AnswerTypes');
  const isClient = typeof window !== 'undefined';
  
  const answerTypeChartData = stats ? Object.entries(stats.answer_type_distribution).map(([key, value]) => ({ name: tAnswerType(key), count: value })) : [];

  return (
    <section id="dataset-info" className="mb-12">
      <div className="text-center mb-8">
        <div className="mt-6 flex items-center justify-center gap-x-6">
          <a className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700" href="https://github.com/CharlesQ9/HistAgent" target="_blank" rel="noreferrer"><LinkIcon className="h-4 w-4" /> {t('codeLink')}</a>
          <a className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700" href="https://huggingface.co/datasets/jiahaoq/HistBench" target="_blank" rel="noreferrer"><LinkIcon className="h-4 w-4" /> {t('datasetLink')}</a>
          <a className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700" href="https://doi.org/10.48550/arXiv.2505.20246" target="_blank" rel="noreferrer"><LinkIcon className="h-4 w-4" /> {t('arxivLink')}</a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>{t('introHeading')}</CardTitle></CardHeader>
          <CardContent className="h-56 overflow-y-auto"><p className="text-sm text-gray-700 whitespace-pre-line">{t('introContent')}</p></CardContent>
        </Card>
        <Card className="lg:col-span-1">
           <CardHeader><CardTitle>{t('organizingTeam')}</CardTitle></CardHeader>
           <CardContent className="h-56 overflow-y-auto space-y-3">
             {organizingTeam.map((item, idx) => (
               <div key={idx}>
                 <p className="font-semibold text-gray-800 text-sm">{item.org}</p>
                 <p className="text-xs text-gray-600 leading-snug">{item.names}</p>
               </div>
             ))}
           </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('contributorsHeading')}</CardTitle></CardHeader>
          <CardContent className="h-56 overflow-y-auto">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {contributors.map((name, i) => <span key={i} className="text-sm text-gray-600">{name}{i < contributors.length -1 && ','}</span>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evaluation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evaluation">{t('tabs_evaluation')}</TabsTrigger>
          <TabsTrigger value="distribution">{t('tabs_distribution')}</TabsTrigger>
          <TabsTrigger value="details">{t('tabs_details')}</TabsTrigger>
        </TabsList>
        <TabsContent value="evaluation" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{t('dimensions')}</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {evaluationDimensions.map((d,i)=>(<li key={i}><strong>{t(d)}:</strong> {t(`${d}_desc`)}</li>))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('difficultyFigure')}</CardTitle></CardHeader>
              <CardContent>
                 <img src="/figure2.png" alt={t('difficultyFigure')} width="600" height="300" className="w-full h-auto object-contain rounded-md" />
                 <div className="space-y-2 mt-4 text-sm">
                    <p><strong>{t('level1_title')}:</strong> {t('level1_desc')}</p>
                    <p><strong>{t('level2_title')}:</strong> {t('level2_desc')}</p>
                    <p><strong>{t('level3_title')}:</strong> {t('level3_desc')}</p>
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="distribution" className="mt-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{t('modalitiesHeading')}</CardTitle></CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('materialType')}</TableHead>
                        <TableHead className="text-right">{t('questionCount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceModalities.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="text-sm">{item.name}</TableCell>
                          <TableCell className="text-right font-medium">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('languagesHeading')}</CardTitle></CardHeader>
              <CardContent className="h-[380px] overflow-y-auto">
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('language')}</TableHead>
                        <TableHead className="text-right">{t('count')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {languageData.map((item) => (
                        <TableRow key={item.language}>
                          <TableCell className="text-sm">{item.language}</TableCell>
                          <TableCell className="text-right font-medium">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
           </div>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle>{t('multipleChoiceTitle')}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm">{t('multipleChoiceDesc')}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>{t('exactMatchTitle')}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm">{t('exactMatchDesc')}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t('answerTypeDistribution')}</CardTitle></CardHeader>
                   <CardContent>
                    {isClient && (
                      <ResponsiveContainer width="100%" height={100}>
                        <BarChart data={answerTypeChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}}/>
                          <Bar dataKey="count" barSize={20}>
                            {answerTypeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#f9a8d4', '#93c5fd'][index % 2]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle>{t('domainsHeading')}</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                            {domains.map((d,i)=>(<li key={i}><strong>{t(d)}:</strong> {t(`${d}_desc`)}</li>))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
