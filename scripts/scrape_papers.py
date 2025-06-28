import os
import json
import re
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ConferencePaperScraper:
    """爬取计算机视觉会议论文信息的类"""
    
    BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "data")
    INDEX_FILE = os.path.join(BASE_DIR, "paper_index.json")
    
    def __init__(self):
        """初始化爬虫类，创建数据目录并加载已有索引"""
        os.makedirs(self.BASE_DIR, exist_ok=True)
        self.papers = self._load_index()
        
        # 定义支持的会议及其URL模板
        self.conference_configs = {
            "cvpr": {
                "url_template": "https://openaccess.thecvf.com/{year}",
                "years": list(range(2013, datetime.now().year + 1)),
                "parser": self._parse_cvf_conference
            },
            "iccv": {
                "url_template": "https://openaccess.thecvf.com/{year}",
                "years": list(range(2013, datetime.now().year + 1, 2)),
                "parser": self._parse_cvf_conference
            },
            "eccv": {
                "url_template": "https://www.ecva.net/papers.php",
                "years": list(range(2012, datetime.now().year + 1, 2)),
                "parser": self._parse_eccv
            }
        }
    
    def _load_index(self) -> List[Dict[str, Any]]:
        """加载已有的论文索引"""
        if os.path.exists(self.INDEX_FILE):
            try:
                with open(self.INDEX_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"加载索引失败: {e}")
        return []
    
    def _save_index(self) -> None:
        """保存论文索引到文件"""
        with open(self.INDEX_FILE, "w", encoding="utf-8") as f:
            json.dump(self.papers, f, ensure_ascii=False, indent=2)
        logger.info(f"已保存索引，共 {len(self.papers)} 篇论文")
    
    def _parse_cvf_conference(self, year: int, content: str) -> List[Dict[str, Any]]:
        """解析CVPR/ICCV等CVF会议的论文信息"""
        soup = BeautifulSoup(content, 'html.parser')
        papers = []
        
        # 查找所有论文条目
        for item in soup.select('dt.ptitle'):
            try:
                title_elem = item.find('a')
                title = title_elem.text.strip()
                paper_url = f"https://openaccess.thecvf.com/{title_elem['href']}"
                
                # 获取论文详情页
                time.sleep(0.5)  # 避免请求过快
                paper_page = requests.get(paper_url)
                paper_soup = BeautifulSoup(paper_page.content, 'html.parser')
                
                # 提取作者
                authors = [a.text.strip() for a in paper_soup.select('div.authors a')]
                
                # 提取摘要
                abstract_elem = paper_soup.select_one('div.abstract')
                abstract = abstract_elem.text.replace('Abstract', '').strip() if abstract_elem else ''
                
                # 提取关键词（如果有）
                keywords = []
                keywords_elem = paper_soup.find(string=re.compile(r'Keywords:'))
                if keywords_elem:
                    keywords_text = keywords_elem.parent.text
                    keywords = [k.strip() for k in keywords_text.split(':')[-1].split(',') if k.strip()]
                
                papers.append({
                    'title': title,
                    'authors': authors,
                    'year': year,
                    'conference': 'CVPR' if 'CVPR' in paper_url else 'ICCV',
                    'abstract': abstract,
                    'keywords': keywords,
                    'url': paper_url
                })
            except Exception as e:
                logger.error(f"解析论文失败: {e}")
                continue
        
        return papers
    
    def _parse_eccv(self, year: int, content: str) -> List[Dict[str, Any]]:
        """解析ECCV会议的论文信息"""
        soup = BeautifulSoup(content, 'html.parser')
        papers = []
        
        # ECCV的页面结构不同，需要单独处理
        # 注意：这只是一个示例框架，实际解析逻辑需要根据当年ECCV网站结构调整
        # 这里的解析逻辑需要根据实际的ECVA网站结构进行调整
        # 示例：查找所有论文条目，并提取信息
        for paper_item in soup.select('div.paper-item'): # 假设论文条目有这样的class
            try:
                title_elem = paper_item.select_one('div.title a')
                title = title_elem.text.strip() if title_elem else 'N/A'
                paper_url = title_elem['href'] if title_elem and 'href' in title_elem.attrs else ''

                authors_elem = paper_item.select_one('div.authors')
                authors = [a.strip() for a in authors_elem.text.split(',') if a.strip()] if authors_elem else []

                abstract_elem = paper_item.select_one('div.abstract')
                abstract = abstract_elem.text.strip() if abstract_elem else ''

                papers.append({
                    'title': title,
                    'authors': authors,
                    'year': year,
                    'conference': 'ECCV',
                    'abstract': abstract,
                    'keywords': [], # ECCV页面可能没有直接的关键词
                    'url': paper_url
                })
            except Exception as e:
                logger.error(f"解析ECCV论文失败: {e}")
                continue
        
        return papers
    
    def update_index(self, conferences: Optional[List[str]] = None,
                      years: Optional[List[int]] = None) -> None:
        """更新论文索引
        
        Args:
            conferences: 要更新的会议列表，如 ['cvpr', 'iccv']
            years: 要更新的年份列表，如 [2020, 2021]
        """
        if not conferences:
            conferences = list(self.conference_configs.keys())
        
        # 记录已有的论文ID（标题+年份作为唯一标识）
        existing_paper_ids = {(p['title'], p['year']) for p in self.papers}
        
        for conf_name in conferences:
            if conf_name not in self.conference_configs:
                logger.warning(f"不支持的会议: {conf_name}")
                continue
                
            conf_config = self.conference_configs[conf_name]
            conf_years = years or conf_config['years']
            
            logger.info(f"开始更新 {conf_name.upper()} 会议论文索引，年份: {conf_years}")
            
            for year in conf_years:
                # 检查年份是否在配置的年份范围内
                if year not in conf_config['years']:
                    logger.warning(f"{conf_name.upper()} 会议在 {year} 年没有数据或不支持爬取")
                    continue

                try:
                    url = conf_config['url_template'].format(year=year)
                    logger.info(f"爬取 {conf_name.upper()} {year} 年的页面: {url}")
                    response = requests.get(url)
                    response.raise_for_status() # 检查HTTP请求是否成功
                    
                    new_papers = conf_config['parser'](year, response.content)
                    for paper in new_papers:
                        paper_id = (paper['title'], paper['year'])
                        if paper_id not in existing_paper_ids:
                            self.papers.append(paper)
                            existing_paper_ids.add(paper_id)
                            logger.info(f"新增论文: {paper['title']} ({paper['conference']} {paper['year']})")
                        else:
                            logger.debug(f"论文已存在，跳过: {paper['title']}")
                    
                except requests.exceptions.RequestException as e:
                    logger.error(f"请求 {conf_name.upper()} {year} 年页面失败: {e}")
                except Exception as e:
                    logger.error(f"处理 {conf_name.upper()} {year} 年数据时发生错误: {e}")
        
        self._save_index()

if __name__ == "__main__":
    scraper = ConferencePaperScraper()
    # 示例：更新所有支持的会议的索引
    scraper.update_index()
    # 示例：只更新CVPR和ICCV的2023年数据
    # scraper.update_index(conferences=['cvpr', 'iccv'], years=[2023])
    # 示例：只更新ECCV的所有数据
    # scraper.update_index(conferences=['eccv'])