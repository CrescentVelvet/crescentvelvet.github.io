import os
import json
import re
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
import arxiv # 导入arxiv库

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
        current_year = datetime.now().year
        self.conference_configs = {
            "cvpr": {
                "url_template": "https://openaccess.thecvf.com/{year}",
                "years": list(range(current_year - 4, current_year + 1)), # 最近五年
                "parser": self._parse_cvf_conference
            },
            "iccv": {
                "url_template": "https://openaccess.thecvf.com/{year}",
                "years": list(range(current_year - 4, current_year + 1, 2)), # 最近五年，双年会议
                "parser": self._parse_cvf_conference
            },
            "eccv": {
                "url_template": "https://www.ecva.net/papers.php", # ECCV的URL可能需要更复杂的处理，这里暂时保持不变
                "years": list(range(current_year - 4, current_year + 1, 2)), # 最近五年，双年会议
                "parser": self._parse_eccv
            },
            "neurips": {
                "url_template": "https://papers.nips.cc/paper_files/paper/{year}",
                "years": list(range(current_year - 4, current_year + 1)),
                "parser": self._parse_neurips
            },
            "iclr": {
                "url_template": "https://openreview.net/group?id=ICLR.cc/{year}/Conference",
                "years": list(range(current_year - 4, current_year + 1)),
                "parser": self._parse_iclr
            }
        }

        # 定义arXiv配置
        self.arxiv_config = {
            "categories": [
                {"name": "Computer Vision", "query": "cat:cs.CV", "max_results": 10},
                {"name": "Large Language Models", "query": "cat:cs.CL OR cat:cs.AI AND (large language model OR LLM)", "max_results": 10}
            ],
            "delay_seconds": 3,
            "num_retries": 5
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
            except AttributeError as e:
                logger.error(f"解析论文时缺少必要字段: {e}. 论文条目HTML: {item}")
                continue
            except Exception as e:
                logger.error(f"解析论文失败: {e}. 论文条目HTML: {item}")
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
            except AttributeError as e:
                logger.error(f"解析ECCV论文时缺少必要字段: {e}. 论文条目HTML: {paper_item}")
                continue
            except Exception as e:
                logger.error(f"解析ECCV论文失败: {e}. 论文条目HTML: {paper_item}")
                continue
        
        return papers

    def _parse_neurips(self, year: int, content: str) -> List[Dict[str, Any]]:
        """解析NeurIPS会议的论文信息"""
        soup = BeautifulSoup(content, 'html.parser')
        papers = []
        
        # NeurIPS网站结构可能每年不同，这里尝试一种常见结构
        # 查找所有论文条目，通常在 'div.paper' 或 'li' 元素中
        for paper_item in soup.select('div.maincard'): # 假设论文条目有这样的class
            try:
                title_elem = paper_item.select_one('p.title a')
                title = title_elem.text.strip() if title_elem else 'N/A'
                paper_url = f"https://papers.nips.cc{title_elem['href']}" if title_elem and 'href' in title_elem.attrs else ''

                # 访问论文详情页获取作者和摘要
                if paper_url:
                    time.sleep(0.5) # 避免请求过快
                    paper_detail_page = requests.get(paper_url)
                    paper_detail_soup = BeautifulSoup(paper_detail_page.content, 'html.parser')

                    authors_elem = paper_detail_soup.select_one('p.authors')
                    authors = [a.strip() for a in authors_elem.text.replace('Authors:', '').split(',') if a.strip()] if authors_elem else []

                    abstract_elem = paper_detail_soup.select_one('p.abstract')
                    abstract = abstract_elem.text.replace('Abstract:', '').strip() if abstract_elem else ''

                    papers.append({
                        'title': title,
                        'authors': authors,
                        'year': year,
                        'conference': 'NeurIPS',
                        'abstract': abstract,
                        'keywords': [], # NeurIPS页面可能没有直接的关键词
                        'url': paper_url
                    })
            except AttributeError as e:
                logger.error(f"解析NeurIPS论文时缺少必要字段: {e}. 论文条目HTML: {paper_item}")
                continue
            except Exception as e:
                logger.error(f"解析NeurIPS论文失败: {e}. 论文条目HTML: {paper_item}")
                continue
        
        return papers

    def _parse_iclr(self, year: int, content: str) -> List[Dict[str, Any]]:
        """解析ICLR会议的论文信息"""
        soup = BeautifulSoup(content, 'html.parser')
        papers = []
        
        # ICLR论文通常发布在OpenReview上，其结构可能与NeurIPS类似
        # 查找所有论文条目
        for paper_item in soup.select('div.note'): # 假设论文条目在 'div.note' 中
            try:
                title_elem = paper_item.select_one('h4.note_content_title a')
                title = title_elem.text.strip() if title_elem else 'N/A'
                paper_url = f"https://openreview.net{title_elem['href']}" if title_elem and 'href' in title_elem.attrs else ''

                # 访问论文详情页获取作者和摘要
                if paper_url:
                    time.sleep(0.5) # 避免请求过快
                    paper_detail_page = requests.get(paper_url)
                    paper_detail_soup = BeautifulSoup(paper_detail_page.content, 'html.parser')

                    authors_elem = paper_detail_soup.select_one('div.note_content_authors')
                    authors = [a.strip() for a in authors_elem.text.replace('Authors:', '').split(',') if a.strip()] if authors_elem else []

                    abstract_elem = paper_detail_soup.select_one('div.abstract_content')
                    abstract = abstract_elem.text.strip() if abstract_elem else ''

                    papers.append({
                        'title': title,
                        'authors': authors,
                        'year': year,
                        'conference': 'ICLR',
                        'abstract': abstract,
                        'keywords': [], # ICLR页面可能没有直接的关键词
                        'url': paper_url
                    })
            except AttributeError as e:
                logger.error(f"解析ICLR论文时缺少必要字段: {e}. 论文条目HTML: {paper_item}")
                continue
            except Exception as e:
                logger.error(f"解析ICLR论文失败: {e}. 论文条目HTML: {paper_item}")
                continue
        
        return papers

    def _get_arxiv_client(self) -> arxiv.Client:
        """创建带重试机制的arXiv客户端"""
        return arxiv.Client(
            page_size=100,
            delay_seconds=self.arxiv_config["delay_seconds"],
            num_retries=self.arxiv_config["num_retries"]
        )

    def _fetch_arxiv_papers(self) -> List[Dict[str, Any]]:
        """抓取arXiv的最新论文"""
        arxiv_papers = []
        client = self._get_arxiv_client()
        for category_config in self.arxiv_config["categories"]:
            logger.info(f"开始抓取arXiv分类: {category_config['name']}")
            search = arxiv.Search(
                query=category_config["query"],
                max_results=category_config["max_results"],
                sort_by=arxiv.SortCriterion.SubmittedDate
            )
            try:
                for result in client.results(search):
                    arxiv_papers.append({
                        'title': result.title,
                        'authors': [author.name for author in result.authors],
                        'year': result.published.year,
                        'conference': 'arXiv',
                        'abstract': result.summary,
                        'keywords': result.categories,
                        'url': result.entry_id,
                        'arxiv_id': result.arxiv_id
                    })
                logger.info(f"[{category_config['name']}] 获取到 {len(arxiv_papers)} 篇论文")
            except Exception as e:
                logger.error(f"抓取arXiv论文失败: {e}")
        return arxiv_papers
    
    def update_index(self, conferences: Optional[List[str]] = None,
                      years: Optional[List[int]] = None, include_arxiv: bool = False) -> None:
        """更新论文索引
        
        Args:
            conferences: 要更新的会议列表，如 ['cvpr', 'iccv']
            years: 要更新的年份列表，如 [2020, 2021]
            include_arxiv: 是否包含arXiv论文
        """
        if not conferences:
            conferences = list(self.conference_configs.keys())

        new_papers_count = 0
        scrape_results = {"conference": {}, "arxiv": {"success": 0, "failed": 0}}

        seen_identifiers = set()

        # 将现有论文添加到seen_identifiers中，以便去重
        for paper in self.papers:
            if 'arxiv_id' in paper and paper['arxiv_id']:
                seen_identifiers.add(paper['arxiv_id'])
            else:
                identifier = (paper['title'], paper['year'], paper['url'])
                seen_identifiers.add(identifier)

        # 抓取会议论文
        for conf_name in conferences:
            scrape_results["conference"][conf_name] = {"success": 0, "failed": 0}
            if conf_name in self.conference_configs:
                config = self.conference_configs[conf_name]
                years_to_scrape = years if years else config['years']
                for year in years_to_scrape:
                    logger.info(f"开始抓取 {conf_name.upper()} {year} 年的论文...")
                    try:
                        # 对于CVF会议，URL模板需要年份
                        if conf_name in ['cvpr', 'iccv']:
                            url = config['url_template'].format(year=year)
                        # 对于ECCV，URL是固定的，年份在解析器内部处理
                        elif conf_name == 'eccv':
                            url = config['url_template']
                        elif conf_name == 'neurips':
                            url = config['url_template'].format(year=year)
                        elif conf_name == 'iclr':
                            url = config['url_template'].format(year=year)
                        else:
                            logger.warning(f"未知会议配置: {conf_name}")
                            scrape_results["conference"][conf_name]["failed"] += 1
                            continue

                        response = requests.get(url)
                        response.raise_for_status() # 检查HTTP请求是否成功
                        scraped_papers = config['parser'](year, response.content)
                        current_conf_new_papers = 0
                        for paper in scraped_papers:
                            identifier = (paper['title'], paper['year'], paper['url'])
                            if identifier not in seen_identifiers:
                                self.papers.append(paper)
                                seen_identifiers.add(identifier)
                                new_papers_count += 1
                                current_conf_new_papers += 1
                            else:
                                logger.debug(f"跳过重复论文 (会议): {paper['title']}")
                        scrape_results["conference"][conf_name]["success"] += current_conf_new_papers
                        logger.info(f"成功抓取 {conf_name.upper()} {year} 年论文 {current_conf_new_papers} 篇。")
                    except requests.exceptions.RequestException as e:
                        logger.error(f"抓取 {conf_name.upper()} {year} 年论文失败: {e}")
                        scrape_results["conference"][conf_name]["failed"] += 1
                    except Exception as e:
                        logger.error(f"处理 {conf_name.upper()} {year} 年数据时发生错误: {e}")
                        scrape_results["conference"][conf_name]["failed"] += 1
                    time.sleep(1) # 每次请求后暂停1秒

        # 抓取arXiv论文
        if include_arxiv:
            logger.info("开始抓取arXiv论文...")
            try:
                arxiv_scraped_papers = self._fetch_arxiv_papers()
                current_arxiv_new_papers = 0
                for paper in arxiv_scraped_papers:
                    if 'arxiv_id' in paper and paper['arxiv_id'] not in seen_identifiers:
                        self.papers.append(paper)
                        seen_identifiers.add(paper['arxiv_id'])
                        new_papers_count += 1
                        current_arxiv_new_papers += 1
                    else:
                        logger.debug(f"跳过重复论文 (arXiv): {paper['title']}")
                scrape_results["arxiv"]["success"] += current_arxiv_new_papers
                logger.info(f"成功抓取arXiv论文 {current_arxiv_new_papers} 篇。")
            except Exception as e:
                logger.error(f"抓取arXiv论文失败: {e}")
                scrape_results["arxiv"]["failed"] += 1

        self._save_index()
        logger.info(f"本次运行共新增 {new_papers_count} 篇论文。")
        logger.info("\n--- 抓取结果总结 ---")
        for conf_name, stats in scrape_results["conference"].items():
            logger.info(f"会议 {conf_name.upper()}: 成功抓取 {stats['success']} 篇，失败 {stats['failed']} 次")
        if include_arxiv:
            logger.info(f"arXiv: 成功抓取 {scrape_results['arxiv']['success']} 篇，失败 {scrape_results['arxiv']['failed']} 次")
        logger.info("--------------------")

if __name__ == "__main__":
    scraper = ConferencePaperScraper()
    # 示例：更新所有支持的会议的索引，并包含arXiv论文
    scraper.update_index(include_arxiv=True)
    # 示例：只更新CVPR和ICCV的2023年数据
    # scraper.update_index(conferences=['cvpr', 'iccv'], years=[2023])
    # 示例：只更新ECCV的所有数据
    # scraper.update_index(conferences=['eccv'])